"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { organization } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CreateOrganizationPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    const generatedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await organization.create({
        name,
        slug,
      });

      if (result.error) {
        setError(result.error.message || "Failed to create organization");
      } else {
        // Set as active organization and redirect to dashboard
        await organization.setActive({
          organizationId: result.data.id,
        });
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Create organization error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
            Create Your Organization
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Set up your engineering team&apos;s knowledge base
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Organization Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="relative block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Acme Engineering"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                The name of your engineering team or company
              </p>
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-foreground mb-2">
                Organization Slug
              </label>
              <input
                id="slug"
                name="slug"
                type="text"
                required
                className="relative block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="acme-engineering"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Used in URLs and must be unique. Only lowercase letters, numbers, and hyphens.
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <Link href="/dashboard" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full"
              >
                Skip for now
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading || !name || !slug}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Organization"}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            You can create multiple organizations and switch between them later.
          </p>
        </div>
      </div>
    </div>
  );
}
