"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, User, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useConversations } from "@/hooks/useConversations";
import { SettingsDialog } from "@/components/chat/settings-dialog";

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

interface SidebarProps {
  currentChatId?: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
}

export function Sidebar({ currentChatId, onNewChat, onSelectChat }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { user } = useAuth();
  const { conversations, loading: conversationsLoading } = useConversations();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = WEB_URL;
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredConversations = conversations.filter(conv =>
    (conv.title || "New Chat").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const today = new Date();
  const todayChats = filteredConversations.filter(conv => {
    if (!mounted) return false;
    const convDate = new Date(conv.updated_at);
    return convDate.toDateString() === today.toDateString();
  });

  const pastChats = filteredConversations.filter(conv => {
    if (!mounted) return false;
    const convDate = new Date(conv.updated_at);
    return convDate.toDateString() !== today.toDateString();
  });

  const formatDate = (dateString: string) => {
    if (!mounted) return "";
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="flex flex-col h-screen w-64 border-r border-border bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-semibold mb-4">Cerium Chat</h1>
        <Button
          onClick={onNewChat}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search chats"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {conversationsLoading ? (
          <div className="text-sm text-muted-foreground">Loading conversations...</div>
        ) : (
          <>
            {todayChats.length > 0 && (
              <div>
                <h2 className="text-xs font-medium text-muted-foreground uppercase mb-2">Today</h2>
                <div className="space-y-1">
                  {todayChats.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => onSelectChat(conv.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors ${
                        currentChatId === conv.id ? "bg-muted" : ""
                      }`}
                    >
                      {conv.title || "New Chat"} {mounted && `(${formatDate(conv.updated_at)})`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {pastChats.length > 0 && (
              <div>
                <h2 className="text-xs font-medium text-muted-foreground uppercase mb-2">Past 30 Days</h2>
                <div className="space-y-1">
                  {pastChats.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => onSelectChat(conv.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors ${
                        currentChatId === conv.id ? "bg-muted" : ""
                      }`}
                    >
                      {conv.title || "New Chat"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredConversations.length === 0 && !conversationsLoading && (
              <div className="text-sm text-muted-foreground text-center py-8">
                No conversations yet. Start a new chat!
              </div>
            )}
          </>
        )}
      </div>

      {/* Settings */}
      <div className="px-4 pt-3 pb-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* User Profile */}
      <div className="px-4 pt-2 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {user?.email || user?.user_metadata?.name || "User"}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 text-xs text-muted-foreground"
              onClick={handleLogout}
            >
              Log out
            </Button>
          </div>
        </div>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

