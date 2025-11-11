import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Clock, 
  LogIn, 
  LogOut, 
  AlertTriangle, 
  CheckCircle, 
  StickyNote,
  Plus,
} from 'lucide-react';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface PaletteItem {
  id: string;
  label: string;
  type: string;
  pluginType: string;
  icon: React.ReactNode;
  description: string;
  category?: string;
}

// Comprehensive list of Kestra tasks organized by category
const TASK_PLUGINS: PaletteItem[] = [
  // Core tasks
  { id: 'log', label: 'Log', type: 'task', pluginType: 'io.kestra.plugin.core.log.Log', icon: <Play className="w-4 h-4" />, description: 'Log a message', category: 'Core' },
  { id: 'debug', label: 'Debug', type: 'task', pluginType: 'io.kestra.plugin.core.debug.Return', icon: <Play className="w-4 h-4" />, description: 'Return debug information', category: 'Core' },
  { id: 'pause', label: 'Pause', type: 'task', pluginType: 'io.kestra.plugin.core.flow.Pause', icon: <Play className="w-4 h-4" />, description: 'Pause flow execution', category: 'Core' },
  { id: 'sequential', label: 'Sequential', type: 'task', pluginType: 'io.kestra.plugin.core.flow.Sequential', icon: <Play className="w-4 h-4" />, description: 'Run tasks sequentially', category: 'Core' },
  { id: 'parallel', label: 'Parallel', type: 'task', pluginType: 'io.kestra.plugin.core.flow.Parallel', icon: <Play className="w-4 h-4" />, description: 'Run tasks in parallel', category: 'Core' },
  
  // HTTP
  { id: 'http-request', label: 'HTTP Request', type: 'task', pluginType: 'io.kestra.plugin.core.http.Request', icon: <Play className="w-4 h-4" />, description: 'Make HTTP request', category: 'HTTP' },
  { id: 'http-download', label: 'HTTP Download', type: 'task', pluginType: 'io.kestra.plugin.core.http.Download', icon: <Play className="w-4 h-4" />, description: 'Download file via HTTP', category: 'HTTP' },
  
  // Scripts
  { id: 'python-script', label: 'Python Script', type: 'task', pluginType: 'io.kestra.plugin.scripts.python.Script', icon: <Play className="w-4 h-4" />, description: 'Run Python script', category: 'Scripts' },
  { id: 'node-script', label: 'Node.js Script', type: 'task', pluginType: 'io.kestra.plugin.scripts.node.Script', icon: <Play className="w-4 h-4" />, description: 'Run Node.js script', category: 'Scripts' },
  { id: 'shell-script', label: 'Shell Script', type: 'task', pluginType: 'io.kestra.plugin.scripts.shell.Script', icon: <Play className="w-4 h-4" />, description: 'Run shell script', category: 'Scripts' },
  { id: 'powershell-script', label: 'PowerShell', type: 'task', pluginType: 'io.kestra.plugin.scripts.powershell.Script', icon: <Play className="w-4 h-4" />, description: 'Run PowerShell script', category: 'Scripts' },
  
  // Notifications
  { id: 'send-email', label: 'Send Email', type: 'task', pluginType: 'io.kestra.plugin.notifications.mail.MailSend', icon: <Play className="w-4 h-4" />, description: 'Send email notification', category: 'Notifications' },
  { id: 'slack-incoming-webhook', label: 'Slack Webhook', type: 'task', pluginType: 'io.kestra.plugin.notifications.slack.SlackIncomingWebhook', icon: <Play className="w-4 h-4" />, description: 'Send Slack message', category: 'Notifications' },
  { id: 'teams-webhook', label: 'Teams Webhook', type: 'task', pluginType: 'io.kestra.plugin.notifications.teams.TeamsIncomingWebhook', icon: <Play className="w-4 h-4" />, description: 'Send Teams message', category: 'Notifications' },
  
  // AWS
  { id: 'aws-s3-upload', label: 'S3 Upload', type: 'task', pluginType: 'io.kestra.plugin.aws.s3.Upload', icon: <Play className="w-4 h-4" />, description: 'Upload to S3', category: 'AWS' },
  { id: 'aws-s3-download', label: 'S3 Download', type: 'task', pluginType: 'io.kestra.plugin.aws.s3.Download', icon: <Play className="w-4 h-4" />, description: 'Download from S3', category: 'AWS' },
  { id: 'aws-lambda-invoke', label: 'Lambda Invoke', type: 'task', pluginType: 'io.kestra.plugin.aws.lambda.Invoke', icon: <Play className="w-4 h-4" />, description: 'Invoke Lambda function', category: 'AWS' },
  { id: 'aws-cli', label: 'AWS CLI', type: 'task', pluginType: 'io.kestra.plugin.aws.cli.AwsCLI', icon: <Play className="w-4 h-4" />, description: 'Run AWS CLI commands', category: 'AWS' },
  
  // GCP
  { id: 'gcs-upload', label: 'GCS Upload', type: 'task', pluginType: 'io.kestra.plugin.gcp.gcs.Upload', icon: <Play className="w-4 h-4" />, description: 'Upload to Google Cloud Storage', category: 'GCP' },
  { id: 'gcs-download', label: 'GCS Download', type: 'task', pluginType: 'io.kestra.plugin.gcp.gcs.Download', icon: <Play className="w-4 h-4" />, description: 'Download from GCS', category: 'GCP' },
  { id: 'bigquery-query', label: 'BigQuery Query', type: 'task', pluginType: 'io.kestra.plugin.gcp.bigquery.Query', icon: <Play className="w-4 h-4" />, description: 'Run BigQuery query', category: 'GCP' },
  
  // Azure
  { id: 'azure-blob-upload', label: 'Blob Upload', type: 'task', pluginType: 'io.kestra.plugin.azure.storage.blob.Upload', icon: <Play className="w-4 h-4" />, description: 'Upload to Azure Blob', category: 'Azure' },
  { id: 'azure-blob-download', label: 'Blob Download', type: 'task', pluginType: 'io.kestra.plugin.azure.storage.blob.Download', icon: <Play className="w-4 h-4" />, description: 'Download from Azure Blob', category: 'Azure' },
  
  // Databases
  { id: 'postgres-query', label: 'PostgreSQL Query', type: 'task', pluginType: 'io.kestra.plugin.jdbc.postgresql.Query', icon: <Play className="w-4 h-4" />, description: 'Run PostgreSQL query', category: 'Databases' },
  { id: 'mysql-query', label: 'MySQL Query', type: 'task', pluginType: 'io.kestra.plugin.jdbc.mysql.Query', icon: <Play className="w-4 h-4" />, description: 'Run MySQL query', category: 'Databases' },
  { id: 'mongodb-find', label: 'MongoDB Find', type: 'task', pluginType: 'io.kestra.plugin.mongodb.Find', icon: <Play className="w-4 h-4" />, description: 'Query MongoDB', category: 'Databases' },
  
  // Git
  { id: 'git-clone', label: 'Git Clone', type: 'task', pluginType: 'io.kestra.plugin.git.Clone', icon: <Play className="w-4 h-4" />, description: 'Clone Git repository', category: 'Git' },
  { id: 'git-push', label: 'Git Push', type: 'task', pluginType: 'io.kestra.plugin.git.Push', icon: <Play className="w-4 h-4" />, description: 'Push to Git repository', category: 'Git' },
  
  // Docker
  { id: 'docker-run', label: 'Docker Run', type: 'task', pluginType: 'io.kestra.plugin.docker.Run', icon: <Play className="w-4 h-4" />, description: 'Run Docker container', category: 'Docker' },
  
  // Kubernetes
  { id: 'kubernetes-create', label: 'K8s Create', type: 'task', pluginType: 'io.kestra.plugin.kubernetes.PodCreate', icon: <Play className="w-4 h-4" />, description: 'Create Kubernetes pod', category: 'Kubernetes' },
];

// Comprehensive list of Kestra triggers
const TRIGGER_PLUGINS: PaletteItem[] = [
  { id: 'schedule', label: 'Schedule', type: 'trigger', pluginType: 'io.kestra.plugin.core.trigger.Schedule', icon: <Clock className="w-4 h-4" />, description: 'Cron-based schedule', category: 'Core' },
  { id: 'webhook', label: 'Webhook', type: 'trigger', pluginType: 'io.kestra.plugin.core.trigger.Webhook', icon: <Clock className="w-4 h-4" />, description: 'HTTP webhook trigger', category: 'Core' },
  { id: 'flow-trigger', label: 'Flow', type: 'trigger', pluginType: 'io.kestra.plugin.core.trigger.Flow', icon: <Clock className="w-4 h-4" />, description: 'Trigger on flow completion', category: 'Core' },
  { id: 'polling', label: 'Polling', type: 'trigger', pluginType: 'io.kestra.plugin.core.trigger.Polling', icon: <Clock className="w-4 h-4" />, description: 'Poll for changes', category: 'Core' },
  
  // Cloud triggers
  { id: 'aws-sqs', label: 'AWS SQS', type: 'trigger', pluginType: 'io.kestra.plugin.aws.sqs.Consume', icon: <Clock className="w-4 h-4" />, description: 'Consume from SQS queue', category: 'AWS' },
  { id: 'aws-s3-list', label: 'S3 List', type: 'trigger', pluginType: 'io.kestra.plugin.aws.s3.trigger.S3', icon: <Clock className="w-4 h-4" />, description: 'Trigger on S3 changes', category: 'AWS' },
  { id: 'gcp-pubsub', label: 'GCP Pub/Sub', type: 'trigger', pluginType: 'io.kestra.plugin.gcp.pubsub.Consume', icon: <Clock className="w-4 h-4" />, description: 'Consume from Pub/Sub', category: 'GCP' },
  
  // Messaging
  { id: 'kafka-consume', label: 'Kafka', type: 'trigger', pluginType: 'io.kestra.plugin.kafka.Consume', icon: <Clock className="w-4 h-4" />, description: 'Consume from Kafka', category: 'Messaging' },
  { id: 'mqtt-subscribe', label: 'MQTT', type: 'trigger', pluginType: 'io.kestra.plugin.mqtt.Subscribe', icon: <Clock className="w-4 h-4" />, description: 'Subscribe to MQTT topic', category: 'Messaging' },
];

// Error handler tasks (same as regular tasks but shown in error handling context)
const ERROR_HANDLER_TASKS: PaletteItem[] = [
  { id: 'error-log', label: 'Log', type: 'error', pluginType: 'io.kestra.plugin.core.log.Log', icon: <AlertTriangle className="w-4 h-4" />, description: 'Log error message', category: 'Core' },
  { id: 'error-debug', label: 'Debug', type: 'error', pluginType: 'io.kestra.plugin.core.debug.Return', icon: <AlertTriangle className="w-4 h-4" />, description: 'Debug error', category: 'Core' },
  { id: 'error-email', label: 'Send Email', type: 'error', pluginType: 'io.kestra.plugin.notifications.mail.MailSend', icon: <AlertTriangle className="w-4 h-4" />, description: 'Send error notification', category: 'Notifications' },
  { id: 'error-slack', label: 'Slack', type: 'error', pluginType: 'io.kestra.plugin.notifications.slack.SlackIncomingWebhook', icon: <AlertTriangle className="w-4 h-4" />, description: 'Send Slack alert', category: 'Notifications' },
  { id: 'error-teams', label: 'Teams', type: 'error', pluginType: 'io.kestra.plugin.notifications.teams.TeamsIncomingWebhook', icon: <AlertTriangle className="w-4 h-4" />, description: 'Send Teams alert', category: 'Notifications' },
];

// Finally tasks (cleanup tasks that always run)
const FINALLY_TASKS: PaletteItem[] = [
  { id: 'finally-log', label: 'Log', type: 'finally', pluginType: 'io.kestra.plugin.core.log.Log', icon: <CheckCircle className="w-4 h-4" />, description: 'Log cleanup message', category: 'Core' },
  { id: 'finally-debug', label: 'Debug', type: 'finally', pluginType: 'io.kestra.plugin.core.debug.Return', icon: <CheckCircle className="w-4 h-4" />, description: 'Debug cleanup', category: 'Core' },
  { id: 'finally-cleanup', label: 'Cleanup', type: 'finally', pluginType: 'io.kestra.plugin.scripts.shell.Script', icon: <CheckCircle className="w-4 h-4" />, description: 'Run cleanup script', category: 'Core' },
  { id: 'finally-email', label: 'Send Email', type: 'finally', pluginType: 'io.kestra.plugin.notifications.mail.MailSend', icon: <CheckCircle className="w-4 h-4" />, description: 'Send completion notification', category: 'Notifications' },
];

// Flow elements (inputs, outputs, notes)
const FLOW_ELEMENTS: PaletteItem[] = [
  { id: 'input', label: 'Input', type: 'input', pluginType: '', icon: <LogIn className="w-4 h-4" />, description: 'Flow input parameter' },
  { id: 'output', label: 'Output', type: 'output', pluginType: '', icon: <LogOut className="w-4 h-4" />, description: 'Flow output value' },
  { id: 'note', label: 'Note', type: 'note', pluginType: '', icon: <StickyNote className="w-4 h-4" />, description: 'Add sticky note' },
];

interface FlowCanvasPaletteProps {
  onAddNode?: (type: string, label: string, pluginType: string) => void;
}

export default function FlowCanvasPalette({ onAddNode }: FlowCanvasPaletteProps) {
  const [taskOpen, setTaskOpen] = useState(false);
  const [triggerOpen, setTriggerOpen] = useState(false);
  const [errorHandlerOpen, setErrorHandlerOpen] = useState(false);
  const [finallyOpen, setFinallyOpen] = useState(false);

  const handleTaskSelect = (task: PaletteItem) => {
    if (onAddNode) {
      onAddNode(task.type, task.label, task.pluginType);
    }
    setTaskOpen(false);
  };

  const handleTriggerSelect = (trigger: PaletteItem) => {
    if (onAddNode) {
      onAddNode(trigger.type, trigger.label, trigger.pluginType);
    }
    setTriggerOpen(false);
  };

  const handleErrorHandlerSelect = (errorHandler: PaletteItem) => {
    if (onAddNode) {
      onAddNode(errorHandler.type, errorHandler.label, errorHandler.pluginType);
    }
    setErrorHandlerOpen(false);
  };

  const handleFinallySelect = (finallyTask: PaletteItem) => {
    if (onAddNode) {
      onAddNode(finallyTask.type, finallyTask.label, finallyTask.pluginType);
    }
    setFinallyOpen(false);
  };

  const onDragStart = (event: React.DragEvent, nodeType: string, label: string, pluginType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-label', label);
    event.dataTransfer.setData('application/reactflow-plugin', pluginType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-[#262A35] border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Elements</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Tasks Dropdown */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Play className="w-4 h-4 text-[#8408FF]" />
              <span className="text-sm font-semibold text-foreground">Tasks</span>
            </div>
            <Popover open={taskOpen} onOpenChange={setTaskOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={taskOpen}
                  className="w-full justify-between bg-[#1F232D] border-border hover:border-[#8408FF] hover:bg-[#1F232D] text-foreground"
                >
                  <span className="text-sm">Select a task...</span>
                  <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[240px] p-0 bg-[#262A35] border-border" align="start">
                <Command className="bg-[#262A35]">
                  <CommandInput 
                    placeholder="Search tasks..." 
                    className="h-9 bg-[#1F232D] text-foreground border-border" 
                  />
                  <CommandList>
                    <CommandEmpty className="text-muted-foreground">No task found.</CommandEmpty>
                    {['Core', 'HTTP', 'Scripts', 'Notifications', 'AWS', 'GCP', 'Azure', 'Databases', 'Git', 'Docker', 'Kubernetes'].map((category) => {
                      const tasksInCategory = TASK_PLUGINS.filter(t => t.category === category);
                      if (tasksInCategory.length === 0) return null;
                      return (
                        <CommandGroup key={category} heading={category} className="text-foreground">
                          {tasksInCategory.map((task) => (
                            <CommandItem
                              key={task.id}
                              value={`${task.label} ${task.pluginType} ${task.description}`}
                              onSelect={() => handleTaskSelect(task)}
                              className="cursor-pointer hover:bg-[#1F232D] text-foreground"
                            >
                              <Play className="mr-2 h-4 w-4 text-[#8408FF]" />
                              <div className="flex flex-col flex-1">
                                <span className="text-sm">{task.label}</span>
                                <span className="text-xs text-muted-foreground">{task.description}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      );
                    })}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Separator className="bg-border" />

          {/* Triggers Dropdown */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-[#10B981]" />
              <span className="text-sm font-semibold text-foreground">Triggers</span>
            </div>
            <Popover open={triggerOpen} onOpenChange={setTriggerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={triggerOpen}
                  className="w-full justify-between bg-[#1F232D] border-border hover:border-[#10B981] hover:bg-[#1F232D] text-foreground"
                >
                  <span className="text-sm">Select a trigger...</span>
                  <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[240px] p-0 bg-[#262A35] border-border" align="start">
                <Command className="bg-[#262A35]">
                  <CommandInput 
                    placeholder="Search triggers..." 
                    className="h-9 bg-[#1F232D] text-foreground border-border" 
                  />
                  <CommandList>
                    <CommandEmpty className="text-muted-foreground">No trigger found.</CommandEmpty>
                    {['Core', 'AWS', 'GCP', 'Messaging'].map((category) => {
                      const triggersInCategory = TRIGGER_PLUGINS.filter(t => t.category === category);
                      if (triggersInCategory.length === 0) return null;
                      return (
                        <CommandGroup key={category} heading={category} className="text-foreground">
                          {triggersInCategory.map((trigger) => (
                            <CommandItem
                              key={trigger.id}
                              value={`${trigger.label} ${trigger.pluginType} ${trigger.description}`}
                              onSelect={() => handleTriggerSelect(trigger)}
                              className="cursor-pointer hover:bg-[#1F232D] text-foreground"
                            >
                              <Clock className="mr-2 h-4 w-4 text-[#10B981]" />
                              <div className="flex flex-col flex-1">
                                <span className="text-sm">{trigger.label}</span>
                                <span className="text-xs text-muted-foreground">{trigger.description}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      );
                    })}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Separator className="bg-border" />

          {/* Error Handlers Dropdown */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
              <span className="text-sm font-semibold text-foreground">Error Handlers</span>
            </div>
            <Popover open={errorHandlerOpen} onOpenChange={setErrorHandlerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={errorHandlerOpen}
                  className="w-full justify-between bg-[#1F232D] border-border hover:border-[#EF4444] hover:bg-[#1F232D] text-foreground"
                >
                  <span className="text-sm">Add error handler...</span>
                  <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[240px] p-0 bg-[#262A35] border-border" align="start">
                <Command className="bg-[#262A35]">
                  <CommandInput 
                    placeholder="Search handlers..." 
                    className="h-9 bg-[#1F232D] text-foreground border-border" 
                  />
                  <CommandList>
                    <CommandEmpty className="text-muted-foreground">No error handler found.</CommandEmpty>
                    {['Core', 'Notifications'].map((category) => {
                      const handlersInCategory = ERROR_HANDLER_TASKS.filter(t => t.category === category);
                      if (handlersInCategory.length === 0) return null;
                      return (
                        <CommandGroup key={category} heading={category} className="text-foreground">
                          {handlersInCategory.map((handler) => (
                            <CommandItem
                              key={handler.id}
                              value={`${handler.label} ${handler.pluginType} ${handler.description}`}
                              onSelect={() => handleErrorHandlerSelect(handler)}
                              className="cursor-pointer hover:bg-[#1F232D] text-foreground"
                            >
                              <AlertTriangle className="mr-2 h-4 w-4 text-[#EF4444]" />
                              <div className="flex flex-col flex-1">
                                <span className="text-sm">{handler.label}</span>
                                <span className="text-xs text-muted-foreground">{handler.description}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      );
                    })}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Separator className="bg-border" />

          {/* Finally Tasks Dropdown */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-[#A78BFA]" />
              <span className="text-sm font-semibold text-foreground">Finally Tasks</span>
            </div>
            <Popover open={finallyOpen} onOpenChange={setFinallyOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={finallyOpen}
                  className="w-full justify-between bg-[#1F232D] border-border hover:border-[#A78BFA] hover:bg-[#1F232D] text-foreground"
                >
                  <span className="text-sm">Add finally task...</span>
                  <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[240px] p-0 bg-[#262A35] border-border" align="start">
                <Command className="bg-[#262A35]">
                  <CommandInput 
                    placeholder="Search tasks..." 
                    className="h-9 bg-[#1F232D] text-foreground border-border" 
                  />
                  <CommandList>
                    <CommandEmpty className="text-muted-foreground">No finally task found.</CommandEmpty>
                    {['Core', 'Notifications'].map((category) => {
                      const tasksInCategory = FINALLY_TASKS.filter(t => t.category === category);
                      if (tasksInCategory.length === 0) return null;
                      return (
                        <CommandGroup key={category} heading={category} className="text-foreground">
                          {tasksInCategory.map((task) => (
                            <CommandItem
                              key={task.id}
                              value={`${task.label} ${task.pluginType} ${task.description}`}
                              onSelect={() => handleFinallySelect(task)}
                              className="cursor-pointer hover:bg-[#1F232D] text-foreground"
                            >
                              <CheckCircle className="mr-2 h-4 w-4 text-[#A78BFA]" />
                              <div className="flex flex-col flex-1">
                                <span className="text-sm">{task.label}</span>
                                <span className="text-xs text-muted-foreground">{task.description}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      );
                    })}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Separator className="bg-border" />

          {/* Flow Elements - Keep as draggable cards */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StickyNote className="w-4 h-4 text-[#C4B5FD]" />
              <span className="text-sm font-semibold text-foreground">Flow Elements</span>
            </div>
            <div className="space-y-2">
              {FLOW_ELEMENTS.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, item.type, item.label, item.pluginType)}
                  className="flex items-start gap-2 p-2 rounded-md bg-[#1F232D] border border-border hover:border-[#C4B5FD] cursor-grab active:cursor-grabbing transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5 text-[#C4B5FD]">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {item.label}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Select tasks/triggers from dropdowns or drag flow elements onto the canvas
        </p>
      </div>
    </div>
  );
}
