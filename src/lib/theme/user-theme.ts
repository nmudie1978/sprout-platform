/**
 * Per-user theme preference (dark-first).
 *
 * next-themes stores a single theme value per *browser* (localStorage key
 * "theme"). That value is shared across every account used on the device and
 * is never reset on signup/login — so a brand-new user who logs into a browser
 * where light was ever selected inherits light, violating the product rule
 * that EVERY user is dark by default and light is an explicit opt-in only.
 *
 * We fix that by recording each user's explicit choice under a per-user key.
 * On login, ThemeBoot applies the current user's saved choice, or falls back
 * to dark — overriding any leaked browser-global value. Pure helpers here so
 * they can be unit-tested without a DOM.
 */

export type UserTheme = "light" | "dark";

const PREFIX = "endeavrly-theme";

export function userThemeKey(userId: string): string {
  return `${PREFIX}:${userId}`;
}

/** The current user's saved theme, or null if they've never chosen one. */
export function readUserTheme(
  userId: string,
  storage: Pick<Storage, "getItem">,
): UserTheme | null {
  if (!userId) return null;
  try {
    const v = storage.getItem(userThemeKey(userId));
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

/** Record the user's explicit theme choice so it survives logout / other users. */
export function writeUserTheme(
  userId: string,
  theme: UserTheme,
  storage: Pick<Storage, "setItem">,
): void {
  if (!userId) return;
  try {
    storage.setItem(userThemeKey(userId), theme);
  } catch {
    /* private tab — best effort */
  }
}

/** Resolve the theme to apply for a user on login: their saved choice, else dark. */
export function resolveBootTheme(
  userId: string,
  storage: Pick<Storage, "getItem">,
): UserTheme {
  return readUserTheme(userId, storage) ?? "dark";
}
