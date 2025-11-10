import { useState } from 'react';
import { Node } from '@xyflow/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FlowNodePropertiesModalProps {
  node: Node;
  onClose: () => void;
  onSave: (updatedData: any) => void;
}

export default function FlowNodePropertiesModal({
  node,
  onClose,
  onSave,
}: FlowNodePropertiesModalProps) {
  const config = node.data.config as any || {};
  const [label, setLabel] = useState((node.data.label as string) || '');
  const [id, setId] = useState(config.id || '');
  const [type, setType] = useState(config.type || '');
  const [description, setDescription] = useState(config.description || '');
  const [customProperties, setCustomProperties] = useState(
    JSON.stringify(
      Object.entries(config)
        .filter(([key]) => !['id', 'type', 'description'].includes(key))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
      null,
      2
    )
  );

  const handleSave = () => {
    try {
      const customProps = customProperties.trim()
        ? JSON.parse(customProperties)
        : {};

      onSave({
        label,
        config: {
          id,
          type,
          description,
          ...customProps,
        },
      });
    } catch (error) {
      alert('Invalid JSON in custom properties');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#262A35] border-border">
        <DialogHeader>
          <DialogTitle>Edit Node Properties</DialogTitle>
          <DialogDescription>
            Configure the properties for this {node.type} node
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#1F232D]">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div>
              <Label htmlFor="modal-label">Label</Label>
              <Input
                id="modal-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="mt-1"
                placeholder="Display name for this node"
              />
            </div>

            <div>
              <Label htmlFor="modal-id">ID</Label>
              <Input
                id="modal-id"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="mt-1"
                placeholder="Unique identifier"
              />
            </div>

            <div>
              <Label htmlFor="modal-type">Type</Label>
              <Input
                id="modal-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1"
                placeholder={
                  node.type === 'task'
                    ? 'io.kestra.plugin.core.log.Log'
                    : node.type === 'trigger'
                    ? 'io.kestra.plugin.core.trigger.Schedule'
                    : 'Type'
                }
              />
            </div>

            <div>
              <Label htmlFor="modal-description">Description</Label>
              <Textarea
                id="modal-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
                rows={3}
                placeholder="Optional description"
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div>
              <Label htmlFor="modal-custom">Custom Properties (JSON)</Label>
              <Textarea
                id="modal-custom"
                value={customProperties}
                onChange={(e) => setCustomProperties(e.target.value)}
                className="mt-1 font-mono text-xs"
                rows={15}
                placeholder={`{\n  "property": "value"\n}`}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Add any additional properties as valid JSON
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-[#8408FF] hover:bg-[#8613f7]">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

