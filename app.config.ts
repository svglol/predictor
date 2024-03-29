export default defineAppConfig({
  ui: {
    primary: 'sky',
    gray: 'neutral',
    card: {
      divide: 'divide-y divide-gray-200 dark:divide-gray-700',
      ring: 'ring-1 ring-gray-200 dark:ring-gray-700',
      header: {
        base: 'rounded-t-lg',
        background: 'dark:bg-gray-800 bg-gray-100',
      },
      footer: {
        base: 'rounded-b-lg',
        background: 'dark:bg-gray-800 bg-gray-100',
      },
    },
    avatar: {
      wrapper: 'ring-1 !ring-gray-200 dark:!ring-gray-700',
      rounded: 'object-cover bg-gray-100 dark:bg-gray-800',
    },
    icons: {
      dynamic: true,
    },
  },
})
