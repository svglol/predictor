<template>
  <USlideover
    v-model="isOpen"
    :transition="true"
    :overlay="false"
    side="left"
    :ui="{
      width: 'w-full max-w-full',
      base: 'mt-[4.2rem]',
      padding: 'p-4',
    }"
    class="flex md:hidden">
    <slot />
  </USlideover>
</template>

<script lang="ts" setup>
const isOpen = useState('sidebar', () => false)

const route = useRoute()
watch(
  () => route.path,
  () => {
    isOpen.value = false
  }
)
</script>
<style>
html {
  padding-right: 0 !important ;
}
</style>
