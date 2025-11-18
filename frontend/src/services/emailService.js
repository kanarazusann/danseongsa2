const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok || data.rt !== 'OK') {
    throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
  }
  return data;
};

export const requestEmailVerificationCode = async (email) => {
  const response = await fetch(`${API_BASE_URL}/auth/email/send-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ email })
  });

  const data = await handleResponse(response);
  return data.item; // { verificationId, expiresAt }
};

export const verifyEmailCode = async ({ email, verificationId, code }) => {
  const response = await fetch(`${API_BASE_URL}/auth/email/verify-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ email, verificationId, code })
  });

  return handleResponse(response);
};

