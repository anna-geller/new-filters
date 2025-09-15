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

  const handleToggleFilter = (filterId: string) => {
    setFilterOptions(prev => 
      prev.map(option => 
        option.id === filterId 
          ? { ...option, enabled: !option.enabled }
          : option
      )
    );
  };

  const handleReorderFilters = (draggedId: string, targetId: string) => {
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

  return (
    <div className="p-4 relative">
      <div className="h-64">
        <FilterCustomizationPanel
          isOpen={isOpen}
          filterOptions={filterOptions}
          onToggleFilter={handleToggleFilter}
          onReorderFilters={handleReorderFilters}
          onClose={() => setIsOpen(false)}
        />
      </div>
    </div>
  );
}