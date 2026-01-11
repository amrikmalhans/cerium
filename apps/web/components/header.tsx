"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

export function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">Cerium</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            How it Works
          </Link>
          <Link href="#integrations" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Integrations
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-8 w-24" />
          ) : user ? (
            <span className="text-sm text-muted-foreground">
              Coming soon...
            </span>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" disabled>
                Coming soon...
              </Button>
              <Button size="sm" disabled>
                Coming soon...
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

