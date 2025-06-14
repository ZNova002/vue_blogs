import api from './api';

export const subscribe = async (email) => {
    try {
        const response = await api.post('api/subscribe', { email });
        return {
            success: true,
            data: response.data,
            message: response.data.message || 'Đăng ký nhận thông báo thành công!',
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            message: error.message || 'Đã có lỗi xảy ra khi đăng ký!',
        };
    }
};
