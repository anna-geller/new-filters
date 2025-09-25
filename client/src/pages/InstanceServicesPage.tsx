import { useEffect, useMemo, useState } from "react";
import FilterInterface, { type FilterOption } from "@/components/FilterInterface";
import ServicesTable, { type ServiceRow } from "@/components/ServicesTable";
import type { ColumnConfig } from "@/components/ExecutionsTable";
import type { StateOption } from "@/components/StateFilterEditor";
import type { MultiSelectOption } from "@/components/MultiSelectFilterEditor";
import { Button } from "@/components/ui/button";
import { SavedFilter } from "@/types/savedFilters";
import { instanceServicesSavedFiltersStorage } from "@/utils/instanceServicesSavedFiltersStorage";
import {
  AlertOctagon,
  CheckCircle,
  CircleSlash,
  Octagon,
  PauseCircle,
  Play,
  PlugZap,
  PlusCircle,
  Power,
  Wrench,
} from "lucide-react";

const DEFAULT_VISIBLE_FILTERS: string[] = [];

const INSTANCE_SERVICES_FILTER_OPTIONS: FilterOption[] = [
  { id: "interval", label: "Service started", description: "Filter by service start time", enabled: true, order: 1 },
  { id: "state", label: "State", description: "Filter by service state", enabled: false, order: 2 },
  { id: "service-type", label: "Service Type", description: "Filter by service role", enabled: false, order: 3 },
];

const SERVICE_STATE_OPTIONS: StateOption[] = [
  { id: "CREATED", label: "CREATED", icon: PlusCircle, description: "Service instance has been registered" },
  { id: "RUNNING", label: "RUNNING", icon: Play, description: "Service is currently active" },
  { id: "DISCONNECTED", label: "DISCONNECTED", icon: PlugZap, description: "Service lost connection" },
  { id: "ERROR", label: "ERROR", icon: AlertOctagon, description: "Service encountered an error" },
  { id: "TERMINATING", label: "TERMINATING", icon: Power, description: "Service is shutting down" },
  { id: "TERMINATED GRACEFULLY", label: "TERMINATED GRACEFULLY", icon: CheckCircle, description: "Service stopped cleanly" },
  { id: "TERMINATED FORCED", label: "TERMINATED FORCED", icon: Octagon, description: "Service terminated unexpectedly" },
  { id: "NOT RUNNING", label: "NOT RUNNING", icon: PauseCircle, description: "Service is stopped" },
  { id: "INACTIVE", label: "INACTIVE", icon: CircleSlash, description: "Service is inactive" },
  { id: "MAINTENANCE", label: "MAINTENANCE", icon: Wrench, description: "Service in maintenance" },
];

const SERVICE_TYPE_OPTIONS: MultiSelectOption[] = [
  { id: "WORKER", label: "Worker" },
  { id: "EXECUTOR", label: "Executor" },
  { id: "WEBSERVER", label: "Webserver" },
  { id: "SCHEDULER", label: "Scheduler" },
  { id: "INDEXER", label: "Indexer" },
];

const INSTANCE_SERVICES_COLUMNS: ColumnConfig[] = [
  { id: "id", label: "Id", description: "Unique identifier for the service instance", visible: true, order: 1 },
  { id: "type", label: "Type", description: "Role of the service (e.g., Scheduler, Worker)", visible: true, order: 2 },
  { id: "state", label: "State", description: "Current status", visible: true, order: 3 },
  { id: "hostname", label: "Hostname", description: "Host machine or container ID running the service", visible: true, order: 4 },
  { id: "serverType", label: "Server type", description: "Deployment mode", visible: true, order: 5 },
  { id: "version", label: "Version", description: "Kestra version of the running service", visible: true, order: 6 },
  { id: "startDate", label: "Start date", description: "When the service was last started", visible: true, order: 7 },
  { id: "healthCheckDate", label: "HealthCheck Date", description: "The most recent health check", visible: true, order: 8 },
];

const SERVICE_ROWS: ServiceRow[] = [
  {
    id: "7TnLJZP0",
    type: "INDEXER",
    state: "RUNNING",
    hostname: "b6f0b66bdf40",
    serverType: "STANDALONE",
    version: "1.1.0-SNAPSHOT",
    startDate: "Thu, Sep 25, 2025 8:58 AM",
    healthCheckDate: "Thu, Sep 25, 2025 9:00 AM",
  },
  {
    id: "76VZNhjZ",
    type: "SCHEDULER",
    state: "RUNNING",
    hostname: "b6f0b66bdf40",
    serverType: "STANDALONE",
    version: "1.1.0-SNAPSHOT",
    startDate: "Thu, Sep 25, 2025 8:58 AM",
    healthCheckDate: "Thu, Sep 25, 2025 9:00 AM",
  },
  {
    id: "ea4abbea",
    type: "WORKER",
    state: "RUNNING",
    hostname: "b6f0b66bdf40",
    serverType: "STANDALONE",
    version: "1.1.0-SNAPSHOT",
    startDate: "Thu, Sep 25, 2025 8:58 AM",
    healthCheckDate: "Thu, Sep 25, 2025 9:00 AM",
  },
  {
    id: "2LnW1lks",
    type: "EXECUTOR",
    state: "RUNNING",
    hostname: "b6f0b66bdf40",
    serverType: "STANDALONE",
    version: "1.1.0-SNAPSHOT",
    startDate: "Thu, Sep 25, 2025 8:58 AM",
    healthCheckDate: "Thu, Sep 25, 2025 9:00 AM",
  },
  {
    id: "27qQbgrj",
    type: "WEBSERVER",
    state: "RUNNING",
    hostname: "b6f0b66bdf40",
    serverType: "STANDALONE",
    version: "1.1.0-SNAPSHOT",
    startDate: "Thu, Sep 25, 2025 8:58 AM",
    healthCheckDate: "Thu, Sep 25, 2025 9:00 AM",
  },
  {
    id: "55bRqTMY",
    type: "INDEXER",
    state: "DISCONNECTED",
    hostname: "b6f0b66bdf40",
    serverType: "DISTRIBUTED",
    version: "1.1.0-SNAPSHOT",
    startDate: "Wed, Sep 24, 2025 10:53 AM",
    healthCheckDate: "Thu, Sep 25, 2025 8:59 AM",
  },
  {
    id: "1yiWLkOi",
    type: "SCHEDULER",
    state: "DISCONNECTED",
    hostname: "b6f0b66bdf40",
    serverType: "DISTRIBUTED",
    version: "1.1.0-SNAPSHOT",
    startDate: "Wed, Sep 24, 2025 10:53 AM",
    healthCheckDate: "Thu, Sep 25, 2025 8:59 AM",
  },
  {
    id: "026f0231",
    type: "WORKER",
    state: "DISCONNECTED",
    hostname: "b6f0b66bdf40",
    serverType: "DISTRIBUTED",
    version: "1.1.0-SNAPSHOT",
    startDate: "Wed, Sep 24, 2025 10:53 AM",
    healthCheckDate: "Thu, Sep 25, 2025 8:59 AM",
  },
  {
    id: "1Eqlbt8",
    type: "EXECUTOR",
    state: "DISCONNECTED",
    hostname: "b6f0b66bdf40",
    serverType: "DISTRIBUTED",
    version: "1.1.0-SNAPSHOT",
    startDate: "Wed, Sep 24, 2025 10:53 AM",
    healthCheckDate: "Thu, Sep 25, 2025 8:59 AM",
  },
  {
    id: "6iFp4Cja",
    type: "WEBSERVER",
    state: "DISCONNECTED",
    hostname: "b6f0b66bdf40",
    serverType: "DISTRIBUTED",
    version: "1.1.0-SNAPSHOT",
    startDate: "Wed, Sep 24, 2025 10:53 AM",
    healthCheckDate: "Thu, Sep 25, 2025 8:59 AM",
  },
  {
    id: "5tmXT3R",
    type: "INDEXER",
    state: "INACTIVE",
    hostname: "996535d44359",
    serverType: "STANDALONE",
    version: "1.1.0-SNAPSHOT",
    startDate: "Tue, Sep 23, 2025 8:56 AM",
    healthCheckDate: "Wed, Sep 24, 2025 10:58 AM",
  },
  {
    id: "2AoSwK3A",
    type: "SCHEDULER",
    state: "INACTIVE",
    hostname: "996535d44359",
    serverType: "STANDALONE",
    version: "1.1.0-SNAPSHOT",
    startDate: "Tue, Sep 23, 2025 8:56 AM",
    healthCheckDate: "Wed, Sep 24, 2025 10:58 AM",
  },
  {
    id: "816e82c2",
    type: "WORKER",
    state: "INACTIVE",
    hostname: "996535d44359",
    serverType: "STANDALONE",
    version: "1.1.0-SNAPSHOT",
    startDate: "Tue, Sep 23, 2025 8:56 AM",
    healthCheckDate: "Wed, Sep 24, 2025 10:58 AM",
  },
  {
    id: "1aqItQue",
    type: "EXECUTOR",
    state: "INACTIVE",
    hostname: "996535d44359",
    serverType: "STANDALONE",
    version: "1.1.0-SNAPSHOT",
    startDate: "Tue, Sep 23, 2025 8:56 AM",
    healthCheckDate: "Wed, Sep 24, 2025 10:58 AM",
  },
  {
    id: "3dnp7Z8M",
    type: "WEBSERVER",
    state: "INACTIVE",
    hostname: "996535d44359",
    serverType: "STANDALONE",
    version: "1.1.0-SNAPSHOT",
    startDate: "Tue, Sep 23, 2025 8:56 AM",
    healthCheckDate: "Wed, Sep 24, 2025 10:58 AM",
  },
];

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

const SERVICE_TYPE_LABEL_MAP = SERVICE_TYPE_OPTIONS.reduce<Record<string, string>>((acc, option) => {
  acc[option.id] = option.label;
  return acc;
}, {});

export default function InstanceServicesPage() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [statesOperator, setStatesOperator] = useState<"in" | "not-in">("in");
  const [selectedInterval, setSelectedInterval] = useState("all-time");
  const [intervalStartDate, setIntervalStartDate] = useState<string>();
  const [intervalEndDate, setIntervalEndDate] = useState<string>();
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);
  const [serviceTypeOperator, setServiceTypeOperator] = useState<"in" | "not-in">("in");
  const [showChart, setShowChart] = useState(false);
  const [periodicRefresh, setPeriodicRefresh] = useState(true);
  const [columns, setColumns] = useState<ColumnConfig[]>(INSTANCE_SERVICES_COLUMNS.map((column) => ({ ...column })));
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  useEffect(() => {
    setSavedFilters(instanceServicesSavedFiltersStorage.getAll());
  }, []);

  const getIntervalDisplayValue = () => {
    if (selectedInterval === "custom-range" && intervalStartDate && intervalEndDate) {
      const start = new Date(intervalStartDate).toLocaleDateString();
      const end = new Date(intervalEndDate).toLocaleDateString();
      return `${start} - ${end}`;
    }
    if (selectedInterval === "all-time") {
      return "All time";
    }
    return selectedInterval.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];

    if (visibleFilters.includes("interval")) {
      filters.push({
        id: "interval",
        label: "Service started",
        value: getIntervalDisplayValue(),
      });
    }

    if (visibleFilters.includes("state") && selectedStates.length > 0) {
      const operatorLabel = statesOperator === "not-in" ? "not in" : "in";
      filters.push({
        id: "state",
        label: "State",
        value: selectedStates.join(", "),
        operator: operatorLabel,
      });
    }

    if (visibleFilters.includes("service-type") && selectedServiceTypes.length > 0) {
      const operatorLabel = serviceTypeOperator === "not-in" ? "not in" : "in";
      const value = selectedServiceTypes
        .map((serviceType) => SERVICE_TYPE_LABEL_MAP[serviceType] ?? serviceType)
        .join(", ");
      filters.push({
        id: "service-type",
        label: "Service Type",
        value,
        operator: operatorLabel,
      });
    }

    return filters;
  }, [visibleFilters, selectedInterval, intervalStartDate, intervalEndDate, selectedStates, statesOperator, selectedServiceTypes, serviceTypeOperator]);

  const intervalBounds = useMemo(() => {
    if (!visibleFilters.includes("interval")) {
      return null;
    }

    if (selectedInterval === "all-time" && !intervalStartDate && !intervalEndDate) {
      return null;
    }

    if (selectedInterval === "custom-range") {
      if (!intervalStartDate || !intervalEndDate) {
        return null;
      }

      const start = new Date(intervalStartDate);
      const end = new Date(intervalEndDate);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return null;
      }

      return { start, end } as const;
    }

    const presetDurations: Record<string, number> = {
      "last-5-minutes": 5 * 60 * 1000,
      "last-15-minutes": 15 * 60 * 1000,
      "last-1-hour": 60 * 60 * 1000,
      "last-12-hours": 12 * 60 * 60 * 1000,
      "last-24-hours": 24 * 60 * 60 * 1000,
      "last-7-days": 7 * 24 * 60 * 60 * 1000,
      "last-30-days": 30 * 24 * 60 * 60 * 1000,
    };

    const duration = presetDurations[selectedInterval];
    if (!duration) {
      return null;
    }

    const end = new Date();
    const start = new Date(end.getTime() - duration);
    return { start, end } as const;
  }, [intervalEndDate, intervalStartDate, selectedInterval, visibleFilters]);

  const filteredRows = useMemo(() => {
    const searchTerm = searchValue.trim().toLowerCase();
    const stateSelection = new Set(selectedStates);
    const serviceTypeSelection = new Set(selectedServiceTypes);

    return SERVICE_ROWS.filter((row) => {
      if (searchTerm) {
        const haystack = `${row.id} ${row.type} ${row.state} ${row.hostname} ${row.serverType} ${row.version} ${row.startDate} ${row.healthCheckDate}`.toLowerCase();
        if (!haystack.includes(searchTerm)) {
          return false;
        }
      }

      if (stateSelection.size > 0) {
        const isMatch = stateSelection.has(row.state);
        if (statesOperator === "in" && !isMatch) {
          return false;
        }
        if (statesOperator === "not-in" && isMatch) {
          return false;
        }
      }

      if (serviceTypeSelection.size > 0) {
        const isMatch = serviceTypeSelection.has(row.type);
        if (serviceTypeOperator === "in" && !isMatch) {
          return false;
        }
        if (serviceTypeOperator === "not-in" && isMatch) {
          return false;
        }
      }

      if (intervalBounds) {
        const rowStartDate = new Date(row.startDate);
        if (!Number.isNaN(rowStartDate.getTime())) {
          if (intervalBounds.start && rowStartDate < intervalBounds.start) {
            return false;
          }
          if (intervalBounds.end && rowStartDate > intervalBounds.end) {
            return false;
          }
        }
      }

      return true;
    });
  }, [
    intervalBounds,
    searchValue,
    selectedServiceTypes,
    selectedStates,
    serviceTypeOperator,
    statesOperator,
  ]);

  const handleClearFilter = (filterId: string) => {
    if (filterId === "interval") {
      setSelectedInterval("all-time");
      setIntervalStartDate(undefined);
      setIntervalEndDate(undefined);
    } else if (filterId === "state") {
      setSelectedStates([]);
      setStatesOperator("in");
    } else if (filterId === "service-type") {
      setSelectedServiceTypes([]);
      setServiceTypeOperator("in");
    }
    setVisibleFilters((prev) => prev.filter((id) => id !== filterId));
  };

  const handleResetFilter = (filterId: string) => {
    if (filterId === "interval") {
      setSelectedInterval("all-time");
      setIntervalStartDate(undefined);
      setIntervalEndDate(undefined);
    } else if (filterId === "state") {
      setSelectedStates([]);
      setStatesOperator("in");
    } else if (filterId === "service-type") {
      setSelectedServiceTypes([]);
      setServiceTypeOperator("in");
    }
  };

  const handleResetFilters = () => {
    setSearchValue("");
    setSelectedStates([]);
    setStatesOperator("in");
    setSelectedInterval("all-time");
    setIntervalStartDate(undefined);
    setIntervalEndDate(undefined);
    setSelectedServiceTypes([]);
    setServiceTypeOperator("in");
    setShowChart(false);
    setPeriodicRefresh(true);
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
    setColumns(INSTANCE_SERVICES_COLUMNS.map((column) => ({ ...column })));
  };

  const getCurrentFilterState = (): SavedFilter["filterState"] => ({
    searchValue,
    selectedStates,
    statesOperator,
    selectedInterval,
    intervalStartDate,
    intervalEndDate,
    selectedLabels: [],
    labelsOperator: "has-any-of",
    labelsCustomValue: "",
    selectedNamespaces: [],
    namespaceOperator: "in",
    namespaceCustomValue: "",
    selectedFlows: [],
    selectedScopes: [],
    selectedKinds: [],
    selectedHierarchy: "all",
    selectedInitialExecution: "",
    selectedInputs: [],
    inputsOperator: "has-any-of",
    inputsCustomValue: "",
    selectedOutputs: [],
    outputsOperator: "has-any-of",
    outputsCustomValue: "",
    selectedTags: [],
    tagsOperator: "in",
    tagsCustomValue: "",
    enabledValue: null,
    selectedLocked: null,
    selectedMissingSource: null,
    triggerIdOperator: "equals",
    triggerIdValue: "",
    actorValue: "",
    selectedActions: [],
    actionsOperator: "in",
    selectedResources: [],
    resourcesOperator: "in",
    detailsKey: "",
    detailsValue: "",
    visibleFilters,
    userValue: "",
    selectedSuperadminStatuses: [],
    superadminOperator: "in",
    selectedInvitationStatuses: [],
    invitationStatusOperator: "in",
    selectedPlugins: [],
    pluginOperator: "in",
    selectedAnnouncementTypes: [],
    announcementTypeOperator: "in",
    selectedServiceTypes,
    serviceTypeOperator,
  });

  const handleSaveFilter = (name: string, description: string) => {
    const now = new Date().toISOString();
    const filter: SavedFilter = {
      id: `instance-services-filter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      filterState: getCurrentFilterState(),
    };

    instanceServicesSavedFiltersStorage.save(filter);
    setSavedFilters(instanceServicesSavedFiltersStorage.getAll());
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;
    setSearchValue(state.searchValue ?? "");
    setSelectedStates(state.selectedStates ?? []);
    setStatesOperator((state.statesOperator as "in" | "not-in") ?? "in");
    setSelectedInterval(state.selectedInterval ?? "all-time");
    setIntervalStartDate(state.intervalStartDate);
    setIntervalEndDate(state.intervalEndDate);
    setSelectedServiceTypes(state.selectedServiceTypes ?? []);
    setServiceTypeOperator((state.serviceTypeOperator as "in" | "not-in") ?? "in");

    const restoredVisibleFilters = state.visibleFilters && state.visibleFilters.length > 0
      ? Array.from(new Set(state.visibleFilters))
      : [...DEFAULT_VISIBLE_FILTERS];

    if ((state.selectedStates?.length ?? 0) > 0) {
      restoredVisibleFilters.push("state");
    }
    if ((state.selectedServiceTypes?.length ?? 0) > 0) {
      restoredVisibleFilters.push("service-type");
    }
    if (!restoredVisibleFilters.includes("interval")) {
      restoredVisibleFilters.push("interval");
    }

    setVisibleFilters(Array.from(new Set(restoredVisibleFilters)));
  };

  const handleDeleteFilter = (filterId: string) => {
    instanceServicesSavedFiltersStorage.delete(filterId);
    setSavedFilters(instanceServicesSavedFiltersStorage.getAll());
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    instanceServicesSavedFiltersStorage.update(filterId, { name, description });
    setSavedFilters(instanceServicesSavedFiltersStorage.getAll());
  };

  const handleRefreshData = () => {
    console.log("Refreshing services data...");
  };

  const handleIntervalChange = (interval: string, startDate?: string, endDate?: string) => {
    setSelectedInterval(interval);
    setIntervalStartDate(startDate);
    setIntervalEndDate(endDate);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Instance Administration</span>
            <h1 className="text-xl font-semibold text-foreground">Services</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-muted-foreground hover:text-foreground">
              Jump to...
            </button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Ctrl+Cmd+K</span>
            </div>
            <Button data-testid="button-enter-maintenance" size="sm" className="px-3 py-1 text-sm">
              Enter maintenance mode
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col">
        <FilterInterface
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          activeFilters={activeFilters}
          onClearFilter={handleClearFilter}
          onEditFilter={() => {}}
          onResetFilters={handleResetFilters}
          showChart={showChart}
          onToggleShowChart={setShowChart}
          periodicRefresh={periodicRefresh}
          onTogglePeriodicRefresh={setPeriodicRefresh}
          onRefreshData={handleRefreshData}
          columns={columns}
          onColumnsChange={setColumns}
          selectedStates={selectedStates}
          statesOperator={statesOperator}
          onSelectedStatesChange={setSelectedStates}
          onStatesOperatorChange={(operator) => setStatesOperator(operator as "in" | "not-in")}
          selectedInterval={selectedInterval}
          intervalStartDate={intervalStartDate}
          intervalEndDate={intervalEndDate}
          onIntervalChange={handleIntervalChange}
          selectedLabels={[]}
          labelsOperator="has-any-of"
          labelsCustomValue=""
          onLabelsSelectionChange={() => {}}
          onLabelsOperatorChange={() => {}}
          onLabelsCustomValueChange={() => {}}
          selectedInputs={[]}
          inputsOperator="has-any-of"
          inputsCustomValue=""
          onInputsSelectionChange={() => {}}
          onInputsOperatorChange={() => {}}
          onInputsCustomValueChange={() => {}}
          selectedOutputs={[]}
          outputsOperator="has-any-of"
          outputsCustomValue=""
          onOutputsSelectionChange={() => {}}
          onOutputsOperatorChange={() => {}}
          onOutputsCustomValueChange={() => {}}
          selectedNamespaces={[]}
          namespaceOperator="in"
          namespaceCustomValue=""
          onNamespacesSelectionChange={() => {}}
          onNamespaceOperatorChange={() => {}}
          onNamespaceCustomValueChange={() => {}}
          selectedFlows={[]}
          onFlowsSelectionChange={() => {}}
          selectedScopes={[]}
          onScopesSelectionChange={() => {}}
          selectedKinds={[]}
          onKindsSelectionChange={() => {}}
          selectedHierarchy="all"
          onHierarchySelectionChange={() => {}}
          selectedInitialExecution=""
          onInitialExecutionSelectionChange={() => {}}
          actorValue=""
          onActorChange={() => {}}
          selectedActions={[]}
          actionsOperator="in"
          onActionsSelectionChange={() => {}}
          onActionsOperatorChange={() => {}}
          selectedResources={[]}
          resourcesOperator="in"
          onResourcesSelectionChange={() => {}}
          onResourcesOperatorChange={() => {}}
          detailsKey=""
          detailsValue=""
          onDetailsChange={() => {}}
          userValue=""
          onUserChange={() => {}}
          selectedSuperadminStatuses={[]}
          superadminOperator="in"
          onSuperadminSelectionChange={() => {}}
          onSuperadminOperatorChange={() => {}}
          selectedInvitationStatuses={[]}
          invitationStatusOperator="in"
          onInvitationStatusesChange={() => {}}
          onInvitationStatusOperatorChange={() => {}}
          invitationStatusOptions={[]}
          selectedPlugins={[]}
          pluginOperator="in"
          onPluginSelectionChange={() => {}}
          onPluginOperatorChange={() => {}}
          pluginOptions={[]}
          selectedAnnouncementTypes={[]}
          announcementTypeOperator="in"
          onAnnouncementTypesChange={() => {}}
          onAnnouncementTypeOperatorChange={() => {}}
          announcementTypeOptions={[]}
          savedFilters={savedFilters}
          onSaveFilter={handleSaveFilter}
          onLoadFilter={handleLoadFilter}
          onDeleteFilter={handleDeleteFilter}
          onUpdateFilter={handleUpdateFilter}
          visibleFilters={visibleFilters}
          onVisibleFiltersChange={setVisibleFilters}
          onResetFilter={handleResetFilter}
          stateFilterOptions={SERVICE_STATE_OPTIONS}
          filterOptions={INSTANCE_SERVICES_FILTER_OPTIONS}
          selectedServiceTypes={selectedServiceTypes}
          serviceTypeOperator={serviceTypeOperator}
          onServiceTypesSelectionChange={setSelectedServiceTypes}
          onServiceTypeOperatorChange={(operator) => setServiceTypeOperator(operator)}
          serviceTypeOptions={SERVICE_TYPE_OPTIONS}
          searchPlaceholder="Search services..."
          showChartToggleControl={false}
        />
        <div className="flex-1 overflow-auto p-4">
          <ServicesTable rows={filteredRows} columns={columns} />
        </div>
      </main>
    </div>
  );
}
