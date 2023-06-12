import eslintPlugin from "vite-plugin-eslint";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@sidebase/nuxt-auth",
    '@nuxt/devtools',
    "nuxt-icon",
    "@vueuse/nuxt",
    "@nuxthq/ui",
    "@nuxt/image",
    'nuxt-headlessui'
  ],

  auth: {
    globalAppMiddleware: {
      isEnabled: true
    }
   },

  typescript: {
    shim: false,
  },

  build: {
    transpile: ["trpc-nuxt"],
  },

  vite: {
    plugins: [eslintPlugin()],
  },

  tailwindcss: {
    cssPath: "~/assets/global.css",
  },

  devtools: true,
  plugins: ["~/plugins/client.ts", "~/plugins/slicksort.ts"]
});
