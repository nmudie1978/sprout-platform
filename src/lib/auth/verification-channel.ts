/**
 * Name of the BroadcastChannel the verification pages use to talk to each
 * other within a single browser.
 *
 * Lives in its own module so both a client component that listens and one that
 * posts can import it without either importing the other.
 */
export const VERIFICATION_CHANNEL = "endeavrly:email-verified";
