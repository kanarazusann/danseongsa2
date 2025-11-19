const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// API 응답 처리
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok || data.rt !== 'OK') {
    throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
  }
  return data;
};

// 상품 게시물 등록
export const createProductPost = async (formData, productOptions, images, sellerId) => {
  try {
    console.log('상품 등록 시작:', { sellerId, productOptionsCount: productOptions.length, imagesCount: images.length });
    
    // FormData 생성
    const submitData = new FormData();
    
    // 게시물 기본 정보
    submitData.append('postName', formData.postName);
    submitData.append('description', formData.description || '');
    submitData.append('categoryName', formData.categoryName);
    submitData.append('brand', formData.brand || '');
    submitData.append('material', formData.material || '');
    submitData.append('gender', formData.gender);
    submitData.append('season', formData.season);
    submitData.append('status', formData.status);
    
    // 판매자 ID
    submitData.append('sellerId', sellerId.toString());
    
    // 상품 옵션 정보 (JSON으로 전송)
    const productsData = productOptions.map(option => ({
      color: option.color,
      productSize: option.productSize,
      price: parseInt(option.price),
      discountPrice: option.discountPrice ? parseInt(option.discountPrice) : null,
      stock: parseInt(option.stock) || 0,
      status: option.status || 'SELLING'
    }));
    submitData.append('products', JSON.stringify(productsData));
    
    // 이미지 파일들
    images.forEach((image) => {
      if (image.file) {
        submitData.append('images', image.file);
      }
    });

    console.log('전송 데이터:', {
      postName: formData.postName,
      categoryName: formData.categoryName,
      gender: formData.gender,
      season: formData.season,
      status: formData.status,
      sellerId: sellerId,
      productsCount: productsData.length,
      imagesCount: images.length
    });

    // API 호출
    const response = await fetch(`${API_BASE_URL}/productposts`, {
      method: 'POST',
      credentials: 'include',
      body: submitData
    });

    console.log('상품 등록 API 응답 상태:', response.status);
    return handleResponse(response);
  } catch (error) {
    console.error('상품 등록 오류:', error);
    throw error;
  }
};

// 모든 상품 게시물 목록 조회
export const getAllProductPosts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/productposts`, {
      method: 'GET',
      credentials: 'include'
    });
    return handleResponse(response);
  } catch (error) {
    console.error('상품 목록 조회 오류:', error);
    throw error;
  }
};

// 상품 게시물 ID로 조회
export const getProductPostById = async (postId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/productposts/detail?postId=${postId}`, {
      method: 'GET',
      credentials: 'include'
    });
    return handleResponse(response);
  } catch (error) {
    console.error('상품 조회 오류:', error);
    throw error;
  }
};

// 인기순 상품 게시물 목록 조회 (찜수 기준)
export const getPopularProductPosts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/productposts/popular`, {
      method: 'GET',
      credentials: 'include'
    });
    return handleResponse(response);
  } catch (error) {
    console.error('인기 상품 조회 오류:', error);
    throw error;
  }
};

// 최신순 상품 게시물 목록 조회 (생성일 기준)
export const getNewestProductPosts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/productposts/newest`, {
      method: 'GET',
      credentials: 'include'
    });
    return handleResponse(response);
  } catch (error) {
    console.error('최신 상품 조회 오류:', error);
    throw error;
  }
};

