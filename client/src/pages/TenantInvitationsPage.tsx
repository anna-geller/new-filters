import { useEffect, useMemo, useState } from "react";
import FilterInterface, { type FilterOption } from "@/components/FilterInterface";
import InvitationsTable, { type InvitationRow } from "@/components/InvitationsTable";
import type { ColumnConfig } from "@/components/ExecutionsTable";
import { SavedFilter } from "@/types/savedFilters";
import { tenantInvitationsSavedFiltersStorage } from "@/utils/tenantInvitationsSavedFiltersStorage";

const DEFAULT_VISIBLE_FILTERS: string[] = [];

const INVITATION_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "EXPIRED", label: "Expired" },
];

const TENANT_INVITATIONS_FILTER_OPTIONS: FilterOption[] = [
  { id: "status", label: "Status", description: "Filter by invitation status", enabled: false, order: 1 },
  { id: "superadmin", label: "Superadmin", description: "Filter by superadmin flag", enabled: false, order: 2 },
  { id: "user", label: "Email", description: "Filter by invited email", enabled: false, order: 3 },
];

const TENANT_INVITATIONS_COLUMNS: ColumnConfig[] = [
  { id: "email", label: "Email", description: "The invited user's email address", visible: true, order: 1 },
  { id: "status", label: "Status", description: "Current state of the invitation", visible: true, order: 2 },
  { id: "roles", label: "Roles", description: "Roles assigned to the invited user", visible: true, order: 3 },
  { id: "groups", label: "Groups", description: "Groups assigned upon acceptance", visible: true, order: 4 },
  { id: "superadmin", label: "Superadmin", description: "Whether the invitation grants superadmin", visible: true, order: 5 },
  { id: "sentAt", label: "Sent at", description: "When the invitation was sent", visible: true, order: 6 },
  { id: "expiredAt", label: "Expired at", description: "When the invitation expires", visible: true, order: 7 },
];

const TENANT_INVITATION_ROWS: InvitationRow[] = [
  {
    email: "test1@kestra.io",
    status: "PENDING",
    roles: ["Admin"],
    groups: [],
    superadmin: true,
    sentAt: "Wed, Sep 24, 2025 5:48 PM",
    expiredAt: "Wed, Oct 1, 2025 5:48 PM",
  },
  {
    email: "test2@kestra.io",
    status: "ACCEPTED",
    roles: ["Admin"],
    groups: [],
    superadmin: false,
    sentAt: "Wed, Aug 6, 2025 4:22 PM",
    expiredAt: "Wed, Aug 13, 2025 4:22 PM",
  },
  {
    email: "test3@kestra.io",
    status: "EXPIRED",
    roles: [],
    groups: ["Developers"],
    superadmin: false,
    sentAt: "Wed, Aug 4, 2025 4:24 PM",
    expiredAt: "Wed, Aug 24, 2025 4:24 PM",
  },
];

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

const SUPERADMIN_LABEL_MAP: Record<string, string> = {
  true: "Superadmin",
  false: "Non-Superadmin",
};

const INVITATION_STATUS_LABEL_MAP: Record<string, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  EXPIRED: "Expired",
};

export default function TenantInvitationsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [userValue, setUserValue] = useState("");
  const [selectedInvitationStatuses, setSelectedInvitationStatuses] = useState<string[]>([]);
  const [invitationStatusOperator, setInvitationStatusOperator] = useState<"in" | "not-in">("in");
  const [selectedSuperadminStatuses, setSelectedSuperadminStatuses] = useState<string[]>([]);
  const [superadminOperator, setSuperadminOperator] = useState<"in" | "not-in">("in");
  const [showChart, setShowChart] = useState(false);
  const [periodicRefresh, setPeriodicRefresh] = useState(true);
  const [selectedInterval, setSelectedInterval] = useState("all-time");
  const [columns, setColumns] = useState<ColumnConfig[]>(TENANT_INVITATIONS_COLUMNS.map((column) => ({ ...column })));
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  useEffect(() => {
    setSavedFilters(tenantInvitationsSavedFiltersStorage.getAll());
  }, []);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];

    if (visibleFilters.includes("status") && selectedInvitationStatuses.length > 0) {
      const valueLabel = selectedInvitationStatuses
        .map((status) => INVITATION_STATUS_LABEL_MAP[status] ?? status)
        .join(", ");
      filters.push({
        id: "status",
        label: "Status",
        value: valueLabel,
        operator: invitationStatusOperator === "not-in" ? "not in" : "in",
      });
    }

    if (visibleFilters.includes("superadmin") && selectedSuperadminStatuses.length > 0) {
      const valueLabel = selectedSuperadminStatuses
        .map((status) => SUPERADMIN_LABEL_MAP[status])
        .join(", ");
      filters.push({
        id: "superadmin",
        label: "Superadmin",
        value: valueLabel,
        operator: superadminOperator === "not-in" ? "not in" : "in",
      });
    }

    if (visibleFilters.includes("user") && userValue.trim()) {
      filters.push({
        id: "user",
        label: "Email",
        value: userValue.trim(),
        operator: "matches",
      });
    }

    return filters;
  }, [
    invitationStatusOperator,
    selectedInvitationStatuses,
    selectedSuperadminStatuses,
    superadminOperator,
    userValue,
    visibleFilters,
  ]);

  const filteredRows = useMemo(() => {
    const searchTerm = searchValue.trim().toLowerCase();
    const emailTerm = userValue.trim().toLowerCase();

    return TENANT_INVITATION_ROWS.filter((row) => {
      if (searchTerm) {
        const haystack = [
          row.email,
          row.status,
          ...row.roles,
          ...row.groups,
          row.superadmin ? "superadmin" : "non-superadmin",
          row.sentAt,
          row.expiredAt,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(searchTerm)) {
          return false;
        }
      }

      if (emailTerm && !row.email.toLowerCase().includes(emailTerm)) {
        return false;
      }

      if (selectedInvitationStatuses.length > 0) {
        const matchesSelection = selectedInvitationStatuses.includes(row.status);
        if (invitationStatusOperator === "in") {
          if (!matchesSelection) {
            return false;
          }
        } else if (matchesSelection) {
          return false;
        }
      }

      if (selectedSuperadminStatuses.length > 0) {
        const isSuperadmin = row.superadmin ? "true" : "false";
        const matchesSuperadmin = selectedSuperadminStatuses.includes(isSuperadmin);
        if (superadminOperator === "in") {
          if (!matchesSuperadmin) {
            return false;
          }
        } else if (matchesSuperadmin) {
          return false;
        }
      }

      return true;
    });
  }, [
    invitationStatusOperator,
    searchValue,
    selectedInvitationStatuses,
    selectedSuperadminStatuses,
    superadminOperator,
    userValue,
  ]);

  const handleClearFilter = (filterId: string) => {
    if (filterId === "status") {
      setSelectedInvitationStatuses([]);
      setInvitationStatusOperator("in");
    } else if (filterId === "superadmin") {
      setSelectedSuperadminStatuses([]);
      setSuperadminOperator("in");
    } else if (filterId === "user") {
      setUserValue("");
    }
    setVisibleFilters((prev) => prev.filter((id) => id !== filterId));
  };

  const handleResetFilter = (filterId: string) => {
    if (filterId === "status") {
      setSelectedInvitationStatuses([]);
      setInvitationStatusOperator("in");
    } else if (filterId === "superadmin") {
      setSelectedSuperadminStatuses([]);
      setSuperadminOperator("in");
    } else if (filterId === "user") {
      setUserValue("");
    }
  };

  const handleResetFilters = () => {
    setSearchValue("");
    setUserValue("");
    setSelectedInvitationStatuses([]);
    setInvitationStatusOperator("in");
    setSelectedSuperadminStatuses([]);
    setSuperadminOperator("in");
    setShowChart(false);
    setPeriodicRefresh(true);
    setSelectedInterval("all-time");
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
    setColumns(TENANT_INVITATIONS_COLUMNS.map((column) => ({ ...column })));
  };

  const handleSaveFilter = (name: string, description: string) => {
    const now = new Date().toISOString();
    const filter: SavedFilter = {
      id: `tenant-invitations-filter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      filterState: {
        searchValue,
        selectedStates: [],
        statesOperator: "in",
        selectedInterval,
        intervalStartDate: undefined,
        intervalEndDate: undefined,
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
        userValue,
        selectedInvitationStatuses,
        invitationStatusOperator,
        selectedSuperadminStatuses,
        superadminOperator,
      },
    };

    tenantInvitationsSavedFiltersStorage.save(filter);
    setSavedFilters(tenantInvitationsSavedFiltersStorage.getAll());
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;
    setSearchValue(state.searchValue ?? "");
    setUserValue(state.userValue ?? "");
    setSelectedInvitationStatuses(state.selectedInvitationStatuses ?? []);
    setInvitationStatusOperator((state.invitationStatusOperator as "in" | "not-in") || "in");
    setSelectedSuperadminStatuses(state.selectedSuperadminStatuses ?? []);
    setSuperadminOperator((state.superadminOperator as "in" | "not-in") || "in");
    setSelectedInterval(state.selectedInterval ?? "all-time");

    const restoredVisibleFilters = state.visibleFilters && state.visibleFilters.length > 0
      ? Array.from(new Set(state.visibleFilters))
      : DEFAULT_VISIBLE_FILTERS;

    setVisibleFilters(restoredVisibleFilters);
  };

  const handleDeleteFilter = (filterId: string) => {
    tenantInvitationsSavedFiltersStorage.delete(filterId);
    setSavedFilters(tenantInvitationsSavedFiltersStorage.getAll());
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    tenantInvitationsSavedFiltersStorage.update(filterId, { name, description });
    setSavedFilters(tenantInvitationsSavedFiltersStorage.getAll());
  };

  const handleRefreshData = () => {
    console.log("Refreshing tenant invitations data...");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-[#262A35]/80">
        <div className="flex items-center justify-between px-6 py-4 bg-[#2F3341]">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Tenant Administration</span>
            <h1 className="text-xl font-semibold text-foreground">Invitations</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>Jump to...</span>
            <span>Ctrl+Cmd+K</span>
            <button className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover-elevate">
              Create
            </button>
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
          selectedStates={[]}
          statesOperator="in"
          onSelectedStatesChange={() => {}}
          onStatesOperatorChange={() => {}}
          selectedInterval={selectedInterval}
          intervalStartDate={undefined}
          intervalEndDate={undefined}
          onIntervalChange={(interval) => setSelectedInterval(interval)}
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
          userValue={userValue}
          onUserChange={setUserValue}
          selectedSuperadminStatuses={selectedSuperadminStatuses}
          superadminOperator={superadminOperator}
          onSuperadminSelectionChange={setSelectedSuperadminStatuses}
          onSuperadminOperatorChange={setSuperadminOperator}
          selectedInvitationStatuses={selectedInvitationStatuses}
          invitationStatusOperator={invitationStatusOperator}
          onInvitationStatusesChange={setSelectedInvitationStatuses}
          onInvitationStatusOperatorChange={setInvitationStatusOperator}
          invitationStatusOptions={INVITATION_STATUS_OPTIONS}
          userFilterTitle="Email"
          userFilterPlaceholder="Search by email..."
          savedFilters={savedFilters}
          onSaveFilter={handleSaveFilter}
          onLoadFilter={handleLoadFilter}
          onDeleteFilter={handleDeleteFilter}
          onUpdateFilter={handleUpdateFilter}
          visibleFilters={visibleFilters}
          onVisibleFiltersChange={setVisibleFilters}
          onResetFilter={handleResetFilter}
          filterOptions={TENANT_INVITATIONS_FILTER_OPTIONS}
          searchPlaceholder="Search invitations..."
          showChartToggleControl={false}
        />
        <div className="flex-1 overflow-auto p-4 bg-[#1F232D]">
          <InvitationsTable rows={filteredRows} columns={columns} />
        </div>
      </main>
    </div>
  );
}
