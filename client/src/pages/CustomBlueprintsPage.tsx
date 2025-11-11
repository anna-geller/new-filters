import { useMemo, useState } from "react";
import BlueprintsLibraryPage, {
  type BlueprintCard,
} from "./blueprints/BlueprintsLibraryPage";
import type { TagOption } from "@/components/TagsFilterEditor";
import BlueprintFormDialog from "@/components/BlueprintFormDialog";

const STATIC_TAG_OPTIONS: TagOption[] = [
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

const INITIAL_CUSTOM_BLUEPRINTS: BlueprintCard[] = [
  {
    id: "incident-response-agent",
    name: "Incident Response Agent",
    description: "Automate escalation workflows and surface enriched context for on-call teams.",
    tags: ["AI", "Alerting", "DevOps"],
    plugins: ["pagerduty", "slack", "notion", "kestra"],
  },
  {
    id: "subflow-starter",
    name: "Subflow Starter Template",
    description: "Create flows that call subflows with configurable namespace, ID, and wait behavior.",
    tags: ["Getting Started", "Kestra"],
    plugins: ["kestra"],
    flowTemplate: `id: <<flow_id>>
namespace: <<namespace>>

inputs:
  - id: order_id
    type: INT
    defaults: 42

extend:
  templateArguments:
    - id: subflow_id
      displayName: Subflow ID
      type: STRING
      required: true

    - id: subflow_namespace
      displayName: Subflow Namespace
      type: STRING
      required: true

    - id: subflow_input_id
      type: STRING
      defaults: order_id

    - id: subflow_wait
      type: BOOL
      defaults: true

tasks:
  - id: subflow_task
    type: io.kestra.plugin.core.flow.Subflow
    namespace: <<arg.subflow_namespace>>
    flowId: <<arg.subflow_id>>
    wait: <<arg.subflow_wait>>
    inputs:
      order_id: "{{ inputs.order_id }}"`,
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
  const [blueprints, setBlueprints] = useState<BlueprintCard[]>(INITIAL_CUSTOM_BLUEPRINTS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingBlueprint, setEditingBlueprint] = useState<BlueprintCard | null>(null);

  const tagOptions = useMemo(() => {
    const tagMap = new Map<string, TagOption>();
    STATIC_TAG_OPTIONS.forEach((tag) => tagMap.set(tag.id.toLowerCase(), tag));
    blueprints.forEach((blueprint) => {
      blueprint.tags.forEach((tag) => {
        const normalized = tag.toLowerCase();
        if (!tagMap.has(normalized)) {
          tagMap.set(normalized, { id: tag, label: tag });
        }
      });
    });
    return Array.from(tagMap.values());
  }, [blueprints]);

  const handleOpenCreate = () => {
    setFormMode("create");
    setEditingBlueprint(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (blueprint: BlueprintCard) => {
    setFormMode("edit");
    setEditingBlueprint(blueprint);
    setIsFormOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingBlueprint(null);
    }
  };

  const handleSubmitBlueprint = (
    blueprint: BlueprintCard,
    meta: { originalId?: string } = {},
  ) => {
    setBlueprints((prev) => {
      const targetId = meta.originalId ?? blueprint.id;
      const existingIndex = prev.findIndex((bp) => bp.id === targetId);
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = blueprint;
        return next;
      }
      return [blueprint, ...prev];
    });
    handleDialogOpenChange(false);
  };

  return (
    <>
      <BlueprintsLibraryPage
        title="Custom Blueprints"
        subtitle="Build custom blueprints shared across your organization."
        tagOptions={tagOptions}
        blueprints={blueprints}
        savedFilterNamespace="custom-blueprints"
        allowEdit
        showCreateButton
        onCreateBlueprint={handleOpenCreate}
        onEditBlueprint={handleOpenEdit}
      />
      <BlueprintFormDialog
        open={isFormOpen}
        mode={formMode}
        initialBlueprint={editingBlueprint ?? undefined}
        existingIds={blueprints.map((blueprint) => blueprint.id)}
        onOpenChange={handleDialogOpenChange}
        onSubmit={handleSubmitBlueprint}
      />
    </>
  );
}
