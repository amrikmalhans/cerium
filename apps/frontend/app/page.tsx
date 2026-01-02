"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { ModelSelector } from "@/components/chat/model-selector";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  retrievedDocuments?: RetrievedDocument[];
}

interface RetrievedDocument {
  id: number;
  content: string;
  user_name?: string;
  similarity: number;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [model, setModel] = useState("gpt-4o");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string) => {
    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setIsRetrieving(true);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          model,
        }),
      });

      setIsRetrieving(false);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get response");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        retrievedDocuments: data.retrievedDocuments || [],
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      setIsRetrieving(false);
      const errorMessage: Message = {
        role: "assistant",
        content: `Error: ${error.message}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold">Cerium Chat</h1>
          <div className="flex items-center gap-4">
            <ModelSelector value={model} onChange={setModel} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={messages.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-4 min-h-full">
          {messages.length === 0 && (
            <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] text-muted-foreground">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">
                  Start a conversation
                </h2>
                <p className="text-sm">
                  Choose a model and send a message to begin chatting.
                </p>
              </div>
            </div>
          )}
          {messages.map((message, index) => (
            <div key={index} className="space-y-2">
              <ChatMessage
                role={message.role}
                content={message.content}
              />
              {message.retrievedDocuments && message.retrievedDocuments.length > 0 && (
                <div className="ml-12 mt-2 p-3 bg-muted/50 rounded-lg border border-border">
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    📚 Used {message.retrievedDocuments.length} relevant document{message.retrievedDocuments.length > 1 ? 's' : ''} from knowledge base
                  </div>
                  <div className="space-y-2">
                    {message.retrievedDocuments.slice(0, 3).map((doc, docIndex) => (
                      <div key={doc.id} className="text-xs text-muted-foreground">
                        <span className="font-medium">•</span> {doc.content.substring(0, 100)}
                        {doc.content.length > 100 ? '...' : ''}
                        {doc.user_name && (
                          <span className="ml-2 opacity-70">({doc.user_name})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {isRetrieving && (
            <div className="flex gap-4 p-4 rounded-lg bg-secondary/50">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="text-sm text-muted-foreground">
                Searching knowledge base...
              </div>
            </div>
          )}
          {isLoading && !isRetrieving && (
            <div className="flex gap-4 p-4 rounded-lg bg-secondary/50">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="text-sm text-muted-foreground">
                Generating response...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}

