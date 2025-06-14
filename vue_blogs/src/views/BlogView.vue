<template>
  <div class="blog-wrapper">
    <Header />
    <main class="blog-page">
      <h1 class="blog-title">Các bài viết</h1>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="isLoading" class="loading">Đang tải...</p>

      <!-- Bộ lọc -->
      <div class="filter-section">
        <div class="filter-group">
          <label for="category">Danh mục:</label>
          <select v-model="filters.category" id="category">
            <option value="">Tất cả</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.name"
            >
              {{ category.name }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label for="tags">Thẻ (cách nhau bởi dấu phẩy):</label>
          <input
            v-model="filters.tags"
            id="tags"
            placeholder="Ví dụ: du lịch, View chụp hình"
          />
        </div>
        <div class="filter-group">
          <label for="start_date">Từ ngày:</label>
          <input v-model="filters.start_date" id="start_date" type="date" />
        </div>
        <div class="filter-group">
          <label for="end_date">Đến ngày:</label>
          <input v-model="filters.end_date" id="end_date" type="date" />
        </div>
        <button @click="applyFilters" :disabled="isLoading">Áp dụng</button>
        <button @click="resetFilters" :disabled="isLoading">Xóa bộ lọc</button>
      </div>

      <!-- Danh sách bài viết -->
      <p class="blog-subtitle">{{ pageTitle }}</p>

      <div
        v-if="visiblePosts.length > 0"
        :class="['blog-grid', { 'single-post': visiblePosts.length === 1 }]"
      >
        <div
          v-for="post in visiblePosts"
          :key="post.id"
          class="blog-card"
          @click="navigateToPost(post)"
        >
          <img
            :src="post.thumbnail || 'https://via.placeholder.com/160'"
            :alt="post.title"
            class="blog-image"
          />
          <div class="blog-content">
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="category">
              Danh mục: {{ post.category?.name || 'Không xác định' }}
            </p>
            <p v-if="post.tags.length" class="tags">
              Thẻ: {{ post.tags.map(tag => tag.name).join(', ') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Nếu không có bài viết -->
      <p v-if="visiblePosts.length === 0" class="no-posts">
        {{ error || 'Không có bài viết phù hợp.' }}
      </p>

      <!-- Tải thêm -->
      <div v-if="hasMoreVisiblePosts" class="load-more">
        <button @click="loadMoreVisible" :disabled="isLoading">
          Tải thêm
        </button>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { searchPosts } from '../services/postService';
import { getCategories } from '../services/categoryService';
import Header from '../components/HeaderView.vue';
import Footer from '../components/FooterView.vue';

const router = useRouter();
const route = useRoute();

const posts = ref([]);
const categories = ref([]);
const isLoading = ref(false);
const error = ref(null);
const currentPage = ref(1);

const filters = ref({
  category: '',
  tags: '',
  start_date: '',
  end_date: '',
  q: ''
});

const postsPerPage = 6;
const visibleCount = ref(postsPerPage);

const categoryFilter = computed(() => {
  const queryCategory = route.query.category || '';
  return (
    categories.value.find(
      cat => cat.name.toLowerCase() === queryCategory.toLowerCase()
    )?.name || ''
  );
});

const searchQuery = computed(() => route.query.q || '');

const pageTitle = computed(() => {
  if (searchQuery.value) return `Kết quả tìm kiếm: "${searchQuery.value}"`;
  const activeCategory = filters.value.category || categoryFilter.value;
  return activeCategory
    ? activeCategory
    : filters.value.tags
    ? `Thẻ: ${filters.value.tags}`
    : 'Tất cả chủ đề';
});

const visiblePosts = computed(() => posts.value.slice(0, visibleCount.value));
const hasMoreVisiblePosts = computed(() => visibleCount.value < posts.value.length);

const fetchPosts = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    posts.value = [];

    const params = {
      q: searchQuery.value,
      category: categoryFilter.value || filters.value.category,
      tags: filters.value.tags || route.query.tags,
      start_date: filters.value.start_date || route.query.start_date,
      end_date: filters.value.end_date || route.query.end_date
    };

    let page = 1;
    let allPosts = [];
    let keepFetching = true;

    while (keepFetching) {
      const response = await searchPosts(params, page);

      if (response.success) {
        allPosts.push(...response.data);
        page++;
        keepFetching = page <= (response.last_page || 1);
      } else {
        error.value = response.message;
        keepFetching = false;
      }
    }

    posts.value = allPosts;
    visibleCount.value = postsPerPage;

    if (posts.value.length === 0) {
      error.value = 'Không có bài viết phù hợp.';
    }

  } catch (err) {
    error.value = err.message || 'Không thể tải dữ liệu.';
    posts.value = [];
  } finally {
    isLoading.value = false;
  }
};


const fetchCategories = async () => {
  try {
    const response = await getCategories();
    categories.value = response.success ? response.data : [];
    if (!response.success) error.value = response.message;
  } catch (err) {
    error.value = err.message || 'Không thể tải danh mục.';
  }
};

const applyFilters = async () => {
  currentPage.value = 1;
  await fetchPosts();
  router.push({
    path: '/blog',
    query: {
      q: searchQuery.value || undefined,
      category: filters.value.category || undefined,
      tags: filters.value.tags || undefined,
      start_date: filters.value.start_date || undefined,
      end_date: filters.value.end_date || undefined
    }
  });
};

const resetFilters = async () => {
  filters.value = { category: '', tags: '', start_date: '', end_date: '', q: '' };
  currentPage.value = 1;
  await fetchPosts();
  router.push('/blog');
};

const loadMoreVisible = () => {
  visibleCount.value = posts.value.length;
};

const navigateToPost = post => {
  router.push(`/post/${post.id}`);
};

onMounted(async () => {
  await fetchCategories();
  filters.value = {
    category: categoryFilter.value,
    tags: route.query.tags || '',
    start_date: route.query.start_date || '',
    end_date: route.query.end_date || '',
    q: searchQuery.value
  };
  await fetchPosts();
});

watch([categoryFilter, searchQuery], () => {
  currentPage.value = 1;
  filters.value = {
    category: categoryFilter.value,
    tags: route.query.tags || '',
    start_date: route.query.start_date || '',
    end_date: route.query.end_date || '',
    q: searchQuery.value
  };
  fetchPosts();
});
</script>


<style scoped>
.blog-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.blog-page {
  flex: 1;
  padding: 40px 20px;
  background-color: #f4f4f4;
  text-align: center;
}
.blog-title {
  font-size: 32px;
  font-weight: bold;
}
.blog-subtitle {
  font-size: 20px;
  color: #555;
  margin-bottom: 40px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.filter-section {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin-bottom: 30px;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.filter-group label {
  font-size: 14px;
  font-weight: bold;
}
.filter-group select,
.filter-group input {
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 200px;
}
.filter-section button {
  background: #2563eb;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  align-self: flex-end;
  margin-left: 10px;
}
.filter-section button:hover {
  background: #1e40af;
}
.filter-section button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 40px;
  max-width: 1400px;
  margin: 0 auto;
  justify-content: center;
}
.blog-grid.single-post {
  grid-template-columns: 1fr;
  max-width: 700px;
}
.blog-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  min-width: 300px;
}
.blog-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
}
.blog-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
.blog-content {
  padding: 20px;
  text-align: left;
}
.post-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 12px;
}
.category {
  font-size: 14px;
  color: #666;
  font-weight: bold;
}
.tags {
  font-size: 14px;
  color: #666;
  font-style: italic;
}
.no-posts,
.loading,
.error {
  font-size: 18px;
  color: #777;
  margin-top: 30px;
}
.load-more {
  margin-top: 30px;
  text-align: center;
}
.load-more button {
  background: #2563eb;
  color: #fff;
  font-size: 16px;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}
.load-more button:hover {
  background: #1e40af;
}
.load-more button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
