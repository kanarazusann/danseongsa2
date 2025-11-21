import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './RefundRequest.css';

function RefundRequest() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, orderItemId, order } = location.state || {};

  const [refundType, setRefundType] = useState('REFUND'); // REFUND only
  const [reason, setReason] = useState('');
  const [reasonDetail, setReasonDetail] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [refundItem, setRefundItem] = useState(null);

  // 임시 계좌 데이터 (나중에 API로 교체)
  const accounts = [
    { accountId: 1, bankName: 'KB국민은행', accountNumber: '123-456-789012', accountHolder: '홍길동', isDefault: true, balance: 500000 },
    { accountId: 2, bankName: '신한은행', accountNumber: '987-654-321098', accountHolder: '홍길동', isDefault: false, balance: 300000 }
  ];

  // 환불 사유 옵션
  const refundReasons = [
    '단순 변심',
    '상품 불량',
    '배송 지연',
    '상품 설명과 다름',
    '사이즈 불일치',
    '색상 불일치',
    '기타'
  ];

  useEffect(() => {
    if (!order || !orderItemId) {
      alert('주문 정보가 없습니다.');
      navigate('/mypage');
      return;
    }

    // 환불할 상품 찾기
    const item = order.items?.find(item => item.orderItemId === orderItemId);
    if (!item) {
      alert('주문 상품을 찾을 수 없습니다.');
      navigate('/mypage');
      return;
    }

    setRefundItem(item);

    // 기본 계좌 선택
    if (accounts.length > 0) {
      const defaultAccount = accounts.find(acc => acc.isDefault) || accounts[0];
      setSelectedAccountId(defaultAccount.accountId);
    }
  }, [order, orderItemId, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!reason) {
      alert('환불 사유를 선택해주세요.');
      return;
    }

    if (!reasonDetail.trim()) {
      alert('상세 사유를 입력해주세요.');
      return;
    }

    if (refundType === 'REFUND' && !selectedAccountId) {
      alert('환불받을 계좌를 선택해주세요.');
      return;
    }

    const refundData = {
      orderId,
      orderItemId,
      refundType,
      reason,
      reasonDetail,
      refundAmount: (refundItem?.discountPrice || refundItem?.price || 0) * (refundItem?.quantity || 1),
      accountId: refundType === 'REFUND' ? selectedAccountId : null,
      status: 'REQUESTED'
    };

    // 나중에 API 호출로 교체
    // 예: await createRefundRequest(refundData);
    console.log('Refund Request Data:', refundData);
    alert('환불/교환 신청이 완료되었습니다.');
    navigate('/mypage');
  };

  if (!refundItem) {
    return (
      <div className="refund-request-page">
        <div className="container">
          <div className="loading">로딩 중...</div>
        </div>
      </div>
    );
  }

  const itemPrice = refundItem.discountPrice || refundItem.price;
  const itemTotal = itemPrice * refundItem.quantity;

  return (
    <div className="refund-request-page">
      <div className="container">
        <div className="refund-request-header">
          <button onClick={() => navigate(-1)} className="btn-back">
            ← 이전으로
          </button>
          <h1 className="refund-request-title">환불 신청</h1>
        </div>

        <div className="refund-request-content">
          {/* 주문 정보 */}
          <section className="refund-section">
            <h2 className="section-title">주문 정보</h2>
            <div className="order-info">
              <div className="info-item">
                <span className="info-label">주문번호</span>
                <span className="info-value">{order.orderNumber || `ORD${order.orderId}`}</span>
              </div>
              <div className="info-item">
                <span className="info-label">주문일시</span>
                <span className="info-value">{order.orderDate}</span>
              </div>
            </div>
          </section>

          {/* 환불할 상품 */}
          <section className="refund-section">
            <h2 className="section-title">환불 상품</h2>
            <div className="refund-item">
              <div className="refund-item-image">
                <img src={refundItem.productImage || 'https://via.placeholder.com/300x400/CCCCCC/666666?text=PRODUCT'} alt={refundItem.productName} />
              </div>
              <div className="refund-item-info">
                <div className="refund-item-name">{refundItem.productName}</div>
                <div className="refund-item-details">
                  <div className="refund-item-price">
                    {refundItem.discountPrice ? (
                      <>
                        <span className="original-price">{refundItem.price.toLocaleString()}원</span>
                        <span className="discount-price">{refundItem.discountPrice.toLocaleString()}원</span>
                      </>
                    ) : (
                      <span>{refundItem.price.toLocaleString()}원</span>
                    )}
                  </div>
                  <div className="refund-item-quantity">수량: {refundItem.quantity}개</div>
                  <div className="refund-item-total">합계: {itemTotal.toLocaleString()}원</div>
                </div>
              </div>
            </div>
          </section>

          {/* 환불 사유 */}
          <section className="refund-section">
            <h2 className="section-title">환불 사유</h2>
            <div className="refund-reason-options">
              {refundReasons.map((reasonOption) => (
                <label key={reasonOption} className="refund-reason-option">
                  <input
                    type="radio"
                    name="reason"
                    value={reasonOption}
                    checked={reason === reasonOption}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <span>{reasonOption}</span>
                </label>
              ))}
            </div>
            <div className="reason-detail">
              <label>상세 사유 *</label>
              <textarea
                value={reasonDetail}
                onChange={(e) => setReasonDetail(e.target.value)}
                placeholder="환불 사유를 상세히 입력해주세요."
                rows={5}
                required
              />
            </div>
          </section>

          {/* 환불 계좌 (환불인 경우만) */}
          {refundType === 'REFUND' && (
            <section className="refund-section">
              <h2 className="section-title">환불 계좌</h2>
              {accounts.length === 0 ? (
                <div className="no-account">
                  <p>등록된 계좌가 없습니다. 마이페이지에서 계좌를 추가해주세요.</p>
                  <button 
                    className="btn-primary"
                    onClick={() => navigate('/mypage?tab=accounts')}
                  >
                    계좌 등록하기
                  </button>
                </div>
              ) : (
                <div className="account-list">
                  {accounts.map(account => (
                    <label key={account.accountId} className="account-option">
                      <input
                        type="radio"
                        name="selectedAccount"
                        value={account.accountId}
                        checked={selectedAccountId === account.accountId}
                        onChange={() => setSelectedAccountId(account.accountId)}
                      />
                      <div className="account-info">
                        <div className="account-bank">{account.bankName}</div>
                        <div className="account-number">{account.accountNumber}</div>
                        <div className="account-holder">예금주: {account.accountHolder}</div>
                        {account.isDefault && <span className="default-badge">기본계좌</span>}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* 환불 금액 (환불인 경우만) */}
          {refundType === 'REFUND' && (
            <section className="refund-section">
              <h2 className="section-title">환불 금액</h2>
              <div className="refund-amount">
                <div className="amount-row">
                  <span>상품 금액</span>
                  <span>{itemTotal.toLocaleString()}원</span>
                </div>
                <div className="amount-divider"></div>
                <div className="amount-row total">
                  <span>환불 예상 금액</span>
                  <span className="final-amount">{itemTotal.toLocaleString()}원</span>
                </div>
              </div>
            </section>
          )}

          {/* 안내 사항 */}
          <section className="refund-section notice">
            <h3 className="notice-title">안내 사항</h3>
            <ul className="notice-list">
              <li>환불 신청 후 판매자 확인까지 1-2일 소요됩니다.</li>
              <li>반품 배송비는 고객 부담입니다. (상품 불량의 경우 제외)</li>
              <li>환불 금액은 승인 후 3-5일 내에 입금됩니다.</li>
            </ul>
          </section>

          {/* 제출 버튼 */}
          <div className="refund-actions">
            <button onClick={() => navigate(-1)} className="btn-secondary">
              취소
            </button>
            <button onClick={handleSubmit} className="btn-primary">
              신청하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RefundRequest;

