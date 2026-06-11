"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Career, CareerCategory } from "@/lib/career-pathways";
import {
  buildCatalogIndexes,
  searchCatalog,
  sectorForCareer,
  type CareerCatalog,
} from "@/lib/careers-catalog/from-catalog";

async function fetchCatalog(): Promise<CareerCatalog> {
  const res = await fetch("/api/careers/catalog");
  if (!res.ok) throw new Error("Failed to load career catalog");
  return res.json();
}

/**
 * Client-side access to the career catalog, fetched from the cached
 * /api/careers/catalog endpoint instead of statically importing the
 * ~728KB CAREER_PATHWAYS constant into the bundle.
 *
 * The returned helper functions mirror the server-side helpers in
 * career-pathways.ts (getAllCareers / getCareerById / searchCareers /
 * getCategoryForCareer / getAllCategories) so callers can swap the
 * static import for this hook with minimal change. Before the catalog
 * loads they return empty/undefined; gate on `isLoading` where the
 * empty state matters.
 */
export function useCareerCatalog() {
  const query = useQuery({
    queryKey: ["career-catalog"],
    queryFn: fetchCatalog,
    // Static-forever content — never refetch within a session.
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const indexes = useMemo(
    () => (query.data ? buildCatalogIndexes(query.data) : null),
    [query.data],
  );

  return useMemo(
    () => ({
      isLoading: query.isLoading,
      error: query.error,
      careers: indexes?.all ?? [],
      getAllCareers: (): Career[] => indexes?.all ?? [],
      getCareerById: (id: string): Career | undefined => indexes?.byId.get(id),
      getCategoryForCareer: (id: string): CareerCategory | undefined =>
        indexes?.categoryById.get(id),
      // Mirrors findCareerCategory() (first category by iteration order) — same
      // as getCategoryForCareer but returns null rather than undefined.
      findCareerCategory: (id: string): CareerCategory | null =>
        indexes?.categoryById.get(id) ?? null,
      getSectorForCareer: (id: string): "public" | "private" | "mixed" =>
        indexes ? sectorForCareer(indexes, id) : "mixed",
      getCareersForCategory: (category: CareerCategory): Career[] =>
        query.data?.[category] ?? [],
      searchCareers: (q: string): Career[] =>
        indexes ? searchCatalog(indexes.all, q) : [],
      getAllCategories: (): CareerCategory[] =>
        query.data ? (Object.keys(query.data) as CareerCategory[]) : [],
    }),
    [indexes, query.data, query.isLoading, query.error],
  );
}
