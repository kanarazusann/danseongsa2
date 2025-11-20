import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentResult.css';
import { confirmPayment } from '../services/paymentService';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = Number(searchParams.get('amount'));

  const navigate = useNavigate();
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('결제를 확인하는 중입니다...');

  useEffect(() => {
    const pendingOrderStr = sessionStorage.getItem('pendingOrder');
    if (!paymentKey || !orderId || !amount || Number.isNaN(amount)) {
      setStatus('error');
      setMessage('결제 정보가 올바르지 않습니다.');
      return;
    }
    if (!pendingOrderStr) {
      setStatus('error');
      setMessage('주문 정보가 만료되었습니다. 처음부터 다시 진행해주세요.');
      return;
    }

    const pendingOrder = JSON.parse(pendingOrderStr);
    if (pendingOrder.orderId !== orderId) {
      setStatus('error');
      setMessage('주문 정보가 일치하지 않습니다.');
      return;
    }

    // 바로구매의 경우 orderItems 사용, 장바구니 주문의 경우 cartItemIds 사용
    // Payment.jsx에서 이미 생성한 orderItems 사용
    // orderItems가 빈 배열이 아닌 실제 값이 있을 때만 전달
    const orderItems = pendingOrder.orderItems && pendingOrder.orderItems.length > 0 
      ? pendingOrder.orderItems 
      : null;

    const orderRequest = {
      userId: pendingOrder.userId,
      cartItemIds: (pendingOrder.cartItemIds && pendingOrder.cartItemIds.length > 0) 
        ? pendingOrder.cartItemIds 
        : null,
      orderItems,
      recipientName: pendingOrder.recipientName || pendingOrder.deliveryInfo?.recipientName,
      recipientPhone: pendingOrder.recipientPhone || pendingOrder.deliveryInfo?.recipientPhone,
      zipcode: pendingOrder.zipcode || pendingOrder.deliveryInfo?.postalCode,
      address: pendingOrder.address || pendingOrder.deliveryInfo?.address,
      detailAddress: pendingOrder.detailAddress || pendingOrder.deliveryInfo?.detailAddress,
      deliveryMemo: pendingOrder.deliveryMemo || pendingOrder.deliveryInfo?.deliveryMemo,
      paymentMethod: pendingOrder.paymentMethod
    };

    confirmPayment({
      paymentKey,
      orderId,
      amount,
      orderRequest
    })
      .then((response) => {
        sessionStorage.removeItem('pendingOrder');
        setStatus('success');
        setMessage('결제가 완료되었습니다.');
        navigate(`/order/${response.item.orderId}`, {
          replace: true,
          state: { order: response.item }
        });
      })
      .catch((error) => {
        console.error('결제 확인 오류:', error);
        setStatus('error');
        setMessage(error.message || '결제 확인 중 오류가 발생했습니다.');
      });
  }, [paymentKey, orderId, amount, navigate]);

  const handleGoHome = () => {
    sessionStorage.removeItem('pendingOrder');
    navigate('/');
  };

  return (
    <div className="payment-result-page">
      <div className="result-card">
        <h1 className={`result-status ${status}`}>
          {status === 'success' ? '결제 성공' : status === 'error' ? '결제 실패' : '처리 중'}
        </h1>
        <p className="result-message">{message}</p>
        {status === 'error' && (
          <button className="btn-secondary" onClick={handleGoHome}>
            홈으로 가기
          </button>
        )}
      </div>
    </div>
  );
}

export default PaymentSuccess;


