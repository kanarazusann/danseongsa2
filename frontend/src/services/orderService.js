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

// 사용자별 주문 목록 조회
export const getOrdersByUserId = async (userId) => {
  const params = new URLSearchParams();
  params.append('userId', userId);
  const response = await fetch(`${API_BASE_URL}/orders?${params.toString()}`, {
    method: 'GET',
    credentials: 'include'
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

export const getSellerOrders = async (sellerId) => {
  const params = new URLSearchParams();
  params.append('sellerId', sellerId);
  const response = await fetch(`${API_BASE_URL}/seller/orders?${params.toString()}`, {
    method: 'GET',
    credentials: 'include'
  });
  return handleResponse(response);
};

export const shipOrderItem = async (orderItemId, sellerId) => {
  const response = await fetch(`${API_BASE_URL}/seller/orders/${orderItemId}/ship`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ sellerId })
  });
  return handleResponse(response);
};

export const cancelOrderItemBySeller = async (orderItemId, sellerId) => {
  const response = await fetch(`${API_BASE_URL}/seller/orders/${orderItemId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ sellerId })
  });
  return handleResponse(response);
};

export const cancelOrderItem = async (orderItemId, userId) => {
  const response = await fetch(`${API_BASE_URL}/orders/items/${orderItemId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ userId })
  });
  return handleResponse(response);
};

export const requestRefund = async (orderItemId, userId) => {
  const response = await fetch(`${API_BASE_URL}/orders/items/${orderItemId}/refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ userId })
  });
  return handleResponse(response);
};

export const requestExchange = async (orderItemId, userId) => {
  const response = await fetch(`${API_BASE_URL}/orders/items/${orderItemId}/exchange`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ userId })
  });
  return handleResponse(response);
};

export const confirmOrderItem = async (orderItemId, userId) => {
  const response = await fetch(`${API_BASE_URL}/orders/items/${orderItemId}/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ userId })
  });
  return handleResponse(response);
};


