"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatHeader } from "@/components/chat/chat-header";
import { Sidebar } from "@/components/chat/sidebar";
import { WelcomeScreen } from "@/components/chat/welcome-screen";
import { AuthGuard } from "@/components/auth/auth-guard";
import { supabase } from "@/lib/supabase";
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";

interface RetrievedDocument {
  id: number;
  content: string;
  user_name?: string;
  similarity: number;
}

export default function ChatPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [model, setModel] = useState("gpt-4o");
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [hasStartedConversation, setHasStartedConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { conversations, createConversation, updateConversation } = useConversations();
  const { messages, loading: messagesLoading, addMessage } = useMessages(currentChatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    // Handle tokens from cross-origin redirect
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    
    if (accessToken) {
      // Remove tokens from URL
      window.history.replaceState({}, '', window.location.pathname);
      
      // Set session with both tokens
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      }).then(({ error }) => {
        if (error) {
          console.error('Failed to set session:', error);
          window.location.href = `${process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000'}/auth/sign-in`;
        }
      });
    }
  }, []);

  const handleSend = async (content: string) => {
    setIsRetrieving(true);
    setIsLoading(true);

    let conversationId = currentChatId;

    try {
      // Create conversation if none exists
    if (!conversationId) {
        setHasStartedConversation(true); // Hide welcome screen immediately
      const newConversation = await createConversation(undefined, model);
      conversationId = newConversation.id;
      setCurrentChatId(conversationId);
    }

      // Get session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      // Prepare messages for API
      const apiMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
      apiMessages.push({ role: "user" as const, content });

      // Call chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          model,
          conversationId,
        }),
      });

      setIsRetrieving(false);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get response");
      }

      const data = await response.json();
      
      // Save user message - pass conversationId to ensure it uses the newly created conversation
      await addMessage("user", content, undefined, undefined, conversationId);
      
      // Save assistant message
      await addMessage(
        "assistant",
        data.message,
        model,
        { retrievedDocuments: data.retrievedDocuments || [] },
        conversationId
      );

      // Update conversation title from first user message if title is still default
      const currentConversation = conversations.find(c => c.id === conversationId);
      if (currentConversation && (currentConversation.title === 'New Chat' || !currentConversation.title)) {
        const title = content.substring(0, 50).trim();
        if (title) {
          await updateConversation(conversationId, { title });
        }
      }
    } catch (error: any) {
      setIsRetrieving(false);
      console.error("Chat error:", error);
      // Show error message - wrap in try-catch to prevent unhandled promise rejection
      if (conversationId) {
        try {
          await addMessage("assistant", `Error: ${error.message}`, model, undefined, conversationId);
        } catch (addMessageError) {
          console.error("Failed to add error message:", addMessageError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setHasStartedConversation(false);
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    // Messages will be automatically loaded by useMessages hook
  };

  const handleTryExample = (example: string) => {
    handleSend(example);
  };

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <Sidebar
          currentChatId={currentChatId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
        {/* Header */}
        <ChatHeader
          model={model}
          onModelChange={setModel}
        />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messagesLoading && currentChatId && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading messages...</div>
            </div>
          ) : messages.length === 0 && !isLoading && !isRetrieving && !currentChatId && !hasStartedConversation ? (
            <WelcomeScreen onTryExample={handleTryExample} />
          ) : (
            <div className="max-w-3xl mx-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <ChatMessage
                    role={message.role}
                    content={message.content}
                  />
                  {message.metadata?.retrievedDocuments &&
                    message.metadata.retrievedDocuments.length > 0 && (
                      <div className="ml-12 mt-2 p-3 bg-muted/50 rounded-lg border border-border">
                        <div className="text-xs font-medium text-muted-foreground mb-2">
                          📚 Used {message.metadata.retrievedDocuments.length} relevant
                          document{message.metadata.retrievedDocuments.length > 1 ? "s" : ""}{" "}
                          from knowledge base
                        </div>
                        <div className="space-y-2">
                          {message.metadata.retrievedDocuments
                            .slice(0, 3)
                            .map((doc: RetrievedDocument) => (
                              <div
                                key={doc.id}
                                className="text-xs text-muted-foreground"
                              >
                                <span className="font-medium">•</span>{" "}
                                {doc.content.substring(0, 100)}
                                {doc.content.length > 100 ? "..." : ""}
                                {doc.user_name && (
                                  <span className="ml-2 opacity-70">
                                    ({doc.user_name})
                                  </span>
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
          )}
        </div>

        {/* Input */}
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
    </AuthGuard>
  );
}

