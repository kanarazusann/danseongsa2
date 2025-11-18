import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './Order.css';

function Order() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 장바구니에서 전달받은 선택된 상품들 (나중에 실제 데이터로 교체)
  const selectedItems = location.state?.selectedItems || [
    {
      cartId: 1,
      productId: 1,
      productName: '클래식 오버핏 코트',
      productImage: 'https://via.placeholder.com/300x400/000000/FFFFFF?text=COAT',
      price: 89000,
      discountPrice: null,
      quantity: 1
    },
    {
      cartId: 2,
      productId: 2,
      productName: '베이직 티셔츠',
      productImage: 'https://via.placeholder.com/300x400/FFFFFF/000000?text=T-SHIRT',
      price: 29000,
      discountPrice: null,
      quantity: 2
    }
  ];

  // 배송지 정보
  const [deliveryInfo, setDeliveryInfo] = useState({
    recipientName: '',
    recipientPhone: '',
    address: '',
    detailAddress: '',
    postalCode: '',
    deliveryMemo: ''
  });

  // 사용자 정보 가져오기 (나중에 API로 교체)
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      // 기본 배송지 정보 설정 (나중에 API로 교체)
      setDeliveryInfo(prev => ({
        ...prev,
        recipientName: user.name || '',
        recipientPhone: user.phone || '',
        address: user.address || ''
      }));
    }
  }, []);

  // 입력 필드 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo(prev => ({
      ...prev,
      [name]: value
    }));
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

  const { productTotal, deliveryFee, finalPrice } = calculateOrderAmount();

  // 주문하기 핸들러
  const handleOrder = () => {
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

    // 주문 데이터 생성
    const orderData = {
      items: selectedItems,
      deliveryInfo,
      orderAmount: {
        productTotal,
        deliveryFee,
        finalPrice
      }
    };

    // 나중에 API 호출로 교체
    // 예: const order = await createOrder(orderData);
    
    // 결제 페이지로 이동 (주문 데이터 전달)
    navigate('/payment', { state: { orderData } });
  };

  // 장바구니로 돌아가기
  const handleBackToCart = () => {
    navigate('/cart');
  };

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
                  <button type="button" className="btn-secondary">주소 검색</button>
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
                const itemPrice = item.discountPrice || item.price;
                const itemTotal = itemPrice * item.quantity;

                return (
                  <div key={item.cartId || item.productId || index} className="payment-item">
                    <div className="payment-item-image">
                      <img src={item.productImage} alt={item.productName} />
                    </div>
                    <div className="payment-item-info">
                      <div className="payment-item-name">{item.productName}</div>
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
              주문하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Order;

