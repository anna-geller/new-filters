import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";

interface SaveFilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  initialName?: string;
  initialDescription?: string;
}

export default function SaveFilterDialog({ 
  isOpen, 
  onClose, 
  onSave,
  initialName = '',
  initialDescription = ''
}: SaveFilterDialogProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');

  // Sync state with props when dialog opens or props change
  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setDescription(initialDescription);
      setError('');
    }
  }, [isOpen, initialName, initialDescription]);

  const handleSave = async () => {
    if (!name.trim()) return;
    
    setError('');
    setIsSaving(true);
    try {
      onSave(name.trim(), description.trim());
      onClose();
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error saving filter:', error);
      setError(error instanceof Error ? error.message : 'Failed to save filter');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Filter Set
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md" data-testid="save-filter-error">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="filter-name">Name *</Label>
            <Input
              id="filter-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(''); // Clear error when user types
              }}
              placeholder="Enter a name for this filter set"
              data-testid="save-filter-name-input"
              className={error ? 'border-destructive focus:border-destructive' : ''}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="filter-description">Description</Label>
            <Textarea
              id="filter-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for this filter set"
              rows={3}
              data-testid="save-filter-description-input"
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            data-testid="save-filter-cancel-button"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
            data-testid="save-filter-save-button"
          >
            {isSaving ? 'Saving...' : 'Save Filter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}