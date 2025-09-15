import { useState } from 'react';
import FilterInterface from '../FilterInterface';

const mockActiveFilters = [
  { id: 'state', label: 'State', value: '6 selected' },
  { id: 'timerange', label: 'Time range', value: 'last 7 days' },
];

export default function FilterInterfaceExample() {
  const [searchValue, setSearchValue] = useState('');
  const [activeFilters, setActiveFilters] = useState(mockActiveFilters);
  const [showChart, setShowChart] = useState(false);
  const [periodicRefresh, setPeriodicRefresh] = useState(true);

  const handleClearFilter = (filterId: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== filterId));
    console.log(`Cleared filter: ${filterId}`);
  };

  const handleEditFilter = (filterId: string) => {
    console.log(`Editing filter: ${filterId}`);
  };

  return (
    <div className="w-full border rounded-md">
      <FilterInterface
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        activeFilters={activeFilters}
        onClearFilter={handleClearFilter}
        onEditFilter={handleEditFilter}
        showChart={showChart}
        onToggleShowChart={setShowChart}
        periodicRefresh={periodicRefresh}
        onTogglePeriodicRefresh={setPeriodicRefresh}
        onRefreshData={() => console.log('Refreshing data...')}
        onTableOptions={() => console.log('Opening table options...')}
      />
    </div>
  );
}