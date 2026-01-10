import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from '@supabase/supabase-js';

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

// Create Supabase client for auth verification
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface DocumentMatch {
  id: number;
  content: string;
  user_name?: string;
  slack_ts?: number;
  created_at: string;
  similarity: number;
}

interface RetrieveResponse {
  matches: DocumentMatch[];
  count: number;
}

async function retrieveDocuments(prompt: string): Promise<DocumentMatch[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/retrieve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        match_count: 5,
        match_threshold: 0.7,
      }),
    });

    if (!response.ok) {
      console.error("Retrieval API error:", await response.text());
      return [];
    }

    const data: RetrieveResponse = await response.json();
    return data.matches || [];
  } catch (error) {
    console.error("Error calling retrieval API:", error);
    return [];
  }
}

function buildContextFromDocuments(documents: DocumentMatch[]): string {
  if (documents.length === 0) {
    return "";
  }

  const contextParts = documents.map((doc, index) => {
    const source = doc.user_name ? ` (from ${doc.user_name})` : "";
    return `[Document ${index + 1}${source}]:\n${doc.content}`;
  });

  return `\n\nRelevant context from knowledge base:\n${contextParts.join("\n\n")}`;
}

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user's OpenAI API key from user_profiles table
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("openai_api_key")
      .eq("user_id", user.id)
      .single();

    if (profileError || !userProfile || !userProfile.openai_api_key) {
      return NextResponse.json(
        { error: "OpenAI API key not configured. Please set up your API keys in settings." },
        { status: 400 }
      );
    }

    // Create OpenAI client with user's API key
    const openai = new OpenAI({
      apiKey: userProfile.openai_api_key,
    });

    const { messages, model = "gpt-4o", conversationId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Get the last user message for retrieval
    const lastUserMessageIndex = messages
      .map((msg: any, idx: number) => ({ msg, idx }))
      .reverse()
      .find(({ msg }) => msg.role === "user")?.idx;

    let retrievedDocuments: DocumentMatch[] = [];
    let enhancedMessages = messages;

    // Only retrieve for the latest user message
    if (lastUserMessageIndex !== undefined) {
      const lastUserMessage = messages[lastUserMessageIndex];
      retrievedDocuments = await retrieveDocuments(lastUserMessage.content);
      
      if (retrievedDocuments.length > 0) {
        const context = buildContextFromDocuments(retrievedDocuments);
        
        // Enhance the last user message with context
        enhancedMessages = messages.map((msg: any, index: number) => {
          if (index === lastUserMessageIndex) {
            return {
              ...msg,
              content: `${msg.content}${context}\n\nPlease answer the question using the provided context. If the context doesn't contain relevant information, you can use your general knowledge.`,
            };
          }
          return msg;
        });
      }
    }

    const completion = await openai.chat.completions.create({
      model,
      messages: enhancedMessages,
      stream: false,
    });

    return NextResponse.json({
      message: completion.choices[0]?.message?.content || "",
      retrievedDocuments: retrievedDocuments.map((doc) => ({
        id: doc.id,
        content: doc.content,
        user_name: doc.user_name,
        similarity: doc.similarity,
      })),
    });
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get response from OpenAI" },
      { status: 500 }
    );
  }
}

