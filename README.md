# Predictor
[![ci](https://github.com/svglol/predictor/workflows/ci/badge.svg)](https://github.com/svglol/predictor/actions?query=workflow:"ci")
![GitHub](https://img.shields.io/github/license/svglol/predictor-n3)
![Website](https://img.shields.io/website?url=https%3A%2F%2Fpredictor.trotman.xyz)

## Built With
- [Nuxt 3](https://github.com/nuxt/framework)
- [Drizzle](https://github.com/drizzle-team/drizzle-orm)
- [TRPC Nuxt](https://github.com/wobsoriano/trpc-nuxt)
- [AuthJS Nuxt](https://github.com/Hebilicious/authjs-nuxt)
- [NuxtLabs UI](https://github.com/nuxtlabs/ui)
- [Tailwindcss](https://github.com/tailwindlabs/tailwindcss)

## Setup

Make sure to install the dependencies:

```bash
# pnpm
pnpm i
```

Update .env values

```bash
TURSO_DB_URL=""
TURSO_DB_TOKEN=""
NEXTAUTH_SECRET=""
AUTH_ORIGIN="http://localhost:3000"

#AuthJS Discord Provider
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""

#Discord userid for admin
DISCORD_ADMIN_USER_ID=""

#Discord webhook
DISCORD_WEBHOOK=""

#Cloudinary
CLOUDINARY_FOLDER=""
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

SENDGRID_API=""
```

## Development Server

Start the development server on http://localhost:3000

```bash
pnpm run dev
```

## Production

Build the application for production:

```bash
pnpm run build
```

Locally preview production build:

```bash
pnpm run preview
```
