/**
 * Payment disclosure copy constants.
 *
 * IMPORTANT: Endeavrly does NOT process, hold, or transfer payments, and there
 * is nothing to pay for. It is a career-exploration platform — no in-app
 * purchases, subscriptions, or paid work.
 */

export const PAYMENT_COPY = {
  // Terms page - full disclosure
  terms: {
    title: "Payments",
    body: "Endeavrly does not process, hold, or transfer payments, and there is nothing to pay for. It is a career-exploration platform — there are no in-app purchases, subscriptions, or paid work.",
    clarification: "Endeavrly does not provide payment services and is not a marketplace.",
  },

  // In-app compact disclosure
  compact: {
    text: "Endeavrly is free to use and does not handle any payments.",
  },

  // Generic disclosure
  messaging: {
    text: "Endeavrly is free to use and does not handle any payments.",
  },
} as const;
