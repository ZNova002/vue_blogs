<template>
  <Header />
  <div class="edit-profile-container">
    <h1 class="edit-profile-title">Edit Your Profile</h1>

    <div v-if="loading" class="loading-text">Loading...</div>
    <div v-else-if="error" class="error-box">{{ error }}</div>

    <form v-else @submit.prevent="updateProfile" class="edit-profile-form">
      <!-- Avatar -->
      <div class="form-group avatar-group">
        <div class="avatar-preview">
          <img
            v-if="form.avatarPreview || avatarUrl"
            :src="form.avatarPreview || avatarUrl"
            alt="Avatar"
          />
          <div v-else class="no-avatar">No Image</div>
        </div>
        <div class="avatar-input">
          <input type="file" accept="image/*" @change="handleAvatarChange" />
        </div>
      </div>

      <!-- Name -->
      <div class="form-group">
        <label for="name" class="form-label">Name</label>
        <input v-model="form.name" type="text" id="name" required />
      </div>

      <!-- Email -->
      <div class="form-group">
        <label for="email" class="form-label">Email</label>
        <input v-model="form.email" type="email" id="email" required />
      </div>

      <!-- Password -->
      <div class="form-group">
        <label for="password" class="form-label">New Password</label>
        <input v-model="form.password" type="password" id="password" />
      </div>

      <!-- Confirm Password -->
      <div class="form-group">
        <label for="password_confirmation" class="form-label">Confirm Password</label>
        <input v-model="form.password_confirmation" type="password" id="password_confirmation" />
      </div>

      <!-- Address -->
      <div class="form-group">
        <label for="address" class="form-label">Address</label>
        <input v-model="form.address" type="text" id="address" />
      </div>

      <!-- Phone Number -->
      <div class="form-group">
        <label for="phone_number" class="form-label">Phone Number</label>
        <input v-model="form.phone_number" type="text" id="phone_number" />
      </div>

      <!-- Success message -->
      <div v-if="success" class="success-box">{{ success }}</div>

      <!-- Submit -->
      <button type="submit" :disabled="submitting">
        {{ submitting ? 'Updating...' : 'Update Profile' }}
      </button>
    </form>
  </div>
 <Footer />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import Header from '@/components/HeaderView.vue'
import Footer from '@/components/FooterView.vue'

const authStore = useAuthStore();
const loading = ref(true);
const error = ref(null);
const success = ref(null);
const submitting = ref(false);

const form = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  address: '',
  phone_number: '',
  avatar: null,
  avatarPreview: null,
});

const user = ref({});

const avatarUrl = computed(() => {
  if (user.value.avatar) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
    return `${baseUrl}${user.value.avatar.startsWith('/') ? '' : '/'}${user.value.avatar}`;
  }
  return null;
});

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    error.value = 'Please log in to view your profile';
    loading.value = false;
    return;
  }
  const result = await authStore.fetchProfile();
  if (result.success) {
    user.value = authStore.user;
    form.value = {
      name: user.value.name || '',
      email: user.value.email || '',
      password: '',
      password_confirmation: '',
      address: user.value.address || '',
      phone_number: user.value.phone_number || '',
      avatar: null,
      avatarPreview: null,
    };
  } else {
    error.value = result.message || 'Failed to load profile';
  }
  loading.value = false;
});

const handleAvatarChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    form.value.avatar = file;
    form.value.avatarPreview = URL.createObjectURL(file);
  }
};

const updateProfile = async () => {
  submitting.value = true;
  success.value = null;
  error.value = null;

  const formData = new FormData();
  formData.append('name', form.value.name);
  formData.append('email', form.value.email);
  if (form.value.password) {
    formData.append('password', form.value.password);
    formData.append('password_confirmation', form.value.password_confirmation);
  }
  formData.append('address', form.value.address);
  formData.append('phone_number', form.value.phone_number);
  if (form.value.avatar) {
    formData.append('avatar', form.value.avatar);
  }

  const result = await authStore.updateProfile(formData);
  if (result.success) {
    success.value = result.message;
    form.value.avatarPreview = null;
    form.value.avatar = null;
    user.value = result.data;
  } else {
    error.value = result.message || 'Failed to update profile';
  }
  submitting.value = false;
};
</script>

<style>
.edit-profile-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 24px;
  font-family: Arial, sans-serif;
}

.edit-profile-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.loading-text {
  text-align: center;
  color: #777;
}

.error-box {
  background-color: #ffe5e5;
  color: #c00;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.success-box {
  background-color: #e1fce1;
  color: #2e7d32;
  padding: 12px;
  border-radius: 6px;
  margin-top: 12px;
}

.edit-profile-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  margin-bottom: 6px;
  font-weight: 500;
  color: #444;
}

input[type="text"],
input[type="email"],
input[type="password"],
input[type="file"] {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 15px;
}

input[type="file"] {
  padding: 6px;
}

button {
  background-color: #007bff;
  color: white;
  padding: 12px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

button:disabled {
  background-color: #888;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

.avatar-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-preview img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ddd;
}

.no-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 13px;
}

</style>
