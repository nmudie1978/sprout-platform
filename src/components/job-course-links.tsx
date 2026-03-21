'use client';

import { GraduationCap, ExternalLink } from 'lucide-react';
import { getCourseLinksForJobCategory } from '@/lib/learning/course-links';

interface JobCourseLinksProps {
  category: string;
}

export function JobCourseLinks({ category }: JobCourseLinksProps) {
  const links = getCourseLinksForJobCategory(category);

  if (links.length === 0) return null;

  return (
    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
      <GraduationCap className="h-3 w-3 shrink-0" />
      <span className="shrink-0">Build skills:</span>
      {links.map((link, i) => (
        <span key={link.platform} className="inline-flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground/40">·</span>}
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-2.5 w-2.5" />
            {link.label}
          </a>
        </span>
      ))}
    </div>
  );
}
