<template>
  <UModal>
    <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <div class="flex flex-col space-y-2">
        <!-- Content -->
        <h2 class="text-xl">{{ text }}</h2>
        <p class="text-sm text-gray-700 dark:text-gray-300"></p>
        <UFormGroup
          :label="`To confirm type the ${placeholderText} in the box below`"
          name="validation"
          :error="error">
          <UInput v-model="input" :placeholder="placeholderText" />
        </UFormGroup>
      </div>
      <template #footer>
        <!-- Content -->
        <div class="flex flex-row-reverse">
          <UButton
            icon="i-heroicons-trash"
            color="red"
            class="self-end"
            :disabled="input !== inputMatch"
            @click="$emit('delete')">
            Delete
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
const input = ref('')
defineEmits(['delete'])

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  placeholderText: {
    type: String,
    default: '',
  },
  inputMatch: {
    type: String,
    default: '',
  },
})

const error = computed(() => {
  return input.value !== props.inputMatch
})
</script>
