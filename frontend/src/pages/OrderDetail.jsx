import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './OrderDetail.css';
import { fetchSessionUser } from '../services/authService';
import { getOrderDetail, cancelOrderItem, requestRefund, requestExchange, confirmOrderItem } from '../services/orderService';

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
    // ISO 형식 문자열을 직접 파싱 (예: "2025-01-15T12:34:56")
    let date;
    if (typeof dateString === 'string') {
      // ISO 형식 문자열 그대로 사용
      date = new Date(dateString);
    } else {
      date = new Date(dateString);
    }
    
    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      console.error('날짜 파싱 실패:', dateString);
      return '-';
    }
    
    // YYYY-MM-DD HH:mm 형식으로 포맷팅
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (error) {
    console.error('날짜 포맷 오류:', dateString, error);
    return '-';
  }
};

function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setErrorMessage('주문 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        const { item: user } = await fetchSessionUser();
        setUserId(user.userId);
        const response = await getOrderDetail(orderId, user.userId);
        console.log('주문 정보:', response.item);
        console.log('주문일시:', response.item?.orderDate);
        console.log('결제일시:', response.item?.paymentInfo?.paidAt);
        
        if (response.item) {
        setOrder(response.item);
        } else {
          setErrorMessage('주문 정보를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('주문 정보 로드 오류:', error);
        setErrorMessage(error.message || '주문 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

      loadOrder();
  }, [orderId, navigate]);

  const getStatusText = (status) => {
    const statusMap = {
      'PAID': '결제완료',
      'DELIVERING': '배송중',
      'DELIVERED': '배송완료',
      'CANCELED': '취소됨',
      'CANCELLED': '취소됨',
      'REFUND': '환불/교환',
      'REFUND_REQUESTED': '환불요청중',
      'REFUNDED': '환불완료',
      'EXCHANGE_REQUESTED': '교환요청중',
      'EXCHANGED': '교환완료'
    };
    if (!status) return statusMap['PAID'];
    const key = status.toUpperCase();
    return statusMap[key] || status;
  };
  
  // 리뷰 작성 핸들러
  const handleWriteReview = (item) => {
    navigate('/review/write', {
      state: {
        postId: item.postId,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        brand: item.brand,
        orderItemId: item.orderItemId,
        orderNumber: order.orderNumber
      }
    });
  };
  
  // 리뷰 보기 핸들러
  const handleViewReview = (reviewId) => {
    // 리뷰 상세 페이지로 이동 (나중에 구현)
    navigate(`/review/${reviewId}`);
  };

  const handleOrderUpdate = (result, successMessage) => {
    if (!result) return;
    if (result.orderDeleted) {
      alert(successMessage || '처리가 완료되었습니다.');
      navigate('/mypage');
      return;
    }
    if (result.order) {
      setOrder(result.order);
      if (successMessage) {
        alert(successMessage);
      }
    }
  };

  const handleCancelOrderItem = async (orderItemId) => {
    if (!userId) return;
    if (!window.confirm('해당 상품의 결제를 취소하시겠습니까?')) {
      return;
    }
    try {
      const response = await cancelOrderItem(orderItemId, userId);
      handleOrderUpdate(response.item, '결제가 취소되었습니다.');
    } catch (error) {
      alert(error.message || '결제 취소 중 오류가 발생했습니다.');
    }
  };

  const handleRefundRequest = async (orderItemId) => {
    if (!userId) return;
    try {
      const response = await requestRefund(orderItemId, userId);
      handleOrderUpdate(response.item, '환불 요청이 접수되었습니다.');
    } catch (error) {
      alert(error.message || '환불 요청 중 오류가 발생했습니다.');
    }
  };

  const handleExchangeRequest = async (orderItemId) => {
    if (!userId) return;
    try {
      const response = await requestExchange(orderItemId, userId);
      handleOrderUpdate(response.item, '교환 요청이 접수되었습니다.');
    } catch (error) {
      alert(error.message || '교환 요청 중 오류가 발생했습니다.');
    }
  };

  const handleConfirmPurchase = async (orderItemId) => {
    if (!userId) return;
    try {
      const response = await confirmOrderItem(orderItemId, userId);
      handleOrderUpdate(response.item, '구매가 확정되었습니다.');
    } catch (error) {
      alert(error.message || '구매 확정 중 오류가 발생했습니다.');
    }
  };

  const getPaymentMethodText = (method) => {
    const methodMap = {
      'CARD': '신용/체크카드',
      'ACCOUNT': '계좌이체',
      'TOSS': '토스페이'
    };
    return methodMap[method] || method;
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
                <span className="info-value">
                  {formatDate(order.createdAt || order.orderDate)}
                </span>
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
              {order.items && order.items.length > 0 ? order.items.map((item) => {
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
                      {(() => {
                        const itemStatus = (item.status || 'PAID').toUpperCase();
                        if (itemStatus === 'PAID') {
                          return (
                            <div className="payment-item-actions">
                              <button
                                className="btn-review"
                                onClick={() => handleCancelOrderItem(item.orderItemId)}
                              >
                                결제 취소
                              </button>
                            </div>
                          );
                        }
                        if (itemStatus === 'DELIVERING') {
                          return (
                            <div className="payment-item-actions">
                              <button
                                className="btn-review"
                                onClick={() => handleRefundRequest(item.orderItemId)}
                              >
                                환불 요청
                              </button>
                              <button
                                className="btn-review"
                                onClick={() => handleExchangeRequest(item.orderItemId)}
                              >
                                교환 요청
                              </button>
                              <button
                                className="btn-review"
                                onClick={() => handleConfirmPurchase(item.orderItemId)}
                              >
                                구매확정
                              </button>
                            </div>
                          );
                        }
                        if (itemStatus === 'DELIVERED') {
                          return (
                            <div className="payment-item-actions">
                              {item.hasReview ? (
                                <button
                                  className="btn-review"
                                  onClick={() => handleViewReview(item.reviewId)}
                                >
                                  리뷰 보기
                                </button>
                              ) : (
                                <button
                                  className="btn-review"
                                  onClick={() => handleWriteReview(item)}
                                >
                                  리뷰 작성
                                </button>
                              )}
                            </div>
                          );
                        }
                        if (itemStatus === 'REFUND_REQUESTED') {
                          return <div className="payment-item-status-text">환불 요청 처리중</div>;
                        }
                        if (itemStatus === 'EXCHANGE_REQUESTED') {
                          return <div className="payment-item-status-text">교환 요청 처리중</div>;
                        }
                        if (itemStatus === 'REFUNDED') {
                          return <div className="payment-item-status-text">환불 완료</div>;
                        }
                        if (itemStatus === 'EXCHANGED') {
                          return <div className="payment-item-status-text">교환 완료</div>;
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                );
              }) : (
                <div className="empty-state">
                  <p>주문 상품이 없습니다.</p>
                </div>
              )}
            </div>
          </section>

          {/* 결제 정보 */}
          {order.paymentInfo && (
          <section className="detail-section">
            <h2 className="section-title">결제 정보</h2>
            <div className="payment-info">
                {order.paymentInfo.amount !== undefined && (
              <div className="info-item">
                <span className="info-label">상품 금액</span>
                <span className="info-value">{order.paymentInfo.amount.toLocaleString()}원</span>
              </div>
                )}
              {order.paymentInfo.discountAmount > 0 && (
                <div className="info-item">
                  <span className="info-label">할인 금액</span>
                  <span className="info-value">-{order.paymentInfo.discountAmount.toLocaleString()}원</span>
                </div>
              )}
                {order.paymentInfo.deliveryFee !== undefined && (
              <div className="info-item">
                <span className="info-label">배송비</span>
                <span className="info-value">
                  {order.paymentInfo.deliveryFee === 0 ? '무료' : `${order.paymentInfo.deliveryFee.toLocaleString()}원`}
                </span>
              </div>
                )}
              <div className="info-divider"></div>
                {order.paymentInfo.finalPrice !== undefined && (
              <div className="info-item total">
                <span className="info-label">최종 결제금액</span>
                <span className="info-value final-price">{order.paymentInfo.finalPrice.toLocaleString()}원</span>
              </div>
                )}
              <div className="info-item">
                <span className="info-label">결제일시</span>
                  <span className="info-value">
                    {formatDate(order.paymentInfo?.paidAt || order.createdAt || order.orderDate)}
                  </span>
              </div>
            </div>
          </section>
          )}

          {/* 주문 액션 버튼 */}
          <div className="order-detail-actions">
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

