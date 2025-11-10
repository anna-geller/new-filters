import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Play, 
  Clock, 
  LogIn, 
  LogOut, 
  AlertTriangle, 
  CheckCircle, 
  Ear,
  StickyNote,
  ChevronDown,
  ChevronRight,
  Search,
} from 'lucide-react';

interface PaletteItem {
  id: string;
  label: string;
  type: string;
  icon: React.ReactNode;
  description: string;
}

const PALETTE_ITEMS: Record<string, PaletteItem[]> = {
  tasks: [
    {
      id: 'log-task',
      label: 'Log Task',
      type: 'task',
      icon: <Play className="w-4 h-4" />,
      description: 'Log a message',
    },
    {
      id: 'http-task',
      label: 'HTTP Request',
      type: 'task',
      icon: <Play className="w-4 h-4" />,
      description: 'Make HTTP request',
    },
    {
      id: 'script-task',
      label: 'Script',
      type: 'task',
      icon: <Play className="w-4 h-4" />,
      description: 'Execute script',
    },
    {
      id: 'email-task',
      label: 'Send Email',
      type: 'task',
      icon: <Play className="w-4 h-4" />,
      description: 'Send email notification',
    },
  ],
  triggers: [
    {
      id: 'schedule-trigger',
      label: 'Schedule',
      type: 'trigger',
      icon: <Clock className="w-4 h-4" />,
      description: 'Cron-based schedule',
    },
    {
      id: 'webhook-trigger',
      label: 'Webhook',
      type: 'trigger',
      icon: <Clock className="w-4 h-4" />,
      description: 'HTTP webhook trigger',
    },
    {
      id: 'flow-trigger',
      label: 'Flow Trigger',
      type: 'trigger',
      icon: <Clock className="w-4 h-4" />,
      description: 'Trigger on flow completion',
    },
  ],
  elements: [
    {
      id: 'input',
      label: 'Input',
      type: 'input',
      icon: <LogIn className="w-4 h-4" />,
      description: 'Flow input parameter',
    },
    {
      id: 'output',
      label: 'Output',
      type: 'output',
      icon: <LogOut className="w-4 h-4" />,
      description: 'Flow output value',
    },
    {
      id: 'error',
      label: 'Error Handler',
      type: 'error',
      icon: <AlertTriangle className="w-4 h-4" />,
      description: 'Handle errors',
    },
    {
      id: 'finally',
      label: 'Finally',
      type: 'finally',
      icon: <CheckCircle className="w-4 h-4" />,
      description: 'Always execute',
    },
    {
      id: 'listener',
      label: 'Listener',
      type: 'listener',
      icon: <Ear className="w-4 h-4" />,
      description: 'Listen to events',
    },
    {
      id: 'note',
      label: 'Note',
      type: 'note',
      icon: <StickyNote className="w-4 h-4" />,
      description: 'Add documentation',
    },
  ],
};

export default function FlowCanvasPalette() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    tasks: true,
    triggers: true,
    elements: true,
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filterItems = (items: PaletteItem[]) => {
    if (!searchTerm.trim()) return items;
    const search = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search)
    );
  };

  return (
    <div className="w-64 bg-[#262A35] border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground mb-3">Elements</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search elements..."
            className="pl-9 bg-[#1F232D]"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Tasks Category */}
          <Collapsible open={expandedCategories.tasks}>
            <CollapsibleTrigger
              onClick={() => toggleCategory('tasks')}
              className="flex items-center justify-between w-full py-1 text-sm font-semibold text-foreground hover:text-foreground/80"
            >
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-[#8408FF]" />
                <span>Tasks</span>
              </div>
              {expandedCategories.tasks ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {filterItems(PALETTE_ITEMS.tasks).map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, item.type, item.label)}
                  className="flex items-start gap-2 p-2 rounded-md bg-[#1F232D] border border-border hover:border-[#8408FF] cursor-grab active:cursor-grabbing transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5 text-[#8408FF]">
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
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Triggers Category */}
          <Collapsible open={expandedCategories.triggers}>
            <CollapsibleTrigger
              onClick={() => toggleCategory('triggers')}
              className="flex items-center justify-between w-full py-1 text-sm font-semibold text-foreground hover:text-foreground/80"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#10B981]" />
                <span>Triggers</span>
              </div>
              {expandedCategories.triggers ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {filterItems(PALETTE_ITEMS.triggers).map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, item.type, item.label)}
                  className="flex items-start gap-2 p-2 rounded-md bg-[#1F232D] border border-border hover:border-[#10B981] cursor-grab active:cursor-grabbing transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5 text-[#10B981]">
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
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Flow Elements Category */}
          <Collapsible open={expandedCategories.elements}>
            <CollapsibleTrigger
              onClick={() => toggleCategory('elements')}
              className="flex items-center justify-between w-full py-1 text-sm font-semibold text-foreground hover:text-foreground/80"
            >
              <div className="flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-[#C4B5FD]" />
                <span>Flow Elements</span>
              </div>
              {expandedCategories.elements ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {filterItems(PALETTE_ITEMS.elements).map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, item.type, item.label)}
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
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Drag elements onto the canvas to build your flow
        </p>
      </div>
    </div>
  );
}

