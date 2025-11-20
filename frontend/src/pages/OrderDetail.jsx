import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './OrderDetail.css';
import { fetchSessionUser } from '../services/authService';
import { getOrderDetail } from '../services/orderService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const resolveImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
  return `${API_BASE_URL}/${url}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    // ISO 형식 또는 Timestamp 형식 모두 처리
    let date;
    if (typeof dateString === 'string') {
      // Oracle Timestamp 형식 처리 (예: "2025-01-15 12:34:56.0")
      const cleanDate = dateString.split('.')[0].replace(' ', 'T');
      date = new Date(cleanDate);
    } else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch {
    return dateString || '-';
  }
};

function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadOrder = async () => {
      if (location.state?.order) {
        setLoading(false);
        return;
      }

      try {
        const { item: user } = await fetchSessionUser();
        const response = await getOrderDetail(orderId, user.userId);
        setOrder(response.item);
      } catch (error) {
        setErrorMessage(error.message || '주문 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadOrder();
    }
  }, [orderId, location.state]);

  const getStatusText = (status) => {
    const statusMap = {
      'PAID': '결제완료',
      'DELIVERED': '배송완료',
      'CANCELLED': '취소됨',
      'REFUNDED': '환불됨'
    };
    return statusMap[status] || '결제완료'; // 기본값은 결제완료
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

  // 결제 취소 핸들러 (데이터 삭제)
  const handleCancelOrder = async () => {
    if (!window.confirm('정말로 이 주문을 취소하시겠습니까? 주문 정보가 완전히 삭제됩니다.')) {
      return;
    }

    try {
      const { item: user } = await fetchSessionUser();
      const response = await fetch(`${API_BASE_URL}/orders/${order.orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ userId: user.userId })
      });

      const data = await response.json();
      if (response.ok && data.rt === 'OK') {
        alert('주문이 취소되었습니다.');
        // 주문 목록 페이지로 이동 (주문이 삭제되었으므로)
        navigate('/mypage');
      } else {
        alert(data.message || '주문 취소 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('주문 취소 오류:', error);
      alert('주문 취소 중 오류가 발생했습니다.');
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

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="container">
          <div className="loading">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <div className="container">
          <div className="order-error">
            <p>{errorMessage || '주문 정보를 찾을 수 없습니다.'}</p>
            <button className="btn-secondary" onClick={() => navigate('/mypage')}>목록으로</button>
          </div>
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
                <span className="info-value">{order.orderDate ? formatDate(order.orderDate) : '-'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">주문상태</span>
                <span className={`info-value status ${(order.orderStatus || order.status || 'PAID').toLowerCase()}`}>
                  {getStatusText(order.orderStatus || order.status || 'PAID')}
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
                  [{order.deliveryInfo.zipcode || order.deliveryInfo.postalCode}] {order.deliveryInfo.address} {order.deliveryInfo.detailAddress}
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
                const itemPrice = item.discountPrice || item.price || 0;
                const itemTotal = itemPrice * (item.quantity || 1);

                return (
                  <div key={item.orderItemId} className="payment-item">
                    <div className="payment-item-image">
                      {item.productImage ? (
                        <img src={resolveImageUrl(item.productImage)} alt={item.productName} />
                      ) : (
                        <div className="product-image-placeholder">이미지 없음</div>
                      )}
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
                        {(item.color || item.productSize) && (
                          <div className="payment-item-option">
                            {item.color && <span>색상: {item.color}</span>}
                            {item.productSize && <span> / 사이즈: {item.productSize}</span>}
                          </div>
                        )}
                        <div className="payment-item-status">상태: {getStatusText(item.status || 'PAID')}</div>
                      </div>
                    </div>
                    <div className="payment-item-total">
                      <span className="total-label">합계</span>
                      <span className="total-price">{itemTotal.toLocaleString()}원</span>
                      {(order.orderStatus || order.status)?.toUpperCase() === 'DELIVERED' && (
                        <button 
                          className="btn-review"
                          onClick={() => handleWriteReview(item)}
                        >
                          리뷰 작성
                        </button>
                      )}
                      {(order.orderStatus || order.status)?.toUpperCase() === 'PAID' && (
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
                <span className="info-value">{order.paymentInfo?.paidAt ? formatDate(order.paymentInfo.paidAt) : (order.orderDate ? formatDate(order.orderDate) : '-')}</span>
              </div>
            </div>
          </section>

          {/* 주문 액션 버튼 */}
          <div className="order-detail-actions">
            {(order.orderStatus || order.status || 'PAID').toUpperCase() === 'PAID' && (
              <button onClick={handleCancelOrder} className="btn-danger">
                결제 취소
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

