import FilterBadge from '../FilterBadge';

export default function FilterBadgeExample() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap gap-2">
        <FilterBadge 
          label="Time range" 
          value="last 7 days" 
          onClear={() => console.log('Clear time range filter')}
          onEdit={() => console.log('Edit time range filter')}
        />
        <FilterBadge 
          label="State" 
          value="6 selected" 
          onClear={() => console.log('Clear state filter')}
          onEdit={() => console.log('Edit state filter')}
        />
        <FilterBadge 
          label="Namespace" 
          value="production" 
          onClear={() => console.log('Clear namespace filter')}
          onEdit={() => console.log('Edit namespace filter')}
        />
      </div>
    </div>
  );
}