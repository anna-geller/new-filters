import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, RefreshCw, Settings } from "lucide-react";
import CustomizeFiltersButton from './CustomizeFiltersButton';
import FilterBadge from './FilterBadge';
import FilterCustomizationPanel from './FilterCustomizationPanel';
import SearchBar from './SearchBar';
import TablePropertiesPanel from './TablePropertiesPanel';
import { ColumnConfig, defaultColumns } from './ExecutionsTable';

interface FilterOption {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
}

interface FilterInterfaceProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeFilters: ActiveFilter[];
  onClearFilter: (filterId: string) => void;
  onEditFilter: (filterId: string) => void;
  showChart: boolean;
  onToggleShowChart: (enabled: boolean) => void;
  periodicRefresh: boolean;
  onTogglePeriodicRefresh: (enabled: boolean) => void;
  onRefreshData: () => void;
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
}

const defaultFilterOptions: FilterOption[] = [
  { id: 'state', label: 'State', description: 'Filter by execution state', enabled: true },
  { id: 'timerange', label: 'Time range', description: 'Filter by execution time', enabled: true },
  { id: 'namespace', label: 'Namespace', description: 'Filter by namespace', enabled: false },
  { id: 'labels', label: 'Labels', description: 'Filter by execution labels', enabled: false },
  { id: 'duration', label: 'Duration', description: 'Filter by execution duration', enabled: false },
];

export default function FilterInterface({
  searchValue,
  onSearchChange,
  activeFilters,
  onClearFilter,
  onEditFilter,
  showChart,
  onToggleShowChart,
  periodicRefresh,
  onTogglePeriodicRefresh,
  onRefreshData,
  columns,
  onColumnsChange
}: FilterInterfaceProps) {
  const [customizationOpen, setCustomizationOpen] = useState(false);
  const [tableOptionsOpen, setTableOptionsOpen] = useState(false);
  const [tablePropertiesOpen, setTablePropertiesOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState(defaultFilterOptions);

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
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        {/* Customize Filters Button */}
        <CustomizeFiltersButton
          onClick={() => setCustomizationOpen(!customizationOpen)}
          isOpen={customizationOpen}
        />

        {/* Search Bar - Always shown first */}
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Search executions..."
        />

        {/* Active Filter Badges - Only after search bar */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {activeFilters.map((filter) => (
              <FilterBadge
                key={filter.id}
                label={filter.label}
                value={filter.value}
                onClear={() => onClearFilter(filter.id)}
                onEdit={() => onEditFilter(filter.id)}
              />
            ))}
          </div>
        )}

        {/* Save Filter and Saved Filters - Right aligned */}
        <div className="ml-auto flex items-center gap-3">
          <button className="text-sm text-primary hover:text-primary/80" data-testid="button-save-filter">
            Save filter
          </button>
          <button className="text-sm text-muted-foreground hover:text-foreground" data-testid="button-saved-filters">
            Saved filters
          </button>
          
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTablePropertiesOpen(!tablePropertiesOpen)}
                className="flex items-center gap-2 hover-elevate"
                data-testid="button-columns"
              >
                <Settings className="h-4 w-4" />
                Columns
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Customization Panel */}
      <FilterCustomizationPanel
        isOpen={customizationOpen}
        filterOptions={filterOptions}
        onToggleFilter={handleToggleFilter}
        onClose={() => setCustomizationOpen(false)}
      />

      {/* Table Properties Panel */}
      <TablePropertiesPanel
        isOpen={tablePropertiesOpen}
        onClose={() => setTablePropertiesOpen(false)}
        columns={columns}
        onToggleColumn={handleColumnToggle}
        onReorderColumns={handleColumnReorder}
      />
    </div>
  );
}