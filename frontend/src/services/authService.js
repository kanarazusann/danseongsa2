const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok || data.rt !== 'OK') {
    throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
  }
  return data;
};

export const registerUser = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const login = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const logout = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  });

  return handleResponse(response);
};

export const fetchSessionUser = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/session`, {
    method: 'GET',
    credentials: 'include'
  });

  return handleResponse(response);
};

