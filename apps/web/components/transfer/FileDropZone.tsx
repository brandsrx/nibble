"use client";

import { useState, useCallback, useRef } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function FileDropZone({ onFilesSelected, disabled }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [onFilesSelected, disabled]
  );

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
    e.target.value = "";
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={cn(
        "relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all",
        isDragging
          ? "border-primary bg-primary/[0.03] scale-[1.02]"
          : "border-border hover:border-primary/50 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/[0.03] border border-primary/10 flex items-center justify-center">
          <Upload className="h-5 w-5 text-primary/60" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground/80">
            {isDragging ? "Suelta los archivos aquí" : "Arrastra archivos aquí"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            o haz clic para seleccionar
          </p>
        </div>
      </div>
    </div>
  );
}
