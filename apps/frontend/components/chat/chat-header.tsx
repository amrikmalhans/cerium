"use client";

import { ModelSelector } from "@/components/chat/model-selector";

interface ChatHeaderProps {
  model: string;
  onModelChange: (model: string) => void;
}

export function ChatHeader({
  model,
  onModelChange,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-background">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Model:</span>
        <ModelSelector value={model} onChange={onModelChange} />
      </div>
    </div>
  );
}

