import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Payment.css';
import { fetchSessionUser } from '../services/authService';
import { loadTossPayments } from '@tosspayments/payment-sdk';

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.orderData;

  useEffect(() => {
    if (!orderData) {
      alert('주문 정보가 없습니다.');
      navigate('/cart');
    }
  }, [orderData, navigate]);

  const [sessionUser, setSessionUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // CARD, TRANSFER
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [processing, setProcessing] = useState(false);

  const successUrl = `${window.location.origin}/payment/success`;
  const failUrl = `${window.location.origin}/payment/fail`;

  useEffect(() => {
    const ensureLogin = async () => {
      try {
        const { item } = await fetchSessionUser();
        setSessionUser(item);
      } catch {
        alert('로그인이 필요합니다.');
        navigate('/login');
      }
    };
    ensureLogin();
  }, [navigate]);

  const totalAmount = useMemo(
    () => orderData?.orderAmount?.finalPrice || 0,
    [orderData]
  );
  const postalCode = useMemo(
    () => orderData?.deliveryInfo?.postalCode || orderData?.deliveryInfo?.zipcode || '',
    [orderData]
  );

  const handlePayment = async () => {
    if (!orderData || processing) return;
    const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY || '';
    if (!clientKey) {
      alert('토스 클라이언트 키가 설정되지 않았습니다.');
      return;
    }
    if (!agreedToTerms) {
      alert('결제 진행을 위해 약관에 동의해주세요.');
      return;
    }

    try {
      setProcessing(true);
      const tossPayments = await loadTossPayments(clientKey);
      const orderId = `order-${Date.now()}`;
      const items = orderData.items || [];
      const orderName = items.length > 1
        ? `${items[0].productName} 외 ${items.length - 1}건`
        : items[0]?.productName || '단성사 주문';

      const pendingOrder = {
        userId: orderData.userId,
        cartItemIds: orderData.cartItemIds,
        recipientName: orderData.deliveryInfo.recipientName,
        recipientPhone: orderData.deliveryInfo.recipientPhone,
        zipcode: postalCode,
        address: orderData.deliveryInfo.address,
        detailAddress: orderData.deliveryInfo.detailAddress,
        deliveryMemo: orderData.deliveryInfo.deliveryMemo,
        paymentMethod,
        items,
        deliveryInfo: orderData.deliveryInfo,
        orderAmount: orderData.orderAmount,
        orderId,
        orderName
      };
      sessionStorage.setItem('pendingOrder', JSON.stringify(pendingOrder));

      await tossPayments.requestPayment(
        paymentMethod === 'TRANSFER' ? 'TRANSFER' : 'CARD',
        {
          amount: totalAmount,
          orderId,
          orderName,
          customerName: orderData.deliveryInfo.recipientName || sessionUser?.name || '고객',
          customerEmail: sessionUser?.email,
          successUrl,
          failUrl
        }
      );
    } catch (error) {
      if (error.code === 'USER_CANCEL') {
        alert('결제가 취소되었습니다.');
      } else {
        alert(error.message || '결제 요청 중 오류가 발생했습니다.');
      }
      setProcessing(false);
    }
  };

  if (!orderData) {
    return null;
  }

  const { items, deliveryInfo, orderAmount } = orderData;

  return (
    <div className="payment-page">
      <div className="container">
        <h1 className="payment-title">결제하기</h1>

        <div className="payment-content">
          <section className="payment-section">
            <h2 className="section-title">주문 정보</h2>
            <div className="order-summary-info">
              <div className="summary-item">
                <span className="summary-label">받는 분</span>
                <span className="summary-value">{deliveryInfo.recipientName}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">연락처</span>
                <span className="summary-value">{deliveryInfo.recipientPhone}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">배송지</span>
                <span className="summary-value">
                  [{postalCode}] {deliveryInfo.address} {deliveryInfo.detailAddress}
                </span>
              </div>
              {deliveryInfo.deliveryMemo && (
                <div className="summary-item">
                  <span className="summary-label">배송 메모</span>
                  <span className="summary-value">{deliveryInfo.deliveryMemo}</span>
                </div>
              )}
            </div>
          </section>

          <section className="payment-section">
            <h2 className="section-title">주문 상품</h2>
            <div className="payment-items">
              {items.map((item, index) => {
                const itemPrice = item.discountPrice || item.price;
                const itemTotal = itemPrice * item.quantity;

                return (
                  <div key={item.cartId || item.productId || index} className="payment-item">
                    <div className="payment-item-image">
                      {item.productImage ? (
                        <img src={item.productImage} alt={item.productName} />
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

          <section className="payment-section">
            <h2 className="section-title">결제 금액</h2>
            <div className="payment-amount">
              <div className="amount-row">
                <span>상품 금액</span>
                <span>{orderAmount.productTotal.toLocaleString()}원</span>
              </div>
              <div className="amount-row">
                <span>배송비</span>
                <span>{orderAmount.deliveryFee === 0 ? '무료' : `${orderAmount.deliveryFee.toLocaleString()}원`}</span>
              </div>
              <div className="amount-divider"></div>
              <div className="amount-row total">
                <span>총 결제금액</span>
                <span className="final-amount">{orderAmount.finalPrice.toLocaleString()}원</span>
              </div>
            </div>
          </section>

          <section className="payment-section">
            <h2 className="section-title">결제 수단</h2>
            <div className="payment-methods">
              <label className="payment-method-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CARD"
                  checked={paymentMethod === 'CARD'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>신용/체크카드</span>
              </label>
              <label className="payment-method-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="TRANSFER"
                  checked={paymentMethod === 'TRANSFER'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>계좌이체</span>
              </label>
            </div>
            <p className="payment-help-text">
              선택하신 수단은 토스페이먼츠 결제창에서 안전하게 처리됩니다.
            </p>
          </section>

          <section className="payment-section">
            <label className="terms-agreement">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              <span>결제 진행을 위한 약관에 동의합니다. (필수)</span>
            </label>
          </section>

          <div className="payment-actions">
            <button
              onClick={() => navigate('/order', { state: { selectedItems: orderData.items, deliveryInfo: orderData.deliveryInfo } })}
              className="btn-secondary"
              disabled={processing}
            >
              이전으로
            </button>
            <button
              onClick={handlePayment}
              className="btn-payment"
              disabled={!agreedToTerms || processing}
            >
              {processing ? '결제 요청 중...' : `${orderAmount.finalPrice.toLocaleString()}원 결제하기`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;

