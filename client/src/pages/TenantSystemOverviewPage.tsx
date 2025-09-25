import { 
  Grid3X3, 
  Workflow, 
  ClipboardList, 
  Zap, 
  Eye, 
  Calendar, 
  Users, 
  UsersRound, 
  Shield 
} from "lucide-react";
import SystemOverviewGridTemplate from "@/pages/system-overview/SystemOverviewGridTemplate";

const TENANT_USAGE = [
  {
    icon: <Grid3X3 className="h-4 w-4 text-muted-foreground" />,
    label: "Namespaces",
    value: "3"
  },
  {
    icon: <Workflow className="h-4 w-4 text-muted-foreground" />,
    label: "Flows",
    value: "12"
  },
  {
    icon: <ClipboardList className="h-4 w-4 text-muted-foreground" />,
    label: "Tasks",
    value: "28"
  },
  {
    icon: <Zap className="h-4 w-4 text-muted-foreground" />,
    label: "Triggers",
    value: "5"
  },
  {
    icon: <Eye className="h-4 w-4 text-muted-foreground" />,
    label: "Executions",
    value: "47",
    sublabel: "(last 48 hours)"
  },
  {
    icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
    label: "Total executions duration (in minutes)",
    value: "0.2",
    sublabel: "(last 48 hours)"
  },
  {
    icon: <Users className="h-4 w-4 text-muted-foreground" />,
    label: "Users",
    value: "8"
  },
  {
    icon: <UsersRound className="h-4 w-4 text-muted-foreground" />,
    label: "Groups",
    value: "2"
  },
  {
    icon: <Shield className="h-4 w-4 text-muted-foreground" />,
    label: "Roles",
    value: "3"
  }
];

const TENANT_LICENSE = {
  type: "INTERNAL",
  validUntil: "2035-08-01",
  workerGroups: true
};

export default function TenantSystemOverviewPage() {
  return (
    <SystemOverviewGridTemplate
      scope="tenant"
      license={TENANT_LICENSE}
      usage={TENANT_USAGE}
      storageTitle="Your Internal Storages"
      secretsTitle="Your Secrets Managers"
      storageButtonText="+ New Storage Plugin"
      secretsButtonText="+ New Secrets Plugin"
    />
  );
}