import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MyPage.css';

function MyPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editContent, setEditContent] = useState('');
  const [editingAccountId, setEditingAccountId] = useState(null);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [editBankName, setEditBankName] = useState('');
  const [editAccountNumber, setEditAccountNumber] = useState('');
  const [editAccountHolder, setEditAccountHolder] = useState('');
  const [accountsList, setAccountsList] = useState([
    { accountId: 1, bankName: 'KB국민은행', accountNumber: '123-456-789012', accountHolder: '홍길동', isDefault: true, balance: 500000 },
    { accountId: 2, bankName: '신한은행', accountNumber: '987-654-321098', accountHolder: '홍길동', isDefault: false, balance: 300000 }
  ]);
  const selectRef = useRef(null);
  const addSelectRef = useRef(null);

  // 임시 데이터 (나중에 API로 교체)
  const userInfo = {
    name: '홍길동',
    email: 'hong@example.com',
    phone: '010-1234-5678',
    address: '서울시 강남구 테헤란로 123'
  };

  const orders = [
    {
      orderId: 1,
      orderNumber: 'ORD20250114-001',
      orderDate: '2025-01-14',
      totalPrice: 178000,
      status: 'PAID',
      items: [
        { productName: '클래식 오버핏 코트', quantity: 1, price: 89000 },
        { productName: '베이직 티셔츠', quantity: 2, price: 58000 }
      ]
    },
    {
      orderId: 2,
      orderNumber: 'ORD20250113-002',
      orderDate: '2025-01-13',
      totalPrice: 79000,
      status: 'CONFIRMED',
      items: [
        { productName: '레더 스니커즈', quantity: 1, price: 79000 }
      ]
    },
    {
      orderId: 3,
      orderNumber: 'ORD20250114-003',
      orderDate: '2025-01-15',
      totalPrice: 178000,
      status: 'DELIVERED',
      items: [
        { productName: '클래식 오버핏 코트', quantity: 1, price: 89000 },
        { productName: '베이직 티셔츠', quantity: 2, price: 58000 }
      ]
    },
  ];

  const wishlist = [
    { id: 1, name: '슬림 데님 팬츠', price: 59000, image: 'https://via.placeholder.com/300x400/000000/FFFFFF?text=PANTS' },
    { id: 2, name: '미니멀 백팩', price: 49000, image: 'https://via.placeholder.com/300x400/FFFFFF/000000?text=BAG' }
  ];


  const refunds = [
    {
      refundId: 1,
      orderNumber: 'ORD20250110-003',
      productName: '베이직 티셔츠',
      refundType: 'REFUND',
      reason: '사이즈 불만',
      reasonDetail: '사이즈가 생각보다 작아서 환불 신청합니다.',
      refundAmount: 29000,
      status: 'COMPLETED',
      requestDate: '2025-01-11',
      completedDate: '2025-01-13',
      accountNumber: '123-456-789012'
    },
    {
      refundId: 2,
      orderNumber: 'ORD20250108-004',
      productName: '슬림 데님 팬츠',
      refundType: 'EXCHANGE',
      reason: '색상 불만',
      reasonDetail: '다른 색상으로 교환하고 싶습니다.',
      refundAmount: 59000,
      status: 'APPROVED',
      requestDate: '2025-01-09',
      completedDate: null,
      accountNumber: null
    },
    {
      refundId: 3,
      orderNumber: 'ORD20250105-005',
      productName: '미니멀 백팩',
      refundType: 'REFUND',
      reason: '상품 불량',
      reasonDetail: '지퍼가 고장났습니다.',
      refundAmount: 49000,
      status: 'REQUESTED',
      requestDate: '2025-01-12',
      completedDate: null,
      accountNumber: '987-654-321098'
    }
  ];

  const [reviews, setReviews] = useState([
    {
      reviewId: 1,
      productId: 1,
      productName: '클래식 오버핏 코트',
      productImage: 'https://via.placeholder.com/200x250/000000/FFFFFF?text=COAT',
      rating: 5,
      content: '정말 좋은 상품입니다! 품질도 좋고 사이즈도 딱 맞아요. 다음에도 또 구매할 예정입니다.',
      createdAt: '2025-01-15',
      updatedAt: '2025-01-15',
      orderNumber: 'ORD20250114-001'
    },
    {
      reviewId: 2,
      productId: 2,
      productName: '베이직 티셔츠',
      productImage: 'https://via.placeholder.com/200x250/FFFFFF/000000?text=T-SHIRT',
      rating: 4,
      content: '가격 대비 만족스럽습니다. 다만 색상이 사진보다 약간 다르네요.',
      createdAt: '2025-01-14',
      updatedAt: '2025-01-14',
      orderNumber: 'ORD20250114-001'
    },
    {
      reviewId: 3,
      productId: 3,
      productName: '레더 스니커즈',
      productImage: 'https://via.placeholder.com/200x250/FFFFFF/000000?text=SHOES',
      rating: 5,
      content: '신발이 정말 편하고 디자인도 예뻐요! 강력 추천합니다.',
      createdAt: '2025-01-13',
      updatedAt: '2025-01-13',
      orderNumber: 'ORD20250113-002'
    }
  ]);

  const getStatusText = (status) => {
    const statusMap = {
      'CONFIRMED': '주문확인',
      'PAID': '결제완료',
      'DELIVERED': '배송완료',
      'CANCELLED': '취소됨'
    };
    return statusMap[status] || status;
  };

  const getRefundTypeText = (type) => {
    const typeMap = {
      'REFUND': '환불',
      'EXCHANGE': '교환'
    };
    return typeMap[type] || type;
  };

  const getRefundStatusText = (status) => {
    const statusMap = {
      'REQUESTED': '신청완료',
      'APPROVED': '승인완료',
      'COMPLETED': '처리완료'
    };
    return statusMap[status] || status;
  };

  // 회원탈퇴 처리
  const handleDeleteAccount = () => {
    // 나중에 API 호출로 교체
    // 예: await deleteUserAccount();
    
    // localStorage에서 사용자 정보 삭제
    localStorage.removeItem('user');
    
    // 홈으로 이동
    navigate('/');
    
    // 모달 닫기
    setShowDeleteModal(false);
    setDeleteConfirmText('');
    
    // 실제로는 API 호출 후 성공 시 처리
    alert('회원탈퇴가 완료되었습니다.');
  };

  // 리뷰 수정 시작
  const handleStartEdit = (review) => {
    setEditingReviewId(review.reviewId);
    setEditRating(review.rating);
    setEditContent(review.content);
  };

  // 리뷰 수정 취소
  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(5);
    setEditContent('');
  };

  // 리뷰 수정 저장
  const handleSaveEdit = () => {
    if (!editContent.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }

    // 나중에 API 호출로 교체
    // 예: await updateReview(editingReviewId, { rating: editRating, content: editContent });

    // 임시로 상태 업데이트
    setReviews(reviews.map(review => 
      review.reviewId === editingReviewId
        ? { ...review, rating: editRating, content: editContent, updatedAt: new Date().toISOString().split('T')[0] }
        : review
    ));

    setEditingReviewId(null);
    setEditRating(5);
    setEditContent('');
    alert('리뷰가 수정되었습니다.');
  };

  // 리뷰 삭제
  const handleDeleteReview = (reviewId) => {
    if (window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      // 나중에 API 호출로 교체
      // 예: await deleteReview(reviewId);

      // 임시로 상태 업데이트
      setReviews(reviews.filter(review => review.reviewId !== reviewId));
      alert('리뷰가 삭제되었습니다.');
    }
  };

  // 계좌 수정 시작
  const handleStartEditAccount = (account) => {
    setEditingAccountId(account.accountId);
    setEditBankName(account.bankName);
    setEditAccountNumber(account.accountNumber);
    setEditAccountHolder(account.accountHolder);
  };

  // 드롭다운이 아래로 열리도록 처리
  useEffect(() => {
    const handleMouseDown = (e) => {
      if (e.target.tagName === 'SELECT' && selectRef.current) {
        const select = e.target;
        const rect = select.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        // 아래 공간이 부족하고 위 공간이 더 많으면 스크롤 조정
        if (spaceBelow < 200 && spaceAbove > spaceBelow) {
          setTimeout(() => {
            select.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 10);
        }
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [editingAccountId]);

  // 계좌 수정 취소
  const handleCancelEditAccount = () => {
    setEditingAccountId(null);
    setEditBankName('');
    setEditAccountNumber('');
    setEditAccountHolder('');
  };

  // 계좌 추가 시작
  const handleStartAddAccount = () => {
    setIsAddingAccount(true);
    setEditBankName('');
    setEditAccountNumber('');
    setEditAccountHolder('');
  };

  // 계좌 추가 취소
  const handleCancelAddAccount = () => {
    setIsAddingAccount(false);
    setEditBankName('');
    setEditAccountNumber('');
    setEditAccountHolder('');
  };

  // 계좌 추가 저장
  const handleSaveAddAccount = () => {
    if (!editBankName.trim() || !editAccountNumber.trim() || !editAccountHolder.trim()) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    // 나중에 API 호출로 교체
    // 예: await addAccount({ bankName: editBankName, accountNumber: editAccountNumber, accountHolder: editAccountHolder });

    // 새 계좌 ID 생성 (실제로는 서버에서 받아옴)
    const newAccountId = Math.max(...accountsList.map(acc => acc.accountId), 0) + 1;

    // 임시로 상태 업데이트
    setAccountsList([
      ...accountsList,
      {
        accountId: newAccountId,
        bankName: editBankName,
        accountNumber: editAccountNumber,
        accountHolder: editAccountHolder,
        isDefault: accountsList.length === 0, // 첫 계좌면 기본계좌로 설정
        balance: 0
      }
    ]);

    setIsAddingAccount(false);
    setEditBankName('');
    setEditAccountNumber('');
    setEditAccountHolder('');
    alert('계좌가 추가되었습니다.');
  };

  // 계좌 수정 저장
  const handleSaveEditAccount = () => {
    if (!editBankName.trim() || !editAccountNumber.trim() || !editAccountHolder.trim()) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    // 나중에 API 호출로 교체
    // 예: await updateAccount(editingAccountId, { bankName: editBankName, accountNumber: editAccountNumber, accountHolder: editAccountHolder });

    // 임시로 상태 업데이트
    setAccountsList(accountsList.map(account => 
      account.accountId === editingAccountId
        ? { ...account, bankName: editBankName, accountNumber: editAccountNumber, accountHolder: editAccountHolder }
        : account
    ));

    setEditingAccountId(null);
    setEditBankName('');
    setEditAccountNumber('');
    setEditAccountHolder('');
    alert('계좌 정보가 수정되었습니다.');
  };

  // 기본 계좌 설정
  const handleSetDefaultAccount = (accountId) => {
    // 나중에 API 호출로 교체
    // 예: await setDefaultAccount(accountId);

    // 선택한 계좌를 기본 계좌로 설정하고, 나머지는 모두 false로 설정
    const updatedAccounts = accountsList.map(account => 
      account.accountId === accountId
        ? { ...account, isDefault: true }
        : { ...account, isDefault: false }
    );

    // 임시로 상태 업데이트
    setAccountsList(updatedAccounts);
    alert('기본 계좌가 설정되었습니다.');
  };

  // 계좌 삭제
  const handleDeleteBankAccount = (accountId) => {
    const account = accountsList.find(acc => acc.accountId === accountId);
    if (!account) return;

    if (window.confirm(`정말로 ${account.bankName} 계좌를 삭제하시겠습니까?`)) {
      // 나중에 API 호출로 교체
      // 예: await deleteAccount(accountId);

      // 기본계좌를 삭제하는 경우, 다른 계좌가 있으면 첫 번째 계좌를 기본계좌로 설정
      let updatedAccounts = accountsList.filter(acc => acc.accountId !== accountId);
      
      if (account.isDefault && updatedAccounts.length > 0) {
        updatedAccounts = updatedAccounts.map((acc, index) => 
          index === 0 ? { ...acc, isDefault: true } : acc
        );
      }

      // 임시로 상태 업데이트
      setAccountsList(updatedAccounts);
      alert('계좌가 삭제되었습니다.');
    }
  };

  return (
    <div className="mypage">
      <div className="container">
        <h1 className="mypage-title">마이페이지</h1>

        {/* 탭 메뉴 */}
        <div className="mypage-tabs">
          <button 
            className={activeTab === 'profile' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('profile')}
          >
            프로필
          </button>
          <button 
            className={activeTab === 'orders' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('orders')}
          >
            주문 내역
          </button>
          <button 
            className={activeTab === 'wishlist' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('wishlist')}
          >
            찜 목록
          </button>
          <button 
            className={activeTab === 'accounts' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('accounts')}
          >
            계좌 관리
          </button>
          <button 
            className={activeTab === 'refunds' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('refunds')}
          >
            취소/반품 내역
          </button>
          <button 
            className={activeTab === 'reviews' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('reviews')}
          >
            내 리뷰
          </button>
        </div>

        {/* 프로필 탭 */}
        {activeTab === 'profile' && (
          <div className="tab-content">
            <div className="profile-section">
              <h2>회원 정보</h2>
              <div className="profile-info">
                <div className="info-row">
                  <label>이름</label>
                  <div className="info-value">{userInfo.name}</div>
                </div>
                <div className="info-row">
                  <label>이메일</label>
                  <div className="info-value">{userInfo.email}</div>
                </div>
                <div className="info-row">
                  <label>전화번호</label>
                  <div className="info-value">{userInfo.phone}</div>
                </div>
                <div className="info-row">
                  <label>주소</label>
                  <div className="info-value">{userInfo.address}</div>
                </div>
              </div>
              <div className="profile-actions">
                <button 
                  className="btn-primary"
                  onClick={() => navigate('/edit-profile')}
                >
                  정보 수정
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => navigate('/change-password')}
                >
                  비밀번호 변경
                </button>
                <button 
                  className="btn-delete-account"
                  onClick={() => setShowDeleteModal(true)}
                >
                  회원탈퇴
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 주문 내역 탭 */}
        {activeTab === 'orders' && (
          <div className="tab-content">
            <h2>주문 내역</h2>
            {orders.length === 0 ? (
              <div className="empty-state">
                <p>주문 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.orderId} className="order-card">
                    <div className="order-header">
                      <div>
                        <span className="order-number">주문번호: {order.orderNumber}</span>
                        <span className="order-date">{order.orderDate}</span>
                      </div>
                      <span className={`order-status ${order.status.toLowerCase()}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="order-items">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item">
                          <span className="item-name">{item.productName}</span>
                          <span className="item-quantity">수량: {item.quantity}</span>
                          <span className="item-price">{item.price.toLocaleString()}원</span>
                        </div>
                      ))}
                    </div>
                    <div className="order-footer">
                      <div className="order-total">
                        총 결제금액: <strong>{order.totalPrice.toLocaleString()}원</strong>
                      </div>
                      <div className="order-actions">
                        <button 
                          className="btn-secondary"
                          onClick={() => navigate(`/order/${order.orderId}`, { state: { order } })}
                        >
                          상세보기
                        </button>
                        {order.status === 'PAID' && (
                          <button 
                            className="btn-secondary"
                            onClick={() => navigate(`/order/${order.orderId}`, { state: { order } })}
                          >
                            환불신청
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 찜 목록 탭 */}
        {activeTab === 'wishlist' && (
          <div className="tab-content">
            <h2>찜 목록</h2>
            {wishlist.length === 0 ? (
              <div className="empty-state">
                <p>찜한 상품이 없습니다.</p>
              </div>
            ) : (
              <div className="wishlist-grid">
                {wishlist.map(item => (
                  <div key={item.id} className="wishlist-item">
                    <Link to={`/product/${item.id}`} className="wishlist-image">
                      <img src={item.image} alt={item.name} />
                    </Link>
                    <div className="wishlist-info">
                      <Link to={`/product/${item.id}`} className="wishlist-name">
                        {item.name}
                      </Link>
                      <div className="wishlist-price">{item.price.toLocaleString()}원</div>
                      <button className="btn-remove">삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 계좌 관리 탭 */}
        {activeTab === 'accounts' && (
          <div className="tab-content">
            <div className="accounts-header">
              <h2>계좌 관리</h2>
              <button 
                className="btn-primary"
                onClick={handleStartAddAccount}
                disabled={isAddingAccount}
              >
                계좌 추가
              </button>
            </div>
            
            {/* 계좌 추가 폼 */}
            {isAddingAccount && (
              <div className="account-card">
                <div className="account-edit-form">
                  <div className="form-group">
                    <label>은행명</label>
                    <select
                      ref={addSelectRef}
                      value={editBankName}
                      onChange={(e) => setEditBankName(e.target.value)}
                      className="form-input"
                      onFocus={(e) => {
                        const select = e.target;
                        const rect = select.getBoundingClientRect();
                        const viewportHeight = window.innerHeight;
                        const spaceBelow = viewportHeight - rect.bottom;
                        
                        if (spaceBelow < 300) {
                          setTimeout(() => {
                            select.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 50);
                        }
                      }}
                    >
                      <option value="">은행을 선택하세요</option>
                      <option value="KB국민은행">KB국민은행</option>
                      <option value="신한은행">신한은행</option>
                      <option value="우리은행">우리은행</option>
                      <option value="하나은행">하나은행</option>
                      <option value="NH농협은행">NH농협은행</option>
                      <option value="IBK기업은행">IBK기업은행</option>
                      <option value="카카오뱅크">카카오뱅크</option>
                      <option value="토스뱅크">토스뱅크</option>
                      <option value="SC제일은행">SC제일은행</option>
                      <option value="한국씨티은행">한국씨티은행</option>
                      <option value="대구은행">대구은행</option>
                      <option value="부산은행">부산은행</option>
                      <option value="경남은행">경남은행</option>
                      <option value="광주은행">광주은행</option>
                      <option value="전북은행">전북은행</option>
                      <option value="제주은행">제주은행</option>
                      <option value="새마을금고">새마을금고</option>
                      <option value="신협">신협</option>
                      <option value="수협은행">수협은행</option>
                      <option value="우체국">우체국</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>계좌번호</label>
                    <input
                      type="text"
                      value={editAccountNumber}
                      onChange={(e) => setEditAccountNumber(e.target.value)}
                      className="form-input"
                      placeholder="계좌번호를 입력하세요"
                    />
                  </div>
                  <div className="form-group">
                    <label>예금주</label>
                    <input
                      type="text"
                      value={editAccountHolder}
                      onChange={(e) => setEditAccountHolder(e.target.value)}
                      className="form-input"
                      placeholder="예금주를 입력하세요"
                    />
                  </div>
                  <div className="account-edit-actions">
                    <button className="btn-secondary" onClick={handleCancelAddAccount}>
                      취소
                    </button>
                    <button className="btn-primary" onClick={handleSaveAddAccount}>
                      저장
                    </button>
                  </div>
                </div>
              </div>
            )}

            {accountsList.length === 0 && !isAddingAccount ? (
              <div className="empty-state">
                <p>등록된 계좌가 없습니다.</p>
              </div>
            ) : (
              <div className="accounts-list">
                {accountsList.map(account => (
                  <div key={account.accountId} className="account-card">
                    {account.isDefault && <span className="default-flag">기본계좌</span>}
                    {editingAccountId === account.accountId ? (
                      <div className="account-edit-form">
                        <div className="form-group">
                          <label>은행명</label>
                          <select
                            ref={selectRef}
                            value={editBankName}
                            onChange={(e) => setEditBankName(e.target.value)}
                            className="form-input"
                            onFocus={(e) => {
                              // 드롭다운이 아래로 열리도록 요소를 화면 상단으로 스크롤
                              const select = e.target;
                              const rect = select.getBoundingClientRect();
                              const viewportHeight = window.innerHeight;
                              const spaceBelow = viewportHeight - rect.bottom;
                              
                              if (spaceBelow < 300) {
                                setTimeout(() => {
                                  select.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }, 50);
                              }
                            }}
                          >
                            <option value="">은행을 선택하세요</option>
                            <option value="KB국민은행">KB국민은행</option>
                            <option value="신한은행">신한은행</option>
                            <option value="우리은행">우리은행</option>
                            <option value="하나은행">하나은행</option>
                            <option value="NH농협은행">NH농협은행</option>
                            <option value="IBK기업은행">IBK기업은행</option>
                            <option value="카카오뱅크">카카오뱅크</option>
                            <option value="토스뱅크">토스뱅크</option>
                            <option value="SC제일은행">SC제일은행</option>
                            <option value="한국씨티은행">한국씨티은행</option>
                            <option value="대구은행">대구은행</option>
                            <option value="부산은행">부산은행</option>
                            <option value="경남은행">경남은행</option>
                            <option value="광주은행">광주은행</option>
                            <option value="전북은행">전북은행</option>
                            <option value="제주은행">제주은행</option>
                            <option value="새마을금고">새마을금고</option>
                            <option value="신협">신협</option>
                            <option value="수협은행">수협은행</option>
                            <option value="우체국">우체국</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>계좌번호</label>
                          <input
                            type="text"
                            value={editAccountNumber}
                            onChange={(e) => setEditAccountNumber(e.target.value)}
                            className="form-input"
                            placeholder="계좌번호를 입력하세요"
                          />
                        </div>
                        <div className="form-group">
                          <label>예금주</label>
                          <input
                            type="text"
                            value={editAccountHolder}
                            onChange={(e) => setEditAccountHolder(e.target.value)}
                            className="form-input"
                            placeholder="예금주를 입력하세요"
                          />
                        </div>
                        <div className="account-edit-actions">
                          <button className="btn-secondary" onClick={handleCancelEditAccount}>
                            취소
                          </button>
                          <button className="btn-primary" onClick={handleSaveEditAccount}>
                            저장
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="account-info">
                          <div className="account-bank">{account.bankName}</div>
                          <div className="account-number">{account.accountNumber}</div>
                          <div className="account-holder">예금주: {account.accountHolder}</div>
                          <div className="account-balance">잔액: {account.balance.toLocaleString()}원</div>
                        </div>
                        <div className="account-actions">
                          {!account.isDefault && (
                            <button 
                              className="btn-secondary"
                              onClick={() => handleSetDefaultAccount(account.accountId)}
                            >
                              기본계좌로 설정
                            </button>
                          )}
                          <button 
                            className="btn-secondary"
                            onClick={() => handleStartEditAccount(account)}
                          >
                            수정
                          </button>
                          <button 
                            className="btn-danger"
                            onClick={() => handleDeleteBankAccount(account.accountId)}
                          >
                            삭제
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 취소/반품 내역 탭 */}
        {activeTab === 'refunds' && (
          <div className="tab-content">
            <h2>취소/반품 내역</h2>
            {refunds.length === 0 ? (
              <div className="empty-state">
                <p>취소/반품 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="refunds-list">
                {refunds.map(refund => (
                  <div key={refund.refundId} className="refund-card">
                    <div className="refund-header">
                      <div className="refund-type-badge">
                        {getRefundTypeText(refund.refundType)}
                      </div>
                      <span className={`refund-status ${refund.status.toLowerCase()}`}>
                        {getRefundStatusText(refund.status)}
                      </span>
                    </div>
                    <div className="refund-info">
                      <div className="refund-row">
                        <label>주문번호</label>
                        <div className="refund-value">{refund.orderNumber}</div>
                      </div>
                      <div className="refund-row">
                        <label>상품명</label>
                        <div className="refund-value">{refund.productName}</div>
                      </div>
                      <div className="refund-row">
                        <label>신청일</label>
                        <div className="refund-value">{refund.requestDate}</div>
                      </div>
                      {refund.completedDate && (
                        <div className="refund-row">
                          <label>처리완료일</label>
                          <div className="refund-value">{refund.completedDate}</div>
                        </div>
                      )}
                      <div className="refund-row">
                        <label>사유</label>
                        <div className="refund-value">{refund.reason}</div>
                      </div>
                      <div className="refund-row">
                        <label>상세사유</label>
                        <div className="refund-value refund-detail">{refund.reasonDetail}</div>
                      </div>
                      <div className="refund-row">
                        <label>환불금액</label>
                        <div className="refund-value refund-amount">
                          {refund.refundAmount.toLocaleString()}원
                        </div>
                      </div>
                      {refund.accountNumber && (
                        <div className="refund-row">
                          <label>환불계좌</label>
                          <div className="refund-value">{refund.accountNumber}</div>
                        </div>
                      )}
                    </div>
                    {refund.status === 'REQUESTED' && (
                      <div className="refund-actions">
                        <button className="btn-secondary">신청 취소</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 내 리뷰 탭 */}
        {activeTab === 'reviews' && (
          <div className="tab-content">
            <h2>내 리뷰</h2>
            {reviews.length === 0 ? (
              <div className="empty-state">
                <p>작성한 리뷰가 없습니다.</p>
              </div>
            ) : (
              <div className="reviews-list">
                {reviews.map(review => (
                  <div key={review.reviewId} className="review-card">
                    <div className="review-product-info">
                      <Link to={`/product/${review.productId}`} className="review-product-image">
                        <img src={review.productImage} alt={review.productName} />
                      </Link>
                      <div className="review-product-details">
                        <Link to={`/product/${review.productId}`} className="review-product-name">
                          {review.productName}
                        </Link>
                        <div className="review-order-info">
                          <span>주문번호: {review.orderNumber}</span>
                          <span>작성일: {review.createdAt}</span>
                          {review.updatedAt !== review.createdAt && (
                            <span className="review-updated">수정됨</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {editingReviewId === review.reviewId ? (
                      <div className="review-edit-form">
                        <div className="rating-edit">
                          <label>평점</label>
                          <div className="star-rating">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type="button"
                                className={`star-btn ${star <= editRating ? 'active' : ''}`}
                                onClick={() => setEditRating(star)}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="content-edit">
                          <label>리뷰 내용</label>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="review-textarea"
                            rows="5"
                            placeholder="리뷰 내용을 입력하세요"
                          />
                        </div>
                        <div className="review-edit-actions">
                          <button className="btn-secondary" onClick={handleCancelEdit}>
                            취소
                          </button>
                          <button className="btn-primary" onClick={handleSaveEdit}>
                            저장
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="review-rating-display">
                          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </div>
                        <div className="review-content-display">
                          {review.content}
                        </div>
                        <div className="review-actions">
                          <button 
                            className="btn-secondary"
                            onClick={() => handleStartEdit(review)}
                          >
                            수정
                          </button>
                          <button 
                            className="btn-danger"
                            onClick={() => handleDeleteReview(review.reviewId)}
                          >
                            삭제
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 회원탈퇴 확인 모달 */}
        {showDeleteModal && (
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>회원탈퇴</h3>
              <div className="modal-body">
                <p className="warning-text">
                  정말로 회원탈퇴를 하시겠습니까?
                </p>
                <p className="warning-detail">
                  회원탈퇴 시 모든 정보가 삭제되며 복구할 수 없습니다.
                  <br />
                  주문 내역, 찜 목록, 계좌 정보 등 모든 데이터가 삭제됩니다.
                </p>
                <div className="delete-confirm">
                  <label>탈퇴를 확인하려면 "탈퇴합니다"를 입력하세요.</label>
                  <input
                    type="text"
                    placeholder="탈퇴합니다"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="delete-input"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText('');
                  }}
                >
                  취소
                </button>
                <button
                  className="btn-danger"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== '탈퇴합니다'}
                >
                  탈퇴하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyPage;

