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
    selectedLevels?: string[];
    levelsOperator?: string;
    selectedInterval: string;
    intervalStartDate?: string;
    intervalEndDate?: string;
    selectedLabels: string[];
    labelsOperator: string;
    labelsCustomValue: string;
    selectedTags?: string[];
    tagsOperator?: string;
    tagsCustomValue?: string;
    selectedInputs?: string[];
    inputsOperator?: string;
    inputsCustomValue?: string;
    selectedOutputs?: string[];
    outputsOperator?: string;
    outputsCustomValue?: string;
    enabledValue?: string | null;
    selectedLocked?: string | null;
    selectedMissingSource?: string | null;
    selectedNamespaces: string[];
    namespaceOperator?: string;
    namespaceCustomValue?: string;
    selectedFlows: string[];
    selectedScopes: string[];
    selectedKinds: string[];
    selectedHierarchy: string;
    selectedInitialExecution: string;
    triggerIdOperator?: string;
    triggerIdValue?: string;
  };
}

export interface SavedFiltersContextType {
  savedFilters: SavedFilter[];
  saveFilter: (name: string, description: string, filterState: SavedFilter['filterState']) => void;
  loadFilter: (filterId: string) => SavedFilter | null;
  deleteFilter: (filterId: string) => void;
  updateFilter: (filterId: string, name: string, description: string) => void;
}
