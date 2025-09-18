import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, RefreshCw, Settings, RotateCcw } from "lucide-react";

interface TableControlsProps {
  isExpanded: boolean;
  onToggleExpanded: () => void;
  periodicRefresh: boolean;
  onTogglePeriodicRefresh: (enabled: boolean) => void;
  onRefreshData: () => void;
  onTableOptions: () => void;
}

export default function TableControls({
  isExpanded,
  onToggleExpanded,
  periodicRefresh,
  onTogglePeriodicRefresh,
  onRefreshData,
  onTableOptions
}: TableControlsProps) {
  return (
    <div className="border-t border-border">
      {/* Toggle Button */}
      <div className="flex items-center justify-between px-4 py-2 bg-card/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleExpanded}
          className="flex items-center gap-2 text-muted-foreground hover-elevate"
          data-testid="button-toggle-table-controls"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          Table options
        </Button>
      </div>

      {/* Expanded Controls */}
      {isExpanded && (
        <div className="px-4 py-3 border-t border-border bg-card/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Periodic Refresh */}
              <div className="flex items-center gap-2">
                <Switch
                  id="periodic-refresh"
                  checked={periodicRefresh}
                  onCheckedChange={onTogglePeriodicRefresh}
                  data-testid="switch-periodic-refresh"
                  className="w-8 h-[18.29px]"
                  style={{
                    backgroundColor: periodicRefresh ? 'var(--ks-button-background-primary, #8405FF)' : undefined
                  }}
                />
                <Label htmlFor="periodic-refresh" className="text-sm cursor-pointer">
                  Periodic refresh
                </Label>
              </div>

              {/* Refresh Data Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefreshData}
                className="flex items-center gap-2 hover-elevate"
                data-testid="button-refresh-data"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh data
              </Button>
            </div>

            {/* Table Options Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onTableOptions}
              className="flex items-center gap-2 hover-elevate"
              data-testid="button-table-options"
            >
              <Settings className="h-4 w-4" />
              Table properties
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}