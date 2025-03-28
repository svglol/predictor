// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@hebilicious/authjs-nuxt',
    '@nuxt/devtools',
    '@vueuse/nuxt',
    '@nuxt/ui',
    '@nuxt/image',
    '@vue-macros/nuxt',
    'nuxt-time',
    '@nuxt/test-utils/module',
    '@nuxtjs/seo',
    '@vite-pwa/nuxt',
    '@nuxt/fonts',
    '@nuxt/eslint',
  ],

  eslint: {
    config: {
      standalone: false,
    },
  },

  build: {
    transpile: ['trpc-nuxt'],
  },

  tailwindcss: {
    cssPath: '~/assets/global.css',
  },

  devtools: { enabled: true },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  sourcemap: {
    server: false,
  },

  authJs: {
    verifyClientOnEveryRequest: true,
    guestRedirectTo: '/auth/sign-in',
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
        guestRedirectTo: '/auth/sign-in',
      },
      cloudinaryFolder: process.env.CLOUDINARY_FOLDER,
    },
    discordWebhook: process.env.DISCORD_WEBHOOK,
  },

  alias: {
    cookie: 'cookie',
  },

  experimental: {
    payloadExtraction: true,
    componentIslands: true,
    appManifest: true,
  },

  image: {
    domains: ['cdn.discordapp.com', 'res.cloudinary.com'],
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
    cacheMaxAgeSeconds: 3600,
  },
  ogImage: {
    enabled: process.env.NODE_ENV === 'production',
    fonts: ['Exo:400', 'Exo:700'],
    defaults: {
      cacheMaxAgeSeconds: 60 * 60 * 24 * 7 * 1000, // 7 days
    },
    googleFontMirror: true,
  },

  nitro: {
    storage: {
      cache: {
        driver: 'cloudflare-kv-binding',
        binding: 'CACHE',
      },
    },
  },

  pwa: {
    strategies: 'generateSW',
    registerType: 'autoUpdate',
    manifest: {
      name: 'Memespeak Predictor',
      short_name: 'Memespeak Predictor',
      theme_color: '#212121',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512-maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
      // you don't need to include this: only for testing purposes
      // if enabling periodic sync for update use 1 hour or so (periodicSyncForUpdates: 3600)
      periodicSyncForUpdates: 20,
    },
    devOptions: {
      enabled: false,
      suppressWarnings: true,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  },

  compatibilityDate: '2025-01-16',
})
