import yaml from "js-yaml";
import type { TemplateArgument } from "@/pages/blueprints/BlueprintsLibraryPage";

const FALLBACK_ARGUMENT_REGEX = /<<arg\.([a-zA-Z0-9_-]+)>>/g;

function humanizeId(id: string) {
  return id
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeArgumentType(value: unknown): TemplateArgument["type"] {
  return value === "INT" || value === "BOOL" ? value : "STRING";
}

function deriveArgsFromExtend(template?: string | null): TemplateArgument[] {
  if (!template) {
    return [];
  }

  try {
    const doc = yaml.load(template) as {
      extend?: {
        templateArguments?: Array<Partial<TemplateArgument> & { id?: string }>;
      };
    };

    const extendArgs = doc?.extend?.templateArguments;
    if (!Array.isArray(extendArgs)) {
      return [];
    }

    return extendArgs
      .filter((arg): arg is Partial<TemplateArgument> & { id: string } => Boolean(arg?.id))
      .map((arg) => ({
        id: arg.id.trim(),
        displayName: arg.displayName,
        type: normalizeArgumentType(arg.type),
        required: Boolean(arg.required),
        defaults: arg.defaults,
      }));
  } catch (error) {
    console.warn("Failed to parse extend.templateArguments:", error);
    return [];
  }
}

export function extractTemplateArguments(template?: string | null): TemplateArgument[] {
  const extendArgs = deriveArgsFromExtend(template);
  if (extendArgs.length > 0) {
    return extendArgs;
  }

  if (!template) {
    return [];
  }

  const uniqueIds = new Set<string>();
  const args: TemplateArgument[] = [];
  let match: RegExpExecArray | null;

  while ((match = FALLBACK_ARGUMENT_REGEX.exec(template)) !== null) {
    const argId = match[1];
    if (uniqueIds.has(argId)) {
      continue;
    }
    uniqueIds.add(argId);
    args.push({
      id: argId,
      displayName: humanizeId(argId),
      type: "STRING",
      required: true,
    });
  }

  return args;
}
