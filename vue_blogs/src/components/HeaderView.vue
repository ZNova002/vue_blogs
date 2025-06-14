<template>
  <header class="header-top">
    <!-- Top bar -->
    <div class="top-bar">
      <div class="left-info">
        <p class="underline-text">ỦY BAN NHÂN DÂN<br />THÀNH PHỐ HỒ CHÍ MINH</p><br />
        <p class="underline-text bold-text">SỞ GIÁO DỤC VÀ ĐÀO TẠO</p>
      </div>
      <div class="right-info">
        <p>
          GVHD: PHẠM ĐẰNG PHƯƠNG<br />
          SVTH: TRẦN PHƯỚC TOÀN<br />
          TRỊNH HOÀNG TRỌNG PHÚC
        </p>
      </div>
    </div>

    <!-- Header main -->
    <div class="header-main">
      <div class="title">
        <h2>{{ title }}</h2>
      </div>
      <div class="logo">
        <img
          src="https://i0.wp.com/vienatec.edu.vn/wp-content/uploads/2020/06/unnamed-e1592452667362.png?w=394&ssl=1"
          alt="Logo"
        />
      </div>
      <div class="subtitle">
        <h2>{{ subtitle }}</h2>
      </div>
    </div>

    <!-- Banner -->
    <div class="banner">
      <!-- Avatar tròn bên trái căn giữa -->
      <div class="banner-avatar">
        <img :src="bannerAvatar" alt="Avatar" />
      </div>

      <!-- Hình banner nền chuyển động -->
      <div
        class="banner-image"
        :style="{ backgroundImage: `url(${currentImage})` }"
      ></div>

      <!-- Text động theo route -->
      <div v-if="route.path === '/'" class="banner-text"><h2>HOME</h2></div>
      <div v-else-if="route.path === '/blog'" class="banner-text"><h2>BLOG</h2></div>
      <div v-else-if="route.path === '/about'" class="banner-text"><h2>ABOUT</h2></div>
      <div v-else-if="route.path === '/contact'" class="banner-text"><h2>CONTACT</h2></div>
    </div>

    <!-- Navigation -->
    <Navigation />
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import Navigation from './NavigationView.vue';
import { getSettings } from '../services/settings';
import api from '../services/api';

const title = ref('CAO ĐẲNG KINH TẾ THÀNH PHỐ HỒ CHÍ MINH');
const subtitle = ref('Đồ án: Blog cá nhân');
const route = useRoute();
const images = ref([]);
const bannerAvatar = ref('');
const currentImage = ref('');
let currentIndex = 0;
let intervalId = null;

onMounted(async () => {
  try {
    const settings = await getSettings();
    const baseUrl = api.defaults.baseURL;
    bannerAvatar.value = settings.logo ? `${baseUrl}${settings.logo}` : '';
    images.value = [
      settings.banner1 ? `${baseUrl}${settings.banner1}` : '',
      settings.banner2 ? `${baseUrl}${settings.banner2}` : '',
      settings.banner3 ? `${baseUrl}${settings.banner3}` : ''
    ].filter(Boolean);
    currentImage.value = images.value[0] || '';
  } catch (error) {
    console.error('Lỗi khi lấy cài đặt:', error.message);
  }

  intervalId = setInterval(() => {
    if (images.value.length > 0) {
      currentIndex = (currentIndex + 1) % images.value.length;
      currentImage.value = images.value[currentIndex];
    }
  }, 4000);
});

onBeforeUnmount(() => {
  clearInterval(intervalId);
});
</script>

<style scoped>
.header-top {
  background: #fff;
  color: #000;
  position: relative;
  text-align: center;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  font-size: 12px;
  color: #000;
}

.left-info, .right-info {
  line-height: 1.3;
}

.underline-text {
  position: relative;
  display: inline-block;
  font-size: 12px;
  font-weight: bold;
}

.underline-text.bold-text {
  margin-top: 1px;
}

.underline-text.bold-text::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -3px;
  width: 100%;
  height: 1px;
  background-color: black;
}

.title h2, .subtitle h2 {
  font-size: 20px;
  font-weight: bold;
  margin: 0 20px;
}

.logo img {
  width: 80px;
  height: auto;
}

.banner {
  position: relative;
  width: 100%;
  height: 150px;
  overflow: hidden;
}

.banner-image {
  width: 100%;
  height: 150px;
  background-size: cover;
  background-position: center;
  transition: background-image 1s ease-in-out;
}

.banner-avatar {
  position: absolute;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  z-index: 2;
}

.banner-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid white;
  object-fit: cover;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

.banner-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 28px;
  font-weight: bold;
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.8);
}
</style>
