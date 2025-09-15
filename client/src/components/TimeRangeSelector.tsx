import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface TimeRangeSelectorProps {
  selectedTimeRange: string;
  startDate?: string;
  endDate?: string;
  onTimeRangeChange: (timeRange: string, startDate?: string, endDate?: string) => void;
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

export default function TimeRangeSelector({ 
  selectedTimeRange, 
  startDate,
  endDate,
  onTimeRangeChange
}: TimeRangeSelectorProps) {
  const [customRangeOpen, setCustomRangeOpen] = useState(false);
  
  const { date: startDateObj, time: startTime } = parseDateTimeString(startDate);
  const { date: endDateObj, time: endTime } = parseDateTimeString(endDate);
  
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(startDateObj);
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(endDateObj);
  const [tempStartTime, setTempStartTime] = useState(startTime);
  const [tempEndTime, setTempEndTime] = useState(endTime);

  const handleTimeRangeSelect = (value: string) => {
    if (value === 'custom-range') {
      setCustomRangeOpen(true);
    } else {
      onTimeRangeChange(value);
      setCustomRangeOpen(false);
    }
  };

  const handleApplyCustomRange = () => {
    if (tempStartDate && tempEndDate) {
      const startDateTimeString = combineDateAndTime(tempStartDate, tempStartTime);
      const endDateTimeString = combineDateAndTime(tempEndDate, tempEndTime);
      onTimeRangeChange('custom-range', startDateTimeString, endDateTimeString);
    }
    setCustomRangeOpen(false);
  };

  const handleClearCustomRange = () => {
    setTempStartDate(undefined);
    setTempEndDate(undefined);
    setTempStartTime('00:00');
    setTempEndTime('00:00');
    onTimeRangeChange('last-7-days');
    setCustomRangeOpen(false);
  };

  // Get display value for the select
  const getDisplayValue = () => {
    if (selectedTimeRange === 'custom-range' && startDate && endDate) {
      return `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
    }
    const option = timeRangeOptions.find(opt => opt.value === selectedTimeRange);
    return option?.label || 'Last 7 days';
  };

  return (
    <div className="relative">
      <Select value={selectedTimeRange} onValueChange={handleTimeRangeSelect}>
        <SelectTrigger className="w-40 bg-card border-border">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Select time range">
              {getDisplayValue()}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          {timeRangeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Custom Range Popover */}
      {customRangeOpen && (
        <Popover open={customRangeOpen} onOpenChange={setCustomRangeOpen}>
          <PopoverTrigger asChild>
            <div className="absolute top-full left-0 mt-2 z-50" />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-4 space-y-4">
              <div className="text-sm font-medium">Custom Time Range</div>
              
              {/* Start Date and Time */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Start Date & Time</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-32 justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tempStartDate ? format(tempStartDate, 'MMM dd') : 'Start date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <DayPicker
                        mode="single"
                        selected={tempStartDate}
                        onSelect={setTempStartDate}
                        className="p-3"
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={tempStartTime}
                    onChange={(e) => setTempStartTime(e.target.value)}
                    className="w-24"
                  />
                </div>
              </div>

              {/* End Date and Time */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">End Date & Time</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-32 justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tempEndDate ? format(tempEndDate, 'MMM dd') : 'End date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <DayPicker
                        mode="single"
                        selected={tempEndDate}
                        onSelect={setTempEndDate}
                        className="p-3"
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={tempEndTime}
                    onChange={(e) => setTempEndTime(e.target.value)}
                    className="w-24"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleApplyCustomRange}
                  disabled={!tempStartDate || !tempEndDate}
                  className="flex-1"
                >
                  Apply
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearCustomRange}
                  className="flex-1"
                >
                  Clear
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}