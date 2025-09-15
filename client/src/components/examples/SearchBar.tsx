import { useState } from 'react';
import SearchBar from '../SearchBar';

export default function SearchBarExample() {
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="p-4 space-y-4">
      <SearchBar 
        value={searchValue}
        onChange={setSearchValue}
        placeholder="Search executions..."
      />
      <div className="text-sm text-muted-foreground">
        Current search: "{searchValue}"
      </div>
    </div>
  );
}