<template>
  <UModal>
    <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <div class="flex flex-col space-y-2">
        <h2 class="text-xl">{{ text }}</h2>
        <p class="text-sm text-gray-700 dark:text-gray-300"></p>
        <UFormGroup
          :label="`To confirm type '${inputMatch}' in the box below`"
          name="validation"
          :error="error">
          <UInput v-model="input" :placeholder="placeholderText" color="gray" />
        </UFormGroup>
      </div>
      <template #footer>
        <div class="flex flex-row-reverse">
          <UButton
            icon="material-symbols:delete-outline"
            color="red"
            class="self-end"
            :disabled="input !== inputMatch"
            @click="deleteFn">
            Delete
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  text: string
  inputMatch: string
  placeholderText: string
  deleteFn: () => Promise<void> | void
}>()
const input = ref('')

const error = computed(() => {
  return input.value !== props.inputMatch
})
</script>
