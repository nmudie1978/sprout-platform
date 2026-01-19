/**
 * Live job search link builder utility
 * Generates outbound search URLs for job boards - no scraping involved
 */

export type LocationMode = "global" | "norway" | "remote";

export interface SearchLinks {
  linkedinUrl: string;
  indeedUrl: string;
  googleUrl: string;
  queryLabel: string;
}

export interface LiveSearchLinksResult {
  entry: SearchLinks;
  professional: SearchLinks;
}

// Keywords that indicate a role where "Junior" prefix makes sense
const JUNIOR_PREFIX_KEYWORDS = [
  "engineer",
  "developer",
  "analyst",
  "designer",
  "specialist",
  "technician",
  "administrator",
  "support",
  "consultant",
];

/**
 * Determines if a title should use "Junior" prefix or "Entry level" prefix
 */
function getEntryQuery(title: string): string {
  const lowerTitle = title.toLowerCase();
  const useJuniorPrefix = JUNIOR_PREFIX_KEYWORDS.some((keyword) =>
    lowerTitle.includes(keyword)
  );

  return useJuniorPrefix ? `Junior ${title}` : `Entry level ${title}`;
}

/**
 * Appends location suffix based on locationMode
 */
function appendLocationSuffix(query: string, locationMode: LocationMode): string {
  switch (locationMode) {
    case "norway":
      return `${query} Norway`;
    case "remote":
      return `${query} remote`;
    case "global":
    default:
      return query;
  }
}

/**
 * Builds search URLs for a given query
 */
function buildSearchUrls(query: string): Omit<SearchLinks, "queryLabel"> {
  const encodedQuery = encodeURIComponent(query);

  return {
    linkedinUrl: `https://www.linkedin.com/jobs/search/?keywords=${encodedQuery}`,
    indeedUrl: `https://www.indeed.com/jobs?q=${encodedQuery}`,
    googleUrl: `https://www.google.com/search?q=${encodedQuery}+jobs`,
  };
}

/**
 * Builds live job search links for a career with entry-level and professional variants
 *
 * @param title - The career title
 * @param locationMode - Optional location filter (global, norway, or remote)
 * @returns Object containing entry and professional search links
 */
export function buildLiveSearchLinksForCareer({
  title,
  locationMode = "global",
}: {
  title: string;
  locationMode?: LocationMode;
}): LiveSearchLinksResult {
  // Professional query is just the title
  const professionalQuery = appendLocationSuffix(title, locationMode);

  // Entry query uses Junior or Entry level prefix
  const entryBaseQuery = getEntryQuery(title);
  const entryQuery = appendLocationSuffix(entryBaseQuery, locationMode);

  return {
    entry: {
      ...buildSearchUrls(entryQuery),
      queryLabel: entryBaseQuery,
    },
    professional: {
      ...buildSearchUrls(professionalQuery),
      queryLabel: title,
    },
  };
}
