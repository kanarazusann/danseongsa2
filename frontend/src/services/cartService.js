const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok || data.rt !== 'OK') {
    throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
  }
  return data;
};

export const getCartItems = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/cart?userId=${userId}`, {
    method: 'GET',
    credentials: 'include'
  });
  return handleResponse(response);
};

export const addCartItem = async ({ userId, productId, quantity }) => {
  const response = await fetch(`${API_BASE_URL}/cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ userId, productId, quantity })
  });
  return handleResponse(response);
};

export const updateCartItemQuantity = async ({ cartId, userId, quantity }) => {
  const response = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ userId, quantity })
  });
  return handleResponse(response);
};

export const removeCartItem = async ({ cartId, userId }) => {
  const response = await fetch(`${API_BASE_URL}/cart/${cartId}?userId=${userId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  return handleResponse(response);
};

export const removeCartItems = async ({ userId, cartIds }) => {
  const response = await fetch(`${API_BASE_URL}/cart/bulk-delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ userId, cartIds })
  });
  return handleResponse(response);
};

