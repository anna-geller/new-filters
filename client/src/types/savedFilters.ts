export interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  filterState: {
    searchValue: string;
    selectedStates: string[];
    statesOperator: string;
    selectedInterval: string;
    intervalStartDate?: string;
    intervalEndDate?: string;
    selectedLabels: string[];
    labelsOperator: string;
    labelsCustomValue: string;
    selectedNamespaces: string[];
  namespaceOperator?: string;
  namespaceCustomValue?: string;
    selectedFlows: string[];
    selectedScopes: string[];
    selectedKinds: string[];
    selectedHierarchy: string;
    selectedInitialExecution: string;
  };
}

export interface SavedFiltersContextType {
  savedFilters: SavedFilter[];
  saveFilter: (name: string, description: string, filterState: SavedFilter['filterState']) => void;
  loadFilter: (filterId: string) => SavedFilter | null;
  deleteFilter: (filterId: string) => void;
  updateFilter: (filterId: string, name: string, description: string) => void;
}