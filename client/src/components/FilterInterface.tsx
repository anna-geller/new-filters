import { useState } from 'react';
import CustomizeFiltersButton from './CustomizeFiltersButton';
import FilterBadge from './FilterBadge';
import FilterCustomizationPanel from './FilterCustomizationPanel';
import SearchBar from './SearchBar';

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
  onEditFilter
}: FilterInterfaceProps) {
  const [customizationOpen, setCustomizationOpen] = useState(false);
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
        </div>
      </div>

      {/* Customization Panel */}
      <FilterCustomizationPanel
        isOpen={customizationOpen}
        filterOptions={filterOptions}
        onToggleFilter={handleToggleFilter}
        onClose={() => setCustomizationOpen(false)}
      />
    </div>
  );
}