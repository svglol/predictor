<template>
  <div class="flex flex-col border border-gray-200 shadow dark:border-gray-800">
    <TiptapMenuBar class="editor__header" :editor="editor" />
    <EditorContent :editor="editor" />
  </div>
</template>

<script setup lang="ts">
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import type { Extension } from '@tiptap/vue-3'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import type { StarterKitOptions } from '@tiptap/starter-kit'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'

const emit = defineEmits<{
  (e: 'update:modelValue', content: string): void
}>()

const { modelValue } = $defineModels<{
  modelValue: ModelOptions<
    string,
    { defaultValue: '', deep: true, passive: true }
  >
}>()

const editor = useEditor({
  content: modelValue,
  extensions: [
    StarterKit as Extension<StarterKitOptions, any>,
    Link,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Image.configure({
      HTMLAttributes: {
        class: 'mx-auto',
      },
    }),
    Table.configure({
      resizable: true,
    }),
    TableCell,
    TableHeader,
    TableRow,
  ],
  editorProps: {
    attributes: {
      class: 'prose dark:prose-invert m-5 focus:outline-none max-w-full',
    },
  },
  onUpdate() {
    if (editor.value)
      emit('update:modelValue', editor.value.getHTML())
  },
})
</script>
