import { SavedFilter } from "@/types/savedFilters";

const STORAGE_KEY = "tenant-invitations-saved-filters";

export const tenantInvitationsSavedFiltersStorage = {
  getAll: (): SavedFilter[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading tenant invitation filters:", error);
      return [];
    }
  },

  save: (filter: SavedFilter): void => {
    try {
      const filters = tenantInvitationsSavedFiltersStorage.getAll();
      const existingIndex = filters.findIndex((f) => f.id === filter.id);
      if (existingIndex >= 0) {
        filters[existingIndex] = filter;
      } else {
        filters.push(filter);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error("Error saving tenant invitation filter:", error);
    }
  },

  delete: (filterId: string): void => {
    try {
      const filters = tenantInvitationsSavedFiltersStorage.getAll();
      const updatedFilters = filters.filter((f) => f.id !== filterId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFilters));
    } catch (error) {
      console.error("Error deleting tenant invitation filter:", error);
    }
  },

  get: (filterId: string): SavedFilter | null => {
    try {
      const filters = tenantInvitationsSavedFiltersStorage.getAll();
      return filters.find((f) => f.id === filterId) || null;
    } catch (error) {
      console.error("Error retrieving tenant invitation filter:", error);
      return null;
    }
  },

  update: (filterId: string, updates: Partial<Pick<SavedFilter, "name" | "description">>): void => {
    try {
      const filters = tenantInvitationsSavedFiltersStorage.getAll();
      const index = filters.findIndex((f) => f.id === filterId);
      if (index >= 0) {
        filters[index] = {
          ...filters[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
      }
    } catch (error) {
      console.error("Error updating tenant invitation filter:", error);
    }
  },
};
