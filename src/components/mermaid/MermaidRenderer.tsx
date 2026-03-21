'use client';

import { useEffect, useRef, useState, useId } from 'react';
import { cn } from '@/lib/utils';

interface MermaidRendererProps {
  code: string;
  className?: string;
}

export function MermaidRenderer({ code, className }: MermaidRendererProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRawCode, setShowRawCode] = useState(false);
  const renderIdBase = useId();
  const renderCountRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    renderCountRef.current += 1;
    const currentRender = renderCountRef.current;

    setSvg(null);
    setError(null);
    setLoading(true);

    async function render() {
      try {
        const mermaid = (await import('mermaid')).default;

        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          securityLevel: 'loose',
          gantt: {
            titleTopMargin: 15,
            barHeight: 24,
            barGap: 6,
            topPadding: 40,
            leftPadding: 120,
            gridLineStartPadding: 20,
            fontSize: 12,
            sectionFontSize: 14,
            numberSectionStyles: 4,
          },
        });

        // Use a unique ID per render
        const id = `mermaid-${renderIdBase.replace(/:/g, '')}-${currentRender}`;
        const { svg: svgResult } = await mermaid.render(id, code);

        if (!cancelled) {
          setSvg(svgResult);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
          setLoading(false);
        }
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [code, renderIdBase]);

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
          <p className="text-sm text-muted-foreground">Rendering diagram...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('rounded-xl border border-destructive/30 bg-destructive/5 p-4', className)}>
        <p className="text-sm font-medium text-destructive mb-2">
          Could not render diagram
        </p>
        <p className="text-xs text-muted-foreground mb-3">{error}</p>
        <button
          onClick={() => setShowRawCode(!showRawCode)}
          className="text-xs text-primary hover:underline"
        >
          {showRawCode ? 'Hide' : 'Show'} diagram code
        </button>
        {showRawCode && (
          <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 text-xs">
            <code>{code}</code>
          </pre>
        )}
      </div>
    );
  }

  if (!svg) return null;

  return (
    <div
      className={cn(
        'mermaid-chart-wrapper overflow-x-auto rounded-xl',
        className
      )}
    >
      {/* Section colour overrides applied via CSS */}
      <style>{`
        .mermaid-chart-wrapper .section0 rect { fill: #ccfbf1 !important; stroke: #14b8a6 !important; }
        .mermaid-chart-wrapper .section1 rect { fill: #dbeafe !important; stroke: #3b82f6 !important; }
        .mermaid-chart-wrapper .section2 rect { fill: #ffedd5 !important; stroke: #f97316 !important; }
        .mermaid-chart-wrapper .section3 rect { fill: #f3e8ff !important; stroke: #a855f7 !important; }
        .mermaid-chart-wrapper .section0 text { fill: #0d9488 !important; }
        .mermaid-chart-wrapper .section1 text { fill: #2563eb !important; }
        .mermaid-chart-wrapper .section2 text { fill: #ea580c !important; }
        .mermaid-chart-wrapper .section3 text { fill: #9333ea !important; }
        .mermaid-chart-wrapper .milestone { fill: #6366f1 !important; stroke: #4f46e5 !important; }
        .mermaid-chart-wrapper svg { max-width: none; min-width: 600px; }
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}
