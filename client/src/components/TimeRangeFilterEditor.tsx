import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock } from "lucide-react";

const timeRangeOptions = [
  { value: 'last-5-minutes', label: 'Last 5 minutes' },
  { value: 'last-15-minutes', label: 'Last 15 minutes' },
  { value: 'last-1-hour', label: 'Last 1 hour' },
  { value: 'last-12-hours', label: 'Last 12 hours' },
  { value: 'last-24-hours', label: 'Last 24 hours' },
  { value: 'last-7-days', label: 'Last 7 days' },
  { value: 'last-30-days', label: 'Last 30 days' },
  { value: 'custom-range', label: 'Custom range' },
];

interface TimeRangeFilterEditorProps {
  selectedTimeRange: string;
  startDate?: string;
  endDate?: string;
  onTimeRangeChange: (timeRange: string, startDate?: string, endDate?: string) => void;
  onClose: () => void;
}

export default function TimeRangeFilterEditor({ 
  selectedTimeRange, 
  startDate,
  endDate,
  onTimeRangeChange, 
  onClose 
}: TimeRangeFilterEditorProps) {
  const [currentTimeRange, setCurrentTimeRange] = useState(selectedTimeRange);
  const [currentStartDate, setCurrentStartDate] = useState(startDate || '');
  const [currentEndDate, setCurrentEndDate] = useState(endDate || '');

  const handleTimeRangeChange = (value: string) => {
    setCurrentTimeRange(value);
    if (value !== 'custom-range') {
      // Clear custom dates when switching to predefined range
      setCurrentStartDate('');
      setCurrentEndDate('');
    }
  };

  const handleApply = () => {
    if (currentTimeRange === 'custom-range') {
      onTimeRangeChange(currentTimeRange, currentStartDate, currentEndDate);
    } else {
      onTimeRangeChange(currentTimeRange);
    }
    onClose();
  };

  const isCustomRange = currentTimeRange === 'custom-range';

  return (
    <Card className="w-96 p-0 bg-popover border border-popover-border shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Time range</h3>
        </div>
        
        <Select value={currentTimeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger data-testid="select-time-range">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            {timeRangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Custom Date Range Inputs */}
      {isCustomRange && (
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-xs text-muted-foreground">
                Start date
              </Label>
              <div className="relative">
                <Input
                  id="start-date"
                  type="datetime-local"
                  value={currentStartDate}
                  onChange={(e) => setCurrentStartDate(e.target.value)}
                  className="pl-10"
                  data-testid="input-start-date"
                />
                <Calendar className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-xs text-muted-foreground">
                End date
              </Label>
              <div className="relative">
                <Input
                  id="end-date"
                  type="datetime-local"
                  value={currentEndDate}
                  onChange={(e) => setCurrentEndDate(e.target.value)}
                  className="pl-10"
                  data-testid="input-end-date"
                />
                <Calendar className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 bg-muted/20 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {isCustomRange && currentStartDate && currentEndDate 
            ? `Custom: ${new Date(currentStartDate).toLocaleDateString()} - ${new Date(currentEndDate).toLocaleDateString()}`
            : timeRangeOptions.find(opt => opt.value === currentTimeRange)?.label || 'Select a time range'
          }
        </p>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            data-testid="button-cancel-timerange-filter"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            disabled={isCustomRange && (!currentStartDate || !currentEndDate)}
            data-testid="button-apply-timerange-filter"
          >
            Apply
          </Button>
        </div>
      </div>
    </Card>
  );
}