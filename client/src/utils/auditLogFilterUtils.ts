import type { DetailFilter } from "@/types/auditLogs";

export const normalizeActionForFilter = (action: string): string => {
  const upper = action.trim().toUpperCase();
  if (upper.endsWith("ED") && upper.length > 2) {
    return `${upper.slice(0, -2)}E`;
  }
  return upper;
};

const detailSegmentSplitter = /(?<=\S)\s+(?=[^:\s]+:)/g;

export const extractDetailPairs = (details: string): DetailFilter[] => {
  if (!details) {
    return [];
  }

  const normalized = details.replace(/\r\n/g, "\n");
  const segments = normalized
    .split("\n")
    .flatMap(line => line.split(detailSegmentSplitter))
    .map(segment => segment.trim())
    .filter(Boolean);

  const pairs: DetailFilter[] = [];

  segments.forEach(segment => {
    const [rawKey, ...rawValue] = segment.split(":");
    if (!rawKey || rawValue.length === 0) {
      return;
    }

    const key = rawKey.trim();
    const value = rawValue.join(":").trim();

    if (!key || !value) {
      return;
    }

    pairs.push({ key, value });
  });

  return pairs;
};

export const detailsIncludeAllKeyValues = (details: string, filters: DetailFilter[]): boolean => {
  const normalizedFilters = filters
    .map(filter => ({
      key: filter.key.trim().toLowerCase(),
      value: filter.value.trim().toLowerCase(),
    }))
    .filter(filter => filter.key && filter.value);

  if (normalizedFilters.length === 0) {
    return true;
  }

  const parsedPairs = extractDetailPairs(details).map(pair => ({
    key: pair.key.trim().toLowerCase(),
    value: pair.value.trim().toLowerCase(),
  }));

  if (parsedPairs.length === 0) {
    const normalizedDetails = details.toLowerCase();
    return normalizedFilters.every(filter =>
      normalizedDetails.includes(filter.key) && normalizedDetails.includes(filter.value),
    );
  }

  return normalizedFilters.every(filter =>
    parsedPairs.some(pair => pair.key === filter.key && pair.value.includes(filter.value)),
  );
};
