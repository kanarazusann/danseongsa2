const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const resolveImageUrl = (url = '') => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE}${url}`;
};

