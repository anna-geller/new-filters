import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import kestraLogo from "@/assets/Kestra.full.logo.light.png";
import type { LucideIcon } from "lucide-react";
import {
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { SvgIcon } from "@/components/SvgIcon";

// Import custom SVG icons
import appsIcon from "@/assets/menu-icons/apps.svg";
import assetsIcon from "@/assets/menu-icons/assets.svg";
import blueprintsIcon from "@/assets/menu-icons/blueprints.svg";
import blueprintsAppsIcon from "@/assets/menu-icons/blueprints.apps.svg";
import blueprintsCustomIcon from "@/assets/menu-icons/blueprints.custom.svg";
import blueprintsDashboardsIcon from "@/assets/menu-icons/blueprints.dashboards.svg";
import blueprintsFlowsIcon from "@/assets/menu-icons/blueprints.flows.svg";
import dashboardsIcon from "@/assets/menu-icons/dashboards.svg";
import executionsIcon from "@/assets/menu-icons/executions.svg";
import flowsIcon from "@/assets/menu-icons/flows.svg";
import instanceIcon from "@/assets/menu-icons/instance.svg";
import instanceAnnoucementsIcon from "@/assets/menu-icons/instance.annoucements.svg";
import instanceAuditlogsIcon from "@/assets/menu-icons/instance.auditlogs.svg";
import instanceIamIcon from "@/assets/menu-icons/instance.iam.svg";
import instanceServicesIcon from "@/assets/menu-icons/instance.services.svg";
import instanceSystemOverviewIcon from "@/assets/menu-icons/instance.systemOverview.svg";
import instanceTenantsIcon from "@/assets/menu-icons/instance.tenants.svg";
import instanceVersionedPluginsIcon from "@/assets/menu-icons/instance.versionedPlugins.svg";
import instanceWorkerGroupsIcon from "@/assets/menu-icons/instance.workerGroups.svg";
import logsIcon from "@/assets/menu-icons/logs.svg";
import namespacesIcon from "@/assets/menu-icons/namespaces.svg";
import pluginsIcon from "@/assets/menu-icons/plugins.svg";
import testsIcon from "@/assets/menu-icons/tests.svg";
import tenantIcon from "@/assets/menu-icons/tenant.svg";
import tenantAuditLogsIcon from "@/assets/menu-icons/tenant.auditLogs.svg";
import tenantIamIcon from "@/assets/menu-icons/tenant.iam.svg";
import tenantKvStoreIcon from "@/assets/menu-icons/tenant.kvStore.svg";
import tenantSecretsIcon from "@/assets/menu-icons/tenant.secrets.svg";
import tenantSystemOverviewIcon from "@/assets/menu-icons/tenant.systemOverview.svg";
import tenantTriggersIcon from "@/assets/menu-icons/tenant.triggers.svg";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url?: string;
  icon?: LucideIcon | string;
  children?: NavItem[];
};

// Hierarchical navigation structure
const navigationItems: NavItem[] = [
  {
    title: "Dashboards",
    url: "/dashboards",
    icon: dashboardsIcon,
  },
  {
    title: "Flows",
    url: "/flows",
    icon: flowsIcon,
  },
  {
    title: "Apps",
    url: "/apps",
    icon: appsIcon,
  },
  {
    title: "Executions",
    url: "/executions",
    icon: executionsIcon,
  },
  {
    title: "Logs",
    url: "/logs",
    icon: logsIcon,
  },
  {
    title: "Tests",
    url: "/tests",
    icon: testsIcon,
  },
  {
    title: "Assets",
    url: "/assets",
    icon: assetsIcon,
  },
  {
    title: "Namespaces",
    url: "/namespaces",
    icon: namespacesIcon,
  },
  {
    title: "Plugins",
    url: "/plugins",
    icon: pluginsIcon,
  },
  {
    title: "Blueprints",
    icon: blueprintsIcon,
    children: [
      {
        title: "Custom Blueprints",
        url: "/blueprints/custom",
        icon: blueprintsCustomIcon,
      },
      {
        title: "Flow Blueprints",
        url: "/blueprints/flow",
        icon: blueprintsFlowsIcon,
      },
      {
        title: "App Blueprints",
        url: "/blueprints/app",
        icon: blueprintsAppsIcon,
      },
      {
        title: "Dashboard Blueprints",
        url: "/blueprints/dashboard",
        icon: blueprintsDashboardsIcon,
      },
    ],
  },
  {
    title: "Tenant Administration",
    icon: tenantIcon,
    children: [
      {
        title: "System Overview",
        url: "/admin/tenant/system-overview",
        icon: tenantSystemOverviewIcon,
      },
      {
        title: "KV Store",
        url: "/admin/tenant/kv-store",
        icon: tenantKvStoreIcon,
      },
      {
        title: "Secrets",
        url: "/admin/tenant/secrets",
        icon: tenantSecretsIcon,
      },
      {
        title: "Triggers",
        url: "/admin/tenant/triggers",
        icon: tenantTriggersIcon,
      },
      {
        title: "Audit Logs",
        url: "/admin/tenant/audit-logs",
        icon: tenantAuditLogsIcon,
      },
      {
        title: "IAM",
        icon: tenantIamIcon,
        children: [
          {
            title: "Users",
            url: "/admin/tenant/iam/users",
          },
          {
            title: "Service Accounts",
            url: "/admin/tenant/iam/service-accounts",
          },
          {
            title: "Groups",
            url: "/admin/tenant/iam/groups",
          },
          {
            title: "Access",
            url: "/admin/tenant/iam/access",
          },
          {
            title: "Roles",
            url: "/admin/tenant/iam/roles",
          },
          {
            title: "Invitations",
            url: "/admin/tenant/iam/invitations",
          },
          {
            title: "Provisioning",
            url: "/admin/tenant/iam/provisioning",
          },
        ],
      },
    ],
  },
  {
    title: "Instance Administration",
    icon: instanceIcon,
    children: [
      {
        title: "System Overview",
        url: "/admin/instance/system-overview",
        icon: instanceSystemOverviewIcon,
      },
      {
        title: "Services",
        url: "/admin/instance/services",
        icon: instanceServicesIcon,
      },
      {
        title: "Audit Logs",
        url: "/admin/instance/audit-logs",
        icon: instanceAuditlogsIcon,
      },
      {
        title: "IAM",
        icon: instanceIamIcon,
        children: [
          {
            title: "Users",
            url: "/admin/instance/iam/users",
          },
          {
            title: "Service Accounts",
            url: "/admin/instance/iam/service-accounts",
          },
        ],
      },
      {
        title: "Versioned Plugins",
        url: "/admin/instance/versioned-plugins",
        icon: instanceVersionedPluginsIcon,
      },
      {
        title: "Tenants",
        url: "/admin/instance/tenants",
        icon: instanceTenantsIcon,
      },
      {
        title: "Worker Groups",
        url: "/admin/instance/worker-groups",
        icon: instanceWorkerGroupsIcon,
      },
      {
        title: "Kill Switch",
        url: "/admin/instance/kill-switch",
        icon: instanceIcon,
      },
      {
        title: "Announcements",
        url: "/admin/instance/announcements",
        icon: instanceAnnoucementsIcon,
      },
    ],
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Generate unique key for each navigation item
const generateNodeKey = (item: NavItem, parentKey: string = ""): string => {
  const key = item.url || item.title;
  return parentKey ? `${parentKey}/${key}` : key;
};

const toggleExpanded = (nodeKey: string) => {
  setExpandedItems(prev => {
      const newSet = new Set(prev);
      
      // Check if this is a top-level menu item
      const isTopLevel = navigationItems.some(item => generateNodeKey(item) === nodeKey);
      
      if (isTopLevel) {
        // For top-level items, implement single-expand behavior
        if (newSet.has(nodeKey)) {
          // If already expanded, collapse it
          newSet.delete(nodeKey);
        } else {
          // If not expanded, collapse all other top-level items first
          navigationItems.forEach(item => {
            const itemKey = generateNodeKey(item);
            if (itemKey !== nodeKey) {
              newSet.delete(itemKey);
            }
          });
          // Then expand the selected item
          newSet.add(nodeKey);
        }
      } else {
        // For sub-items, use normal toggle behavior
        if (newSet.has(nodeKey)) {
          newSet.delete(nodeKey);
        } else {
          newSet.add(nodeKey);
        }
      }
      
      return newSet;
    });
  };

  // Auto-expand ancestors of active route
  useEffect(() => {
    const findActiveItemPath = (items: NavItem[], parentKey: string = ""): string[] => {
      for (const item of items) {
        const nodeKey = generateNodeKey(item, parentKey);
        if (item.url && location === item.url) {
          return [nodeKey];
        }
        if (item.children) {
          const childPath = findActiveItemPath(item.children, nodeKey);
          if (childPath.length > 0) {
            return [nodeKey, ...childPath];
          }
        }
      }
      return [];
    };

    const activePath = findActiveItemPath(navigationItems);
    if (activePath.length > 0) {
      setExpandedItems(prev => {
        const newSet = new Set(prev);
        
        // Find the top-level parent of the active item
        const topLevelParent = activePath[0];
        
        // Clear all top-level expansions first
        navigationItems.forEach(item => {
          const itemKey = generateNodeKey(item);
          newSet.delete(itemKey);
        });
        
        // Expand only the path to the active item
        activePath.slice(0, -1).forEach(key => newSet.add(key));
        
        return newSet;
      });
    }
  }, [location]);

  const isItemActive = (item: NavItem): boolean => {
    if (item.url) {
      if (location === item.url) return true;
      if (location.startsWith(`${item.url}/`)) return true;
      if (location.startsWith(`${item.url}?`)) return true;
    }
    if (item.children) {
      return item.children.some((child: NavItem) => isItemActive(child));
    }
    return false;
  };

  const renderMenuItem = (item: NavItem, level: number = 0, parentKey: string = "") => {
    const nodeKey = generateNodeKey(item, parentKey);
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    const children = hasChildren ? item.children! : [];
    const icon = item.icon;
    const isExpanded = expandedItems.has(nodeKey);
    const isActive = isItemActive(item);
    const testId = `nav-${nodeKey.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    // Render icon - check if it's a string (SVG path) or a component (LucideIcon)
    const renderIcon = (iconProp?: LucideIcon | string, className?: string) => {
      if (!iconProp) return null;
      
      if (typeof iconProp === "string") {
        return <SvgIcon src={iconProp} className={className} />;
      } else {
        const IconComponent = iconProp;
        return <IconComponent className={className} />;
      }
    };

    if (level === 0) {
      // Top-level items
      if (!icon) {
        return null;
      }

      return (
        <SidebarMenuItem key={nodeKey}>
          {hasChildren ? (
            <>
              <SidebarMenuButton
                onClick={() => toggleExpanded(nodeKey)}
                isActive={isActive}
                data-testid={testId}
              >
                {renderIcon(icon)}
                <span>{item.title}</span>
                {isExpanded ? <ChevronDown className="ml-auto h-4 w-4" /> : <ChevronRight className="ml-auto h-4 w-4" />}
              </SidebarMenuButton>
              {isExpanded && (
                <SidebarMenuSub>
                  {children.map(child => renderMenuItem(child, level + 1, nodeKey))}
                </SidebarMenuSub>
              )}
            </>
          ) : (
            item.url ? (
              <SidebarMenuButton
                asChild
                isActive={isActive}
                data-testid={testId}
              >
                <Link href={item.url}>
                  {renderIcon(icon)}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            ) : null
          )}
        </SidebarMenuItem>
      );
    } else if (level === 1) {
      // Second-level items
      return (
        <SidebarMenuSubItem key={nodeKey}>
          {hasChildren ? (
            <>
              <SidebarMenuSubButton
                onClick={() => toggleExpanded(nodeKey)}
                isActive={isActive}
                data-testid={testId}
              >
                {renderIcon(icon, "h-4 w-4")}
                <span>{item.title}</span>
                {isExpanded ? <ChevronDown className="ml-auto h-4 w-4" /> : <ChevronRight className="ml-auto h-4 w-4" />}
              </SidebarMenuSubButton>
              {isExpanded && (
                <SidebarMenuSub>
                  {children.map(child => renderMenuItem(child, level + 1, nodeKey))}
                </SidebarMenuSub>
              )}
            </>
          ) : (
            item.url ? (
              <SidebarMenuSubButton
                asChild
                isActive={isActive}
                data-testid={testId}
              >
                <Link href={item.url}>
                  {renderIcon(icon, "h-4 w-4")}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuSubButton>
            ) : null
          )}
        </SidebarMenuSubItem>
      );
    } else {
      // Third-level items (deepest nesting)
      if (!item.url) {
        return null;
      }

      return (
        <SidebarMenuSubItem key={nodeKey}>
          <SidebarMenuSubButton
            asChild
            isActive={location === item.url}
            data-testid={testId}
          >
            <Link href={item.url} className="pl-4">
              <span>{item.title}</span>
            </Link>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      );
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="pb-4 bg-[#1E202A]">
        <img 
          src={kestraLogo} 
          alt="Kestra" 
          className="w-auto max-w-full p-4"
        />
      </SidebarHeader>
      <SidebarContent className="bg-[#1E202A]">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => renderMenuItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
