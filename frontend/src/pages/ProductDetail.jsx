import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductDetail.css';
import { fetchSessionUser } from '../services/authService';
import {
  getProductPostDetail,
  addWishlist,
  removeWishlist
} from '../services/productService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const reviewSamples = [
  {
    reviewId: 1,
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
    userName: '이**',
    rating: 4,
    content: '가격 대비 괜찮은 것 같아요. 사이즈는 생각보다 크게 나왔네요.',
    createdAt: '2025-01-11',
    images: [
      'https://via.placeholder.com/300x300/CCCCCC/000000?text=Review+3'
    ]
  }
];

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sessionUser, setSessionUser] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [detail, setDetail] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [descriptionImages, setDescriptionImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [wishCount, setWishCount] = useState(0);
  const [isWished, setIsWished] = useState(false);
  const [loading, setLoading] = useState(true);

  // 페이지 진입 시 스크롤 최상단
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // 세션 사용자 로드
  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchSessionUser();
        setSessionUser(data.item);
      } catch {
        setSessionUser(null);
      } finally {
        setSessionChecked(true);
      }
    };
    loadUser();
  }, []);

  const resolveImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
    return `${API_BASE_URL}/${url}`;
  };

  const loadDetail = useCallback(async () => {
      setLoading(true);
    try {
      const response = await getProductPostDetail(id, sessionUser?.userId);
      const item = response.item;
      setDetail(item);

      const galleries = item.galleryImages || [];
      setGalleryImages(galleries);
      setDescriptionImages(item.descriptionImages || []);

      const mainIndex = Math.max(
        galleries.findIndex(img => img.isMain === 1),
        0
      );
      setSelectedImageIndex(mainIndex >= 0 ? mainIndex : 0);

      setWishCount(item.wishCount || 0);
      setIsWished(item.isWished || false);

      const defaultColor = item.colors && item.colors.length > 0 ? item.colors[0] : '';
      setSelectedColor(defaultColor);
      setSelectedSize('');
      setQuantity(1);
    } catch (error) {
      console.error('상품 상세 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  }, [id, sessionUser?.userId]);

  useEffect(() => {
    if (!sessionChecked) return;
    loadDetail();
  }, [sessionChecked, loadDetail]);

  const colors = detail?.colors || [];
  const categoryName = detail?.categoryName || '';
  const isShoesCategory = categoryName.startsWith('신발');
  const isBagOrAccessory = categoryName.startsWith('가방') || categoryName.startsWith('패션소품');
  const isSellerUser = sessionUser && Number(sessionUser.isSeller) === 1;

  const colorProducts = useMemo(() => {
    if (!detail || !selectedColor) return [];
    return (detail.products || []).filter(product => product.color === selectedColor);
  }, [detail, selectedColor]);

  const sizeOptions = useMemo(() => {
    if (!detail || !selectedColor || isBagOrAccessory) return [];
    const rawSizes = colorProducts.map(product => product.productSize).filter(Boolean);
    const uniqueSizes = [...new Set(rawSizes)];
    if (isShoesCategory) {
      return uniqueSizes.filter(size => /^\d+$/.test(size));
    }
    return uniqueSizes;
  }, [detail, selectedColor, colorProducts, isBagOrAccessory, isShoesCategory]);

  useEffect(() => {
    if (sizeOptions.length > 0) {
      if (!selectedSize || !sizeOptions.includes(selectedSize)) {
        setSelectedSize(sizeOptions[0]);
      }
    } else {
      setSelectedSize('');
    }
  }, [sizeOptions]);

  const selectedProduct = useMemo(() => {
    if (!detail || !selectedColor) return null;
    if (sizeOptions.length === 0) {
      return colorProducts[0] || null;
    }
    if (!selectedSize) return null;
    return colorProducts.find(product => product.productSize === selectedSize) || null;
  }, [detail, selectedColor, selectedSize, sizeOptions, colorProducts]);

  useEffect(() => {
    setQuantity(1);
  }, [selectedProduct]);

  const basePrice = selectedProduct ? selectedProduct.price : detail?.minPrice;
  const baseDiscountPrice = selectedProduct ? selectedProduct.discountPrice : detail?.minDiscountPrice;
  const effectivePrice = baseDiscountPrice ?? basePrice ?? 0;
  const hasDiscount = baseDiscountPrice != null;
  const discountRate = hasDiscount && basePrice
    ? Math.round((1 - (baseDiscountPrice / basePrice)) * 100)
    : 0;

  const maxQuantity = selectedProduct ? selectedProduct.stock || 1 : 1;

  const ensureCustomerAvailable = () => {
    if (!sessionUser) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return false;
    }
    if (isSellerUser) {
      alert('판매자 계정은 해당 기능을 사용할 수 없습니다.');
      return false;
    }
    return true;
  };

  const ensureSelectionValid = () => {
    if (colors.length > 0 && !selectedColor) {
      alert('색상을 선택해주세요.');
      return false;
    }
    if (sizeOptions.length > 0 && !selectedSize) {
      alert('사이즈를 선택해주세요.');
      return false;
    }
    if (!selectedProduct) {
      alert('선택한 옵션의 상품 정보를 찾을 수 없습니다.');
      return false;
    }
    return true;
  };

  const handleWishToggle = async () => {
    if (!sessionUser) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    if (isSellerUser) {
      return;
    }

    const prevWished = isWished;
    const prevCount = wishCount;
    const optimisticCount = prevWished ? Math.max(0, prevCount - 1) : prevCount + 1;
    setIsWished(!prevWished);
    setWishCount(optimisticCount);

    try {
      if (prevWished) {
        const response = await removeWishlist(sessionUser.userId, detail.postId);
        setWishCount(response.wishCount ?? optimisticCount);
        setDetail(prev => prev ? { ...prev, wishCount: response.wishCount ?? optimisticCount } : prev);
      } else {
        const response = await addWishlist(sessionUser.userId, detail.postId);
        setWishCount(response.wishCount ?? optimisticCount);
        setDetail(prev => prev ? { ...prev, wishCount: response.wishCount ?? optimisticCount } : prev);
      }
    } catch (error) {
      console.error('찜 처리 중 오류:', error);
      alert('찜 처리 중 오류가 발생했습니다.');
    }
  };

  const handleQuantityDecrease = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const handleQuantityIncrease = () => {
    setQuantity(prev => Math.min(maxQuantity, prev + 1));
  };

  const handleAddToCart = () => {
    if (!ensureCustomerAvailable()) return;
    if (!ensureSelectionValid()) return;

    const cartItem = {
      postId: detail.postId,
      productId: selectedProduct.productId,
      postName: detail.postName,
      imageUrl: resolveImageUrl(galleryImages[selectedImageIndex]?.imageUrl || detail.mainImageUrl),
      color: selectedColor,
      productSize: selectedProduct.productSize,
      price: selectedProduct.price,
      discountPrice: selectedProduct.discountPrice,
      quantity
    };

    navigate('/cart', { state: { newItem: cartItem } });
  };

  const handleBuyNow = () => {
    if (!ensureCustomerAvailable()) return;
    if (!ensureSelectionValid()) return;

    const orderItem = {
      postId: detail.postId,
      productId: selectedProduct.productId,
      postName: detail.postName,
      imageUrl: resolveImageUrl(galleryImages[selectedImageIndex]?.imageUrl || detail.mainImageUrl),
      color: selectedColor,
      productSize: selectedProduct.productSize,
      price: selectedProduct.price,
      discountPrice: selectedProduct.discountPrice,
      quantity
    };

    navigate('/order', { state: { selectedItems: [orderItem] } });
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

  if (!detail) {
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

  const genderText = detail.gender === 'MEN'
    ? '남성'
    : detail.gender === 'WOMEN'
      ? '여성'
      : '공용';

  const seasonText = {
    SPRING: '봄',
    SUMMER: '여름',
    FALL: '가을',
    WINTER: '겨울',
    ALL_SEASON: '사계절'
  }[detail.season] || detail.season;

  const getColorLabel = (color) => {
    const map = {
      black: '블랙',
      white: '화이트',
      navy: '네이비',
      gray: '그레이',
      red: '레드',
      green: '그린',
      beige: '베이지',
      brown: '브라운',
      blue: '블루'
    };
    return map[color?.toLowerCase()] || color;
  };

  const mainImageUrl = resolveImageUrl(
    galleryImages[selectedImageIndex]?.imageUrl ||
    detail.mainImageUrl ||
    galleryImages[0]?.imageUrl ||
    ''
  );

  return (
    <div className="product-detail">
      <div className="container">
        <div className="product-detail-content">
          {/* 상품 이미지 영역 */}
          <div className="product-images">
            <div className="main-image">
              {mainImageUrl ? (
                <img src={mainImageUrl} alt={detail.postName} />
              ) : (
                <div className="image-placeholder">이미지가 없습니다.</div>
              )}
            </div>
            {galleryImages.length > 0 && (
            <div className="thumbnail-images">
                {galleryImages.map((image, index) => (
                <button
                    key={image.imageId || `${image.imageUrl}-${index}`}
                  className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                    <img src={resolveImageUrl(image.imageUrl)} alt={`${detail.postName} ${index + 1}`} />
                </button>
              ))}
            </div>
            )}
          </div>

          {/* 상품 정보 */}
          <div className="product-info">
            <div className="product-header">
              <p className="product-brand">{detail.brand || '브랜드 미지정'}</p>
              <h1 className="product-name">{detail.postName}</h1>
              <div className="product-meta">
                <span className="view-count">조회수 {detail.viewCount?.toLocaleString() || 0}</span>
                <span className="category-name">{detail.categoryName}</span>
              </div>
            </div>

            <div className="product-price-section">
              {hasDiscount && (
                <div className="discount-badge">{discountRate}% 할인</div>
              )}
              <div className="price-wrapper">
                {hasDiscount && basePrice && (
                  <span className="original-price">{basePrice.toLocaleString()}원</span>
                )}
                <span className="final-price">{(effectivePrice || 0).toLocaleString()}원</span>
              </div>
            </div>

            <div className="product-details">
              <div className="detail-row">
                <span className="detail-label">성별</span>
                <span className="detail-value">{genderText}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">소재</span>
                <span className="detail-value">{detail.material || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">계절</span>
                <span className="detail-value">{seasonText}</span>
              </div>
            </div>

            {colors.length > 0 && (
              <div className="color-selection">
                <div className="color-label">컬러</div>
                <div className="color-options">
                  {colors.map(color => (
                    <button
                      key={color}
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedColor(color);
                        setSelectedSize('');
                      }}
                    >
                      {getColorLabel(color)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isBagOrAccessory && (
            <div className="size-selection">
              <div className="size-label">
                <span>사이즈</span>
                  {sizeOptions.length > 0 && <span className="size-guide-link">사이즈 가이드</span>}
              </div>
                {sizeOptions.length > 0 ? (
              <div className="size-options">
                    {sizeOptions.map(size => (
                  <button
                    key={size}
                    className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
                ) : (
                  <p className="size-empty-text">해당 상품은 사이즈 선택이 필요하지 않습니다.</p>
                )}
              </div>
            )}

            {isBagOrAccessory && (
              <div className="size-selection">
                <div className="size-label">
                  <span>사이즈</span>
                </div>
                <p className="size-empty-text">가방/패션소품은 사이즈 선택 없이 구매할 수 있습니다.</p>
            </div>
            )}

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
                    setQuantity(Math.min(Math.max(1, val), maxQuantity));
                  }}
                  min="1"
                  className="quantity-input"
                />
                <button 
                  className="quantity-btn"
                  onClick={handleQuantityIncrease}
                  disabled={quantity >= maxQuantity}
                >
                  +
                </button>
              </div>
              {selectedProduct && (
                <span className="stock-info">재고 {selectedProduct.stock}개</span>
              )}
            </div>

            <div className="total-price-section">
              <span className="total-label">총 상품금액</span>
              <span className="total-price">
                {(effectivePrice * quantity).toLocaleString()}원
              </span>
            </div>

            <div className="product-actions">
              <div className="wish-wrapper">
              <button 
                className={`btn-wish ${isWished ? 'active' : ''} ${isSellerUser ? 'disabled-button' : ''}`}
                onClick={handleWishToggle}
                  disabled={isSellerUser}
                title="찜하기"
              >
                {isWished ? '❤️' : '🤍'}
              </button>
                <span className="wish-count">찜 {wishCount.toLocaleString()}</span>
              </div>
              <button 
                className={`btn-cart ${isSellerUser ? 'disabled-button' : ''}`}
                onClick={handleAddToCart}
                disabled={isSellerUser}
              >
                장바구니
              </button>
              <button 
                className={`btn-buy ${isSellerUser ? 'disabled-button' : ''}`}
                onClick={handleBuyNow}
                disabled={isSellerUser}
              >
                바로 구매
              </button>
            </div>

            <div className="seller-info">
              <span className="seller-label">브랜드</span>
              <button 
                className="seller-name-link"
                onClick={() => navigate(`/seller?sellerId=${detail.sellerId}`)}
              >
                {detail.brand || '브랜드 정보 없음'}
              </button>
            </div>
          </div>
        </div>

        <div className="product-description">
          <h2 className="section-title">상품 설명</h2>
          <div className="description-content">
            <p>{detail.description || '상품 설명이 등록되지 않았습니다.'}</p>
            {descriptionImages.length > 0 && (
              <div className="description-image-grid">
                {descriptionImages.map((image, index) => (
                  <img
                    key={image.imageId || `${image.imageUrl}-${index}`}
                    src={resolveImageUrl(image.imageUrl)}
                    alt={`${detail.postName} 설명 이미지 ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="product-reviews">
          <div className="reviews-header">
            <h2 className="section-title">리뷰</h2>
            <div className="reviews-summary">
              <span className="average-rating">
                평점: {(reviewSamples.reduce((sum, r) => sum + r.rating, 0) / reviewSamples.length).toFixed(1)}
              </span>
              <span className="reviews-count">({reviewSamples.length}개)</span>
            </div>
          </div>
          <div className="reviews-list">
            {reviewSamples.map(review => (
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
                        key={`${review.reviewId}-${index}`}
                        src={imageUrl}
                        alt={`${review.userName} 리뷰 ${index + 1}`}
                        className="review-image"
                      />
                    ))}
                  </div>
                )}
                <p className="review-content">{review.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
