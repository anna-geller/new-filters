import BlueprintsLibraryPage, { type BlueprintCard } from "./blueprints/BlueprintsLibraryPage";
import type { TagOption } from "@/components/TagsFilterEditor";

const FLOW_TAG_OPTIONS: TagOption[] = [
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
];

const FLOW_BLUEPRINTS: BlueprintCard[] = [
  {
    id: "ai-news-notion-slack",
    name: "Daily AI news digest to Notion with Slack notification",
    description: "Summarize trending AI news, publish to Notion, and alert the on-call Slack channel.",
    tags: ["Notifications", "AI", "Kestra"],
    plugins: ["notion", "slack", "ai", "kestra"],
  },
  {
    id: "business-automation-starter",
    name: "Getting started with Kestra — a business automation workflow example",
    description: "Coordinate approvals, data syncs, and status updates across your core business systems.",
    tags: ["Getting Started", "SQL"],
    plugins: ["kestra", "database", "workspace"],
  },
  {
    id: "eventbridge-ingest",
    name: "Send custom events from your application to AWS EventBridge",
    description: "Capture product events and forward them to AWS EventBridge for downstream automation.",
    tags: ["API", "AWS"],
    plugins: ["api", "aws", "infrastructure"],
  },
  {
    id: "polars-rest-db",
    name: "Extract REST data and model with DuckDB + Polars",
    description: "Fetch REST API data, process it with Polars, and stage curated tables in DuckDB.",
    tags: ["Python", "SQL", "API"],
    plugins: ["api", "python", "database"],
  },
  {
    id: "business-days-runner",
    name: "Run specific tasks on business days only",
    description: "Schedule workflows to respect regional holidays while keeping stakeholders informed.",
    tags: ["Python", "Kestra"],
    plugins: ["python", "kestra", "analytics"],
  },
  {
    id: "lambda-parallel-runner",
    name: "Microservice orchestration with AWS Lambda",
    description: "Invoke multiple AWS Lambda functions in parallel and aggregate responses for reporting.",
    tags: ["CLI", "AWS"],
    plugins: ["cli", "aws", "infrastructure"],
  },
  {
    id: "airbyte-dbt-sync",
    name: "Trigger multiple Airbyte syncs, then run a dbt job",
    description: "Fan out Airbyte connections, wait for completion, and launch the downstream dbt transformation.",
    tags: ["dbt", "Git", "Kestra"],
    plugins: ["airbyte", "dbt", "git"],
  },
  {
    id: "ai-agent-starter",
    name: "Getting started with Kestra — an AI agent workflow example",
    description: "Provision an AI task runner with guardrails, connect data sources, and publish insights.",
    tags: ["Getting Started", "AI"],
    plugins: ["ai", "kestra", "api"],
  },
  {
    id: "git-summary-slack",
    name: "Automated weekly Git summary and Slack notification",
    description: "Digest your Git commits, create a status report, and deliver it to Slack stakeholders.",
    tags: ["Notifications", "AI", "Git", "Kestra"],
    plugins: ["git", "ai", "slack"],
  },
];

export default function FlowBlueprintsPage() {
  return (
    <BlueprintsLibraryPage
      title="Flow Blueprints"
      subtitle="Explore blueprints to kick-start your next flow."
      tagOptions={FLOW_TAG_OPTIONS}
      blueprints={FLOW_BLUEPRINTS}
      savedFilterNamespace="flow-blueprints"
    />
  );
}
