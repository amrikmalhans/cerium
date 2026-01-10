"use client";

import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-4 p-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {!isUser && (
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        )}
      <div
        className={cn(
          "rounded-lg p-4",
          isUser
            ? "bg-primary/10 text-right inline-block max-w-[80%]"
            : "bg-secondary/50 text-left flex-1 max-w-[80%]"
        )}
      >
        {!isUser && (
        <div className="text-sm font-medium mb-2">
            Assistant
        </div>
        )}
        <div className="text-sm whitespace-pre-wrap break-words">
          {content}
        </div>
      </div>
    </div>
  );
}

