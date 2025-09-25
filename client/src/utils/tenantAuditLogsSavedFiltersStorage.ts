import { SavedFilter } from '../types/savedFilters';

const STORAGE_KEY = 'tenant-audit-logs-saved-filters';

export const tenantAuditLogsSavedFiltersStorage = {
  getAll: (): SavedFilter[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading tenant audit log filters:', error);
      return [];
    }
  },

  save: (filter: SavedFilter): void => {
    try {
      const filters = tenantAuditLogsSavedFiltersStorage.getAll();
      const existingIndex = filters.findIndex((f) => f.id === filter.id);
      if (existingIndex >= 0) {
        filters[existingIndex] = filter;
      } else {
        filters.push(filter);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving tenant audit log filter:', error);
    }
  },

  delete: (filterId: string): void => {
    try {
      const filters = tenantAuditLogsSavedFiltersStorage.getAll();
      const updatedFilters = filters.filter((f) => f.id !== filterId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFilters));
    } catch (error) {
      console.error('Error deleting tenant audit log filter:', error);
    }
  },

  get: (filterId: string): SavedFilter | null => {
    try {
      const filters = tenantAuditLogsSavedFiltersStorage.getAll();
      return filters.find((f) => f.id === filterId) || null;
    } catch (error) {
      console.error('Error retrieving tenant audit log filter:', error);
      return null;
    }
  },

  update: (filterId: string, updates: Partial<Pick<SavedFilter, 'name' | 'description'>>): void => {
    try {
      const filters = tenantAuditLogsSavedFiltersStorage.getAll();
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
      console.error('Error updating tenant audit log filter:', error);
    }
  },
};
