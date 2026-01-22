/**
 * DATE RANGE UTILITIES
 *
 * Helpers for filtering events by date range.
 * All displayed events MUST fall within: today <= startDate <= today + 12 months
 */

// ============================================
// DATE RANGE HELPERS
// ============================================

/**
 * Get the date range for event filtering
 * @param months Number of months to look ahead (default: 12)
 * @returns Object with minDate and maxDate as Date objects
 */
export function getDateRange(months: number = 12): { minDate: Date; maxDate: Date } {
  const now = new Date();
  const minDate = new Date(now);
  minDate.setHours(0, 0, 0, 0); // Start of today

  const maxDate = new Date(now);
  maxDate.setMonth(maxDate.getMonth() + months);
  maxDate.setHours(23, 59, 59, 999); // End of that day

  return { minDate, maxDate };
}

/**
 * Get ISO date strings for the date range
 */
export function getDateRangeISO(months: number = 12): { minDateISO: string; maxDateISO: string } {
  const { minDate, maxDate } = getDateRange(months);
  return {
    minDateISO: minDate.toISOString(),
    maxDateISO: maxDate.toISOString(),
  };
}

/**
 * Check if a date is within the allowed range
 */
export function isWithinDateRange(dateISO: string, months: number = 12): boolean {
  const { minDate, maxDate } = getDateRange(months);
  const date = new Date(dateISO);
  return date >= minDate && date <= maxDate;
}

/**
 * Check if an event is in the past
 */
export function isPastEvent(dateISO: string): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return new Date(dateISO) < now;
}

/**
 * Check if an event is too far in the future
 */
export function isTooFarFuture(dateISO: string, months: number = 12): boolean {
  const { maxDate } = getDateRange(months);
  return new Date(dateISO) > maxDate;
}

/**
 * Format a date for display
 */
export function formatEventDate(dateISO: string): string {
  const date = new Date(dateISO);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format a date range for display
 */
export function formatEventDateRange(startISO: string, endISO?: string): string {
  const start = new Date(startISO);
  const formatted = start.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (!endISO) return formatted;

  const end = new Date(endISO);
  // Same day
  if (start.toDateString() === end.toDateString()) {
    return formatted;
  }

  // Different day, same month
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()}–${end.getDate()} ${start.toLocaleDateString("en-GB", {
      month: "short",
      year: "numeric",
    })}`;
  }

  // Different months
  return `${formatted} – ${end.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

/**
 * Get relative time description
 */
export function getRelativeTime(dateISO: string): string {
  const date = new Date(dateISO);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Past";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays <= 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
  if (diffDays <= 365) return `In ${Math.ceil(diffDays / 30)} months`;
  return "Over a year away";
}

/**
 * Sort events by start date
 */
export function sortByDate<T extends { startDateISO: string }>(
  events: T[],
  ascending: boolean = true
): T[] {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.startDateISO).getTime();
    const dateB = new Date(b.startDateISO).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
}
