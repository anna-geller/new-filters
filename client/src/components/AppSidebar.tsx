import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { 
  Home, 
  Eye, 
  Workflow, 
  Layers, 
  Play, 
  FileText, 
  TestTube, 
  FolderOpen, 
  Database, 
  Lock, 
  Package, 
  Puzzle, 
  Settings,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Users,
  Shield,
  UserCheck,
  UsersRound,
  Key,
  Mail,
  Activity,
  Server,
  Monitor,
  Cpu,
  HardDrive,
  Megaphone,
  Zap
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";

// Hierarchical navigation structure
const navigationItems = [
  {
    title: "Dashboards",
    url: "/dashboards",
    icon: BarChart3,
  },
  {
    title: "Flows",
    url: "/flows",
    icon: Workflow,
  },
  {
    title: "Apps",
    url: "/apps",
    icon: Layers,
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
    icon: TestTube,
  },
  {
    title: "Namespaces",
    url: "/namespaces",
    icon: FolderOpen,
  },
  {
    title: "Plugins",
    url: "/plugins",
    icon: Puzzle,
  },
  {
    title: "Blueprints",
    icon: Package,
    children: [
      {
        title: "Custom Blueprints",
        url: "/blueprints/custom",
      },
      {
        title: "Flow Blueprints",
        url: "/blueprints/flow",
      },
      {
        title: "Apps Blueprints",
        url: "/blueprints/apps",
      },
      {
        title: "Dashboard Blueprints",
        url: "/blueprints/dashboard",
      },
    ],
  },
  {
    title: "Tenant Administration",
    icon: Settings,
    children: [
      {
        title: "KV Store",
        url: "/tenant-admin/kv-store",
        icon: Database,
      },
      {
        title: "Secrets",
        url: "/tenant-admin/secrets",
        icon: Lock,
      },
      {
        title: "Triggers",
        url: "/tenant-admin/triggers",
        icon: Zap,
      },
      {
        title: "Audit Logs",
        url: "/tenant-admin/audit-logs",
        icon: FileText,
      },
      {
        title: "IAM",
        icon: Shield,
        children: [
          {
            title: "Users",
            url: "/tenant-admin/iam/users",
          },
          {
            title: "Service Accounts",
            url: "/tenant-admin/iam/service-accounts",
          },
          {
            title: "Groups",
            url: "/tenant-admin/iam/groups",
          },
          {
            title: "Access",
            url: "/tenant-admin/iam/access",
          },
          {
            title: "Roles",
            url: "/tenant-admin/iam/roles",
          },
          {
            title: "Invitations",
            url: "/tenant-admin/iam/invitations",
          },
          {
            title: "SCIM Provisioning",
            url: "/tenant-admin/iam/scim",
          },
        ],
      },
    ],
  },
  {
    title: "Instance Administration",
    icon: Server,
    children: [
      {
        title: "Services",
        url: "/instance-admin/services",
        icon: Activity,
      },
      {
        title: "System Overview",
        url: "/instance-admin/system-overview",
        icon: Monitor,
      },
      {
        title: "Audit Logs",
        url: "/instance-admin/audit-logs",
        icon: FileText,
      },
      {
        title: "IAM",
        icon: Shield,
        children: [
          {
            title: "Users",
            url: "/instance-admin/iam/users",
          },
          {
            title: "Service Accounts",
            url: "/instance-admin/iam/service-accounts",
          },
        ],
      },
      {
        title: "Versioned Plugins",
        url: "/instance-admin/versioned-plugins",
        icon: Puzzle,
      },
      {
        title: "Tenants",
        url: "/instance-admin/tenants",
        icon: UsersRound,
      },
      {
        title: "Worker Groups",
        url: "/instance-admin/worker-groups",
        icon: Cpu,
      },
      {
        title: "Announcements",
        url: "/instance-admin/announcements",
        icon: Megaphone,
      },
    ],
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Generate unique key for each navigation item
  const generateNodeKey = (item: any, parentKey: string = ""): string => {
    const key = item.url || item.title;
    return parentKey ? `${parentKey}/${key}` : key;
  };

  const toggleExpanded = (nodeKey: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeKey)) {
        newSet.delete(nodeKey);
      } else {
        newSet.add(nodeKey);
      }
      return newSet;
    });
  };

  // Auto-expand ancestors of active route
  useEffect(() => {
    const findActiveItemPath = (items: any[], parentKey: string = ""): string[] => {
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
        // Expand all ancestors of the active item
        activePath.slice(0, -1).forEach(key => newSet.add(key));
        return newSet;
      });
    }
  }, [location]);

  const isItemActive = (item: any): boolean => {
    if (item.url && location === item.url) return true;
    if (item.children) {
      return item.children.some((child: any) => isItemActive(child));
    }
    return false;
  };

  const renderMenuItem = (item: any, level: number = 0, parentKey: string = "") => {
    const nodeKey = generateNodeKey(item, parentKey);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(nodeKey);
    const isActive = isItemActive(item);
    const testId = `nav-${nodeKey.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    if (level === 0) {
      // Top-level items
      return (
        <SidebarMenuItem key={nodeKey}>
          {hasChildren ? (
            <>
              <SidebarMenuButton
                onClick={() => toggleExpanded(nodeKey)}
                isActive={isActive}
                data-testid={testId}
              >
                <item.icon />
                <span>{item.title}</span>
                {isExpanded ? <ChevronDown className="ml-auto h-4 w-4" /> : <ChevronRight className="ml-auto h-4 w-4" />}
              </SidebarMenuButton>
              {isExpanded && (
                <SidebarMenuSub>
                  {item.children.map((child: any) => renderMenuItem(child, level + 1, nodeKey))}
                </SidebarMenuSub>
              )}
            </>
          ) : (
            <SidebarMenuButton
              asChild
              isActive={isActive}
              data-testid={testId}
            >
              <Link href={item.url}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
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
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.title}</span>
                {isExpanded ? <ChevronDown className="ml-auto h-4 w-4" /> : <ChevronRight className="ml-auto h-4 w-4" />}
              </SidebarMenuSubButton>
              {isExpanded && (
                <SidebarMenuSub>
                  {item.children.map((child: any) => renderMenuItem(child, level + 1, nodeKey))}
                </SidebarMenuSub>
              )}
            </>
          ) : (
            <SidebarMenuSubButton
              asChild
              isActive={isActive}
              data-testid={testId}
            >
              <Link href={item.url}>
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuSubButton>
          )}
        </SidebarMenuSubItem>
      );
    } else {
      // Third-level items (deepest nesting)
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
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
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