interface FilterOption {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  order: number;
}

const STORAGE_KEY = 'executions-filter-customization';

export const filterCustomizationStorage = {
  // Get saved filter customization
  get: (): FilterOption[] | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading filter customization:', error);
      return null;
    }
  },

  // Save filter customization
  save: (filterOptions: FilterOption[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filterOptions));
    } catch (error) {
      console.error('Error saving filter customization:', error);
    }
  },

  // Clear filter customization (reset to defaults)
  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing filter customization:', error);
    }
  }
};