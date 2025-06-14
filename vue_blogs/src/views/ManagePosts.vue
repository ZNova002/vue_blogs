<template>
  <Header />
  <section class="manage-posts-section">
    <div class="manage-posts-container">
      <div class="header-actions">
        <h1 class="manage-posts-title">Quản lý bài viết</h1>
        <router-link to="/createpost" class="create-btn">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Tạo bài viết mới
        </router-link>
      </div>

      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <span>Đang tải dữ liệu...</span>
      </div>
      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
      <div v-if="successMessage" class="success">{{ successMessage }}</div>

      <div class="table-responsive">
        <table class="posts-table">
          <thead>
            <tr>
              <th>Thumbnail</th>
              <th>Tiêu đề</th>
              <th>Danh mục</th>
              <th>Tags</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in posts" :key="post.id">
              <td>
                <img
                  v-if="post.thumbnail"
                  :src="post.thumbnail"
                  alt="Thumbnail"
                  class="thumbnail-img"
                />
                <span v-else>Không có ảnh</span>
              </td>
              <td>{{ post.title }}</td>
              <td>{{ post.category?.name || 'Không có danh mục' }}</td>
              <td>
                <span v-if="post.tags && post.tags.length" class="tag-list">
                  <span v-for="tag in post.tags" :key="tag.id" class="tag">
                    {{ tag.name }}
                  </span>
                </span>
                <span v-else>Không có tags</span>
              </td>
              <td>{{ formatDate(post.created_at) }}</td>
              <td class="action-buttons">
              <router-link :to="{ name: 'EditPost', params: { id: post.id } }" class="action-btn edit-btn">
                <svg xmlns="http://www.w3.org/2000/svg" class="action-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Sửa
              </router-link>
                <button @click="deletePostHandler(post.id)" class="action-btn delete-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" class="action-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  Xóa
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <button
          @click="fetchPosts(currentPage - 1)"
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="pagination-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          Trước
        </button>
        <span class="page-info">Trang {{ currentPage }} / {{ totalPages }}</span>
        <button
          @click="fetchPosts(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          Sau
          <svg xmlns="http://www.w3.org/2000/svg" class="pagination-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  </section>
  <Footer />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getPosts, deletePost } from '@/services/createPost';
import { getTagsByPostId } from '@/services/tagsService';
import Header from '@/components/HeaderView.vue';
import Footer from '@/components/FooterView.vue';

const posts = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const fetchPosts = async (page = 1) => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await getPosts(page);
    posts.value = response.data;

    for (let post of posts.value) {
      const tagsResponse = await getTagsByPostId(post.id);
      post.tags = tagsResponse.success ? tagsResponse.data : [];
    }

    currentPage.value = response.current_page;
    totalPages.value = response.last_page;
  } catch (error) {
    errorMessage.value = error.message || 'Lỗi khi tải danh sách bài viết';
    console.error('Lỗi tải dữ liệu:', error);
  } finally {
    isLoading.value = false;
  }
};

const deletePostHandler = async (postId) => {
  if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;

  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  try {
    await deletePost(postId);
    successMessage.value = 'Xóa bài viết thành công!';
    fetchPosts(currentPage.value);
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error) {
    errorMessage.value = error.message || 'Lỗi khi xóa bài viết';
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

onMounted(() => {
  fetchPosts();
});
</script>

<style scoped>
.manage-posts-section {
  background-color: #f8fafc;
  min-height: calc(100vh - 120px);
  padding: 30px 0;
}

.manage-posts-container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 30px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.manage-posts-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a365d;
  margin: 0;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #4299e1;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(66, 153, 225, 0.3);
}

.create-btn:hover {
  background-color: #3182ce;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(66, 153, 225, 0.4);
}

.create-btn .icon {
  width: 18px;
  height: 18px;
}

.table-responsive {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #edf2f7;
}

.posts-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.posts-table th {
  background: #4299e1;
  color: white;
  font-weight: 600;
  padding: 15px;
  text-align: left;
}

.posts-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #edf2f7;
  vertical-align: middle;
}

.posts-table tr:last-child td {
  border-bottom: none;
}

.posts-table tr:hover {
  background-color: #f7fafc;
}

.thumbnail-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background: #ebf8ff;
  color: #2b6cb0;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  text-decoration: none;
}

.action-icon {
  width: 16px;
  height: 16px;
}

.edit-btn {
  background-color: #48bb78;
  color: white;
}

.edit-btn:hover {
  background-color: #38a169;
}

.delete-btn {
  background-color: #f56565;
  color: white;
}

.delete-btn:hover {
  background-color: #e53e3e;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
}

.pagination-btn {
  padding: 8px 16px;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.pagination-btn:hover:not(:disabled) {
  background: #3182ce;
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  background: #bee3f8;
  cursor: not-allowed;
}

.pagination-icon {
  width: 16px;
  height: 16px;
}

.page-info {
  font-size: 14px;
  color: #4a5568;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  background: #ebf8ff;
  color: #2b6cb0;
  border-radius: 8px;
  margin-bottom: 20px;
}

.spinner {
  border: 3px solid rgba(66, 153, 225, 0.2);
  border-radius: 50%;
  border-top: 3px solid #4299e1;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  padding: 15px;
  background: #fff5f5;
  color: #c53030;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.success {
  padding: 15px;
  background: #f0fff4;
  color: #2f855a;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .manage-posts-container {
    padding: 20px;
  }

  .header-actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .action-btn {
    width: 100%;
  }

  .pagination {
    flex-direction: column;
    gap: 10px;
  }

  .page-info {
    order: -1;
  }
}
</style>
