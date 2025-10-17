import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, ChevronUp, RefreshCw, Settings, Sliders } from "lucide-react";
import CustomizeFiltersButton from './CustomizeFiltersButton';
import ResetFiltersButton from './ResetFiltersButton';
import FilterBadge from './FilterBadge';
import FilterCustomizationPanel from './FilterCustomizationPanel';
import SearchBar from './SearchBar';
import TimeRangeSelector from './TimeRangeSelector';
import TablePropertiesPanel from './TablePropertiesPanel';
import StateFilterEditor, { type StateOption } from './StateFilterEditor';
import LabelsFilterEditor from './LabelsFilterEditor';
import InputsFilterEditor from './InputsFilterEditor';
import OutputsFilterEditor from './OutputsFilterEditor';
import NamespaceFilterEditor from './NamespaceFilterEditor';
import FlowFilterEditor, { type FlowOption } from './FlowFilterEditor';
import ScopeFilterEditor, { type ScopeOption } from './ScopeFilterEditor';
import KindFilterEditor from './KindFilterEditor';
import HierarchyFilterEditor from './SubflowFilterEditor';
import ParentFilterEditor from './ParentFilterEditor';
import IntervalFilterEditor from './TimeRangeFilterEditor';
import SaveFilterButton from './SaveFilterButton';
import SavedFiltersDropdown from './SavedFiltersDropdown';
import SaveFilterDialog from './SaveFilterDialog';
import { defaultColumns } from './ExecutionsTable';
import type { ColumnConfig } from '../types/savedFilters';
import { SavedFilter } from '../types/savedFilters';
import { filterCustomizationStorage } from '../utils/filterCustomizationStorage';
import TagsFilterEditor, { type TagOption } from './TagsFilterEditor';
import EnabledFilterEditor, { type EnabledOption } from './EnabledFilterEditor';
import TriggerIdFilterEditor from './TriggerIdFilterEditor';
import ActorFilterEditor from './ActorFilterEditor';
import ActionFilterEditor from './ActionFilterEditor';
import ResourceFilterEditor from './ResourceFilterEditor';
import DetailsFilterEditor from './DetailsFilterEditor';
import type { DetailFilter } from "@/types/auditLogs";
import MultiSelectFilterEditor, { type MultiSelectOption } from './MultiSelectFilterEditor';

export interface FilterOption {
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
  statesOperator: string;
  onSelectedStatesChange: (states: string[]) => void;
  onStatesOperatorChange: (operator: string) => void;
  selectedLevels?: string[];
  levelsOperator?: string;
  onLevelsSelectionChange?: (levels: string[]) => void;
  onLevelsOperatorChange?: (operator: string) => void;
  selectedInterval: string;
  intervalStartDate?: string;
  intervalEndDate?: string;
  onIntervalChange: (interval: string, startDate?: string, endDate?: string) => void;
  selectedLabels: string[];
  labelsOperator: string;
  labelsCustomValue: string;
  onLabelsSelectionChange: (labels: string[]) => void;
  onLabelsOperatorChange: (operator: string) => void;
  onLabelsCustomValueChange: (value: string) => void;
  selectedInputs: string[];
  inputsOperator: string;
  inputsCustomValue: string;
  onInputsSelectionChange: (inputs: string[]) => void;
  onInputsOperatorChange: (operator: string) => void;
  onInputsCustomValueChange: (value: string) => void;
  selectedOutputs: string[];
  outputsOperator: string;
  outputsCustomValue: string;
  onOutputsSelectionChange: (outputs: string[]) => void;
  onOutputsOperatorChange: (operator: string) => void;
  onOutputsCustomValueChange: (value: string) => void;
  selectedNamespaces: string[];
  namespaceOperator: string;
  namespaceCustomValue: string;
  onNamespacesSelectionChange: (namespaces: string[]) => void;
  onNamespaceOperatorChange: (operator: string) => void;
  onNamespaceCustomValueChange: (value: string) => void;
  selectedFlows: string[];
  flowOperator?: string;
  flowCustomValue?: string;
  onFlowsSelectionChange: (flows: string[]) => void;
  onFlowOperatorChange?: (operator: string) => void;
  onFlowCustomValueChange?: (value: string) => void;
  selectedTags?: string[];
  tagsOperator?: string;
  tagsCustomValue?: string;
  onTagsSelectionChange?: (tags: string[]) => void;
  onTagsOperatorChange?: (operator: string) => void;
  onTagsCustomValueChange?: (value: string) => void;
  selectedEnabled?: string | null;
  onEnabledChange?: (value: string | null) => void;
  selectedLocked?: string | null;
  onLockedChange?: (value: string | null) => void;
  selectedMissingSource?: string | null;
  onMissingSourceChange?: (value: string | null) => void;
  selectedScopes: string[];
  onScopesSelectionChange: (scopes: string[]) => void;
  selectedKinds: string[];
  onKindsSelectionChange: (kinds: string[]) => void;
  selectedHierarchy: string;
  onHierarchySelectionChange: (hierarchy: string) => void;
  selectedInitialExecution: string;
  onInitialExecutionSelectionChange: (value: string) => void;
  actorValue?: string;
  onActorChange?: (value: string) => void;
  selectedBindingTypes?: string[];
  onBindingTypesChange?: (types: string[]) => void;
  bindingTypeOptions?: ScopeOption[];
  selectedActions?: string[];
  actionsOperator?: 'in' | 'not-in';
  onActionsSelectionChange?: (actions: string[]) => void;
  onActionsOperatorChange?: (operator: 'in' | 'not-in') => void;
  selectedResources?: string[];
  resourcesOperator?: 'in' | 'not-in';
  onResourcesSelectionChange?: (resources: string[]) => void;
  onResourcesOperatorChange?: (operator: 'in' | 'not-in') => void;
  detailsFilters?: DetailFilter[];
  onDetailsChange?: (details: DetailFilter[]) => void;
  userValue?: string;
  onUserChange?: (value: string) => void;
  selectedSuperadminStatus?: string | null;
  selectedSuperadminStatuses?: string[];
  superadminOperator?: 'in' | 'not-in';
  onSuperadminSelectionChange?: (status: string | null) => void;
  onSuperadminStatusesChange?: (statuses: string[]) => void;
  onSuperadminOperatorChange?: (operator: 'in' | 'not-in') => void;
  selectedInvitationStatuses?: string[];
  invitationStatusOperator?: 'in' | 'not-in';
  onInvitationStatusesChange?: (statuses: string[]) => void;
  onInvitationStatusOperatorChange?: (operator: 'in' | 'not-in') => void;
  invitationStatusOptions?: { value: string; label: string }[];
  selectedPlugins?: string[];
  pluginOperator?: 'in' | 'not-in';
  onPluginSelectionChange?: (plugins: string[]) => void;
  onPluginOperatorChange?: (operator: 'in' | 'not-in') => void;
  pluginOptions?: { value: string; label: string }[];
  selectedAnnouncementTypes?: string[];
  announcementTypeOperator?: 'in' | 'not-in';
  onAnnouncementTypesChange?: (types: string[]) => void;
  onAnnouncementTypeOperatorChange?: (operator: 'in' | 'not-in') => void;
  announcementTypeOptions?: { value: string; label: string }[];
  selectedServiceTypes?: string[];
  serviceTypeOperator?: 'in' | 'not-in';
  onServiceTypesSelectionChange?: (types: string[]) => void;
  onServiceTypeOperatorChange?: (operator: 'in' | 'not-in') => void;
  serviceTypeOptions?: MultiSelectOption[];
  enabledFilterHideStatusText?: boolean;
  userFilterTitle?: string;
  userFilterPlaceholder?: string;
  savedFilters: SavedFilter[];
  onSaveFilter: (name: string, description: string) => void;
  onLoadFilter: (filter: SavedFilter) => void;
  onDeleteFilter: (filterId: string) => void;
  onUpdateFilter: (filterId: string, name: string, description: string) => void;
  visibleFilters: string[];
  onVisibleFiltersChange: (filters: string[]) => void;
  onResetFilter: (filterId: string) => void;
  stateFilterOptions?: StateOption[];
  filterOptions?: FilterOption[];
  namespaceMode?: 'executions' | 'tests';
  flowOptions?: FlowOption[];
  scopeOptions?: ScopeOption[];
  tagOptions?: TagOption[];
  enabledOptions?: EnabledOption[];
  lockedOptions?: EnabledOption[];
  missingSourceOptions?: EnabledOption[];
  namespaceOptions?: string[];
  levelsFilterOptions?: StateOption[];
  triggerIdValue?: string;
  triggerIdOperator?: string;
  onTriggerIdValueChange?: (value: string) => void;
  onTriggerIdOperatorChange?: (operator: string) => void;
  searchPlaceholder?: string;
  showChartToggleControl?: boolean;
  showColumnsControl?: boolean;
  showPeriodicRefreshControl?: boolean;
}

const defaultFilterOptions: FilterOption[] = [
  { id: 'interval', label: 'Interval', description: 'Filter by execution time', enabled: true, order: 1 },
  { id: 'scope', label: 'Scope', description: 'Filter by execution scope', enabled: true, order: 2 },
  { id: 'kind', label: 'Kind', description: 'Filter by execution type', enabled: true, order: 3 },
  { id: 'hierarchy', label: 'Hierarchy', description: 'Filter by execution hierarchy', enabled: true, order: 4 },
  { id: 'state', label: 'State', description: 'Filter by execution state', enabled: false, order: 5 },
  { id: 'namespace', label: 'Namespace', description: 'Filter by namespace', enabled: false, order: 6 },
  { id: 'flow', label: 'Flow', description: 'Filter by workflow name', enabled: false, order: 7 },
  { id: 'labels', label: 'Labels', description: 'Filter by execution labels', enabled: false, order: 8 },
  { id: 'inputs', label: 'Inputs', description: 'Filter by execution inputs', enabled: false, order: 9 },
  { id: 'outputs', label: 'Outputs', description: 'Filter by execution outputs', enabled: false, order: 10 },
  { id: 'initial-execution', label: 'Parent', description: 'Filter by parent execution', enabled: false, order: 11 },
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
  statesOperator,
  onSelectedStatesChange,
  onStatesOperatorChange,
  selectedLevels = [],
  levelsOperator = 'in',
  onLevelsSelectionChange,
  onLevelsOperatorChange,
  selectedInterval,
  intervalStartDate,
  intervalEndDate,
  onIntervalChange,
  selectedLabels,
  labelsOperator,
  labelsCustomValue,
  onLabelsSelectionChange,
  onLabelsOperatorChange,
  onLabelsCustomValueChange,
  selectedInputs,
  inputsOperator,
  inputsCustomValue,
  onInputsSelectionChange,
  onInputsOperatorChange,
  onInputsCustomValueChange,
  selectedOutputs,
  outputsOperator,
  outputsCustomValue,
  onOutputsSelectionChange,
  onOutputsOperatorChange,
  onOutputsCustomValueChange,
  selectedNamespaces,
  namespaceOperator,
  namespaceCustomValue,
  onNamespacesSelectionChange,
  onNamespaceOperatorChange,
  onNamespaceCustomValueChange,
  selectedFlows,
  flowOperator = 'in',
  flowCustomValue = '',
  onFlowsSelectionChange,
  onFlowOperatorChange,
  onFlowCustomValueChange,
  selectedTags = [],
  tagsOperator = 'in',
  tagsCustomValue = '',
  onTagsSelectionChange,
  onTagsOperatorChange,
  onTagsCustomValueChange,
  selectedEnabled = null,
  onEnabledChange,
  selectedLocked = null,
  onLockedChange,
  selectedMissingSource = null,
  onMissingSourceChange,
  selectedScopes,
  onScopesSelectionChange,
  selectedKinds,
  onKindsSelectionChange,
  selectedHierarchy,
  onHierarchySelectionChange,
  selectedInitialExecution,
  onInitialExecutionSelectionChange,
  actorValue = '',
  onActorChange,
  selectedActions = [],
  actionsOperator = 'in',
  onActionsSelectionChange,
  onActionsOperatorChange,
  selectedResources = [],
  resourcesOperator = 'in',
  onResourcesSelectionChange,
  onResourcesOperatorChange,
  detailsFilters = [],
  onDetailsChange,
  userValue = '',
  onUserChange,
  selectedSuperadminStatus = null,
  selectedSuperadminStatuses = [],
  superadminOperator = 'in',
  onSuperadminSelectionChange,
  onSuperadminStatusesChange,
  onSuperadminOperatorChange,
  selectedInvitationStatuses = [],
  invitationStatusOperator = 'in',
  onInvitationStatusesChange,
  onInvitationStatusOperatorChange,
  invitationStatusOptions,
  selectedPlugins = [],
  pluginOperator = 'in',
  onPluginSelectionChange,
  onPluginOperatorChange,
  pluginOptions,
  selectedAnnouncementTypes = [],
  announcementTypeOperator = 'in',
  onAnnouncementTypesChange,
  onAnnouncementTypeOperatorChange,
  announcementTypeOptions,
  enabledFilterHideStatusText = false,
  userFilterTitle = 'User',
  userFilterPlaceholder = 'Search by username...',
  savedFilters,
  onSaveFilter,
  onLoadFilter,
  onDeleteFilter,
  onUpdateFilter,
  visibleFilters,
  onVisibleFiltersChange,
  onResetFilter,
  stateFilterOptions,
  filterOptions,
  namespaceMode = 'executions',
  flowOptions,
  scopeOptions,
  tagOptions,
  enabledOptions,
  lockedOptions,
  missingSourceOptions,
  namespaceOptions,
  levelsFilterOptions,
  triggerIdValue = '',
  triggerIdOperator = 'equals',
  onTriggerIdValueChange,
  onTriggerIdOperatorChange,
  searchPlaceholder = 'Search...',
  showChartToggleControl = true,
  showColumnsControl = true,
  showPeriodicRefreshControl = true,
  selectedBindingTypes = [],
  onBindingTypesChange,
  bindingTypeOptions,
  selectedServiceTypes = [],
  serviceTypeOperator = 'in',
  onServiceTypesSelectionChange,
  onServiceTypeOperatorChange,
  serviceTypeOptions,
}: FilterInterfaceProps) {
  const filterOptionsList = useMemo(
    () => filterOptions ?? defaultFilterOptions,
    [filterOptions],
  );
  const tagsOptionsList = useMemo(
    () => tagOptions ?? [],
    [tagOptions],
  );
  const enabledOptionsList = useMemo(
    () => enabledOptions ?? [
      { id: 'true', label: 'True' },
      { id: 'false', label: 'False' },
    ],
    [enabledOptions],
  );
  const lockedOptionsList = useMemo(
    () => lockedOptions ?? [
      { id: 'true', label: 'True' },
      { id: 'false', label: 'False' },
    ],
    [lockedOptions],
  );
  const missingSourceOptionsList = useMemo(
    () => missingSourceOptions ?? [
      { id: 'true', label: 'True' },
      { id: 'false', label: 'False' },
    ],
    [missingSourceOptions],
  );
  const levelsOptionsList = useMemo(
    () => levelsFilterOptions ?? [],
    [levelsFilterOptions],
  );
  const invitationStatusOptionsList = useMemo(
    () => {
      if (invitationStatusOptions && invitationStatusOptions.length > 0) {
        return invitationStatusOptions.map(option => ({
          id: option.value,
          label: option.label,
        }));
      }
      return [
        { id: 'PENDING', label: 'PENDING' },
        { id: 'ACCEPTED', label: 'ACCEPTED' },
        { id: 'EXPIRED', label: 'EXPIRED' },
      ];
    },
    [invitationStatusOptions],
  );
  const pluginOptionsList = useMemo(
    () => {
      if (pluginOptions && pluginOptions.length > 0) {
        return pluginOptions.map(option => ({
          id: option.value,
          label: option.label,
        }));
      }
      return [];
    },
    [pluginOptions],
  );
  const announcementTypeOptionsList = useMemo(
    () => {
      if (announcementTypeOptions && announcementTypeOptions.length > 0) {
        return announcementTypeOptions.map(option => ({
          id: option.value,
          label: option.label,
        }));
      }
      return [
        { id: 'INFO', label: 'INFO' },
        { id: 'WARNING', label: 'WARNING' },
        { id: 'ERROR', label: 'ERROR' },
      ];
    },
    [announcementTypeOptions],
  );
  const bindingTypeOptionsList = useMemo(
    () => bindingTypeOptions ?? [
      { id: 'group', label: 'Group', description: 'Apply bindings to groups' },
      { id: 'user', label: 'User', description: 'Apply bindings to individual users' },
    ],
    [bindingTypeOptions],
  );
  const serviceTypeOptionsList = useMemo(
    () => serviceTypeOptions ?? [],
    [serviceTypeOptions],
  );
  const [customizationOpen, setCustomizationOpen] = useState(false);
  const [tableOptionsOpen, setTableOptionsOpen] = useState(false);
  const [tablePropertiesOpen, setTablePropertiesOpen] = useState(false);
  // Derive available filters from visibleFilters instead of maintaining separate state
  const availableFilters = useMemo(() => {
    return filterOptionsList.map(option => ({
      ...option,
      enabled: visibleFilters.includes(option.id)
    }));
  }, [visibleFilters, filterOptionsList]);
  const [stateFilterOpen, setStateFilterOpen] = useState(false);
  const [labelsFilterOpen, setLabelsFilterOpen] = useState(false);
  const [inputsFilterOpen, setInputsFilterOpen] = useState(false);
  const [outputsFilterOpen, setOutputsFilterOpen] = useState(false);
  const [namespaceFilterOpen, setNamespaceFilterOpen] = useState(false);
  const [flowFilterOpen, setFlowFilterOpen] = useState(false);
  const [tagsFilterOpen, setTagsFilterOpen] = useState(false);
  const [enabledFilterOpen, setEnabledFilterOpen] = useState(false);
  const [lockedFilterOpen, setLockedFilterOpen] = useState(false);
  const [missingSourceFilterOpen, setMissingSourceFilterOpen] = useState(false);
  const [levelsFilterOpen, setLevelsFilterOpen] = useState(false);
  const [triggerIdFilterOpen, setTriggerIdFilterOpen] = useState(false);
  const [scopeFilterOpen, setScopeFilterOpen] = useState(false);
  const [bindingTypeFilterOpen, setBindingTypeFilterOpen] = useState(false);
  const [kindFilterOpen, setKindFilterOpen] = useState(false);
  const [hierarchyFilterOpen, setHierarchyFilterOpen] = useState(false);
  const [parentFilterOpen, setParentFilterOpen] = useState(false);
  const [intervalFilterOpen, setIntervalFilterOpen] = useState(false);
  const [actorFilterOpen, setActorFilterOpen] = useState(false);
  const [actionFilterOpen, setActionFilterOpen] = useState(false);
  const [resourceFilterOpen, setResourceFilterOpen] = useState(false);
  const [detailsFilterOpen, setDetailsFilterOpen] = useState(false);
  const [userFilterOpen, setUserFilterOpen] = useState(false);
  const [superadminFilterOpen, setSuperadminFilterOpen] = useState(false);
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [pluginFilterOpen, setPluginFilterOpen] = useState(false);
  const [announcementTypeFilterOpen, setAnnouncementTypeFilterOpen] = useState(false);
  const [serviceTypeFilterOpen, setServiceTypeFilterOpen] = useState(false);
  const [saveFilterDialogOpen, setSaveFilterDialogOpen] = useState(false);
  const [editFilterDialogOpen, setEditFilterDialogOpen] = useState(false);
  const [editingFilterId, setEditingFilterId] = useState<string | null>(null);

  const effectiveSuperadminStatus = (() => {
    const primary = selectedSuperadminStatus ?? (selectedSuperadminStatuses.length > 0
      ? selectedSuperadminStatuses[0]
      : null);
    return primary === 'all' ? null : primary;
  })();
  
  // Refs for measuring widths (keeping for potential future use)
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
    const currentlyVisible = visibleFilters.includes(filterId);
    let updatedFilters: string[];
    
    if (currentlyVisible) {
      // Remove filter from visible filters
      updatedFilters = visibleFilters.filter(id => id !== filterId);
    } else {
      // Add filter to visible filters
      updatedFilters = [...visibleFilters, filterId];
    }
    
    onVisibleFiltersChange(updatedFilters);
    
    // Auto-open editors when filters are enabled, clear values when disabled
    const filterOption = availableFilters.find(option => option.id === filterId);
    
    if (filterId === 'state') {
      if (!currentlyVisible) {
        setStateFilterOpen(true);
      } else {
        // Clear state filter values when disabling
        onSelectedStatesChange([]);
      }
    } else if (filterId === 'levels') {
      if (!currentlyVisible) {
        setLevelsFilterOpen(true);
      } else {
        onLevelsSelectionChange?.([]);
        onLevelsOperatorChange?.('in');
      }
    } else if (filterId === 'tags') {
      if (!currentlyVisible) {
        setTagsFilterOpen(true);
      } else {
        onTagsSelectionChange?.([]);
        onTagsOperatorChange?.('in');
        onTagsCustomValueChange?.('');
      }
    } else if (filterId === 'enabled') {
      if (!currentlyVisible) {
        setEnabledFilterOpen(true);
      } else {
        onEnabledChange?.(null);
      }
    } else if (filterId === 'locked') {
      if (!currentlyVisible) {
        setLockedFilterOpen(true);
      } else {
        onLockedChange?.(null);
      }
    } else if (filterId === 'missing-source') {
      if (!currentlyVisible) {
        setMissingSourceFilterOpen(true);
      } else {
        onMissingSourceChange?.(null);
      }
    } else if (filterId === 'labels') {
      if (!currentlyVisible) {
        setLabelsFilterOpen(true);
      } else {
        // Clear labels filter values when disabling
        onLabelsSelectionChange([]);
        onLabelsOperatorChange('has-any-of');
        onLabelsCustomValueChange('');
      }
    } else if (filterId === 'inputs') {
      if (!currentlyVisible) {
        setInputsFilterOpen(true);
      } else {
        onInputsSelectionChange([]);
        onInputsOperatorChange('has-any-of');
        onInputsCustomValueChange('');
      }
    } else if (filterId === 'outputs') {
      if (!currentlyVisible) {
        setOutputsFilterOpen(true);
      } else {
        onOutputsSelectionChange([]);
        onOutputsOperatorChange('has-any-of');
        onOutputsCustomValueChange('');
      }
    } else if (filterId === 'namespace') {
      if (!currentlyVisible) {
        setNamespaceFilterOpen(true);
      } else {
        // Clear namespace filter values when disabling
        onNamespacesSelectionChange([]);
      }
    } else if (filterId === 'flow') {
      if (!currentlyVisible) {
        setFlowFilterOpen(true);
      } else {
        // Clear flow filter values when disabling
        onFlowsSelectionChange([]);
      }
    } else if (filterId === 'trigger-id') {
      if (!currentlyVisible) {
        setTriggerIdFilterOpen(true);
      } else {
        onTriggerIdValueChange?.('');
        onTriggerIdOperatorChange?.('equals');
      }
    } else if (filterId === 'scope') {
      if (!currentlyVisible) {
        setScopeFilterOpen(true);
      } else {
        // Clear scope filter values when disabling, reset to default
        onScopesSelectionChange(['user']);
      }
    } else if (filterId === 'binding-type') {
      if (!currentlyVisible) {
        setBindingTypeFilterOpen(true);
      } else {
        onBindingTypesChange?.([]);
      }
    } else if (filterId === 'kind') {
      if (!currentlyVisible) {
        setKindFilterOpen(true);
      } else {
        // Clear kind filter values when disabling, reset to default
        onKindsSelectionChange(['default']);
      }
    } else if (filterId === 'hierarchy') {
      if (!currentlyVisible) {
        setHierarchyFilterOpen(true);
      } else {
        // Clear hierarchy filter values when disabling
        onHierarchySelectionChange('all');
      }
    } else if (filterId === 'initial-execution') {
      if (!currentlyVisible) {
        setParentFilterOpen(true);
      } else {
        // Clear initial execution filter values when disabling
        onInitialExecutionSelectionChange('');
      }
    } else if (filterId === 'actor') {
      if (!currentlyVisible) {
        setActorFilterOpen(true);
      } else {
        onActorChange?.('');
      }
    } else if (filterId === 'action') {
      if (!currentlyVisible) {
        setActionFilterOpen(true);
      } else {
        onActionsSelectionChange?.([]);
        onActionsOperatorChange?.('in');
      }
    } else if (filterId === 'resource') {
      if (!currentlyVisible) {
        setResourceFilterOpen(true);
      } else {
        onResourcesSelectionChange?.([]);
        onResourcesOperatorChange?.('in');
      }
    } else if (filterId === 'details') {
      if (!currentlyVisible) {
        setDetailsFilterOpen(true);
      } else {
        onDetailsChange?.([]);
      }
    } else if (filterId === 'user') {
      if (!currentlyVisible) {
        setUserFilterOpen(true);
      } else {
        onUserChange?.('');
      }
    } else if (filterId === 'superadmin') {
      if (!currentlyVisible) {
        setSuperadminFilterOpen(true);
      } else {
        onSuperadminSelectionChange?.(null);
      }
    } else if (filterId === 'service-type') {
      if (!currentlyVisible) {
        setServiceTypeFilterOpen(true);
      } else {
        onServiceTypesSelectionChange?.([]);
        onServiceTypeOperatorChange?.('in');
      }
    }
  };

  const handleFilterReorder = (draggedId: string, targetId: string) => {
    const draggedIndex = visibleFilters.indexOf(draggedId);
    const targetIndex = visibleFilters.indexOf(targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    const reorderedFilters = [...visibleFilters];
    const [draggedFilter] = reorderedFilters.splice(draggedIndex, 1);
    reorderedFilters.splice(targetIndex, 0, draggedFilter);

    onVisibleFiltersChange(reorderedFilters);
  };

  const handleEditFilter = (filterId: string) => {
    if (filterId === 'state') {
      setStateFilterOpen(true);
    } else if (filterId === 'levels') {
      setLevelsFilterOpen(true);
    } else if (filterId === 'tags') {
      setTagsFilterOpen(true);
    } else if (filterId === 'enabled') {
      setEnabledFilterOpen(true);
    } else if (filterId === 'locked') {
      setLockedFilterOpen(true);
    } else if (filterId === 'missing-source') {
      setMissingSourceFilterOpen(true);
    } else if (filterId === 'labels') {
      setLabelsFilterOpen(true);
    } else if (filterId === 'inputs') {
      setInputsFilterOpen(true);
    } else if (filterId === 'outputs') {
      setOutputsFilterOpen(true);
    } else if (filterId === 'namespace') {
      setNamespaceFilterOpen(true);
    } else if (filterId === 'flow') {
      setFlowFilterOpen(true);
    } else if (filterId === 'trigger-id') {
      setTriggerIdFilterOpen(true);
    } else if (filterId === 'scope') {
      setScopeFilterOpen(true);
    } else if (filterId === 'binding-type') {
      setBindingTypeFilterOpen(true);
    } else if (filterId === 'kind') {
      setKindFilterOpen(true);
    } else if (filterId === 'hierarchy') {
      setHierarchyFilterOpen(true);
    } else if (filterId === 'initial-execution') {
      setParentFilterOpen(true);
    } else if (filterId === 'actor') {
      setActorFilterOpen(true);
    } else if (filterId === 'action') {
      setActionFilterOpen(true);
    } else if (filterId === 'resource') {
      setResourceFilterOpen(true);
    } else if (filterId === 'details') {
      setDetailsFilterOpen(true);
    } else if (filterId === 'user') {
      setUserFilterOpen(true);
    } else if (filterId === 'superadmin') {
      setSuperadminFilterOpen(true);
    } else if (filterId === 'service-type') {
      setServiceTypeFilterOpen(true);
    } else if (filterId === 'plugin') {
      setPluginFilterOpen(true);
    } else if (filterId === 'type') {
      setAnnouncementTypeFilterOpen(true);
    } else if (filterId === 'status') {
      setStatusFilterOpen(true);
    } else if (filterId === 'interval') {
      setIntervalFilterOpen(true);
    }
    onEditFilter(filterId);
  };

  const handleStateSelectionChange = (states: string[]) => {
    onSelectedStatesChange(states);
  };

  const handleStatesOperatorChange = (operator: string) => {
    onStatesOperatorChange(operator);
  };

  const handleCloseStateFilter = () => {
    setStateFilterOpen(false);
  };

  const handleLevelsSelectionChange = (levels: string[]) => {
    onLevelsSelectionChange?.(levels);
  };

  const handleLevelsOperatorSelectionChange = (operator: string) => {
    onLevelsOperatorChange?.(operator);
  };

  const handleCloseLevelsFilter = () => {
    setLevelsFilterOpen(false);
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

  const handleInputsSelectionChange = (inputs: string[]) => {
    onInputsSelectionChange(inputs);
  };

  const handleInputsOperatorChange = (operator: string) => {
    onInputsOperatorChange(operator);
  };

  const handleInputsCustomValueChange = (value: string) => {
    onInputsCustomValueChange(value);
  };

  const handleCloseInputsFilter = () => {
    setInputsFilterOpen(false);
  };

  const handleOutputsSelectionChange = (outputs: string[]) => {
    onOutputsSelectionChange(outputs);
  };

  const handleOutputsOperatorChange = (operator: string) => {
    onOutputsOperatorChange(operator);
  };

  const handleOutputsCustomValueChange = (value: string) => {
    onOutputsCustomValueChange(value);
  };

  const handleCloseOutputsFilter = () => {
    setOutputsFilterOpen(false);
  };

  const handleCloseTagsFilter = () => {
    setTagsFilterOpen(false);
  };

  const handleCloseEnabledFilter = () => {
    setEnabledFilterOpen(false);
  };

  const handleLockedSelectionChange = (value: string | null) => {
    onLockedChange?.(value);
  };

  const handleCloseLockedFilter = () => {
    setLockedFilterOpen(false);
  };

  const handleMissingSourceSelectionChange = (value: string | null) => {
    onMissingSourceChange?.(value);
  };

  const handleCloseMissingSourceFilter = () => {
    setMissingSourceFilterOpen(false);
  };

  const handleTriggerIdOperatorSelectionChange = (operator: string) => {
    onTriggerIdOperatorChange?.(operator);
  };

  const handleTriggerIdValueChangeInternal = (value: string) => {
    onTriggerIdValueChange?.(value);
  };

  const handleCloseTriggerIdFilter = () => {
    setTriggerIdFilterOpen(false);
  };

  const handleNamespacesSelectionChange = (namespaces: string[]) => {
    onNamespacesSelectionChange(namespaces);
  };

  const handleNamespaceOperatorChange = (operator: string) => {
    onNamespaceOperatorChange(operator);
  };

  const handleNamespaceCustomValueChange = (value: string) => {
    onNamespaceCustomValueChange(value);
  };

  const handleFlowsSelectionChange = (flows: string[]) => {
    onFlowsSelectionChange(flows);
  };

  const handleFlowOperatorChange = (operator: string) => {
    onFlowOperatorChange?.(operator);
  };

  const handleFlowCustomValueChange = (value: string) => {
    onFlowCustomValueChange?.(value);
  };

  const handleTagsSelectionChange = (tags: string[]) => {
    onTagsSelectionChange?.(tags);
  };

  const handleTagsOperatorChange = (operator: string) => {
    onTagsOperatorChange?.(operator);
  };

  const handleTagsCustomValueChange = (value: string) => {
    onTagsCustomValueChange?.(value);
  };

  const handleEnabledSelectionChange = (value: string | null) => {
    onEnabledChange?.(value);
  };

  const handleScopesSelectionChange = (scopes: string[]) => {
    onScopesSelectionChange(scopes);
  };

  const handleBindingTypesSelectionChange = (types: string[]) => {
    onBindingTypesChange?.(types);
  };

  const handleKindsSelectionChange = (kinds: string[]) => {
    onKindsSelectionChange(kinds);
  };

  const handleSubflowSelectionChange = (subflow: string) => {
    onHierarchySelectionChange(subflow);
  };

  const handleInitialExecutionSelectionChange = (value: string) => {
    onInitialExecutionSelectionChange(value);
  };

  const handleActorValueChangeInternal = (value: string) => {
    onActorChange?.(value);
  };

  const handleActionsSelectionChangeInternal = (actions: string[]) => {
    onActionsSelectionChange?.(actions);
  };

  const handleActionsOperatorSelectionChange = (operator: 'in' | 'not-in') => {
    onActionsOperatorChange?.(operator);
  };

  const handleResourcesSelectionChangeInternal = (resources: string[]) => {
    onResourcesSelectionChange?.(resources);
  };

  const handleResourcesOperatorSelectionChange = (operator: 'in' | 'not-in') => {
    onResourcesOperatorChange?.(operator);
  };

  const handleDetailsChangeInternal = (nextDetails: DetailFilter[]) => {
    onDetailsChange?.(nextDetails);
  };

  const handleUserValueChangeInternal = (value: string) => {
    onUserChange?.(value);
  };

  const handleSuperadminSelectionChangeInternal = (status: string | null) => {
    onSuperadminSelectionChange?.(status);
    onSuperadminStatusesChange?.(status ? [status] : []);
    if (status === null) {
      onSuperadminOperatorChange?.('in');
    }
  };

  const handleInvitationStatusesSelectionChangeInternal = (statuses: string[]) => {
    onInvitationStatusesChange?.(statuses);
  };

  const handleInvitationStatusOperatorSelectionChange = (operator: 'in' | 'not-in') => {
    onInvitationStatusOperatorChange?.(operator);
  };

  const handlePluginSelectionChangeInternal = (plugins: string[]) => {
    onPluginSelectionChange?.(plugins);
  };

  const handlePluginOperatorSelectionChange = (operator: 'in' | 'not-in') => {
    onPluginOperatorChange?.(operator);
  };

  const handleServiceTypeSelectionChangeInternal = (types: string[]) => {
    onServiceTypesSelectionChange?.(types);
  };

  const handleServiceTypeOperatorSelectionChange = (operator: 'in' | 'not-in') => {
    onServiceTypeOperatorChange?.(operator);
  };

  const handleAnnouncementTypesSelectionChangeInternal = (types: string[]) => {
    onAnnouncementTypesChange?.(types);
  };

  const handleAnnouncementTypeOperatorSelectionChange = (operator: 'in' | 'not-in') => {
    onAnnouncementTypeOperatorChange?.(operator);
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

  const handleIntervalChange = (timeRange: string, startDate?: string, endDate?: string) => {
    onIntervalChange(timeRange, startDate, endDate);
  };

  const handleCloseTimeRangeFilter = () => {
    setIntervalFilterOpen(false);
  };

  const handleCloseFlowFilter = () => {
    setFlowFilterOpen(false);
  };

  const handleCloseScopeFilter = () => {
    setScopeFilterOpen(false);
  };

  const handleCloseBindingTypeFilter = () => {
    setBindingTypeFilterOpen(false);
  };

  const handleCloseKindFilter = () => {
    setKindFilterOpen(false);
  };

  const handleCloseSubflowFilter = () => {
    setHierarchyFilterOpen(false);
  };

  const handleCloseParentFilter = () => {
    setParentFilterOpen(false);
  };

  const handleCloseActorFilter = () => {
    setActorFilterOpen(false);
  };

  const handleCloseActionFilter = () => {
    setActionFilterOpen(false);
  };

  const handleCloseResourceFilter = () => {
    setResourceFilterOpen(false);
  };

  const handleCloseDetailsFilter = () => {
    setDetailsFilterOpen(false);
  };

  const handleCloseUserFilter = () => {
    setUserFilterOpen(false);
  };

  const handleCloseSuperadminFilter = () => {
    setSuperadminFilterOpen(false);
  };

  const handleCloseStatusFilter = () => {
    setStatusFilterOpen(false);
  };

  const handleClosePluginFilter = () => {
    setPluginFilterOpen(false);
  };

  const handleCloseServiceTypeFilter = () => {
    setServiceTypeFilterOpen(false);
  };

  const handleCloseAnnouncementTypeFilter = () => {
    setAnnouncementTypeFilterOpen(false);
  };

  // Get all filters that have data OR are enabled for display
  const allAvailableFilters = useMemo(() => {
    const filters = [...activeFilters];
    
    // Add placeholder filters for enabled options that don't have data yet
    availableFilters
      .filter(option => option.enabled)
      .forEach(option => {
        if (!activeFilters.find(filter => filter.id === option.id)) {
          // Add placeholder filter for enabled options without data
          filters.push({
            id: option.id,
            label: option.label,
            value: 'Configure',
            operator: 'in'
          });
        }
      });
    
    return filters;
  }, [activeFilters, availableFilters]);
  
  const enabledFilters = useMemo(() => {
    return allAvailableFilters.sort((a, b) => {
      const aOption = availableFilters.find(opt => opt.id === a.id);
      const bOption = availableFilters.find(opt => opt.id === b.id);
      return (aOption?.order || 999) - (bOption?.order || 999);
    });
  }, [allAvailableFilters, availableFilters]);

  // Split badges between first row (inline) and second row (overflow)
  const [allFiltersForDisplay, setAllFiltersForDisplay] = useState<ActiveFilter[]>([]);
  const [firstRowBadges, setFirstRowBadges] = useState<ActiveFilter[]>([]);
  const [overflowBadges, setOverflowBadges] = useState<ActiveFilter[]>([]);
  
  useEffect(() => {
    setAllFiltersForDisplay(enabledFilters);
    
    // Responsive logic: estimate how many badges can fit based on available width
    // On smaller screens, show fewer badges inline to prevent overflow
    const estimateMaxInlineBadges = () => {
      const screenWidth = window.innerWidth;
      // Conservative estimate: each badge ~100px, account for controls and margins
      const availableWidth = Math.max(200, screenWidth - 600); // Reserve 600px for controls
      const averageBadgeWidth = 100;
      return Math.max(1, Math.min(4, Math.floor(availableWidth / averageBadgeWidth)));
    };
    
    const maxFirstRowBadges = estimateMaxInlineBadges();
    const firstRow = enabledFilters.slice(0, maxFirstRowBadges);
    const overflow = enabledFilters.slice(maxFirstRowBadges);
    
    setFirstRowBadges(firstRow);
    setOverflowBadges(overflow);
  }, [enabledFilters]);

  // Helper function to render filter badges (reusable for both inline and overflow)
  const renderFilterBadge = (filter: ActiveFilter) => {
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
              statesOperator={statesOperator}
              onSelectionChange={handleStateSelectionChange}
              onOperatorChange={handleStatesOperatorChange}
              onClose={handleCloseStateFilter}
              onReset={() => onResetFilter('state')}
              stateOptions={stateFilterOptions}
            />
          </PopoverContent>
        </Popover>
      );
    }
    else if (filter.id === 'levels') {
      return (
        <Popover key={filter.id} open={levelsFilterOpen} onOpenChange={setLevelsFilterOpen}>
          <PopoverTrigger asChild>
            <div className="flex-shrink-0">
              <FilterBadge
                label={filter.label}
                value={filter.value}
                operator={filter.operator || 'in'}
                onClear={() => onClearFilter(filter.id)}
                onEdit={() => handleEditFilter(filter.id)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-80 p-0">
            <StateFilterEditor
              selectedStates={selectedLevels}
              statesOperator={levelsOperator}
              onSelectionChange={handleLevelsSelectionChange}
              onOperatorChange={handleLevelsOperatorSelectionChange}
              onClose={handleCloseLevelsFilter}
              onReset={() => onResetFilter('levels')}
              stateOptions={levelsOptionsList}
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
              onReset={() => onResetFilter('labels')}
              onCustomValueChange={handleLabelsCustomValueChange}
              onClose={handleCloseLabelsFilter}
            />
          </PopoverContent>
        </Popover>
      );
    }
    // Tags Filter with Popover
    else if (filter.id === 'tags') {
      return (
        <Popover key={filter.id} open={tagsFilterOpen} onOpenChange={setTagsFilterOpen}>
          <PopoverTrigger asChild>
            <div className="flex-shrink-0">
              <FilterBadge
                label={filter.label}
                value={filter.value}
                operator={filter.operator || 'in'}
                onClear={() => onClearFilter(filter.id)}
                onEdit={() => handleEditFilter(filter.id)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-80 p-0">
            <TagsFilterEditor
              selectedTags={selectedTags}
              operator={tagsOperator}
              customValue={tagsCustomValue}
              options={tagsOptionsList}
              onSelectionChange={handleTagsSelectionChange}
              onOperatorChange={handleTagsOperatorChange}
              onCustomValueChange={handleTagsCustomValueChange}
              onClose={handleCloseTagsFilter}
              onReset={() => onResetFilter('tags')}
            />
          </PopoverContent>
        </Popover>
      );
    }
    // Enabled Filter with Popover
    else if (filter.id === 'enabled') {
      return (
        <Popover key={filter.id} open={enabledFilterOpen} onOpenChange={setEnabledFilterOpen}>
          <PopoverTrigger asChild>
            <div className="flex-shrink-0">
              <FilterBadge
                label={filter.label}
                value={filter.value}
                operator={filter.operator || 'equals'}
                onClear={() => onClearFilter(filter.id)}
                onEdit={() => handleEditFilter(filter.id)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-64 p-0">
            <EnabledFilterEditor
              selectedValue={selectedEnabled ?? null}
              options={enabledOptionsList}
              onSelectionChange={handleEnabledSelectionChange}
              onClose={handleCloseEnabledFilter}
              onReset={() => onResetFilter('enabled')}
              hideStatusText={enabledFilterHideStatusText}
            />
          </PopoverContent>
        </Popover>
      );
    }
    else if (filter.id === 'locked') {
      return (
        <Popover key={filter.id} open={lockedFilterOpen} onOpenChange={setLockedFilterOpen}>
          <PopoverTrigger asChild>
            <div className="flex-shrink-0">
              <FilterBadge
                label={filter.label}
                value={filter.value}
                operator={filter.operator || 'equals'}
                onClear={() => onClearFilter(filter.id)}
                onEdit={() => handleEditFilter(filter.id)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-64 p-0">
            <EnabledFilterEditor
              selectedValue={selectedLocked ?? null}
              options={lockedOptionsList}
              onSelectionChange={handleLockedSelectionChange}
              onClose={handleCloseLockedFilter}
              onReset={() => onResetFilter('locked')}
              hideStatusText
            />
          </PopoverContent>
        </Popover>
      );
    }
    else if (filter.id === 'missing-source') {
      return (
        <Popover key={filter.id} open={missingSourceFilterOpen} onOpenChange={setMissingSourceFilterOpen}>
          <PopoverTrigger asChild>
            <div className="flex-shrink-0">
              <FilterBadge
                label={filter.label}
                value={filter.value}
                operator={filter.operator || 'equals'}
                onClear={() => onClearFilter(filter.id)}
                onEdit={() => handleEditFilter(filter.id)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-64 p-0">
            <EnabledFilterEditor
              selectedValue={selectedMissingSource ?? null}
              options={missingSourceOptionsList}
              onSelectionChange={handleMissingSourceSelectionChange}
              onClose={handleCloseMissingSourceFilter}
              onReset={() => onResetFilter('missing-source')}
              hideStatusText
            />
          </PopoverContent>
        </Popover>
      );
    }
    // Inputs Filter with Popover
    else if (filter.id === 'inputs') {
      return (
        <Popover key={filter.id} open={inputsFilterOpen} onOpenChange={setInputsFilterOpen}>
          <PopoverTrigger asChild>
            <div className="flex-shrink-0">
              <FilterBadge
                label={filter.label}
                value={filter.value}
                operator={filter.operator || 'in'}
                onClear={() => onClearFilter(filter.id)}
                onEdit={() => handleEditFilter(filter.id)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-80 p-0">
            <InputsFilterEditor
              selectedInputs={selectedInputs}
              selectedOperator={inputsOperator}
              customValue={inputsCustomValue}
              onSelectionChange={handleInputsSelectionChange}
              onOperatorChange={handleInputsOperatorChange}
              onCustomValueChange={handleInputsCustomValueChange}
              onClose={handleCloseInputsFilter}
              onReset={() => onResetFilter('inputs')}
            />
          </PopoverContent>
        </Popover>
      );
    }
    // Outputs Filter with Popover
    else if (filter.id === 'outputs') {
      return (
        <Popover key={filter.id} open={outputsFilterOpen} onOpenChange={setOutputsFilterOpen}>
          <PopoverTrigger asChild>
            <div className="flex-shrink-0">
              <FilterBadge
                label={filter.label}
                value={filter.value}
                operator={filter.operator || 'in'}
                onClear={() => onClearFilter(filter.id)}
                onEdit={() => handleEditFilter(filter.id)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-80 p-0">
            <OutputsFilterEditor
              selectedOutputs={selectedOutputs}
              selectedOperator={outputsOperator}
              customValue={outputsCustomValue}
              onSelectionChange={handleOutputsSelectionChange}
              onOperatorChange={handleOutputsOperatorChange}
              onCustomValueChange={handleOutputsCustomValueChange}
              onClose={handleCloseOutputsFilter}
              onReset={() => onResetFilter('outputs')}
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
              namespaceOperator={namespaceOperator}
              customValue={namespaceCustomValue}
              onSelectionChange={handleNamespacesSelectionChange}
              onOperatorChange={handleNamespaceOperatorChange}
              onReset={() => onResetFilter('namespace')}
              onCustomValueChange={handleNamespaceCustomValueChange}
              onClose={handleCloseNamespaceFilter}
              mode={namespaceMode}
              options={namespaceOptions}
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
              flowOperator={flowOperator}
              customValue={flowCustomValue}
              onSelectionChange={handleFlowsSelectionChange}
              onOperatorChange={handleFlowOperatorChange}
              onCustomValueChange={handleFlowCustomValueChange}
              onClose={handleCloseFlowFilter}
              onReset={() => onResetFilter('flow')}
              options={flowOptions}
            />
          </PopoverContent>
        </Popover>
      );
    }
    else if (filter.id === 'trigger-id') {
      return (
        <Popover key={filter.id} open={triggerIdFilterOpen} onOpenChange={setTriggerIdFilterOpen}>
          <PopoverTrigger asChild>
            <div className="flex-shrink-0">
              <FilterBadge
                label={filter.label}
                value={filter.value}
                operator={filter.operator || triggerIdOperator}
                onClear={() => onClearFilter(filter.id)}
                onEdit={() => handleEditFilter(filter.id)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-80 p-0">
            <TriggerIdFilterEditor
              value={triggerIdValue}
              operator={triggerIdOperator}
              onValueChange={handleTriggerIdValueChangeInternal}
              onOperatorChange={handleTriggerIdOperatorSelectionChange}
              onClose={handleCloseTriggerIdFilter}
              onReset={() => onResetFilter('trigger-id')}
            />
          </PopoverContent>
        </Popover>
      );
    }
    else if (filter.id === 'actor') {
      return (
        <Popover key={filter.id} open={actorFilterOpen} onOpenChange={setActorFilterOpen}>
          <PopoverTrigger asChild>
            <div className="flex-shrink-0">
              <FilterBadge
                label={filter.label}
                value={filter.value}
                operator={filter.operator || 'matches'}
                onClear={() => onClearFilter(filter.id)}
                onEdit={() => handleEditFilter(filter.id)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-80 p-0">
            <ActorFilterEditor
              value={actorValue}
              onChange={handleActorValueChangeInternal}
              onClose={handleCloseActorFilter}
              onReset={() => onResetFilter('actor')}
            />
          </PopoverContent>
        </Popover>
      );
    }
    else if (filter.id === 'user') {
      return (
        <Popover key={filter.id} open={userFilterOpen} onOpenChange={setUserFilterOpen}>
          <PopoverTrigger asChild>
            <div className="flex-shrink-0">
              <FilterBadge
                label={filter.label}
                value={filter.value}
                operator={filter.operator || 'matches'}
                onClear={() => onClearFilter(filter.id)}
                onEdit={() => handleEditFilter(filter.id)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-80 p-0">
            <ActorFilterEditor
              value={userValue}
              onChange={handleUserValueChangeInternal}
              onClose={handleCloseUserFilter}
              onReset={() => onResetFilter('user')}
              title={userFilterTitle}
              placeholder={userFilterPlaceholder}
            />
          </PopoverContent>
        </Popover>
      );
    }
    else if (filter.id === 'action') {
      return (
        <Popover key={filter.id} open={actionFilterOpen} onOpenChange={setActionFilterOpen}>
          <PopoverTrigger asChild>
            <div className="flex-shrink-0">
              <FilterBadge
                label={filter.label}
                value={filter.value}
                operator={filter.operator || (actionsOperator === 'not-in' ? 'not in' : 'in')}
                onClear={() => onClearFilter(filter.id)}
                onEdit={() => handleEditFilter(filter.id)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-80 p-0">
            <ActionFilterEditor
              selectedActions={selectedActions}
              operator={actionsOperator}
              onSelectionChange={handleActionsSelectionChangeInternal}
              onOperatorChange={handleActionsOperatorSelectionChange}
              onClose={handleCloseActionFilter}
              onReset={() => onResetFilter('action')}
            />
          </PopoverContent>
        </Popover>
      );
    }
    else if (filter.id === 'resource') {
      return (
        <Popover key={filter.id} open={resourceFilterOpen} onOpenChange={setResourceFilterOpen}>
          <PopoverTrigger asChild>
            <div className="flex-shrink-0">
              <FilterBadge
                label={filter.label}
                value={filter.value}
                operator={filter.operator || (resourcesOperator === 'not-in' ? 'not in' : 'in')}
                onClear={() => onClearFilter(filter.id)}
                onEdit={() => handleEditFilter(filter.id)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-80 p-0">
            <ResourceFilterEditor
              selectedResources={selectedResources}
              operator={resourcesOperator}
              onSelectionChange={handleResourcesSelectionChangeInternal}
              onOperatorChange={handleResourcesOperatorSelectionChange}
              onClose={handleCloseResourceFilter}
              onReset={() => onResetFilter('resource')}
            />
          </PopoverContent>
        </Popover>
      );
    }
    else if (filter.id === 'details') {
      return (
        <Popover key={filter.id} open={detailsFilterOpen} onOpenChange={setDetailsFilterOpen}>
          <PopoverTrigger asChild>
            <div className="flex-shrink-0">
              <FilterBadge
                label={filter.label}
                value={filter.value}
                operator={filter.operator || 'matches'}
                onClear={() => onClearFilter(filter.id)}
                onEdit={() => handleEditFilter(filter.id)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-[26rem] p-0">
            <DetailsFilterEditor
              details={detailsFilters}
              onChange={handleDetailsChangeInternal}
              onClose={handleCloseDetailsFilter}
              onReset={() => onResetFilter('details')}
            />
          </PopoverContent>
        </Popover>
      );
    }
    else if (filter.id === 'status') {
      return (
        <Popover key={filter.id} open={statusFilterOpen} onOpenChange={setStatusFilterOpen}>
          <PopoverTrigger asChild>
            <div className="flex-shrink-0">
              <FilterBadge
                label={filter.label}
                value={filter.value}
                operator={filter.operator || (invitationStatusOperator === 'not-in' ? 'not in' : 'in')}
                onClear={() => onClearFilter(filter.id)}
                onEdit={() => handleEditFilter(filter.id)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-80 p-0">
            <MultiSelectFilterEditor
              title="Status"
              options={invitationStatusOptionsList}
              selectedValues={selectedInvitationStatuses}
              selectedOperator={invitationStatusOperator}
              onSelectionChange={handleInvitationStatusesSelectionChangeInternal}
              onOperatorChange={handleInvitationStatusOperatorSelectionChange}
              onClose={handleCloseStatusFilter}
              onReset={() => onResetFilter('status')}
              searchPlaceholder="Search statuses..."
              dataTestIdPrefix="invitation-status"
            />
          </PopoverContent>
        </Popover>
      );
    }
    else if (filter.id === 'binding-type') {
      return (
        <Popover key={filter.id} open={bindingTypeFilterOpen} onOpenChange={setBindingTypeFilterOpen}>
          <PopoverTrigger asChild>
            <div className="flex-shrink-0">
              <FilterBadge
                label={filter.label}
                value={filter.value}
                operator={filter.operator || 'in'}
                onClear={() => onClearFilter(filter.id)}
                onEdit={() => handleEditFilter(filter.id)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-96 p-0">
            <ScopeFilterEditor
              selectedScopes={selectedBindingTypes ?? []}
              onSelectionChange={handleBindingTypesSelectionChange}
              onClose={handleCloseBindingTypeFilter}
              onReset={() => onResetFilter('binding-type')}
              options={bindingTypeOptionsList}
            />
          </PopoverContent>
        </Popover>
      );
    }
    else if (filter.id === 'service-type') {
      return (
        <Popover key={filter.id} open={serviceTypeFilterOpen} onOpenChange={setServiceTypeFilterOpen}>
          <PopoverTrigger asChild>
            <div className="flex-shrink-0">
              <FilterBadge
                label={filter.label}
                value={filter.value}
                operator={filter.operator || (serviceTypeOperator === 'not-in' ? 'not in' : 'in')}
                onClear={() => onClearFilter(filter.id)}
                onEdit={() => handleEditFilter(filter.id)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-80 p-0">
            <MultiSelectFilterEditor
              title="Service Type"
              options={serviceTypeOptionsList}
              selectedValues={selectedServiceTypes}
              selectedOperator={serviceTypeOperator}
              onSelectionChange={handleServiceTypeSelectionChangeInternal}
              onOperatorChange={handleServiceTypeOperatorSelectionChange}
              onClose={handleCloseServiceTypeFilter}
              onReset={() => onResetFilter('service-type')}
              searchPlaceholder="Search..."
              dataTestIdPrefix="service-type"
            />
          </PopoverContent>
        </Popover>
      );
    }
    else if (filter.id === 'plugin') {
      return (
        <Popover key={filter.id} open={pluginFilterOpen} onOpenChange={setPluginFilterOpen}>
          <PopoverTrigger asChild>
            <div className="flex-shrink-0">
              <FilterBadge
                label={filter.label}
                value={filter.value}
                operator={filter.operator || (pluginOperator === 'not-in' ? 'not in' : 'in')}
                onClear={() => onClearFilter(filter.id)}
                onEdit={() => handleEditFilter(filter.id)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-80 p-0">
            <MultiSelectFilterEditor
              title="Plugin"
              options={pluginOptionsList}
              selectedValues={selectedPlugins}
              selectedOperator={pluginOperator}
              onSelectionChange={handlePluginSelectionChangeInternal}
              onOperatorChange={handlePluginOperatorSelectionChange}
              onClose={handleClosePluginFilter}
              onReset={() => onResetFilter('plugin')}
              searchPlaceholder="Search..."
              dataTestIdPrefix="plugin"
            />
          </PopoverContent>
        </Popover>
      );
    }
    else if (filter.id === 'type') {
      return (
        <Popover key={filter.id} open={announcementTypeFilterOpen} onOpenChange={setAnnouncementTypeFilterOpen}>
          <PopoverTrigger asChild>
            <div className="flex-shrink-0">
              <FilterBadge
                label={filter.label}
                value={filter.value}
                operator={filter.operator || (announcementTypeOperator === 'not-in' ? 'not in' : 'in')}
                onClear={() => onClearFilter(filter.id)}
                onEdit={() => handleEditFilter(filter.id)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-80 p-0">
            <MultiSelectFilterEditor
              title="Type"
              options={announcementTypeOptionsList}
              selectedValues={selectedAnnouncementTypes}
              selectedOperator={announcementTypeOperator}
              onSelectionChange={handleAnnouncementTypesSelectionChangeInternal}
              onOperatorChange={handleAnnouncementTypeOperatorSelectionChange}
              onClose={handleCloseAnnouncementTypeFilter}
              onReset={() => onResetFilter('type')}
              searchPlaceholder="Search types..."
              dataTestIdPrefix="announcement-type"
            />
          </PopoverContent>
        </Popover>
      );
    }
    else if (filter.id === 'superadmin') {
      return (
        <Popover key={filter.id} open={superadminFilterOpen} onOpenChange={setSuperadminFilterOpen}>
          <PopoverTrigger asChild>
            <div className="flex-shrink-0">
              <FilterBadge
                label={filter.label}
                value={filter.value}
                operator={superadminOperator === 'not-in' ? 'not in' : 'in'}
                onClear={() => onClearFilter(filter.id)}
                onEdit={() => handleEditFilter(filter.id)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-64 p-0 bg-[#2F3341]">
            <EnabledFilterEditor
              options={[
                { id: "true", label: "Superadmin" },
                { id: "false", label: "Non-Superadmin" },
              ]}
              selectedValue={effectiveSuperadminStatus}
              onSelectionChange={handleSuperadminSelectionChangeInternal}
              onClose={handleCloseSuperadminFilter}
              onReset={() => onResetFilter('superadmin')}
              hideStatusText={true}
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
              options={scopeOptions}
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
    else if (filter.id === 'hierarchy') {
      return (
        <Popover key={filter.id} open={hierarchyFilterOpen} onOpenChange={setHierarchyFilterOpen}>
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
            <HierarchyFilterEditor
              selectedHierarchy={selectedHierarchy}
              onSelectionChange={handleSubflowSelectionChange}
              onClose={handleCloseSubflowFilter}
            />
          </PopoverContent>
        </Popover>
      );
    }
    // Initial Execution Filter with Popover
    else if (filter.id === 'initial-execution') {
      return (
        <Popover key={filter.id} open={parentFilterOpen} onOpenChange={setParentFilterOpen}>
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
            <ParentFilterEditor
              selectedInitialExecution={selectedInitialExecution}
              onSelectionChange={handleInitialExecutionSelectionChange}
              onClose={handleCloseParentFilter}
              onReset={() => onResetFilter('initial-execution')}
            />
          </PopoverContent>
        </Popover>
      );
    }
    // Time Range Filter with Popover
    else if (filter.id === 'interval') {
      return (
        <Popover key={filter.id} open={intervalFilterOpen} onOpenChange={setIntervalFilterOpen}>
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
            <IntervalFilterEditor
              selectedInterval={selectedInterval}
              startDate={intervalStartDate}
              endDate={intervalEndDate}
              onIntervalChange={handleIntervalChange}
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
  };

  return (
    <div className="relative">
      {/* First Row: Controls */}
      <div className="flex items-center gap-3 p-4 pb-2 bg-[#1F232D]">
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
                filterOptions={availableFilters}
                activeFilters={activeFilters}
                onAddFilter={handleToggleFilter}
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
            placeholder={searchPlaceholder}
          />
        </div>

        {/* Middle Section: Inline Filter Badges */}
        {firstRowBadges.length > 0 && (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 overflow-hidden">
              {firstRowBadges.map((filter) => renderFilterBadge(filter))}
            </div>
          </div>
        )}

        {/* Right Section: Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          {/* Save Filter Button */}
          <SaveFilterButton
            onClick={() => setSaveFilterDialogOpen(true)}
          />

          {/* Saved Filters Dropdown */}
          <SavedFiltersDropdown
            savedFilters={savedFilters}
            onLoadFilter={onLoadFilter}
            onEditFilter={handleEditSavedFilter}
            onDeleteFilter={onDeleteFilter}
          />

          {/* Table options button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTableOptionsToggle}
                className="h-7 w-7 p-0 flex items-center justify-center"
                data-testid="table-options-button"
                aria-label="Show data options"
              >
                <Sliders className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Show data options
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      {/* Second Row: Overflow Filter Badges */}
      {overflowBadges.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {overflowBadges.map((filter) => renderFilterBadge(filter))}
          </div>
        </div>
      )}
      {/* Table Options Panel */}
      {tableOptionsOpen && (
        <div className="px-4 py-3 border-b border-border bg-[#1F232D]">
          <div
            className={`flex items-center gap-6 ${
              showChartToggleControl ? 'justify-between' : 'justify-end'
            }`}
          >
            {showChartToggleControl && (
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
            )}

            <div className="flex items-center gap-6">
              {showPeriodicRefreshControl && (
                <div className="flex items-center gap-2">
                  <Switch
                    id="periodic-refresh"
                    checked={periodicRefresh}
                    onCheckedChange={onTogglePeriodicRefresh}
                    data-testid="switch-periodic-refresh"
                    className="bg-[#8408FF]"
                  />
                  <Label htmlFor="periodic-refresh" className="text-sm cursor-pointer">
                    Periodic refresh
                  </Label>
                </div>
              )}

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

              {showColumnsControl && (
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
                  <PopoverContent
                    side="bottom"
                    align="end"
                    className="w-80 p-0"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <TablePropertiesPanel
                      columns={columns}
                      onToggleColumn={handleColumnToggle}
                      onReorderColumns={handleColumnReorder}
                      isOpen={tablePropertiesOpen}
                      onClose={() => setTablePropertiesOpen(false)}
                    />
                  </PopoverContent>
                </Popover>
              )}
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
