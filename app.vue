<template>
  <div>
    <NuxtPwaManifest />
    <NuxtLoadingIndicator
      :color="false"
      class="bg-gradient-to-r from-cyan-300 via-blue-500 to-sky-600"
      :duration="1000"
    />
    <NuxtLayout
      class="bg-white font-sans text-gray-500 antialiased dark:bg-gray-900 dark:text-gray-400"
    >
      <NuxtPage />
      <UNotifications />
      <UModals />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const colorMode = useColorMode()
const runtimeConfig = useRuntimeConfig()
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk
      ? `${titleChunk} - Memespeak Predictor`
      : ' Memespeak Predictor'
  },
  htmlAttrs: {
    lang: 'en',
  },
  link: [
    {
      rel: 'icon',
      type: 'image/png',
      href: '/favicon.ico',
    },
  ],
  meta: [
    {
      name: 'theme-color',
      content: colorMode.value === 'dark' ? '#212121' : '#ffffff',
    },
    {
      name: 'background-color',
      content: colorMode.value === 'dark' ? '#212121' : '#ffffff',
    },
  ],
})

watch(
  () => colorMode.value,
  () => {
    useHead({
      meta: [
        {
          name: 'theme-color',
          content: colorMode.value === 'dark' ? '#212121' : '#ffffff',
        },
        {
          name: 'background-color',
          content: colorMode.value === 'dark' ? '#212121' : '#ffffff',
        },
      ],
    })
  },
)

useSeoMeta({
  ogSiteName: 'Memespeak Predictor',
  description: 'Memespeak Predictor',
  ogTitle: 'Memespeak Predictor',
  ogDescription: ' ',
  ogUrl: runtimeConfig.public.authJs.baseUrl + route.fullPath,
  twitterTitle: 'Memespeak Predictor',
  twitterDescription: ' ',
  twitterCard: 'summary',
})

defineOgImage({
  component: 'Default',
})
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

.layout-enter-active,
.layout-leave-active {
  transition: all 0.4s;
}

.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
