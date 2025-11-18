import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductDetail.css';
import { fetchSessionUser } from '../services/authService';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWished, setIsWished] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [sessionUser, setSessionUser] = useState(null);

  // TODO: API 연동 필요
  // DB: Product + ProductImage + Category 조인
  // SELECT p.*, c.brand, c.material, c.color, c.size, c.gender, c.season, c.categoryName,
  //        pi.imageUrl, pi.isMain
  // FROM Product p
  // LEFT JOIN Category c ON p.categoryId = c.categoryId
  // LEFT JOIN ProductImage pi ON p.productId = pi.productId
  // WHERE p.productId = ? AND p.status = 'SELLING'
  
  // 페이지 로드 시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchSessionUser();
        setSessionUser(data.item);
      } catch {
        setSessionUser(null);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    // 임시 데이터 (실제로는 API에서 가져옴)
    const fetchProduct = async () => {
      setLoading(true);
      
      // 임시 상품 데이터
      const mockProduct = {
        productId: parseInt(id),
        productName: '클래식 오버핏 코트',
        brand: 'DANSUNGSA',
        price: 89000,
        discountPrice: null,
        viewCount: 1250,
        status: 'SELLING',
        categoryName: '아우터 코트',
        gender: 'UNISEX',
        color: 'black',
        size: 'L',
        material: 'wool',
        season: 'FALL',
        description: '미니멀한 디자인으로 완성된 클래식 오버핏 코트입니다. 고급스러운 소재와 완벽한 핏으로 어떤 스타일에도 잘 어울립니다.',
        images: [
          { imageId: 1, imageUrl: 'https://via.placeholder.com/800x1000/000000/FFFFFF?text=COAT+1', isMain: true },
          { imageId: 2, imageUrl: 'https://via.placeholder.com/800x1000/FFFFFF/000000?text=COAT+2', isMain: false },
          { imageId: 3, imageUrl: 'https://via.placeholder.com/800x1000/000000/FFFFFF?text=COAT+3', isMain: false },
          { imageId: 4, imageUrl: 'https://via.placeholder.com/800x1000/FFFFFF/000000?text=COAT+4', isMain: false },
        ],
        availableSizes: ['S', 'M', 'L', 'XL'],
        sellerId: 1,
        sellerName: '단성사 스토어',
        createdAt: '2025-01-10',
        reviews: [
          { 
            reviewId: 1, 
            userId: 1, 
            userName: '김**', 
            rating: 5, 
            content: '정말 만족스러운 상품입니다. 품질도 좋고 디자인도 깔끔해요!', 
            createdAt: '2025-01-12',
            images: [
              'https://via.placeholder.com/300x300/000000/FFFFFF?text=Review+1',
              'https://via.placeholder.com/300x300/FFFFFF/000000?text=Review+2'
            ]
          },
          { 
            reviewId: 2, 
            userId: 2, 
            userName: '이**', 
            rating: 4, 
            content: '가격 대비 괜찮은 것 같아요. 사이즈는 생각보다 크게 나왔네요.', 
            createdAt: '2025-01-11',
            images: [
              'https://via.placeholder.com/300x300/CCCCCC/000000?text=Review+3'
            ]
          },
        ]
      };

      // 조회수 증가 (실제로는 API 호출)
      // await fetch(`/api/products/${id}/view`, { method: 'POST' });

      setProduct(mockProduct);
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  // 수량 증가
  const handleQuantityIncrease = () => {
    setQuantity(prev => prev + 1);
  };

  // 수량 감소
  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // 찜하기 토글
  // TODO: API 연동 필요
  // POST /api/wishlist 또는 DELETE /api/wishlist/:productId
  const ensureLoggedIn = () => {
    if (!sessionUser) {
      navigate('/login');
      return false;
    }
    return true;
  };

  const handleWishToggle = () => {
    if (!ensureLoggedIn()) {
      return;
    }
    setIsWished(prev => !prev);
    // TODO: API 호출
  };

  // 장바구니 추가
  // TODO: API 연동 필요
  // POST /api/cart
  // Body: { productId, quantity, size }
  const handleAddToCart = () => {
    if (!ensureLoggedIn()) {
      return;
    }

    if (!selectedSize) {
      alert('사이즈를 선택해주세요.');
      return;
    }

    // TODO: API 호출
    alert('장바구니에 추가되었습니다.');
  };

  // 바로 구매
  const handleBuyNow = () => {
    if (!ensureLoggedIn()) {
      return;
    }

    if (!selectedSize) {
      alert('사이즈를 선택해주세요.');
      return;
    }

    // 주문 페이지로 이동
    navigate('/order', {
      state: {
        selectedItems: [{
          productId: product.productId,
          productName: product.productName,
          productImage: product.images[0].imageUrl,
          price: product.price,
          discountPrice: product.discountPrice,
          quantity: quantity,
          size: selectedSize
        }]
      }
    });
  };

  if (loading) {
    return (
      <div className="product-detail">
        <div className="container">
          <div className="loading">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail">
        <div className="container">
          <div className="empty-state">
            <p>상품을 찾을 수 없습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice !== null && product.discountPrice !== undefined;
  const discountRate = hasDiscount 
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0;

  const genderText = product.gender === 'MEN' ? '남성' : product.gender === 'WOMEN' ? '여성' : '공용';
  const seasonText = {
    'SPRING': '봄',
    'SUMMER': '여름',
    'FALL': '가을',
    'WINTER': '겨울',
    'ALL_SEASON': '사계절'
  }[product.season] || product.season;

  const colorText = {
    'black': '블랙',
    'white': '화이트',
    'navy': '네이비',
    'gray': '그레이',
    'red': '레드'
  }[product.color] || product.color;

  return (
    <div className="product-detail">
      <div className="container">
        <div className="product-detail-content">
          {/* 상품 이미지 섹션 */}
          <div className="product-images">
            <div className="main-image">
              <img 
                src={product.images[selectedImageIndex]?.imageUrl || product.images[0]?.imageUrl} 
                alt={product.productName}
              />
            </div>
            <div className="thumbnail-images">
              {product.images.map((image, index) => (
                <button
                  key={image.imageId}
                  className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img src={image.imageUrl} alt={`${product.productName} ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* 상품 정보 섹션 */}
          <div className="product-info">
            <div className="product-header">
              <p className="product-brand">{product.brand}</p>
              <h1 className="product-name">{product.productName}</h1>
              <div className="product-meta">
                <span className="view-count">조회수 {product.viewCount.toLocaleString()}</span>
                <span className="category-name">{product.categoryName}</span>
              </div>
            </div>

            <div className="product-price-section">
              {hasDiscount && (
                <div className="discount-badge">
                  {discountRate}% 할인
                </div>
              )}
              <div className="price-wrapper">
                {hasDiscount && (
                  <span className="original-price">{product.price.toLocaleString()}원</span>
                )}
                <span className="final-price">{displayPrice.toLocaleString()}원</span>
              </div>
            </div>

            <div className="product-details">
              <div className="detail-row">
                <span className="detail-label">성별</span>
                <span className="detail-value">{genderText}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">컬러</span>
                <span className="detail-value">{colorText}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">소재</span>
                <span className="detail-value">{product.material}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">계절</span>
                <span className="detail-value">{seasonText}</span>
              </div>
            </div>

            {/* 사이즈 선택 */}
            <div className="size-selection">
              <div className="size-label">
                <span>사이즈</span>
                <span className="size-guide-link">사이즈 가이드</span>
              </div>
              <div className="size-options">
                {product.availableSizes.map(size => (
                  <button
                    key={size}
                    className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* 수량 선택 */}
            <div className="quantity-selection">
              <span className="quantity-label">수량</span>
              <div className="quantity-controls">
                <button 
                  className="quantity-btn"
                  onClick={handleQuantityDecrease}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.max(1, val));
                  }}
                  min="1"
                  className="quantity-input"
                />
                <button 
                  className="quantity-btn"
                  onClick={handleQuantityIncrease}
                >
                  +
                </button>
              </div>
            </div>

            {/* 총 금액 */}
            <div className="total-price-section">
              <span className="total-label">총 상품금액</span>
              <span className="total-price">
                {(displayPrice * quantity).toLocaleString()}원
              </span>
            </div>

            {/* 액션 버튼 */}
            <div className="product-actions">
              <button 
                className={`btn-wish ${isWished ? 'active' : ''}`}
                onClick={handleWishToggle}
                title="찜하기"
              >
                {isWished ? '❤️' : '🤍'}
              </button>
              <button 
                className="btn-cart"
                onClick={handleAddToCart}
              >
                장바구니
              </button>
              <button 
                className="btn-buy"
                onClick={handleBuyNow}
              >
                바로 구매
              </button>
            </div>

            {/* 판매자 정보 */}
            <div className="seller-info">
              <span className="seller-label">판매자</span>
              <button 
                className="seller-name-link"
                onClick={() => navigate(`/seller?sellerId=${product.sellerId || 1}`)}
              >
                {product.sellerName}
              </button>
            </div>
          </div>
        </div>

        {/* 상품 설명 섹션 */}
        <div className="product-description">
          <h2 className="section-title">상품 설명</h2>
          <div className="description-content">
            <p>{product.description}</p>
            {/* TODO: 상세 이미지 추가 */}
            <div className="detail-images">
              {product.images.map((image, index) => (
                <img 
                  key={image.imageId} 
                  src={image.imageUrl} 
                  alt={`${product.productName} 상세 ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 리뷰 섹션 */}
        <div className="product-reviews">
          <div className="reviews-header">
            <h2 className="section-title">리뷰</h2>
            <div className="reviews-summary">
              <span className="average-rating">
                평점: {product.reviews.length > 0 
                  ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
                  : '0.0'}
              </span>
              <span className="reviews-count">({product.reviews.length}개)</span>
            </div>
          </div>

          {product.reviews.length === 0 ? (
            <div className="no-reviews">
              <p>아직 리뷰가 없습니다.</p>
            </div>
          ) : (
            <div className="reviews-list">
              {product.reviews.map(review => (
                <div key={review.reviewId} className="review-item">
                  <div className="review-header">
                    <div className="review-user">
                      <span className="user-name">{review.userName}</span>
                      <div className="review-rating">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                    </div>
                    <span className="review-date">{review.createdAt}</span>
                  </div>
                  {review.images && review.images.length > 0 && (
                    <div className="review-images">
                      {review.images.map((imageUrl, index) => (
                        <img 
                          key={index}
                          src={imageUrl} 
                          alt={`${review.userName} 리뷰 이미지 ${index + 1}`}
                          className="review-image"
                        />
                      ))}
                    </div>
                  )}
                  <p className="review-content">{review.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
