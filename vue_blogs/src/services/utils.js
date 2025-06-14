export const normalizeImageUrl = (image, baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000') => {
    if (!image) return '';
    return image.startsWith('storage/') ? `${baseUrl.replace(/\/+$/, '')}/${image}` : image;
};

export const normalizeImageArray = (images, baseUrl) => {
  if (!Array.isArray(images)) return [];
  return images.map(image => normalizeImageUrl(image, baseUrl));
};
