import api from './api';
import { normalizeImageUrl, normalizeImageArray } from './utils';

export const getAboutPage = async () => {
    try {
        const response = await api.get('/api/about');
        const about = response.data;
        return {
            success: true,
            data: {
                ...about,
                thumbnail: normalizeImageUrl(about.thumbnail),
                images: normalizeImageArray(about.images),
            },
            message: 'Lấy trang About thành công.',
        };
    } catch (error) {
        return { success: false, data: null, message: error.message || 'Không thể tải nội dung About.' };
    }
};

export const updateAboutPage = async (data) => {
    try {
        await api.post('/api/about/update', data);
        return { success: true, data: null, message: 'Cập nhật trang About thành công.' };
    } catch (error) {
        return { success: false, data: null, message: error.message || 'Không thể cập nhật nội dung.' };
    }
};
