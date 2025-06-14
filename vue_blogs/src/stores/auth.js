import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
  }),

  actions: {
    async login(credentials) {
      try {
        const response = await api.post('api/auth/login', credentials);
        this.token = response.data.token;
        this.user = response.data.user;
        localStorage.setItem('token', this.token);
        return { success: true, message: 'Login successful' };
      } catch (error) {
        const message = error.response?.data?.error || 'Login failed. Please check your credentials.';
        console.error('Login failed:', message);
        throw error;
      }
    },

    async logout() {
      try {
        await api.post('api/auth/logout');
      } catch (error) {
        console.warn('Logout error:', error);
      } finally {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
      }
    },

    async fetchUser() {
      if (!this.token) return;
      try {
        const response = await api.get('api/auth/user');
        this.user = response.data;
      } catch (error) {
        console.warn('Fetch user failed, logging out');
        await this.logout();
        throw error;
      }
    },

    async fetchProfile() {
      try {
        const response = await api.get('/api/profile');
        this.user = response.data.data;
        return { success: true, data: this.user };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to fetch profile';
        return { success: false, message };
      }
    },

    async updateProfile(formData) {
      try {
        const response = await api.post('/api/profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        this.user = response.data.data;
        return { success: true, message: response.data.message, data: this.user };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to update profile';
        return { success: false, message };
      }
    },
  },

  getters: {
    isAuthenticated: (state) => !!state.token,
    getUser: (state) => state.user,
  },
});
