"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { apiKeysSchema, type ApiKeysFormData, type SignUpFormData } from "@cerium/types";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  is_archived: boolean;
}

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3001";

export default function SetupApiKeysPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [signupData, setSignupData] = useState<SignUpFormData | null>(null);
  const [step, setStep] = useState<"api-keys" | "channels" | "verify-email">("api-keys");
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set());
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [apiKeysData, setApiKeysData] = useState<ApiKeysFormData | null>(null);
  const [verificationCode, setVerificationCode] = useState<string[]>(["", "", "", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Check if we have sign-up data from the previous page (for future use)
    const storedSignupData = sessionStorage.getItem("signup_data");
    if (storedSignupData) {
      try {
        const data = JSON.parse(storedSignupData) as SignUpFormData;
        setSignupData(data);
        // Don't clear it from storage yet - will be used later for account creation
      } catch (err) {
        console.error("Failed to parse signup data:", err);
      }
    }
  }, []);

  const form = useForm<ApiKeysFormData>({
    resolver: zodResolver(apiKeysSchema),
    defaultValues: {
      slack_bot_token: "",
      openai_api_key: "",
    },
  });

  const fetchSlackChannels = async (slackToken: string): Promise<boolean> => {
    setLoadingChannels(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/slack/channels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slack_bot_token: slackToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch Slack channels");
      }

      const data = await response.json();
      const fetchedChannels = data.channels || [];
      setChannels(fetchedChannels);
      return fetchedChannels.length > 0;
    } catch (err: any) {
      setError(err.message || "Failed to fetch Slack channels");
      console.error("Fetch channels error:", err);
      return false;
    } finally {
      setLoadingChannels(false);
    }
  };

  const onSubmit = async (values: ApiKeysFormData) => {
    setLoading(true);
    setError("");

    try {
      // If Slack token is provided, fetch channels
      if (values.slack_bot_token && values.slack_bot_token.trim() && step === "api-keys") {
        setApiKeysData(values);
        const hasChannels = await fetchSlackChannels(values.slack_bot_token);
        if (hasChannels) {
          setStep("channels");
        }
        // If no channels or error, stay on current step
        setLoading(false);
        return;
      }

      // If no Slack token, just stay on current step
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      console.error("Setup API keys error:", err);
      setLoading(false);
    }
  };

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(channelId)) {
        newSet.delete(channelId);
      } else {
        newSet.add(channelId);
      }
      return newSet;
    });
  };

  const handleChannelsSubmit = async () => {
    if (!signupData || !apiKeysData) {
      setError("Missing signup data or API keys. Please go back and try again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create the account - this will send verification email
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            name: signupData.name,
          },
          emailRedirectTo: `${window.location.origin}/auth/setup-api-keys`,
        },
      });

      if (signUpError) {
        setError(signUpError.message || "Failed to create account");
        setLoading(false);
        return;
      }

      if (!signUpData.user) {
        setError("Failed to create account. Please try again.");
        setLoading(false);
        return;
      }

      // Store signup data, API keys, and channels in sessionStorage for verification step
      const selectedChannelsArray = Array.from(selectedChannels);
      const selectedChannelsData = channels.filter(ch => selectedChannelsArray.includes(ch.id));
      
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pending_verification", JSON.stringify({
          email: signupData.email,
          apiKeys: apiKeysData,
          channels: selectedChannelsData,
        }));
      }

      // Move to verification step
      setStep("verify-email");
      setLoading(false);
      
      // Focus first input after a brief delay
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      console.error("Account creation error:", err);
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;
    
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-advance to next input
    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 8 digits are entered
    if (newCode.every(digit => digit !== "") && newCode.length === 8) {
      handleVerifyCode(newCode.join(""));
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    // Only accept if it's 8 digits
    if (/^\d{8}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setVerificationCode(digits);
      
      // Focus last input
      inputRefs.current[7]?.focus();
      
      // Auto-submit
      handleVerifyCode(pastedData);
    }
  };

  const handleVerifyCode = async (code?: string) => {
    const codeToVerify = code || verificationCode.join("");
    
    if (codeToVerify.length !== 8) {
      setError("Please enter an 8-digit verification code");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      // Get email from sessionStorage
      const pendingData = sessionStorage.getItem("pending_verification");
      if (!pendingData) {
        setError("Verification data not found. Please start over.");
        setVerifying(false);
        return;
      }

      const { email } = JSON.parse(pendingData);

      // Verify the OTP code
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: codeToVerify,
        type: "email",
      });

      if (verifyError) {
        setError(verifyError.message || "Invalid verification code");
        setVerifying(false);
        return;
      }

      if (!data.session || !data.user) {
        setError("Verification failed. Please try again.");
        setVerifying(false);
        return;
      }

      // Get the pending data
      const pendingVerification = JSON.parse(pendingData);
      const { apiKeys, channels: selectedChannelsData } = pendingVerification;

      // Save API keys to user_profiles table
      const { error: profileError } = await supabase
        .from("user_profiles")
        .upsert({
          user_id: data.user.id,
          slack_bot_token: apiKeys.slack_bot_token || null,
          openai_api_key: apiKeys.openai_api_key,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        });

      if (profileError) {
        setError(profileError.message || "Failed to save API keys");
        setVerifying(false);
        return;
      }

      // Store extraction data in sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.setItem("extraction_data", JSON.stringify({
          user_id: data.user.id,
          slack_bot_token: apiKeys.slack_bot_token,
          channels: selectedChannelsData,
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        }));
        
        // Clear pending verification data
        sessionStorage.removeItem("pending_verification");
      }

      // Redirect to extraction page
      router.push("/auth/extract-channels");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      console.error("Verification error:", err);
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setError("");

    try {
      const pendingData = sessionStorage.getItem("pending_verification");
      if (!pendingData) {
        setError("Verification data not found. Please start over.");
        setResending(false);
        return;
      }

      const { email } = JSON.parse(pendingData);

      // Resend verification email
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/setup-api-keys`,
        },
      });

      if (resendError) {
        setError(resendError.message || "Failed to resend verification code");
      } else {
      // Clear code inputs
      setVerificationCode(["", "", "", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      console.error("Resend error:", err);
    } finally {
      setResending(false);
    }
  };

  // Load pending verification data if returning to verify-email step
  useEffect(() => {
    if (step === "verify-email" && typeof window !== "undefined") {
      const pendingData = sessionStorage.getItem("pending_verification");
      if (pendingData) {
        // Focus first input
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      }
    }
  }, [step]);

  if (step === "verify-email") {
    const pendingData = typeof window !== "undefined" ? sessionStorage.getItem("pending_verification") : null;
    const email = pendingData ? JSON.parse(pendingData).email : signupData?.email || "";

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full space-y-8 p-8">
          <div>
            <Link href="/" className="text-center block text-4xl font-bold tracking-wide text-foreground">
              Cerium
            </Link>
            <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-foreground">
              Verify your email
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              We sent an 8-digit verification code to <span className="font-medium">{email}</span>
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="flex justify-center gap-2">
              {verificationCode.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(index, e)}
                  onPaste={index === 0 ? handleCodePaste : undefined}
                  className="w-12 h-12 text-center text-lg font-medium"
                  disabled={verifying}
                />
              ))}
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => handleVerifyCode()}
                disabled={verifying || verificationCode.some(d => !d)}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {verifying ? "Verifying..." : "Verify"}
              </Button>

              <Button
                variant="outline"
                onClick={handleResendCode}
                disabled={resending}
                className="w-full"
              >
                {resending ? "Sending..." : "Resend code"}
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  setStep("channels");
                  setVerificationCode(["", "", "", "", "", "", "", ""]);
                }}
                className="w-full"
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "channels") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-2xl w-full space-y-8 p-8">
          <div>
            <Link href="/" className="text-center block text-4xl font-bold tracking-wide text-foreground">
              Cerium
            </Link>
            <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-foreground">
              Select Slack channels to ingest
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Choose which channels you want to include in your knowledge base
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
              {error}
            </div>
          )}

          {loadingChannels ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading channels...</div>
            </div>
          ) : channels.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No channels found or failed to load channels.</p>
              <Button
                variant="outline"
                onClick={() => setStep("api-keys")}
              >
                Go back
              </Button>
            </div>
          ) : (
            <>
              <div className="max-h-96 overflow-y-auto border border-border rounded-md p-4 space-y-2">
                {channels.map((channel) => (
                  <label
                    key={channel.id}
                    className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedChannels.has(channel.id)}
                      onChange={() => handleChannelToggle(channel.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{channel.name}</span>
                        {channel.is_private && (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            Private
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("api-keys")}
                  disabled={loading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleChannelsSubmit}
                  disabled={loading}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {loading ? "Loading..." : "Continue"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <Link href="/" className="text-center block text-4xl font-bold tracking-wide text-foreground">
            Cerium
          </Link>
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-foreground">
            Set up your API keys
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Connect your Slack bot and OpenAI API to get started
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="openai_api_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OpenAI API Key</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="sk-..."
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Your OpenAI API key is required to use the chat features.
                      You can find it in your{" "}
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        OpenAI dashboard
                      </a>
                      .
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="slack_bot_token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slack Bot Token</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="xoxb-..."
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Your Slack bot token is optional. Add it if you want to integrate
                      with Slack. You can find it in your{" "}
                      <a
                        href="https://api.slack.com/apps"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Slack app settings
                      </a>
                      .
                    </FormDescription>
                    <div className="mt-2 p-3 bg-muted/50 rounded-md border border-border">
                      <p className="text-xs font-medium text-foreground mb-2">
                        Required Slack Bot Token Scopes:
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        <li><code className="text-xs bg-background px-1 py-0.5 rounded">channels:read</code> - Read public channels</li>
                        <li><code className="text-xs bg-background px-1 py-0.5 rounded">channels:history</code> - Read public channel messages</li>
                        <li><code className="text-xs bg-background px-1 py-0.5 rounded">groups:read</code> - Read private channels</li>
                        <li><code className="text-xs bg-background px-1 py-0.5 rounded">groups:history</code> - Read private channel messages</li>
                        <li><code className="text-xs bg-background px-1 py-0.5 rounded">im:read</code> - Read direct messages</li>
                        <li><code className="text-xs bg-background px-1 py-0.5 rounded">im:history</code> - Read DM message history</li>
                        <li><code className="text-xs bg-background px-1 py-0.5 rounded">users:read</code> - Read user information</li>
                        <li><code className="text-xs bg-background px-1 py-0.5 rounded">channels:join</code> - Join public channels</li>
                      </ul>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <Button
                type="submit"
                disabled={loading || loadingChannels}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading || loadingChannels ? "Loading..." : "Continue"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

