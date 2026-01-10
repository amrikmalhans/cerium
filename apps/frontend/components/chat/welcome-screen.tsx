"use client";

import { MessageSquare } from "lucide-react";

export function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <MessageSquare className="w-12 h-12 text-foreground" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold">Welcome to Cerium Chat</h1>

        {/* Features List */}
        <div className="space-y-3 text-left max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span className="text-muted-foreground">Ask coding questions</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span className="text-muted-foreground">Analyze documents</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span className="text-muted-foreground">Brainstorm ideas</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span className="text-muted-foreground">Chat with multiple AI models</span>
          </div>
        </div>
      </div>
    </div>
  );
}

