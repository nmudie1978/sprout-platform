'use client';

import { Layers, CheckCircle2, MessageSquare, Link, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { OVERLAY_LAYERS, type OverlayLayerId } from '@/lib/journey/overlay-types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  CheckCircle2,
  MessageSquare,
  Link,
  Gauge,
};

interface LayersControlProps {
  activeLayers: Record<OverlayLayerId, boolean>;
  onToggle: (id: OverlayLayerId) => void;
}

export function LayersControl({ activeLayers, onToggle }: LayersControlProps) {
  const activeCount = Object.values(activeLayers).filter(Boolean).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
          <Layers className="h-3.5 w-3.5" />
          Layers
          {activeCount > 0 && (
            <span className="ml-0.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-3">
        <p className="text-xs font-semibold text-foreground mb-2">Overlay Layers</p>
        <div className="space-y-2.5">
          {OVERLAY_LAYERS.map((layer) => {
            const Icon = ICON_MAP[layer.icon];
            return (
              <div key={layer.id} className="flex items-center gap-2.5">
                {Icon && (
                  <Icon
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: layer.color }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium leading-tight">{layer.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    {layer.description}
                  </p>
                </div>
                <Switch
                  checked={activeLayers[layer.id]}
                  onCheckedChange={() => onToggle(layer.id)}
                  className="scale-75 origin-right"
                />
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
