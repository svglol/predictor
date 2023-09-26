<template>
  <div class="grid rounded-lg">
    <div class="content z-20 my-auto flex flex-col items-center space-y-2 p-4">
      <span class="text-center text-4xl font-bold text-black dark:text-white">
        {{ name }}
      </span>
      <span class="font-light text-black dark:text-white">
        {{ description }}
      </span>
      <UBadge color="green">
        <NuxtTime
          :datetime="startDate ?? ''"
          minute="numeric"
          hour="numeric"
          month="numeric"
          day="numeric"
          year="numeric" />
        -
        <NuxtTime
          :datetime="endDate ?? ''"
          minute="numeric"
          hour="numeric"
          month="numeric"
          day="numeric"
          year="numeric" />
      </UBadge>
      <UBadge v-if="predicionsOpen" color="red">
        <div>
          <span>Predictions close {{ timeAgo }} @&nbsp;</span>
          <NuxtTime
            :datetime="predictionsCloseDate ?? ''"
            minute="numeric"
            hour="numeric"
            month="numeric"
            day="numeric"
            year="numeric" />
        </div>
      </UBadge>
    </div>
    <div class="overlay z-0">
      <NuxtImg
        v-if="image"
        :src="image"
        class="-z-50 h-60 w-full rounded-lg object-cover opacity-40" />
    </div>
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
    image?: string | null
  }>()

const timeAgo = useTimeAgo(predictionsCloseDate.value ?? new Date())

const predicionsOpen = computed(() => {
  if (!predictionsCloseDate.value) return false
  return predictionsCloseDate.value > new Date()
})
</script>

<style scoped>
.content,
.overlay {
  grid-area: 1 / 1;
}
</style>
