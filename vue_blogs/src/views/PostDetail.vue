<template>
  <Header />
  <div class="container">
    <div class="main-content">
      <h1 v-if="post.title" class="post-title">{{ post.title }}</h1>
      <p v-if="post.created_at" class="post-subtitle">Đăng ngày {{ formatDate(post.created_at) }}</p>
      <img v-if="post.thumbnail" class="post-image" :src="post.thumbnail" :alt="post.title || 'Thumbnail'" />
      <div v-if="post.content" class="post-body" v-html="sanitizedContent"></div>

      <div class="comment-form">
        <h3>Để lại bình luận</h3>
        <input v-model="commentInfo.email" type="email" placeholder="Email" />
        <input v-model="commentInfo.phone" type="text" placeholder="Số điện thoại" />
        <textarea v-model="commentInfo.message" rows="4" placeholder="Nội dung bình luận"></textarea>
        <button @click="submitComment">Gửi</button>
      </div>

      <div v-if="comments.length" class="comment-list">
        <h3>Bình luận</h3>
        <div v-for="(comment, index) in comments" :key="index" class="comment-item">
          <p class="comment-meta">📧 {{ comment.contact }} - 🕒 {{ formatDate(comment.date) }}</p>
          <p class="comment-message">{{ comment.message }}</p>
        </div>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="loading" class="loading">Đang tải...</p>
    </div>

    <aside class="sidebar">
      <div class="widget category-widget">
        <h3 class="widget-title">Danh mục</h3>
        <ul class="widget-list">
          <li
            v-if="category?.name && category.name !== 'Không xác định'"
            class="widget-item clickable"
            @click="goToCategory(category, router)"
          >
            📘 {{ category.name }}
          </li>
          <li v-else class="widget-item">Không có danh mục</li>
        </ul>
      </div>

      <div class="widget tag-widget">
        <h3 class="widget-title">Thẻ</h3>
        <ul class="widget-list">
          <li v-for="tag in tags" :key="tag.id" class="widget-item clickable" @click="goToTag(tag, router)">
            🏷️ {{ tag.name }}
          </li>
          <li v-if="!tags.length" class="widget-item">Không có thẻ</li>
        </ul>
      </div>

      <div class="widget subscribe-widget">
        <h3 class="widget-title">Nhận bài viết</h3>
        <div class="subscribe-form">
          <input v-model="subscribeEmail" type="email" placeholder="Email của bạn" />
          <button class="follow-btn" @click="handleSubscribe">Theo dõi</button>
        </div>
        <p v-if="subscribeMessage" :class="subscribeSuccess ? 'success' : 'error'">
          {{ subscribeMessage }}
        </p>
      </div>

      <div class="widget related-posts-widget">
        <h3 class="widget-title">Bài viết liên quan</h3>
        <ul v-if="relatedPosts.length" class="widget-list">
          <li v-for="related in relatedPosts" :key="related.id" class="widget-item">
            <router-link :to="`/post/${related.id}`" class="link-item">📝 {{ related.title }}</router-link>
          </li>
        </ul>
        <p v-else class="widget-item">Không có bài viết liên quan</p>
      </div>
    </aside>
  </div>
  <Footer />
</template>
<script setup>
import { ref } from 'vue';
import { goToCategory, goToTag } from '../services/postService';
import { subscribe } from '../services/subscribeService';
import usePostDetail from '../scripts/PostDetail.js';
import Header from '../components/HeaderView.vue';
import Footer from '../components/FooterView.vue';

const { post, category, relatedPosts, tags, error, loading, comments, commentInfo, submitComment, sanitizedContent, formatDate, router } =
  usePostDetail();

const subscribeEmail = ref('');
const subscribeMessage = ref('');
const subscribeSuccess = ref(false);

const handleSubscribe = async () => {
  const result = await subscribe(subscribeEmail.value);
  subscribeMessage.value = result.message;
  subscribeSuccess.value = result.success;
  if (result.success) {
    subscribeEmail.value = '';
  }
};
</script>

<style scoped src="../assets/post-detail.css"></style>
