# Predictor
[![ci](https://github.com/svglol/predictor/workflows/ci/badge.svg)](https://github.com/svglol/predictor/actions?query=workflow:"ci")
![GitHub deployments](https://img.shields.io/github/deployments/svglol/predictor-n3/production?logo=vercel&label=vercel)
![GitHub](https://img.shields.io/github/license/svglol/predictor-n3)
![Website](https://img.shields.io/website?url=https%3A%2F%2Fpredictor.trotman.xyz)

## Built With
- [Nuxt 3](https://github.com/nuxt/framework)
- [Prisma](https://github.com/prisma/prisma)
- [TRPC Nuxt](https://github.com/wobsoriano/trpc-nuxt)
- [AuthJS Nuxt](https://github.com/Hebilicious/authjs-nuxt)
- [NuxtLabs UI](https://github.com/nuxtlabs/ui)
- [Tailwindcss](https://github.com/tailwindlabs/tailwindcss)

## Setup

Make sure to install the dependencies:

```bash
# bun
bun install
```

Update .env values

```bash
DATABASE_URL=""
NEXTAUTH_SECRET=""
AUTH_ORIGIN="http://localhost:3000"

#AuthJS Discord Provider
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""

#Discord userid for admin
DISCORD_ADMIN_USER_ID=""
```

## Development Server

Start the development server on http://localhost:3000

```bash
bun run dev
```

## Production

Build the application for production:

```bash
bun run build
```

Locally preview production build:

```bash
bun run preview
```
