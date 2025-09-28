"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@/lib/auth-client";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export function PageHeader() {
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="border-b border-border/30 dark:border-border">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="text-xl font-bold tracking-tight">Cerium</div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/updates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Updates</Link>
          <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
          <Link href="/careers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Careers</Link>
          <Link href="/case-studies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Case studies</Link>
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          {isPending ? (
            <Skeleton className="h-8 w-24" />
          ) : session ? (
            <>
              <Link 
                href="/dashboard" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <span className="text-sm text-muted-foreground">
                Welcome, {session.user.name || session.user.email}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
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
                <Button variant="outline" size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
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
