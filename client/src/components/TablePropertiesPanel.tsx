import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, GripVertical, X } from "lucide-react";
import { ColumnConfig } from './ExecutionsTable';

interface TablePropertiesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnConfig[];
  onToggleColumn: (columnId: string) => void;
  onReorderColumns: (draggedId: string, targetId: string) => void;
}

export default function TablePropertiesPanel({ 
  isOpen, 
  onClose, 
  columns, 
  onToggleColumn, 
  onReorderColumns 
}: TablePropertiesPanelProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleVisibility = (columnId: string) => {
    onToggleColumn(columnId);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    setDraggedItem(columnId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetColumnId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetColumnId) {
      setDraggedItem(null);
      return;
    }

    onReorderColumns(draggedItem, targetColumnId);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const visibleCount = columns.filter(col => col.visible).length;

  return (
    <Card className="absolute top-full right-0 mt-2 w-96 p-0 bg-popover border border-popover-border shadow-lg z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="text-sm font-medium text-foreground">Customize Table Columns</h3>
          <p className="text-xs text-muted-foreground mt-1">Drag to reorder</p>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
          data-testid="button-close-table-properties"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Column List */}
      <div className="max-h-80 overflow-y-auto">
        {columns
          .sort((a, b) => a.order - b.order)
          .map((column) => (
          <div
            key={column.id}
            draggable
            onDragStart={(e) => handleDragStart(e, column.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-3 p-3 border-b border-border/50 hover:bg-muted/30 cursor-move ${
              draggedItem === column.id ? 'opacity-50' : ''
            }`}
            data-testid={`column-item-${column.id}`}
          >
            {/* Drag Handle */}
            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />

            {/* Column Info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">{column.label}</div>
              <div className="text-xs text-muted-foreground">{column.description}</div>
            </div>

            {/* Visibility Toggle */}
            <button
              onClick={() => handleToggleVisibility(column.id)}
              className={`p-1 rounded hover-elevate ${
                column.visible 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-muted-foreground'
              }`}
              data-testid={`toggle-column-${column.id}`}
            >
              {column.visible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/20">
        <p className="text-xs text-muted-foreground text-center">
          {visibleCount} of {columns.length} columns visible
        </p>
      </div>
    </Card>
  );
}