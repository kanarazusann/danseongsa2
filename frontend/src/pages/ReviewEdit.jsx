import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './ReviewWrite.css';
import { fetchSessionUser } from '../services/authService';
import { getReviewById, updateReview } from '../services/reviewService';
import { resolveImageUrl } from '../utils/image';

function ReviewEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // location.state에서 전달받은 데이터
  const stateData = location.state || {};
  const reviewId = stateData.reviewId;
  
  // 리뷰 상태
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingReview, setLoadingReview] = useState(true);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]); // { file?, preview, isExisting: boolean, imageUrl? }
  const [reviewData, setReviewData] = useState(null);
  
  // 세션에서 사용자 정보 가져오기
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const { item } = await fetchSessionUser();
        setUserId(item.userId);
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
        alert('로그인이 필요합니다.');
        navigate('/login');
      }
    };
    loadUserInfo();
  }, [navigate]);
  
  // 리뷰 데이터 로드
  useEffect(() => {
    const loadReview = async () => {
      if (!reviewId) {
        alert('리뷰 정보가 없습니다.');
        navigate('/mypage');
        return;
      }
      
      try {
        setLoadingReview(true);
        const response = await getReviewById(reviewId);
        
        if (response.rt === 'OK' && response.item) {
          const review = response.item;
          setReviewData(review);
          setRating(review.rating || 5);
          setContent(review.content || '');
          
          // 기존 이미지 로드
          if (review.images && review.images.length > 0) {
            const existingImages = review.images.map(img => ({
              isExisting: true,
              imageId: img.imageId, // 이미지 ID 저장 (유지할 이미지 식별용)
              imageUrl: img.imageUrl || img,
              preview: resolveImageUrl(img.imageUrl || img)
            }));
            setImages(existingImages);
          }
        } else {
          alert('리뷰를 찾을 수 없습니다.');
          navigate('/mypage');
        }
      } catch (error) {
        console.error('리뷰 로드 오류:', error);
        alert('리뷰를 불러오는 중 오류가 발생했습니다.');
        navigate('/mypage');
      } finally {
        setLoadingReview(false);
      }
    };
    
    if (reviewId) {
      loadReview();
    }
  }, [reviewId, navigate]);
  
  // 이미지 선택
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const currentNewImages = images.filter(img => !img.isExisting).length;
    
    if (currentNewImages + files.length > 5) {
      alert('이미지는 최대 5개까지 업로드 가능합니다.');
      return;
    }
    
    // 파일 크기 확인 (각 파일 최대 5MB)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('각 파일은 최대 5MB까지 업로드 가능합니다.');
      return;
    }
    
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isExisting: false
    }));
    setImages([...images, ...newImages]);
  };
  
  // 이미지 삭제
  const handleImageRemove = (index) => {
    const image = images[index];
    if (!image.isExisting && image.preview) {
      URL.revokeObjectURL(image.preview);
    }
    setImages(images.filter((_, i) => i !== index));
  };
  
  // 리뷰 수정
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }
    
    if (!userId) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    
    if (!reviewId) {
      alert('리뷰 정보가 없습니다.');
      return;
    }
    
    setLoading(true);
    
    try {
      // 유지할 기존 이미지 ID 목록 (isExisting이 true인 이미지)
      const keepImageIds = images
        .filter(img => img.isExisting && img.imageId)
        .map(img => img.imageId);
      
      // 새로 추가된 이미지만 필터링 (file이 있는 것만)
      const newImageFiles = images.filter(img => img.file && !img.isExisting);
      
      const reviewData = {
        userId,
        rating,
        content: content.trim(),
        images: newImageFiles,
        keepImageIds: keepImageIds
      };
      
      await updateReview(reviewId, reviewData);
      
      // 새 이미지 미리보기 URL 정리
      images.forEach(image => {
        if (!image.isExisting && image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
      
      alert('리뷰가 수정되었습니다.');
      navigate('/mypage', { state: { activeTab: 'reviews' } });
    } catch (error) {
      console.error('리뷰 수정 오류:', error);
      alert(error.message || '리뷰 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loadingReview) {
    return (
      <div className="review-write">
        <div className="container">
          <div className="loading">리뷰를 불러오는 중...</div>
        </div>
      </div>
    );
  }
  
  if (!reviewData) {
    return null;
  }
  
  // 상품 정보 구성
  const productInfo = {
    postId: reviewData.postId || stateData.postId,
    productName: reviewData.productName || stateData.productName || '',
    productImage: reviewData.productImage || stateData.productImage || '',
    brand: reviewData.brand || stateData.brand || '',
    orderNumber: reviewData.orderNumber || stateData.orderNumber || ''
  };
  
  return (
    <div className="review-write">
      <div className="container">
        <h1 className="review-write-title">리뷰 수정</h1>
        
        {/* 상품 정보 */}
        <div className="product-info-section">
          <h2 className="section-title">주문 상품</h2>
          <div className="product-info-card">
            <Link to={`/product/${productInfo.postId}`} className="product-image-link">
              <img 
                src={resolveImageUrl(productInfo.productImage)}
                alt={productInfo.productName}
                className="product-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/200x250/CCCCCC/666666?text=No+Image';
                }}
              />
            </Link>
            <div className="product-details">
              <Link to={`/product/${productInfo.postId}`} className="product-name">
                {productInfo.productName}
              </Link>
              {productInfo.brand && <p className="product-brand">{productInfo.brand}</p>}
              {productInfo.orderNumber && <p className="order-number">주문번호: {productInfo.orderNumber}</p>}
            </div>
          </div>
        </div>
        
        {/* 리뷰 수정 폼 */}
        <form onSubmit={handleSubmit} className="review-form">
          {/* 별점 선택 */}
          <div className="form-section">
            <label className="form-label">
              별점 <span className="required">*</span>
            </label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${star <= rating ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                  aria-label={`${star}점`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="rating-text">
              {rating === 5 && '매우 만족'}
              {rating === 4 && '만족'}
              {rating === 3 && '보통'}
              {rating === 2 && '불만족'}
              {rating === 1 && '매우 불만족'}
            </p>
          </div>
          
          {/* 리뷰 내용 */}
          <div className="form-section">
            <label htmlFor="review-content" className="form-label">
              리뷰 내용 <span className="required">*</span>
            </label>
            <textarea
              id="review-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="review-textarea"
              rows="8"
              placeholder="상품에 대한 솔직한 리뷰를 작성해주세요.&#10;다른 고객에게 도움이 되는 리뷰를 남겨주시면 감사하겠습니다."
              maxLength={1000}
            />
            <div className="character-count">
              {content.length} / 1000자
            </div>
          </div>
          
          {/* 이미지 업로드 */}
          <div className="form-section">
            <label className="form-label">
              사진 첨부 <span className="optional">(선택사항)</span>
            </label>
            <p className="form-hint">
              최대 5개까지 업로드 가능 (각 파일 최대 5MB)
            </p>
            
            {/* 이미지 미리보기 */}
            {images.length > 0 && (
              <div className="image-preview-grid">
                {images.map((image, index) => (
                  <div key={index} className="image-preview-item">
                    <img 
                      src={image.preview} 
                      alt={`미리보기 ${index + 1}`}
                      className="preview-image"
                    />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => handleImageRemove(index)}
                      aria-label="이미지 삭제"
                    >
                      ✕
                    </button>
                    {image.isExisting && (
                      <span className="existing-image-badge">기존 이미지</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* 이미지 업로드 버튼 */}
            {images.length < 5 && (
              <label className="image-upload-btn">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="image-input"
                />
                <span className="upload-icon">📷</span>
                <span className="upload-text">사진 추가</span>
              </label>
            )}
          </div>
          
          {/* 작성 가이드 */}
          <div className="review-guidelines">
            <h3 className="guidelines-title">리뷰 작성 가이드</h3>
            <ul className="guidelines-list">
              <li>상품과 관련된 내용만 작성해주세요.</li>
              <li>욕설, 비방, 광고성 내용은 삭제될 수 있습니다.</li>
              <li>사진은 실제 상품과 관련된 이미지만 업로드해주세요.</li>
              <li>리뷰는 수정 및 삭제가 가능합니다.</li>
            </ul>
          </div>
          
          {/* 버튼 */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate('/mypage', { state: { activeTab: 'reviews' } })}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={!content.trim() || loading}
            >
              {loading ? '수정 중...' : '리뷰 수정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReviewEdit;

