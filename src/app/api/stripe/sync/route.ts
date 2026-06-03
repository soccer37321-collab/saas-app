import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { logAudit } from "@/lib/audit";
import { apiError } from "@/lib/errors";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return apiError("Unauthorized", 401);
    }

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const admin = createAdminClient();

    let customerId = sub?.stripe_customer_id as string | undefined;
    if (!customerId) {
      // Validate UUID format before interpolating into Stripe query string
      const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!UUID_RE.test(user.id)) {
        return apiError("Invalid user ID", 400);
      }
      const customers = await stripe.customers.search({
        query: `metadata['supabase_user_id']:'${user.id}'`,
        limit: 1,
      });
      if (customers.data.length === 0) {
        return NextResponse.json({ synced: false, plan_name: "free" });
      }
      customerId = customers.data[0].id;
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      await admin
        .from("subscriptions")
        .update({ plan_name: "free", status: "canceled", stripe_subscription_id: null })
        .eq("user_id", user.id);

      void logAudit(user.id, "subscription_synced", "stripe/sync", { plan_name: "free" });
      return NextResponse.json({ synced: true, plan_name: "free" });
    }

    const stripeSub = subscriptions.data[0];
    const item = stripeSub.items.data[0];
    const periodEnd = item?.current_period_end
      ? new Date(item.current_period_end * 1000).toISOString()
      : null;

    await admin.from("subscriptions").upsert(
      {
        user_id: user.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: stripeSub.id,
        stripe_price_id: item?.price.id ?? null,
        plan_name: "pro",
        status: stripeSub.status,
        current_period_end: periodEnd,
      },
      { onConflict: "user_id" }
    );

    void logAudit(user.id, "subscription_synced", "stripe/sync", { plan_name: "pro" });
    return NextResponse.json({ synced: true, plan_name: "pro" });
  } catch (err) {
    return apiError("サブスクリプションの同期に失敗しました", 500, err);
  }
}
