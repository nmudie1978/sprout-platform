"use client";

import { useQuery } from "@tanstack/react-query";
import { calculateSkillLevels, formatSkillName, SOFT_SKILLS } from "@/lib/skills-mapping";
import { Badge } from "@/components/ui/badge";

interface SkillRadarProps {
  userId: string;
}

export function SkillRadar({ userId }: SkillRadarProps) {
  const { data: completedJobsData } = useQuery({
    queryKey: ["completed-jobs", userId],
    queryFn: async () => {
      // Get user's completed jobs
      const response = await fetch(`/api/jobs?userId=${userId}&status=COMPLETED`);
      if (!response.ok) return { jobs: [] };
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes (completed jobs don't change often)
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Handle both paginated response { jobs: [...] } and legacy array response
  const completedJobs = Array.isArray(completedJobsData)
    ? completedJobsData
    : (completedJobsData?.jobs || []);

  if (!completedJobs || completedJobs.length === 0) {
    return (
      <div className="rounded-lg bg-muted p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Complete jobs to start building your skill profile!
        </p>
      </div>
    );
  }

  const skillLevels = calculateSkillLevels(completedJobs);

  // Get skills sorted by level
  const sortedSkills = SOFT_SKILLS
    .map((skill) => ({
      skill,
      level: skillLevels[skill] || 0,
    }))
    .filter((s) => s.level > 0)
    .sort((a, b) => b.level - a.level);

  return (
    <div className="space-y-4">
      {/* Simple bar chart visualization */}
      <div className="space-y-3">
        {sortedSkills.map(({ skill, level }) => (
          <div key={skill}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium">{formatSkillName(skill)}</span>
              <span className="text-muted-foreground">{level}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${level}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {sortedSkills.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          No skills tracked yet. Complete more jobs!
        </p>
      )}

      {/* Top skills badges */}
      {sortedSkills.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <p className="mb-2 text-sm font-medium">Top Skills</p>
          <div className="flex flex-wrap gap-2">
            {sortedSkills.slice(0, 5).map(({ skill }) => (
              <Badge key={skill} variant="secondary">
                {formatSkillName(skill)}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
