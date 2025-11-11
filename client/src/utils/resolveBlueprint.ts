import yaml from "js-yaml";
import type { TemplateArgument } from "@/pages/blueprints/BlueprintsLibraryPage";

export interface ResolveBlueprintResult {
  success: boolean;
  yaml?: string;
  errors?: Record<string, string>;
}

type UserInputs = Record<string, unknown>;

const FLOW_ID_TOKEN = "<<flow_id>>";
const NAMESPACE_TOKEN = "<<namespace>>";

const REQUIRED_FIELD_ERROR = "This field is required";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceToken(template: string, token: string, replacement: string) {
  if (!template || !token) {
    return template;
  }
  const pattern = new RegExp(escapeRegExp(token), "g");
  return template.replace(pattern, replacement);
}

function formatArgumentLabel(arg: TemplateArgument) {
  return arg.displayName || arg.id;
}

function stripTemplateMetadata(yamlText: string) {
  try {
    const doc = yaml.load(yamlText) as Record<string, any> | null;
    if (!doc || typeof doc !== "object") {
      return yamlText;
    }

    if (!("extend" in doc)) {
      return yamlText;
    }

    const extendBlock = doc.extend as Record<string, any> | undefined;
    if (!extendBlock) {
      return yamlText;
    }

    if (Array.isArray(extendBlock.templateArguments)) {
      delete extendBlock.templateArguments;
      if (Object.keys(extendBlock).length === 0) {
        delete doc.extend;
      }

      return yaml.dump(doc, {
        noRefs: true,
        lineWidth: 120,
      });
    }

    return yamlText;
  } catch {
    return yamlText;
  }
}

function ensureFlowMetadata(yamlText: string, flowId: string, namespace: string) {
  try {
    const doc = yaml.load(yamlText) as Record<string, any> | null;
    if (doc && typeof doc === "object") {
      doc.id = flowId;
      doc.namespace = namespace;
      return yaml.dump(doc, {
        noRefs: true,
        lineWidth: 120,
      });
    }
  } catch {
    // fall through to regex replacement
  }

  let updated = yamlText || "";
  const idRegex = /^id:\s*.+$/m;
  const namespaceRegex = /^namespace:\s*.+$/m;

  if (idRegex.test(updated)) {
    updated = updated.replace(idRegex, `id: ${flowId}`);
  } else {
    updated = `id: ${flowId}\n${updated}`.trim();
  }

  if (namespaceRegex.test(updated)) {
    updated = updated.replace(namespaceRegex, `namespace: ${namespace}`);
  } else {
    updated = updated.replace(`id: ${flowId}`, `id: ${flowId}\nnamespace: ${namespace}`);
  }

  return updated;
}

export function resolveBlueprint(
  template: string,
  flowId: string,
  namespace: string,
  templateArgs: TemplateArgument[] = [],
  userInputs: UserInputs = {},
): ResolveBlueprintResult {
  const errors: Record<string, string> = {};
  const trimmedFlowId = flowId.trim();
  const trimmedNamespace = namespace.trim();

  if (!trimmedFlowId) {
    errors.flowId = REQUIRED_FIELD_ERROR;
  }
  if (!trimmedNamespace) {
    errors.namespace = REQUIRED_FIELD_ERROR;
  }

  const resolvedArgs: Record<string, string> = {};

  templateArgs.forEach((arg) => {
    const rawValue = userInputs[arg.id];
    const fallback = arg.defaults;
    const value =
      rawValue === undefined || rawValue === ""
        ? fallback
        : rawValue;
    const hasValue = value !== undefined && value !== null && value !== "";

    if (arg.required && !hasValue) {
      errors[arg.id] = REQUIRED_FIELD_ERROR;
      return;
    }

    if (!hasValue) {
      resolvedArgs[arg.id] = "";
      return;
    }

    if (arg.type === "INT") {
      const numericValue = typeof value === "number" ? value : Number(String(value).trim());
      if (!Number.isInteger(numericValue)) {
        errors[arg.id] = `${formatArgumentLabel(arg)} must be an integer`;
        return;
      }
      resolvedArgs[arg.id] = String(numericValue);
      return;
    }

    if (arg.type === "BOOL") {
      let boolValue: boolean | null = null;
      if (typeof value === "boolean") {
        boolValue = value;
      } else if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (normalized === "true") {
          boolValue = true;
        } else if (normalized === "false") {
          boolValue = false;
        }
      }
      if (boolValue === null) {
        errors[arg.id] = `${formatArgumentLabel(arg)} must be true or false`;
        return;
      }
      resolvedArgs[arg.id] = boolValue ? "true" : "false";
      return;
    }

    resolvedArgs[arg.id] = String(value).trim();
  });

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  let resolvedYaml = template || "";
  resolvedYaml = replaceToken(resolvedYaml, FLOW_ID_TOKEN, trimmedFlowId);
  resolvedYaml = replaceToken(resolvedYaml, NAMESPACE_TOKEN, trimmedNamespace);

  templateArgs.forEach((arg) => {
    const token = `<<arg.${arg.id}>>`;
    resolvedYaml = replaceToken(resolvedYaml, token, resolvedArgs[arg.id] ?? "");
  });

  resolvedYaml = stripTemplateMetadata(resolvedYaml);
  resolvedYaml = ensureFlowMetadata(resolvedYaml, trimmedFlowId, trimmedNamespace);

  return {
    success: true,
    yaml: resolvedYaml,
  };
}
