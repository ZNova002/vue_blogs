// src/services/settings.js
import api from './api';

export const getSettings = async () => {
  try {
    const response = await api.get('/api/settings');
    return response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Không thể lấy cài đặt');
  }
};
