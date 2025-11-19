const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok || data.rt !== 'OK') {
    throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
  }
  return data;
};

export const createOrder = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  return handleResponse(response);
};

export const getOrderDetail = async (orderId, userId) => {
  const params = new URLSearchParams();
  params.append('userId', userId);
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}?${params.toString()}`, {
    method: 'GET',
    credentials: 'include'
  });
  return handleResponse(response);
};


