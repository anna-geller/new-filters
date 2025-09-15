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
  onTableOptions: () => void;
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
  onTableOptions
}: FilterInterfaceProps) {
  const [customizationOpen, setCustomizationOpen] = useState(false);
  const [tableOptionsOpen, setTableOptionsOpen] = useState(false);
  const [tablePropertiesOpen, setTablePropertiesOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState(defaultFilterOptions);

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
          <button className="text-sm text-primary hover:text-primary/80">
            Save filter
          </button>
          <button className="text-sm text-muted-foreground hover:text-foreground">
            Saved filters
          </button>
          
          {/* Table Options Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTableOptionsOpen(!tableOptionsOpen)}
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
            <div className="flex items-center gap-6">
              {/* Show Chart */}
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
            </div>

            {/* Table Properties Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTablePropertiesOpen(!tablePropertiesOpen)}
              className="flex items-center gap-2 hover-elevate"
              data-testid="button-table-properties"
            >
              <Settings className="h-4 w-4" />
              Table properties
            </Button>
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
      />
    </div>
  );
}