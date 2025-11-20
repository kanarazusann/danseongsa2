const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok || data.rt !== 'OK') {
    throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
  }
  return data;
};

export const confirmPayment = async (payload) => {
  console.log('결제 확인 요청:', JSON.stringify(payload, null, 2));
  const response = await fetch(`${API_BASE_URL}/payments/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  console.log('결제 확인 응답:', data);
  if (!response.ok || data.rt !== 'OK') {
    throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
  }
  return data;
};


