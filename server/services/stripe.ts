// Ideally we would have an interface called PaymentService that would be an
// abstraction for all payment services. This would allow for easier swapping of
// payment services in the future or even supporting multiple payment services
// at once. Our architecture, however, is highly coupled to Stripe, so there's
// no point in abstracting anything.

import Stripe from "stripe";
import type { Workspace } from "~~/server/db/schema";

class StripeService {
  stripe: Stripe;

  constructor() {
    const config = useRuntimeConfig();

    this.stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: "2024-12-18.acacia",
    });
  }

  async createCustomerForWorkspace(workspace: Workspace): Promise<string> {
    const customer = await this.stripe.customers.create({
      name: workspace.name,
      metadata: {
        workspaceId: workspace.id,
      },
    });

    return customer.id;
  }
}

export const stripeService = new StripeService();
