"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { PageLayout } from "@/components/layout";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <PageLayout>
      <div className="max-w-5xl 2xl:max-w-7xl mx-auto border-x border-border/40 dark:border-border min-h-[calc(100vh-4rem)]">
        <main className="relative flex-1 flex items-center justify-center px-6 py-20 overflow-hidden">
          <div className="relative text-center max-w-4xl mx-auto space-y-8 z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight">
            Turn scattered engineering discussions into searchable knowledge
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed">
            Your engineering discussions are scattered across Slack and GitHub. Cerium makes them searchable in seconds, so you stop asking the same questions twice.
            </p>
            
            <div>
              {session ? (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-lg font-medium">
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/sign-up">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-lg font-medium">
                    Get started
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>
    </PageLayout>
  );
}
