export interface AppRecord {
  id: string;
  name: string;
  type: string;
  tags: string[];
  namespace: string;
  flow: string;
}

export const APPS: AppRecord[] = [
  {
    id: "request_data_form",
    name: "Form to request and download data",
    type: "Execution",
    tags: ["Reporting", "Analytics"],
    namespace: "company.team",
    flow: "get_data",
  },
  {
    id: "kestra_cloud_signup",
    name: "Form to sign up for Kestra Cloud",
    type: "Execution",
    tags: ["Public", "Form", "Cloud"],
    namespace: "company.team",
    flow: "kestra_cloud_form",
  },
  {
    id: "kestra_ai_console",
    name: "Interact with Kestra's AI Agent",
    type: "Execution",
    tags: ["AI"],
    namespace: "company.sales",
    flow: "kestra_mcp_docker",
  },
  {
    id: "customer_insights_dashboard",
    name: "Customer Insights Dashboard",
    type: "Analytics",
    tags: ["Customer", "BI"],
    namespace: "company.analytics",
    flow: "customer_360_build",
  },
  {
    id: "customer_success_portal",
    name: "Customer Success Portal",
    type: "Internal",
    tags: ["Support", "Customer"],
    namespace: "company.support",
    flow: "customer_support_case_enrich",
  },
  {
    id: "feature_flag_console",
    name: "Feature Flag Console",
    type: "Operations",
    tags: ["Platform", "Feature Flags"],
    namespace: "company.platform",
    flow: "feature_flag_rollout",
  },
];

export const appsById = APPS.reduce<Record<string, AppRecord>>((acc, app) => {
  acc[app.id] = app;
  return acc;
}, {});
