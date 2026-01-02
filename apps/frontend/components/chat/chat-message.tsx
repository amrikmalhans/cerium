"use client";

import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";

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
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
        {isUser ? (
          <User className="w-5 h-5 text-primary" />
        ) : (
          <Bot className="w-5 h-5 text-primary" />
        )}
      </div>
      <div
        className={cn(
          "flex-1 max-w-[80%] rounded-lg p-4",
          isUser
            ? "bg-primary/10 text-right"
            : "bg-secondary/50 text-left"
        )}
      >
        <div className="text-sm font-medium mb-2">
          {isUser ? "You" : "Assistant"}
        </div>
        <div className="text-sm whitespace-pre-wrap break-words">
          {content}
        </div>
      </div>
    </div>
  );
}

