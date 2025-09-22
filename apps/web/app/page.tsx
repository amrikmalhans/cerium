"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@/lib/auth-client";
import Link from "next/link";

export default function Home() {
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header/Navigation Bar - Full Width */}
      <header className="border-b border-border/30 dark:border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          {/* Logo */}
          <div className="text-xl font-bold tracking-tight">Cerium</div>
          
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Updates</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Careers</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Case studies</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </nav>
          
          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {isPending ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
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

      {/* Main Content Area - Boxed In */}
      <div className="max-w-5xl 2xl:max-w-7xl mx-auto border-x border-border/40 dark:border-border min-h-[calc(100vh-4rem)]">
        {/* Main Hero Content */}
        <main className="relative flex-1 flex items-center justify-center px-6 py-20 overflow-hidden">
          
     
          
          <div className="relative text-center max-w-4xl mx-auto space-y-8 z-10">
            {/* Hero Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight font-serif">
            Turn scattered engineering discussions into searchable knowledge
            </h1>
            
            {/* Hero Description */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed">
            Your engineering discussions are scattered across Slack and GitHub. Cerium makes them searchable in seconds, so you stop asking the same questions twice.
            </p>
            
            {/* Call to Action */}
            <div className="pt-4">
              {session ? (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-lg font-medium">
                    Go to Dashboard
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/sign-up">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-lg font-medium">
                    Get started
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
