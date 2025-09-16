import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, ChevronUp, RefreshCw, Settings } from "lucide-react";
import CustomizeFiltersButton from './CustomizeFiltersButton';
import ResetFiltersButton from './ResetFiltersButton';
import FilterBadge from './FilterBadge';
import FilterCustomizationPanel from './FilterCustomizationPanel';
import SearchBar from './SearchBar';
import TimeRangeSelector from './TimeRangeSelector';
import TablePropertiesPanel from './TablePropertiesPanel';
import StateFilterEditor from './StateFilterEditor';
import LabelsFilterEditor from './LabelsFilterEditor';
import NamespaceFilterEditor from './NamespaceFilterEditor';
import FlowFilterEditor from './FlowFilterEditor';
import ScopeFilterEditor from './ScopeFilterEditor';
import KindFilterEditor from './KindFilterEditor';
import SubflowFilterEditor from './SubflowFilterEditor';
import InitialExecutionFilterEditor from './InitialExecutionFilterEditor';
import TimeRangeFilterEditor from './TimeRangeFilterEditor';
import SaveFilterButton from './SaveFilterButton';
import SavedFiltersDropdown from './SavedFiltersDropdown';
import SaveFilterDialog from './SaveFilterDialog';
import { ColumnConfig, defaultColumns } from './ExecutionsTable';
import { SavedFilter } from '../types/savedFilters';

interface FilterOption {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  order: number;
}

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

interface FilterInterfaceProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeFilters: ActiveFilter[];
  onClearFilter: (filterId: string) => void;
  onEditFilter: (filterId: string) => void;
  onResetFilters: () => void;
  showChart: boolean;
  onToggleShowChart: (enabled: boolean) => void;
  periodicRefresh: boolean;
  onTogglePeriodicRefresh: (enabled: boolean) => void;
  onRefreshData: () => void;
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
  selectedStates: string[];
  onSelectedStatesChange: (states: string[]) => void;
  selectedTimeRange: string;
  timeRangeStartDate?: string;
  timeRangeEndDate?: string;
  onTimeRangeChange: (timeRange: string, startDate?: string, endDate?: string) => void;
  selectedLabels: string[];
  labelsOperator: string;
  labelsCustomValue: string;
  onLabelsSelectionChange: (labels: string[]) => void;
  onLabelsOperatorChange: (operator: string) => void;
  onLabelsCustomValueChange: (value: string) => void;
  selectedNamespaces: string[];
  onNamespacesSelectionChange: (namespaces: string[]) => void;
  selectedFlows: string[];
  onFlowsSelectionChange: (flows: string[]) => void;
  selectedScopes: string[];
  onScopesSelectionChange: (scopes: string[]) => void;
  selectedKinds: string[];
  onKindsSelectionChange: (kinds: string[]) => void;
  selectedSubflows: string[];
  onSubflowsSelectionChange: (subflows: string[]) => void;
  selectedInitialExecution: string;
  onInitialExecutionSelectionChange: (value: string) => void;
  savedFilters: SavedFilter[];
  onSaveFilter: (name: string, description: string) => void;
  onLoadFilter: (filter: SavedFilter) => void;
  onDeleteFilter: (filterId: string) => void;
  onUpdateFilter: (filterId: string, name: string, description: string) => void;
}

const defaultFilterOptions: FilterOption[] = [
  { id: 'state', label: 'State', description: 'Filter by execution state', enabled: false, order: 1 },
  { id: 'labels', label: 'Labels', description: 'Filter by execution labels', enabled: false, order: 2 },
  { id: 'namespace', label: 'Namespace', description: 'Filter by namespace', enabled: false, order: 3 },
  { id: 'flow', label: 'Flow', description: 'Filter by workflow name', enabled: false, order: 4 },
  { id: 'scope', label: 'Scope', description: 'Filter by execution scope', enabled: true, order: 5 },
  { id: 'kind', label: 'Kind', description: 'Filter by execution type', enabled: true, order: 6 },
  { id: 'subflow', label: 'Subflow', description: 'Filter by subflow name', enabled: false, order: 7 },
  { id: 'initial-execution', label: 'Parent Execution ID', description: 'Filter by parent execution ID', enabled: false, order: 8 },
  { id: 'timerange', label: 'Time range', description: 'Filter by execution time', enabled: true, order: 9 },
];

export default function FilterInterface({
  searchValue,
  onSearchChange,
  activeFilters,
  onClearFilter,
  onEditFilter,
  onResetFilters,
  showChart,
  onToggleShowChart,
  periodicRefresh,
  onTogglePeriodicRefresh,
  onRefreshData,
  columns,
  onColumnsChange,
  selectedStates,
  onSelectedStatesChange,
  selectedTimeRange,
  timeRangeStartDate,
  timeRangeEndDate,
  onTimeRangeChange,
  selectedLabels,
  labelsOperator,
  labelsCustomValue,
  onLabelsSelectionChange,
  onLabelsOperatorChange,
  onLabelsCustomValueChange,
  selectedNamespaces,
  onNamespacesSelectionChange,
  selectedFlows,
  onFlowsSelectionChange,
  selectedScopes,
  onScopesSelectionChange,
  selectedKinds,
  onKindsSelectionChange,
  selectedSubflows,
  onSubflowsSelectionChange,
  selectedInitialExecution,
  onInitialExecutionSelectionChange,
  savedFilters,
  onSaveFilter,
  onLoadFilter,
  onDeleteFilter,
  onUpdateFilter
}: FilterInterfaceProps) {
  const [customizationOpen, setCustomizationOpen] = useState(false);
  const [tableOptionsOpen, setTableOptionsOpen] = useState(false);
  const [tablePropertiesOpen, setTablePropertiesOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState(defaultFilterOptions);
  const [stateFilterOpen, setStateFilterOpen] = useState(false);
  const [labelsFilterOpen, setLabelsFilterOpen] = useState(false);
  const [namespaceFilterOpen, setNamespaceFilterOpen] = useState(false);
  const [flowFilterOpen, setFlowFilterOpen] = useState(false);
  const [scopeFilterOpen, setScopeFilterOpen] = useState(false);
  const [kindFilterOpen, setKindFilterOpen] = useState(false);
  const [subflowFilterOpen, setSubflowFilterOpen] = useState(false);
  const [initialExecutionFilterOpen, setInitialExecutionFilterOpen] = useState(false);
  const [timeRangeFilterOpen, setTimeRangeFilterOpen] = useState(false);
  const [saveFilterDialogOpen, setSaveFilterDialogOpen] = useState(false);
  const [editFilterDialogOpen, setEditFilterDialogOpen] = useState(false);
  const [editingFilterId, setEditingFilterId] = useState<string | null>(null);
  
  // Dynamic wrapping state
  const [firstRowFilters, setFirstRowFilters] = useState<ActiveFilter[]>([]);
  const [secondRowFilters, setSecondRowFilters] = useState<ActiveFilter[]>([]);
  
  // Refs for measuring widths
  const firstRowContainerRef = useRef<HTMLDivElement>(null);
  const measurementContainerRef = useRef<HTMLDivElement>(null);

  const handleColumnToggle = (columnId: string) => {
    const updatedColumns = columns.map(col => 
      col.id === columnId 
        ? { ...col, visible: !col.visible }
        : col
    );
    onColumnsChange(updatedColumns);
  };

  const handleColumnReorder = (draggedId: string, targetId: string) => {
    const draggedIndex = columns.findIndex(col => col.id === draggedId);
    const targetIndex = columns.findIndex(col => col.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newColumns = [...columns];
    const [draggedColumn] = newColumns.splice(draggedIndex, 1);
    newColumns.splice(targetIndex, 0, draggedColumn);

    // Update order numbers
    const reorderedColumns = newColumns.map((col, index) => ({
      ...col,
      order: index + 1
    }));

    onColumnsChange(reorderedColumns);
  };

  // Close table properties panel when table options collapse
  const handleTableOptionsToggle = () => {
    const newState = !tableOptionsOpen;
    setTableOptionsOpen(newState);
    if (!newState) {
      setTablePropertiesOpen(false);
    }
  };

  const handleToggleFilter = (filterId: string) => {
    setFilterOptions(prev => 
      prev.map(option => 
        option.id === filterId 
          ? { ...option, enabled: !option.enabled }
          : option
      )
    );
    
    // Auto-open editors when filters are enabled
    if (filterId === 'state') {
      const filterOption = filterOptions.find(option => option.id === 'state');
      if (filterOption && !filterOption.enabled) {
        setStateFilterOpen(true);
      }
    } else if (filterId === 'labels') {
      const filterOption = filterOptions.find(option => option.id === 'labels');
      if (filterOption && !filterOption.enabled) {
        setLabelsFilterOpen(true);
      }
    } else if (filterId === 'namespace') {
      const filterOption = filterOptions.find(option => option.id === 'namespace');
      if (filterOption && !filterOption.enabled) {
        setNamespaceFilterOpen(true);
      }
    } else if (filterId === 'flow') {
      const filterOption = filterOptions.find(option => option.id === 'flow');
      if (filterOption && !filterOption.enabled) {
        setFlowFilterOpen(true);
      }
    } else if (filterId === 'scope') {
      const filterOption = filterOptions.find(option => option.id === 'scope');
      if (filterOption && !filterOption.enabled) {
        setScopeFilterOpen(true);
      }
    } else if (filterId === 'kind') {
      const filterOption = filterOptions.find(option => option.id === 'kind');
      if (filterOption && !filterOption.enabled) {
        setKindFilterOpen(true);
      }
    } else if (filterId === 'subflow') {
      const filterOption = filterOptions.find(option => option.id === 'subflow');
      if (filterOption && !filterOption.enabled) {
        setSubflowFilterOpen(true);
      }
    } else if (filterId === 'initial-execution') {
      const filterOption = filterOptions.find(option => option.id === 'initial-execution');
      if (filterOption && !filterOption.enabled) {
        setInitialExecutionFilterOpen(true);
      }
    }
  };

  const handleFilterReorder = (draggedId: string, targetId: string) => {
    const draggedIndex = filterOptions.findIndex(option => option.id === draggedId);
    const targetIndex = filterOptions.findIndex(option => option.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newFilterOptions = [...filterOptions];
    const [draggedFilter] = newFilterOptions.splice(draggedIndex, 1);
    newFilterOptions.splice(targetIndex, 0, draggedFilter);

    // Update order numbers
    const reorderedFilters = newFilterOptions.map((option, index) => ({
      ...option,
      order: index + 1
    }));

    setFilterOptions(reorderedFilters);
  };

  const handleEditFilter = (filterId: string) => {
    if (filterId === 'state') {
      setStateFilterOpen(true);
    } else if (filterId === 'labels') {
      setLabelsFilterOpen(true);
    } else if (filterId === 'namespace') {
      setNamespaceFilterOpen(true);
    } else if (filterId === 'flow') {
      setFlowFilterOpen(true);
    } else if (filterId === 'scope') {
      setScopeFilterOpen(true);
    } else if (filterId === 'kind') {
      setKindFilterOpen(true);
    } else if (filterId === 'subflow') {
      setSubflowFilterOpen(true);
    } else if (filterId === 'initial-execution') {
      setInitialExecutionFilterOpen(true);
    } else if (filterId === 'timerange') {
      setTimeRangeFilterOpen(true);
    }
    onEditFilter(filterId);
  };

  const handleStateSelectionChange = (states: string[]) => {
    onSelectedStatesChange(states);
  };

  const handleCloseStateFilter = () => {
    setStateFilterOpen(false);
  };

  const handleLabelsSelectionChange = (labels: string[]) => {
    onLabelsSelectionChange(labels);
  };

  const handleLabelsOperatorChange = (operator: string) => {
    onLabelsOperatorChange(operator);
  };

  const handleLabelsCustomValueChange = (value: string) => {
    onLabelsCustomValueChange(value);
  };

  const handleCloseLabelsFilter = () => {
    setLabelsFilterOpen(false);
  };

  const handleNamespacesSelectionChange = (namespaces: string[]) => {
    onNamespacesSelectionChange(namespaces);
  };

  const handleFlowsSelectionChange = (flows: string[]) => {
    onFlowsSelectionChange(flows);
  };

  const handleScopesSelectionChange = (scopes: string[]) => {
    onScopesSelectionChange(scopes);
  };

  const handleKindsSelectionChange = (kinds: string[]) => {
    onKindsSelectionChange(kinds);
  };

  const handleSubflowsSelectionChange = (subflows: string[]) => {
    onSubflowsSelectionChange(subflows);
  };

  const handleInitialExecutionSelectionChange = (value: string) => {
    onInitialExecutionSelectionChange(value);
  };

  // Save filter handlers
  const handleSaveFilterClick = () => {
    setSaveFilterDialogOpen(true);
  };

  const handleSaveFilterSubmit = (name: string, description: string) => {
    // Check for duplicate names
    const duplicateFilter = savedFilters.find(f => f.name.toLowerCase() === name.toLowerCase());
    if (duplicateFilter) {
      throw new Error('A filter with this name already exists. Please choose a different name.');
    }
    onSaveFilter(name, description);
    setSaveFilterDialogOpen(false);
  };

  const handleEditFilterSubmit = (name: string, description: string) => {
    if (!editingFilterId) return;
    
    // Check for duplicate names (excluding the filter being edited)
    const duplicateFilter = savedFilters.find(f => 
      f.name.toLowerCase() === name.toLowerCase() && f.id !== editingFilterId
    );
    if (duplicateFilter) {
      throw new Error('A filter with this name already exists. Please choose a different name.');
    }
    
    onUpdateFilter(editingFilterId, name, description);
    setEditFilterDialogOpen(false);
    setEditingFilterId(null);
  };

  const handleEditSavedFilter = (filterId: string) => {
    const filterToEdit = savedFilters.find(f => f.id === filterId);
    if (filterToEdit) {
      setEditingFilterId(filterId);
      setEditFilterDialogOpen(true);
    }
  };

  const handleCloseNamespaceFilter = () => {
    setNamespaceFilterOpen(false);
  };

  const handleTimeRangeChange = (timeRange: string, startDate?: string, endDate?: string) => {
    onTimeRangeChange(timeRange, startDate, endDate);
  };

  const handleCloseTimeRangeFilter = () => {
    setTimeRangeFilterOpen(false);
  };

  const handleCloseFlowFilter = () => {
    setFlowFilterOpen(false);
  };

  const handleCloseScopeFilter = () => {
    setScopeFilterOpen(false);
  };

  const handleCloseKindFilter = () => {
    setKindFilterOpen(false);
  };

  const handleCloseSubflowFilter = () => {
    setSubflowFilterOpen(false);
  };

  const handleCloseInitialExecutionFilter = () => {
    setInitialExecutionFilterOpen(false);
  };

  // Get all filters that have data OR are enabled for display
  const allAvailableFilters = [...activeFilters];
  
  // Add placeholder filters for enabled options that don't have data yet
  filterOptions
    .filter(option => option.enabled)
    .forEach(option => {
      if (!activeFilters.find(filter => filter.id === option.id)) {
        // Add placeholder filter for enabled options without data
        allAvailableFilters.push({
          id: option.id,
          label: option.label,
          value: 'Configure',
          operator: 'in'
        });
      }
    });
  
  const enabledFilters = allAvailableFilters
    .sort((a, b) => {
      const aOption = filterOptions.find(opt => opt.id === a.id);
      const bOption = filterOptions.find(opt => opt.id === b.id);
      return (aOption?.order || 999) - (bOption?.order || 999);
    });

  // Dynamic filter wrapping calculation
  const calculateFilterDistribution = useCallback((availableWidth: number, filters: ActiveFilter[]) => {
    if (!measurementContainerRef.current || filters.length === 0) {
      setFirstRowFilters(filters.slice(0, 2)); // Fallback to basic logic
      setSecondRowFilters(filters.slice(2));
      return;
    }

    // Measure filter badge widths by temporarily rendering them
    const measurementContainer = measurementContainerRef.current;
    measurementContainer.innerHTML = '';
    
    let totalWidth = 0;
    let firstRowCount = 0;
    const gap = 8; // 2 (0.5rem gap between badges)
    
    for (let i = 0; i < filters.length; i++) {
      const filter = filters[i];
      
      // Create temporary badge element for measurement
      const tempBadge = document.createElement('div');
      tempBadge.className = 'inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium bg-secondary border border-border gap-1.5 whitespace-nowrap';
      tempBadge.style.visibility = 'hidden';
      tempBadge.style.position = 'absolute';
      tempBadge.innerHTML = `
        <span class="text-green-600 font-semibold">${filter.operator || 'in'}</span>
        <span class="text-foreground">${filter.value}</span>
        <button class="ml-1 text-xs opacity-70 hover:opacity-100">×</button>
        <button class="ml-1 text-xs opacity-70 hover:opacity-100">✎</button>
      `;
      
      measurementContainer.appendChild(tempBadge);
      const badgeWidth = tempBadge.offsetWidth;
      measurementContainer.removeChild(tempBadge);
      
      const newTotalWidth = totalWidth + badgeWidth + (i > 0 ? gap : 0);
      
      if (newTotalWidth <= availableWidth || i === 0) {
        // Filter fits in first row (always include at least one filter)
        totalWidth = newTotalWidth;
        firstRowCount = i + 1;
      } else {
        // Filter doesn't fit, stop here
        break;
      }
    }
    
    setFirstRowFilters(filters.slice(0, firstRowCount));
    setSecondRowFilters(filters.slice(firstRowCount));
  }, []);

  // ResizeObserver to watch container size changes
  useEffect(() => {
    if (!firstRowContainerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const availableWidth = entry.contentRect.width - 200; // Much more aggressive wrapping to prevent overlap
        calculateFilterDistribution(availableWidth, enabledFilters);
      }
    });

    resizeObserver.observe(firstRowContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [calculateFilterDistribution, enabledFilters]);

  // Update filter distribution when enabledFilters change
  useEffect(() => {
    if (firstRowContainerRef.current) {
      const availableWidth = firstRowContainerRef.current.offsetWidth - 200; // Much more aggressive wrapping to prevent overlap
      calculateFilterDistribution(availableWidth, enabledFilters);
    }
  }, [enabledFilters, calculateFilterDistribution]);

  return (
    <div className="relative">
      
      {/* First Row */}
      <div className="flex items-center gap-3 p-4">
        {/* Left Section: Control buttons and search */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Customize Filters Button */}
          <Popover open={customizationOpen} onOpenChange={setCustomizationOpen}>
            <PopoverTrigger asChild>
              <div>
                <CustomizeFiltersButton
                  onClick={() => setCustomizationOpen(!customizationOpen)}
                  isOpen={customizationOpen}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" className="w-80 p-0">
              <FilterCustomizationPanel
                isOpen={true}
                filterOptions={filterOptions}
                onToggleFilter={handleToggleFilter}
                onReorderFilters={handleFilterReorder}
                onClose={() => setCustomizationOpen(false)}
              />
            </PopoverContent>
          </Popover>

          {/* Reset Button */}
          <ResetFiltersButton
            onClick={onResetFilters}
          />

          {/* Search Bar */}
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search executions..."
          />
        </div>

        {/* Middle Section: Filter Badges with guaranteed space */}
        <div className="flex-1 min-w-0 pr-8" style={{maxWidth: 'calc(100% - 500px)'}}>
          <div ref={firstRowContainerRef} className="flex items-center gap-2 overflow-hidden">
            {firstRowFilters.map((filter) => {
            // State Filter with Popover
            if (filter.id === 'state') {
              return (
                <Popover key={filter.id} open={stateFilterOpen} onOpenChange={setStateFilterOpen}>
                  <PopoverTrigger asChild>
                    <div className="flex-shrink-0">
                      <FilterBadge
                        label={filter.label}
                        value={filter.value}
                        operator={filter.operator || "in"}
                        onClear={() => onClearFilter(filter.id)}
                        onEdit={() => handleEditFilter(filter.id)}
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" align="start" className="w-80 p-0">
                    <StateFilterEditor
                      selectedStates={selectedStates}
                      onSelectionChange={handleStateSelectionChange}
                      onClose={handleCloseStateFilter}
                    />
                  </PopoverContent>
                </Popover>
              );
            }
            // Labels Filter with Popover
            else if (filter.id === 'labels') {
              return (
                <Popover key={filter.id} open={labelsFilterOpen} onOpenChange={setLabelsFilterOpen}>
                  <PopoverTrigger asChild>
                    <div className="flex-shrink-0">
                      <FilterBadge
                        label={filter.label}
                        value={filter.value}
                        operator={filter.operator || "in"}
                        onClear={() => onClearFilter(filter.id)}
                        onEdit={() => handleEditFilter(filter.id)}
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" align="start" className="w-80 p-0">
                    <LabelsFilterEditor
                      selectedLabels={selectedLabels}
                      selectedOperator={labelsOperator}
                      customValue={labelsCustomValue}
                      onSelectionChange={handleLabelsSelectionChange}
                      onOperatorChange={handleLabelsOperatorChange}
                      onCustomValueChange={handleLabelsCustomValueChange}
                      onClose={handleCloseLabelsFilter}
                    />
                  </PopoverContent>
                </Popover>
              );
            }
            // Namespace Filter with Popover
            else if (filter.id === 'namespace') {
              return (
                <Popover key={filter.id} open={namespaceFilterOpen} onOpenChange={setNamespaceFilterOpen}>
                  <PopoverTrigger asChild>
                    <div className="flex-shrink-0">
                      <FilterBadge
                        label={filter.label}
                        value={filter.value}
                        operator={filter.operator || "in"}
                        onClear={() => onClearFilter(filter.id)}
                        onEdit={() => handleEditFilter(filter.id)}
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" align="start" className="w-80 p-0">
                    <NamespaceFilterEditor
                      selectedNamespaces={selectedNamespaces}
                      onSelectionChange={handleNamespacesSelectionChange}
                      onClose={handleCloseNamespaceFilter}
                    />
                  </PopoverContent>
                </Popover>
              );
            }
            // Flow Filter with Popover
            else if (filter.id === 'flow') {
              return (
                <Popover key={filter.id} open={flowFilterOpen} onOpenChange={setFlowFilterOpen}>
                  <PopoverTrigger asChild>
                    <div className="flex-shrink-0">
                      <FilterBadge
                        label={filter.label}
                        value={filter.value}
                        operator={filter.operator || "in"}
                        onClear={() => onClearFilter(filter.id)}
                        onEdit={() => handleEditFilter(filter.id)}
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" align="start" className="w-80 p-0">
                    <FlowFilterEditor
                      selectedFlows={selectedFlows}
                      onSelectionChange={handleFlowsSelectionChange}
                      onClose={handleCloseFlowFilter}
                    />
                  </PopoverContent>
                </Popover>
              );
            }
            // Scope Filter with Popover
            else if (filter.id === 'scope') {
              return (
                <Popover key={filter.id} open={scopeFilterOpen} onOpenChange={setScopeFilterOpen}>
                  <PopoverTrigger asChild>
                    <div className="flex-shrink-0">
                      <FilterBadge
                        label={filter.label}
                        value={filter.value}
                        operator={filter.operator || "in"}
                        onClear={() => onClearFilter(filter.id)}
                        onEdit={() => handleEditFilter(filter.id)}
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" align="start" className="w-80 p-0">
                    <ScopeFilterEditor
                      selectedScopes={selectedScopes}
                      onSelectionChange={handleScopesSelectionChange}
                      onClose={handleCloseScopeFilter}
                    />
                  </PopoverContent>
                </Popover>
              );
            }
            // Kind Filter with Popover
            else if (filter.id === 'kind') {
              return (
                <Popover key={filter.id} open={kindFilterOpen} onOpenChange={setKindFilterOpen}>
                  <PopoverTrigger asChild>
                    <div className="flex-shrink-0">
                      <FilterBadge
                        label={filter.label}
                        value={filter.value}
                        operator={filter.operator || "in"}
                        onClear={() => onClearFilter(filter.id)}
                        onEdit={() => handleEditFilter(filter.id)}
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" align="start" className="w-80 p-0">
                    <KindFilterEditor
                      selectedKinds={selectedKinds}
                      onSelectionChange={handleKindsSelectionChange}
                      onClose={handleCloseKindFilter}
                    />
                  </PopoverContent>
                </Popover>
              );
            }
            // Subflow Filter with Popover
            else if (filter.id === 'subflow') {
              return (
                <Popover key={filter.id} open={subflowFilterOpen} onOpenChange={setSubflowFilterOpen}>
                  <PopoverTrigger asChild>
                    <div className="flex-shrink-0">
                      <FilterBadge
                        label={filter.label}
                        value={filter.value}
                        operator={filter.operator || "in"}
                        onClear={() => onClearFilter(filter.id)}
                        onEdit={() => handleEditFilter(filter.id)}
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" align="start" className="w-80 p-0">
                    <SubflowFilterEditor
                      selectedSubflows={selectedSubflows}
                      onSelectionChange={handleSubflowsSelectionChange}
                      onClose={handleCloseSubflowFilter}
                    />
                  </PopoverContent>
                </Popover>
              );
            }
            // Initial Execution Filter with Popover
            else if (filter.id === 'initial-execution') {
              return (
                <Popover key={filter.id} open={initialExecutionFilterOpen} onOpenChange={setInitialExecutionFilterOpen}>
                  <PopoverTrigger asChild>
                    <div className="flex-shrink-0">
                      <FilterBadge
                        label={filter.label}
                        value={filter.value}
                        operator={filter.operator || "in"}
                        onClear={() => onClearFilter(filter.id)}
                        onEdit={() => handleEditFilter(filter.id)}
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" align="start" className="w-80 p-0">
                    <InitialExecutionFilterEditor
                      selectedInitialExecution={selectedInitialExecution}
                      onSelectionChange={handleInitialExecutionSelectionChange}
                      onClose={handleCloseInitialExecutionFilter}
                    />
                  </PopoverContent>
                </Popover>
              );
            }
            // Time Range Filter with Popover
            else if (filter.id === 'timerange') {
              return (
                <Popover key={filter.id} open={timeRangeFilterOpen} onOpenChange={setTimeRangeFilterOpen}>
                  <PopoverTrigger asChild>
                    <div className="flex-shrink-0">
                      <FilterBadge
                        label={filter.label}
                        value={filter.value}
                        operator={filter.operator || "in"}
                        onClear={() => onClearFilter(filter.id)}
                        onEdit={() => handleEditFilter(filter.id)}
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" align="start" className="w-80 p-0">
                    <TimeRangeFilterEditor
                      selectedTimeRange={selectedTimeRange}
                      startDate={timeRangeStartDate}
                      endDate={timeRangeEndDate}
                      onTimeRangeChange={handleTimeRangeChange}
                      onClose={handleCloseTimeRangeFilter}
                    />
                  </PopoverContent>
                </Popover>
              );
            }
            // Default case - just render the badge without popover
            else {
              return (
                <div key={filter.id} className="flex-shrink-0">
                  <FilterBadge
                    label={filter.label}
                    value={filter.value}
                    operator={filter.operator || "in"}
                    onClear={() => onClearFilter(filter.id)}
                    onEdit={() => handleEditFilter(filter.id)}
                  />
                </div>
              );
            }
          })}
          </div>
        </div>

        {/* Right Section: Save Filter, Saved Filters, and Table Options - Protected from overlap */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
          {/* Save Filter Button */}
          <SaveFilterButton
            onClick={handleSaveFilterClick}
          />

          {/* Saved Filters Dropdown */}
          <SavedFiltersDropdown
            savedFilters={savedFilters}
            onLoadFilter={onLoadFilter}
            onDeleteFilter={onDeleteFilter}
            onEditFilter={handleEditSavedFilter}
          />
          
          {/* Table Options Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTableOptionsToggle}
            className="flex items-center gap-2 text-muted-foreground hover-elevate"
            data-testid="button-toggle-table-options"
          >
            {tableOptionsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Table options
          </Button>
        </div>
      </div>

      {/* Second Row - Additional filters that don't fit in first row */}
      {secondRowFilters.length > 0 && (
        <div className="px-4 py-2 bg-card/20">
          <div className="flex items-center gap-2 flex-wrap">
            {secondRowFilters.map((filter) => {
              // State Filter with Popover
              if (filter.id === 'state') {
                return (
                  <Popover key={filter.id} open={stateFilterOpen} onOpenChange={setStateFilterOpen}>
                    <PopoverTrigger asChild>
                      <div className="flex-shrink-0">
                        <FilterBadge
                          label={filter.label}
                          value={filter.value}
                          operator={filter.operator || "in"}
                          onClear={() => onClearFilter(filter.id)}
                          onEdit={() => handleEditFilter(filter.id)}
                        />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" align="start" className="w-80 p-0">
                      <StateFilterEditor
                        selectedStates={selectedStates}
                        onSelectionChange={handleStateSelectionChange}
                        onClose={handleCloseStateFilter}
                      />
                    </PopoverContent>
                  </Popover>
                );
              }
              // Labels Filter with Popover
              else if (filter.id === 'labels') {
                return (
                  <Popover key={filter.id} open={labelsFilterOpen} onOpenChange={setLabelsFilterOpen}>
                    <PopoverTrigger asChild>
                      <div className="flex-shrink-0">
                        <FilterBadge
                          label={filter.label}
                          value={filter.value}
                          operator={filter.operator || "in"}
                          onClear={() => onClearFilter(filter.id)}
                          onEdit={() => handleEditFilter(filter.id)}
                        />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" align="start" className="w-80 p-0">
                      <LabelsFilterEditor
                        selectedLabels={selectedLabels}
                        selectedOperator={labelsOperator}
                        customValue={labelsCustomValue}
                        onSelectionChange={handleLabelsSelectionChange}
                        onOperatorChange={handleLabelsOperatorChange}
                        onCustomValueChange={handleLabelsCustomValueChange}
                        onClose={handleCloseLabelsFilter}
                      />
                    </PopoverContent>
                  </Popover>
                );
              }
              // Namespace Filter with Popover
              else if (filter.id === 'namespace') {
                return (
                  <Popover key={filter.id} open={namespaceFilterOpen} onOpenChange={setNamespaceFilterOpen}>
                    <PopoverTrigger asChild>
                      <div className="flex-shrink-0">
                        <FilterBadge
                          label={filter.label}
                          value={filter.value}
                          operator={filter.operator || "in"}
                          onClear={() => onClearFilter(filter.id)}
                          onEdit={() => handleEditFilter(filter.id)}
                        />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" align="start" className="w-80 p-0">
                      <NamespaceFilterEditor
                        selectedNamespaces={selectedNamespaces}
                        onSelectionChange={handleNamespacesSelectionChange}
                        onClose={handleCloseNamespaceFilter}
                      />
                    </PopoverContent>
                  </Popover>
                );
              }
              // Flow Filter with Popover
              else if (filter.id === 'flow') {
                return (
                  <Popover key={filter.id} open={flowFilterOpen} onOpenChange={setFlowFilterOpen}>
                    <PopoverTrigger asChild>
                      <div className="flex-shrink-0">
                        <FilterBadge
                          label={filter.label}
                          value={filter.value}
                          operator={filter.operator || "in"}
                          onClear={() => onClearFilter(filter.id)}
                          onEdit={() => handleEditFilter(filter.id)}
                        />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" align="start" className="w-80 p-0">
                      <FlowFilterEditor
                        selectedFlows={selectedFlows}
                        onSelectionChange={handleFlowsSelectionChange}
                        onClose={handleCloseFlowFilter}
                      />
                    </PopoverContent>
                  </Popover>
                );
              }
              // Scope Filter with Popover
              else if (filter.id === 'scope') {
                return (
                  <Popover key={filter.id} open={scopeFilterOpen} onOpenChange={setScopeFilterOpen}>
                    <PopoverTrigger asChild>
                      <div className="flex-shrink-0">
                        <FilterBadge
                          label={filter.label}
                          value={filter.value}
                          operator={filter.operator || "in"}
                          onClear={() => onClearFilter(filter.id)}
                          onEdit={() => handleEditFilter(filter.id)}
                        />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" align="start" className="w-80 p-0">
                      <ScopeFilterEditor
                        selectedScopes={selectedScopes}
                        onSelectionChange={handleScopesSelectionChange}
                        onClose={handleCloseScopeFilter}
                      />
                    </PopoverContent>
                  </Popover>
                );
              }
              // Kind Filter with Popover
              else if (filter.id === 'kind') {
                return (
                  <Popover key={filter.id} open={kindFilterOpen} onOpenChange={setKindFilterOpen}>
                    <PopoverTrigger asChild>
                      <div className="flex-shrink-0">
                        <FilterBadge
                          label={filter.label}
                          value={filter.value}
                          operator={filter.operator || "in"}
                          onClear={() => onClearFilter(filter.id)}
                          onEdit={() => handleEditFilter(filter.id)}
                        />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" align="start" className="w-80 p-0">
                      <KindFilterEditor
                        selectedKinds={selectedKinds}
                        onSelectionChange={handleKindsSelectionChange}
                        onClose={handleCloseKindFilter}
                      />
                    </PopoverContent>
                  </Popover>
                );
              }
              // Subflow Filter with Popover
              else if (filter.id === 'subflow') {
                return (
                  <Popover key={filter.id} open={subflowFilterOpen} onOpenChange={setSubflowFilterOpen}>
                    <PopoverTrigger asChild>
                      <div className="flex-shrink-0">
                        <FilterBadge
                          label={filter.label}
                          value={filter.value}
                          operator={filter.operator || "in"}
                          onClear={() => onClearFilter(filter.id)}
                          onEdit={() => handleEditFilter(filter.id)}
                        />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" align="start" className="w-80 p-0">
                      <SubflowFilterEditor
                        selectedSubflows={selectedSubflows}
                        onSelectionChange={handleSubflowsSelectionChange}
                        onClose={handleCloseSubflowFilter}
                      />
                    </PopoverContent>
                  </Popover>
                );
              }
              // Initial Execution Filter with Popover
              else if (filter.id === 'initial-execution') {
                return (
                  <Popover key={filter.id} open={initialExecutionFilterOpen} onOpenChange={setInitialExecutionFilterOpen}>
                    <PopoverTrigger asChild>
                      <div className="flex-shrink-0">
                        <FilterBadge
                          label={filter.label}
                          value={filter.value}
                          operator={filter.operator || "in"}
                          onClear={() => onClearFilter(filter.id)}
                          onEdit={() => handleEditFilter(filter.id)}
                        />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" align="start" className="w-80 p-0">
                      <InitialExecutionFilterEditor
                        selectedInitialExecution={selectedInitialExecution}
                        onSelectionChange={handleInitialExecutionSelectionChange}
                        onClose={handleCloseInitialExecutionFilter}
                      />
                    </PopoverContent>
                  </Popover>
                );
              }
              // Time Range Filter with Popover
              else if (filter.id === 'timerange') {
                return (
                  <Popover key={filter.id} open={timeRangeFilterOpen} onOpenChange={setTimeRangeFilterOpen}>
                    <PopoverTrigger asChild>
                      <div className="flex-shrink-0">
                        <FilterBadge
                          label={filter.label}
                          value={filter.value}
                          operator={filter.operator || "in"}
                          onClear={() => onClearFilter(filter.id)}
                          onEdit={() => handleEditFilter(filter.id)}
                        />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" align="start" className="w-80 p-0">
                      <TimeRangeFilterEditor
                        selectedTimeRange={selectedTimeRange}
                        startDate={timeRangeStartDate}
                        endDate={timeRangeEndDate}
                        onTimeRangeChange={handleTimeRangeChange}
                        onClose={handleCloseTimeRangeFilter}
                      />
                    </PopoverContent>
                  </Popover>
                );
              }
              // Default case - just render the badge without popover
              else {
                return (
                  <div key={filter.id} className="flex-shrink-0">
                    <FilterBadge
                      label={filter.label}
                      value={filter.value}
                      operator={filter.operator || "in"}
                      onClear={() => onClearFilter(filter.id)}
                      onEdit={() => handleEditFilter(filter.id)}
                    />
                  </div>
                );
              }
            })}
          </div>
        </div>
      )}

      {/* Table Options Panel */}
      {tableOptionsOpen && (
        <div className="px-4 py-3 border-b border-border bg-card/30">
          <div className="flex items-center justify-between">
            {/* Show Chart - Left side */}
            <div className="flex items-center gap-2">
              <Switch
                id="show-chart"
                checked={showChart}
                onCheckedChange={onToggleShowChart}
                data-testid="switch-show-chart"
              />
              <Label htmlFor="show-chart" className="text-sm cursor-pointer">
                Show Chart
              </Label>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-6">
              {/* Periodic Refresh */}
              <div className="flex items-center gap-2">
                <Switch
                  id="periodic-refresh"
                  checked={periodicRefresh}
                  onCheckedChange={onTogglePeriodicRefresh}
                  data-testid="switch-periodic-refresh"
                />
                <Label htmlFor="periodic-refresh" className="text-sm cursor-pointer">
                  Periodic refresh
                </Label>
              </div>

              {/* Refresh Data Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefreshData}
                className="flex items-center gap-2 hover-elevate"
                data-testid="button-refresh-data"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh data
              </Button>

              {/* Columns Button */}
              <Popover open={tablePropertiesOpen} onOpenChange={setTablePropertiesOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 hover-elevate"
                    data-testid="button-columns"
                  >
                    <Settings className="h-4 w-4" />
                    Columns
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="end" className="w-96 p-0">
                  <TablePropertiesPanel
                    isOpen={true}
                    onClose={() => setTablePropertiesOpen(false)}
                    columns={columns}
                    onToggleColumn={handleColumnToggle}
                    onReorderColumns={handleColumnReorder}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      )}


      {/* Save Filter Dialog */}
      <SaveFilterDialog
        isOpen={saveFilterDialogOpen}
        onClose={() => setSaveFilterDialogOpen(false)}
        onSave={handleSaveFilterSubmit}
      />

      {/* Edit Filter Dialog */}
      <SaveFilterDialog
        key={`edit-${editingFilterId ?? 'none'}`}
        isOpen={editFilterDialogOpen}
        onClose={() => {
          setEditFilterDialogOpen(false);
          setEditingFilterId(null);
        }}
        onSave={handleEditFilterSubmit}
        initialName={editingFilterId ? savedFilters.find(f => f.id === editingFilterId)?.name || '' : ''}
        initialDescription={editingFilterId ? savedFilters.find(f => f.id === editingFilterId)?.description || '' : ''}
      />


      {/* Hidden measurement container for filter badge width calculation */}
      <div 
        ref={measurementContainerRef}
        className="fixed top-0 left-0 pointer-events-none z-[-1]"
        aria-hidden="true"
      />
    </div>
  );
}