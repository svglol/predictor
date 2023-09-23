<template>
  <UModal>
    <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <!-- Content -->
      <h2>{{ text }}</h2>

      <template #footer>
        <!-- Content -->
        <div class="flex flex-row-reverse">
          <UButton
            icon="i-heroicons-trash"
            color="red"
            class="self-end"
            @click="$emit('deleteEvent')">
            Delete
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
defineEmits(['deleteEvent'])

defineProps({
  text: {
    type: String,
    default: '',
  },
})
</script>
