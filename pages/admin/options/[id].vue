<template>
  <UContainer>
    <div class="flex flex-row-reverse space-x-2 space-x-reverse">
      <UButton
        :loading="saving"
        icon="i-heroicons-pencil-square"
        :disabled="!saveEnabled"
        @click="saveOptionSet"
      >
        Save
      </UButton>
      <UButton
        :loading="saving"
        icon="i-heroicons-trash"
        @click="deleteModal = true"
      >
        Delete
      </UButton>
    </div>
    <div class="flex flex-col space-y-2">
      <UFormGroup name="title" label="Title" required>
        <UInput
          v-model="optionSet.title"
          color="primary"
          variant="outline"
          placeholder="Title"
        />
      </UFormGroup>

      <UFormGroup name="options" label="Options">
        <div />

        <div class="flex flex-col space-y-2">
          <template v-for="option in optionSet?.options" :key="option.id">
            <div>
              <UInput
                v-model="option.title"
                variant="outline"
                placeholder="Add new option"
                class="w-full"
                :ui="{ icon: { trailing: { pointer: '' } } }"
              >
                <template #trailing>
                  <UButton
                    color="gray"
                    variant="link"
                    icon="i-heroicons-trash"
                    :padded="false"
                    @click="() => deleteOption(option.id)"
                  />
                </template>
              </UInput>
            </div>
          </template>
        </div>
        <div class="mt-2 flex w-full flex-row">
          <UInput
            v-model="newOption"
            variant="outline"
            placeholder="Add new option"
            class="w-full"
            :ui="{ icon: { trailing: { pointer: '' } } }"
            @keyup.enter="addOption"
          >
            <template #trailing>
              <UButton
                v-show="newOption !== ''"
                color="gray"
                variant="link"
                icon="i-heroicons-plus"
                :padded="false"
                @click="addOption"
              />
            </template>
          </UInput>
        </div>
      </UFormGroup>
    </div>

    <DeleteModal
      v-model="deleteModal"
      text="Are you sure you want to delete this option set?"
      @delete-event="deleteOptionSet"
    />
  </UContainer>
</template>
<script setup lang="ts">
import type { Option } from "@prisma/client"

definePageMeta({
  middleware: ["admin"],
  layout: "admin",
})
const route = useRoute()
const id = route.params.id

const { $client } = useNuxtApp()
const { data: optionSet } = await $client.events.getOptionSet.useQuery(
  Number(id)
)
const saving = ref(false)
const deleteModal = ref(false)
const newOption = ref("")
const saveEnabled = ref(false)

watch(optionSet.value, () => {
  saveEnabled.value = true
})

async function saveOptionSet() {
  //TODO validation
  saving.value = true
  const mutate = await $client.events.updateOptionSet.mutate({
    id: Number(id),
    title: optionSet.value.title,
  })

  optionSet.value.options.forEach((option: Option) => {
    $client.events.updateOption.mutate({
      id: option.id,
      title: option.title,
    })
  })

  if (mutate) {
    optionSet.value.title = mutate.title
    saving.value = false
  }
}

async function deleteOptionSet() {
  deleteModal.value = false
  saving.value = true
  const mutate = await $client.events.deleteOptionSet.mutate(Number(id))
  if (mutate) {
    navigateTo("/admin/options")
  }
}

async function addOption() {
  const option = await $client.events.addOption.mutate({
    optionSetId: Number(id),
    title: newOption.value,
  })
  if (option) {
    optionSet.value.options.push(option)
    newOption.value = ""
  }
}

async function deleteOption(id: number) {
  const option = await $client.events.deleteOption.mutate(id)
  if (option)
    optionSet.value.options = removeObjectWithId(optionSet.value.options, id)
}

function removeObjectWithId(arr: [], id: number) {
  return arr.filter((obj: { id: number }) => obj.id !== id)
}
</script>
