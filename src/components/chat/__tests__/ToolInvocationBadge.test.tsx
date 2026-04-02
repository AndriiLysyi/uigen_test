import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

// --- str_replace_editor ---

test("shows 'Creating' for str_replace_editor create command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/src/components/Button.tsx" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("shows 'Editing' for str_replace_editor str_replace command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "/src/App.jsx" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("shows 'Editing' for str_replace_editor insert command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "insert", path: "/src/App.jsx" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("shows 'Viewing' for str_replace_editor view command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "view", path: "/src/App.jsx" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText("Viewing App.jsx")).toBeDefined();
});

test("shows 'Editing' for str_replace_editor unknown command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "undo_edit", path: "/src/App.jsx" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("shows fallback for str_replace_editor with no path", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText("Editing file")).toBeDefined();
});

test("uses filename only from nested path", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/deep/nested/path/Card.tsx" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText("Creating Card.tsx")).toBeDefined();
});

// --- file_manager ---

test("shows 'Renaming' with old and new filename for file_manager rename", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "file_manager",
        args: { command: "rename", path: "/src/Old.tsx", new_path: "/src/New.tsx" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText("Renaming Old.tsx to New.tsx")).toBeDefined();
});

test("shows 'Renaming' without target when new_path is missing", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "file_manager",
        args: { command: "rename", path: "/src/Old.tsx" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText("Renaming Old.tsx")).toBeDefined();
});

test("shows 'Deleting' for file_manager delete command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "file_manager",
        args: { command: "delete", path: "/src/Unused.tsx" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText("Deleting Unused.tsx")).toBeDefined();
});

test("shows fallback for file_manager with no path", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "file_manager",
        args: { command: "delete" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText("Managing file")).toBeDefined();
});

// --- Unknown tool ---

test("shows raw tool name for unknown tools", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "some_unknown_tool",
        args: {},
        state: "call",
      }}
    />
  );
  expect(screen.getByText("some_unknown_tool")).toBeDefined();
});

// --- State / indicator ---

test("shows green dot when state is 'result'", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/src/App.jsx" },
        state: "result",
        result: "ok",
      }}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
});

test("shows spinner when state is 'call'", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/src/App.jsx" },
        state: "call",
      }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("shows spinner when state is 'partial-call'", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/src/App.jsx" },
        state: "partial-call",
      }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});
