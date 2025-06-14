import api from './api';

export const sendContactForm = async (formData) => {
    try {
        const response = await api.post('/api/contacts', {
            name: formData.name,
            email: formData.email,
            message: formData.comment,
        });
        return { success: true, data: response.data, message: 'Gửi liên hệ thành công.' };
    } catch (error) {
        return { success: false, data: null, message: error.message || 'Không thể gửi liên hệ.' };
    }
};

// Lấy danh sách liên hệ
export const getContacts = async () => {
  try {
    const response = await api.get('/api/contacts');
    return {
      success: true,
      data: response.data.contacts,
      message: 'Tải danh sách liên hệ thành công.',
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.message || 'Không thể tải danh sách liên hệ.',
    };
  }
};

// Lấy chi tiết liên hệ
export const getContact = async (id) => {
  try {
    const response = await api.get(`/api/contacts/${id}`);
    return {
      success: true,
      data: response.data.contact,
      message: 'Tải chi tiết liên hệ thành công.',
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.message || 'Không thể tải chi tiết liên hệ.',
    };
  }
};

// Xóa liên hệ
export const deleteContact = async (id) => {
  try {
    const response = await api.delete(`/api/contacts/${id}`);
    return {
      success: true,
      data: response.data,
      message: 'Xóa liên hệ thành công.',
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.message || 'Không thể xóa liên hệ.',
    };
  }
};
