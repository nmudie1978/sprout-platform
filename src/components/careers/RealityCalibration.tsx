'use client';

import { Heart } from 'lucide-react';

const BULLETS = [
  'Most people change direction several times — that\'s normal.',
  'Feeling unsure doesn\'t mean you\'re behind.',
  'Every career looks easier from the outside.',
  'You don\'t need to have it all figured out right now.',
];

export function RealityCalibration() {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-3 border">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Heart className="h-3.5 w-3.5 text-slate-500" />
        <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Reality calibration
        </h3>
      </div>
      <ul className="space-y-1">
        {BULLETS.map((text) => (
          <li key={text} className="text-xs text-muted-foreground flex items-start gap-1.5">
            <span className="text-slate-400 mt-0.5">·</span>
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}
