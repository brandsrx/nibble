"use client";

import { useState, useRef } from "react";
import { Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSendText: (text: string) => void;
  onSendFiles: (files: File[]) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendText, onSendFiles, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendText(text.trim());
      setText("");
    }
  };

  const handleFileClick = () => {
    fileRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onSendFiles(files);
    }
    e.target.value = "";
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-2 border-t border-border bg-white dark:bg-[#0f0f0f]">
      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      <button
        type="button"
        onClick={handleFileClick}
        disabled={disabled}
        className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/[0.06] hover:bg-primary/[0.1] border border-primary/10 flex items-center justify-center transition-colors disabled:opacity-40"
        title="Enviar archivo"
      >
        <Paperclip className="h-4 w-4 text-primary" />
      </button>

      <div className="flex-1 relative">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          disabled={disabled}
          className="w-full h-9 px-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-40 transition-all"
        />
      </div>

      <Button
        type="submit"
        size="icon"
        disabled={!text.trim() || disabled}
        className="flex-shrink-0 w-9 h-9 rounded-xl"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
