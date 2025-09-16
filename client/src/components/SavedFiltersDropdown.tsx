import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookmarkCheck, ChevronDown, Trash2, Edit2 } from "lucide-react";
import { SavedFilter } from '../types/savedFilters';

interface SavedFiltersDropdownProps {
  savedFilters: SavedFilter[];
  onLoadFilter: (filter: SavedFilter) => void;
  onDeleteFilter: (filterId: string) => void;
  onEditFilter: (filterId: string) => void;
}

export default function SavedFiltersDropdown({ 
  savedFilters, 
  onLoadFilter, 
  onDeleteFilter,
  onEditFilter
}: SavedFiltersDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);


  const handleLoadFilter = (filter: SavedFilter) => {
    onLoadFilter(filter);
    setIsOpen(false);
  };

  const handleDeleteFilter = (e: React.MouseEvent, filterId: string) => {
    e.stopPropagation();
    onDeleteFilter(filterId);
  };

  const handleEditFilter = (e: React.MouseEvent, filterId: string) => {
    e.stopPropagation();
    onEditFilter(filterId);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          data-testid="saved-filters-dropdown-trigger"
        >
          <BookmarkCheck className="w-4 h-4" />
          Saved Filters
          <Badge variant="secondary" className="ml-1 text-xs">
            {savedFilters.length}
          </Badge>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-80" data-testid="saved-filters-dropdown-content">
        <DropdownMenuLabel>Saved Filter Sets</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {savedFilters.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No saved filters yet
          </div>
        ) : (
          savedFilters
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .map((filter) => (
              <DropdownMenuItem
                key={filter.id}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-accent"
                onClick={() => handleLoadFilter(filter)}
                data-testid={`saved-filter-item-${filter.id}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium text-sm truncate">{filter.name}</span>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={(e) => handleEditFilter(e, filter.id)}
                      className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                      data-testid={`edit-saved-filter-${filter.id}`}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteFilter(e, filter.id)}
                      className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                      data-testid={`delete-saved-filter-${filter.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                {filter.description && (
                  <span className="text-xs text-muted-foreground truncate w-full">
                    {filter.description}
                  </span>
                )}
                
              </DropdownMenuItem>
            ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}