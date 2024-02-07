import { resolve } from 'node:path'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@hebilicious/authjs-nuxt',
    '@nuxt/devtools',
    'nuxt-icon',
    '@vueuse/nuxt',
    '@nuxt/ui',
    '@nuxt/image',
    '@vue-macros/nuxt',
    '@nuxtjs/google-fonts',
    'nuxt-time',
    '@nuxt/test-utils/module',
    '@nuxtjs/seo',
    'nuxt-vercel-analytics',
    'nuxt-build-cache',
  ],

  build: {
    transpile: ['trpc-nuxt'],
  },

  tailwindcss: {
    cssPath: '~/assets/global.css',
  },

  devtools: { enabled: true },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'page', mode: 'out-in' },
  },

  authJs: {
    verifyClientOnEveryRequest: true,
    guestRedirectTo: '/login',
    baseUrl: process.env.AUTH_ORIGIN,
  },
  runtimeConfig: {
    authJs: {
      secret: process.env.NEXTAUTH_SECRET, // You can generate one with `openssl rand -base64 32`
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      adminUserId: process.env.DISCORD_ADMIN_USER_ID,
    },
    public: {
      authJs: {
        baseUrl: process.env.AUTH_ORIGIN, // The base URL is used for the Origin Check in prod only
        verifyClientOnEveryRequest: true, // whether to hit the /auth/session endpoint on every client request
        guestRedirectTo: '/login',
      },
      cloudinaryFolder: process.env.CLOUDINARY_FOLDER,
    },
    discordWebhook: process.env.DISCORD_WEBHOOK,
  },
  alias: {
    cookie: resolve(__dirname, 'node_modules/cookie'),
  },
  googleFonts: {
    families: {
      Inter: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    },
  },
  experimental: {
    componentIslands: true,
  },
  image: {
    cloudinary: {
      baseURL: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`,
    },
  },
  site: {
    name: 'Memespeak Predictor',
    url: process.env.AUTH_ORIGIN,
  },
  colorMode: {
    preference: 'system',
    fallback: 'dark',
  },
  sitemap: {
    sources: ['/api/__sitemap__/urls'],
  },
})
