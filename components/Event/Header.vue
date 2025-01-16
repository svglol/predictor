<template>
  <div class="rounded-t-lg bg-gray-100 shadow dark:bg-gray-800">
    <div class="relative h-60">
      <NuxtImg
        v-if="image"
        fit="cover"
        :src="image"
        placeholder
        provider="cloudinary"
        class="absolute inset-0 size-full rounded-t-lg object-cover"
        style="aspect-ratio: 1920 / 1080; object-fit: cover"
        sizes="540px sm:606px md:734px lg:990px xl:1246px 2xl:1502px"
      />
      <div
        class="relative z-10 flex h-full flex-col items-center justify-center gap-2 rounded-t-lg bg-black bg-opacity-50 p-4 text-center text-white md:px-4"
      >
        <h1 class="text-xl font-bold sm:text-4xl">
          {{ name }}
        </h1>
        <p class="font-light sm:text-xl">
          {{ description }}
        </p>
        <EventBadges
          :start-date="startDate"
          :end-date="endDate"
          :close-date="predictionsCloseDate"
        />
      </div>
      <div
        v-if="session?.user.role === 'ADMIN' && !hideEdit"
        class="absolute right-0 top-0 z-20 m-2"
      >
        <UTooltip text="Edit Event">
          <UButton
            color="primary"
            variant="outline"
            icon="material-symbols:edit"
            size="2xs"
            :to="`/admin/event/${id}`"
            label="Edit"
          />
        </UTooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { name, description, predictionsCloseDate, startDate, endDate }
  = defineProps<{
    name?: string | null
    description?: string | null
    predictionsCloseDate?: Date | null
    startDate?: Date | null
    endDate?: Date | null
    image?: string | null
    id?: number | null
    hideEdit?: boolean
  }>()

const { session } = useAuth()
</script>

<style scoped>
.content,
.overlay {
  grid-area: 1 / 1;
}
</style>
