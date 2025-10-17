export type KillSwitchType = "KILL" | "GRACEFULLY_KILL" | "IGNORE";

export type KillSwitchScope = "tenant" | "namespace" | "flow" | "execution";

export type KillSwitchBehavior = "existing" | "existing_and_future";

export interface KillSwitchBanner {
  id: string;
  scope: KillSwitchScope;
  targets: string[];
  behavior: KillSwitchBehavior;
  reason?: string;
}

export function getKillSwitchScopeLabel(scope: KillSwitchScope): string {
  switch (scope) {
    case "tenant":
      return "Tenant";
    case "namespace":
      return "Namespace";
    case "flow":
      return "Flow";
    case "execution":
      return "Execution";
    default:
      return "Scope";
  }
}

export function getKillSwitchBehaviorLabel(behavior: KillSwitchBehavior): string {
  return behavior === "existing" ? "Existing executions" : "Existing + future executions";
}
