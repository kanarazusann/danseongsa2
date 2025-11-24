const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// API 응답 처리
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok || data.rt !== 'OK') {
    throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
  }
  return data;
};

// 리뷰 작성
export const createReview = async (reviewData) => {
  try {
    const formData = new FormData();
    
    // 필수 파라미터
    formData.append('userId', reviewData.userId.toString());
    formData.append('postId', reviewData.postId.toString());
    formData.append('orderItemId', reviewData.orderItemId.toString());
    formData.append('rating', reviewData.rating.toString());
    formData.append('content', reviewData.content);
    
    // 선택 파라미터
    if (reviewData.productId) {
      formData.append('productId', reviewData.productId.toString());
    }
    
    // 이미지 파일들
    if (reviewData.images && reviewData.images.length > 0) {
      reviewData.images.forEach((image) => {
        if (image.file) {
          formData.append('images', image.file);
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('리뷰 작성 API 호출 오류:', error);
    throw error;
  }
};

// 게시물 ID로 리뷰 목록 조회
export const getReviewsByPostId = async (postId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews?postId=${postId}`, {
      method: 'GET',
      credentials: 'include'
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('리뷰 목록 조회 API 호출 오류:', error);
    throw error;
  }
};

// 사용자 ID로 리뷰 목록 조회
export const getReviewsByUserId = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews?userId=${userId}`, {
      method: 'GET',
      credentials: 'include'
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('리뷰 목록 조회 API 호출 오류:', error);
    throw error;
  }
};

// 판매자 ID로 리뷰 목록 조회
export const getReviewsBySellerId = async (sellerId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews?sellerId=${sellerId}`, {
      method: 'GET',
      credentials: 'include'
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('리뷰 목록 조회 API 호출 오류:', error);
    throw error;
  }
};

// 리뷰 ID로 조회
export const getReviewById = async (reviewId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'GET',
      credentials: 'include'
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('리뷰 조회 API 호출 오류:', error);
    throw error;
  }
};

// 리뷰 수정
export const updateReview = async (reviewId, reviewData) => {
  try {
    const formData = new FormData();
    
    formData.append('userId', reviewData.userId.toString());
    formData.append('rating', reviewData.rating.toString());
    formData.append('content', reviewData.content);
    
    // 유지할 기존 이미지 ID 목록
    if (reviewData.keepImageIds && reviewData.keepImageIds.length > 0) {
      reviewData.keepImageIds.forEach((imageId) => {
        formData.append('keepImageIds', imageId.toString());
      });
    }
    
    // 이미지 파일들 (새 이미지가 있는 경우)
    if (reviewData.images && reviewData.images.length > 0) {
      reviewData.images.forEach((image) => {
        if (image.file) {
          formData.append('images', image.file);
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('리뷰 수정 API 호출 오류:', error);
    throw error;
  }
};

// 리뷰 삭제
export const deleteReview = async (reviewId, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}?userId=${userId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('리뷰 삭제 API 호출 오류:', error);
    throw error;
  }
};

// 판매자 답글 작성/수정
export const addSellerReply = async (reviewId, sellerId, reply) => {
  try {
    const formData = new FormData();
    formData.append('sellerId', sellerId.toString());
    formData.append('reply', reply);
    
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/reply`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('답글 작성 API 호출 오류:', error);
    throw error;
  }
};

// 판매자 답글 삭제
export const deleteSellerReply = async (reviewId, sellerId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/reply?sellerId=${sellerId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('답글 삭제 API 호출 오류:', error);
    throw error;
  }
};

