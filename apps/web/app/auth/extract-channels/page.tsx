"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3001";

interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  is_archived: boolean;
}

interface ExtractionData {
  user_id: string;
  slack_bot_token: string;
  channels: SlackChannel[];
  access_token: string;
  refresh_token: string;
}

interface ExtractionStatus {
  channelId: string;
  channelName: string;
  status: "pending" | "processing" | "completed" | "error";
  message?: string;
}

export default function ExtractChannelsPage() {
  const [extractionData, setExtractionData] = useState<ExtractionData | null>(null);
  const [statuses, setStatuses] = useState<ExtractionStatus[]>([]);
  const [currentChannelIndex, setCurrentChannelIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string>("");
  const [waitingSeconds, setWaitingSeconds] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get extraction data from sessionStorage
    if (typeof window !== "undefined") {
      const storedData = sessionStorage.getItem("extraction_data");
      if (storedData) {
        try {
          const data = JSON.parse(storedData) as ExtractionData;
          setExtractionData(data);
          
          // Initialize statuses for all channels
          const initialStatuses: ExtractionStatus[] = data.channels.map(ch => ({
            channelId: ch.id,
            channelName: ch.name,
            status: "pending",
          }));
          setStatuses(initialStatuses);
          
          // Start extraction
          startExtraction(data, initialStatuses);
        } catch (err) {
          console.error("Failed to parse extraction data:", err);
          setError("Failed to load extraction data. Please try again.");
        }
      } else {
        setError("No extraction data found. Please go back and try again.");
      }
    }
  }, []);

  const startExtraction = async (data: ExtractionData, initialStatuses: ExtractionStatus[]) => {
    for (let i = 0; i < data.channels.length; i++) {
      const channel = data.channels[i];
      setCurrentChannelIndex(i);
      
      // Update status to processing
      setStatuses(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: "processing" } : s
      ));

      try {
        // Determine conversation type based on channel properties
        const conversationType = channel.is_private ? "group" : "channel";
        
        // Use channel ID directly (more reliable than name lookup)
        const response = await fetch(`${API_BASE_URL}/extract`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            service: "slack",
            user_id: data.user_id,
            slack_bot_token: data.slack_bot_token,
            conversation_name: channel.id, // Use ID directly - helper will handle it
            conversation_type: conversationType,
            limit: 1000, // Extract up to 1000 messages per channel
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Failed to extract channel ${channel.name}`);
        }

        const result = await response.json();
        const ingestedCount = result.ingested_count || 0;

        // Update status to completed
        setStatuses(prev => prev.map((s, idx) => 
          idx === i 
            ? { ...s, status: "completed", message: `Ingested ${ingestedCount} messages` }
            : s
        ));
      } catch (err: any) {
        // Update status to error
        setStatuses(prev => prev.map((s, idx) => 
          idx === i 
            ? { ...s, status: "error", message: err.message || "Failed to extract" }
            : s
        ));
      }

      // Add 1 minute delay after each channel extraction (except after the last one)
      if (i < data.channels.length - 1) {
        // Show countdown timer
        const delaySeconds = 60;
        for (let remaining = delaySeconds; remaining > 0; remaining--) {
          setWaitingSeconds(remaining);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        setWaitingSeconds(null);
      }
    }

    // All channels processed
    setIsComplete(true);
    
    // Wait a moment then redirect to frontend
    setTimeout(() => {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("extraction_data");
        const params = new URLSearchParams({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
        window.location.href = `${FRONTEND_URL}?${params.toString()}`;
      }
    }, 2000);
  };

  const completedCount = statuses.filter(s => s.status === "completed").length;
  const errorCount = statuses.filter(s => s.status === "error").length;
  const totalCount = statuses.length;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-2xl w-full space-y-8 p-8">
        <div>
          <Link href="/" className="text-center block text-4xl font-bold tracking-wide text-foreground">
            Cerium
          </Link>
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-foreground">
            {isComplete ? "Setup Complete!" : "Ingesting Your Channels"}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {isComplete 
              ? "Your knowledge base is ready. Redirecting you to Cerium..."
              : "We're extracting and indexing messages from your selected Slack channels. This may take a few moments."}
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
            {error}
          </div>
        )}

        {statuses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Progress: {completedCount + errorCount} / {totalCount} channels
              </span>
              {!isComplete && (
                <div className="flex flex-col items-end gap-1">
                  <span className="text-muted-foreground">
                    Processing channel {currentChannelIndex + 1} of {totalCount}
                  </span>
                  {waitingSeconds !== null && (
                    <span className="text-xs text-muted-foreground">
                      Waiting {waitingSeconds}s before next channel (rate limit)
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto border border-border rounded-md p-4">
              {statuses.map((status, index) => (
                <div
                  key={status.channelId}
                  className="flex items-center justify-between p-2 rounded"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-2 h-2 rounded-full flex-shrink-0">
                      {status.status === "pending" && (
                        <div className="w-2 h-2 rounded-full bg-muted" />
                      )}
                      {status.status === "processing" && (
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      )}
                      {status.status === "completed" && (
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      )}
                      {status.status === "error" && (
                        <div className="w-2 h-2 rounded-full bg-destructive" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{status.channelName}</div>
                      {status.message && (
                        <div className="text-xs text-muted-foreground">{status.message}</div>
                      )}
                    </div>
                  </div>
                  {status.status === "processing" && (
                    <div className="ml-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isComplete && (
          <div className="text-center">
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <p className="text-muted-foreground">
              Successfully ingested {completedCount} channel{completedCount !== 1 ? "s" : ""}
              {errorCount > 0 && ` (${errorCount} failed)`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

