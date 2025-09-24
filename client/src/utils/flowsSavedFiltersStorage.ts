import { SavedFilter } from '../types/savedFilters';

const STORAGE_KEY = 'flows-saved-filters';

export const flowsSavedFiltersStorage = {
  getAll: (): SavedFilter[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading flows saved filters:', error);
      return [];
    }
  },

  save: (filter: SavedFilter): void => {
    try {
      const filters = flowsSavedFiltersStorage.getAll();
      const existingIndex = filters.findIndex((f) => f.id === filter.id);
      if (existingIndex >= 0) {
        filters[existingIndex] = filter;
      } else {
        filters.push(filter);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving flows filter:', error);
    }
  },

  delete: (filterId: string): void => {
    try {
      const filters = flowsSavedFiltersStorage.getAll();
      const updated = filters.filter((f) => f.id !== filterId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error deleting flows filter:', error);
    }
  },

  get: (filterId: string): SavedFilter | null => {
    try {
      const filters = flowsSavedFiltersStorage.getAll();
      return filters.find((f) => f.id === filterId) || null;
    } catch (error) {
      console.error('Error retrieving flows filter:', error);
      return null;
    }
  },

  update: (filterId: string, updates: Partial<Pick<SavedFilter, 'name' | 'description'>>): void => {
    try {
      const filters = flowsSavedFiltersStorage.getAll();
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
      console.error('Error updating flows filter:', error);
    }
  },
};
