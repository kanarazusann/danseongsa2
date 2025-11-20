import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MyPage.css';
import { fetchSessionUser, logout } from '../services/authService';
import { getWishlist, removeWishlist } from '../services/productService';
import { getOrdersByUserId, getUserRefunds, cancelRefundRequest } from '../services/orderService';
import { getOrdersByUserId } from '../services/orderService';
import { getReviewsByUserId, updateReview, deleteReview } from '../services/reviewService';
import ProductCard from '../components/ProductCard';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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
  const [userId, setUserId] = useState(null);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [refunds, setRefunds] = useState([]);
  const [loadingRefunds, setLoadingRefunds] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);


  

  // 날짜 포맷팅 함수 (YYYY-MM-DD)
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return dateString;
    }
  };
  
  // 이미지 URL 처리
  const resolveImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/200x250/CCCCCC/666666?text=No+Image';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
    return `${API_BASE_URL}/${url}`;
  };

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
      'EXCHANGE': '교환',
      'CANCEL': '취소'
    };
    return typeMap[type] || type;
  };

  const getRefundStatusText = (status) => {
    const statusMap = {
      'REQUESTED': '승인 대기',
      'APPROVED': '승인됨',
      'REJECTED': '거절됨',
      'COMPLETED': '처리 완료',
      'CANCELED': '사용자 취소'
    };
    return statusMap[status?.toUpperCase()] || status || '';
  };

  const handleCancelRefundRequest = async (refundId) => {
    if (!userId) return;
    if (!window.confirm('신청을 취소하시겠습니까?')) {
      return;
    }
    try {
      await cancelRefundRequest(refundId, userId);
      const response = await getUserRefunds(userId);
      setRefunds(response.items || []);
      alert('신청이 취소되었습니다.');
    } catch (error) {
      alert(error.message || '신청 취소 중 오류가 발생했습니다.');
    }
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
        setUserId(item.userId);
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
  
  // 리뷰 목록 로드
  useEffect(() => {
    const loadReviews = async () => {
      if (activeTab !== 'reviews') return;
      
      try {
        setLoadingReviews(true);
        const { item: userInfo } = await fetchSessionUser();
        const response = await getReviewsByUserId(userInfo.userId);
        
        if (response.rt === 'OK' && response.items) {
          const formattedReviews = response.items.map(review => ({
            reviewId: review.reviewId,
            postId: review.postId,
            productId: review.productId || review.postId,
            productName: review.productName || '',
            productImage: resolveImageUrl(review.productImage),
            brand: review.brand || '',
            rating: review.rating,
            content: review.content || '',
            createdAt: formatDate(review.createdAt),
            updatedAt: formatDate(review.updatedAt),
            orderNumber: review.orderNumber || ''
          }));
          setReviews(formattedReviews);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error('리뷰 목록 로드 오류:', error);
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };
    
    loadReviews();
  }, [activeTab, navigate]);

  // 취소/반품 내역 로드
  useEffect(() => {
    const loadRefunds = async () => {
      if (activeTab !== 'refunds' || !userId) return;

      try {
        setLoadingRefunds(true);
        const response = await getUserRefunds(userId);
        setRefunds(response.items || []);
      } catch (error) {
        console.error('취소/반품 내역 로드 오류:', error);
        setRefunds([]);
      } finally {
        setLoadingRefunds(false);
      }
    };

    loadRefunds();
  }, [activeTab, userId]);

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
  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }

    try {
      const { item: userInfo } = await fetchSessionUser();
      await updateReview(editingReviewId, {
        userId: userInfo.userId,
        rating: editRating,
        content: editContent.trim(),
        images: [] // 이미지 수정은 나중에 추가 가능
      });

      // 리뷰 목록 다시 로드
      const response = await getReviewsByUserId(userInfo.userId);
      if (response.rt === 'OK' && response.items) {
        const formattedReviews = response.items.map(review => ({
          reviewId: review.reviewId,
          postId: review.postId,
          productId: review.productId || review.postId,
          productName: review.productName || '',
          productImage: resolveImageUrl(review.productImage),
          brand: review.brand || '',
          rating: review.rating,
          content: review.content || '',
          createdAt: formatDate(review.createdAt),
          updatedAt: formatDate(review.updatedAt),
          orderNumber: review.orderNumber || ''
        }));
        setReviews(formattedReviews);
      }

      setEditingReviewId(null);
      setEditRating(5);
      setEditContent('');
      alert('리뷰가 수정되었습니다.');
    } catch (error) {
      console.error('리뷰 수정 오류:', error);
      alert(error.message || '리뷰 수정 중 오류가 발생했습니다.');
    }
  };

  // 리뷰 삭제
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const { item: userInfo } = await fetchSessionUser();
      await deleteReview(reviewId, userInfo.userId);

      // 리뷰 목록에서 제거
      setReviews(reviews.filter(review => review.reviewId !== reviewId));
      alert('리뷰가 삭제되었습니다.');
    } catch (error) {
      console.error('리뷰 삭제 오류:', error);
      alert(error.message || '리뷰 삭제 중 오류가 발생했습니다.');
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
            {loadingRefunds ? (
              <div className="loading">로딩 중...</div>
            ) : refunds.length === 0 ? (
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
                      <span className={`refund-status ${refund.status?.toLowerCase() || ''}`}>
                        {getRefundStatusText(refund.status)}
                      </span>
                    </div>
                    <div className="refund-info">
                      <div className="refund-row">
                        <label>주문번호</label>
                        <div className="refund-value">{refund.orderNumber || '-'}</div>
                      </div>
                      <div className="refund-row">
                        <label>상품명</label>
                        <div className="refund-value">{refund.productName || '-'}</div>
                      </div>
                      <div className="refund-row">
                        <label>신청일</label>
                        <div className="refund-value">{refund.createdAt ? refund.createdAt.split('T')[0] : '-'}</div>
                      </div>
                      {refund.updatedAt && (
                        <div className="refund-row">
                          <label>최근 업데이트</label>
                          <div className="refund-value">{refund.updatedAt.split('T')[0]}</div>
                        </div>
                      )}
                      <div className="refund-row">
                        <label>사유</label>
                        <div className="refund-value">{refund.reason || '-'}</div>
                      </div>
                      {refund.reasonDetail && (
                        <div className="refund-row">
                          <label>상세사유</label>
                          <div className="refund-value refund-detail">{refund.reasonDetail}</div>
                        </div>
                      )}
                      {refund.refundAmount !== null && refund.refundAmount !== undefined && (
                        <div className="refund-row">
                          <label>환불금액</label>
                          <div className="refund-value refund-amount">
                            {Number(refund.refundAmount).toLocaleString()}원
                          </div>
                        </div>
                      )}
                      {refund.sellerResponse && (
                        <div className="refund-row">
                          <label>판매자 메모</label>
                          <div className="refund-value">{refund.sellerResponse}</div>
                        </div>
                      )}
                    </div>
                    {refund.status?.toUpperCase() === 'REQUESTED' && (
                      <div className="refund-actions">
                        <button
                          className="btn-secondary"
                          onClick={() => handleCancelRefundRequest(refund.refundId)}
                        >
                          신청 취소
                        </button>
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
            {loadingReviews ? (
              <div className="empty-state">
                <p>로딩 중...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="empty-state">
                <p>작성한 리뷰가 없습니다.</p>
              </div>
            ) : (
              <div className="reviews-list">
                {reviews.map(review => (
                  <div key={review.reviewId} className="review-card">
                    <div className="review-product-info">
                      <Link to={`/product?productId=${review.postId}`} className="review-product-image">
                        <img 
                          src={review.productImage} 
                          alt={review.productName}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/200x250/CCCCCC/666666?text=No+Image';
                          }}
                        />
                      </Link>
                      <div className="review-product-details">
                        <Link to={`/product?productId=${review.postId}`} className="review-product-name">
                          {review.productName}
                        </Link>
                        {review.brand && (
                          <p className="review-brand">{review.brand}</p>
                        )}
                        <div className="review-order-info">
                          {review.orderNumber && <span>주문번호: {review.orderNumber}</span>}
                          <span>작성일: {review.createdAt}</span>
                          {review.updatedAt && review.updatedAt !== review.createdAt && (
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


