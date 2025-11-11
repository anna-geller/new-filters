import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { BlueprintCard, BlueprintPluginId } from "@/pages/blueprints/BlueprintsLibraryPage";
import { extractTemplateArguments } from "@/utils/templateArgs";

interface BlueprintFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  initialBlueprint?: BlueprintCard;
  existingIds: string[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (blueprint: BlueprintCard, meta: { originalId?: string }) => void;
}

interface BlueprintFormState {
  title: string;
  description: string;
  tagsInput: string;
  flowTemplate: string;
}

const DEFAULT_PLUGINS: BlueprintPluginId[] = ["kestra"];

function mapBlueprintToFormState(blueprint?: BlueprintCard): BlueprintFormState {
  if (!blueprint) {
    return {
      title: "",
      description: "",
      tagsInput: "",
      flowTemplate: "",
    };
  }

  return {
    title: blueprint.name,
    description: blueprint.description,
    tagsInput: blueprint.tags.join(", "),
    flowTemplate: blueprint.flowTemplate ?? "",
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function generateBlueprintId(title: string, existingIds: string[]) {
  const fallback = "custom-blueprint";
  const base = slugify(title) || fallback;
  if (!existingIds.includes(base)) {
    return base;
  }

  let counter = 2;
  while (existingIds.includes(`${base}-${counter}`)) {
    counter += 1;
  }
  return `${base}-${counter}`;
}

function parseTags(rawValue: string) {
  return rawValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export default function BlueprintFormDialog({
  open,
  mode,
  initialBlueprint,
  existingIds,
  onOpenChange,
  onSubmit,
}: BlueprintFormDialogProps) {
  const [formState, setFormState] = useState<BlueprintFormState>(mapBlueprintToFormState(initialBlueprint));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [originalId, setOriginalId] = useState<string | undefined>(initialBlueprint?.id);

  useEffect(() => {
    if (open) {
      setFormState(mapBlueprintToFormState(initialBlueprint));
      setErrors({});
      setOriginalId(initialBlueprint?.id);
    }
  }, [open, initialBlueprint]);

  const dialogTitle = mode === "edit" ? "Edit Blueprint" : "Create Blueprint";
  const submitLabel = mode === "edit" ? "Save Changes" : "Create Blueprint";

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setErrors({});
    }
    onOpenChange(nextOpen);
  };

  const handleFieldChange = (field: keyof BlueprintFormState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {};
    const trimmedTitle = formState.title.trim();
    const trimmedFlow = formState.flowTemplate.trim();
    const parsedTags = parseTags(formState.tagsInput);

    if (!trimmedTitle) {
      nextErrors.title = "Title is required";
    }
    if (!trimmedFlow) {
      nextErrors.flowTemplate = "Flow YAML is required";
    }
    if (parsedTags.length === 0) {
      nextErrors.tagsInput = "Enter at least one tag";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const blueprintId = originalId ?? generateBlueprintId(trimmedTitle, existingIds);

    const blueprint: BlueprintCard = {
      id: blueprintId,
      name: trimmedTitle,
      description: formState.description.trim(),
      tags: parsedTags,
      plugins: initialBlueprint?.plugins?.length ? initialBlueprint.plugins : DEFAULT_PLUGINS,
      flowTemplate: trimmedFlow,
      templateArguments: extractTemplateArguments(trimmedFlow),
    };

    onSubmit(blueprint, { originalId });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto space-y-5 pr-1">
          <div className="space-y-1.5">
            <Label htmlFor="blueprint-title">Title</Label>
            <Input
              id="blueprint-title"
              value={formState.title}
              onChange={(event) => handleFieldChange("title", event.target.value)}
              placeholder="e.g. Subflow Starter Template"
              className={errors.title ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="blueprint-description">Description (optional)</Label>
            <Textarea
              id="blueprint-description"
              value={formState.description}
              onChange={(event) => handleFieldChange("description", event.target.value)}
              placeholder="Explain what this blueprint helps the team accomplish."
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="blueprint-tags">Tags</Label>
            <Input
              id="blueprint-tags"
              value={formState.tagsInput}
              onChange={(event) => handleFieldChange("tagsInput", event.target.value)}
              placeholder="Comma-separated tags, e.g. Getting Started, Kestra"
              className={errors.tagsInput ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.tagsInput ? (
              <p className="text-xs text-destructive">{errors.tagsInput}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Tags help teammates filter and find this blueprint quickly.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="blueprint-flow">Flow</Label>
            <Textarea
              id="blueprint-flow"
              value={formState.flowTemplate}
              onChange={(event) => handleFieldChange("flowTemplate", event.target.value)}
              placeholder={`id: <<flow_id>>\nnamespace: <<namespace>>\n\ntasks:\n  - id: example\n    type: io.kestra.plugin.core.log.Log\n    message: "Hello <<arg.recipient>>!"`}
              className={errors.flowTemplate ? "border-destructive focus-visible:ring-destructive" : ""}
              rows={12}
            />
            {errors.flowTemplate && (
              <p className="text-xs text-destructive">{errors.flowTemplate}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{submitLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
