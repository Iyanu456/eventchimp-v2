"use client";

import { useEffect, useRef } from "react";
import {
  Bold,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  RemoveFormatting,
  Underline
} from "lucide-react";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

type ToolbarAction = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your event story...",
  className
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML ?? "");
  };

  const toolbarActions: ToolbarAction[] = [
    { label: "Bold", icon: Bold, onClick: () => runCommand("bold") },
    { label: "Italic", icon: Italic, onClick: () => runCommand("italic") },
    { label: "Underline", icon: Underline, onClick: () => runCommand("underline") },
    { label: "Heading", icon: Heading2, onClick: () => runCommand("formatBlock", "<h2>") },
    { label: "Quote", icon: Quote, onClick: () => runCommand("formatBlock", "<blockquote>") },
    { label: "Bullets", icon: List, onClick: () => runCommand("insertUnorderedList") },
    { label: "Numbers", icon: ListOrdered, onClick: () => runCommand("insertOrderedList") },
    {
      label: "Link",
      icon: Link2,
      onClick: () => {
        const url = window.prompt("Paste link URL");
        if (url) {
          runCommand("createLink", url);
        }
      }
    },
    { label: "Clear", icon: RemoveFormatting, onClick: () => runCommand("removeFormat") }
  ];

  return (
    <div className={cn("overflow-hidden rounded-[16px] border border-line bg-white", className)}>
      <div className="flex flex-wrap gap-2 border-b border-line/80 bg-[#faf8fd] px-3 py-3">
        {toolbarActions.map((action) => (
          <button
            key={action.label}
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-line bg-white text-[#6d6779] transition hover:bg-[#f4effa] hover:text-ink"
            onClick={action.onClick}
            aria-label={action.label}
            title={action.label}
          >
            <action.icon className="h-4 w-4" />
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className={cn(
          "event-rich-editor min-h-[220px] px-4 py-4 text-sm leading-8 text-[#3c3646] outline-none",
          !value && "before:pointer-events-none before:text-[#9f98ac] before:content-[attr(data-placeholder)]"
        )}
        data-placeholder={placeholder}
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
      />
    </div>
  );
}
