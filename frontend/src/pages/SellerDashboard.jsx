import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './SellerDashboard.css';

function SellerDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'dashboard');

  // URL 파라미터가 변경되면 activeTab 업데이트
  useEffect(() => {
    if (tabParam && ['dashboard', 'products', 'orders', 'reviews'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // activeTab이 변경되면 상단으로 스크롤
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);
  const [orders, setOrders] = useState([
    {
      orderItemId: 1,
      orderNumber: 'ORD20250114-001',
      productName: '클래식 오버핏 코트',
      quantity: 1,
      price: 89000,
      status: 'CONFIRMED',
      orderDate: '2025-01-14',
      buyerName: '김철수'
    },
    {
      orderItemId: 2,
      orderNumber: 'ORD20250114-002',
      productName: '베이직 티셔츠',
      quantity: 2,
      price: 58000,
      status: 'CONFIRMED',
      orderDate: '2025-01-14',
      buyerName: '이영희'
    },
    {
      orderItemId: 3,
      orderNumber: 'ORD20250113-003',
      productName: '슬림 데님 팬츠',
      quantity: 1,
      price: 49000,
      status: 'CANCELLED',
      orderDate: '2025-01-13',
      buyerName: '박민수'
    }
  ]);

  // 임시 데이터 (나중에 API로 교체)
  const stats = {
    todayOrders: 12,
    todayRevenue: 1450000,
    totalProducts: 45,
    pendingOrders: 8
  };

  const products = [
    {
      productId: 1,
      productName: '클래식 오버핏 코트',
      price: 89000,
      discountPrice: 69000,
      status: 'SELLING',
      viewCount: 1250,
      createdAt: '2025-01-10',
      image: 'https://via.placeholder.com/200x250/000000/FFFFFF?text=COAT'
    },
    {
      productId: 2,
      productName: '베이직 티셔츠',
      price: 29000,
      discountPrice: null,
      status: 'SELLING',
      viewCount: 890,
      createdAt: '2025-01-12',
      image: 'https://via.placeholder.com/200x250/FFFFFF/000000?text=T-SHIRT'
    },
    {
      productId: 3,
      productName: '슬림 데님 팬츠',
      price: 59000,
      discountPrice: 49000,
      status: 'SOLD_OUT',
      viewCount: 2100,
      createdAt: '2025-01-08',
      image: 'https://via.placeholder.com/200x250/000000/FFFFFF?text=PANTS'
    }
  ];


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

  const getStatusText = (status) => {
    const statusMap = {
      'SELLING': '판매',
      'SOLD_OUT': '품절',
      'CONFIRMED': '주문확인',
      'CANCELLED': '취소됨',
      'REFUNDED': '환불됨'
    };
    return statusMap[status] || status;
  };

  // 취소된 주문 삭제
  const handleDeleteOrder = (orderItemId) => {
    if (window.confirm('정말로 이 주문을 목록에서 삭제하시겠습니까?')) {
      // 나중에 API 호출로 교체
      // 예: await deleteOrder(orderItemId);
      
      // 임시로 상태 업데이트
      setOrders(orders.filter(order => order.orderItemId !== orderItemId));
      alert('주문이 삭제되었습니다.');
    }
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
                          <span className="order-status">{getStatusText(order.status)}</span>
                          <span className="order-price">{order.price.toLocaleString()}원</span>
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

        {/* 상품 관리 탭 */}
        {activeTab === 'products' && (
          <div className="tab-content">
            <div className="products-header">
              <h2>상품 관리</h2>
              <Link to="/product/register" className="btn-primary">
                상품 등록
              </Link>
            </div>
            {products.length === 0 ? (
              <div className="empty-state">
                <p>등록된 상품이 없습니다.</p>
              </div>
            ) : (
              <div className="products-list">
                {products.map(product => (
                  <div key={product.productId} className="product-card">
                    <div className="product-image">
                      <img src={product.image} alt={product.productName} />
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
                          <span className="price">{product.price.toLocaleString()}원</span>
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
                      <button className="btn-secondary">상세보기</button>
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
            {orders.length === 0 ? (
              <div className="empty-state">
                <p>주문 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.orderItemId} className="order-card">
                    <div className="order-header">
                      <div>
                        <span className="order-number">주문번호: {order.orderNumber}</span>
                        <span className="order-date">{order.orderDate}</span>
                        <span className="buyer-name">구매자: {order.buyerName}</span>
                      </div>
                      <span className={`order-status ${order.status.toLowerCase()}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="order-info">
                      <div className="order-item-info">
                        <span className="item-name">{order.productName}</span>
                        <span className="item-quantity">수량: {order.quantity}</span>
                        <span className="item-price">{order.price.toLocaleString()}원</span>
                      </div>
                    </div>
                    <div className="order-actions">
                      {order.status === 'CONFIRMED' && (
                        <>
                          <button className="btn-primary">배송 처리</button>
                          <button className="btn-secondary">주문 취소</button>
                        </>
                      )}
                      {order.status === 'CANCELLED' && (
                        <button 
                          className="btn-danger"
                          onClick={() => handleDeleteOrder(order.orderItemId)}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </div>
                ))}
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
      </div>
    </div>
  );
}

export default SellerDashboard;

