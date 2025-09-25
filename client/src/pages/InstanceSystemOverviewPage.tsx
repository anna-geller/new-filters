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

const INSTANCE_USAGE = [
  {
    icon: <Grid3X3 className="h-4 w-4 text-muted-foreground" />,
    label: "Namespaces",
    value: "17"
  },
  {
    icon: <Workflow className="h-4 w-4 text-muted-foreground" />,
    label: "Flows",
    value: "65"
  },
  {
    icon: <ClipboardList className="h-4 w-4 text-muted-foreground" />,
    label: "Tasks",
    value: "126"
  },
  {
    icon: <Zap className="h-4 w-4 text-muted-foreground" />,
    label: "Triggers",
    value: "31"
  },
  {
    icon: <Eye className="h-4 w-4 text-muted-foreground" />,
    label: "Executions",
    value: "387",
    sublabel: "(last 48 hours)"
  },
  {
    icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
    label: "Total executions duration (in minutes)",
    value: "1",
    sublabel: "(last 48 hours)"
  },
  {
    icon: <Users className="h-4 w-4 text-muted-foreground" />,
    label: "Users",
    value: "34"
  },
  {
    icon: <UsersRound className="h-4 w-4 text-muted-foreground" />,
    label: "Groups",
    value: "4"
  },
  {
    icon: <Shield className="h-4 w-4 text-muted-foreground" />,
    label: "Roles",
    value: "5"
  }
];

const INSTANCE_LICENSE = {
  type: "INTERNAL",
  validUntil: "2035-08-01",
  workerGroups: true
};

export default function InstanceSystemOverviewPage() {
  return (
    <SystemOverviewGridTemplate
      scope="instance"
      license={INSTANCE_LICENSE}
      usage={INSTANCE_USAGE}
      storageTitle="Your Internal Storages"
      secretsTitle="Your Secrets Managers"
      storageButtonText="+ New Storage Plugin"
      secretsButtonText="+ New Secrets Plugin"
    />
  );
}