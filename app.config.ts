export default defineAppConfig({
  app: {
    layoutTransition: { name: "fade", mode: "out-in" },
    pageTransition: { name: "fade", mode: "out-in" },
  },
  ui: {
    primary: "amber",
    gray: "zinc",
    card: {
      divide: "divide-y divide-gray-200 dark:divide-gray-700",
      ring: "ring-1 ring-gray-200 dark:ring-gray-700",
      header: {
        background: "dark:bg-gray-800 bg-gray-100",
      },
      footer: {
        background: "dark:bg-gray-800 bg-gray-100",
      },
    },
  },
})
