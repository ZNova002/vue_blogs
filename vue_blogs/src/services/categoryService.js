import api from './api';
import { normalizeImageUrl } from './utils';

const categoryService = {
  async getCategories() {
    try {
      const response = await api.get('/api/categories');
      const categories = Array.isArray(response.data) ? response.data : [];
      return {
        success: true,
        data: categories.map(category => ({
          id: category.id,
          name: category.name || '',
          slug: category.slug || category.name?.toLowerCase().replace(/\s+/g, '-') || '',
          image: normalizeImageUrl(category.image),
          description: category.description || '',
        })),
        message: categories.length ? 'Lấy danh mục thành công.' : 'Không có danh mục.',
      };
    } catch (error) {
      console.error('Get Categories Error:', error);
      return { success: false, data: [], message: error.message || 'Không thể tải danh mục.' };
    }
  },

  async getCategory(id) {
    try {
      const response = await api.get(`/api/categories/${id}`);
      const category = response.data.data || {};
      return {
        success: true,
        data: {
          id: category.id,
          name: category.name || '',
          slug: category.slug || category.name?.toLowerCase().replace(/\s+/g, '-') || '',
          image: normalizeImageUrl(category.image),
          description: category.description || '',
        },
      };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to fetch category' };
    }
  },

  async createCategory(formData) {
    try {
      const response = await api.post('/api/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const category = response.data.data || {};
      return {
        success: true,
        message: response.data.message,
        data: {
          id: category.id,
          name: category.name || '',
          slug: category.slug || category.name?.toLowerCase().replace(/\s+/g, '-') || '',
          image: normalizeImageUrl(category.image),
          description: category.description || '',
        },
      };
    } catch (error) {
      console.error('Create Category Error:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create category',
        errors: error.response?.data?.errors || {},
      };
    }
  },

  async updateCategory(id, formData) {
    try {
      // Use POST with _method=PUT for multipart/form-data
      const response = await api.post(`/api/categories/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const category = response.data.data || {};
      return {
        success: true,
        message: response.data.message,
        data: {
          id: category.id,
          name: category.name || '',
          slug: category.slug || category.name?.toLowerCase().replace(/\s+/g, '-') || '',
          image: normalizeImageUrl(category.image),
          description: category.description || '',
        },
      };
    } catch (error) {
      console.error('Update Category Error:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.message || `Failed to update category: ${error.message}`,
        errors: error.response?.data?.errors || {},
        status: error.response?.status || null,
      };
    }
  },

  async deleteCategory(id) {
    try {
      const response = await api.delete(`/api/categories/${id}`);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Delete Category Error:', error.response?.data || error);
      return { success: false, message: error.message || 'Failed to delete category' };
    }
  },
};

export const getCategories = categoryService.getCategories;
export default categoryService;
