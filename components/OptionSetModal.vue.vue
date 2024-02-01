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
              placeholder="Title" />
          </UFormGroup>

          <UFormGroup
            name="options"
            label="Options"
            class="flex w-full flex-col space-y-2">
            <SlickList
              v-model:list="options"
              axis="y"
              :use-drag-handle="true"
              @sort-start="() => (dragging = true)"
              @sort-end="() => (dragging = false)">
              <SlickItem
                v-for="(option, i) in options"
                :key="option.id"
                :index="i"
                class="z-50 my-2">
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
                  }">
                  <template #leading>
                    <DragHandle>
                      <Icon name="heroicons:bars-3" class="mr-4" />
                    </DragHandle>
                  </template>
                  <template #trailing>
                    <UButton
                      color="gray"
                      variant="link"
                      icon="material-symbols:delete-outline"
                      :padded="false"
                      @click="() => deleteOption(option.id)" />
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
              @keyup.enter="addOption">
              <template #trailing>
                <UButton
                  v-show="newOption !== ''"
                  color="gray"
                  variant="link"
                  icon="material-symbols:add"
                  :padded="false"
                  @click="addOption" />
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
            @click="update">
            Save
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
const dragging = ref(false)
const emit = defineEmits(['update', 'addoption', 'deleteoption'])
const { selectedOptionSet, loading } = $defineProps<{
  selectedOptionSet: OptionSet | null
  loading: boolean
}>()

const optionSetTitle = ref(selectedOptionSet?.title ?? '')
const options = ref(selectedOptionSet?.options ?? [])
const newOption = ref('')
const valid = ref(true)

watchDeep(
  () => selectedOptionSet,
  () => {
    if (!dragging.value) {
      optionSetTitle.value = selectedOptionSet?.title ?? ''
      options.value = selectedOptionSet?.options ?? []
      newOption.value = ''
    }
  }
)

const validTitle = computedEager(() => {
  if (optionSetTitle.value.length === 0) {
    valid.value = false
    return 'Title is Required!'
  }
  valid.value = true
})

async function addOption() {
  emit('addoption', {
    optionSetId: Number(selectedOptionSet?.id),
    title: newOption.value,
    order: options.value.length,
  })
  newOption.value = ''
}

async function deleteOption(id: number) {
  emit('deleteoption', id)
}

function update() {
  options.value.forEach((option, i) => {
    option.order = i
  })
  if (newOption.value !== '') {
    addOption()
  }
  if (valid.value) {
    emit('update', { title: optionSetTitle.value, options: options.value })
  }
}
</script>
