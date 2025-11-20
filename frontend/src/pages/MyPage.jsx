import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MyPage.css';
import { fetchSessionUser, logout } from '../services/authService';
import { getWishlist, removeWishlist } from '../services/productService';
import { getOrdersByUserId } from '../services/orderService';
import ProductCard from '../components/ProductCard';

function MyPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editContent, setEditContent] = useState('');

  // 세션에서 가져온 사용자 정보
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    zipcode: '',
    detailAddress: ''
  });

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);


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
      'PAID': '결제완료',
      'DELIVERING': '배송중',
      'DELIVERED': '배송완료'
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

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const { item } = await fetchSessionUser();
        // 주소 정보를 하나로 합치기
        const fullAddress = item.address 
          ? (item.detailAddress ? `${item.address} ${item.detailAddress}` : item.address)
          : '';
        
        setUserInfo({
          name: item.name || '',
          email: item.email || '',
          phone: item.phone || '',
          address: fullAddress,
          zipcode: item.zipcode || '',
          detailAddress: item.detailAddress || ''
        });
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
        alert('로그인이 필요합니다.');
        navigate('/login');
      }
    };
    loadUserInfo();
  }, [navigate]);

  // 주문 내역 로드
  useEffect(() => {
    const loadOrders = async () => {
      if (activeTab !== 'orders') return;
      
      try {
        setLoadingOrders(true);
        const { item: userInfo } = await fetchSessionUser();
        const response = await getOrdersByUserId(userInfo.userId);
        
        if (response.rt === 'OK' && response.items) {
          // API 응답을 UI 형식에 맞게 변환
          const formattedOrders = response.items.map(order => {
            // 주문일자를 날짜 형식으로 변환 (ISO 형식에서 날짜만 추출)
            let orderDate = '';
            if (order.orderDate) {
              const date = new Date(order.orderDate);
              orderDate = date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
            }
            
            // 주문 상품 목록 변환
            const items = order.items ? order.items.map(item => ({
              productName: item.productName || '',
              quantity: item.quantity || 1,
              price: (item.price || 0) * (item.quantity || 1) // 총 가격
            })) : [];
            
            return {
              orderId: order.orderId,
              orderNumber: order.orderNumber || '',
              orderDate: orderDate,
              totalPrice: order.finalPrice || order.totalPrice || 0,
              status: order.orderStatus || '',
              items: items
            };
          });
          setOrders(formattedOrders);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error('주문 내역 로드 오류:', error);
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };
    
    loadOrders();
  }, [activeTab, navigate]);

  // 찜목록 로드
  useEffect(() => {
    const loadWishlist = async () => {
      if (activeTab !== 'wishlist') return;
      
      try {
        setLoadingWishlist(true);
        const { item: userInfo } = await fetchSessionUser();
        const response = await getWishlist(userInfo.userId);
        
        if (response.rt === 'OK' && response.items) {
          // Home.jsx와 동일한 변환 로직
          const formattedProducts = response.items.map(item => ({
            id: item.postId,
            brand: item.brand || '',
            name: item.postName || '',
            price: item.price || 0,
            discountPrice: item.discountPrice || null,
            image: item.imageUrl ? (item.imageUrl.startsWith('http') 
              ? item.imageUrl 
              : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${item.imageUrl}`) 
              : null
          }));
          setWishlist(formattedProducts);
        } else {
          setWishlist([]);
        }
      } catch (error) {
        console.error('찜목록 로드 오류:', error);
        setWishlist([]);
      } finally {
        setLoadingWishlist(false);
      }
    };
    
    loadWishlist();
  }, [activeTab, navigate]);

  // 찜 삭제 처리
  const handleRemoveWishlist = async (postId) => {
    if (!window.confirm('찜 목록에서 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      const { item: userInfo } = await fetchSessionUser();
      await removeWishlist(userInfo.userId, postId);
      
      // 목록에서 제거
      setWishlist(wishlist.filter(item => item.id !== postId));
      alert('찜 목록에서 삭제되었습니다.');
    } catch (error) {
      console.error('찜 삭제 오류:', error);
      alert('찜 삭제 중 오류가 발생했습니다.');
    }
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
  const handleDeleteAccount = async () => {
    // TODO: 실제 회원탈퇴 API 연동
    try {
      await logout();
    } catch (error) {
      console.error(error);
    }

    navigate('/');
    setShowDeleteModal(false);
    setDeleteConfirmText('');
    alert('회원탈퇴가 완료되었습니다. (임시 처리)');
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
                  <div className="info-value">
                    {userInfo.zipcode && `[${userInfo.zipcode}] `}
                    {userInfo.address || '주소 정보가 없습니다.'}
                  </div>
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
            {loadingOrders ? (
              <div className="empty-state">
                <p>로딩 중...</p>
              </div>
            ) : orders.length === 0 ? (
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
            {loadingWishlist ? (
              <div className="empty-state">
                <p>로딩 중...</p>
              </div>
            ) : wishlist.length === 0 ? (
              <div className="empty-state">
                <p>찜한 상품이 없습니다.</p>
              </div>
            ) : (
              <div className="wishlist-grid">
                {wishlist.map(product => (
                  <div key={product.id} className="wishlist-item-wrapper">
                    <ProductCard product={product} />
                    <button 
                      className="btn-remove-wishlist"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveWishlist(product.id);
                      }}
                      aria-label="찜 삭제"
                    >
                      ×
                    </button>
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


