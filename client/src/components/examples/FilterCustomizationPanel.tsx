import { useState } from 'react';
import FilterCustomizationPanel from '../FilterCustomizationPanel';

const mockFilterOptions = [
  { id: 'state', label: 'State', description: 'Filter by execution state', enabled: true, order: 1 },
  { id: 'timerange', label: 'Time range', description: 'Filter by execution time', enabled: true, order: 2 },
  { id: 'namespace', label: 'Namespace', description: 'Filter by namespace', enabled: false, order: 3 },
  { id: 'labels', label: 'Labels', description: 'Filter by execution labels', enabled: false, order: 4 },
  { id: 'duration', label: 'Duration', description: 'Filter by execution duration', enabled: false, order: 5 },
];

export default function FilterCustomizationPanelExample() {
  const [isOpen, setIsOpen] = useState(true);
  const [filterOptions, setFilterOptions] = useState(mockFilterOptions);

  const activeFilters = filterOptions
    .filter(option => option.enabled)
    .map(option => ({
      id: option.id,
      label: option.label,
      value: 'Configured'
    }));

  const handleAddFilter = (filterId: string) => {
    setFilterOptions(prev =>
      prev.map(option =>
        option.id === filterId
          ? { ...option, enabled: true }
          : option
      )
    );
  };

  return (
    <div className="p-4 relative">
      <div className="h-64">
        <FilterCustomizationPanel
          isOpen={isOpen}
          filterOptions={filterOptions}
          activeFilters={activeFilters}
          onAddFilter={handleAddFilter}
          onClose={() => setIsOpen(false)}
        />
      </div>
    </div>
  );
}
