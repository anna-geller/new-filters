## Flows

Add a new /flows page accessible from the “Flows” UI menu. It should look like the Executions page but with a difference in the filters, columns and data in the table.

- Keep the **Namespace, Labels, Scope** and **Flow** filters exactly the same way as on the Executions page, except that for **Scope** adjust the options and their descriptions as User Flows and System Flows.
- **Columns** modal on this page should be as follows:
    - **Id** → Unique flow identifier
    - **Labels** → Flow labels (key:value format)
    - **Namespace** → Namespace of the flow
    - **Last execution date** → When the flow was last executed
    - **Last execution status** → Status of the most recent execution
    - **Execution statistics** → Chart showing recent execution states
    - **Triggers** → Triggers that can start the flow (e.g., schedule, event)
    - **Revision** → Current version number of the flow definition
    - **Description** → Text description provided for the flow
- The table on this page can have this test data:

| Id | Labels | Namespace | Last execution date | Last execution status | Execution statistics | Triggers |
| --- | --- | --- | --- | --- | --- | --- |
| data_pipeline | env:production, team:backend | company | Fri, Sep 12, 2025 6:37 PM | SUCCESS |  | Schedule |
| microservices_and_apis | env:production, team:backend | company.team | Fri, Sep 12, 2025 6:37 PM | SUCCESS |  | Webhook |
| notification_system | env:production, team:backend | company.team.backend | Fri, Sep 12, 2025 6:36 PM | SUCCESS |  | S3 |
| payment_processing | env:production, team:backend | company.team.frontend | Fri, Sep 12, 2025 6:36 PM | SUCCESS |  |  |
| user_authentication | env:production, team:analytics | company.analytics | Fri, Sep 12, 2025 6:36 PM | SUCCESS |  |  |
| security_scan | action:cvescan, team:security | company.security | Fri, Sep 12, 2025 6:36 PM | SUCCESS |  |  |
| email_notifications | action:test, team:frontend | company.team.api | Fri, Sep 12, 2025 6:36 PM | FAILED |  |  |
| payment_gateway | priority:critical, type:user-facing | company.team.database | Fri, Sep 12, 2025 6:36 PM | FAILED |  |  |

## Apps
Add a new /apps page accessible from the “Apps” UI menu. It should look like the Executions page but with a difference in the filters, columns and data in the table.

- Keep the **Namespace** and **Flow** filters exactly the same way as on the Executions page
- Add another filter called **Tags** that also works the same way as Namespace filter on the Executions page but is used to filter Apps by one or more tags
- Add “**Enabled**” single-select filter which should have only 2 options: “True” and “False”
- **Columns** modal on this page should be as follows:
    - **Name** → Display name of the App
    - **Type** → App type e.g. app triggering an Execution
    - **Tags** → List of categorization tags attached to the app
    - **Namespace** → Namespace of the app
    - **Flow** → Name of the flow associated with the app
- The table on this page can have this test data:

```
| Name                                | Type      | Tags                 | Namespace     | Flow               |
|-------------------------------------|-----------|----------------------|---------------|--------------------|
| Form to request and download data   | Execution | Reporting, Analytics | company.team  | get_data           |
| Form to sign up for Kestra Cloud    | Execution | Public, Form, Cloud  | company.team  | kestra_cloud_form  |
| Interact with Kestra's AI Agent     | Execution | AI                   | company.sales | kestra_mcp_docker  |
```