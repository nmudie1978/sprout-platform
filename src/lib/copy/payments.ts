/**
 * Payment disclosure copy constants
 * Centralized copy for payment-related disclosures across the app
 *
 * IMPORTANT: Sprout does NOT process, hold, or transfer payments.
 * These disclosures clarify that payments are arranged externally.
 */

export const PAYMENT_COPY = {
  // Terms page - full disclosure
  terms: {
    title: "Payments",
    body: "Sprout does not process, hold, or transfer payments between users. Any payment for a job or service is agreed and handled directly between the job poster and the youth using external payment methods (for example, bank transfer or Vipps). Sprout is not a party to any payment arrangement or agreement between users.",
    clarification: "Sprout is a connection platform and does not provide payment services.",
  },

  // In-app compact disclosure
  compact: {
    text: "Payments are arranged directly between you and the other party. Sprout does not handle payments.",
  },

  // Messaging-specific (shown once per conversation)
  messaging: {
    text: "Payments are arranged directly between you and the other party. Sprout does not handle payments.",
  },
} as const;
