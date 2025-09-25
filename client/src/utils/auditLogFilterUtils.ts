export const normalizeActionForFilter = (action: string): string => {
  const upper = action.trim().toUpperCase();
  if (upper.endsWith('ED') && upper.length > 2) {
    return `${upper.slice(0, -2)}E`;
  }
  return upper;
};

export const detailsIncludeKeyValue = (details: string, key?: string, value?: string): boolean => {
  const keyTrimmed = key?.trim();
  const valueTrimmed = value?.trim();

  if (!keyTrimmed || !valueTrimmed) {
    return true;
  }

  const normalizedDetails = details.toLowerCase();
  return normalizedDetails.includes(keyTrimmed.toLowerCase()) && normalizedDetails.includes(valueTrimmed.toLowerCase());
};
