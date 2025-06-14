<template>
  <nav class="menu">
    <div class="menubox">
      <ul>
        <li v-for="(item, index) in menuItems" :key="index">
          <router-link :to="item.link" class="menu-link">{{ item.name }}</router-link>
        </li>
      </ul>
    </div>

    <div class="right-section">
      <!-- Search -->
      <div class="search">
        <div class="search-icon" @click="toggleSearch">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2-KnEFXk9XQDENBtqNM7KWs445vaL43ogtg&s"
            alt="Search"
          />
        </div>
        <transition name="slide-fade">
          <div v-if="isSearchVisible" class="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm bài viết, danh mục, hoặc thẻ..."
              v-model="searchQuery"
              @keyup.enter="submitSearch"
            />
            <button @click="submitSearch" :disabled="!searchQuery.trim() || isLoading" class="search-button">
              Tìm
            </button>
            <div v-if="isLoading" class="loading">Đang tìm kiếm...</div>
          </div>
        </transition>
      </div>

      <!-- Account -->
      <div class="acout">
        <ul>
          <li v-if="!isAuthenticated">
            <router-link to="/login" class="menu-link login-button">ĐĂNG NHẬP</router-link>
          </li>
          <li v-else class="dropdown" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
            <button class="menu-link dropdown-toggle">
              TÀI KHOẢN
              <img
                v-if="avatarUrl"
                :src="avatarUrl"
                alt="Avatar"
                class="user-avatar"
              />
              <span v-else class="user-initial">👤</span>
            </button>
            <ul class="dropdown-menu" v-if="showDropdown">
              <li><router-link to="/profile" class="dropdown-link">Hồ sơ</router-link></li>
              <li><router-link to="/category" class="dropdown-link">Danh mục</router-link></li>
              <li><router-link to="/tags" class="dropdown-link">Thẻ</router-link></li>
              <li><router-link to="/manage-posts" class="dropdown-link">Quản lý bài viết</router-link></li>
              <li><router-link to="/manage-comments" class="dropdown-link">Quản lý comment</router-link></li>
              <li><router-link to="/managecontacts" class="dropdown-link">manageContacts</router-link></li>
              <li><button @click="logout" class="dropdown-link">Đăng xuất</button></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const menuItems = ref([
  { name: 'HOME', link: '/' },
  { name: 'BLOG', link: '/blog' },
  { name: 'ABOUT', link: '/about' },
  { name: 'CONTACT', link: '/contact' },
]);

const isSearchVisible = ref(false);
const searchQuery = ref('');
const isLoading = ref(false);
const showDropdown = ref(false);

const isAuthenticated = authStore.isAuthenticated;

const avatarUrl = computed(() => {
  const user = authStore.user;
  if (user?.avatar) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
    return `${baseUrl}${user.avatar.startsWith('/') ? '' : '/'}${user.avatar}`;
  }
  return null;
});

const toggleSearch = () => {
  isSearchVisible.value = !isSearchVisible.value;
  if (!isSearchVisible.value) {
    searchQuery.value = '';
  }
};

const submitSearch = () => {
  if (!searchQuery.value.trim()) return;
  isLoading.value = true;
  router.push({
    path: '/blog',
    query: { q: searchQuery.value.trim() },
  });
  isSearchVisible.value = false;
  searchQuery.value = '';
  isLoading.value = false;
};

const logout = async () => {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
  }
};
</script>

<style scoped>
.menu {
  background: #000;
  padding: 12px 10%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.menubox ul {
  list-style: none;
  display: flex;
  gap: 20px;
  margin: 0;
  padding: 0;
}

.menu-link {
  position: relative;
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  font-family: Arial, sans-serif;
  padding: 8px 16px;
  border: 2px solid transparent;
  border-radius: 30px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
}

.menu-link::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 0%;
  height: 2px;
  background-color: #f0a500;
  transition: width 0.3s ease;
}

.menu-link:hover {
  color: #f0a500;
  border-color: #f0a500;
  background-color: rgba(240, 165, 0, 0.1);
}

.menu-link:hover::after {
  width: 60%;
}

.router-link-active {
  color: #f0a500;
  border-color: #f0a500;
  background-color: rgba(240, 165, 0, 0.2);
}

.logout-button {
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  padding: 0;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  cursor: pointer;
}

.search-icon img {
  width: 22px;
  height: 22px;
  transition: transform 0.2s ease;
}

.search-icon:hover img {
  transform: scale(1.15);
}

.search-box {
  position: absolute;
  right: 0;
  top: 40px;
  background-color: #fff;
  padding: 6px 10px;
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  z-index: 10;
}

.search-box input {
  border: none;
  padding: 6px 10px;
  font-size: 14px;
  width: 200px;
  border-radius: 20px;
  outline: none;
}

.search-button {
  background: #f0a500;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  margin-left: 10px;
  transition: background 0.3s ease;
}

.search-button:hover {
  background: #d18e00;
}

.search-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading {
  font-size: 12px;
  color: #666;
  margin-left: 10px;
}

.acout ul {
  list-style: none;
  display: flex;
  gap: 16px;
  margin: 0;
  padding: 0;
}

.dropdown {
  position: relative;
}

.dropdown-toggle {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 30px;
  display: inline-flex;
  align-items: center;
}

.dropdown-menu {
  color: #fff;
  position: absolute;
  top: 100%;
  right: 0;
  background: #0c0000;
  border-radius: 8px;
  min-width: 150px;
  z-index: 1000;
  padding: 6px 0;
  display: flex;
  flex-direction: column;
}

.dropdown-menu li {
  display: block;
  width: 100%;
}

.dropdown-link {
  display: block;
  width: 100%;
  padding: 10px 16px;
  color: #ffffff;
  text-decoration: none;
  font-size: 14px;
  white-space: nowrap;
  transition: background 0.2s ease;
}

.dropdown-link:hover {
  background-color: #0e0a01;
  color: #fff;
  border: 1px solid gold;
  border-radius: 4px;
}

.login-button {
  background-color: #000;
  color: #fff;
  border: 2px solid #f0a500;
  border-radius: 30px;
  padding: 8px 16px;
  transition: all 0.3s ease;
}

.login-button:hover {
  background-color: #f0a500;
  color: #000;
}

.user-avatar {
  width: 28px;
  height: 28px;
  object-fit: cover;
  border-radius: 50%;
  margin-left: 8px;
  border: 1px solid #f0a500;
}

.user-initial {
  margin-left: 8px;
  font-size: 18px;
  color: #fff;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
