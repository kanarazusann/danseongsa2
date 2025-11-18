import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './Payment.css';

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 주문 페이지에서 전달받은 주문 데이터
  const orderData = location.state?.orderData;
  
  // 주문 데이터가 없으면 주문 페이지로 리다이렉트
  useEffect(() => {
    if (!orderData) {
      alert('주문 정보가 없습니다.');
      navigate('/cart');
    }
  }, [orderData, navigate]);

  const [paymentMethod, setPaymentMethod] = useState('CARD'); // CARD, ACCOUNT
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
    cardPassword: '',
    cardHolder: ''
  });
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // 계좌 목록 (나중에 API로 교체)
  const [accounts, setAccounts] = useState([
    { accountId: 1, bankName: 'KB국민은행', accountNumber: '123-456-789012', accountHolder: '홍길동', isDefault: true, balance: 500000 },
    { accountId: 2, bankName: '신한은행', accountNumber: '987-654-321098', accountHolder: '홍길동', isDefault: false, balance: 300000 }
  ]);

  // 사용자 정보 가져오기
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      // 기본 계좌 선택
      const defaultAccount = accounts.find(acc => acc.isDefault);
      if (defaultAccount) {
        setSelectedAccountId(defaultAccount.accountId);
      }
    }
  }, []);

  // 카드 정보 입력 핸들러
  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    
    // 카드번호 자동 포맷팅 (4자리마다 공백)
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      setCardInfo(prev => ({ ...prev, [name]: formatted }));
    }
    // 만료일 자동 포맷팅 (MM/YY)
    else if (name === 'cardExpiry') {
      const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2');
      setCardInfo(prev => ({ ...prev, [name]: formatted }));
    }
    // CVC는 숫자만
    else if (name === 'cardCVC' || name === 'cardPassword') {
      const formatted = value.replace(/\D/g, '').slice(0, name === 'cardCVC' ? 3 : 2);
      setCardInfo(prev => ({ ...prev, [name]: formatted }));
    }
    else {
      setCardInfo(prev => ({ ...prev, [name]: value }));
    }
  };

  // 결제하기 핸들러
  const handlePayment = () => {
    // 약관 동의 확인
    if (!agreedToTerms) {
      alert('결제 진행을 위해 약관에 동의해주세요.');
      return;
    }

    // 결제 수단별 유효성 검사
    if (paymentMethod === 'CARD') {
      if (!cardInfo.cardNumber.trim() || cardInfo.cardNumber.replace(/\s/g, '').length !== 16) {
        alert('카드번호를 올바르게 입력해주세요.');
        return;
      }
      if (!cardInfo.cardExpiry.trim() || cardInfo.cardExpiry.length !== 5) {
        alert('카드 만료일을 올바르게 입력해주세요. (MM/YY)');
        return;
      }
      if (!cardInfo.cardCVC.trim() || cardInfo.cardCVC.length !== 3) {
        alert('CVC를 올바르게 입력해주세요.');
        return;
      }
      if (!cardInfo.cardPassword.trim() || cardInfo.cardPassword.length !== 2) {
        alert('카드 비밀번호를 올바르게 입력해주세요.');
        return;
      }
      if (!cardInfo.cardHolder.trim()) {
        alert('카드 소유자 이름을 입력해주세요.');
        return;
      }
    } else if (paymentMethod === 'ACCOUNT') {
      if (!selectedAccountId) {
        alert('결제 계좌를 선택해주세요.');
        return;
      }
      
      const selectedAccount = accounts.find(acc => acc.accountId === selectedAccountId);
      if (selectedAccount && selectedAccount.balance < orderData.orderAmount.finalPrice) {
        alert('계좌 잔액이 부족합니다.');
        return;
      }
    }

    // 결제 데이터 생성
    const paymentData = {
      orderData,
      paymentMethod,
      ...(paymentMethod === 'CARD' ? { cardInfo } : { accountId: selectedAccountId }),
      amount: orderData.orderAmount.finalPrice
    };

    // 나중에 API 호출로 교체
    // 예: const payment = await processPayment(paymentData);
    
    // 결제 완료 페이지로 이동 (주문 번호 전달)
    const orderNumber = `ORD${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    navigate('/payment/complete', { 
      state: { 
        orderNumber,
        orderData,
        paymentData 
      } 
    });
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
          {/* 주문 정보 요약 */}
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
                  [{deliveryInfo.postalCode}] {deliveryInfo.address} {deliveryInfo.detailAddress}
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

          {/* 주문 상품 목록 */}
          <section className="payment-section">
            <h2 className="section-title">주문 상품</h2>
            <div className="payment-items">
              {items.map((item, index) => {
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

          {/* 결제 금액 */}
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

          {/* 결제 수단 선택 */}
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
                  value="ACCOUNT"
                  checked={paymentMethod === 'ACCOUNT'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>계좌이체</span>
              </label>
            </div>

            {/* 카드 결제 정보 */}
            {paymentMethod === 'CARD' && (
              <div className="card-payment-form">
                <div className="form-row">
                  <label>카드번호 *</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardInfo.cardNumber}
                    onChange={handleCardInputChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                  />
                </div>
                <div className="form-row-group">
                  <div className="form-row">
                    <label>만료일 *</label>
                    <input
                      type="text"
                      name="cardExpiry"
                      value={cardInfo.cardExpiry}
                      onChange={handleCardInputChange}
                      placeholder="MM/YY"
                      maxLength="5"
                    />
                  </div>
                  <div className="form-row">
                    <label>CVC *</label>
                    <input
                      type="text"
                      name="cardCVC"
                      value={cardInfo.cardCVC}
                      onChange={handleCardInputChange}
                      placeholder="123"
                      maxLength="3"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <label>카드 비밀번호 앞 2자리 *</label>
                  <input
                    type="password"
                    name="cardPassword"
                    value={cardInfo.cardPassword}
                    onChange={handleCardInputChange}
                    placeholder="**"
                    maxLength="2"
                  />
                </div>
                <div className="form-row">
                  <label>카드 소유자 이름 *</label>
                  <input
                    type="text"
                    name="cardHolder"
                    value={cardInfo.cardHolder}
                    onChange={handleCardInputChange}
                    placeholder="홍길동"
                  />
                </div>
              </div>
            )}

            {/* 계좌이체 결제 정보 */}
            {paymentMethod === 'ACCOUNT' && (
              <div className="account-payment-form">
                {accounts.length === 0 ? (
                  <div className="no-account">
                    <p>등록된 계좌가 없습니다.</p>
                    <Link to="/mypage" className="btn-secondary">계좌 등록하러 가기</Link>
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
                          onChange={(e) => setSelectedAccountId(Number(e.target.value))}
                        />
                        <div className="account-info">
                          <div className="account-bank">{account.bankName}</div>
                          <div className="account-number">{account.accountNumber}</div>
                          <div className="account-balance">잔액: {account.balance.toLocaleString()}원</div>
                          {account.isDefault && <span className="default-badge">기본계좌</span>}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* 약관 동의 */}
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

          {/* 결제 버튼 */}
          <div className="payment-actions">
            <button onClick={() => navigate('/order', { state: { orderData } })} className="btn-secondary">
              이전으로
            </button>
            <button onClick={handlePayment} className="btn-payment" disabled={!agreedToTerms}>
              {orderAmount.finalPrice.toLocaleString()}원 결제하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;

