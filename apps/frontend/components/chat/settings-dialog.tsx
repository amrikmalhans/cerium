"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const settingsSchema = z.object({
  openai_api_key: z.string().min(1, "OpenAI API key is required"),
  slack_bot_token: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showSlackToken, setShowSlackToken] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      openai_api_key: "",
      slack_bot_token: "",
    },
  });

  // Fetch current API keys when dialog opens
  useEffect(() => {
    if (open && user) {
      fetchCurrentKeys();
    } else {
      // Reset form and messages when dialog closes
      form.reset();
      setSuccessMessage(null);
      setErrorMessage(null);
      setShowOpenAIKey(false);
      setShowSlackToken(false);
    }
  }, [open, user]);

  const fetchCurrentKeys = async () => {
    if (!user) return;

    setFetching(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("openai_api_key, slack_bot_token")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found" error, which is okay for new users
        console.error("Error fetching API keys:", error);
        setErrorMessage("Failed to load current settings");
      } else if (data) {
        form.reset({
          openai_api_key: data.openai_api_key || "",
          slack_bot_token: data.slack_bot_token || "",
        });
      }
    } catch (err) {
      console.error("Error fetching API keys:", err);
      setErrorMessage("Failed to load current settings");
    } finally {
      setFetching(false);
    }
  };

  const onSubmit = async (values: SettingsFormValues) => {
    if (!user) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase
        .from("user_profiles")
        .upsert(
          {
            user_id: user.id,
            openai_api_key: values.openai_api_key,
            slack_bot_token: values.slack_bot_token || null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        );

      if (error) {
        throw error;
      }

      setSuccessMessage("Settings saved successfully!");
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (err: any) {
      console.error("Error saving settings:", err);
      setErrorMessage(err.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your API keys. Your OpenAI API key is required for chat
            functionality.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {errorMessage && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 text-sm">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-md bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 px-4 py-3 text-sm">
                {successMessage}
              </div>
            )}

            <FormField
              control={form.control}
              name="openai_api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OpenAI API Key</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showOpenAIKey ? "text" : "password"}
                        placeholder="sk-..."
                        disabled={fetching || loading}
                        {...field}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        disabled={fetching || loading}
                      >
                        {showOpenAIKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slack_bot_token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slack Bot Token (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showSlackToken ? "text" : "password"}
                        placeholder="xoxb-..."
                        disabled={fetching || loading}
                        {...field}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSlackToken(!showSlackToken)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        disabled={fetching || loading}
                      >
                        {showSlackToken ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || fetching}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {fetching ? "Loading..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

