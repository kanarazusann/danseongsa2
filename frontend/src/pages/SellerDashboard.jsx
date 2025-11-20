import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './SellerDashboard.css';
import { fetchSessionUser } from '../services/authService';
import { getSellerOrders } from '../services/orderService';
import { getProductPostsByBrand } from '../services/productService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const resolveImageUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/')) return `${API_BASE_URL}${trimmed}`;
  return `${API_BASE_URL}/${trimmed}`;
};

const PRODUCT_STATUS_TEXT = {
  SELLING: '판매',
  SOLD_OUT: '품절'
};

const ORDER_STATUS_TEXT = {
  PAID: '결제완료',
  DELIVERING: '배송중',
  DELIVERED: '배송완료',
  CANCELED: '취소됨',
  CANCELLED: '취소됨',
  REFUND_REQUESTED: '환불요청중',
  REFUNDED: '환불완료',
  EXCHANGE_REQUESTED: '교환요청중',
  EXCHANGED: '교환완료'
};

const getOrderStatusText = (status) => {
  if (!status) return '결제완료';
  const key = status.toUpperCase();
  return ORDER_STATUS_TEXT[key] || status;
};

const getOrderStatusClass = (status) => {
  if (!status) return 'paid';
  const key = status.toLowerCase();
  switch (key) {
    case 'paid':
      return 'paid';
    case 'delivering':
      return 'delivering';
    case 'delivered':
      return 'delivered';
    case 'refund_requested':
      return 'refund-requested';
    case 'refunded':
      return 'refunded';
    case 'exchange_requested':
      return 'exchange-requested';
    case 'exchanged':
      return 'exchanged';
    case 'canceled':
    case 'cancelled':
      return 'cancelled';
    default:
      return 'paid';
  }
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
import { getProductPostsByBrand } from '../services/productService';

function SellerDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'dashboard');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [sellerId, setSellerId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 세션에서 가져온 사용자 정보
  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    businessNumber: '',
    zipcode: '',
    address: '',
    detailAddress: ''
  });

  // URL 파라미터가 변경되면 activeTab 업데이트
  useEffect(() => {
    if (tabParam && ['dashboard', 'business', 'products', 'orders', 'reviews'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // activeTab이 변경되면 상단으로 스크롤
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  // 세션에서 사용자 정보 가져오기 및 브랜드로 상품 목록 조회
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const { item } = await fetchSessionUser();
        setSellerId(item.userId);
        setBusinessInfo({
          name: item.name || '',
          email: item.email || '',
          phone: item.phone || '',
          businessName: item.brand || '',
          businessNumber: item.businessNumber || '',
          zipcode: item.zipcode || '',
          address: item.address || '',
          detailAddress: item.detailAddress || ''
        });       
        loadProductsByBrand(item.brand);
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
        alert('로그인이 필요합니다.');
        navigate('/login');
      }
    };
    loadUserInfo();
  }, [navigate]);

  useEffect(() => {
    if (!sellerId) return;

    const loadSellerOrders = async () => {
      try {
        setOrdersLoading(true);
        setOrdersError('');
        const data = await getSellerOrders(sellerId);
        setOrders(data.items || []);
      } catch (error) {
        console.error('판매자 주문 조회 오류:', error);
        setOrders([]);
        setOrdersError(error.message || '주문 정보를 불러오지 못했습니다.');
      } finally {
        setOrdersLoading(false);
      }
    };

    loadSellerOrders();
  }, [sellerId]);

  
  // 브랜드로 상품 목록 조회
  const loadProductsByBrand = async (businessName) => {
    if (!businessName) return;
    
    setLoading(true);
    try {
      const response = await getProductPostsByBrand(businessName);
      if (response.items && response.items.length > 0) {
        // API 응답 데이터를 컴포넌트에서 사용하는 형식으로 변환
        const formattedProducts = response.items.map(item => ({
          productId: item.postId, // postId를 productId로 사용
          productName: item.postName,
          price: item.price || 0,
          discountPrice: item.discountPrice || null,
          status: item.status || 'SELLING',
          viewCount: item.viewCount || 0,
          createdAt: item.createdAt ? item.createdAt.split('T')[0] : '', // 날짜만 추출
          // ProductList와 동일한 방식으로 이미지 URL 처리
          image: item.imageUrl ? (item.imageUrl.startsWith('http') ? item.imageUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${item.imageUrl}`) : null
        }));
        setProducts(formattedProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('상품 목록 조회 실패:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };


  const reviews = [
    {
      reviewId: 1,
      productName: '클래식 오버핏 코트',
      userName: '김철수',
      rating: 5,
      content: '정말 좋은 상품입니다! 품질도 좋고 사이즈도 딱 맞아요.',
      createdAt: '2025-01-15'
    },
    {
      reviewId: 2,
      productName: '베이직 티셔츠',
      userName: '이영희',
      rating: 4,
      content: '가격 대비 만족스럽습니다.',
      createdAt: '2025-01-14'
    }
  ];

  const stats = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        todayOrders: 0,
        todayRevenue: 0,
        totalProducts: products.length,
        pendingOrders: 0
      };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(order => {
      if (!order.orderDate) return false;
      return order.orderDate.startsWith(todayStr);
    }).length;

    const todayRevenue = orders.reduce((sum, order) => {
      if (!order.orderDate || !order.orderDate.startsWith(todayStr)) return sum;
      return sum + (order.totalPrice || 0);
    }, 0);

    const pendingStatuses = ['PAID', 'DELIVERING', 'REFUND_REQUESTED', 'EXCHANGE_REQUESTED'];
    const pendingOrders = orders.filter(order =>
      pendingStatuses.includes((order.status || '').toUpperCase())
    ).length;

    return {
      todayOrders,
      todayRevenue,
      totalProducts: products.length,
      pendingOrders
    };
  }, [orders]);

  const getStatusText = (status) => {
    if (!status) return '-';
    const key = status.toUpperCase();
    if (PRODUCT_STATUS_TEXT[key]) return PRODUCT_STATUS_TEXT[key];
    if (ORDER_STATUS_TEXT[key]) return ORDER_STATUS_TEXT[key];
    if (key === 'CONFIRMED') return '결제완료';
    return status;
  };

  // 취소된 주문 삭제
  const handleDeleteOrder = (orderItemId) => {
    if (window.confirm('정말로 이 주문을 목록에서 삭제하시겠습니까?')) {
      // 나중에 API 호출로 교체
      // 예: await deleteOrder(orderItemId);
      
      // 임시로 상태 업데이트
      setOrders(prev => prev.filter(order => order.orderItemId !== orderItemId));
      alert('주문이 삭제되었습니다.');
    }
  };



  // 회원탈퇴 처리
  const handleDeleteAccount = () => {
    // TODO: API 연동 필요
    // DB: User 테이블에서 삭제 또는 isSeller = 0으로 변경
    // DELETE FROM "USER" WHERE userId = ? AND isSeller = 1
    // 또는
    // UPDATE "USER" SET isSeller = 0 WHERE userId = ? AND isSeller = 1
    
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

  return (
    <div className="seller-dashboard">
      <div className="container">
        <h1 className="dashboard-title">판매자 대시보드</h1>

        {/* 탭 메뉴 */}
        <div className="dashboard-tabs">
          <button 
            className={activeTab === 'dashboard' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('dashboard')}
          >
            대시보드
          </button>
          <button 
            className={activeTab === 'business' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('business')}
          >
            판매자 정보
          </button>
          <button 
            className={activeTab === 'products' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('products')}
          >
            상품 관리
          </button>
          <button 
            className={activeTab === 'orders' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('orders')}
          >
            주문 관리
          </button>
          <button 
            className={activeTab === 'reviews' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('reviews')}
          >
            리뷰 관리
          </button>
        </div>

        {/* 대시보드 탭 */}
        {activeTab === 'dashboard' && (
          <div className="tab-content">
            <h2>판매 현황</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">오늘의 주문</div>
                <div className="stat-value">{stats.todayOrders}건</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">오늘의 매출</div>
                <div className="stat-value">{stats.todayRevenue.toLocaleString()}원</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">등록 상품</div>
                <div className="stat-value">{stats.totalProducts}개</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">처리 대기 주문</div>
                <div className="stat-value">{stats.pendingOrders}건</div>
              </div>
            </div>

            <div className="dashboard-sections">
              <div className="section-card">
                <h3>최근 주문</h3>
                {orders.slice(0, 5).length === 0 ? (
                  <div className="empty-state">
                    <p>최근 주문이 없습니다.</p>
                  </div>
                ) : (
                  <div className="recent-orders">
                    {orders.slice(0, 5).map(order => (
                      <div key={order.orderItemId} className="recent-order-item">
                        <div>
                          <span className="order-number">{order.orderNumber}</span>
                          <span className="product-name">{order.productName}</span>
                        </div>
                        <div>
                          <span className={`order-status ${getOrderStatusClass(order.status)}`}>
                            {getOrderStatusText(order.status)}
                          </span>
                          <span className="order-price">
                            {(order.price || 0).toLocaleString()}원
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="section-card">
                <h3>인기 상품</h3>
                {products.slice(0, 5).length === 0 ? (
                  <div className="empty-state">
                    <p>등록된 상품이 없습니다.</p>
                  </div>
                ) : (
                  <div className="popular-products">
                    {products.slice(0, 5).map(product => (
                      <div key={product.productId} className="popular-product-item">
                        <div>
                          <span className="product-name">{product.productName}</span>
                          <span className="view-count">조회수: {product.viewCount}</span>
                        </div>
                        <span className={`product-status ${product.status.toLowerCase()}`}>
                          {getStatusText(product.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 판매자 정보 탭 */}
        {activeTab === 'business' && (
          <div className="tab-content">
            <div className="profile-section">
              <h2>사업자 정보</h2>
              <div className="profile-info">
                <div className="info-row">
                  <label>이름</label>
                  <div className="info-value">{businessInfo.name || '-'}</div>
                </div>
                <div className="info-row">
                  <label>이메일</label>
                  <div className="info-value">{businessInfo.email || '-'}</div>
                </div>
                <div className="info-row">
                  <label>전화번호</label>
                  <div className="info-value">{businessInfo.phone || '-'}</div>
                </div>
                <div className="info-row">
                  <label>상호명</label>
                  <div className="info-value">{businessInfo.businessName || '-'}</div>
                </div>
                <div className="info-row">
                  <label>사업자번호</label>
                  <div className="info-value">{businessInfo.businessNumber || '-'}</div>
                </div>
                <div className="info-row">
                  <label>주소</label>
                  <div className="info-value">
                    {businessInfo.zipcode && `[${businessInfo.zipcode}] `}
                    {businessInfo.address || '주소 정보가 없습니다.'}
                    {businessInfo.detailAddress && ` ${businessInfo.detailAddress}`}
                  </div>
                </div>
              </div>
              <div className="profile-actions">
                <button 
                  className="btn-primary"
                  onClick={() => navigate('/edit-seller-profile')}
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

        {/* 상품 관리 탭 */}
        {activeTab === 'products' && (
          <div className="tab-content">
            <div className="products-header">
              <h2>상품 관리</h2>
              <Link to="/product/register" className="btn-primary">
                상품 등록
              </Link>
            </div>
            {loading ? (
              <div className="empty-state">
                <p>상품 목록을 불러오는 중...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <p>등록된 상품이 없습니다.</p>
              </div>
            ) : (
              <div className="products-list">
                {products.map(product => (
                  <div key={product.productId} className="product-card">
                    <div className="product-image">
                      {product.image && product.image.trim() !== '' ? (
                        <img src={product.image} alt={product.productName}/>
                      ) : (
                        <img src="https://via.placeholder.com/200x250/CCCCCC/666666?text=No+Image" alt={product.productName} />
                      )}
                    </div>
                    <div className="product-details">
                      <h3 className="product-name">{product.productName}</h3>
                      <div className="product-price-info">
                        {product.discountPrice ? (
                          <>
                            <span className="original-price">{product.price.toLocaleString()}원</span>
                            <span className="discount-price">{product.discountPrice.toLocaleString()}원</span>
                          </>
                        ) : (
                          <span className="price">{product.price > 0 ? product.price.toLocaleString() + '원' : '가격 미정'}</span>
                        )}
                      </div>
                      <div className="product-meta">
                        <span>조회수: {product.viewCount}</span>
                        <span>등록일: {product.createdAt}</span>
                      </div>
                      <span className={`product-status ${product.status.toLowerCase()}`}>
                        {getStatusText(product.status)}
                      </span>
                    </div>
                    <div className="product-actions">
                      <button 
                        className="btn-secondary"
                        onClick={() => navigate(`/product/edit/${product.productId}`)}
                      >
                        수정
                      </button>
                      <button 
                        className="btn-secondary"
                        onClick={() => navigate(`/product/${product.productId}`)}
                      >
                        상세보기
                      </button>
                      {product.status === 'SELLING' && (
                        <button className="btn-danger">품절 처리</button>
                      )}
                      {product.status === 'SOLD_OUT' && (
                        <button className="btn-secondary">재고 복구</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 주문 관리 탭 */}
        {activeTab === 'orders' && (
          <div className="tab-content">
            <h2>주문 관리</h2>
            {ordersLoading ? (
              <div className="empty-state">
                <p>주문 정보를 불러오는 중입니다...</p>
              </div>
            ) : ordersError ? (
              <div className="empty-state">
                <p>{ordersError}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="empty-state">
                <p>주문 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => {
                  const statusUpper = (order.status || 'PAID').toUpperCase();
                  const isPaid = statusUpper === 'PAID';
                  return (
                    <div key={order.orderItemId} className="order-card">
                      <div className="order-header">
                        <div className="order-header-left">
                          {isPaid && (
                            <span className="order-status-badge paid">결제완료</span>
                          )}
                          <div className="order-meta">
                            <span className="order-number">주문번호: {order.orderNumber || '-'}</span>
                            <span className="order-date">{formatDateTime(order.orderDate)}</span>
                            <span className="buyer-name">구매자: {order.buyerName || '-'}</span>
                          </div>
                        </div>
                        <span className={`order-status ${getOrderStatusClass(order.status)}`}>
                          {getOrderStatusText(order.status)}
                        </span>
                      </div>
                      <div className="order-body">
                        <div className="order-product-thumb">
                          {order.productImage ? (
                            <img 
                              src={resolveImageUrl(order.productImage)} 
                              alt={order.productName}
                            />
                          ) : (
                            <div className="thumb-placeholder">이미지 없음</div>
                          )}
                        </div>
                        <div className="order-body-info">
                          <div className="order-item-info">
                            <span className="item-name">{order.productName}</span>
                            <div className="item-options">
                              {order.color && <span>색상: {order.color}</span>}
                              {order.productSize && <span>사이즈: {order.productSize}</span>}
                            </div>
                            <span className="item-quantity">수량: {order.quantity || 0}개</span>
                            <span className="item-price">단가: {(order.price || 0).toLocaleString()}원</span>
                            <span className="item-total">합계: {(order.totalPrice || 0).toLocaleString()}원</span>
                          </div>
                          <div className="order-buyer-info">
                            <span>연락처: {order.buyerPhone || '-'}</span>
                            <span>
                              배송지: {order.zipcode ? `[${order.zipcode}] ` : ''}
                              {order.address || ''} {order.detailAddress || ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="order-actions">
                        {statusUpper === 'PAID' && (
                          <>
                            <button className="btn-primary" onClick={() => alert('배송 처리 기능은 준비 중입니다.')}>
                              배송 처리
                            </button>
                            <button className="btn-secondary" onClick={() => alert('주문 취소 기능은 준비 중입니다.')}>
                              주문 취소
                            </button>
                          </>
                        )}
                        {statusUpper === 'DELIVERING' && (
                          <button className="btn-primary" onClick={() => alert('배송완료 처리는 준비 중입니다.')}>
                            배송완료 처리
                          </button>
                        )}
                        {['CANCELED', 'CANCELLED', 'REFUNDED', 'EXCHANGED'].includes(statusUpper) && (
                          <button 
                            className="btn-danger"
                            onClick={() => handleDeleteOrder(order.orderItemId)}
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 리뷰 관리 탭 */}
        {activeTab === 'reviews' && (
          <div className="tab-content">
            <h2>리뷰 관리</h2>
            {reviews.length === 0 ? (
              <div className="empty-state">
                <p>리뷰가 없습니다.</p>
              </div>
            ) : (
              <div className="reviews-list">
                {reviews.map(review => (
                  <div key={review.reviewId} className="review-card">
                    <div className="review-header">
                      <div>
                        <span className="product-name">{review.productName}</span>
                        <span className="user-name">작성자: {review.userName}</span>
                        <span className="review-date">{review.createdAt}</span>
                      </div>
                      <div className="review-rating">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                    </div>
                    <div className="review-content">
                      {review.content}
                    </div>
                    <div className="review-actions">
                      <button className="btn-secondary">답변 작성</button>
                    </div>
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
                  판매자 정보, 상품 게시물, 주문 내역 등 모든 데이터가 삭제됩니다.
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

export default SellerDashboard;

