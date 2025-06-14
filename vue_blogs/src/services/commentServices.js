import api from './api';

// Lấy danh sách bài viết
export const getPosts = async (page = 1) => {
    try {
        const response = await api.get(`api/posts?page=${page}`);
        const posts = response.data.data || [];
        return {
            success: true,
            data: posts.map(post => ({
                id: post.id,
                title: post.title,
                thumbnail: post.thumbnail || '',
            })),
            currentPage: response.data.current_page,
            hasMore: !!response.data.next_page_url,
            message: posts.length ? 'Lấy bài viết thành công.' : 'Không có bài viết.',
        };
    } catch (error) {
        return { success: false, data: [], message: error.message || 'Không thể tải bài viết.' };
    }
};

// Lấy danh sách bình luận của một bài viết
export const getCommentsByPost = async (postId) => {
    try {
        const response = await api.get(`api/posts/${postId}/comments`);
        const comments = response.data.data?.comments || [];
        return {
            success: true,
            data: comments.map(comment => ({
                id: comment.id,
                email: comment.email || '',
                phone: comment.phone || '',
                contact: comment.email || comment.phone || 'Ẩn danh',
                message: comment.message || '',
                date: comment.created_at || '',
            })),
            message: comments.length ? 'Lấy bình luận thành công.' : 'Không có bình luận.',
        };
    } catch (error) {
        return { success: false, data: [], message: error.response?.data?.message || 'Không thể tải bình luận.' };
    }
};

// Thêm bình luận mới
export const createComment = async (postId, commentData) => {
    try {
        const response = await api.post(`api/posts/${postId}/comments`, commentData);
        const comment = response.data.data;
        return {
            success: true,
            data: {
                id: comment.id,
                email: comment.email || '',
                phone: comment.phone || '',
                contact: comment.email || comment.phone || 'Ẩn danh',
                message: comment.message || '',
                date: comment.created_at || '',
            },
            message: 'Gửi bình luận thành công.',
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            message: error.response?.data?.message || 'Không thể gửi bình luận.',
            errors: error.response?.data?.errors || {},
        };
    }
};

// Cập nhật bình luận
export const updateComment = async (postId, commentId, commentData) => {
    try {
        const response = await api.put(`api/posts/${postId}/comments/${commentId}`, {
            ...commentData,
            _: 'valid',
        });
        const comment = response.data.data;
        return {
            success: true,
            data: {
                id: comment.id,
                email: comment.email || '',
                phone: comment.phone || '',
                contact: comment.email || comment.phone || 'Ẩn danh',
                message: comment.message || '',
                date: comment.created_at || '',
            },
            message: 'Cập nhật bình luận thành công.',
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            message: error.response?.data?.message || 'Không thể cập nhật bình luận.',
            errors: error.response?.data?.errors || {},
        };
    }
};

// Xóa bình luận
export const deleteComment = async (postId, commentId) => {
    try {
        await api.delete(`api/posts/${postId}/comments/${commentId}`);
        return {
            success: true,
            data: null,
            message: 'Xóa bình luận thành công.',
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            message: error.response?.data?.message || 'Không thể xóa bình luận.',
        };
    }
};
