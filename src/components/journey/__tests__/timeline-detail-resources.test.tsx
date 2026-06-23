import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TimelineDetailDialog } from '@/components/journey/timeline';
import { buildDirectionJourney } from '@/lib/journey/transition-directions';

const items = buildDirectionJourney('structured', {
  targetCareer: 'Project Manager',
  startAge: 34,
  targetCategory: 'FINANCE_BANKING',
  previousOccupation: 'Interior designer',
});
const applyStep = items.find((i) => (i.suggestedResources?.length ?? 0) > 0)!;

function renderDialog() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <TimelineDetailDialog item={applyStep} allItems={items} open onOpenChange={() => {}} careerTitle="Project Manager" />
    </QueryClientProvider>,
  );
}

describe('TimelineDetailDialog — suggestedResources', () => {
  it('renders a "Where to look" section with the programme links', () => {
    renderDialog();
    expect(screen.getByText(/where to look/i)).toBeInTheDocument();

    const apprenticeships = screen.getByText(/utdanning\.no/i).closest('a');
    expect(apprenticeships).toHaveAttribute('href', 'https://utdanning.no');

    const jobs = screen.getByText(/finn\.no\/job/i).closest('a');
    expect(jobs).toHaveAttribute('href', 'https://www.finn.no/job');

    // sector-matched named programme is present too
    expect(screen.getByText(/DNB — graduate programme/i)).toBeInTheDocument();
  });
});
