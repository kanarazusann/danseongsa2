import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './Order.css';
import { fetchSessionUser } from '../services/authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const resolveImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
  return `${API_BASE_URL}/${url}`;
};

function Order() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedItems = location.state?.selectedItems
    || location.state?.orderData?.items
    || [];
  const [sessionUser, setSessionUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const detailAddressRef = useRef(null);

  // 배송지 정보
  const [deliveryInfo, setDeliveryInfo] = useState(() => (
    location.state?.deliveryInfo || {
      recipientName: '',
      recipientPhone: '',
      address: '',
      detailAddress: '',
      postalCode: '',
      deliveryMemo: ''
    }
  ));

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.body.appendChild(script);

    const loadUser = async () => {
      try {
        const { item } = await fetchSessionUser();
        setSessionUser(item);
        if (!location.state?.deliveryInfo) {
          setDeliveryInfo(prev => ({
            ...prev,
            recipientName: item.name || '',
            recipientPhone: item.phone || '',
            address: item.address || '',
            detailAddress: item.detailAddress || '',
            postalCode: item.zipcode || ''
          }));
        }
      } catch {
        alert('로그인이 필요합니다.');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    loadUser();

    return () => {
      document.body.removeChild(script);
    };
  }, [navigate, location.state]);

  // 입력 필드 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressSearch = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert('주소 검색 스크립트를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data) => {
        const fullAddress = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
        setDeliveryInfo(prev => ({
          ...prev,
          postalCode: data.zonecode || '',
          address: fullAddress || '',
          detailAddress: ''
        }));
        setTimeout(() => detailAddressRef.current?.focus(), 0);
      }
    }).open();
  };

  // 주문 금액 계산
  const calculateOrderAmount = () => {
    const productTotal = selectedItems.reduce((total, item) => {
      const itemPrice = item.discountPrice || item.price;
      return total + (itemPrice * item.quantity);
    }, 0);
    
    const deliveryFee = productTotal >= 50000 ? 0 : 3000;
    const finalPrice = productTotal + deliveryFee;
    
    return {
      productTotal,
      deliveryFee,
      finalPrice
    };
  };

  const { productTotal, deliveryFee, finalPrice } = useMemo(() => calculateOrderAmount(), [selectedItems]);

  // 주문하기 핸들러
  const handleOrder = () => {
    if (!sessionUser) {
      alert('로그인 정보를 확인할 수 없습니다.');
      return;
    }

    if (selectedItems.length === 0) {
      alert('주문할 상품이 없습니다.');
      return;
    }

    // 유효성 검사
    if (!deliveryInfo.recipientName.trim()) {
      alert('받는 분 이름을 입력해주세요.');
      return;
    }
    if (!deliveryInfo.recipientPhone.trim()) {
      alert('받는 분 전화번호를 입력해주세요.');
      return;
    }
    if (!deliveryInfo.address.trim()) {
      alert('주소를 입력해주세요.');
      return;
    }
    if (!deliveryInfo.detailAddress.trim()) {
      alert('상세 주소를 입력해주세요.');
      return;
    }

    const cartItemIds = selectedItems
      .map(item => item.cartId)
      .filter((id) => typeof id === 'number' || typeof id === 'string');

    if (cartItemIds.length === 0) {
      alert('장바구니 정보를 찾을 수 없습니다. 다시 시도해주세요.');
      return;
    }

    const mappedItems = selectedItems.map((item, index) => ({
      cartId: item.cartId,
      productId: item.productId,
      postId: item.postId,
      productName: item.postName || item.productName || `상품 ${index + 1}`,
      productImage: resolveImageUrl(item.imageUrl || item.productImage),
      price: item.price || 0,
      discountPrice: item.discountPrice,
      quantity: item.quantity,
      color: item.color,
      productSize: item.productSize
    }));

    const orderData = {
      userId: sessionUser.userId,
      cartItemIds,
      items: mappedItems,
      deliveryInfo: { ...deliveryInfo },
      orderAmount: { productTotal, deliveryFee, finalPrice }
    };

    navigate('/payment', { state: { orderData } });
  };

  // 장바구니로 돌아가기
  const handleBackToCart = () => {
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="order-page">
        <div className="container">
          <div className="loading">주문 정보를 불러오는 중입니다...</div>
        </div>
      </div>
    );
  }

  if (selectedItems.length === 0) {
    return (
      <div className="order-page">
        <div className="container">
          <div className="order-empty">
            <p className="empty-message">주문할 상품이 없습니다.</p>
            <Link to="/cart" className="btn-primary">장바구니로 돌아가기</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-page">
      <div className="container">
        <h1 className="order-title">주문하기</h1>

        <div className="order-content">
          {/* 배송지 정보 */}
          <section className="order-section">
            <h2 className="section-title">배송지 정보</h2>
            <div className="delivery-form">
              <div className="form-row">
                <label>받는 분 이름 *</label>
                <input
                  type="text"
                  name="recipientName"
                  value={deliveryInfo.recipientName}
                  onChange={handleInputChange}
                  placeholder="이름을 입력하세요"
                  required
                />
              </div>
              <div className="form-row">
                <label>받는 분 전화번호 *</label>
                <input
                  type="tel"
                  name="recipientPhone"
                  value={deliveryInfo.recipientPhone}
                  onChange={handleInputChange}
                  placeholder="010-1234-5678"
                  required
                />
              </div>
              <div className="form-row">
                <label>우편번호 *</label>
                <div className="postal-code-group">
                  <input
                    type="text"
                    name="postalCode"
                    value={deliveryInfo.postalCode}
                    onChange={handleInputChange}
                    placeholder="우편번호"
                    required
                  />
                  <button type="button" className="btn-secondary" onClick={handleAddressSearch}>
                    주소 검색
                  </button>
                </div>
              </div>
              <div className="form-row">
                <label>주소 *</label>
                <input
                  type="text"
                  name="address"
                  value={deliveryInfo.address}
                  onChange={handleInputChange}
                  placeholder="주소를 입력하세요"
                  required
                />
              </div>
              <div className="form-row">
                <label>상세 주소 *</label>
                <input
                  type="text"
                  name="detailAddress"
                  value={deliveryInfo.detailAddress}
                  onChange={handleInputChange}
                  placeholder="상세 주소를 입력하세요"
                  ref={detailAddressRef}
                  required
                />
              </div>
              <div className="form-row">
                <label>배송 메모</label>
                <select
                  name="deliveryMemo"
                  value={deliveryInfo.deliveryMemo}
                  onChange={handleInputChange}
                >
                  <option value="">배송 메모를 선택하세요 (선택사항)</option>
                  <option value="문 앞">문 앞</option>
                  <option value="경비실">경비실</option>
                  <option value="택배함">택배함</option>
                  <option value="직접 받겠습니다">직접 받겠습니다</option>
                  <option value="부재 시 문 앞에 놓아주세요">부재 시 문 앞에 놓아주세요</option>
                </select>
              </div>
            </div>
          </section>

          {/* 주문 상품 목록 */}
          <section className="payment-section">
            <h2 className="section-title">주문 상품</h2>
            <div className="payment-items">
              {selectedItems.map((item, index) => {
                const name = item.postName || item.productName || `상품 ${index + 1}`;
                const imageUrl = resolveImageUrl(item.imageUrl || item.productImage);
                const itemPrice = item.discountPrice || item.price || 0;
                const itemTotal = itemPrice * (item.quantity || 1);

                return (
                  <div key={item.cartId || item.productId || index} className="payment-item">
                    <div className="payment-item-image">
                      {imageUrl ? (
                        <img src={imageUrl} alt={name} />
                      ) : (
                        <div className="product-image-placeholder">이미지 없음</div>
                      )}
                    </div>
                    <div className="payment-item-info">
                      <div className="payment-item-name">{name}</div>
                      <div className="payment-item-details">
                        <div className="payment-item-price">
                          {item.discountPrice ? (
                            <>
                              <span className="original-price">{item.price.toLocaleString()}원</span>
                              <span className="discount-price">{item.discountPrice.toLocaleString()}원</span>
                            </>
                          ) : (
                            <span>{item.price.toLocaleString()}원</span>
                          )}
                        </div>
                        <div className="payment-item-quantity">수량: {item.quantity}개</div>
                        {(item.color || item.productSize) && (
                          <div className="payment-item-option">
                            {item.color && <span>색상: {item.color}</span>}
                            {item.productSize && <span> / 사이즈: {item.productSize}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="payment-item-total">
                      <span className="total-label">합계</span>
                      <span className="total-price">{itemTotal.toLocaleString()}원</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 주문 요약 */}
          <section className="order-section">
            <h2 className="section-title">주문 요약</h2>
            <div className="order-summary">
              <div className="summary-row">
                <span>상품 금액</span>
                <span>{productTotal.toLocaleString()}원</span>
              </div>
              <div className="summary-row">
                <span>배송비</span>
                <span>{deliveryFee === 0 ? '무료' : `${deliveryFee.toLocaleString()}원`}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>총 결제금액</span>
                <span className="final-price">{finalPrice.toLocaleString()}원</span>
              </div>
              {productTotal < 50000 && (
                <div className="free-delivery-notice">
                  <p>50,000원 이상 구매 시 무료배송</p>
                  <p>현재 {((50000 - productTotal).toLocaleString())}원 더 구매하시면 무료배송!</p>
                </div>
              )}
            </div>
          </section>

          {/* 주문 버튼 */}
          <div className="order-actions">
            <button onClick={handleBackToCart} className="btn-secondary">
              장바구니로 돌아가기
            </button>
            <button onClick={handleOrder} className="btn-order">
              결제하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Order;

