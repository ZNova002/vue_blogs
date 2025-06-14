<template>
  <HeaderComponent />
  <div class="container">
    <h1>Quản lý bình luận</h1>

    <!-- Thông báo -->
    <div v-if="message" :class="messageClass">
      {{ message }}
    </div>

    <!-- Danh sách bài viết -->
    <div class="posts-section">
      <h2>Danh sách bài viết</h2>
      <div v-if="loadingPosts" class="loading">Đang tải bài viết...</div>
      <div v-else-if="posts.length === 0" class="no-data">
        Không có bài viết nào.
      </div>
      <div v-else class="posts-grid">
        <div
          v-for="post in posts"
          :key="post.id"
          class="post-item"
          :class="{ 'selected': selectedPost && selectedPost.id === post.id }"
          @click="selectPost(post)"
        >
          <img
            v-if="post.thumbnail"
            :src="post.thumbnail"
            alt="Thumbnail"
            class="post-thumbnail"
          />
          <h3>{{ post.title }}</h3>
        </div>
      </div>
      <div class="pagination">
        <button
          @click="loadPosts(currentPage - 1)"
          :disabled="currentPage === 1"
        >
          Trang trước
        </button>
        <button
          @click="loadPosts(currentPage + 1)"
          :disabled="!hasMorePosts"
        >
          Trang sau
        </button>
      </div>
    </div>

    <!-- Danh sách bình luận -->
    <div v-if="selectedPost" class="comments-section">
      <h2>Bình luận của bài viết: {{ selectedPost.title }}</h2>
      <div v-if="loadingComments" class="loading">Đang tải bình luận...</div>
      <div v-else-if="comments.length === 0" class="no-data">
        Chưa có bình luận nào.
      </div>
      <div v-else class="comments-list">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="comment-item"
        >
          <div class="comment-content">
            <p><strong>Liên hệ:</strong> {{ comment.contact }}</p>
            <p><strong>Nội dung:</strong> {{ comment.message }}</p>
            <p><strong>Thời gian:</strong> {{ formatDate(comment.date) }}</p>
          </div>
          <div v-if="isAuthenticated" class="comment-actions">
            <button @click="editComment(comment)">Sửa</button>
            <button @click="deleteComment(comment.id)">Xóa</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Form thêm/sửa bình luận -->
    <div v-if="selectedPost" class="form-section">
      <h2>{{ editingComment ? 'Chỉnh sửa bình luận' : 'Thêm bình luận mới' }}</h2>
      <form @submit.prevent="submitComment">
        <div class="form-group">
          <label>Email</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="Nhập email (tùy chọn)"
          />
          <span v-if="errors.email" class="error">{{ errors.email[0] }}</span>
        </div>
        <div class="form-group">
          <label>Số điện thoại</label>
          <input
            v-model="form.phone"
            type="text"
            placeholder="Nhập số điện thoại (tùy chọn)"
          />
          <span v-if="errors.phone" class="error">{{ errors.phone[0] }}</span>
        </div>
        <div class="form-group">
          <label>Nội dung bình luận</label>
          <textarea
            v-model="form.message"
            placeholder="Nhập nội dung bình luận"
            required
          ></textarea>
          <span v-if="errors.message" class="error">{{ errors.message[0] }}</span>
        </div>
        <div v-if="errors._" class="error">
          {{ errors._[0] }}
        </div>
        <button type="submit" :disabled="submitting">
          {{ submitting ? 'Đang xử lý...' : editingComment ? 'Cập nhật' : 'Thêm' }}
        </button>
        <button
          v-if="editingComment"
          @click="cancelEdit"
          type="button"
          class="cancel-button"
        >
          Hủy
        </button>
      </form>
    </div>
  </div>
  <FooterComponent />
</template>

<script>
import { getPosts, getCommentsByPost, createComment, updateComment, deleteComment } from '../services/commentServices';
import { useAuthStore } from '../stores/auth';
import HeaderView from '@/components/HeaderView.vue'
import FooterView from '@/components/FooterView.vue'

export default {

  components: {
    HeaderComponent: HeaderView,
    FooterComponent: FooterView
  },

  data() {
    return {
      posts: [],
      currentPage: 1,
      hasMorePosts: true,
      loadingPosts: false,
      selectedPost: null,
      comments: [],
      loadingComments: false,
      form: {
        email: '',
        phone: '',
        message: '',
      },
      errors: {},
      submitting: false,
      editingComment: null,
      message: '',
      messageClass: '',
    };
  },
  computed: {
    isAuthenticated() {
      return this.authStore.isAuthenticated;
    },
  },
  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },
  mounted() {
    this.loadPosts();
  },
  methods: {
    async loadPosts(page = 1) {
      this.loadingPosts = true;
      try {
        const response = await getPosts(page);
        if (response.success) {
          this.posts = response.data;
          this.currentPage = response.currentPage;
          this.hasMorePosts = response.hasMore;
          this.setMessage(response.message, 'success-message');
        } else {
          this.setMessage(response.message, 'error-message');
        }
      } catch (error) {
        console.error(error);
        this.setMessage(error.message || 'Không thể tải bài viết.', 'error-message');
      } finally {
        this.loadingPosts = false;
      }
    },
    async selectPost(post) {
      this.selectedPost = post;
      this.comments = [];
      this.form = { email: '', phone: '', message: '' };
      this.editingComment = null;
      this.errors = {};
      await this.loadComments(post.id);
    },
    async loadComments(postId) {
      this.loadingComments = true;
      try {
        const response = await getCommentsByPost(postId);
        if (response.success) {
          this.comments = response.data;
          this.setMessage(response.message, 'success-message');
        } else {
          this.setMessage(response.message, 'error-message');
        }
      } catch (error) {
        console.error(error);
        this.setMessage(error.message || 'Không thể tải bình luận.', 'error-message');
      } finally {
        this.loadingComments = false;
      }
    },
    async submitComment() {
      this.submitting = true;
      this.errors = {};
      try {
        const commentData = {
          email: this.form.email,
          phone: this.form.phone,
          message: this.form.message,
          _: 'valid',
        };
        let response;
        if (this.editingComment) {
          response = await updateComment(this.selectedPost.id, this.editingComment.id, commentData);
          if (response.success) {
            this.comments = this.comments.map((c) =>
              c.id === response.data.id ? response.data : c
            );
            this.cancelEdit();
            this.setMessage(response.message, 'success-message');
          } else {
            this.setMessage(response.message, 'error-message');
            this.errors = response.errors || {};
          }
        } else {
          response = await createComment(this.selectedPost.id, commentData);
          if (response.success) {
            this.comments.unshift(response.data);
            this.form = { email: '', phone: '', message: '' };
            this.setMessage(response.message, 'success-message');
          } else {
            this.setMessage(response.message, 'error-message');
            this.errors = response.errors || {};
          }
        }
      } catch (error) {
        console.error(error);
        let message = error.message || 'Có lỗi xảy ra.';
        if (error.status === 0) {
          message = 'Lỗi CORS: Server không cho phép truy cập từ origin này. Vui lòng kiểm tra cấu hình backend.';
        } else if (error.status === 401) {
          message = 'Không có quyền truy cập. Vui lòng đăng nhập lại.';
        } else if (error.status === 422) {
          this.errors = error.errors || {};
        }
        this.setMessage(message, 'error-message');
      } finally {
        this.submitting = false;
      }
    },
    editComment(comment) {
      this.editingComment = comment;
      this.form = {
        email: comment.email,
        phone: comment.phone,
        message: comment.message,
      };
      this.errors = {};
    },
    cancelEdit() {
      this.editingComment = null;
      this.form = { email: '', phone: '', message: '' };
      this.errors = {};
    },
    async deleteComment(commentId) {
      if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return;
      try {
        const response = await deleteComment(this.selectedPost.id, commentId);
        if (response.success) {
          this.comments = this.comments.filter((c) => c.id !== commentId);
          this.setMessage(response.message, 'success-message');
        } else {
          this.setMessage(response.message, 'error-message');
        }
      } catch (error) {
        console.error(error);
        let message = error.message || 'Không thể xóa bình luận.';
        if (error.status === 0) {
          message = 'Lỗi CORS: Server không cho phép truy cập từ origin này. Vui lòng kiểm tra cấu hình backend.';
        } else if (error.status === 401) {
          message = 'Không có quyền truy cập. Vui lòng đăng nhập lại.';
        }
        this.setMessage(message, 'error-message');
      }
    },
    formatDate(date) {
      return date ? new Date(date).toLocaleString('vi-VN') : 'N/A';
    },
    setMessage(message, className) {
      this.message = message;
      this.messageClass = className;
      setTimeout(() => {
        this.message = '';
        this.messageClass = '';
      }, 3000);
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

h2 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
}

.success-message {
  background-color: #e6ffe6;
  color: #006600;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.error-message {
  background-color: #ffe6e6;
  color: #cc0000;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.posts-section {
  margin-bottom: 30px;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.post-item {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.post-item:hover {
  background-color: #ddebf0;
}

.post-item.selected {
  background-color: #a7d1f9;
}

.post-thumbnail {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 5px;
  margin-bottom: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}

.pagination button {
  padding: 10px 20px;
  background-color: #080606;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comments-section {
  margin-bottom: 30px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment-item {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.comment-content p {
  margin: 5px 0;
}

.comment-actions button {
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  color: #fff;
  cursor: pointer;
  margin-left: 10px;
}

.comment-actions button:first-child {
  background-color: #007bff;
}

.comment-actions button:last-child {
  background-color: #dc3545;
}

.form-section {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.form-group .error {
  color: #cc0000;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

.form-section button {
  padding: 10px 20px;
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.form-section button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.form-section .cancel-button {
  background-color: #6c757d;
  margin-left: 10px;
}

.loading,
.no-data {
  text-align: center;
  color: #666;
  margin: 20px 0;
}
</style>
