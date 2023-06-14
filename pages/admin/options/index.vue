<template>
  <UContainer>
    <div class="flex flex-row">
      <UButton
        icon="i-heroicons-pencil-square"
        size="sm"
        color="primary"
        variant="solid"
        label="Add new option set"
        :trailing="false"
        class="ml-auto"
        @click="addOptionSet"
      />
    </div>

    <UTable :rows="optionSets" :columns="columns" class="w-full">
      <template #actions-data="{ row }">
        <UButton
          label="View"
          color="gray"
          variant="ghost"
          icon="i-heroicons-eye"
          :to="'/admin/options/' + row.id"
        />
      </template>

      <template #options-data="{ row }">
        {{ row.options?.length ?? 0 }}
      </template>
    </UTable>
  </UContainer>
</template>
<script setup lang="ts">
definePageMeta({
  middleware: ["admin"],
  layout: "admin",
})

const columns = [
  {
    key: "id",
    label: "ID",
  },
  {
    key: "title",
    label: "Title",
  },
  { key: "options", label: "Options" },
  {
    key: "actions",
    label: "Actions",
  },
]

const { $client } = useNuxtApp()
const { data: optionSets } = await $client.events.getOptionSets.useQuery()

async function addOptionSet() {
  let optionSet = await $client.events.addOptionSet.mutate({
    title: "New option set",
  })
  if (optionSet) {
    navigateTo("/admin/options/" + optionSet.id)
  }
}
</script>
