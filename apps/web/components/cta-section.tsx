"use client";

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 text-center md:p-12">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Ready to unlock your team&apos;s knowledge?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
            Join hundreds of teams using Cerium to find answers faster and stop reinventing the wheel.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/auth/sign-up">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 bg-transparent">
              Watch Demo
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            No credit card required · 14-day free trial · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}

