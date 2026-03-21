'use client';

import { useState } from 'react';
import { Sprout, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useGrowthMirror } from '@/hooks/use-growth-mirror';

const TRAIT_OPTIONS = [
  'Patient', 'Curious', 'Organised', 'Creative',
  'Confident', 'Resilient', 'Collaborative', 'Independent',
  'Detail-oriented', 'Adaptable', 'Empathetic', 'Determined',
];

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function GrowthMirror() {
  const { snapshots, saveSnapshot, deleteSnapshot } = useGrowthMirror();
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [highlight, setHighlight] = useState('');

  const first = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
  const latest = snapshots.length > 1 ? snapshots[0] : null;

  const toggleTrait = (trait: string) => {
    setSelectedTraits((prev) =>
      prev.includes(trait) ? prev.filter((t) => t !== trait) : [...prev, trait]
    );
  };

  const handleSave = () => {
    const data: { traits?: string[]; highlights?: string[] } = {};
    if (selectedTraits.length > 0) data.traits = selectedTraits;
    if (highlight.trim()) data.highlights = [highlight.trim()];
    saveSnapshot(data);
    setIsCapturing(false);
    setSelectedTraits([]);
    setHighlight('');
  };

  return (
    <Card className="border-emerald-200/60 dark:border-emerald-800/40">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <Sprout className="h-4 w-4 text-emerald-500" />
              Growth mirror
            </h3>
            <p className="text-xs text-muted-foreground">Small changes add up.</p>
          </div>
          {snapshots.length > 0 && !isCapturing && (
            <Button variant="outline" size="sm" onClick={() => setIsCapturing(true)}>
              New snapshot
            </Button>
          )}
        </div>

        {/* Then vs Now comparison */}
        {first && latest && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/40 p-2.5">
              <p className="text-[10px] font-medium text-muted-foreground mb-1">Then</p>
              {first.traits && first.traits.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {first.traits.map((t) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {first.highlights && first.highlights.map((h) => (
                <p key={h} className="text-xs text-muted-foreground italic">{h}</p>
              ))}
              <p className="text-[9px] text-muted-foreground/60 mt-1">{timeAgo(first.createdAt)}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-2.5">
              <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mb-1">Now</p>
              {latest.traits && latest.traits.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {latest.traits.map((t) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {latest.highlights && latest.highlights.map((h) => (
                <p key={h} className="text-xs text-muted-foreground italic">{h}</p>
              ))}
              <p className="text-[9px] text-muted-foreground/60 mt-1">{timeAgo(latest.createdAt)}</p>
            </div>
          </div>
        )}

        {/* Single snapshot — no comparison yet */}
        {snapshots.length === 1 && !isCapturing && (
          <div className="rounded-lg bg-muted/40 p-3 text-center">
            <p className="text-xs text-muted-foreground">
              You have one snapshot. Capture another to see how you&apos;re changing.
            </p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setIsCapturing(true)}>
              Capture another
            </Button>
          </div>
        )}

        {/* Empty prompt */}
        {snapshots.length === 0 && !isCapturing && (
          <div className="rounded-lg border border-dashed p-4 text-center">
            <p className="text-xs text-muted-foreground mb-2">
              Capture a quick snapshot of where you are right now — come back later to see how you&apos;ve changed.
            </p>
            <Button variant="outline" size="sm" onClick={() => setIsCapturing(true)}>
              Capture a snapshot
            </Button>
          </div>
        )}

        {/* Capture form */}
        {isCapturing && (
          <div className="rounded-lg border p-3 space-y-3">
            <div>
              <p className="text-xs font-medium mb-1.5">Which traits feel like you right now? (optional)</p>
              <div className="flex flex-wrap gap-1.5">
                {TRAIT_OPTIONS.map((trait) => (
                  <button
                    key={trait}
                    onClick={() => toggleTrait(trait)}
                    className={`text-[11px] px-2 py-1 rounded-full border transition-colors ${
                      selectedTraits.includes(trait)
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                        : 'border-muted hover:border-muted-foreground/30'
                    }`}
                  >
                    {trait}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1.5">What&apos;s a highlight? (optional)</p>
              <Input
                value={highlight}
                onChange={(e) => setHighlight(e.target.value)}
                placeholder="Something you're proud of, learned, or noticed..."
                className="text-xs"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => { setIsCapturing(false); setSelectedTraits([]); setHighlight(''); }}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={selectedTraits.length === 0 && !highlight.trim()}
              >
                Save snapshot
              </Button>
            </div>
          </div>
        )}

        {/* Snapshot history (show last 3 with delete) */}
        {snapshots.length > 1 && !isCapturing && (
          <div className="pt-2 border-t">
            <p className="text-[10px] text-muted-foreground mb-1.5">
              {snapshots.length} snapshot{snapshots.length !== 1 ? 's' : ''} captured
            </p>
            <div className="space-y-1">
              {snapshots.slice(0, 3).map((s) => (
                <div key={s.id} className="flex items-center justify-between text-[11px] text-muted-foreground group">
                  <span>
                    {timeAgo(s.createdAt)}
                    {s.traits && s.traits.length > 0 && ` — ${s.traits.slice(0, 3).join(', ')}`}
                  </span>
                  <button
                    onClick={() => deleteSnapshot(s.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                    title="Delete snapshot"
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
