<template>
  <div class="editor-container">
    <div v-if="editor" class="toolbar">
      <!-- Định dạng cơ bản -->
      <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }">
        <i class="fas fa-bold"></i>
      </button>
      <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }">
        <i class="fas fa-italic"></i>
      </button>
      <button @click="editor.chain().focus().toggleUnderline().run()">
        <i class="fas fa-underline"></i>
      </button>
      <button @click="editor.chain().focus().toggleHighlight().run()">
        <i class="fas fa-highlighter"></i>
      </button>
      <button @click="editor.chain().focus().toggleSuperscript().run()">
        <i class="fas fa-superscript"></i>
      </button>
      <button @click="editor.chain().focus().toggleSubscript().run()">
        <i class="fas fa-subscript"></i>
      </button>

      <!-- Danh sách & nhiệm vụ -->
      <button @click="editor.chain().focus().toggleBulletList().run()">
        <i class="fas fa-list-ul"></i>
      </button>
      <button @click="editor.chain().focus().toggleTaskList().run()">
        <i class="fas fa-tasks"></i>
      </button>

      <!-- Trích dẫn & mã -->
      <button @click="editor.chain().focus().toggleBlockquote().run()">
        <i class="fas fa-quote-right"></i>
      </button>
      <button @click="editor.chain().focus().toggleCodeBlock().run()">
        <i class="fas fa-code"></i>
      </button>

      <!-- Tiêu đề -->
      <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()">H1</button>
      <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">H2</button>

      <!-- Dòng kẻ ngang -->
      <button @click="editor.chain().focus().setHorizontalRule().run()">
        <i class="fas fa-minus"></i>
      </button>

      <!-- Bảng & hình ảnh -->
      <button @click="insertTable"><i class="fas fa-table"></i></button>
      <button @click="addImage"><i class="fas fa-image"></i></button>

      <!-- Màu chữ -->
      <button @click="setTextColor"><i class="fas fa-palette"></i></button>

      <!-- Căn lề -->
      <button @click="editor.chain().focus().setTextAlign('left').run()" :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }">
        <i class="fas fa-align-left"></i>
      </button>
      <button @click="editor.chain().focus().setTextAlign('center').run()" :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }">
        <i class="fas fa-align-center"></i>
      </button>
      <button @click="editor.chain().focus().setTextAlign('right').run()" :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }">
        <i class="fas fa-align-right"></i>
      </button>
      <button @click="editor.chain().focus().setTextAlign('justify').run()" :class="{ 'is-active': editor.isActive({ textAlign: 'justify' }) }">
        <i class="fas fa-align-justify"></i>
      </button>
    </div>

    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    <EditorContent :editor="editor" class="editor-content" />

    <div v-if="showImageDialog" class="dialog">
      <h3>Thêm ảnh</h3>
      <input type="file" accept="image/*" @change="onImageSelected" />
      <select v-model="imageAlign">
        <option value="left">Trái</option>
        <option value="center">Giữa</option>
        <option value="right">Phải</option>
        <option value="inline">Cùng dòng</option>
      </select>
      <input type="text" v-model="imageWidth" placeholder="Chiều rộng (vd: 300 hoặc 50%)" />
      <button @click="insertImage">Chèn ảnh</button>
      <button @click="cancelImage">Hủy</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'

const props = defineProps({ modelValue: String })
const emit = defineEmits(['update:modelValue', 'update:contentImages'])

const showImageDialog = ref(false)
const imageFile = ref(null)
const imageAlign = ref('center')
const imageWidth = ref('300')
const errorMessage = ref('')
const contentImages = ref([])
const contentBlobUrls = ref([])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Image.configure({
      inline: true,
      allowBase64: false,
      HTMLAttributes: {
        class: 'align-center', // Mặc định
      },
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right', 'justify']
    }),
    TextStyle,
    Color,
    Underline,
    Highlight,
    Link.configure({ openOnClick: true }),
    Subscript,
    Superscript,
    TaskList,
    TaskItem.configure({ nested: true }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
  ],
  onUpdate: () => {
    emit('update:modelValue', editor.value.getHTML())
  },
})

watch(() => props.modelValue, (newVal) => {
  if (editor.value && newVal !== editor.value.getHTML()) {
    editor.value.commands.setContent(newVal, false)
  }
})

onBeforeUnmount(() => {
  contentBlobUrls.value.forEach(url => window.URL.revokeObjectURL(url))
  contentBlobUrls.value = []
  editor.value?.destroy()
})

const addImage = () => {
  showImageDialog.value = true
}

const onImageSelected = (e) => {
  imageFile.value = e.target.files[0]
  console.log('Image selected:', imageFile.value)
}

const insertImage = () => {
  console.log('insertImage called with file:', imageFile.value)
  if (!imageFile.value) {
    errorMessage.value = 'Vui lòng chọn ảnh'
    return
  }
  try {
    const tempUrl = URL.createObjectURL(imageFile.value)
    contentBlobUrls.value.push(tempUrl) // Lưu URL
    contentImages.value.push(imageFile.value)
    emit('update:contentImages', contentImages.value)
    const classMap = {
      left: 'align-left',
      center: 'align-center',
      right: 'align-right',
      inline: 'inline-image'
    }
    editor.value.chain().focus().setImage({
      src: tempUrl,
      width: imageWidth.value,
      class: classMap[imageAlign.value]
    }).run()
    resetImageDialog()
  } catch (error) {
    errorMessage.value = 'Lỗi khi chèn ảnh'
    console.error('Insert image error:', error)
  }
}

const cancelImage = () => {
  resetImageDialog()
}

const resetImageDialog = () => {
  showImageDialog.value = false
  imageFile.value = null
  imageAlign.value = 'center'
  imageWidth.value = '100'
  errorMessage.value = ''
}

const setTextColor = () => {
  const color = prompt('Chọn màu văn bản (vd: red, #00ff00):', '#000000')
  if (color) {
    editor.value.chain().focus().setColor(color).run()
  }
}

const insertTable = () => {
  editor.value.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}
</script>

<style scoped>
.editor-container {
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 6px;
  background: #fff;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.toolbar button {
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  background: #0d0d0d;
  cursor: pointer;
}

.toolbar button.is-active {
  background: #646cff;
  color: white;
}

.editor-content {
  min-height: 200px;
  outline: none;
}

.dialog {
  margin-top: 15px;
  padding: 10px;
  border: 1px solid #999;
  border-radius: 5px;
  background: #f9f9f9;
}

.align-left {
  display: block;
  margin: 10px auto 10px 0;
  float: left;
  clear: both;
}

.align-center {
  display: block;
  margin: 10px auto;
  float: none;
  clear: both;
}

.align-right {
  display: block;
  margin: 10px 0 10px auto;
  float: right;
  clear: both;
}

.inline-image {
  display: inline-block;
  margin: 0 5px;
  vertical-align: middle;
  max-height: 1.5em;
}

.error {
  color: red;
  margin: 10px 0;
}
</style>
