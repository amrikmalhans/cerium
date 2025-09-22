"use client";

import { useState, useEffect } from "react";
// @ts-expect-error - ignore type error
import { useRouter } from "next/navigation";
import { organization, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    invitationId: string;
  }>;
}

export default function AcceptInvitationPage({ params }: PageProps) {
  const { data: session } = useSession();
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [invitationId, setInvitationId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    async function initializeParams() {
      const resolvedParams = await params;
      setInvitationId(resolvedParams.invitationId);
    }
    initializeParams();
  }, [params]);

  useEffect(() => {
    if (invitationId) {
      loadInvitation();
    }
  }, [invitationId]);

  const loadInvitation = async () => {
    try {
      const { data, error } = await organization.getInvitation({
        query: { id: invitationId },
      });

      if (error) {
        setError(error.message || "Invitation not found or expired");
      } else if (data) {
        setInvitation(data);
      }
    } catch (err) {
      setError("Failed to load invitation");
      console.error("Load invitation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!session) {
      // Redirect to sign in with return URL
      router.push(`/auth/sign-in?returnTo=/accept-invitation/${invitationId}`);
      return;
    }

    setActionLoading(true);
    setError("");

    try {
      const result = await organization.acceptInvitation({
        invitationId: invitationId,
      });

      if (result.error) {
        setError(result.error.message || "Failed to accept invitation");
      } else {
        setSuccess(true);
        // Set the organization as active and redirect to dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Accept invitation error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectInvitation = async () => {
    if (!session) {
      router.push(`/auth/sign-in?returnTo=/accept-invitation/${invitationId}`);
      return;
    }

    if (!confirm("Are you sure you want to reject this invitation?")) {
      return;
    }

    setActionLoading(true);
    setError("");

    try {
      const result = await organization.rejectInvitation({
        invitationId: invitationId,
      });

      if (result.error) {
        setError(result.error.message || "Failed to reject invitation");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Reject invitation error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-foreground mb-4">Invalid Invitation</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Success!</h2>
          <p className="text-muted-foreground mb-6">
            You have successfully joined {invitation?.organization.name}. Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Organization Invitation
          </h2>
          <p className="mt-2 text-muted-foreground">
            You&apos;ve been invited to join an organization
          </p>
        </div>

        {invitation && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                {invitation.organization.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Invited as: <span className="font-medium text-primary">{invitation.role}</span>
              </p>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Invited by:</span>
                <span className="text-foreground">{invitation.inviter?.user?.name || invitation.inviter?.user?.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expires:</span>
                <span className="text-foreground">{new Date(invitation.expiresAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}

        {!session && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-800 mb-3">
              You need to sign in to accept this invitation
            </p>
            <Link href={`/auth/sign-in?returnTo=/accept-invitation/${invitationId}`}>
              <Button className="w-full">Sign In to Continue</Button>
            </Link>
          </div>
        )}

        {session && (
          <>
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex space-x-4">
              <Button
                onClick={handleRejectInvitation}
                variant="outline"
                disabled={actionLoading}
                className="flex-1"
              >
                {actionLoading ? "Processing..." : "Decline"}
              </Button>
              <Button
                onClick={handleAcceptInvitation}
                disabled={actionLoading}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {actionLoading ? "Joining..." : "Accept & Join"}
              </Button>
            </div>
          </>
        )}

        <div className="text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
