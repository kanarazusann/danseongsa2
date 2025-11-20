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
export const createProductPost = async (formData, productOptions, images, descriptionImages, sellerId) => {
  try {
    console.log('상품 등록 시작:', { 
      sellerId, 
      productOptionsCount: productOptions.length, 
      galleryImagesCount: images.length,
      descriptionImagesCount: descriptionImages?.length || 0
    });
    
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
    
    // 갤러리 이미지 파일들
    images.forEach((image) => {
      if (image.file) {
        submitData.append('images', image.file);
      }
    });

    // 상품 설명 이미지 파일들
    if (descriptionImages && descriptionImages.length > 0) {
      descriptionImages.forEach((image) => {
        if (image.file) {
          submitData.append('descriptionImages', image.file);
        }
      });
    }

    console.log('전송 데이터:', {
      postName: formData.postName,
      categoryName: formData.categoryName,
      gender: formData.gender,
      season: formData.season,
      status: formData.status,
      sellerId: sellerId,
      productsCount: productsData.length,
      imagesCount: images.length,
      descriptionImagesCount: descriptionImages?.length || 0
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

// 상품 게시물 상세 조회 (조회수 증가 포함)
export const getProductPostDetail = async (postId, userId) => {
  try {
    const params = new URLSearchParams();
    params.append('postId', postId);
    if (userId) {
      params.append('userId', userId);
    }

    const response = await fetch(`${API_BASE_URL}/productposts/detail?${params.toString()}`, {
      method: 'GET',
      credentials: 'include'
    });
    return handleResponse(response);
  } catch (error) {
    console.error('상품 상세 조회 오류:', error);
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

// 필터링된 상품 게시물 목록 조회
export const getFilteredProductPosts = async (filters) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.gender && filters.gender !== '전체') params.append('gender', filters.gender);
    if (filters.search) params.append('search', filters.search);
    if (filters.sort) params.append('sort', filters.sort);
    
    // 다중 선택 필터
    if (filters.colors && filters.colors.length > 0) {
      filters.colors.forEach(color => params.append('color', color));
    }
    if (filters.sizes && filters.sizes.length > 0) {
      filters.sizes.forEach(size => params.append('size', size));
    }
    if (filters.seasons && filters.seasons.length > 0) {
      filters.seasons.forEach(season => params.append('season', season));
    }
    
    const response = await fetch(`${API_BASE_URL}/productposts?${params.toString()}`, {
      method: 'GET',
      credentials: 'include'
    });
    return handleResponse(response);
  } catch (error) {
    console.error('필터링된 상품 조회 오류:', error);
    throw error;
  }
};

// 찜 추가
export const addWishlist = async (userId, postId) => {
  try {
    const params = new URLSearchParams();
    params.append('userId', userId);
    params.append('postId', postId);

    const response = await fetch(`${API_BASE_URL}/wishlist?${params.toString()}`, {
      method: 'POST',
      credentials: 'include'
    });
    return handleResponse(response);
  } catch (error) {
    console.error('찜 추가 오류:', error);
    throw error;
  }
};

// 찜 삭제
export const removeWishlist = async (userId, postId) => {
  try {
    const params = new URLSearchParams();
    params.append('userId', userId);
    params.append('postId', postId);

    const response = await fetch(`${API_BASE_URL}/wishlist?${params.toString()}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return handleResponse(response);
  } catch (error) {
    console.error('찜 삭제 오류:', error);
    throw error;
  }
};

// 찜목록 조회
export const getWishlist = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist?userId=${userId}`, {
      method: 'GET',
      credentials: 'include'
    });
    return handleResponse(response);
  } catch (error) {
    console.error('찜목록 조회 오류:', error);
    throw error;
  }
};

// 브랜드로 상품 게시물 목록 조회
export const getProductPostsByBrand = async (brand) => {
  try {
    const params = new URLSearchParams();
    params.append('brand', brand);
    
    const response = await fetch(`${API_BASE_URL}/productposts/by-brand?${params.toString()}`, {
      method: 'GET',
      credentials: 'include'
    });
    return handleResponse(response);
  } catch (error) {
    console.error('브랜드로 상품 조회 오류:', error);
    throw error;
  }
};

// 상품 게시물 수정
export const updateProductPost = async (postId, formData, productOptions, keptImageIds, newImages, mainImageIndex, keptDescriptionImageIds, newDescriptionImages) => {
  try {
    console.log('상품 수정 시작:', {
      postId,
      productOptionsCount: productOptions.length,
      keptImageIdsCount: keptImageIds?.length || 0,
      newImagesCount: newImages?.length || 0,
      keptDescriptionImageIdsCount: keptDescriptionImageIds?.length || 0,
      newDescriptionImagesCount: newDescriptionImages?.length || 0
    });
    
    // FormData 생성
    const submitData = new FormData();
    
    // 게시물 기본 정보
    submitData.append('postId', postId.toString());
    submitData.append('postName', formData.postName);
    submitData.append('description', formData.description || '');
    submitData.append('categoryName', formData.categoryName);
    submitData.append('material', formData.material || '');
    submitData.append('gender', formData.gender);
    submitData.append('season', formData.season);
    submitData.append('status', formData.status);
    
    // 상품 옵션 정보 (JSON으로 전송)
    const productsData = productOptions.map(option => ({
      productId: option.productId || null, // 기존 상품은 ID 유지, 새 상품은 null
      color: option.color,
      productSize: option.productSize,
      price: parseInt(option.price),
      discountPrice: option.discountPrice ? parseInt(option.discountPrice) : null,
      stock: parseInt(option.stock) || 0,
      status: option.status || 'SELLING'
    }));
    submitData.append('products', JSON.stringify(productsData));
    
    // 유지할 이미지 ID 목록 (JSON으로 전송)
    if (keptImageIds && keptImageIds.length > 0) {
      submitData.append('keptImageIds', JSON.stringify(keptImageIds));
    }
    
    // 새로운 갤러리 이미지 파일들
    if (newImages && newImages.length > 0) {
      newImages.forEach((image) => {
        if (image.file) {
          submitData.append('images', image.file);
        }
      });
    }
    
    // 대표 이미지 인덱스
    if (mainImageIndex !== null && mainImageIndex !== undefined) {
      submitData.append('mainImageIndex', mainImageIndex.toString());
    }
    
    // 유지할 상품 설명 이미지 ID 목록 (JSON으로 전송)
    if (keptDescriptionImageIds && keptDescriptionImageIds.length > 0) {
      submitData.append('keptDescriptionImageIds', JSON.stringify(keptDescriptionImageIds));
    }
    
    // 새로운 상품 설명 이미지 파일들
    if (newDescriptionImages && newDescriptionImages.length > 0) {
      newDescriptionImages.forEach((image) => {
        if (image.file) {
          submitData.append('descriptionImages', image.file);
        }
      });
    }
    
    console.log('전송 데이터:', {
      postId,
      postName: formData.postName,
      categoryName: formData.categoryName,
      gender: formData.gender,
      season: formData.season,
      status: formData.status,
      productsCount: productsData.length,
      keptImageIdsCount: keptImageIds?.length || 0,
      newImagesCount: newImages?.length || 0,
      mainImageIndex,
      keptDescriptionImageIdsCount: keptDescriptionImageIds?.length || 0,
      newDescriptionImagesCount: newDescriptionImages?.length || 0
    });
    
    // API 호출
    const response = await fetch(`${API_BASE_URL}/productposts`, {
      method: 'PUT',
      credentials: 'include',
      body: submitData
    });
    
    console.log('상품 수정 API 응답 상태:', response.status);
    return handleResponse(response);
  } catch (error) {
    console.error('상품 수정 오류:', error);
    throw error;
  }
};

// 상품 게시물 삭제
export const deleteProductPost = async (postId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/productposts/${postId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return handleResponse(response);
  } catch (error) {
    console.error('상품 삭제 오류:', error);
    throw error;
  }
};

