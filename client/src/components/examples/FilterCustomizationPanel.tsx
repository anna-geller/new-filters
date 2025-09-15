import { useState } from 'react';
import FilterCustomizationPanel from '../FilterCustomizationPanel';

const mockFilterOptions = [
  { id: 'state', label: 'State', description: 'Filter by execution state', enabled: true },
  { id: 'timerange', label: 'Time range', description: 'Filter by execution time', enabled: true },
  { id: 'namespace', label: 'Namespace', description: 'Filter by namespace', enabled: false },
  { id: 'labels', label: 'Labels', description: 'Filter by execution labels', enabled: false },
  { id: 'duration', label: 'Duration', description: 'Filter by execution duration', enabled: false },
];

export default function FilterCustomizationPanelExample() {
  const [isOpen, setIsOpen] = useState(true);
  const [filterOptions, setFilterOptions] = useState(mockFilterOptions);

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
    <div className="p-4 relative">
      <div className="h-64">
        <FilterCustomizationPanel
          isOpen={isOpen}
          filterOptions={filterOptions}
          onToggleFilter={handleToggleFilter}
          onClose={() => setIsOpen(false)}
        />
      </div>
    </div>
  );
}