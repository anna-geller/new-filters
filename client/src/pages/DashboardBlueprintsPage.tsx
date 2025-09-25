import BlueprintsLibraryPage, { type BlueprintCard } from "./blueprints/BlueprintsLibraryPage";
import type { TagOption } from "@/components/TagsFilterEditor";

const DASHBOARD_TAG_OPTIONS: TagOption[] = [
  { id: "Getting Started", label: "Getting Started" },
  { id: "AI", label: "AI" },
  { id: "Analytics", label: "Analytics" },
  { id: "Reporting", label: "Reporting" },
  { id: "Infrastructure", label: "Infrastructure" },
];

const DASHBOARD_BLUEPRINTS: BlueprintCard[] = [
  {
    id: "executive-kpis",
    name: "Executive KPI Overview",
    description: "Highlight core company KPIs, annotate anomalies, and spotlight teams needing support.",
    tags: ["Analytics", "Reporting"],
    plugins: ["analytics", "reporting", "database"],
  },
  {
    id: "ai-observability",
    name: "AI Observability Dashboard",
    description: "Track model drift, latency, and guardrail breaches with drilldowns into recent runs.",
    tags: ["AI", "Infrastructure"],
    plugins: ["ai", "infrastructure", "analytics"],
  },
  {
    id: "growth-funnel",
    name: "Growth Funnel Dashboard",
    description: "Monitor acquisition through retention with cohort analysis and automated annotations.",
    tags: ["Analytics", "Reporting"],
    plugins: ["analytics", "reporting", "workspace"],
  },
  {
    id: "operations-health",
    name: "Operations Health Dashboard",
    description: "Consolidate SLOs, incidents, and deployment velocity to keep operations aligned.",
    tags: ["Infrastructure", "Reporting"],
    plugins: ["infrastructure", "analytics", "pagerduty"],
  },
  {
    id: "onboarding-progress",
    name: "Customer Onboarding Progress",
    description: "Visualize onboarding milestones, blockers, and next-action owners across teams.",
    tags: ["Getting Started", "Analytics"],
    plugins: ["workspace", "analytics", "slack"],
  },
  {
    id: "governance-snapshot",
    name: "Governance Snapshot",
    description: "Combine compliance checks, audit activity, and remediation queues into one view.",
    tags: ["Reporting", "Infrastructure"],
    plugins: ["reporting", "workspace", "git"],
  },
];

export default function DashboardBlueprintsPage() {
  return (
    <BlueprintsLibraryPage
      title="Dashboard Blueprints"
      subtitle="Blueprints Library"
      tagOptions={DASHBOARD_TAG_OPTIONS}
      blueprints={DASHBOARD_BLUEPRINTS}
      savedFilterNamespace="dashboard-blueprints"
    />
  );
}
