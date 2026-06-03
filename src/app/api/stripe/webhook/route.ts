import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { logAudit } from "@/lib/audit";
import type Stripe from "stripe";

function periodEnd(item: Stripe.SubscriptionItem | undefined): string | null {
  if (!item?.current_period_end) return null;
  return new Date(item.current_period_end * 1000).toISOString();
}

async function markEventProcessed(
  supabase: ReturnType<typeof createAdminClient>,
  eventId: string,
  eventType: string
): Promise<boolean> {
  const { error } = await supabase
    .from("processed_stripe_events")
    .insert({ event_id: eventId, event_type: eventType });
  // error.code === "23505" means duplicate key — already processed
  if (error) {
    if ((error as { code?: string }).code === "23505") return false;
    throw error;
  }
  return true;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new NextResponse("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[webhook] signature verification failed:", err instanceof Error ? err.message : String(err));
    return new NextResponse("Webhook signature verification failed", { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    const isNew = await markEventProcessed(supabase, event.id, event.type);
    if (!isNew) {
      // Duplicate delivery — acknowledge without reprocessing
      return NextResponse.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const userId = session.metadata?.supabase_user_id;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (!userId) break;

        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
        const item = stripeSub.items.data[0];

        await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            stripe_price_id: item?.price.id ?? null,
            plan_name: "pro",
            status: stripeSub.status,
            current_period_end: periodEnd(item),
          },
          { onConflict: "user_id" }
        );

        void logAudit(userId, "subscription_created", "webhook", {
          stripe_event: event.type,
          subscription_id: subscriptionId,
        });
        break;
      }

      case "customer.subscription.updated": {
        const stripeSub = event.data.object as Stripe.Subscription;
        const customerId = stripeSub.customer as string;
        const item = stripeSub.items.data[0];
        const isActive = stripeSub.status === "active" || stripeSub.status === "trialing";

        await supabase
          .from("subscriptions")
          .update({
            stripe_subscription_id: stripeSub.id,
            stripe_price_id: item?.price.id ?? null,
            plan_name: isActive ? "pro" : "free",
            status: stripeSub.status,
            current_period_end: periodEnd(item),
          })
          .eq("stripe_customer_id", customerId);

        void logAudit(null, "subscription_updated", "webhook", {
          stripe_event: event.type,
          status: stripeSub.status,
          customer_id: customerId,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const stripeSub = event.data.object as Stripe.Subscription;
        const customerId = stripeSub.customer as string;

        await supabase
          .from("subscriptions")
          .update({
            plan_name: "free",
            status: "canceled",
            stripe_subscription_id: null,
            stripe_price_id: null,
            current_period_end: null,
          })
          .eq("stripe_customer_id", customerId);

        void logAudit(null, "subscription_deleted", "webhook", {
          stripe_event: event.type,
          customer_id: customerId,
        });
        break;
      }
    }
  } catch (err) {
    console.error(`[webhook] handler error for ${event.type}:`, err instanceof Error ? err.message : String(err));
    return new NextResponse("Internal server error", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
