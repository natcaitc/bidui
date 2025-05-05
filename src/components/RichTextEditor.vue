<template>
  <div class="d-flex flex-column mt-4">
    <!-- Edit Button -->
    <div v-if="!isEditing" class="d-flex justify-end mb-2">
      <v-btn prepend-icon="pen-to-square" variant="elevated" @click="startEditing">
        Edit
      </v-btn>
    </div>
    <!-- Save/Cancel Buttons -->
    <div v-if="isEditing" class="d-flex justify-end mb-2">
      <v-btn
        class="mr-2"
        color="success"
        prepend-icon="floppy-disk"
        variant="elevated"
        @click="saveContent"
      >
        Save
      </v-btn>
      <v-btn prepend-icon="xmark" variant="elevated" @click="cancelEditing">
        Cancel
      </v-btn>
    </div>


    <!-- Toolbar -->
    <v-toolbar v-if="isEditing" class="mb-2" density="compact" style="gap: 4px; max-width: 100%;">
      <!-- Text Styles Menu -->
      <v-menu>
        <template #activator="{ props: activatorProps }">
          <v-btn density="compact" variant="text" v-bind="activatorProps">
            <font-awesome-icon
              v-if="editor.isActive('heading', { level: 1 })"
              :icon="['fass', 'h1']"
              size="lg"
            />
            <font-awesome-icon
              v-else-if="editor.isActive('heading', { level: 2 })"
              :icon="['fass', 'h2']"
              size="lg"
            />
            <font-awesome-icon
              v-else-if="editor.isActive('heading', { level: 3 })"
              :icon="['fass', 'h3']"
              size="lg"
            />
            <font-awesome-icon
              v-else
              :icon="['fass', 'paragraph']"
              size="lg"
            />
            <font-awesome-icon class="ml-1" :icon="['fass', 'chevron-down']" />
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item @click="editor.chain().focus().setParagraph().run()">
            <font-awesome-icon :icon="['fass', 'paragraph']" size="sm" />
          </v-list-item>
          <v-list-item @click="editor.chain().focus().toggleHeading({ level: 1 }).run()">
            <font-awesome-icon :icon="['fass', 'h1']" size="sm" />
          </v-list-item>
          <v-list-item @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">
            <font-awesome-icon :icon="['fass', 'h2']" size="sm" />
          </v-list-item>
          <v-list-item @click="editor.chain().focus().toggleHeading({ level: 3 }).run()">
            <font-awesome-icon :icon="['fass', 'h3']" size="sm" />
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- Bold / Italic / Underline -->
      <v-btn
        :class="{ 'text-primary': editor.isActive('bold') }"
        icon
        variant="text"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <font-awesome-icon :icon="['fass', 'bold']" />
      </v-btn>
      <v-btn
        :class="{ 'text-primary': editor.isActive('italic') }"
        icon
        variant="text"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <font-awesome-icon :icon="['fass', 'italic']" />
      </v-btn>
      <v-btn
        :class="{ 'text-primary': editor.isActive('underline') }"
        icon
        variant="text"
        @click="editor.chain().focus().toggleUnderline().run()"
      >
        <font-awesome-icon :icon="['fass', 'underline']" />
      </v-btn>

      <!-- Lists -->
      <v-btn
        :class="{ 'text-primary': editor.isActive('bulletList') }"
        icon
        variant="text"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        <font-awesome-icon :icon="['fass', 'list-ul']" />
      </v-btn>
      <v-btn
        :class="{ 'text-primary': editor.isActive('orderedList') }"
        icon
        variant="text"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        <font-awesome-icon :icon="['fass', 'list-ol']" />
      </v-btn>

      <!-- Indent / Outdent -->
      <v-btn icon variant="text" @click="editor.chain().focus().sinkListItem('listItem').run()">
        <font-awesome-icon :icon="['fass', 'indent']" />
      </v-btn>
      <v-btn icon variant="text" @click="editor.chain().focus().liftListItem('listItem').run()">
        <font-awesome-icon :icon="['fass', 'outdent']" />
      </v-btn>

      <!-- Undo / Redo -->
      <v-btn icon variant="text" @click="editor.chain().focus().undo().run()">
        <font-awesome-icon :icon="['fass', 'rotate-left']" />
      </v-btn>
      <v-btn icon variant="text" @click="editor.chain().focus().redo().run()">
        <font-awesome-icon :icon="['fass', 'rotate-right']" />
      </v-btn>
    </v-toolbar>

    <!-- Editor -->
    <div class="editor-wrapper flex-grow-1 d-flex flex-column">
      <editor-content :contenteditable="isEditing" :editor="editor" :style="{ flex:1 }" />
    </div>
  </div>
</template>

    <script setup>
  import { onBeforeUnmount, ref, watch } from 'vue'
  import { Editor, EditorContent } from '@tiptap/vue-3'
  import StarterKit from '@tiptap/starter-kit'
  import Underline from '@tiptap/extension-underline'
  import Heading from '@tiptap/extension-heading'

  const props = defineProps({
    modelValue: {
      type: String,
      default: '<p>Start writing...</p>',
    },
  })

  const emit = defineEmits(['save'])

  const isEditing = ref(false)
  const localContent = ref(props.modelValue)

  const editor = new Editor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
      }),
      Heading.configure({ levels: [1, 2, 3] }),
      Underline,
    ],
    content: props.modelValue,
    editable: isEditing.value,
    onUpdate: ({ editor }) => {
      if (isEditing.value) {
        localContent.value = editor.getHTML()
      }
    },
  })

  // Watch for changes in the modelValue prop
  watch(() => props.modelValue, newValue => {
    // Only update if the editor content is different from the new value
    if (newValue !== editor.getHTML()) {
      editor.commands.setContent(newValue)
      localContent.value = newValue
    }
  })

  function startEditing () {
    isEditing.value = true
    editor.commands.setContent(props.modelValue)
    editor.setEditable(true)
  }

  function saveContent () {
    const newContent = editor.getHTML()
    localContent.value = newContent
    emit('save', newContent)
    isEditing.value = false
    editor.setEditable(false)
  }

  function cancelEditing () {
    editor.commands.setContent(props.modelValue)
    isEditing.value = false
    editor.setEditable(false)
  }

  onBeforeUnmount(() => editor.destroy())
    </script>

<style scoped>
.editor-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    flex: 1 1 auto;
    overflow-y: auto;
}

/* noinspection CssUnusedSymbol */
:deep(.ProseMirror) {
    flex: 1 1 auto;
    min-height: 100%;
    display: flex;
    flex-direction: column;
}
</style>
