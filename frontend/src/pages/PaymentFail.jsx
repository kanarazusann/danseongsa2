import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentResult.css';

function PaymentFail() {
  const [searchParams] = useSearchParams();
  const errorMessage = searchParams.get('message') || '결제가 취소되었습니다.';
  const navigate = useNavigate();

  const handleRetry = () => {
    const pendingOrderStr = sessionStorage.getItem('pendingOrder');
    if (pendingOrderStr) {
      const pendingOrder = JSON.parse(pendingOrderStr);
      navigate('/order', {
        replace: true,
        state: {
          selectedItems: pendingOrder.items || [],
          deliveryInfo: pendingOrder.deliveryInfo || {}
        }
      });
    } else {
      navigate('/cart');
    }
  };

  return (
    <div className="payment-result-page">
      <div className="result-card">
        <h1 className="result-status error">결제 실패</h1>
        <p className="result-message">{errorMessage}</p>
        <div className="result-actions">
          <button className="btn-secondary" onClick={handleRetry}>
            다시 주문하기
          </button>
          <button className="btn-outline" onClick={() => navigate('/')}>
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentFail;


