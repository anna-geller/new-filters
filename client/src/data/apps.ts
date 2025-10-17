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
];

export const appsById = APPS.reduce<Record<string, AppRecord>>((acc, app) => {
  acc[app.id] = app;
  return acc;
}, {});
