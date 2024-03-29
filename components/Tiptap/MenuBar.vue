<template>
  <div
    class="flex flex-wrap gap-1 border-b border-gray-300 bg-gray-200 p-2 dark:border-gray-800 dark:bg-gray-900"
  >
    <template v-for="(item, index) in items" :key="index">
      <div
        v-if="item.type === 'divider'"
        :key="`divider${index}`"
        class="w-px bg-gray-300 dark:bg-gray-700"
      />
      <TiptapMenuItem v-else v-bind="item" />
    </template>
    <UDropdown :items="tableItems" :popper="{ placement: 'bottom-start' }">
      <UButton
        color="primary"
        variant="ghost"
        title="Table"
        trailing-icon="i-heroicons-chevron-down-20-solid"
      >
        <UIcon name="ri:table-2" />
      </UButton>
    </UDropdown>
  </div>
</template>

<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'
import type { UploadApiResponse } from 'cloudinary'

const { editor } = definePropsRefs<{
  editor: Editor | undefined
}>()

const tableItems = computed(() => {
  return [
    [
      {
        label: 'Insert Table',
        click: () => {
          if (editor.value) {
            editor.value
              .chain()
              .focus()
              .insertTable({ rows: 2, cols: 2, withHeaderRow: true })
              .run()
          }
        },
        disabled: false,
      },
      {
        label: 'Delete Table',
        click: () => {
          if (editor.value)
            editor.value.chain().focus().deleteTable().run()
        },
        disabled: !editor.value?.can().deleteTable(),
      },
      {
        label: 'Add Column Before',
        click: () => {
          if (editor.value)
            editor.value.chain().focus().addColumnBefore().run()
        },
        disabled: !editor.value?.can().addColumnBefore(),
      },
      {
        label: 'Add Column After',
        click: () => {
          if (editor.value)
            editor.value.chain().focus().addColumnAfter().run()
        },
        disabled: !editor.value?.can().addColumnAfter(),
      },
      {
        label: 'Delete Column',
        click: () => {
          if (editor.value)
            editor.value.chain().focus().deleteColumn().run()
        },
        disabled: !editor.value?.can().deleteColumn(),
      },
      {
        label: 'Add Row Before',
        click: () => {
          if (editor.value)
            editor.value.chain().focus().addRowBefore().run()
        },
        disabled: !editor.value?.can().addRowBefore(),
      },
      {
        label: 'Add Row After',
        click: () => {
          if (editor.value)
            editor.value.chain().focus().addRowAfter().run()
        },
        disabled: !editor.value?.can().addRowAfter(),
      },
      {
        label: 'Delete Row',
        click: () => {
          if (editor.value)
            editor.value.chain().focus().deleteRow().run()
        },
        disabled: !editor.value?.can().deleteRow(),
      },
      {
        label: 'Merge Cells',
        click: () => {
          if (editor.value)
            editor.value.chain().focus().mergeCells().run()
        },
        disabled: !editor.value?.can().mergeCells(),
      },
      {
        label: 'Split Cell',
        click: () => {
          if (editor.value)
            editor.value.chain().focus().splitCell().run()
        },
        disabled: !editor.value?.can().splitCell(),
      },
      {
        label: 'Toggle Header Column',
        click: () => {
          if (editor.value)
            editor.value.chain().focus().toggleHeaderColumn().run()
        },
        disabled: !editor.value?.can().toggleHeaderColumn(),
      },
      {
        label: 'Toggle Header Row',
        click: () => {
          if (editor.value)
            editor.value.chain().focus().toggleHeaderRow().run()
        },
        disabled: !editor.value?.can().toggleHeaderRow(),
      },
    ],
  ]
})

const items = ref([
  {
    icon: 'bold',
    title: 'Bold',
    action: () => {
      if (editor.value)
        editor.value.chain().focus().toggleBold().run()
    },
    isActive: () => {
      if (editor.value)
        return editor.value.isActive('bold')
    },
  },
  {
    icon: 'italic',
    title: 'Italic',
    action: () => {
      if (editor.value)
        editor.value.chain().focus().toggleItalic().run()
    },
    isActive: () => {
      if (editor.value)
        return editor.value.isActive('italic')
    },
  },
  {
    icon: 'strikethrough',
    title: 'Strike',
    action: () => {
      if (editor.value)
        editor.value.chain().focus().toggleStrike().run()
    },
    isActive: () => {
      if (editor.value)
        return editor.value.isActive('strike')
    },
  },
  {
    icon: 'code-view',
    title: 'Code',
    action: () => {
      if (editor.value)
        editor.value.chain().focus().toggleCode().run()
    },
    isActive: () => {
      if (editor.value)
        return editor.value.isActive('code')
    },
  },
  {
    type: 'divider',
  },
  {
    icon: 'h-1',
    title: 'Heading 1',
    action: () => {
      if (editor.value)
        editor.value.chain().focus().toggleHeading({ level: 1 }).run()
    },
    isActive: () => {
      if (editor.value)
        return editor.value.isActive('heading', { level: 1 })
    },
  },
  {
    icon: 'h-2',
    title: 'Heading 2',
    action: () => {
      if (editor.value)
        editor.value.chain().focus().toggleHeading({ level: 2 }).run()
    },
    isActive: () => {
      if (editor.value)
        return editor.value.isActive('heading', { level: 2 })
    },
  },
  {
    icon: 'h-3',
    title: 'Heading 3',
    action: () => {
      if (editor.value)
        editor.value.chain().focus().toggleHeading({ level: 3 }).run()
    },
    isActive: () => {
      if (editor.value)
        return editor.value.isActive('heading', { level: 3 })
    },
  },
  {
    icon: 'paragraph',
    title: 'Paragraph',
    action: () => {
      if (editor.value)
        editor.value.chain().focus().setParagraph().run()
    },
    isActive: () => {
      if (editor.value)
        return editor.value.isActive('paragraph')
    },
  },
  { type: 'divider' },
  {
    icon: 'align-left',
    title: 'Align Left',
    action: () => {
      if (editor.value) {
        if (!editor.value.isActive({ textAlign: 'left' }))
          editor.value.commands.setTextAlign('left')
        else editor.value.commands.unsetTextAlign()
      }
    },
    isActive: () => {
      if (editor.value)
        return editor.value.isActive({ textAlign: 'left' })
    },
  },
  {
    icon: 'align-center',
    title: 'Align Center',
    action: () => {
      if (editor.value) {
        if (!editor.value.isActive({ textAlign: 'center' }))
          editor.value.commands.setTextAlign('center')
        else editor.value.commands.unsetTextAlign()
      }
    },
    isActive: () => {
      if (editor.value)
        return editor.value.isActive({ textAlign: 'center' })
    },
  },
  {
    icon: 'align-right',
    title: 'Align Right',
    action: () => {
      if (editor.value) {
        if (!editor.value.isActive({ textAlign: 'right' }))
          editor.value.commands.setTextAlign('right')
        else editor.value.commands.unsetTextAlign()
      }
    },
    isActive: () => {
      if (editor.value)
        return editor.value.isActive({ textAlign: 'right' })
    },
  },
  {
    icon: 'align-justify',
    title: 'Align Justify',
    action: () => {
      if (editor.value) {
        if (!editor.value.isActive({ textAlign: 'justify' }))
          editor.value.commands.setTextAlign('justify')
        else editor.value.commands.unsetTextAlign()
      }
    },
    isActive: () => {
      if (editor.value)
        return editor.value.isActive({ textAlign: 'justify' })
    },
  },
  { type: 'divider' },
  {
    icon: 'list-unordered',
    title: 'Bullet List',
    action: () => {
      if (editor.value)
        editor.value.chain().focus().toggleBulletList().run()
    },
    isActive: () => {
      if (editor.value)
        return editor.value.isActive('bulletList')
    },
  },
  {
    icon: 'list-ordered',
    title: 'Ordered List',
    action: () => {
      if (editor.value)
        editor.value.chain().focus().toggleOrderedList().run()
    },
    isActive: () => {
      if (editor.value)
        return editor.value.isActive('orderedList')
    },
  },
  {
    icon: 'code-box-line',
    title: 'Code Block',
    action: () => {
      if (editor.value)
        editor.value.chain().focus().toggleCodeBlock().run()
    },
    isActive: () => {
      if (editor.value)
        return editor.value.isActive('codeBlock')
    },
  },
  { type: 'divider' },
  {
    icon: 'image-fill',
    title: 'Image',
    action: () => {},
    uploaded: (e: Ref<UploadApiResponse>) => {
      addImage(e.value.secure_url)
    },
  },
  {
    icon: 'link',
    title: 'Link',
    action: () => setLink(),
    isActive: () => {
      if (editor.value)
        return editor.value.isActive('link')
    },
  },
  {
    icon: 'link-unlink',
    title: 'Unlink',
    action: () => {
      if (editor.value)
        editor.value.chain().focus().unsetLink().run()
    },
  },
  {
    type: 'divider',
  },
  {
    icon: 'double-quotes-l',
    title: 'Blockquote',
    action: () => {
      if (editor.value)
        editor.value.chain().focus().toggleBlockquote().run()
    },
    isActive: () => {
      if (editor.value)
        return editor.value.isActive('blockquote')
    },
  },
  {
    icon: 'separator',
    title: 'Horizontal Rule',
    action: () => {
      if (editor.value)
        editor.value.chain().focus().setHorizontalRule().run()
    },
  },
  {
    type: 'divider',
  },
  {
    icon: 'text-wrap',
    title: 'Hard Break',
    action: () => {
      if (editor.value)
        editor.value.chain().focus().setHardBreak().run()
    },
  },
  {
    icon: 'format-clear',
    title: 'Clear Format',
    action: () => {
      if (editor.value)
        editor.value.chain().focus().clearNodes().unsetAllMarks().run()
    },
  },
  {
    type: 'divider',
  },
  {
    icon: 'arrow-go-back-line',
    title: 'Undo',
    action: () => {
      if (editor.value)
        editor.value.chain().focus().undo().run()
    },
  },
  {
    icon: 'arrow-go-forward-line',
    title: 'Redo',
    action: () => {
      if (editor.value)
        editor.value.chain().focus().redo().run()
    },
  },
])

function setLink() {
  if (editor.value) {
    const previousUrl = editor.value.getAttributes('link').href
    // eslint-disable-next-line no-alert
    const url = window.prompt('URL', previousUrl)

    // cancelled
    if (url === null)
      return

    // empty
    if (url === '') {
      editor.value.chain().focus().extendMarkRange('link').unsetLink().run()

      return
    }

    // update link
    editor.value
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run()
  }
}

function addImage(url: string) {
  if (editor.value) {
    if (url)
      editor.value.chain().focus().setImage({ src: url }).run()
  }
}
</script>

<style>
.divider {
  @apply bg-gray-300;
}
</style>
