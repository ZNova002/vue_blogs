import api from './api';

/**
 * Gửi dữ liệu để tạo bài viết mới.
 * @param {FormData} postData - Dữ liệu bài viết (title, content, category_id, thumbnail, images, content_images, tags)
 * @returns {Promise<Object>} - { success: boolean, data?: Object, message?: string }
 */
export async function createPost(postData) {
  try {
    const response = await api.post('/api/posts', postData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return {
      success: true,
      data: response.data.post,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Lỗi khi tạo bài viết',
      errors: error.response?.data?.errors,
    };
  }
}

/**
 * Lấy danh sách danh mục từ API.
 * @returns {Promise<Array>} - Danh sách danh mục
 * @throws {Error} - Nếu có lỗi khi gọi API
 */
export async function getCategories() {
  try {
    const response = await api.get('/api/categories');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi tải danh mục');
  }
}

/**
 * Lấy danh sách tag từ API.
 * @returns {Promise<Array>} - Danh sách tags
 * @throws {Error} - Nếu có lỗi khi gọi API
 */
export async function getTags() {
  try {
    const response = await api.get('/api/tags');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi tải tags');
  }
}

/**
 * Lấy danh sách bài viết từ API.
 * @param {number} page - Trang hiện tại
 * @returns {Promise<Object>} - Danh sách bài viết
 */
export async function getPosts(page = 1) {
  try {
    const response = await api.get(`/api/posts?page=${page}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi tải danh sách bài viết');
  }
}

/**
 * Xóa bài viết theo ID.
 * @param {number} postId - ID của bài viết
 * @returns {Promise<Object>} - Kết quả xóa
 */
export async function deletePost(postId) {
  try {
    const response = await api.delete(`/api/posts/${postId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi xóa bài viết');
  }
}

/**
 * Lấy thông tin bài viết theo ID.
 * @param {number} postId - ID của bài viết
 * @returns {Promise<Object>} - Thông tin bài viết
 */
export async function getPost(postId) {
  try {
    const response = await api.get(`/api/posts/${postId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi tải bài viết');
  }
}

/**
 * Cập nhật bài viết.
 * @param {number} postId - ID của bài viết
 * @param {FormData} postData - Dữ liệu bài viết
 * @returns {Promise<Object>} - Kết quả cập nhật
 */
export async function updatePost(postId, postData) {
  try {
    const response = await api.post(`/api/posts/${postId}`, postData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return {
      success: true,
      data: response.data.post,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Lỗi khi cập nhật bài viết',
      errors: error.response?.data?.errors,
    };
  }
}
