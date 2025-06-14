<template>
  <Header />
  <div class="container">
    <h1 class="page-title">Categories</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <!-- Toggle Form Button -->
      <div class="form-toggle">
        <button @click="toggleForm('create')" class="create-button">
          {{ showForm && formMode === 'create' ? 'Cancel' : 'Create New Category' }}
        </button>
      </div>

      <!-- Form for Create/Edit -->
      <div v-if="showForm" class="form-card">
        <h2 class="form-title">
          {{ formMode === 'create' ? 'Create Category' : 'Edit Category' }}
        </h2>
        <form @submit.prevent="submitForm" class="form">
          <!-- Name -->
          <div class="form-group">
            <label for="name" class="form-label">Name</label>
            <input
              v-model="form.name"
              type="text"
              id="name"
              class="form-input"
              required
            />
            <span v-if="validationErrors.name" class="error">{{ validationErrors.name.join(', ') }}</span>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label for="description" class="form-label">Description</label>
            <textarea
              v-model="form.description"
              id="description"
              class="form-textarea"
              rows="4"
            ></textarea>
            <span v-if="validationErrors.description" class="error">{{ validationErrors.description.join(', ') }}</span>
          </div>

          <!-- Image -->
          <div class="form-group">
            <label class="form-label">Image</label>
            <img
              v-if="form.imagePreview || (formMode === 'edit' && form.image)"
              :src="form.imagePreview || form.image"
              alt="Preview"
              class="preview-image"
            />
            <input
              type="file"
              accept="image/*"
              @change="handleImageChange"
              class="form-file"
            />
            <span v-if="validationErrors.image" class="error">{{ validationErrors.image.join(', ') }}</span>
          </div>

          <!-- Messages -->
          <div v-if="success" class="success">{{ success }}</div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="submit-button"
            :disabled="submitting"
          >
            {{ submitting ? 'Submitting...' : formMode === 'create' ? 'Create Category' : 'Update Category' }}
          </button>
        </form>
      </div>

      <!-- Categories List -->
      <div class="categories-grid">
        <div v-for="category in categories" :key="category.id" class="category-card">
          <img
            v-if="category.image"
            :src="category.image"
            :alt="category.name"
            class="category-image"
          />
          <div v-else class="no-image">No Image</div>
          <h2 class="category-title">{{ category.name }}</h2>
          <p class="category-description">{{ category.description || 'No description' }}</p>
          <div class="actions">
            <button
              @click="toggleForm('edit', category)"
              class="edit-button"
            >
              Edit
            </button>
            <button
              @click="deleteCategory(category.id)"
              class="delete-button"
              :disabled="deleting"
            >
              {{ deleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import categoryService from '../services/categoryService';
import Header from '@/components/HeaderView.vue'
import Footer from '@/components/FooterView.vue'

const categories = ref([]);
const loading = ref(true);
const error = ref(null);
const success = ref(null);
const submitting = ref(false);
const deleting = ref(false);
const showForm = ref(false);
const formMode = ref('create');
const validationErrors = ref({});

const form = ref({
  id: null,
  name: '',
  description: '',
  image: null,
  imagePreview: null,
});

onMounted(async () => {
  const result = await categoryService.getCategories();
  console.log('Fetch Categories Result:', result);
  if (result.success) {
    categories.value = result.data;
  } else {
    error.value = result.message;
  }
  loading.value = false;
});

const toggleForm = (mode, category = null) => {
  showForm.value = !showForm.value || formMode.value !== mode;
  formMode.value = mode;
  validationErrors.value = {};
  if (showForm.value && category) {
    form.value = {
      id: category.id,
      name: category.name || '',
      description: category.description || '',
      image: category.image || null,
      imagePreview: null,
    };
  } else {
    form.value = {
      id: null,
      name: '',
      description: '',
      image: null,
      imagePreview: null,
    };
  }
};

const handleImageChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    form.value.image = file;
    form.value.imagePreview = URL.createObjectURL(file);
  }
};

const submitForm = async () => {
  submitting.value = true;
  success.value = null;
  error.value = null;
  validationErrors.value = {};

  const formData = new FormData();
  formData.append('name', form.value.name || '');
  formData.append('description', form.value.description || '');
  if (form.value.image && form.value.image instanceof File) {
    formData.append('image', form.value.image);
  }
  if (formMode.value === 'update') {
    formData.append('_method', 'PUT');
  }
  console.log('FormData Contents:');
  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  let result;
  if (formMode.value === 'create') {
    result = await categoryService.createCategory(formData);
  } else {
    result = await categoryService.updateCategory(form.value.id, formData);
  }

  if (result.success) {
    success.value = result.message;
    const fetchResult = await categoryService.getCategories();
    if (fetchResult.success) {
      categories.value = fetchResult.data;
    }
    toggleForm('create');
    setTimeout(() => (success.value = null), 2000);
  } else {
    error.value = result.message;
    if (result.errors) {
      validationErrors.value = result.errors;
    }
    if (result.status === 404) {
      error.value = 'Danh mục không tồn tại. Có thể đã bị xóa.';
    }
  }
  submitting.value = false;
};

const deleteCategory = async (id) => {
  if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
  deleting.value = true;
  const result = await categoryService.deleteCategory(id);
  if (result.success) {
    categories.value = categories.value.filter((category) => category.id !== id);
    success.value = result.message;
    setTimeout(() => (success.value = null), 2000);
  } else {
    error.value = result.message;
  }
  deleting.value = false;
};
</script>

<style scoped>
/* Unchanged CSS, kept for completeness */
.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem;
}
.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 2rem;
}
.loading {
  text-align: center;
  color: #6b7280;
  font-size: 1rem;
}
.error {
  background-color: #fef2f2;
  color: #b91c1c;
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}
.success {
  background-color: #d1fae5;
  color: #065f46;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}
.form-toggle {
  margin-bottom: 1.5rem;
}
.create-button {
  background-color: #2563eb;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}
.create-button:hover {
  background-color: #1d4ed8;
}
.form-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}
.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}
.form-input,
.form-textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.form-textarea {
  resize: vertical;
  min-height: 100px;
}
.form-file {
  font-size: 0.875rem;
  color: #6b7280;
}
.form-file::-webkit-file-upload-button {
  background-color: #e0f2fe;
  color: #1e40af;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  margin-right: 1rem;
}
.form-file::-webkit-file-upload-button:hover {
  background-color: #bfdbfe;
}
.preview-image {
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}
.submit-button {
  width: 100%;
  background-color: #2563eb;
  color: white;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}
.submit-button:hover {
  background-color: #1d4ed8;
}
.submit-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
.category-card {
  background-color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.category-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}
.no-image {
  width: 100%;
  height: 160px;
  background-color: #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 0.875rem;
}
.category-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}
.category-description {
  color: #4b5563;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}
.actions {
  display: flex;
  gap: 0.5rem;
}
.edit-button {
  background-color: #d97706;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  border: none;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}
.edit-button:hover {
  background-color: #b45309;
}
.delete-button {
  background-color: #dc2626;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  border: none;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}
.delete-button:hover {
  background-color: #b91c1c;
}
.delete-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: 1fr;
  }
}
</style>
