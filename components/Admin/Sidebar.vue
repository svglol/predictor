<template>
  <USlideover
    v-model="isOpen"
    :overlay="false"
    side="left"
    :ui="{
      width: 'max-w-full',
      transition: { enter: 'duration-0', leave: 'duration-0' },
    }"
    class="flex md:hidden">
    <Header />
    <div class="p-4">
      <slot />
    </div>
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
