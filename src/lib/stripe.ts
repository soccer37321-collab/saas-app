import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

export const PLANS = {
  free: {
    name: "フリー",
    price: 0,
    features: ["月3回まで台本生成", "基本機能"],
  },
  pro: {
    name: "プロ",
    price: 980,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: ["無制限の台本生成", "全言語対応", "優先サポート"],
  },
} as const;
