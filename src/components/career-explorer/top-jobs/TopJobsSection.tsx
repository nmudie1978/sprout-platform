"use client";

import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Search,
  X,
  Wifi,
  Code2,
  ArrowLeftRight,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import {
  type TopJobDomain,
  type TopJobGroup,
  type TopJobSeniority,
  type TopJobRole,
  TOP_JOB_CATEGORIES,
  GROUP_LABELS,
  SENIORITY_LABELS,
  getGroupsForDomain,
} from "@/lib/career-explorer/top-jobs";
import { RoleDetailsSheet } from "./RoleDetailsSheet";

// ============================================
// DOMAIN ICONS
// ============================================

const DOMAIN_ICONS: Record<TopJobDomain, typeof Wifi> = {
  telecom: Wifi,
  software: Code2,
  crossover: ArrowLeftRight,
};

// ============================================
// FILTER CHIPS
// ============================================

interface FilterChipsProps {
  groups: TopJobGroup[];
  selectedGroup: TopJobGroup | null;
  onGroupChange: (group: TopJobGroup | null) => void;
  selectedSeniority: TopJobSeniority | null;
  onSeniorityChange: (seniority: TopJobSeniority | null) => void;
}

function FilterChips({
  groups,
  selectedGroup,
  onGroupChange,
  selectedSeniority,
  onSeniorityChange,
}: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {/* Group chips */}
      {groups.map((group) => (
        <button
          key={group}
          onClick={() => onGroupChange(selectedGroup === group ? null : group)}
          className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
            selectedGroup === group
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
          }`}
        >
          {GROUP_LABELS[group]}
        </button>
      ))}

      {/* Divider */}
      <span className="w-px h-6 bg-border self-center mx-1" />

      {/* Seniority chips */}
      {(["mid", "senior", "lead"] as TopJobSeniority[]).map((seniority) => (
        <button
          key={seniority}
          onClick={() =>
            onSeniorityChange(selectedSeniority === seniority ? null : seniority)
          }
          className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
            selectedSeniority === seniority
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
          }`}
        >
          {SENIORITY_LABELS[seniority]}
        </button>
      ))}
    </div>
  );
}

// ============================================
// ROLE CARD
// ============================================

interface RoleCardProps {
  role: TopJobRole;
  onViewRole: (role: TopJobRole) => void;
  index: number;
}

function RoleCard({ role, onViewRole, index }: RoleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3) }}
    >
      <Card
        className="p-3 border rounded-lg hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group h-full flex flex-col"
        onClick={() => onViewRole(role)}
        tabIndex={0}
        role="button"
        aria-label={`View details for ${role.title}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onViewRole(role);
          }
        }}
      >
        {/* Title */}
        <h4 className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-2">
          {role.title}
        </h4>

        {/* Badges */}
        <div className="flex flex-wrap gap-1 mb-2">
          <Badge variant="outline" className="text-[9px] px-1.5 py-0">
            {GROUP_LABELS[role.group]}
          </Badge>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0">
            {SENIORITY_LABELS[role.seniority]}
          </Badge>
        </div>

        {/* Summary */}
        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-3 flex-1">
          {role.summary}
        </p>

        {/* Top skills */}
        <div className="flex flex-wrap gap-1 mb-3">
          {role.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="text-[9px] bg-primary/8 text-primary/80 px-1.5 py-0.5 rounded"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-end mt-auto">
          <span className="text-[11px] font-medium text-primary flex items-center gap-0.5 group-hover:gap-1 transition-all">
            View role
            <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      </Card>
    </motion.div>
  );
}

// ============================================
// DOMAIN TAB CONTENT
// ============================================

interface DomainTabContentProps {
  domain: TopJobDomain;
  roles: TopJobRole[];
  searchQuery: string;
  selectedGroup: TopJobGroup | null;
  selectedSeniority: TopJobSeniority | null;
  onGroupChange: (group: TopJobGroup | null) => void;
  onSeniorityChange: (seniority: TopJobSeniority | null) => void;
  onViewRole: (role: TopJobRole) => void;
}

function DomainTabContent({
  domain,
  roles,
  searchQuery,
  selectedGroup,
  selectedSeniority,
  onGroupChange,
  onSeniorityChange,
  onViewRole,
}: DomainTabContentProps) {
  const groups = useMemo(() => getGroupsForDomain(domain), [domain]);

  const filteredRoles = useMemo(() => {
    let result = roles;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)) ||
          r.summary.toLowerCase().includes(q)
      );
    }

    if (selectedGroup) {
      result = result.filter((r) => r.group === selectedGroup);
    }

    if (selectedSeniority) {
      result = result.filter((r) => r.seniority === selectedSeniority);
    }

    return result;
  }, [roles, searchQuery, selectedGroup, selectedSeniority]);

  return (
    <div>
      {/* Filter chips */}
      <div className="mb-4">
        <FilterChips
          groups={groups}
          selectedGroup={selectedGroup}
          onGroupChange={onGroupChange}
          selectedSeniority={selectedSeniority}
          onSeniorityChange={onSeniorityChange}
        />
      </div>

      {/* Results count */}
      <p className="text-[11px] text-muted-foreground mb-3">
        {filteredRoles.length} role{filteredRoles.length !== 1 ? "s" : ""}
        {(searchQuery || selectedGroup || selectedSeniority) && " matching filters"}
      </p>

      {/* Cards grid */}
      {filteredRoles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredRoles.map((role, idx) => (
            <RoleCard
              key={role.id}
              role={role}
              onViewRole={onViewRole}
              index={idx}
            />
          ))}
        </div>
      ) : (
        <div className="py-10 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            No roles match your filters
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onGroupChange(null);
              onSeniorityChange(null);
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN SECTION
// ============================================

export function TopJobsSection() {
  const [activeDomain, setActiveDomain] = useState<TopJobDomain>("telecom");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<TopJobGroup | null>(null);
  const [selectedSeniority, setSelectedSeniority] = useState<TopJobSeniority | null>(null);
  const [selectedRole, setSelectedRole] = useState<TopJobRole | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Reset filters when switching tabs
  const handleTabChange = useCallback((value: string) => {
    setActiveDomain(value as TopJobDomain);
    setSelectedGroup(null);
    setSelectedSeniority(null);
  }, []);

  const handleViewRole = useCallback((role: TopJobRole) => {
    setSelectedRole(role);
  }, []);

  const handleNavigateRole = useCallback((id: string) => {
    const allRoles = TOP_JOB_CATEGORIES.flatMap((c) => c.roles);
    const role = allRoles.find((r) => r.id === id);
    if (role) setSelectedRole(role);
  }, []);

  return (
    <section className="mb-8">
      {/* Section header */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">
          Top Jobs by Domain
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Explore roles across telecommunications, software development, and cross-over positions
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search roles, skills, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm rounded-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button
          variant={showFilters ? "secondary" : "outline"}
          size="sm"
          className="h-9 rounded-lg sm:hidden"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeDomain} onValueChange={handleTabChange}>
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-lg mb-4">
          {TOP_JOB_CATEGORIES.map((cat) => {
            const Icon = DOMAIN_ICONS[cat.domain];
            return (
              <TabsTrigger
                key={cat.domain}
                value={cat.domain}
                className="flex-1 sm:flex-initial text-xs gap-1.5 data-[state=active]:bg-background rounded-md py-2"
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{cat.label}</span>
                <span className="sm:hidden">
                  {cat.domain === "crossover" ? "Cross-Over" : cat.label.split(" ")[0]}
                </span>
                <Badge
                  variant="secondary"
                  className="ml-1 h-4 px-1 text-[9px] bg-muted-foreground/10"
                >
                  {cat.roles.length}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {TOP_JOB_CATEGORIES.map((cat) => (
          <TabsContent key={cat.domain} value={cat.domain} className="mt-0">
            <DomainTabContent
              domain={cat.domain}
              roles={cat.roles}
              searchQuery={searchQuery}
              selectedGroup={selectedGroup}
              selectedSeniority={selectedSeniority}
              onGroupChange={setSelectedGroup}
              onSeniorityChange={setSelectedSeniority}
              onViewRole={handleViewRole}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Role Details Sheet */}
      <RoleDetailsSheet
        role={selectedRole}
        onClose={() => setSelectedRole(null)}
        onNavigate={handleNavigateRole}
      />
    </section>
  );
}
