<template>
  <div class="home">
    <Header />
    <!-- Danh mục chủ đề -->
    <section class="categories container">
      <h2>Các chủ đề</h2>
      <p v-if="loading" class="loading">Đang tải danh mục...</p>
      <p v-if="error" class="error">{{ error }}</p>
      <div class="category-grid" v-if="categories.length">
        <div v-for="item in categories" :key="item.id" class="category-item" @click="goToCategory(item)">
          <img :src="item.image || 'https://via.placeholder.com/200'" :alt="item.name" />
          <div class="category-overlay">
            <p>{{ item.name }}</p>
          </div>
        </div>
      </div>
      <p v-else class="no-categories">Không có danh mục nào.</p>
    </section>

    <!-- Danh sách bài viết mới nhất -->
    <section class="posts container">
      <h2>Các bài viết mới nhất</h2>
      <p v-if="loading" class="loading">Đang tải bài viết...</p>
      <p v-if="error" class="error">{{ error }}</p>
      <div class="post-grid" v-if="visiblePosts.length">
        <div v-for="post in visiblePosts" :key="post.id" class="post-item" @click="handlePostClick(post)">
          <img :src="post.thumbnail || 'https://via.placeholder.com/250'" :alt="post.title" />
          <div class="post-content">
            <h3>{{ post.title }}</h3>
            <p v-if="post.category" class="category">Danh mục: {{ post.category.name }}</p>
            <p v-if="post.tags.length" class="tags">Thẻ: {{ post.tags.map(tag => tag.name).join(", ") }}</p>
          </div>
        </div>
      </div>
      <p v-else class="no-posts">Không có bài viết nào.</p>
      <div class="load-more">
        <button @click="goToBlog">Xem thêm bài viết</button>
      </div>
    </section>
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getCategories } from '../services/categoryService';
import { getPosts } from '../services/postService';
import Header from '../components/HeaderView.vue';
import Footer from '../components/FooterView.vue';

const router = useRouter();
const categories = ref([]);
const posts = ref([]);
const loading = ref(false);
const error = ref(null);
const visibleCount = ref(3);

const visiblePosts = computed(() => posts.value.slice(0, visibleCount.value));

onMounted(async () => {
  try {
    loading.value = true;
    const categoriesResponse = await getCategories();
    categories.value = categoriesResponse.success ? categoriesResponse.data : [];
    error.value = categoriesResponse.success ? null : categoriesResponse.message;

    const postsResponse = await getPosts(1);
    posts.value = postsResponse.success
      ? postsResponse.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      : [];
    error.value = postsResponse.success ? null : postsResponse.message;
  } catch (err) {
    error.value = err.message || 'Không thể tải dữ liệu.';
  } finally {
    loading.value = false;
  }
});

const goToCategory = (category) => {
  router.push(`/blog?category=${encodeURIComponent(category.name.toLowerCase())}`);
};

const handlePostClick = (post) => {
  router.push(`/post/${post.id}`);
};

const goToBlog = () => {
  router.push('/blog');
};
</script>

<style scoped>
.home {
  min-height: 100vh;
  background-color: #f3f4f6;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}
.categories {
  padding: 40px 0;
  text-align: center;
}
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}
.category-item {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  cursor: pointer;
}
.category-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.category-item:hover img {
  transform: scale(1.1);
}
.category-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
}
.posts {
  padding: 40px 0;
  text-align: center;
}
.post-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}
.post-item {
  background: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.post-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}
.post-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}
.post-content {
  padding: 15px;
}
.post-content h3 {
  font-size: 18px;
  margin-bottom: 10px;
}
.category,
.tags {
  font-size: 14px;
  color: #666;
}
.load-more {
  margin-top: 20px;
}
.load-more button {
  background: #2563eb;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.load-more button:hover {
  background: #1e40af;
}
.loading,
.error,
.no-categories,
.no-posts {
  font-size: 18px;
  color: #777;
  margin-top: 20px;
}
</style>
