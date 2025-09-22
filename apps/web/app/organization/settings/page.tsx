"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { organization, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OrganizationSettingsPage() {
  const { data: session } = useSession();
  const [activeOrg, setActiveOrg] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/auth/sign-in");
      return;
    }
    loadOrganizationData();
  }, [session]);

  const loadOrganizationData = async () => {
    try {
      // Get active organization
      const { data: activeOrgData } = await organization.getFullOrganization({});
      if (activeOrgData) {
        setActiveOrg(activeOrgData);
        setMembers(activeOrgData.members || []);
      }

      // Get invitations
      const { data: invitationsData } = await organization.listInvitations({});
      if (invitationsData) {
        setInvitations(invitationsData);
      }
    } catch (err) {
      console.error("Failed to load organization data:", err);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await organization.inviteMember({
        email: inviteEmail,
        role: inviteRole,
      });

      if (result.error) {
        setError(result.error.message || "Failed to send invitation");
      } else {
        setInviteEmail("");
        setInviteRole("member");
        loadOrganizationData(); // Refresh data
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Invite member error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberEmail: string) => {
    if (!confirm(`Are you sure you want to remove ${memberEmail} from the organization?`)) {
      return;
    }

    try {
      await organization.removeMember({
        memberIdOrEmail: memberEmail,
      });
      loadOrganizationData(); // Refresh data
    } catch (err) {
      console.error("Failed to remove member:", err);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await organization.cancelInvitation({
        invitationId,
      });
      loadOrganizationData(); // Refresh data
    } catch (err) {
      console.error("Failed to cancel invitation:", err);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!activeOrg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-foreground mb-4">No Organization Selected</h2>
          <p className="text-muted-foreground mb-6">
            You need to create or select an organization to access settings.
          </p>
          <Link href="/organization/create">
            <Button>Create Organization</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight">
            ← Back to Dashboard
          </Link>
          <div className="text-sm text-muted-foreground">
            {activeOrg.name} Settings
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Organization Info */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Organization Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-foreground mt-1">{activeOrg.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Slug</label>
                <p className="text-foreground mt-1">{activeOrg.slug}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-foreground mt-1">
                  {new Date(activeOrg.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Members</label>
                <p className="text-foreground mt-1">{members.length}</p>
              </div>
            </div>
          </div>

          {/* Invite Members */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Invite Team Members</h2>
            <form onSubmit={handleInviteMember} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
                  {error}
                </div>
              )}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <Button type="submit" disabled={loading || !inviteEmail}>
                  {loading ? "Sending..." : "Send Invite"}
                </Button>
              </div>
            </form>
          </div>

          {/* Current Members */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Current Members</h2>
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <div>
                    <p className="font-medium">{member.user.name || member.user.email}</p>
                    <p className="text-sm text-muted-foreground">{member.user.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                      {member.role}
                    </span>
                    {member.role !== "owner" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveMember(member.user.email)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Pending Invitations</h2>
              <div className="space-y-3">
                {invitations.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <div>
                      <p className="font-medium">{invite.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Invited {new Date(invite.expiresAt).toLocaleDateString()} • Expires {new Date(invite.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                        {invite.status}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelInvitation(invite.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
