import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import kestraLogo from "@/assets/Kestra.full.logo.light.png";
import type { LucideIcon } from "lucide-react";
import {
  Box,
  Building,
  Building2,
  ChevronDown,
  ChevronRight,
  Database,
  FileText,
  FlaskConical,
  Folder,
  Grid2x2,
  LayoutDashboard,
  LayoutGrid,
  Megaphone,
  Monitor,
  MonitorCog,
  MonitorDot,
  Play,
  Puzzle,
  Server,
  ServerCog,
  Waves,
  Shapes,
  Shield,
  ShieldAlert,
  TrendingUp,
  Workflow,
  Wrench,
  Zap,
  Lock,
} from "lucide-react";

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
  icon?: LucideIcon;
  children?: NavItem[];
};

// Hierarchical navigation structure
const navigationItems: NavItem[] = [
  {
    title: "Dashboards",
    url: "/dashboards",
    icon: TrendingUp,
  },
  {
    title: "Flows",
    url: "/flows",
    icon: Grid2x2,
  },
  {
    title: "Apps",
    url: "/apps",
    icon: LayoutGrid,
  },
  {
    title: "Executions",
    url: "/executions",
    icon: Play,
  },
  {
    title: "Logs",
    url: "/logs",
    icon: FileText,
  },
  {
    title: "Tests",
    url: "/tests",
    icon: FlaskConical,
  },
  {
    title: "Assets",
    url: "/assets",
    icon: Box,
  },
  {
    title: "Namespaces",
    url: "/namespaces",
    icon: Folder,
  },
  {
    title: "Plugins",
    url: "/plugins",
    icon: Puzzle,
  },
  {
    title: "Blueprints",
    icon: LayoutDashboard,
    children: [
      {
        title: "Custom Blueprints",
        url: "/blueprints/custom",
        icon: Wrench,
      },
      {
        title: "Flow Blueprints",
        url: "/blueprints/flow",
        icon: Grid2x2,
      },
      {
        title: "App Blueprints",
        url: "/blueprints/app",
        icon: LayoutGrid,
      },
      {
        title: "Dashboard Blueprints",
        url: "/blueprints/dashboard",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "Tenant Administration",
    icon: Building,
    children: [
      {
        title: "System Overview",
        url: "/admin/tenant/system-overview",
        icon: MonitorDot,
      },
      {
        title: "KV Store",
        url: "/admin/tenant/kv-store",
        icon: Database,
      },
      {
        title: "Secrets",
        url: "/admin/tenant/secrets",
        icon: Lock,
      },
      {
        title: "Triggers",
        url: "/admin/tenant/triggers",
        icon: Zap,
      },
      {
        title: "Audit Logs",
        url: "/admin/tenant/audit-logs",
        icon: FileText,
      },
      {
        title: "IAM",
        icon: Shield,
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
    icon: MonitorCog,
    children: [
      {
        title: "System Overview",
        url: "/admin/instance/system-overview",
        icon: Monitor,
      },
      {
        title: "Services",
        url: "/admin/instance/services",
        icon: Waves,
      },
      {
        title: "Audit Logs",
        url: "/admin/instance/audit-logs",
        icon: FileText,
      },
      {
        title: "IAM",
        icon: Shield,
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
        icon: Puzzle,
      },
      {
        title: "Tenants",
        url: "/admin/instance/tenants",
        icon: Building2,
      },
      {
        title: "Worker Groups",
        url: "/admin/instance/worker-groups",
        icon: ServerCog,
      },
      {
        title: "Kill Switch",
        url: "/admin/instance/kill-switch",
        icon: ShieldAlert,
      },
      {
        title: "Announcements",
        url: "/admin/instance/announcements",
        icon: Megaphone,
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
    const Icon = item.icon;
    const isExpanded = expandedItems.has(nodeKey);
    const isActive = isItemActive(item);
    const testId = `nav-${nodeKey.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    if (level === 0) {
      // Top-level items
      if (!Icon) {
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
                <Icon />
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
                  <Icon />
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
                {Icon && <Icon className="h-4 w-4" />}
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
                  {Icon && <Icon className="h-4 w-4" />}
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
