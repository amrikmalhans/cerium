"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3001";

export function PageHeader() {
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="border-b border-border/30 dark:border-border">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold tracking-tight">Cerium</Link>

        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="h-8 w-24" />
          ) : user ? (
            <>
              <a
                href={FRONTEND_URL}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Go to Chat
              </a>
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/auth/sign-in"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Log in
              </Link>
              <Link href="/auth/sign-up">
                <Button variant="outline" size="sm">
                  Sign up
                </Button>
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
