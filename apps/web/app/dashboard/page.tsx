"use client";

import { useSession, signOut, organization } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
// @ts-expect-error - ignore type error
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Organization } from "@cerium/types";

// Better Auth organization response type
interface BetterAuthOrganization extends Organization {
  members?: Array<{
    id: string;
    organizationId: string;
    role: string;
    createdAt: Date;
    userId: string;
    user: {
      email: string;
      name: string;
      image?: string;
    };
  }>;
  invitations?: Array<{
    id: string;
    email: string;
    role: string;
    status: string;
  }>;
}

// Dashboard state types
interface DashboardState {
  organizations: Organization[];
  activeOrg: BetterAuthOrganization | null;
  loadingOrgs: boolean;
  error: string | null;
  switchingOrg: boolean;
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const [state, setState] = useState<DashboardState>({
    organizations: [],
    activeOrg: null,
    loadingOrgs: true,
    error: null,
    switchingOrg: false,
  });
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/sign-in");
    } else if (session) {
      loadOrganizations();
    }
  }, [session, isPending, router]);

  const loadOrganizations = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loadingOrgs: true, error: null }));
      
      // Load user's organizations
      const { data: orgsData, error: orgsError } = await organization.list({});
      
      if (orgsError) {
        throw new Error(orgsError.message || "Failed to load organizations");
      }
      
      const organizations = (orgsData || []) as Organization[];
      
      // Try to get active organization with full details
      let activeOrg: BetterAuthOrganization | null = null;
      try {
        const { data: activeOrgData, error: activeOrgError } = await organization.getFullOrganization({});
        if (!activeOrgError && activeOrgData) {
          activeOrg = activeOrgData as BetterAuthOrganization;
        }
      } catch {
        // No active organization set - this is okay
        console.log("No active organization");
      }
      
      setState(prev => ({
        ...prev,
        organizations,
        activeOrg,
        loadingOrgs: false,
        error: null,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load organizations";
      console.error("Failed to load organizations:", err);
      setState(prev => ({
        ...prev,
        loadingOrgs: false,
        error: errorMessage,
      }));
    }
  };

  const handleSwitchOrganization = async (orgId: string): Promise<void> => {
    if (!orgId || state.switchingOrg) return;
    
    try {
      setState(prev => ({ ...prev, switchingOrg: true, error: null }));
      
      const { error } = await organization.setActive({ organizationId: orgId });
      
      if (error) {
        throw new Error(error.message || "Failed to switch organization");
      }
      
      // Refresh data after switching
      await loadOrganizations();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to switch organization";
      console.error("Failed to switch organization:", err);
      setState(prev => ({
        ...prev,
        error: errorMessage,
        switchingOrg: false,
      }));
    } finally {
      setState(prev => ({ ...prev, switchingOrg: false }));
    }
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut();
      router.push("/");
    } catch (err) {
      console.error("Failed to sign out:", err);
      // Force redirect anyway
      router.push("/");
    }
  };

  if (isPending || state.loadingOrgs) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {isPending ? "Authenticating..." : "Loading organizations..."}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">{state.error}</p>
          <Button onClick={loadOrganizations}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <div className="text-xl font-bold tracking-tight">Cerium</div>
            {state.activeOrg && (
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">•</span>
                <span className="text-lg font-medium">{state.activeOrg.name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {state.organizations.length > 1 && (
              <select
                onChange={(e) => handleSwitchOrganization(e.target.value)}
                value={state.activeOrg?.id || ""}
                disabled={state.switchingOrg}
                className={`text-sm border border-input bg-background px-2 py-1 rounded ${
                  state.switchingOrg ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="">
                  {state.switchingOrg ? "Switching..." : "Switch Organization"}
                </option>
                {state.organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            )}
            <span className="text-sm text-muted-foreground">
              {session.user.name || session.user.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {!state.activeOrg && state.organizations.length === 0 ? (
            // No organizations - show setup
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">
                Welcome to Cerium
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Get started by creating your organization&apos;s knowledge base. Cerium helps engineering teams centralize and search their operational knowledge.
              </p>
              <Link href="/organization/create">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Create Your Organization
                </Button>
              </Link>
            </div>
          ) : !state.activeOrg && state.organizations.length > 0 ? (
            // Has organizations but none active
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">
                Select an Organization
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Choose an organization to continue to your dashboard.
              </p>
              <div className="space-y-3 max-w-md mx-auto">
                {state.organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => handleSwitchOrganization(org.id)}
                    disabled={state.switchingOrg}
                    className={`w-full p-4 text-left border border-border rounded-lg transition-colors ${
                      state.switchingOrg 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="font-medium">{org.name}</div>
                    <div className="text-sm text-muted-foreground">{org.slug}</div>
                  </button>
                ))}
              </div>
              <div className="mt-6">
                <Link href="/organization/create">
                  <Button variant="outline">Create New Organization</Button>
                </Link>
              </div>
            </div>
          ) : (
            // Has active organization - show dashboard
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                    {state.activeOrg?.name} Dashboard
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Your engineering team&apos;s knowledge base
                  </p>
                </div>
                <Link href="/organization/settings">
                  <Button variant="outline">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </Button>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="font-semibold">Team Members</h3>
                  </div>
                  <p className="text-2xl font-bold">{state.activeOrg?.members?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Active members</p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="font-semibold">Knowledge Base</h3>
                  </div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Documents indexed</p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 className="font-semibold">Searches</h3>
                  </div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">This month</p>
                </div>
              </div>

              {/* Getting Started */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-white font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Invite your team</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Add your engineering team members to start building your knowledge base together.
                      </p>
                      <Link href="/organization/settings">
                        <Button size="sm">Invite Members</Button>
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-muted-foreground font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1 text-muted-foreground">Connect your tools</h3>
                      <p className="text-sm text-muted-foreground">
                        Integrate with Slack, GitHub, Jira, and other tools to automatically index your team&apos;s knowledge.
                      </p>
                      <Button size="sm" variant="outline" disabled className="mt-2">
                        Coming Soon
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-muted-foreground font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1 text-muted-foreground">Start searching</h3>
                      <p className="text-sm text-muted-foreground">
                        Use natural language to find answers, runbooks, and decisions across all your sources.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
