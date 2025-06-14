<template>
  <Header />
  <section class="post-section">
    <div class="post-container">
      <h1 class="post-title">Tạo bài viết mới</h1>
      <div v-if="isLoading" class="loading">Đang đăng bài...</div>
      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
      <div v-if="successMessage" class="success">{{ successMessage }}</div>

      <!-- Tiêu đề -->
      <input
        v-model="title"
        type="text"
        placeholder="Nhập tiêu đề bài viết"
        class="form-input"
      />

      <!-- Thumbnail -->
      <label class="form-label">Chọn ảnh đại diện:</label>
      <input type="file" @change="handleThumbnail" class="form-input" />
      <div v-if="thumbnailBlobUrl" class="image-preview">
        <img :src="thumbnailBlobUrl" alt="Thumbnail Preview" style="max-width: 200px;" />
      </div>

      <!-- Danh mục -->
      <label class="form-label">Chọn danh mục:</label>
      <select v-model="selectedCategory" class="form-input">
        <option disabled value="">-- Chọn danh mục --</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>

      <!-- Tags -->
      <label class="form-label">Tags:</label>
      <input
        v-model="tagInput"
        @keyup.enter="addTag"
        placeholder="Nhập tag và nhấn Enter"
        class="form-input"
      />
      <div v-if="tagInput" class="tag-suggestions">
        <div
          v-for="suggestion in filteredTagSuggestions"
          :key="suggestion.id"
          class="tag-suggestion"
          @click="selectSuggestedTag(suggestion.name)"
        >
          {{ suggestion.name }}
        </div>
      </div>
      <div class="tag-list">
        <span v-for="(tag, index) in tags" :key="index" class="tag">
          {{ tag }} <button @click="removeTag(index)">×</button>
        </span>
      </div>

      <!-- Ảnh bổ sung -->
      <label class="form-label">Ảnh bổ sung:</label>
      <input type="file" @change="handleImages" multiple class="form-input" />
      <div v-if="imageBlobUrls.length" class="image-preview">
        <img v-for="(preview, idx) in imageBlobUrls" :key="idx" :src="preview" alt="Image Preview" style="max-width: 200px; margin-right: 10px;" />
      </div>

      <!-- Nội dung bài viết -->
      <TiptapEditor v-model="content" @update:contentImages="updateContentImages" />

      <button @click="submitPost" class="submit-btn" :disabled="isLoading">Đăng bài</button>
    </div>
  </section>
  <Footer />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { createPost, getCategories, getTags } from '@/services/createPost'
import TiptapEditor from '@/components/TiptapEditor.vue'
import Header from '@/components/HeaderView.vue'
import Footer from '@/components/FooterView.vue'
import '@/assets/styles/tiptap.css'

const title = ref('')
const content = ref('<p>Hello world!</p>')
const thumbnail = ref(null)
const images = ref([])
const contentImages = ref([])
const selectedCategory = ref('')
const categories = ref([])
const tags = ref([])
const tagInput = ref('')
const allTags = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const thumbnailBlobUrl = ref(null)
const imageBlobUrls = ref([])

onMounted(async () => {
  try {
    categories.value = await getCategories()
    allTags.value = await getTags()
  } catch (error) {
    errorMessage.value = error.message || 'Lỗi khi tải danh mục hoặc tags'
  }
})

const handleThumbnail = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (thumbnailBlobUrl.value) {
      window.URL.revokeObjectURL(thumbnailBlobUrl.value)
    }
    thumbnail.value = file
    thumbnailBlobUrl.value = window.URL.createObjectURL(file)
  }
}

const handleImages = (e) => {
  const files = Array.from(e.target.files)
  if (files.length) {
    imageBlobUrls.value.forEach(url => window.URL.revokeObjectURL(url))
    images.value = files
    imageBlobUrls.value = files.map(file => window.URL.createObjectURL(file))
  }
}

const updateContentImages = (images) => {
  console.log('Content images updated:', images)
  contentImages.value = images
}

const addTag = () => {
  const val = tagInput.value.trim()
  if (val && !tags.value.includes(val)) {
    tags.value.push(val)
  }
  tagInput.value = ''
}

const removeTag = (index) => {
  tags.value.splice(index, 1)
}

const selectSuggestedTag = (name) => {
  if (!tags.value.includes(name)) {
    tags.value.push(name)
  }
  tagInput.value = ''
}

const filteredTagSuggestions = computed(() =>
  allTags.value.filter(tag =>
    tag.name.toLowerCase().includes(tagInput.value.toLowerCase()) &&
    !tags.value.includes(tag.name)
  )
)

const validateForm = () => {
  if (!title.value.trim()) return 'Vui lòng nhập tiêu đề'
  if (!selectedCategory.value) return 'Vui lòng chọn danh mục'
  if (!content.value || content.value === '<p></p>') return 'Vui lòng nhập nội dung'
  return null
}

const resetForm = () => {
  title.value = ''
  content.value = '<p></p>'
  thumbnail.value = null
  images.value = []
  contentImages.value = []
  selectedCategory.value = ''
  tags.value = []
  tagInput.value = ''

  if (thumbnailBlobUrl.value) {
    window.URL.revokeObjectURL(thumbnailBlobUrl.value)
    thumbnailBlobUrl.value = null
  }
  imageBlobUrls.value.forEach(url => window.URL.revokeObjectURL(url))
  imageBlobUrls.value = []

  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
  console.log('Form reset:', {
    title: title.value,
    content: content.value,
    thumbnail: thumbnail.value,
    images: images.value,
    contentImages: contentImages.value
  })
}

// Submit
const submitPost = async () => {
  const validationError = validateForm()
  if (validationError) {
    errorMessage.value = validationError
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const formData = new FormData()
  formData.append('title', title.value)
  formData.append('content', content.value)
  formData.append('category_id', selectedCategory.value)
  if (thumbnail.value) {
    formData.append('thumbnail', thumbnail.value)
  }
  images.value.forEach((img, idx) => {
    formData.append(`images[${idx}]`, img)
  })
  contentImages.value.forEach((img, idx) => {
    formData.append(`content_images[${idx}]`, img)
  })
  tags.value.forEach((tag, idx) => {
    formData.append(`tags[${idx}]`, tag)
  })

  try {
    const res = await createPost(formData)
    if (res.success) {
      successMessage.value = 'Đăng bài thành công!'
      resetForm()
    } else {
      errorMessage.value = res.message
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Lỗi server khi đăng bài'
    console.error('Submit error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.post-section {
  background-color: #f9f9f9;
  padding: 20px;
}

.post-container {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 30px;
}

.post-title {
  font-size: 28px;
  margin-bottom: 20px;
  text-align: center;
  color: #333;
}

.form-input {
  width: 100%;
  margin-bottom: 15px;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #444;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.tag {
  background: #e0e6ff;
  color: #1a3c87;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 13px;
  display: flex;
  align-items: center;
}

.tag button {
  background: none;
  border: none;
  margin-left: 5px;
  font-weight: 700;
  cursor: pointer;
  color: #1a3c87;
}

.tag-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.tag-suggestion {
  background: #f0f4f8;
  color: #2c5282;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.tag-suggestion:hover {
  background: #e2e8f0;
}

.submit-btn {
  margin-top: 15px;
  padding: 10px 20px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}

.submit-btn:hover {
  background: #357abd;
}

.submit-btn:disabled {
  background: #a0c4ff;
  cursor: not-allowed;
}

.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.loading, .error, .success {
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}

.loading {
  background: #e6f4ff;
  color: #2b6cb0;
}

.error {
  background: #fff5f5;
  color: #c53030;
}

.success {
  background: #e6fff2;
  color: #2f855a;
}
</style>
