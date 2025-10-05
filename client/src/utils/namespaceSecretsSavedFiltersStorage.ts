import { SavedFilter } from "@/types/savedFilters";

const STORAGE_KEY = "namespace-secrets-saved-filters";

export const namespaceSecretsSavedFiltersStorage = {
  getAll: (): SavedFilter[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading namespace secrets filters:", error);
      return [];
    }
  },

  save: (filter: SavedFilter): void => {
    try {
      const filters = namespaceSecretsSavedFiltersStorage.getAll();
      const existingIndex = filters.findIndex((item) => item.id === filter.id);
      if (existingIndex >= 0) {
        filters[existingIndex] = filter;
      } else {
        filters.push(filter);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error("Error saving namespace secrets filter:", error);
    }
  },

  delete: (filterId: string): void => {
    try {
      const filters = namespaceSecretsSavedFiltersStorage.getAll();
      const updated = filters.filter((item) => item.id !== filterId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Error deleting namespace secrets filter:", error);
    }
  },

  update: (filterId: string, updates: Partial<Pick<SavedFilter, "name" | "description">>): void => {
    try {
      const filters = namespaceSecretsSavedFiltersStorage.getAll();
      const index = filters.findIndex((item) => item.id === filterId);
      if (index >= 0) {
        filters[index] = {
          ...filters[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
      }
    } catch (error) {
      console.error("Error updating namespace secrets filter:", error);
    }
  },
};
