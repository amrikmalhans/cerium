"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model: string | null;
  metadata: any;
  created_at: string;
  sequence: number;
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('sequence', { ascending: true });

        if (error) throw error;
        // Merge fetched messages with any optimistic messages for this conversation
        setMessages(prev => {
          const optimisticMessages = prev.filter(msg => 
            msg.id.startsWith('temp-') && msg.conversation_id === conversationId
          );
          const realMessages = data || [];
          // Combine: real messages + optimistic messages that don't have a real counterpart yet
          const combined = [...realMessages];
          optimisticMessages.forEach(optMsg => {
            // Only keep optimistic if there's no real message with same sequence and content
            const hasReal = realMessages.some(real => 
              real.sequence === optMsg.sequence && 
              real.content === optMsg.content && 
              real.role === optMsg.role
            );
            if (!hasReal) {
              combined.push(optMsg);
            }
          });
          return combined.sort((a, b) => a.sequence - b.sequence);
        });
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Real-time subscription for new messages
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId]);

  const addMessage = async (
    role: 'user' | 'assistant',
    content: string,
    model?: string,
    metadata?: any,
    overrideConversationId?: string | null
  ) => {
    const targetConversationId = overrideConversationId ?? conversationId;
    if (!targetConversationId) throw new Error('No conversation selected');

    // Calculate sequence number - if using override conversationId, fetch current count
    let sequence = messages.length;
    if (overrideConversationId && overrideConversationId !== conversationId) {
      // Fetch current message count for the override conversation
      const { count, error: countError } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', overrideConversationId);
      if (!countError && count !== null) {
        sequence = count;
      }
    }

    // Create optimistic message for immediate UI update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}-${Math.random()}`,
      conversation_id: targetConversationId,
      role,
      content,
      model: model || null,
      metadata: metadata || null,
      created_at: new Date().toISOString(),
      sequence,
    };

    // Optimistically add message if it's for the current conversation or a new conversation
    // This ensures immediate UI update even if conversationId hasn't updated yet
    const shouldAddOptimistically = !conversationId || targetConversationId === conversationId;
    
    if (shouldAddOptimistically) {
      setMessages(prev => [...prev, optimisticMessage]);
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: targetConversationId,
        role,
        content,
        model,
        metadata,
        sequence,
      })
      .select()
      .single();

    if (error) {
      // Remove optimistic message on error if it was added
      if (shouldAddOptimistically) {
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      }
      throw error;
    }

    // Replace optimistic message with real one
    if (data && shouldAddOptimistically) {
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== optimisticMessage.id);
        return [...filtered, data];
      });
    }

    return data;
  };

  return {
    messages,
    loading,
    error,
    addMessage,
  };
}

