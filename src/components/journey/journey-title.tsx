/**
 * JourneyTitle — personalised "cover page" heading for the Roadmap tab.
 *
 * Composes: {FirstName}'s Career Roadmap — {goal suffix}
 * Always calm, optional, revisable. Never implies permanence.
 */

interface JourneyTitleProps {
  firstName: string;
  primaryGoalLabel?: string;
  primaryGoalStatus?: string;
}

export function JourneyTitle({
  firstName,
  primaryGoalLabel,
  primaryGoalStatus,
}: JourneyTitleProps) {
  const base = `${firstName}\u2019s Career Roadmap`;

  let suffix = '';
  if (primaryGoalLabel) {
    suffix =
      primaryGoalStatus === 'exploring'
        ? ` \u2014 Exploring ${primaryGoalLabel}`
        : ` \u2014 ${primaryGoalLabel}`;
  }

  return (
    <div className="mb-6">
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
        {base}
        {suffix}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        This is your personal journey. You can change direction anytime.
      </p>
    </div>
  );
}
