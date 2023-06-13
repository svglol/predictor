<template>
  <div>
    <div>
      Upcoming/ongoing Predictors :

      <div class="grid grid-cols-4 gap-4">
        <UCard>
          <template #header />

          Body

          <template #footer />
        </UCard>
        <UCard>
          <template #header />

          Body

          <template #footer />
        </UCard>
        <UCard>
          <template #header />

          Body

          <template #footer />
        </UCard>
        <UCard>
          <template #header />

          Body

          <template #footer />
        </UCard>
      </div>
    </div>

    <div>
      Past Predictors:
      <div class="grid grid-cols-4 gap-4">
        <UCard>
          <template #header />

          Body

          <template #footer />
        </UCard>
        <UCard>
          <template #header />

          Body

          <template #footer />
        </UCard>
        <UCard>
          <template #header />

          Body

          <template #footer />
        </UCard>
        <UCard>
          <template #header />

          Body

          <template #footer />
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "Title",
  meta: [
    {
      name: "description",
      content: "yes",
    },
  ],
  link: [
    {
      rel: "icon",
      href: "/favicon.ico",
    },
  ],
})
</script>
