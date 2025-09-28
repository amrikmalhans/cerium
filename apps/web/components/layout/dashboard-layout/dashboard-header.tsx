"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@/lib/auth-client";
import { Skeleton } from "@/components/ui/skeleton";


export function DashboardHeader() {
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="border-b border-border/30">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="text-xl font-bold tracking-tight">Cerium</div>
        </div>
        
        <div className="flex items-center space-x-4">
          {isPending ? (
            <Skeleton className="h-8 w-24" />
          ) : session ? (
            <>
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
            </>
          ) : null}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
