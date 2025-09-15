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
  Settings 
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
} from "@/components/ui/sidebar";

// Navigation items matching the screenshot
const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Overview",
    url: "/overview",
    icon: Eye,
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
    url: "/",
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
    title: "KV Store",
    url: "/kv-store",
    icon: Database,
  },
  {
    title: "Secrets",
    url: "/secrets",
    icon: Lock,
  },
  {
    title: "Blueprints",
    url: "/blueprints",
    icon: Package,
  },
  {
    title: "Plugins",
    url: "/plugins",
    icon: Puzzle,
  },
  {
    title: "Administration",
    url: "/administration",
    icon: Settings,
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