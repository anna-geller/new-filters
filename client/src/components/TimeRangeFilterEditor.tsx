import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar, Clock, CalendarIcon, RotateCcw } from "lucide-react";
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';

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

interface IntervalFilterEditorProps {
  selectedInterval: string;
  startDate?: string;
  endDate?: string;
  onIntervalChange: (interval: string, startDate?: string, endDate?: string) => void;
  onClose: () => void;
}

// Helper function to parse date and time from string
function parseDateTimeString(dateTimeString?: string): { date: Date | undefined; time: string } {
  if (!dateTimeString) {
    return { date: undefined, time: '00:00' };
  }
  
  const date = new Date(dateTimeString);
  const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  return { date, time };
}

// Helper function to combine date and time into a local datetime string
function combineDateAndTime(date: Date, time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  
  // Format as local datetime string (YYYY-MM-DDTHH:mm:ss)
  const year = combined.getFullYear();
  const month = (combined.getMonth() + 1).toString().padStart(2, '0');
  const day = combined.getDate().toString().padStart(2, '0');
  const hour = combined.getHours().toString().padStart(2, '0');
  const minute = combined.getMinutes().toString().padStart(2, '0');
  const second = combined.getSeconds().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

export default function IntervalFilterEditor({ 
  selectedInterval, 
  startDate,
  endDate,
  onIntervalChange, 
  onClose 
}: IntervalFilterEditorProps) {
  const [currentInterval, setCurrentInterval] = useState(selectedInterval);
  
  // Parse initial dates and times
  const startDateTime = parseDateTimeString(startDate);
  const endDateTime = parseDateTimeString(endDate);
  
  const [currentStartDate, setCurrentStartDate] = useState<Date | undefined>(startDateTime.date);
  const [currentEndDate, setCurrentEndDate] = useState<Date | undefined>(endDateTime.date);
  const [currentStartTime, setCurrentStartTime] = useState(startDateTime.time);
  const [currentEndTime, setCurrentEndTime] = useState(endDateTime.time || '23:59');
  
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const handleTimeRangeChange = (value: string) => {
    setCurrentInterval(value);
    if (value !== 'custom-range') {
      // Clear custom dates when switching to predefined range
      setCurrentStartDate(undefined);
      setCurrentEndDate(undefined);
      setCurrentStartTime('00:00');
      setCurrentEndTime('23:59');
    }
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    setCurrentStartDate(date);
    setStartDateOpen(false);
    
    // If this is the first date selected and no start time is set, default to 00:00
    if (date && currentStartTime === '00:00' && !startDate) {
      setCurrentStartTime('00:00');
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setCurrentEndDate(date);
    setEndDateOpen(false);
    
    // If this is the first date selected and no end time is set, default to 23:59
    if (date && currentEndTime === '23:59' && !endDate) {
      setCurrentEndTime('23:59');
    }
  };

  const handleApply = () => {
    if (currentInterval === 'custom-range') {
      if (currentStartDate && currentEndDate) {
        const startDateString = combineDateAndTime(currentStartDate, currentStartTime);
        const endDateString = combineDateAndTime(currentEndDate, currentEndTime);
        onIntervalChange(currentInterval, startDateString, endDateString);
      }
    } else {
      onIntervalChange(currentInterval);
    }
    onClose();
  };

  const handleReset = () => {
    setCurrentInterval('last-7-days'); // Reset to default value
    setCurrentStartDate(undefined);
    setCurrentEndDate(undefined);
    setCurrentStartTime('00:00');
    setCurrentEndTime('23:59');
  };

  const isCustomRange = currentInterval === 'custom-range';
  
  // Validation: check if end date+time is after start date+time
  const isValidRange = () => {
    if (!isCustomRange || !currentStartDate || !currentEndDate) {
      return true;
    }
    
    const startDateTime = new Date(currentStartDate);
    const [startHours, startMinutes] = currentStartTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes, 0, 0);
    
    const endDateTime = new Date(currentEndDate);
    const [endHours, endMinutes] = currentEndTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes, 0, 0);
    
    return endDateTime >= startDateTime;
  };

  const formatCustomRangeSummary = () => {
    if (!currentStartDate || !currentEndDate) {
      return 'Select start and end dates';
    }
    
    const startFormatted = format(currentStartDate, 'PPP');
    const endFormatted = format(currentEndDate, 'PPP');
    
    if (currentStartDate.toDateString() === currentEndDate.toDateString()) {
      // Same day, show date once with time range
      return `${startFormatted}, ${currentStartTime} - ${currentEndTime}`;
    } else {
      // Different days, show full range
      return `${startFormatted} ${currentStartTime} - ${endFormatted} ${currentEndTime}`;
    }
  };

  return (
    <Card className="w-96 p-0 bg-popover border border-popover-border shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Interval</h3>
        </div>
        
        <Select value={currentInterval} onValueChange={handleTimeRangeChange}>
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

      {/* Custom Date & Time Range Pickers */}
      {isCustomRange && (
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="space-y-4">
            {/* Start Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Start date
                </Label>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal pl-3 pr-3"
                      data-testid="button-start-date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {currentStartDate ? (
                        format(currentStartDate, 'PPP')
                      ) : (
                        <span className="text-muted-foreground">Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <DayPicker
                      mode="single"
                      selected={currentStartDate}
                      onSelect={handleStartDateSelect}
                      disabled={(date) => {
                        return date > new Date() || date < new Date('1900-01-01');
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Start time
                </Label>
                <Input
                  type="time"
                  value={currentStartTime}
                  onChange={(e) => setCurrentStartTime(e.target.value)}
                  data-testid="input-start-time"
                  className="font-mono"
                />
              </div>
            </div>

            {/* End Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  End date
                </Label>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal pl-3 pr-3"
                      data-testid="button-end-date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {currentEndDate ? (
                        format(currentEndDate, 'PPP')
                      ) : (
                        <span className="text-muted-foreground">Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <DayPicker
                      mode="single"
                      selected={currentEndDate}
                      onSelect={handleEndDateSelect}
                      disabled={(date) => {
                        return date > new Date() || 
                               date < new Date('1900-01-01') ||
                               (currentStartDate ? date < currentStartDate : false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  End time
                </Label>
                <Input
                  type="time"
                  value={currentEndTime}
                  onChange={(e) => setCurrentEndTime(e.target.value)}
                  data-testid="input-end-time"
                  className="font-mono"
                />
              </div>
            </div>

            {/* Range validation error */}
            {isCustomRange && currentStartDate && currentEndDate && !isValidRange() && (
              <p className="text-xs text-destructive">
                End date and time must be after start date and time
              </p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 bg-muted/20 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {isCustomRange && currentStartDate && currentEndDate 
            ? formatCustomRangeSummary()
            : timeRangeOptions.find(opt => opt.value === currentInterval)?.label || 'Select a time range'
          }
        </p>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="px-2"
                  data-testid="button-reset-timerange-filter"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset to original value</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button
            size="sm"
            onClick={handleApply}
            disabled={isCustomRange && (!currentStartDate || !currentEndDate || !isValidRange())}
            className="flex-1"
            data-testid="button-apply-timerange-filter"
          >
            Apply
          </Button>
        </div>
      </div>
    </Card>
  );
}