"use client";

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/40">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,200,150,0.08),transparent_50%)]" />

      <div className="container relative mx-auto px-4 py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            RAG-powered knowledge for your entire business
          </div>

          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Your company&apos;s knowledge, <span className="text-accent">instantly searchable</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            Cerium connects to Slack, GitHub, Jira, GSuite and more. Ask any question about your business and get
            accurate, context-aware answers in seconds.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2" disabled>
              Coming soon...
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-16 rounded-lg border border-border bg-card/50 p-4 shadow-2xl md:p-6">
            <div className="rounded-md border border-border bg-background p-4">
              <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <span>Ask Cerium anything...</span>
              </div>
              <p className="text-left text-foreground">
                &quot;What was the decision on the authentication refactor discussed last week?&quot;
              </p>
            </div>
            <div className="mt-4 rounded-md border border-accent/20 bg-accent/5 p-4">
              <p className="text-left text-sm text-muted-foreground">
                <span className="font-semibold text-accent">Cerium:</span> Based on the #engineering Slack discussion
                from Jan 3rd and the related GitHub PR #1247, the team decided to migrate to OAuth 2.0 with PKCE. Sarah
                mentioned in her comment that this aligns with the security requirements in JIRA ticket SEC-89...
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

