<template>
  <UModal :ui="{ width: 'sm:!max-w-4xl' }">
    <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <div class="flex flex-col gap-2">
        <div class="flex flex-col space-y-2">
          <UFormGroup name="title" label="Title" required :error="validTitle">
            <UInput
              v-model="optionSetTitle"
              color="gray"
              variant="outline"
              placeholder="Title"
            />
          </UFormGroup>

          <UFormGroup
            name="options"
            label="Options"
            class="flex w-full flex-col"
          >
            <SlickList
              v-model:list="selectedOptionSet.options"
              axis="y"
              :use-drag-handle="true"
              @sort-start="() => (dragging = true)"
              @sort-end="() => (dragging = false)"
            >
              <SlickItem
                v-for="(option, i) in selectedOptionSet.options"
                :key="option.id"
                :index="i"
                class="z-50 my-2"
              >
                <UInput
                  v-model="option.title"
                  variant="outline"
                  class="self-stretch"
                  placeholder="Add new option"
                  :ui="{
                    icon: {
                      trailing: { pointer: '' },
                      leading: { pointer: '' },
                    },
                  }"
                >
                  <template #leading>
                    <DragHandle>
                      <UIcon
                        name="material-symbols:drag-indicator"
                        class="mr-4"
                      />
                    </DragHandle>
                  </template>
                  <template #trailing>
                    <UButton
                      color="gray"
                      variant="link"
                      icon="material-symbols:delete-outline"
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
              color="gray"
              placeholder="Add new option"
              :ui="{ icon: { trailing: { pointer: '' } } }"
              @keyup.enter="addOption"
            >
              <template #trailing>
                <UButton
                  v-show="newOption !== ''"
                  color="gray"
                  variant="link"
                  icon="material-symbols:add"
                  :padded="false"
                  @click="addOption"
                />
              </template>
            </UInput>
          </UFormGroup>
        </div>
      </div>
      <template #footer>
        <div class="flex flex-row-reverse">
          <UButton
            :disabled="!valid || loading"
            color="primary"
            class="self-end"
            :loading="loading"
            @click="update"
          >
            Save
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
const dragging = ref(false)
const loading = ref(false)
const { title, close } = $defineProps<{
  title: string
  close: () => void
}>()

const { selectedOptionSet } = defineModels<{
  selectedOptionSet: OptionSet
}>()

const updatedTitle = ref(selectedOptionSet.value?.title ?? '')
const newOption = ref('')
const valid = ref(true)

const optionSetTitle = computed({
  get() {
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    updatedTitle.value = title
    return title
  },
  set(value) {
    updatedTitle.value = value
  },
})

const validTitle = computedEager(() => {
  if (optionSetTitle.value.length === 0) {
    valid.value = false
    return 'Title is Required!'
  }
  valid.value = true
})

async function addOption() {
  loading.value = true
  const newOptions = newOption.value.split(',').map(item => item.trim())
  const addedOptions = await useClient().eventsAdmin.addOption.mutate(newOptions.map((option, i) => ({
    optionSetId: Number(selectedOptionSet.value?.id),
    title: option,
    order: selectedOptionSet.value.options.length + i,
  })))
  if (addedOptions)
    selectedOptionSet.value.options.push(...addedOptions)

  loading.value = false
  newOption.value = ''
}

async function deleteOption(id: number) {
  loading.value = true
  const option = await useClient().eventsAdmin.deleteOption.mutate(id)
  if (option) {
    selectedOptionSet.value.options = selectedOptionSet.value.options.filter(
      o => o.id !== id,
    )
    loading.value = false
  }
}

async function update() {
  loading.value = true
  for (const [index, option] of selectedOptionSet.value.options.entries()) {
    useClient().eventsAdmin.updateOption.mutate({
      id: option.id,
      title: option.title,
      order: index,
    })
  }
  const mutate = await useClient().eventsAdmin.updateOptionSet.mutate({
    id: Number(selectedOptionSet.value.id),
    title: updatedTitle.value,
  })
  if (mutate) {
    selectedOptionSet.value.title = mutate.title
    selectedOptionSet.value.options = mutate.options

    const toast = useToast()
    toast.add({ title: 'Optionset Saved Successfully!' })
    loading.value = false
  }
  close()
}
</script>
