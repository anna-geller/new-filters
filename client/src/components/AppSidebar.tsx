import { useState } from "react";
import { useLocation } from "wouter";
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

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}