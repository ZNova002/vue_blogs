<template>
  <Header />
  <main class="about-page">
    <h1 class="about-title">Hành Trình Của Hai Kẻ Lang Thang Với Trái Tim Không Yên</h1>
    <p class="about-subtitle">GIỚI THIỆU VỀ CHUNG TÔI</p>

    <div v-if="about?.thumbnail">
      <img :src="about.thumbnail" alt="Ảnh hoàng hôn" class="about-image" />
    </div>

    <div class="about-content">
      <div v-if="about?.content" v-html="sanitizedContent"></div>
      <p v-else class="error">Chưa có nội dung cho trang này.</p>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="loading">Đang tải...</p>
  </main>
  <Footer />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getAboutPage } from '../services/aboutService';
import Header from '../components/HeaderView.vue';
import Footer from '../components/FooterView.vue';
import DOMPurify from 'dompurify';

const about = ref(null);
const error = ref(null);
const loading = ref(false);

onMounted(async () => {
  try {
    loading.value = true;
    const response = await getAboutPage();
    if (response.success) {
      about.value = response.data;
    } else {
      error.value = response.message;
    }
  } catch (err) {
    error.value = err.message || 'Không thể tải nội dung About.';
  } finally {
    loading.value = false;
  }
});

const sanitizedContent = computed(() => (
  about.value?.content ? DOMPurify.sanitize(about.value.content) : ''
));
</script>

<style scoped>
.about-page {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
  color: #333;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  overflow: hidden;
  z-index: 1;
  backdrop-filter: blur(6px);
  opacity: 0;
  animation: fadeIn 1s forwards;
}

.about-page::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: url('https://source.unsplash.com/1600x900/?travel,nature');
  background-size: cover;
  background-position: center;
  z-index: -1;
  filter: brightness(0.5) blur(4px);
}

.about-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #2e4a3c;
}

.about-subtitle {
  font-size: 14px;
  color: gray;
  margin-bottom: 30px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.about-image {
  width: 100%;
  max-width: 800px;
  height: auto;
  border-radius: 6px;
  margin: 20px auto;
  transition: transform 0.3s ease-in-out;
}


.about-content {
  text-align: left;
  font-size: 16px;
  line-height: 1.8;
  padding: 0 10px;
  color: #222;
}

.about-content p {
  margin-bottom: 20px;
}

.error {
  color: red;
  font-weight: bold;
  text-align: center;
  margin-top: 20px;
}

.loading {
  font-size: 16px;
  color: #777;
  margin-top: 20px;
}

@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}
</style>
