import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

import {
  getMaintenanceState,
  subscribeToMaintenanceState,
} from "@/lib/maintenanceModeStore";
import type { MaintenanceState } from "@/types/maintenanceMode";

function formatRange(startedAt: string) {
  const date = new Date(startedAt);
  if (Number.isNaN(date.getTime())) {
    return "Maintenance mode is active.";
  }
  return `Maintenance mode active since ${date.toLocaleString()}.`;
}

export default function ActiveMaintenanceBanner() {
  const [state, setState] = useState<MaintenanceState | null>(() => getMaintenanceState());

  useEffect(() => {
    return subscribeToMaintenanceState(setState);
  }, []);

  if (!state?.active) {
    return null;
  }

  return (
    <div className="border-b border-border bg-[#1F232D]">
      <div className="px-6 py-3">
        <div className="flex items-start gap-3 rounded-md border border-amber-500/60 bg-amber-600/10 px-4 py-3">
          <ShieldAlert className="h-5 w-5 text-amber-300" />
          <div className="space-y-1 text-sm text-amber-100">
            <p className="font-medium text-amber-200">Maintenance mode active. No new task runs will start; in-progress runs will finish.</p>
            <p className="text-amber-100/70">{formatRange(state.startedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
