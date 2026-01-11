const steps = [
  {
    number: "01",
    title: "Connect your tools",
    description: "One-click OAuth integrations with Slack, GitHub, Jira, GSuite, and more. No complex setup required.",
  },
  {
    number: "02",
    title: "Cerium indexes everything",
    description: "Our AI processes and understands your content, building connections between related information.",
  },
  {
    number: "03",
    title: "Ask any question",
    description: "Natural language queries return precise, sourced answers with links to original content.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-b border-border/40 bg-card/30 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent">How It Works</p>
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">Up and running in minutes</h2>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="relative">
            <div className="absolute left-8 top-0 hidden h-full w-px bg-border md:block" />

            <div className="space-y-12 md:space-y-16">
              {steps.map((step, index) => (
                <div key={step.number} className="relative flex gap-6 md:gap-12">
                  <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-border bg-background text-2xl font-bold text-accent">
                    {step.number}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

