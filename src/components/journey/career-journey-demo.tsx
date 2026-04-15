'use client';

import { useState, useMemo } from 'react';
import {
  Sparkles,
  GraduationCap,
  Briefcase,
  Target,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { MermaidRenderer } from '@/components/mermaid/MermaidRenderer';
import { careerJourneyToMermaid } from '@/lib/journey/demoCareerJourney';
import {
  STAGE_CONFIG,
  STAGE_ORDER,
  journeyToLegacyFormat,
  type JourneyItem,
} from '@/lib/journey/career-journey-types';
import { getDemoJourneys } from '@/lib/journey/demo-journeys';
import { TimelineDetailDialog } from './timeline';
import { RailRenderer } from './renderers';

// ============================================
// STAGE ICON MAP (for legend)
// ============================================

const STAGE_ICONS = {
  Sparkles,
  GraduationCap,
  Briefcase,
  Target,
} as const;

// ============================================
// COMPONENT
// ============================================

export function CareerJourneyDemo() {
  const journeys = useMemo(() => getDemoJourneys(), []);
  const [selectedJourneyId, setSelectedJourneyId] = useState(journeys[0].id);
  const [selectedItem, setSelectedItem] = useState<JourneyItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showData, setShowData] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const journey = journeys.find((j) => j.id === selectedJourneyId) ?? journeys[0];

  // Compute legacy format + mermaid code for structured view
  const legacyJourney = useMemo(() => journeyToLegacyFormat(journey), [journey]);
  const mermaidCode = useMemo(
    () => careerJourneyToMermaid(legacyJourney),
    [legacyJourney]
  );

  const handleItemClick = (item: JourneyItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleJourneyChange = (id: string) => {
    setSelectedJourneyId(id);
    setShowData(false);
    setShowCode(false);
  };

  return (
    <div className="mt-8">
      <Card className="rounded-2xl shadow-sm border">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-semibold">Career Journey</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            Explore sample career timelines to see what a path could look like
          </p>

          {/* Journey Switcher */}
          <div className="mb-5">
            <Select value={selectedJourneyId} onValueChange={handleJourneyChange}>
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue placeholder="Choose a career journey" />
              </SelectTrigger>
              <SelectContent>
                {journeys.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.career}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stage Legend */}
          <div className="flex flex-wrap gap-2 mb-5">
            {STAGE_ORDER.map((stageId) => {
              const config = STAGE_CONFIG[stageId];
              const IconComponent =
                STAGE_ICONS[config.icon as keyof typeof STAGE_ICONS];
              return (
                <span
                  key={stageId}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                    config.bgClass,
                    config.textClass
                  )}
                >
                  {IconComponent && (
                    <IconComponent className="h-3.5 w-3.5" />
                  )}
                  {config.label}
                </span>
              );
            })}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="visual" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="visual">Visual View</TabsTrigger>
              <TabsTrigger value="structured">Structured View</TabsTrigger>
            </TabsList>

            {/* Visual View */}
            <TabsContent value="visual" className="mt-0">
              <RailRenderer
                journey={journey}
                onItemClick={handleItemClick}
              />
            </TabsContent>

            {/* Structured View */}
            <TabsContent value="structured" className="mt-0">
              <div className="space-y-5">
                {/* Mermaid Chart */}
                <MermaidRenderer code={mermaidCode} />

                {/* Accordions */}
                <div className="space-y-2">
                  {/* Show Data */}
                  <div className="rounded-lg border">
                    <button
                      onClick={() => setShowData(!showData)}
                      className="flex w-full items-center justify-between p-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Show data
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform',
                          showData && 'rotate-180'
                        )}
                      />
                    </button>
                    {showData && (
                      <div className="border-t px-3 pb-3">
                        <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs mt-2">
                          <code>
                            {JSON.stringify(legacyJourney, null, 2)}
                          </code>
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Show Diagram Code */}
                  <div className="rounded-lg border">
                    <button
                      onClick={() => setShowCode(!showCode)}
                      className="flex w-full items-center justify-between p-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Show diagram code
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform',
                          showCode && 'rotate-180'
                        )}
                      />
                    </button>
                    {showCode && (
                      <div className="border-t px-3 pb-3">
                        <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs mt-2">
                          <code>{mermaidCode}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <TimelineDetailDialog
        item={selectedItem}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
