import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { resolveBlueprint } from "@/utils/resolveBlueprint";
import { extractTemplateArguments } from "@/utils/templateArgs";
import type {
  BlueprintCard,
  TemplateArgument,
} from "@/pages/blueprints/BlueprintsLibraryPage";

interface UseBlueprintDialogProps {
  open: boolean;
  blueprint: BlueprintCard | null;
  onOpenChange: (open: boolean) => void;
  onResolved: (payload: { yaml: string; flowId: string; namespace: string }) => void;
}

type TemplateValue = string | boolean;
type TemplateFieldErrors = Record<string, string>;

function RequiredMarker() {
  return <span className="text-destructive ml-1">*</span>;
}

function getInitialArgValues(args?: TemplateArgument[]) {
  if (!args) {
    return {};
  }
  return args.reduce<Record<string, TemplateValue>>((acc, arg) => {
    if (arg.type === "BOOL") {
      acc[arg.id] = typeof arg.defaults === "boolean" ? arg.defaults : false;
      return acc;
    }
    acc[arg.id] = "";
    return acc;
  }, {});
}

function getPlaceholder(arg: TemplateArgument) {
  if (arg.defaults === undefined || arg.type === "BOOL") {
    return undefined;
  }
  return String(arg.defaults);
}

export default function UseBlueprintDialog({
  open,
  blueprint,
  onOpenChange,
  onResolved,
}: UseBlueprintDialogProps) {
  const [flowId, setFlowId] = useState("");
  const [namespace, setNamespace] = useState("");
  const [argValues, setArgValues] = useState<Record<string, TemplateValue>>({});
  const [errors, setErrors] = useState<TemplateFieldErrors>({});

  const templateArguments = useMemo(() => {
    if (!blueprint?.flowTemplate) {
      return [];
    }
    if (blueprint.templateArguments?.length) {
      return blueprint.templateArguments;
    }
    return extractTemplateArguments(blueprint.flowTemplate);
  }, [blueprint]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setFlowId("");
    setNamespace("");
    setArgValues(getInitialArgValues(templateArguments));
    setErrors({});
  }, [open, templateArguments]);

  const dialogTitle = useMemo(() => {
    if (!blueprint) {
      return "Use Blueprint";
    }
    return `Use ${blueprint.name}`;
  }, [blueprint]);

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setErrors({});
    }
    onOpenChange(nextOpen);
  };

  const handleArgChange = (id: string, value: TemplateValue) => {
    setArgValues((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => {
      if (!prev[id]) {
        return prev;
      }
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const handleSubmit = () => {
    if (!blueprint?.flowTemplate) {
      return;
    }

    const result = resolveBlueprint(
      blueprint.flowTemplate,
      flowId,
      namespace,
      templateArguments,
      argValues,
    );

    if (!result.success && result.errors) {
      setErrors(result.errors);
      return;
    }

    if (result.success && result.yaml) {
      onResolved({
        yaml: result.yaml,
        flowId: flowId.trim(),
        namespace: namespace.trim(),
      });
      setErrors({});
      onOpenChange(false);
    }
  };

  const renderArgumentField = (arg: TemplateArgument) => {
    if (arg.type === "BOOL") {
      const checked = Boolean(argValues[arg.id]);
      return (
        <div key={arg.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/10 px-4 py-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor={`arg-${arg.id}`} className="font-medium text-sm text-foreground">
              {arg.displayName || arg.id}
              {arg.required ? <RequiredMarker /> : null}
            </Label>
            {typeof arg.defaults === "boolean" && (
              <p className="text-xs text-muted-foreground">
                Defaults to {arg.defaults ? "true" : "false"}
              </p>
            )}
            {errors[arg.id] && (
              <p className="text-xs text-destructive mt-1">{errors[arg.id]}</p>
            )}
          </div>
          <Switch
            id={`arg-${arg.id}`}
            checked={checked}
            onCheckedChange={(value) => handleArgChange(arg.id, value)}
          />
        </div>
      );
    }

    const value = (argValues[arg.id] as string) ?? "";
    const isNumber = arg.type === "INT";
    const placeholder = getPlaceholder(arg);

    return (
      <div key={arg.id} className="space-y-1.5">
        <Label htmlFor={`arg-${arg.id}`} className="text-sm font-medium text-foreground">
          {arg.displayName || arg.id}
          {arg.required ? <RequiredMarker /> : null}
        </Label>
        <Input
          id={`arg-${arg.id}`}
          value={value}
          onChange={(event) => handleArgChange(arg.id, event.target.value)}
          placeholder={placeholder}
          type={isNumber ? "number" : "text"}
          inputMode={isNumber ? "numeric" : undefined}
          className={errors[arg.id] ? "border-destructive focus-visible:ring-destructive" : ""}
        />
        {errors[arg.id] && (
          <p className="text-xs text-destructive">{errors[arg.id]}</p>
        )}
      </div>
    );
  };

  const renderArgumentFields = () => {
    if (!templateArguments.length) {
      return null;
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Template Arguments</p>
          <p className="text-xs text-muted-foreground">
            {templateArguments.length} field{templateArguments.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="space-y-3">
          {templateArguments.map(renderArgumentField)}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <Label htmlFor="flow-id">
              Flow ID
              <RequiredMarker />
            </Label>
            <Input
              id="flow-id"
              placeholder="e.g. subflow-example"
              value={flowId}
              onChange={(event) => {
                setFlowId(event.target.value);
                setErrors((prev) => {
                  if (!prev.flowId) {
                    return prev;
                  }
                  const { flowId: _removed, ...rest } = prev;
                  return rest;
                });
              }}
              className={errors.flowId ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.flowId && (
              <p className="text-xs text-destructive">{errors.flowId}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="namespace">
              Namespace
              <RequiredMarker />
            </Label>
            <Input
              id="namespace"
              placeholder="e.g. prod.team"
              value={namespace}
              onChange={(event) => {
                setNamespace(event.target.value);
                setErrors((prev) => {
                  if (!prev.namespace) {
                    return prev;
                  }
                  const { namespace: _removed, ...rest } = prev;
                  return rest;
                });
              }}
              className={errors.namespace ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.namespace && (
              <p className="text-xs text-destructive">{errors.namespace}</p>
            )}
          </div>

          {renderArgumentFields()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!blueprint?.flowTemplate}>
            Create Flow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
