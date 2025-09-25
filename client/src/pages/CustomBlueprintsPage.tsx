import BlueprintsLibraryPage, {
  type BlueprintCard,
} from "./blueprints/BlueprintsLibraryPage";
import type { TagOption } from "@/components/TagsFilterEditor";

const CUSTOM_TAG_OPTIONS: TagOption[] = [
  { id: "Getting Started", label: "Getting Started" },
  { id: "Notifications", label: "Notifications" },
  { id: "Python", label: "Python" },
  { id: "SQL", label: "SQL" },
  { id: "dbt", label: "dbt" },
  { id: "AI", label: "AI" },
  { id: "API", label: "API" },
  { id: "CLI", label: "CLI" },
  { id: "DevOps", label: "DevOps" },
  { id: "Git", label: "Git" },
  { id: "AWS", label: "AWS" },
  { id: "GCP", label: "GCP" },
  { id: "Azure", label: "Azure" },
  { id: "Kestra", label: "Kestra" },
  { id: "Airbyte", label: "Airbyte" },
  { id: "Data Pipeline", label: "Data Pipeline" },
  { id: "Database", label: "Database" },
  { id: "ELT", label: "ELT" },
  { id: "SaaS", label: "SaaS" },
  { id: "System", label: "System" },
  { id: "Alerting", label: "Alerting" },
];

const CUSTOM_BLUEPRINTS: BlueprintCard[] = [
  {
    id: "incident-response-agent",
    name: "Incident Response Agent",
    description: "Automate escalation workflows and surface enriched context for on-call teams.",
    tags: ["AI", "Alerting", "DevOps"],
    plugins: ["pagerduty", "slack", "notion", "kestra"],
  },
  {
    id: "customer-onboarding-starter",
    name: "Customer Onboarding Starter",
    description: "Kick off a guided onboarding data pipeline for new tenants with ready-to-run flows.",
    tags: ["Getting Started", "Kestra", "Data Pipeline"],
    plugins: ["kestra", "airbyte", "dbt"],
  },
  {
    id: "marketing-elt-dashboard",
    name: "Marketing ELT Dashboard",
    description: "Load campaign metrics into your warehouse and model results with dbt to power dashboards.",
    tags: ["ELT", "dbt", "SQL"],
    plugins: ["airbyte", "dbt", "python"],
  },
  {
    id: "cloud-cost-guardrail",
    name: "Cloud Cost Guardrail",
    description: "Monitor AWS, GCP, and Azure spend and trigger alerts when budgets drift.",
    tags: ["AWS", "GCP", "Azure", "Alerting"],
    plugins: ["aws", "gcp", "azure"],
  },
  {
    id: "gitops-release-bot",
    name: "GitOps Release Bot",
    description: "Automate release approvals and notifications from Git changes across environments.",
    tags: ["Git", "CLI", "DevOps"],
    plugins: ["git", "cli", "pagerduty"],
  },
  {
    id: "warehouse-sync-airbyte",
    name: "Warehouse Sync with Airbyte",
    description: "Synchronize SaaS sources into your database with Airbyte and schedule health checks.",
    tags: ["Airbyte", "Database", "SaaS"],
    plugins: ["airbyte", "database", "kestra"],
  },
  {
    id: "analytics-ai-assistant",
    name: "Analytics AI Assistant",
    description: "Answer stakeholder questions with a Python AI agent backed by curated SQL models.",
    tags: ["AI", "Python", "SQL"],
    plugins: ["python", "api", "kestra"],
  },
  {
    id: "kestra-cli-starter",
    name: "Kestra CLI Starter",
    description: "Bootstrap a Kestra namespace with CLI utilities, templates, and deployment helpers.",
    tags: ["CLI", "Kestra", "Getting Started"],
    plugins: ["cli", "kestra", "git"],
  },
];

export default function CustomBlueprintsPage() {
  return (
    <BlueprintsLibraryPage
      title="Custom Blueprints"
      subtitle="Blueprints Library"
      tagOptions={CUSTOM_TAG_OPTIONS}
      blueprints={CUSTOM_BLUEPRINTS}
      savedFilterNamespace="custom-blueprints"
      allowEdit
      showCreateButton
    />
  );
}
