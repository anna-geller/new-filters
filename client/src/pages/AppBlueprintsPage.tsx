import BlueprintsLibraryPage, { type BlueprintCard } from "./blueprints/BlueprintsLibraryPage";
import type { TagOption } from "@/components/TagsFilterEditor";

const APP_TAG_OPTIONS: TagOption[] = [
  { id: "Getting Started", label: "Getting Started" },
  { id: "AI", label: "AI" },
  { id: "Analytics", label: "Analytics" },
  { id: "Reporting", label: "Reporting" },
  { id: "Infrastructure", label: "Infrastructure" },
];

const APP_BLUEPRINTS: BlueprintCard[] = [
  {
    id: "ai-assistant-app",
    name: "AI Assistant App",
    description: "Expose a Kestra AI agent behind a shareable interface with guardrails and logging.",
    tags: ["AI", "Getting Started"],
    plugins: ["ai", "kestra", "workspace"],
  },
  {
    id: "analytics-insights-app",
    name: "Analytics Insights App",
    description: "Surface curated metrics, drilldowns, and natural language summaries to business users.",
    tags: ["Analytics", "Reporting"],
    plugins: ["analytics", "reporting", "database"],
  },
  {
    id: "status-dashboard-app",
    name: "Status Dashboard App",
    description: "Give stakeholders a live operations dashboard with on-demand refresh and alerts.",
    tags: ["Reporting", "Infrastructure"],
    plugins: ["infrastructure", "analytics", "slack"],
  },
  {
    id: "slo-tracker-app",
    name: "SLO Tracker App",
    description: "Track service objectives, highlight burn-rate, and notify owners when thresholds approach.",
    tags: ["Analytics", "Infrastructure"],
    plugins: ["analytics", "infrastructure", "pagerduty"],
  },
  {
    id: "quickstart-app",
    name: "Quickstart Data App",
    description: "Ship a templated application that bundles sample flows, datasets, and a guided tour.",
    tags: ["Getting Started"],
    plugins: ["workspace", "kestra", "analytics"],
  },
  {
    id: "governance-audit-app",
    name: "Governance & Audit App",
    description: "Review audit events, export compliance evidence, and manage remediation playbooks.",
    tags: ["Reporting", "Infrastructure"],
    plugins: ["reporting", "workspace", "git"],
  },
];

export default function AppBlueprintsPage() {
  return (
    <BlueprintsLibraryPage
      title="App Blueprints"
      subtitle="Explore blueprints to kick-start your next app."
      tagOptions={APP_TAG_OPTIONS}
      blueprints={APP_BLUEPRINTS}
      savedFilterNamespace="app-blueprints"
    />
  );
}
