<template>
   <HeaderView />
  <div class="tag-manager">


    <h1>Quản lý Tag</h1>

    <!-- Thông báo -->
    <div v-if="successMessage" class="alert success">{{ successMessage }}</div>
    <div v-if="error" class="alert error">{{ error }}</div>

    <!-- Form tạo tag -->
    <form @submit.prevent="createTag" class="form">
      <input v-model="newTagName" type="text" placeholder="Tên tag mới" required />
      <button type="submit">Tạo Tag</button>
    </form>

    <!-- Danh sách tag -->
    <div v-if="loading" class="loading">Đang tải...</div>
    <div v-else-if="tags.length === 0">Không có tag nào.</div>
    <ul class="tag-list">
      <li v-for="tag in tags" :key="tag.id" class="tag-item">
        <template v-if="editingTagId === tag.id">
          <input
            v-model="editingTagName"
            @keyup.enter="updateTag(tag.id)"
            class="edit-input"
          />
          <button @click="updateTag(tag.id)">Lưu</button>
          <button @click="cancelEditing">Hủy</button>
        </template>

        <template v-else>
          <div class="tag-content">
            <span class="tag-name">{{ tag.name }}</span>
            <div class="tag-actions">
              <button @click="startEditing(tag)">Sửa</button>
              <button @click="deleteTag(tag.id)">Xóa</button>
            </div>
          </div>
        </template>
      </li>
    </ul>


  </div>
  <FooterView />
</template>

<script>
import HeaderView from '../components/HeaderView.vue';
import FooterView from '../components/FooterView.vue';

import {
  getAllTags,
  createTag,
  updateTag,
  deleteTag
} from '../services/tagsService';

export default {
  components: {
    HeaderView,
    FooterView,
  },
  data() {
    return {
      tags: [],
      newTagName: '',
      editingTagId: null,
      editingTagName: '',
      loading: false,
      error: '',
      successMessage: '',
    };
  },
  async created() {
    await this.fetchTags();
  },
  methods: {
    async fetchTags() {
      this.loading = true;
      const response = await getAllTags();
      this.loading = false;
      if (response.success) {
        this.tags = response.data;
      } else {
        this.error = response.message;
      }
    },
    async createTag() {
      const response = await createTag(this.newTagName);
      if (response.success) {
        this.tags.push(response.data);
        this.successMessage = response.message;
        this.newTagName = '';
        setTimeout(() => (this.successMessage = ''), 3000);
      } else {
        this.error = response.message;
      }
    },
    startEditing(tag) {
      this.editingTagId = tag.id;
      this.editingTagName = tag.name;
    },
    async updateTag(id) {
      const response = await updateTag(id, this.editingTagName);
      if (response.success) {
        const index = this.tags.findIndex(t => t.id === id);
        this.tags[index] = response.data;
        this.successMessage = response.message;
        this.cancelEditing();
        setTimeout(() => (this.successMessage = ''), 3000);
      } else {
        this.error = response.message;
      }
    },
    async deleteTag(id) {
      if (confirm('Bạn có chắc muốn xóa tag này?')) {
        const response = await deleteTag(id);
        if (response.success) {
          this.tags = this.tags.filter(t => t.id !== id);
          this.successMessage = response.message;
          setTimeout(() => (this.successMessage = ''), 3000);
        } else {
          this.error = response.message;
        }
      }
    },
    cancelEditing() { 
      this.editingTagId = null;
      this.editingTagName = '';
    }
  }
};
</script>

<style scoped>
.tag-manager {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif;
}
h1 {
  font-size: 24px;
  margin-bottom: 20px;
}
.alert {
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
}
.alert.success {
  background-color: #e7f9ee;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}
.alert.error {
  background-color: #fdecea;
  color: #c62828;
  border: 1px solid #f5c6cb;
}
.form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.form input {
  flex: 1;
  padding: 8px;
}
.form button {
  padding: 8px 12px;
}
.tag-list {
  list-style: none;
  padding: 0;
}

.tag-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tag-name {
  flex: 1;
  font-weight: 500;
}

.tag-actions button {
  margin-left: 8px;
}

.tag-item {
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  border-bottom: 1px solid #ddd;
  padding: 6px 0;
}
.edit-input {
  padding: 5px;
  margin-right: 10px;
}
.tag-item button {
  margin-left: 5px;
  padding: 5px 10px;
  cursor: pointer;
}
.loading {
  font-style: italic;
}
</style>
