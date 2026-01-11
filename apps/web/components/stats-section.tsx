const stats = [
  { value: "10x", label: "Faster answers" },
  { value: "85%", label: "Less repetitive questions" },
  { value: "3 min", label: "Average setup time" },
  { value: "99.9%", label: "Uptime SLA" },
]

export function StatsSection() {
  return (
    <section className="border-b border-border/40 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="mb-2 text-4xl font-bold text-accent md:text-5xl">{stat.value}</div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

