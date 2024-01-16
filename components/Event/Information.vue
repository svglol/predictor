<template>
  <div class="mt-4 py-2">
    <editor-content :editor="editor" />
  </div>
</template>

<script setup lang="ts">
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import { useEditor, EditorContent, Extension } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import type { StarterKitOptions } from '@tiptap/starter-kit'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
const { information } = definePropsRefs<{
  information: string | null | undefined
}>()

const editor = useEditor({
  content: information.value,
  editable: false,
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
})
</script>
