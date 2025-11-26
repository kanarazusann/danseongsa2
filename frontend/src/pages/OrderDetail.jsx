import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './OrderDetail.css';
import { fetchSessionUser } from '../services/authService';
import {
  getOrderDetail,
  cancelOrderItem,
  confirmOrderItem,
  createRefundRequest,
  cancelRefundRequest,
  getUserRefunds
} from '../services/orderService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const REFUND_STATUS = {
  REQUESTED: 'REQ',
  APPROVED: 'APR',
  COMPLETED: 'COM',
  REJECTED: 'REJ',
  CANCELED: 'CAN'
};

const REFUND_STATUS_TEXT = {
  [REFUND_STATUS.REQUESTED]: '승인 대기',
  [REFUND_STATUS.APPROVED]: '승인됨',
  [REFUND_STATUS.COMPLETED]: '처리 완료',
  [REFUND_STATUS.REJECTED]: '거절됨',
  [REFUND_STATUS.CANCELED]: '사용자 취소'
};

const normalizeOrderStatus = (status) => {
  if (status === null || status === undefined) return 'PAID';
  const key = status.toString().trim().toUpperCase();
  switch (key) {
    case 'PAY':
    case 'PAID':
      return 'PAID';
    case 'DLV':
    case 'DELIVERING':
      return 'DELIVERING';
    case 'DLD':
    case 'DELIVERED':
      return 'DELIVERED';
    case 'CNF':
    case 'CONFIRMED':
      return 'CONFIRMED';
    case 'CAN':
    case 'CANCELED':
    case 'CANCELLED':
      return 'CANCELLED';
    case 'REF':
    case 'REFUNDED':
      return 'REFUNDED';
    default:
      return key || 'PAID';
  }
};

const normalizeRefundStatus = (status) => {
  if (!status) return '';
  const upper = status.toUpperCase();
  switch (upper) {
    case 'REQUESTED':
    case REFUND_STATUS.REQUESTED:
      return REFUND_STATUS.REQUESTED;
    case 'APPROVED':
    case REFUND_STATUS.APPROVED:
      return REFUND_STATUS.APPROVED;
    case 'COMPLETED':
    case REFUND_STATUS.COMPLETED:
      return REFUND_STATUS.COMPLETED;
    case 'REJECTED':
    case REFUND_STATUS.REJECTED:
      return REFUND_STATUS.REJECTED;
    case 'CANCELED':
    case 'CANCELLED':
    case REFUND_STATUS.CANCELED:
      return REFUND_STATUS.CANCELED;
    default:
      return upper;
  }
};

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
  const [refunds, setRefunds] = useState([]);

  const refreshOrderData = useCallback(
    async (targetUserId, showLoader = false) => {
      const uid = targetUserId || userId;
      if (!orderId || !uid) return;
      if (showLoader) {
        setLoading(true);
      }
      try {
        const [orderResponse, refundResponse] = await Promise.all([
          getOrderDetail(orderId, uid),
          getUserRefunds(uid)
        ]);
        if (orderResponse.item) {
          setOrder(orderResponse.item);
          setErrorMessage('');
        } else {
          setOrder(null);
          setErrorMessage('주문 정보를 찾을 수 없습니다.');
        }
        setRefunds(refundResponse.items || []);
      } catch (error) {
        console.error('주문 또는 신청 정보 로드 오류:', error);
        setErrorMessage(error.message || '주문 정보를 불러오지 못했습니다.');
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [orderId, userId]
  );

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setErrorMessage('주문 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { item: user } = await fetchSessionUser();
        setUserId(user.userId);
        await refreshOrderData(user.userId, false);
      } catch (error) {
        console.error('주문 정보 로드 오류:', error);
        setErrorMessage(error.message || '주문 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, refreshOrderData]);

  const getStatusText = (status) => {
    const normalized = normalizeOrderStatus(status);
    const statusMap = {
      'PAID': '결제완료',
      'DELIVERING': '배송중',
      'DELIVERED': '배송완료',
      'CONFIRMED': '구매확정',
      'CANCELED': '취소됨',
      'CANCELLED': '취소됨',
      'REFUND': '환불',
      'REFUND_REQUESTED': '환불신청함',
      'REFUNDED': '환불완료',
      'PROCESSING': '처리중',
      'COMPLETED': '처리완료'
    };
    return statusMap[normalized] || normalized || '결제완료';
  };

  const getRefundStatusText = (status) => {
    const normalized = normalizeRefundStatus(status);
    if (!normalized) return status || '';
    return REFUND_STATUS_TEXT[normalized] || status || '';
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

  const handleCancelOrderItem = async (orderItemId) => {
    if (!userId) return;
    if (!window.confirm('해당 상품의 결제를 취소하시겠습니까?')) {
      return;
    }
    try {
      await cancelOrderItem(orderItemId, userId);
      await refreshOrderData();
      alert('결제가 취소되었습니다.');
    } catch (error) {
      alert(error.message || '결제 취소 중 오류가 발생했습니다.');
    }
  };

  const handleRefundRequest = async (item) => {
    if (!userId) return;
    const reason = window.prompt('환불 사유를 입력해주세요.', '');
    if (reason === null) return;
    try {
      await createRefundRequest({
        orderItemId: item.orderItemId,
        userId,
        refundType: 'REFUND',
        reason: reason || '환불 요청',
        reasonDetail: '',
        refundAmount: item.price ? item.price * (item.quantity || 1) : null
      });
      await refreshOrderData();
      alert('환불 요청이 접수되었습니다.');
    } catch (error) {
      alert(error.message || '요청 처리 중 오류가 발생했습니다.');
    }
  };

  const handleRefundCancel = async (refundId) => {
    if (!userId) return;
    if (!window.confirm('신청을 취소하시겠습니까?')) {
      return;
    }
    try {
      await cancelRefundRequest(refundId, userId);
      await refreshOrderData();
      alert('신청이 취소되었습니다.');
    } catch (error) {
      alert(error.message || '신청 취소 중 오류가 발생했습니다.');
    }
  };

  const handleConfirmPurchase = async (orderItemId) => {
    if (!userId) return;
    try {
      await confirmOrderItem(orderItemId, userId);
      await refreshOrderData();
      alert('구매가 확정되었습니다.');
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
                {(() => {
                  const headerStatus = normalizeOrderStatus(order.orderStatus || order.status || 'PAID');
                  return (
                    <span className={`info-value status ${headerStatus.toLowerCase()}`}>
                      {getStatusText(headerStatus)}
                    </span>
                  );
                })()}
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
                        const itemStatus = normalizeOrderStatus(item.status || 'PAID');
                        const refundInfo = refunds.find((ref) => ref.orderItemId === item.orderItemId);
                        const refundStatus = normalizeRefundStatus(refundInfo?.status);

                        // 환불 정보가 있는 경우
                        const isRefundRejected = refundInfo && refundStatus === REFUND_STATUS.REJECTED;
                        const canWriteReview = (itemStatus === 'DELIVERED' || itemStatus === 'CONFIRMED') && 
                                              (!refundInfo || isRefundRejected);
                        
                        if (refundInfo) {
                          return (
                            <div>
                              <div className={`refund-info ${refundStatus ? refundStatus.toLowerCase() : ''}`}>
                                <div className="refund-status-text">
                                  <strong>신청 상태:</strong> {getRefundStatusText(refundInfo.status)}
                                </div>
                                {refundInfo.reason && (
                                  <div className="refund-status-text">사유: {refundInfo.reason}</div>
                                )}
                                {refundInfo.sellerResponse && (
                                  <div className="refund-status-text">
                                    판매자 메모: {refundInfo.sellerResponse}
                                  </div>
                                )}
                              </div>
                              {/* 환불 거절 후 구매확정된 경우 리뷰 작성 버튼 표시 */}
                              {canWriteReview && (
                                <div className="payment-item-actions" style={{ marginTop: '10px' }}>
                                  {item.reviewId || item.hasReview ? (
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
                              )}
                            </div>
                          );
                        }

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
                          // 환불 거절된 경우 구매확정 버튼만 표시
                          const refundInfo = refunds.find((ref) => ref.orderItemId === item.orderItemId);
                          const refundStatus = refundInfo?.status?.toUpperCase();
                          const isRejected = refundStatus === 'REJECTED';
                          
                          return (
                            <div className="payment-item-actions">
                              {!isRejected && (
                                <button
                                  className="btn-review"
                                  onClick={() => handleRefundRequest(item)}
                                >
                                  환불 요청
                                </button>
                              )}
                              <button
                                className="btn-review"
                                onClick={() => handleConfirmPurchase(item.orderItemId)}
                              >
                                구매확정
                              </button>
                            </div>
                          );
                        }
                        if (itemStatus === 'DELIVERED' || itemStatus === 'CONFIRMED') {
                          // DELIVERED 또는 CONFIRMED 상태일 때 리뷰 작성/보기 버튼 표시
                          return (
                            <div className="payment-item-actions">
                              {item.reviewId || item.hasReview ? (
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
                        if (itemStatus.includes('CANCEL')) {
                          return <div className="payment-item-status-text">취소 처리된 상품입니다.</div>;
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

