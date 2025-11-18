import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './ReviewWrite.css';

function ReviewWrite() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // location.state에서 전달받은 데이터 또는 예시 데이터
  const stateData = location.state || {};
  const productInfo = {
    productId: stateData.productId || 1,
    productName: stateData.productName || '클래식 오버핏 코트',
    productImage: stateData.productImage || 'https://via.placeholder.com/200x250/000000/FFFFFF?text=COAT',
    brand: stateData.brand || 'DANSUNGSA',
    orderNumber: stateData.orderNumber || 'ORD20250114-001'
  };
  
  // 리뷰 작성 상태
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  
  // 이미지 선택
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      alert('이미지는 최대 5개까지 업로드 가능합니다.');
      return;
    }
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages([...images, ...newImages]);
  };
  
  // 이미지 삭제
  const handleImageRemove = (index) => {
    URL.revokeObjectURL(images[index].preview);
    setImages(images.filter((_, i) => i !== index));
  };
  
  // 리뷰 작성
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }
    // TODO: API 호출
    console.log('리뷰 작성:', { rating, content, images });
    alert('리뷰가 작성되었습니다.');
    navigate('/mypage');
  };
  
  return (
    <div className="review-write">
      <div className="container">
        <h1 className="review-write-title">리뷰 작성</h1>
        
        {/* 상품 정보 */}
        <div className="product-info-section">
          <h2 className="section-title">주문 상품</h2>
          <div className="product-info-card">
            <Link to={`/product/${productInfo.productId}`} className="product-image-link">
              <img 
                src={productInfo.productImage} 
                alt={productInfo.productName}
                className="product-image"
              />
            </Link>
            <div className="product-details">
              <Link to={`/product/${productInfo.productId}`} className="product-name">
                {productInfo.productName}
              </Link>
              <p className="product-brand">{productInfo.brand}</p>
              <p className="order-number">주문번호: {productInfo.orderNumber}</p>
            </div>
          </div>
        </div>
        
        {/* 리뷰 작성 폼 */}
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
              onClick={() => navigate(-1)}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={!content.trim()}
            >
              리뷰 작성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReviewWrite;

