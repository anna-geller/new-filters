import { SavedFilter } from '../types/savedFilters';

const STORAGE_KEY = 'executions-saved-filters';

export const savedFiltersStorage = {
  // Get all saved filters
  getAll: (): SavedFilter[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading saved filters:', error);
      return [];
    }
  },

  // Save a new filter
  save: (filter: SavedFilter): void => {
    try {
      const filters = savedFiltersStorage.getAll();
      const existingIndex = filters.findIndex(f => f.id === filter.id);
      
      if (existingIndex >= 0) {
        filters[existingIndex] = filter;
      } else {
        filters.push(filter);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving filter:', error);
    }
  },

  // Delete a filter
  delete: (filterId: string): void => {
    try {
      const filters = savedFiltersStorage.getAll();
      const updatedFilters = filters.filter(f => f.id !== filterId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFilters));
    } catch (error) {
      console.error('Error deleting filter:', error);
    }
  },

  // Get a specific filter
  get: (filterId: string): SavedFilter | null => {
    try {
      const filters = savedFiltersStorage.getAll();
      return filters.find(f => f.id === filterId) || null;
    } catch (error) {
      console.error('Error getting filter:', error);
      return null;
    }
  },

  // Update filter metadata (name, description)
  update: (filterId: string, updates: Partial<Pick<SavedFilter, 'name' | 'description'>>): void => {
    try {
      const filters = savedFiltersStorage.getAll();
      const filterIndex = filters.findIndex(f => f.id === filterId);
      
      if (filterIndex >= 0) {
        filters[filterIndex] = {
          ...filters[filterIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
      }
    } catch (error) {
      console.error('Error updating filter:', error);
    }
  }
};