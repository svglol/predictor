<template>
  <div class="flex flex-col items-center space-y-2">
    <span class="text-center text-4xl font-bold text-black dark:text-white">{{
      name
    }}</span>
    <span class="text-sm font-semibold">
      <NuxtTime
        :datetime="startDate ?? ''"
        minute="numeric"
        hour="numeric"
        month="numeric"
        day="numeric"
        year="numeric"
      />
      -
      <NuxtTime
        :datetime="endDate ?? ''"
        minute="numeric"
        hour="numeric"
        month="numeric"
        day="numeric"
        year="numeric"
      />
    </span>
    <span class="font-light text-black dark:text-white">{{ description }}</span>
    <UBadge v-if="predicionsOpen" color="red">
      <div>
        <span>Predictions close {{ timeAgo }} @ </span>
        <NuxtTime
          :datetime="predictionsCloseDate ?? ''"
          minute="numeric"
          hour="numeric"
          month="numeric"
          day="numeric"
          year="numeric"
        />
      </div>
    </UBadge>
  </div>
</template>

<script setup lang="ts">
const { name, description, predictionsCloseDate, startDate, endDate } =
  definePropsRefs<{
    name?: string | null
    description?: string | null
    predictionsCloseDate?: Date | null
    startDate?: Date | null
    endDate?: Date | null
  }>()

const timeAgo = useTimeAgo(predictionsCloseDate.value ?? new Date())

const predicionsOpen = computed(() => {
  if (!predictionsCloseDate.value) return false
  return predictionsCloseDate.value > new Date()
})
</script>

<style scoped></style>
