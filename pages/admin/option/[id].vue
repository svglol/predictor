<template>
  <div>
    <div class="flex flex-row-reverse space-x-2 space-x-reverse">
      <UButton
        :loading="saving"
        icon="i-heroicons-pencil-square"
        :disabled="!saveEnabled || !valid"
        @click="saveOptionSet"
      >
        Save
      </UButton>
      <UButton
        :loading="saving"
        icon="i-heroicons-trash"
        :disabled="disableDelete"
        @click="deleteModal = true"
      >
        Delete
      </UButton>
    </div>
    <div class="flex flex-col space-y-2">
      <UFormGroup name="title" label="Title" required :error="validTitle">
        <UInput
          v-model="optionSetTitle"
          color="primary"
          variant="outline"
          placeholder="Title"
        />
      </UFormGroup>

      <UFormGroup
        name="options"
        label="Options"
        class="flex w-full flex-col space-y-2"
      >
        <SlickList v-model:list="options" axis="y" :use-drag-handle="true">
          <SlickItem
            v-for="(option, i) in options"
            :key="option.id"
            :index="i"
            class="my-2"
          >
            <UInput
              v-model="option.title"
              variant="outline"
              class="self-stretch"
              placeholder="Add new option"
              :ui="{
                icon: { trailing: { pointer: '' }, leading: { pointer: '' } },
              }"
            >
              <template #leading>
                <DragHandle>
                  <Icon name="heroicons:bars-3" class="mr-4" />
                </DragHandle>
              </template>
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
          </SlickItem>
        </SlickList>
        <UInput
          v-model="newOption"
          variant="outline"
          placeholder="Add new option"
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
      </UFormGroup>
    </div>

    <DeleteModal
      v-model="deleteModal"
      text="Are you sure you want to delete this option set?"
      @delete-event="deleteOptionSet"
    />
  </div>
</template>
<script setup lang="ts">
import type { Option } from '@prisma/client'

definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
  validate: async route => {
    return /^\d+$/.test(String(route.params.id))
  },
})
const route = useRoute()
const id = route.params.id

const { $client } = useNuxtApp()
const { data: optionSet } = await $client.events.getOptionSet.useQuery(
  Number(id)
)

useHead({
  title: optionSet.value?.title ?? 'New Option Set' + ' - Edit',
})

const optionSetTitle = ref(optionSet.value?.title ?? '')
const options = ref(optionSet.value?.options ?? [])
const saving = ref(false)
const deleteModal = ref(false)
const newOption = ref('')
const saveEnabled = ref(false)
const valid = ref(true)

const disableDelete = computed(() => {
  if (optionSet.value) {
    if (optionSet.value?._count.question > 0) {
      return true
    }
  }
  return false
})

watchDeep(optionSetTitle, () => {
  useHead({
    title: optionSetTitle.value ?? 'New Option Set' + ' - Edit',
  })
})

const validTitle = computedEager(() => {
  if (optionSetTitle.value.length === 0) {
    valid.value = false
    return 'Title is Required!'
  }
  valid.value = true
})

watchDeep([options, optionSetTitle, newOption], () => {
  options.value.forEach((option, i) => {
    option.order = i
  })
  saveEnabled.value = true
})

let autosave = false
watchDebounced(
  [options, optionSetTitle],
  () => {
    autosave = true
    saveOptionSet()
  },
  { debounce: 2000, maxWait: 2000, deep: true }
)

async function saveOptionSet() {
  if (valid.value) {
    saving.value = true
    const mutate = await $client.events.updateOptionSet.mutate({
      id: Number(id),
      title: optionSetTitle.value,
    })

    options.value.forEach((option: Option) => {
      $client.events.updateOption.mutate({
        id: option.id,
        title: option.title,
        order: option.order,
      })
    })

    if (newOption.value !== '') {
      addOption()
    }

    if (mutate) {
      optionSetTitle.value = mutate.title ?? ''
      saving.value = false
      const toast = useToast()
      if (!autosave) {
        toast.add({ title: 'Optionset Saved Successfully!' })
      }
      autosave = false
    }
  }
}

async function deleteOptionSet() {
  deleteModal.value = false
  saving.value = true
  const mutate = await $client.events.deleteOptionSet.mutate(Number(id))
  if (mutate) {
    navigateTo('/admin/options')
  }
}

async function addOption() {
  const option = await $client.events.addOption.mutate({
    optionSetId: Number(id),
    title: newOption.value,
    order: options.value.length,
  })
  if (option) {
    options.value.push(option)
    newOption.value = ''
  }
}

async function deleteOption(id: number) {
  const option = await $client.events.deleteOption.mutate(id)
  if (option && optionSet.value) {
    options.value = options.value.filter(option => option.id !== id)
  }
}
</script>
