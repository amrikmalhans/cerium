import { Search, Zap, Lock, Brain, Clock, Users } from "lucide-react"

const features = [
  {
    icon: Search,
    title: "Semantic Search",
    description:
      "Find information based on meaning, not just keywords. Ask natural questions and get relevant answers.",
  },
  {
    icon: Brain,
    title: "Context-Aware AI",
    description:
      "Cerium understands relationships between your data sources, connecting discussions to tickets to code.",
  },
  {
    icon: Zap,
    title: "Instant Answers",
    description: "Get responses in seconds, not hours. No more searching through endless Slack threads.",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "SOC 2 compliant with end-to-end encryption. Your data never leaves your control.",
  },
  {
    icon: Clock,
    title: "Real-time Sync",
    description: "Indexes new content as it's created. Always up-to-date with your latest discussions.",
  },
  {
    icon: Users,
    title: "Permission-Aware",
    description: "Respects your existing access controls. Users only see what they're authorized to see.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="border-b border-border/40 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent">Features</p>
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need to unlock your knowledge
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Stop asking the same questions twice. Cerium turns your scattered discussions into a searchable knowledge
            base.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-accent/50"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary transition-colors group-hover:bg-accent/10">
                <feature.icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-accent" />
              </div>
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

