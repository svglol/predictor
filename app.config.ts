export default defineAppConfig({
  ui: {
    primary: 'zinc',
    gray: 'zinc',
    card: {
      divide: 'divide-y divide-gray-200 dark:divide-gray-700',
      ring: 'ring-1 ring-gray-200 dark:ring-gray-700',
      header: {
        background: 'dark:bg-gray-800 bg-gray-100',
      },
      footer: {
        background: 'dark:bg-gray-800 bg-gray-100',
      },
    },
    avatar: {
      wrapper: 'ring-1 ring-gray-200 dark:ring-gray-700',
      rounded: 'object-cover',
    },
  },
})
