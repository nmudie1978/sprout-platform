/**
 * JourneyTitle — personalised heading for the Roadmap tab.
 *
 * Simply: {FirstName}'s Career Roadmap
 */

interface JourneyTitleProps {
  firstName: string;
}

export function JourneyTitle({ firstName }: JourneyTitleProps) {
  return (
    <div className="mb-6">
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
        {firstName}&rsquo;s Career Roadmap
      </h1>
    </div>
  );
}
