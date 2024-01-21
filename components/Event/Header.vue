<template>
  <div :class="{ 'bg-gray-700 ': image }" class="grid rounded-lg">
    <div class="content z-10 my-auto flex flex-col items-center space-y-2 p-4">
      <span
        :class="{
          'text-black dark:text-white': !image,
          'text-white': image,
        }"
        class="text-center text-4xl font-bold">
        {{ name }}
      </span>
      <span
        :class="{
          'text-black dark:text-white': !image,
          'text-white': image,
        }"
        class="font-light">
        {{ description }}
      </span>
      <UBadge color="green">
        <Icon name="material-symbols:calendar-month" class="mr-1" />
        <NuxtTime
          :datetime="startDate ?? ''"
          minute="numeric"
          hour="numeric"
          month="numeric"
          day="numeric"
          year="numeric" />
        &nbsp;-&nbsp;
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
          <Icon name="material-symbols:check-box" class="mr-1" />
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
    <div
      :class="{ 'bg-black opacity-40': image }"
      class="overlay z-0 h-60 rounded-lg bg-gray-100 dark:bg-gray-800">
      <NuxtImg
        v-if="image"
        :src="image"
        :alt="name ?? ''"
        provider="cloudinary"
        fit="thumbnail"
        width="1246"
        height="240"
        :placeholder="[312, 60, 75, 100]"
        :modifiers="{ gravity: 'center' }"
        class="-z-50 h-60 w-full rounded-lg object-cover" />
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
