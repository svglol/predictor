import eslintPlugin from "vite-plugin-eslint"
import { resolve } from "node:path"
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@hebilicious/authjs-nuxt",
    "@nuxt/devtools",
    "nuxt-icon",
    "@vueuse/nuxt",
    "@nuxthq/ui",
    "@nuxt/image",
    "nuxt-headlessui",
    "@vue-macros/nuxt",
    "@nuxtjs/google-fonts",
    "nuxt-time",
  ],

  typescript: {
    shim: false,
  },

  build: {
    transpile: ["trpc-nuxt"],
  },

  vite: {
    plugins: [],
  },

  tailwindcss: {
    cssPath: "~/assets/global.css",
  },

  devtools: true,
  plugins: [
    "~/plugins/maska.ts",
    "~/plugins/client.ts",
    "~/plugins/slicksort.ts",
    "~/plugins/emitter.ts",
  ],

  app: {
    pageTransition: { name: "page", mode: "out-in" },
  },

  authJs: {
    verifyClientOnEveryRequest: true,
    guestRedirectTo: "/login",
    baseUrl: process.env.AUTH_ORIGIN,
  },
  runtimeConfig: {
    authJs: {
      secret: process.env.NEXTAUTH_SECRET, // You can generate one with `openssl rand -base64 32`
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    },
    public: {
      authJs: {
        baseUrl: process.env.AUTH_ORIGIN, // The base URL is used for the Origin Check in prod only
        verifyClientOnEveryRequest: true, // whether to hit the /auth/session endpoint on every client request
        guestRedirectTo: "/login",
      },
      discord: {
        adminUserId: process.env.DISCORD_ADMIN_USER_ID,
      },
    },
  },
  alias: {
    cookie: resolve(__dirname, "node_modules/cookie"),
    jose: resolve(__dirname, "node_modules/jose/dist/browser/index.js"),
    "@panva/hkdf": resolve(
      __dirname,
      "node_modules/@panva/hkdf/dist/web/index.js",
    ),
  },
  googleFonts: {
    families: {
      Inter: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    },
  },
})
