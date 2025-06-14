<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-section">
          <h2 class="title">{{ title }}</h2>
          <p>{{ description }}</p>
        </div>

        <div class="footer-section">
          <h3>Liên kết nhanh</h3>
          <ul>
            <li v-for="link in quickLinks" :key="link.name">
              <a :href="link.url">{{ link.name }}</a>
            </li>
          </ul>
        </div>

        <div class="footer-section">
          <h3>Liên hệ</h3>
          <p v-for="line in contactLines" :key="line">{{ line.trim() }}</p>
        </div>

        <div class="footer-section">
          <h3>Theo dõi tôi</h3>
          <div class="social-icons">
            <a v-if="social.facebook.url" :href="social.facebook.url">
              <img :src="social.facebook.image" alt="Facebook" />
            </a>
            <a v-if="social.x.url" :href="social.x.url">
              <img :src="social.x.image" alt="X" />
            </a>
            <a v-if="social.instagram.url" :href="social.instagram.url">
              <img :src="social.instagram.image" alt="Instagram" />
            </a>
          </div>
          <div class="newsletter">
            <input v-model="subscribeEmail" type="email" placeholder="Email của bạn" />
            <button class="follow-btn" @click="handleSubscribe">Theo dõi</button>
            <p v-if="subscribeMessage" :class="subscribeSuccess ? 'success' : 'error'">
              {{ subscribeMessage }}
            </p>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>{{ copyright }}</p>
        <a href="#top" class="back-to-top">↑ Lên đầu trang</a>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { subscribe } from '../services/subscribeService';
import { getSettings } from '../services/settings';
import api from '../services/api';

const subscribeEmail = ref('');
const subscribeMessage = ref('');
const subscribeSuccess = ref(false);

const title = ref('MyBlog');
const description = ref('Chia sẻ kiến thức, kinh nghiệm và góc nhìn cá nhân về lập trình, công nghệ và cuộc sống.');
const quickLinks = ref([]);
const contact = ref('');
const contactLines = computed(() => contact.value ? contact.value.split('|').map(line => line.trim()) : []);
const social = ref({ facebook: {}, x: {}, instagram: {} });
const copyright = ref('© 2025 MyBlog. Bảo lưu mọi quyền.');

onMounted(async () => {
  try {
    const settings = await getSettings();
    const baseUrl = api.defaults.baseURL;
    title.value = settings.title || title.value;
    description.value = settings.footer_myblog || description.value;
    quickLinks.value = settings.quick_links || quickLinks.value;
    contact.value = settings.footer_contact || '';
    social.value = {
      facebook: {
        url: settings.social_facebook?.url || '',
        image: settings.social_facebook?.image ? `${baseUrl}${settings.social_facebook.image}` : ''
      },
      x: {
        url: settings.social_x?.url || '',
        image: settings.social_x?.image ? `${baseUrl}${settings.social_x.image}` : ''
      },
      instagram: {
        url: settings.social_instagram?.url || '',
        image: settings.social_instagram?.image ? `${baseUrl}${settings.social_instagram.image}` : ''
      }
    };
    copyright.value = settings.footer_copyright || copyright.value;
  } catch (error) {
    console.error('Lỗi khi lấy cài đặt:', error.message);
  }
});

const handleSubscribe = async () => {
  const result = await subscribe(subscribeEmail.value);
  subscribeMessage.value = result.message;
  subscribeSuccess.value = result.success;
  if (result.success) {
    subscribeEmail.value = '';
  }
};
</script>

<style scoped>
.footer {
  background-color: #111827;
  color: #e5e7eb;
  padding: 60px 0 30px;
  font-family: 'Segoe UI', sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 40px;
  margin-bottom: 30px;
}

.footer-section h2.title {
  font-size: 24px;
  color: #fff;
  margin-bottom: 10px;
}

.footer-section h3 {
  font-size: 18px;
  color: #fff;
  margin-bottom: 10px;
}

.footer-section p,
.footer-section a {
  font-size: 14px;
  color: #9ca3af;
  text-decoration: none;
  line-height: 1.6;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section li {
  margin: 5px 0;
}

.footer-section a:hover {
  color: #fff;
}

.social-icons {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.social-icons img {
  width: 28px;
  height: 28px;
  transition: transform 0.3s;
}

.social-icons img:hover {
  transform: scale(1.2);
}

.newsletter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 10px;
}

.newsletter input {
  padding: 8px;
  border: none;
  border-radius: 5px 0 0 5px;
  width: 160px;
}

.newsletter button {
  background: #6366f1;
  color: #fff;
  padding: 8px;
  border: none;
  border-radius: 0 5px 5px 0;
  cursor: pointer;
  width: 100px;
  text-align: center;
}

.newsletter button:hover {
  background: #4f46e5;
}

.success {
  color: green;
  margin-top: 10px;
  font-size: 14px;
  width: 100%;
}

.error {
  color: red;
  margin-top: 10px;
  font-size: 14px;
  width: 100%;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  border-top: 1px solid #1f2937;
  padding-top: 15px;
}

.back-to-top {
  color: #9ca3af;
  text-decoration: none;
}

.back-to-top:hover {
  color: #fff;
}
</style>
