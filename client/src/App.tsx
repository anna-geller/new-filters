import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import ExecutionsPage from "@/pages/ExecutionsPage";
import FlowsPage from "@/pages/FlowsPage";
import AppsPage from "@/pages/AppsPage";
import TestsPage from "@/pages/TestsPage";
import LogsPage from "@/pages/LogsPage";
import TriggersPage from "@/pages/TriggersPage";
import DashboardsPage from "@/pages/DashboardsPage";
import TenantAuditLogsPage from "@/pages/TenantAuditLogsPage";
import InstanceAuditLogsPage from "@/pages/InstanceAuditLogsPage";
import TenantUsersPage from "@/pages/TenantUsersPage";
import InstanceUsersPage from "@/pages/InstanceUsersPage";
import TenantServiceAccountsPage from "@/pages/TenantServiceAccountsPage";
import InstanceServiceAccountsPage from "@/pages/InstanceServiceAccountsPage";
import InstanceVersionedPluginsPage from "@/pages/InstanceVersionedPluginsPage";
import InstanceTenantsPage from "@/pages/InstanceTenantsPage";
import InstanceWorkerGroupsPage from "@/pages/InstanceWorkerGroupsPage";
import InstanceAnnouncementsPage from "@/pages/InstanceAnnouncementsPage";
import InstanceServicesPage from "@/pages/InstanceServicesPage";
import InstanceSystemOverviewPage from "@/pages/InstanceSystemOverviewPage";
import TenantSystemOverviewPage from "@/pages/TenantSystemOverviewPage";
import TenantInvitationsPage from "@/pages/TenantInvitationsPage";
import TenantProvisioningPage from "@/pages/TenantProvisioningPage";
import TenantGroupsPage from "@/pages/TenantGroupsPage";
import TenantRolesPage from "@/pages/TenantRolesPage";
import TenantAccessPage from "@/pages/TenantAccessPage";
import NamespacesPage from "@/pages/NamespacesPage";
import TenantSecretsPage from "@/pages/TenantSecretsPage";
import TenantKvStorePage from "@/pages/TenantKvStorePage";
import CustomBlueprintsPage from "@/pages/CustomBlueprintsPage";
import FlowBlueprintsPage from "@/pages/FlowBlueprintsPage";
import AppBlueprintsPage from "@/pages/AppBlueprintsPage";
import DashboardBlueprintsPage from "@/pages/DashboardBlueprintsPage";
import PluginsPage from "@/pages/PluginsPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ExecutionsPage} />
      <Route path="/executions" component={ExecutionsPage} />
      <Route path="/dashboards" component={DashboardsPage} />
      <Route path="/flows" component={FlowsPage} />
      <Route path="/apps" component={AppsPage} />
      <Route path="/logs" component={LogsPage} />
      <Route path="/plugins" component={PluginsPage} />
      <Route path="/admin/tenant/system-overview" component={TenantSystemOverviewPage} />
      <Route path="/admin/tenant/triggers" component={TriggersPage} />
      <Route path="/admin/tenant/auditlogs" component={TenantAuditLogsPage} />
      <Route path="/admin/tenant/iam/users" component={TenantUsersPage} />
      <Route path="/admin/tenant/iam/invitations" component={TenantInvitationsPage} />
      <Route path="/admin/tenant/iam/provisioning" component={TenantProvisioningPage} />
      <Route path="/admin/tenant/iam/access" component={TenantAccessPage} />
      <Route path="/admin/tenant/kv-store" component={TenantKvStorePage} />
      <Route path="/admin/tenant/secrets" component={TenantSecretsPage} />
      <Route path="/admin/tenant/iam/groups" component={TenantGroupsPage} />
      <Route path="/admin/tenant/iam/roles" component={TenantRolesPage} />
      <Route path="/admin/tenant/iam/service-accounts" component={TenantServiceAccountsPage} />
      <Route path="/admin/instance/system-overview" component={InstanceSystemOverviewPage} />
      <Route path="/admin/instance/auditlogs" component={InstanceAuditLogsPage} />
      <Route path="/admin/instance/services" component={InstanceServicesPage} />
      <Route path="/instance-admin/services" component={InstanceServicesPage} />
      <Route path="/admin/instance/iam/users" component={InstanceUsersPage} />
      <Route path="/admin/instance/iam/service-accounts" component={InstanceServiceAccountsPage} />
      <Route path="/admin/instance/versioned-plugins" component={InstanceVersionedPluginsPage} />
      <Route path="/admin/instance/tenants" component={InstanceTenantsPage} />
      <Route path="/admin/instance/worker-groups" component={InstanceWorkerGroupsPage} />
      <Route path="/admin/instance/announcements" component={InstanceAnnouncementsPage} />
      <Route path="/namespaces" component={NamespacesPage} />
      <Route path="/blueprints/custom" component={CustomBlueprintsPage} />
      <Route path="/blueprints/flow" component={FlowBlueprintsPage} />
      <Route path="/blueprints/app" component={AppBlueprintsPage} />
      <Route path="/blueprints/dashboard" component={DashboardBlueprintsPage} />
      <Route path="/tests" component={TestsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1">
              <header className="flex items-center justify-between p-2 border-b border-border bg-[#1F232D]">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
              </header>
              <main className="flex-1 overflow-hidden">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
