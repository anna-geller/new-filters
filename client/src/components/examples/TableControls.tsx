import { useState } from 'react';
import TableControls from '../TableControls';

export default function TableControlsExample() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [periodicRefresh, setPeriodicRefresh] = useState(true);

  return (
    <div className="w-full border rounded-md">
      <TableControls
        isExpanded={isExpanded}
        onToggleExpanded={() => setIsExpanded(!isExpanded)}
        periodicRefresh={periodicRefresh}
        onTogglePeriodicRefresh={setPeriodicRefresh}
        onRefreshData={() => console.log('Refreshing data...')}
        onTableOptions={() => console.log('Opening table options...')}
      />
    </div>
  );
}