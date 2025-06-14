import api from './api';

// Helper để lấy error message từ Axios
const getError = (error) => {
    if (error.response) {
        return {
            message: error.response.data.message || 'Có lỗi xảy ra.',
            errors: error.response.data.errors || {},
        };
    }
    return {
        message: error.message || 'Lỗi không xác định.',
        errors: {},
    };
};

export const getAllTags = async () => {
    try {
        const response = await api.get('/api/tags');
        const tags = Array.isArray(response.data.data ?? response.data) ? (response.data.data || response.data) : [];
        return {
            success: true,
            data: tags.map(tag => ({ id: tag.id, name: tag.name || '' })),
            message: tags.length ? 'Lấy danh sách tag thành công.' : 'Không có tag.',
        };
    } catch (error) {
        const err = getError(error);
        return {
            success: false,
            data: [],
            message: err.message,
        };
    }
};

export const getTagsByPostId = async (postId) => {
    try {
        const response = await api.get(`/api/posts/${postId}/tags`);
        const tags = Array.isArray(response.data.data ?? response.data) ? (response.data.data || response.data) : [];
        return {
            success: true,
            data: tags.map(tag => ({ id: tag.id, name: tag.name || '' })),
            message: tags.length ? 'Lấy tag thành công.' : 'Không có tag.',
        };
    } catch (error) {
        const err = getError(error);
        return {
            success: false,
            data: [],
            message: err.message,
        };
    }
};

export const createTag = async (name) => {
    try {
        const response = await api.post('/api/tags', { name });
        return {
            success: true,
            data: response.data.tag ?? response.data.data ?? null,
            message: response.data.message || 'Tạo tag thành công.',
        };
    } catch (error) {
        const err = getError(error);
        return {
            success: false,
            message: err.message,
            errors: err.errors,
        };
    }
};

export const updateTag = async (id, name) => {
    try {
        const response = await api.put(`/api/tags/${id}`, { name });
        return {
            success: true,
            data: response.data.tag ?? response.data.data ?? null,
            message: response.data.message || 'Cập nhật tag thành công.',
        };
    } catch (error) {
        const err = getError(error);
        return {
            success: false,
            message: err.message,
            errors: err.errors,
        };
    }
};

export const deleteTag = async (id) => {
    try {
        const response = await api.delete(`/api/tags/${id}`);
        return {
            success: true,
            message: response.data.message || 'Xóa tag thành công.',
        };
    } catch (error) {
        const err = getError(error);
        return {
            success: false,
            message: err.message,
        };
    }
};
