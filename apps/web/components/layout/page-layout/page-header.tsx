"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export function PageHeader() {
  const { user, loading } = useAuth();

  return (
    <header className="border-b border-border/30 dark:border-border">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold tracking-tight">Cerium</Link>

        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="h-8 w-24" />
          ) : user ? (
            <>
              <span className="text-sm text-muted-foreground">
                Coming soon...
              </span>
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
            </>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">
                Coming soon...
              </span>
              <Button variant="outline" size="sm" disabled>
                Coming soon...
                </Button>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
