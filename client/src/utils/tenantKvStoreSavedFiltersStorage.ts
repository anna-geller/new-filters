import { SavedFilter } from "../types/savedFilters";

const STORAGE_KEY = "tenant-kv-store-saved-filters";

export const tenantKvStoreSavedFiltersStorage = {
  getAll: (): SavedFilter[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading tenant KV filters:", error);
      return [];
    }
  },

  save: (filter: SavedFilter): void => {
    try {
      const filters = tenantKvStoreSavedFiltersStorage.getAll();
      const existingIndex = filters.findIndex((item) => item.id === filter.id);
      if (existingIndex >= 0) {
        filters[existingIndex] = filter;
      } else {
        filters.push(filter);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error("Error saving tenant KV filter:", error);
    }
  },

  delete: (filterId: string): void => {
    try {
      const filters = tenantKvStoreSavedFiltersStorage.getAll();
      const updated = filters.filter((item) => item.id !== filterId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Error deleting tenant KV filter:", error);
    }
  },

  get: (filterId: string): SavedFilter | null => {
    try {
      const filters = tenantKvStoreSavedFiltersStorage.getAll();
      return filters.find((item) => item.id === filterId) ?? null;
    } catch (error) {
      console.error("Error retrieving tenant KV filter:", error);
      return null;
    }
  },

  update: (filterId: string, updates: Partial<Pick<SavedFilter, "name" | "description">>): void => {
    try {
      const filters = tenantKvStoreSavedFiltersStorage.getAll();
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
      console.error("Error updating tenant KV filter:", error);
    }
  },
};

