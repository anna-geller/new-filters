import { SavedFilter } from "../types/savedFilters";

const STORAGE_KEY = "namespaces-saved-filters";

export const namespacesSavedFiltersStorage = {
  getAll: (): SavedFilter[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading namespaces filters:", error);
      return [];
    }
  },

  save: (filter: SavedFilter): void => {
    try {
      const filters = namespacesSavedFiltersStorage.getAll();
      const existingIndex = filters.findIndex((item) => item.id === filter.id);
      if (existingIndex >= 0) {
        filters[existingIndex] = filter;
      } else {
        filters.push(filter);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error("Error saving namespaces filter:", error);
    }
  },

  delete: (filterId: string): void => {
    try {
      const filters = namespacesSavedFiltersStorage.getAll();
      const updated = filters.filter((item) => item.id !== filterId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Error deleting namespaces filter:", error);
    }
  },

  get: (filterId: string): SavedFilter | null => {
    try {
      const filters = namespacesSavedFiltersStorage.getAll();
      return filters.find((item) => item.id === filterId) ?? null;
    } catch (error) {
      console.error("Error retrieving namespaces filter:", error);
      return null;
    }
  },

  update: (filterId: string, updates: Partial<Pick<SavedFilter, "name" | "description">>): void => {
    try {
      const filters = namespacesSavedFiltersStorage.getAll();
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
      console.error("Error updating namespaces filter:", error);
    }
  },
};

