import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoreHorizontal, ExternalLink } from "lucide-react";

interface Execution {
  id: string;
  startDate: string;
  endDate: string;
  duration: string;
  namespace: string;
  flow: string;
  labels: string[];
  state: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'QUEUED' | 'WARNING' | 'PAUSED' | 'CREATED' | 'RESTARTED' | 'CANCELLED';
}

interface ExecutionsTableProps {
  executions: Execution[];
}

const stateColors = {
  SUCCESS: 'bg-green-900/30 text-green-400 border-green-700',
  FAILED: 'bg-red-900/30 text-red-400 border-red-700',
  RUNNING: 'bg-blue-900/30 text-blue-400 border-blue-700',
  QUEUED: 'bg-yellow-900/30 text-yellow-400 border-yellow-700',
  WARNING: 'bg-orange-900/30 text-orange-400 border-orange-700',
  PAUSED: 'bg-gray-900/30 text-gray-400 border-gray-700',
  CREATED: 'bg-purple-900/30 text-purple-400 border-purple-700',
  RESTARTED: 'bg-teal-900/30 text-teal-400 border-teal-700',
  CANCELLED: 'bg-red-900/30 text-red-400 border-red-700'
};

export default function ExecutionsTable({ executions }: ExecutionsTableProps) {
  return (
    <Card className="overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-8 gap-4 p-4 text-sm font-medium text-muted-foreground border-b border-border bg-card/50">
        <div>ID</div>
        <div>Start date</div>
        <div>End date</div>
        <div>Duration</div>
        <div>Namespace</div>
        <div>Flow</div>
        <div>Labels</div>
        <div>State</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-border">
        {executions.map((execution) => (
          <div
            key={execution.id}
            className="grid grid-cols-8 gap-4 p-4 text-sm hover-elevate"
            data-testid={`row-execution-${execution.id}`}
          >
            {/* ID */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-primary">{execution.id}</span>
              <Button size="icon" variant="ghost" className="h-4 w-4">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>

            {/* Start Date */}
            <div className="text-foreground">{execution.startDate}</div>

            {/* End Date */}
            <div className="text-foreground">{execution.endDate}</div>

            {/* Duration */}
            <div className="text-foreground">{execution.duration}</div>

            {/* Namespace */}
            <div className="text-foreground">{execution.namespace}</div>

            {/* Flow */}
            <div className="text-primary">{execution.flow}</div>

            {/* Labels */}
            <div className="flex flex-wrap gap-1">
              {execution.labels.slice(0, 2).map((label, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {label}
                </Badge>
              ))}
              {execution.labels.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{execution.labels.length - 2}
                </Badge>
              )}
            </div>

            {/* State */}
            <div className="flex items-center justify-between">
              <Badge className={`text-xs ${stateColors[execution.state]}`}>
                {execution.state}
              </Badge>
              <Button size="icon" variant="ghost" className="h-4 w-4">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}