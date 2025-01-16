<template>
  <NuxtLink
    :to="`/${event.slug}`"
    class="rounded-lg border border-gray-200 bg-gray-100 shadow hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
  >
    <div class="h relative h-[175px] w-full md:h-[175px] lg:h-[175px]">
      <NuxtImg
        v-if="event.image"
        width="1920"
        height="600"
        :alt="event.name ?? ''"
        fit="cover"
        :src="event.image"
        placeholder
        provider="cloudinary"
        class="absolute inset-0 aspect-video size-full rounded-lg object-cover"
      />
      <div
        class="relative z-10 flex h-full flex-col items-center justify-center gap-2 rounded-lg bg-black bg-opacity-50 p-4 text-center text-white hover:bg-opacity-40 md:px-4"
      >
        <h1 class="text-xl sm:text-2xl">
          {{ event.name }}
        </h1>
        <EventBadges v-if="!hideBadges" :event="event" />
        <div
          v-if="
            showPosition
              && position
              && (event.endDate ?? new Date()) <= new Date()
          "
          class="text-xl font-bold text-gray-300 sm:text-2xl"
          :class="getRankClass(position)"
        >
          <UIcon :name="getMedalIcon(position)" />
          {{ getOrdinalSuffix(position) }}
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const { event } = defineProps<{
  event: EventCard
  hideBadges?: boolean
  showPosition?: boolean
  position?: number
}>()
</script>
