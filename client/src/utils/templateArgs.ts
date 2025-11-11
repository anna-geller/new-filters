import type { TemplateArgument } from "@/pages/blueprints/BlueprintsLibraryPage";

const ARGUMENT_REGEX = /<<arg\.([a-zA-Z0-9_-]+)>>/g;

function humanizeId(id: string) {
  return id
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function extractTemplateArguments(template?: string | null): TemplateArgument[] {
  if (!template) {
    return [];
  }

  const uniqueIds = new Set<string>();
  const args: TemplateArgument[] = [];
  let match: RegExpExecArray | null;

  while ((match = ARGUMENT_REGEX.exec(template)) !== null) {
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
