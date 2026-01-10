import { MessageSquare, Github, FileSpreadsheet, Mail, FolderKanban, Database } from "lucide-react"

const integrations = [
  { name: "Slack", icon: MessageSquare, description: "Channels, DMs, threads" },
  { name: "GitHub", icon: Github, description: "Issues, PRs, discussions" },
  { name: "Jira", icon: FolderKanban, description: "Tickets, epics, sprints" },
  { name: "Google Drive", icon: FileSpreadsheet, description: "Docs, sheets, slides" },
  { name: "Gmail", icon: Mail, description: "Emails, threads" },
  { name: "Notion", icon: Database, description: "Pages, databases" },
]

export function IntegrationsSection() {
  return (
    <section id="integrations" className="border-b border-border/40 bg-card/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent">Integrations</p>
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">Connects to your entire stack</h2>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="group flex flex-col items-center gap-3 rounded-lg border border-border bg-background p-6 transition-all hover:border-accent/50 hover:bg-accent/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                <integration.icon className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-accent" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold">{integration.name}</h3>
                <p className="text-xs text-muted-foreground">{integration.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

