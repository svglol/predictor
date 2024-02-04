<template>
  <div>
    <UCard :ui="{ header: { padding: '!p-0' } }">
      <template #header>
        <div class="rounded-t-lg bg-gray-100 shadow dark:bg-gray-800">
          <div class="relative h-60">
            <NuxtImg
              v-if="user?.image"
              width="1920"
              height="1080"
              fit="cover"
              :src="user?.image"
              placeholder
              class="absolute inset-0 h-full w-full rounded-t-lg object-cover"
              style="aspect-ratio: 1920 / 1080; object-fit: cover" />
            <!-- <div
              v-if="session?.user.name === name"
              class="absolute right-0 top-0 z-20 m-2">
              <UTooltip text="Edit User">
                <UButton
                  color="primary"
                  variant="outline"
                  icon="material-symbols:edit"
                  size="2xs"
                  label="Edit" />
              </UTooltip>
            </div> -->
            <div
              class="relative z-10 flex h-full flex-col items-center justify-center gap-2 rounded-t-lg bg-black bg-opacity-50 p-4 text-center text-white backdrop-blur-lg md:px-4">
              <UAvatar
                :src="user?.image + '?size=80' ?? ''"
                size="3xl"
                :alt="user?.name ?? ''"
                class="ring-primary-500 ring-2" />
              <h1 class="text-4xl font-bold">
                {{ name }}
              </h1>
              <div class="flex flex-wrap gap-1">
                <template
                  v-for="entry in user?.entries
                    .filter(
                      entry => (entry.event.endDate ?? new Date()) <= new Date()
                    )
                    .sort((a, b) => a.rank - b.rank)"
                  :key="entry">
                  <span class="text-2xl">
                    <Icon :name="getMedalIcon(entry.rank)" />
                  </span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </template>
      <div class="flex flex-col gap-6">
        <div v-if="(user?.entries.length ?? 0) > 0" class="flex flex-col gap-2">
          <span class="text-xl font-bold text-gray-700 dark:text-gray-300">
            Entered Events
          </span>
          <div
            class="grid h-full grid-cols-1 justify-items-stretch gap-6 md:grid-cols-2 xl:grid-cols-4">
            <template v-for="event in events" :key="event.id">
              <EventCard
                :event="event"
                hide-badges
                show-position
                :position="
                  user?.entries.find(e => e.event.id === event.id)?.rank ?? 0
                " />
            </template>
          </div>
        </div>
        <div v-if="(user?.entries.length ?? 0) > 1" class="flex flex-col gap-2">
          <span class="text-xl font-bold text-gray-700 dark:text-gray-300">
            Overall Points
          </span>
          <div class="hidden w-full md:contents">
            <ClientOnly>
              <apexchart
                :key="series"
                height="250"
                width="100%"
                :options="options"
                :series="series"></apexchart>
              <template #fallback><div class="h-[250px] w-full" /></template>
            </ClientOnly>
          </div>
          <div class="contents w-full md:hidden">
            <ClientOnly>
              <apexchart
                :key="series"
                height="250"
                width="100%"
                :options="optionsMobile"
                :series="series"></apexchart>
              <template #fallback><div class="h-[250px] w-full" /></template>
            </ClientOnly>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  validate: route => {
    return /^[a-z0-9]+(?:[_-][a-z0-9]+)*$/.test(String(route.params.name))
  },
})
const { $client } = useNuxtApp()
const colorMode = useColorMode()
const { name } = useRoute().params

const { data: user } = await $client.users.getUser.useQuery(String(name))

if (!user.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

const events = computed(() => {
  return user.value?.entries.map(entry => entry.event)
})

useHead({
  title: user.value?.name ?? '',
})

defineOgImage({
  component: 'OgImageUser',
  props: {
    title: user.value?.name ?? '',
    src: user.value?.image ?? '',
  },
})

useSeoMeta({
  ogTitle: user.value?.name,
  twitterTitle: user.value?.name,
  twitterCard: 'summary_large_image',
})
// const { session } = useAuth()

const series = computed(() => {
  let cumulativeSum = 0
  return [
    {
      name: user.value?.name ?? 'No name',
      data: user.value?.entries
        .filter(entry => (entry.event.endDate ?? new Date()) <= new Date())
        .map(entry => {
          const points = getPointsForRank(entry.rank)
          cumulativeSum += points
          return cumulativeSum
        }),
    },
  ]
})

const options = computed(() => {
  return {
    chart: {
      height: 250,
      background: 'transparent',
      type: 'area',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 500,
        animateGradually: {
          enabled: true,
          delay: 50,
        },
      },
    },
    colors: ['#0ea5e9'],
    legend: {
      show: true,
      labels: {
        colors: `${colorMode.value === 'dark' ? 'white' : 'black'}`,
      },
      fontSize: '13px',
      fontFamily: 'Inter, ui-sans-serif',
      fontWeight: 400,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 4,
    },
    grid: {
      show: false,
      padding: {
        left: 80,
        right: 80,
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: `${colorMode.value === 'dark' ? 'dark' : 'light'}`,
        type: 'vertical',
        opacityFrom: 0.5,
        opacityTo: 0.1,
      },
    },
    xaxis: {
      type: 'category',
      categories: user.value?.entries
        .filter(entry => (entry.event.endDate ?? new Date()) <= new Date())
        .map(entry => entry.event.name),
      tickPlacement: 'on',
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: true,
      },
      crosshairs: {
        show: false,
        stroke: {
          dashArray: 0,
        },
        dropShadow: {
          show: false,
        },
      },
      tooltip: {
        enabled: false,
      },
      labels: {
        show: true,
        rotate: 0,
        rotateAlways: false,
        trim: true,
        style: {
          colors: `${colorMode.value === 'dark' ? 'white' : 'black'}`,
          fontSize: '13px',
          fontFamily: 'Inter, ui-sans-serif',
          fontWeight: 400,
        },
      },
    },
    yaxis: {
      labels: {
        show: true,
        style: {
          colors: `${colorMode.value === 'dark' ? 'white' : 'black'}`,
          fontSize: '13px',
          fontFamily: 'Inter, ui-sans-serif',
          fontWeight: 400,
        },
      },
    },
    tooltip: {
      enabled: true,
      shared: false,
      theme: `${colorMode.value === 'dark' ? 'dark' : 'light'}`,
      x: {
        show: true,
      },
    },
    theme: {
      mode: `${colorMode.value === 'dark' ? 'dark' : 'light'}`,
    },
  }
})

const optionsMobile = computed(() => {
  return {
    ...options.value,
    grid: {
      show: false,
      padding: {
        left: 12,
        right: 12,
      },
    },
    yaxis: {
      ...options.value.yaxis,
      labels: {
        ...options.value.yaxis.labels,
        style: {
          ...options.value.yaxis.labels.style,
          fontSize: '10px',
        },
      },
    },
    xaxis: {
      ...options.value.xaxis,
      labels: {
        ...options.value.xaxis.labels,
        rotate: -90,
        rotateAlways: true,
        style: {
          ...options.value.xaxis.labels.style,
          fontSize: '10px',
        },
      },
    },
  }
})
</script>
