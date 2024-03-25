<template>
  <div>
    <div
      class="flex flex-row justify-between border-b border-gray-200 p-4 dark:border-gray-800"
    >
      <span
        class="flex flex-row items-center gap-2 text-lg font-bold text-black dark:text-white"
      >
        Send Discord Message
      </span>
    </div>
    <div class="border-b border-gray-200 p-4 dark:border-gray-800">
      <div class="flex flex-col space-y-2">
        <UFormGroup label="Message">
          <UTextarea v-model="content" autoresize />
        </UFormGroup>
        <UDivider />
        <UFormGroup label="Embed Title">
          <UInput v-model="title" />
        </UFormGroup>
        <UDivider />
        <UFormGroup label="Embed Description">
          <UTextarea v-model="description" autoresize />
        </UFormGroup>
        <UDivider />
        <UFormGroup label="Embed Image URL">
          <UInput v-model="imageUrl" />
        </UFormGroup>
        <UDivider />
        <UFormGroup label="Embed URL">
          <UInput v-model="url" />
        </UFormGroup>
      </div>
    </div>
    <!-- Content -->
    <div
      class="flex flex-row-reverse border-b border-gray-200 p-4 dark:border-gray-800"
    >
      <UButton
        icon="material-symbols:send"
        color="primary"
        class="self-end"
        @click="send"
      >
        Send Message
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin-only'],
  layout: 'admin',
  pageTransition: false,
})

const content = ref('')
const title = ref('')
const description = ref('')
const imageUrl = ref('')
const url = ref('')

async function send() {
  await useClient().webhook.sendMessage.mutate({
    content: content.value,
    title: title.value,
    description: description.value,
    imageUrl: imageUrl.value,
    url: url.value,
  })
  title.value = ''
  description.value = ''
  imageUrl.value = ''
  content.value = ''
  url.value = ''
}
</script>
