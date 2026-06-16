'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getDemoJourneys } from '@/lib/journey/demo-journeys';
import { type JourneyItem } from '@/lib/journey/career-journey-types';
import { WindingRoadRenderer } from '@/components/journey/renderers';
import { TimelineDetailDialog } from '@/components/journey/timeline/timeline-detail-dialog';
import { deriveRoleEvolutionTail, type RoleEvolutionTail } from '@/lib/journey/role-evolution-tail';

// Forced sample codas so the dev harness always shows both shapes.
const FORKED_TAIL: RoleEvolutionTail = deriveRoleEvolutionTail('psychologist', 23)!;
const LINEAR_TAIL: RoleEvolutionTail = deriveRoleEvolutionTail('solicitor', 24)!;

export default function JourneyRenderersPage() {
  const journeys = useMemo(() => getDemoJourneys(), []);
  const [selectedJourneyId, setSelectedJourneyId] = useState(journeys[0].id);
  const [selectedItem, setSelectedItem] = useState<JourneyItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const journey = journeys.find((j) => j.id === selectedJourneyId) ?? journeys[0];
  // Short journey for the coda demos so the evolution tail sits near the left.
  const shortJourney = { ...journey, items: journey.items.slice(0, 2) };

  const handleItemClick = (item: JourneyItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Journey Rail Preview</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Preview the rail career journey timeline across all 10 demo careers.
        </p>

        <Select value={selectedJourneyId} onValueChange={setSelectedJourneyId}>
          <SelectTrigger className="w-full sm:w-72">
            <SelectValue placeholder="Choose a career journey" />
          </SelectTrigger>
          <SelectContent>
            {journeys.map((j) => (
              <SelectItem key={j.id} value={j.id}>
                {j.career} ({j.items.length} items)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{journey.career}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {journey.items.length} steps &middot; Ages {journey.startAge}&ndash;
            {journey.items[journey.items.length - 1]?.startAge ?? journey.startAge}
          </p>
        </CardHeader>
        <CardContent className="overflow-auto" style={{ maxHeight: 600 }}>
          <WindingRoadRenderer journey={journey} onItemClick={handleItemClick} />
        </CardContent>
      </Card>

      <Card className="mt-6 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">+ Role-evolution coda — FORKED (psychologist)</CardTitle>
          <p className="text-xs text-muted-foreground">core → decision → specialisms</p>
        </CardHeader>
        <CardContent className="overflow-auto" style={{ maxHeight: 600 }}>
          <WindingRoadRenderer journey={shortJourney} onItemClick={handleItemClick} evolutionTail={FORKED_TAIL} />
        </CardContent>
      </Card>

      <Card className="mt-6 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">+ Role-evolution coda — LINEAR (solicitor)</CardTitle>
          <p className="text-xs text-muted-foreground">core → single senior node</p>
        </CardHeader>
        <CardContent className="overflow-auto" style={{ maxHeight: 600 }}>
          <WindingRoadRenderer journey={shortJourney} onItemClick={handleItemClick} evolutionTail={LINEAR_TAIL} />
        </CardContent>
      </Card>

      <TimelineDetailDialog
        item={selectedItem}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
