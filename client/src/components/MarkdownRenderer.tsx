import { memo } from "react";
import type { ReactNode } from "react";

interface MarkdownRendererProps {
  content: string;
}

type MarkdownBlock =
  | { type: "paragraph"; content: string }
  | { type: "heading"; content: string; depth: number }
  | { type: "list"; items: string[] }
  | { type: "code"; content: string; language?: string };

function renderInline(text: string): ReactNode[] {
  const result: ReactNode[] = [];
  const tokenRegex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_|`([^`]+)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }

    if (match[2] && match[3]) {
      const href = match[3];
      result.push(
        <a
          key={`link-${match.index}`}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline hover:text-primary/80"
        >
          {renderInline(match[2])}
        </a>,
      );
    } else if (match[4]) {
      result.push(
        <strong key={`strong-${match.index}`}>
          {renderInline(match[4])}
        </strong>,
      );
    } else if (match[5]) {
      result.push(
        <em key={`em-${match.index}`}>
          {renderInline(match[5])}
        </em>,
      );
    } else if (match[6]) {
      result.push(
        <em key={`em-alt-${match.index}`}>
          {renderInline(match[6])}
        </em>,
      );
    } else if (match[7]) {
      result.push(
        <code key={`code-${match.index}`} className="rounded bg-[#1A1E29] px-1 py-0.5 text-xs">
          {match[7]}
        </code>,
      );
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

function parseMarkdown(content: string): MarkdownBlock[] {
  const normalized = content.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const blocks: MarkdownBlock[] = [];

  let paragraphBuffer: string[] = [];
  let listBuffer: string[] | null = null;
  let codeBuffer: { language?: string; lines: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      blocks.push({
        type: "paragraph",
        content: paragraphBuffer.join(" ").trim(),
      });
      paragraphBuffer = [];
    }
  };

  const flushList = () => {
    if (listBuffer && listBuffer.length > 0) {
      blocks.push({
        type: "list",
        items: [...listBuffer],
      });
    }
    listBuffer = null;
  };

  const flushCode = () => {
    if (codeBuffer) {
      blocks.push({
        type: "code",
        content: codeBuffer.lines.join("\n"),
        language: codeBuffer.language,
      });
      codeBuffer = null;
    }
  };

  for (const line of lines) {
    const trimmedEnd = line.trimEnd();
    if (codeBuffer) {
      if (trimmedEnd.startsWith("```")) {
        flushCode();
        continue;
      }
      codeBuffer.lines.push(line);
      continue;
    }

    if (trimmedEnd.startsWith("```")) {
      flushParagraph();
      flushList();
      const language = trimmedEnd.slice(3).trim() || undefined;
      codeBuffer = { language, lines: [] };
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const itemText = line.replace(/^\s*[-*+]\s+/, "");
      if (!listBuffer) {
        flushParagraph();
        listBuffer = [];
      }
      listBuffer.push(itemText);
      continue;
    }

    const trimmed = trimmedEnd.trim();
    if (trimmed.length === 0) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const depth = headingMatch[1].length;
      blocks.push({
        type: "heading",
        depth,
        content: headingMatch[2].trim(),
      });
      continue;
    }

    paragraphBuffer.push(trimmed);
  }

  flushCode();
  flushParagraph();
  flushList();

  return blocks;
}

function MarkdownRendererComponent({ content }: MarkdownRendererProps) {
  if (!content.trim()) {
    return null;
  }

  const blocks = parseMarkdown(content);

  return (
    <div className="prose prose-invert prose-sm max-w-none space-y-3">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const depth = Math.min(block.depth + 1, 6);
          const HeadingTag = `h${depth}` as keyof JSX.IntrinsicElements;
          return (
            <HeadingTag key={`heading-${index}`} className="text-foreground font-semibold">
              {renderInline(block.content)}
            </HeadingTag>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p key={`paragraph-${index}`} className="text-sm leading-6 text-muted-foreground">
              {renderInline(block.content)}
            </p>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={`list-${index}`} className="ml-5 list-disc space-y-1 text-sm text-muted-foreground">
              {block.items.map((item, itemIndex) => (
                <li key={`list-${index}-${itemIndex}`}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }

        return (
          <pre
            key={`code-${index}`}
            className="overflow-x-auto rounded-md border border-border/40 bg-[#1A1E29] p-4 text-xs leading-relaxed"
          >
            <code>{block.content}</code>
          </pre>
        );
      })}
    </div>
  );
}

export default memo(MarkdownRendererComponent);
