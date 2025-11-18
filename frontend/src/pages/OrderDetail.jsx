import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './OrderDetail.css';

function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 주문 데이터 (나중에 API로 교체)
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // URL 파라미터나 location.state에서 주문 데이터 가져오기
    if (location.state?.order) {
      const orderFromMyPage = location.state.order;
      
      // MyPage에서 전달된 order 데이터를 OrderDetail 형식에 맞게 변환
      const transformedOrder = {
        orderId: orderFromMyPage.orderId,
        orderNumber: orderFromMyPage.orderNumber || `ORD${orderFromMyPage.orderId}`,
        orderDate: orderFromMyPage.orderDate,
        status: orderFromMyPage.status?.toUpperCase() || orderFromMyPage.status,
        deliveryInfo: orderFromMyPage.deliveryInfo || {
          recipientName: '홍길동',
          recipientPhone: '010-0000-0000',
          postalCode: '00000',
          address: '주소 정보 없음',
          detailAddress: '',
          deliveryMemo: ''
        },
        items: orderFromMyPage.items?.map((item, index) => ({
          orderItemId: item.orderItemId || index + 1,
          productId: item.productId || index + 1,
          productName: item.productName || `상품 ${index + 1}`,
          productImage: item.productImage || 'https://via.placeholder.com/300x400/CCCCCC/666666?text=PRODUCT',
          price: item.price || 0,
          discountPrice: item.discountPrice || null,
          quantity: item.quantity || 1,
          status: item.status || orderFromMyPage.status
        })) || [],
        paymentInfo: orderFromMyPage.paymentInfo || {
          paymentMethod: 'CARD',
          amount: orderFromMyPage.totalPrice || 0,
          discountAmount: 0,
          deliveryFee: 0,
          finalPrice: orderFromMyPage.totalPrice || 0,
          paidAt: orderFromMyPage.orderDate || new Date().toISOString()
        }
      };
      
      setOrder(transformedOrder);
    } else {
      // 임시 데이터 (나중에 API로 교체)
      // 예: const orderData = await fetchOrderDetail(orderId);
      const mockOrder = {
        orderId: orderId || 1,
        orderNumber: 'ORD20250114-001',
        orderDate: '2025-01-14',
        status: 'PAID',
        deliveryInfo: {
          recipientName: '홍길동',
          recipientPhone: '010-1234-5678',
          postalCode: '12345',
          address: '서울시 강남구 테헤란로 123',
          detailAddress: '101동 101호',
          deliveryMemo: '문 앞'
        },
        items: [
          {
            orderItemId: 1,
            productId: 1,
            productName: '클래식 오버핏 코트',
            productImage: 'https://via.placeholder.com/300x400/000000/FFFFFF?text=COAT',
            price: 89000,
            discountPrice: null,
            quantity: 1,
            status: 'CONFIRMED'
          },
          {
            orderItemId: 2,
            productId: 2,
            productName: '베이직 티셔츠',
            productImage: 'https://via.placeholder.com/300x400/FFFFFF/000000?text=T-SHIRT',
            price: 29000,
            discountPrice: null,
            quantity: 2,
            status: 'CONFIRMED'
          }
        ],
        paymentInfo: {
          paymentMethod: 'CARD',
          amount: 178000,
          discountAmount: 0,
          deliveryFee: 0,
          finalPrice: 178000,
          paidAt: '2025-01-14 14:30:00'
        }
      };
      setOrder(mockOrder);
    }
  }, [orderId, location.state]);

  const getStatusText = (status) => {
    const statusMap = {
      'CONFIRMED': '주문확인',
      'PAID': '결제완료',
      'DELIVERED': '배송완료',
      'CANCELLED': '취소됨',
      'REFUNDED': '환불됨'
    };
    return statusMap[status] || status;
  };
  
  // 리뷰 작성 핸들러
  const handleWriteReview = (item) => {
    navigate('/review/write', {
      state: {
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        orderItemId: item.orderItemId,
        orderNumber: order.orderNumber
      }
    });
  };

  const getPaymentMethodText = (method) => {
    const methodMap = {
      'CARD': '신용/체크카드',
      'ACCOUNT': '계좌이체',
      'TOSS': '토스페이'
    };
    return methodMap[method] || method;
  };

  // 주문 취소 핸들러
  const handleCancelOrder = () => {
    if (window.confirm('정말로 이 주문을 취소하시겠습니까?')) {
      // 나중에 API 호출로 교체
      // 예: await cancelOrder(order.orderId);
      alert('주문이 취소되었습니다.');
      navigate('/mypage');
    }
  };

  // 환불 신청 핸들러
  const handleRefundRequest = (orderItemId) => {
    navigate('/refund/request', { 
      state: { 
        orderId: order.orderId,
        orderItemId,
        order 
      } 
    });
  };

  if (!order) {
    return (
      <div className="order-detail-page">
        <div className="container">
          <div className="loading">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <div className="container">
        <div className="order-detail-header">
          <button onClick={() => navigate('/mypage')} className="btn-back">
            ← 목록으로
          </button>
          <h1 className="order-detail-title">주문 상세</h1>
        </div>

        <div className="order-detail-content">
          {/* 주문 정보 */}
          <section className="detail-section">
            <h2 className="section-title">주문 정보</h2>
            <div className="order-info-grid">
              <div className="info-item">
                <span className="info-label">주문번호</span>
                <span className="info-value">{order.orderNumber}</span>
              </div>
              <div className="info-item">
                <span className="info-label">주문일시</span>
                <span className="info-value">{order.orderDate}</span>
              </div>
              <div className="info-item">
                <span className="info-label">주문상태</span>
                <span className={`info-value status ${order.status.toLowerCase()}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
            </div>
          </section>

          {/* 배송지 정보 */}
          <section className="detail-section">
            <h2 className="section-title">배송지 정보</h2>
            <div className="delivery-info">
              <div className="info-item">
                <span className="info-label">받는 분</span>
                <span className="info-value">{order.deliveryInfo.recipientName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">연락처</span>
                <span className="info-value">{order.deliveryInfo.recipientPhone}</span>
              </div>
              <div className="info-item">
                <span className="info-label">배송지</span>
                <span className="info-value">
                  [{order.deliveryInfo.postalCode}] {order.deliveryInfo.address} {order.deliveryInfo.detailAddress}
                </span>
              </div>
              {order.deliveryInfo.deliveryMemo && (
                <div className="info-item">
                  <span className="info-label">배송 메모</span>
                  <span className="info-value">{order.deliveryInfo.deliveryMemo}</span>
                </div>
              )}
            </div>
          </section>

          {/* 주문 상품 목록 */}
          <section className="detail-section">
            <h2 className="section-title">주문 상품</h2>
            <div className="payment-items">
              {order.items.map((item) => {
                const itemPrice = item.discountPrice || item.price;
                const itemTotal = itemPrice * item.quantity;

                return (
                  <div key={item.orderItemId} className="payment-item">
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
                        <div className="payment-item-status">상태: {getStatusText(item.status)}</div>
                      </div>
                    </div>
                    <div className="payment-item-total">
                      <span className="total-label">합계</span>
                      <span className="total-price">{itemTotal.toLocaleString()}원</span>
                      {order.status?.toUpperCase() === 'DELIVERED' && (
                        <button 
                          className="btn-review"
                          onClick={() => handleWriteReview(item)}
                        >
                          리뷰 작성
                        </button>
                      )}
                      {order.status?.toUpperCase() === 'PAID' && (
                        <button 
                          className="btn-secondary"
                          onClick={() => handleRefundRequest(item.orderItemId)}
                        >
                          환불신청
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 결제 정보 */}
          <section className="detail-section">
            <h2 className="section-title">결제 정보</h2>
            <div className="payment-info">
              <div className="info-item">
                <span className="info-label">결제 수단</span>
                <span className="info-value">{getPaymentMethodText(order.paymentInfo.paymentMethod)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">상품 금액</span>
                <span className="info-value">{order.paymentInfo.amount.toLocaleString()}원</span>
              </div>
              {order.paymentInfo.discountAmount > 0 && (
                <div className="info-item">
                  <span className="info-label">할인 금액</span>
                  <span className="info-value">-{order.paymentInfo.discountAmount.toLocaleString()}원</span>
                </div>
              )}
              <div className="info-item">
                <span className="info-label">배송비</span>
                <span className="info-value">
                  {order.paymentInfo.deliveryFee === 0 ? '무료' : `${order.paymentInfo.deliveryFee.toLocaleString()}원`}
                </span>
              </div>
              <div className="info-divider"></div>
              <div className="info-item total">
                <span className="info-label">최종 결제금액</span>
                <span className="info-value final-price">{order.paymentInfo.finalPrice.toLocaleString()}원</span>
              </div>
              <div className="info-item">
                <span className="info-label">결제일시</span>
                <span className="info-value">{order.paymentInfo.paidAt}</span>
              </div>
            </div>
          </section>

          {/* 주문 액션 버튼 */}
          <div className="order-detail-actions">
            {order.status === 'CONFIRMED' && (
              <button onClick={handleCancelOrder} className="btn-danger">
                주문 취소
              </button>
            )}
            <button onClick={() => navigate('/mypage')} className="btn-secondary">
              목록으로
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;

