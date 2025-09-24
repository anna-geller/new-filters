import { SavedFilter } from "../types/savedFilters";

const STORAGE_KEY = "triggers-saved-filters";

export const triggersSavedFiltersStorage = {
  getAll: (): SavedFilter[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading triggers saved filters:", error);
      return [];
    }
  },

  save: (filter: SavedFilter): void => {
    try {
      const filters = triggersSavedFiltersStorage.getAll();
      const existingIndex = filters.findIndex((item) => item.id === filter.id);

      if (existingIndex >= 0) {
        filters[existingIndex] = filter;
      } else {
        filters.push(filter);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error("Error saving triggers filter:", error);
    }
  },

  delete: (filterId: string): void => {
    try {
      const filters = triggersSavedFiltersStorage.getAll();
      const updated = filters.filter((filter) => filter.id !== filterId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Error deleting triggers filter:", error);
    }
  },

  get: (filterId: string): SavedFilter | null => {
    try {
      const filters = triggersSavedFiltersStorage.getAll();
      return filters.find((filter) => filter.id === filterId) ?? null;
    } catch (error) {
      console.error("Error retrieving triggers filter:", error);
      return null;
    }
  },

  update: (
    filterId: string,
    updates: Partial<Pick<SavedFilter, "name" | "description">>,
  ): void => {
    try {
      const filters = triggersSavedFiltersStorage.getAll();
      const index = filters.findIndex((filter) => filter.id === filterId);

      if (index >= 0) {
        filters[index] = {
          ...filters[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
      }
    } catch (error) {
      console.error("Error updating triggers filter:", error);
    }
  },
};
