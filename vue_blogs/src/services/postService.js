import api from './api';
import { getTagsByPostId } from './tagsService';
import { normalizeImageUrl, normalizeImageArray } from './utils';

// Chuẩn hóa dữ liệu bài viết
const normalizePost = (post) => {
  const category = post.category && post.category.id
    ? { id: post.category.id, name: post.category.name || 'Không xác định' }
    : post.category_id
      ? { id: post.category_id, name: 'Không xác định' }
      : null;

  return {
    id: post.id,
    title: post.title || '',
    slug: post.title ? post.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') : '',
    thumbnail: normalizeImageUrl(post.thumbnail),
    content: post.content || '',
    created_at: post.created_at || '',
    category_id: post.category_id || null,
    images: normalizeImageArray(post.images),
    category,
    tags: Array.isArray(post.tags)
      ? post.tags.map(tag => ({ id: tag.id, name: tag.name || '' }))
      : [],
  };
};

// Lấy danh sách bài viết
export const getPosts = async (page = 1) => {
  try {
    const response = await api.get('/api/posts', { params: { page } });
    const posts = Array.isArray(response.data.data)
      ? response.data.data
      : response.data.data || response.data.posts || [];

    const normalizedPosts = posts.map(normalizePost);

    return {
      success: true,
      data: normalizedPosts,
      last_page: response.data.last_page || 1,
      message: normalizedPosts.length ? 'Lấy bài viết thành công.' : 'Không tìm thấy bài viết.',
    };
  } catch (error) {
    return { success: false, data: [], last_page: 1, message: error.message || 'Không thể tải bài viết.' };
  }
};

// Lấy bài viết theo ID
export const getPostById = async (id) => {
  try {
    const response = await api.get(`/api/posts/${id}`, { headers: { 'Cache-Control': 'no-cache' } });
    let post = response.data;

    // Lấy tags
    const tagsResponse = await getTagsByPostId(id);
    post.tags = tagsResponse.data || [];

    const normalizedPost = normalizePost(post);

    return { success: true, data: normalizedPost, message: 'Lấy bài viết thành công.' };
  } catch (error) {
    return { success: false, data: null, message: error.message || 'Không thể tải bài viết.' };
  }
};

// Lấy bài viết liên quan
export const getRelatedPosts = async (postId) => {
  try {
    const response = await api.get(`/api/posts/${postId}/related`, { headers: { 'Cache-Control': 'no-cache' } });
    const posts = Array.isArray(response.data) ? response.data : [];
    const normalizedPosts = posts.map(normalizePost);
    return { success: true, data: normalizedPosts, message: 'Lấy bài viết liên quan thành công.' };
  } catch (error) {
    return { success: false, data: [], message: error.message || 'Không thể tải bài viết liên quan.' };
  }
};

// Tìm kiếm và lọc bài viết
export const searchPosts = async (params = {}, page = 1) => {
  try {
    const response = await api.get('/api/search', { params: { ...params, page } });
    const posts = response.data.data?.data || [];
    const normalizedPosts = posts.map(normalizePost);
    return {
      success: true,
      data: normalizedPosts,
      last_page: response.data.data?.last_page || 1,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      last_page: 1,
      message: error.response?.data?.message || 'Không thể tìm kiếm bài viết.'
    };
  }
};

// Điều hướng đến danh mục
export const goToCategory = (category, router) => {
  if (router && category?.name && category.name !== 'Không xác định') {
    router.push({ path: '/blog', query: { category: category.name } });
  }
};

// Điều hướng đến tag
export const goToTag = (tag, router) => {
  if (router && tag?.name) {
    router.push({ path: '/blog', query: { tags: tag.name } });
  }
};
