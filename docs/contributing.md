## Contributing (Dev Setup)

### Install

```
pnpm install
```

### Env

TBD 

### Run

Run both services:

```
pnpm dev
```

Or separately:

```
pnpm dev:web   # Next.js on :3000
pnpm dev:api   # Fastify on :9999
pnpm dev:bot   # Slack bot (optional)
```

### Troubleshooting

- Missing commands (next/tsx): run `pnpm install` first.
- DB errors: verify `DATABASE_URL` and Postgres is up.
