import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

function basename(path: string): string {
  return path.split("/").filter(Boolean).at(-1) ?? path;
}

function getLabel(toolName: string, args: Record<string, unknown>): string {
  const path = typeof args.path === "string" ? args.path : null;
  const filename = path ? basename(path) : null;

  if (toolName === "str_replace_editor") {
    if (!filename) return "Editing file";
    switch (args.command) {
      case "create":
        return `Creating ${filename}`;
      case "view":
        return `Viewing ${filename}`;
      case "str_replace":
      case "insert":
        return `Editing ${filename}`;
      default:
        return `Editing ${filename}`;
    }
  }

  if (toolName === "file_manager") {
    if (!filename) return "Managing file";
    switch (args.command) {
      case "rename": {
        const newPath = typeof args.new_path === "string" ? args.new_path : null;
        const newFilename = newPath ? basename(newPath) : null;
        return newFilename
          ? `Renaming ${filename} to ${newFilename}`
          : `Renaming ${filename}`;
      }
      case "delete":
        return `Deleting ${filename}`;
      default:
        return `Managing ${filename}`;
    }
  }

  return toolName;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const { toolName, args, state } = toolInvocation;
  const isDone = state === "result";
  const label = getLabel(toolName, args as Record<string, unknown>);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
