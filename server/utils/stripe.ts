import Stripe from "stripe";

let _stripe: Stripe | null = null;

export const getStripe = () => {
  if (!_stripe) {
    const config = useRuntimeConfig();
    _stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: "2024-12-18.acacia",
    });
  }
  return _stripe;
};
