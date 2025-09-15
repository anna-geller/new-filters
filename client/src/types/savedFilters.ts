export interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  filterState: {
    searchValue: string;
    selectedStates: string[];
    selectedTimeRange: string;
    timeRangeStartDate?: string;
    timeRangeEndDate?: string;
    selectedLabels: string[];
    labelsOperator: string;
    labelsCustomValue: string;
    selectedNamespaces: string[];
    selectedFlows: string[];
    selectedScopes: string[];
    selectedKinds: string[];
    selectedSubflows: string[];
    selectedInitialExecution: boolean | null;
  };
}

export interface SavedFiltersContextType {
  savedFilters: SavedFilter[];
  saveFilter: (name: string, description: string, filterState: SavedFilter['filterState']) => void;
  loadFilter: (filterId: string) => SavedFilter | null;
  deleteFilter: (filterId: string) => void;
  updateFilter: (filterId: string, name: string, description: string) => void;
}