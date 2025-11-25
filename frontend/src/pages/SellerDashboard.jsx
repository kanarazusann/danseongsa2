import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './SellerDashboard.css';
import { fetchSessionUser } from '../services/authService';
import {
  getSellerOrders,
  shipOrderItem,
  cancelOrderItemBySeller,
  getSellerRefunds,
  approveRefundRequest,
  rejectRefundRequest
} from '../services/orderService';
import { getProductPostsByBrand, deleteProductPost } from '../services/productService';
import { getReviewsBySellerId, addSellerReply, deleteSellerReply } from '../services/reviewService';

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
  CANCELLED: '취소됨', // 호환성을 위해 유지 (백엔드에서 둘 다 체크)
  REFUND: '환불/교환',
  REFUND_REQUESTED: '환불요청중',
  REFUNDED: '환불완료',
  EXCHANGE_REQUESTED: '교환요청중',
  EXCHANGED: '교환완료',
  REJECTED: '거절됨',
  COMPLETED: '처리완료',
  PROCESSING: '처리중'
};

const REFUND_TYPE_TEXT = {
  REFUND: '환불',
  EXCHANGE: '교환',
  CANCEL: '취소'
};

const REFUND_STATUS_TEXT = {
  REQUESTED: '승인 대기',
  APPROVED: '승인됨',
  COMPLETED: '처리 완료',
  REJECTED: '거절됨',
  CANCELED: '사용자 취소'
};

const getOrderStatusText = (status) => {
  if (!status) return '결제완료';
  const key = status.toUpperCase();
  return ORDER_STATUS_TEXT[key] || status;
};

const mapRefundTypeText = (type) => {
  if (!type) return '-';
  return REFUND_TYPE_TEXT[type.toUpperCase()] || type;
};

const mapRefundStatusText = (status) => {
  if (!status) return '-';
  return REFUND_STATUS_TEXT[status.toUpperCase()] || status;
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
    case 'refund':
      return 'refund-requested';
    case 'exchange_requested':
      return 'exchange-requested';
    case 'exchanged':
      return 'exchanged';
    case 'canceled':
    case 'cancelled':
      return 'cancelled';
    case 'rejected':
      return 'rejected';
    case 'completed':
      return 'completed';
    case 'processing':
      return 'processing';
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
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [refunds, setRefunds] = useState([]);
  const [refundsLoading, setRefundsLoading] = useState(false);
  const [refundsError, setRefundsError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  // URL 파라미터가 변경되면 activeTab 업데이트
  useEffect(() => {
    if (tabParam && ['dashboard', 'business', 'products', 'orders', 'returns', 'reviews'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // activeTab이 변경되면 상단으로 스크롤
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);


  // 세션에서 사용자 정보 가져오기
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
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
        alert('로그인이 필요합니다.');
        navigate('/login');
      }
    };
    loadUserInfo();
  }, [navigate]);

  const loadSellerOrders = useCallback(
    async (targetSellerId) => {
      const id = targetSellerId || sellerId;
      if (!id) return;
      try {
        setOrdersLoading(true);
        setOrdersError('');
        const data = await getSellerOrders(id);
        setOrders(data.items || []);
      } catch (error) {
        console.error('판매자 주문 조회 오류:', error);
        setOrders([]);
        setOrdersError(error.message || '주문 정보를 불러오지 못했습니다.');
      } finally {
        setOrdersLoading(false);
      }
    },
    [sellerId]
  );

  useEffect(() => {
    if (!sellerId) return;
    loadSellerOrders(sellerId);
  }, [sellerId, loadSellerOrders]);

  const loadSellerRefunds = useCallback(
    async (targetSellerId) => {
      const id = targetSellerId || sellerId;
      if (!id) return;
      try {
        setRefundsLoading(true);
        setRefundsError('');
        const data = await getSellerRefunds(id);
        setRefunds(data.items || []);
      } catch (error) {
        console.error('판매자 취소/반품 조회 오류:', error);
        setRefunds([]);
        setRefundsError(error.message || '취소/반품 정보를 불러오지 못했습니다.');
      } finally {
        setRefundsLoading(false);
      }
    },
    [sellerId]
  );

  useEffect(() => {
    if (!sellerId) return;
    loadSellerRefunds(sellerId);
  }, [sellerId, loadSellerRefunds]);

  // 브랜드로 상품 목록 조회
  const loadProductsByBrand = useCallback(async (businessName) => {
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
          wishCount: item.wishCount || 0,
          createdAt: item.createdAt ? item.createdAt.split('T')[0] : '', // 날짜만 추출
          // 이미지 URL 처리
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
  }, []);

  // 사업자명이 준비되면 상품 목록 로드
  useEffect(() => {
    if (!businessInfo.businessName) return;
    loadProductsByBrand(businessInfo.businessName);
  }, [businessInfo.businessName, loadProductsByBrand]);

  // 리뷰 목록 로드
  useEffect(() => {
    const loadReviews = async () => {
      if (activeTab !== 'reviews' || !sellerId) return;
      
      try {
        setReviewsLoading(true);
        const response = await getReviewsBySellerId(sellerId);
        
        if (response.rt === 'OK' && response.items) {
          const formattedReviews = response.items.map(review => ({
            reviewId: review.reviewId,
            postId: review.postId,
            productName: review.productName || '',
            brand: review.brand || '',
            userName: review.user?.name || '고객',
            rating: review.rating,
            content: review.content || '',
            sellerReply: review.sellerReply || null,
            sellerReplyAt: review.sellerReplyAt ? formatDateTime(review.sellerReplyAt) : null,
            createdAt: formatDateTime(review.createdAt),
            images: review.images ? review.images.map(img => resolveImageUrl(img.imageUrl || img)) : [],
            createdAtRaw: review.createdAt // 정렬을 위한 원본 날짜
          }))
          .sort((a, b) => {
            // 최신순 정렬 (내림차순)
            const dateA = new Date(a.createdAtRaw || 0);
            const dateB = new Date(b.createdAtRaw || 0);
            return dateB.getTime() - dateA.getTime();
          });
          setReviews(formattedReviews);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error('리뷰 목록 로드 오류:', error);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };
    
    loadReviews();
  }, [activeTab, sellerId]);

  const stats = useMemo(() => {
    const orderList = Array.isArray(orders) ? orders : [];
    const requestedRefundCount = refunds.filter(
      refund => refund.status?.toUpperCase() === 'REQUESTED'
    ).length;
    const paidOrdersCount = orderList.filter(
      order => (order.status || '').toUpperCase() === 'PAID'
    ).length;
    const pendingTaskCount = requestedRefundCount + paidOrdersCount;

    if (!orderList || orderList.length === 0) {
      return {
        todayOrders: 0,
        todayRevenue: 0,
        totalProducts: products.length,
        pendingTasks: pendingTaskCount
      };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const todayOrders = orderList.filter(order => {
      if (!order.orderDate) return false;
      return order.orderDate.startsWith(todayStr);
    }).length;

    const todayRevenue = orderList.reduce((sum, order) => {
      if (!order.orderDate || !order.orderDate.startsWith(todayStr)) return sum;
      return sum + (order.totalPrice || 0);
    }, 0);

    return {
      todayOrders,
      todayRevenue,
      totalProducts: products.length,
      pendingTasks: pendingTaskCount
    };
  }, [orders, products.length, refunds]);

  const popularProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    return [...products].sort(
      (a, b) => (b.wishCount || 0) - (a.wishCount || 0)
    );
  }, [products]);

  const { activeOrders, afterSalesOrders, processedRefunds } = useMemo(() => {
    if (!orders) {
      return { activeOrders: [], afterSalesOrders: [], processedRefunds: [] };
    }
    const active = [];
    const afterSales = [];
    orders.forEach(item => {
      const status = (item.status || '').toUpperCase();
      if (
        status.includes('CANCEL') ||
        status.includes('REFUND')
      ) {
        afterSales.push(item);
      } else {
        active.push(item);
      }
    });
    
    // 처리된 refund (REQUESTED가 아닌 것들)를 order 형태로 변환
    const processed = refunds
      .filter(r => r.status?.toUpperCase() !== 'REQUESTED')
      .map(refund => ({
        orderItemId: refund.orderItemId || refund.refundId,
        orderNumber: refund.orderNumber || '-',
        orderDate: refund.updatedAt || refund.createdAt,
        buyerName: refund.buyerName || '-',
        productName: refund.productName || '-',
        productImage: refund.productImage || null,
        quantity: refund.quantity || 1,
        price: refund.price || 0,
        totalPrice: refund.refundAmount || refund.price || 0,
        buyerPhone: refund.buyerPhone || '-',
        zipcode: refund.zipcode || '',
        address: refund.address || '',
        detailAddress: refund.detailAddress || '',
        status: refund.status === 'COMPLETED' ? 'REFUNDED' : refund.status,
        color: refund.color || '',
        productSize: refund.productSize || ''
      }));
    
    return { activeOrders: active, afterSalesOrders: afterSales, processedRefunds: processed };
  }, [orders, refunds]);

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

  const handleShipOrder = async (orderItemId) => {
    if (!sellerId) return;
    try {
      const response = await shipOrderItem(orderItemId, sellerId);
      if (response.item) {
        const updated = response.item;
        setOrders(prev =>
          prev.map(order =>
            order.orderItemId === updated.orderItemId ? { ...order, ...updated } : order
          )
        );
        setOrdersError('');
      }
    } catch (error) {
      console.error('배송 처리 오류:', error);
      alert(error.message || '배송 처리 중 오류가 발생했습니다.');
    }
  };

  const handleSellerCancel = async (orderItemId) => {
    if (!sellerId) return;
    if (!window.confirm('해당 주문을 취소하시겠습니까?')) {
      return;
    }
    try {
      const response = await cancelOrderItemBySeller(orderItemId, sellerId);
      if (response.item?.orderDeleted) {
        setOrders(prev => prev.filter(order => order.orderItemId !== orderItemId));
      } else if (response.item?.order) {
        setOrders(prev =>
          prev.filter(order => order.orderItemId !== orderItemId)
        );
      }
      alert('주문이 취소되었습니다.');
    } catch (error) {
      console.error('판매자 주문 취소 오류:', error);
      alert(error.message || '주문 취소 중 오류가 발생했습니다.');
    }
  };

  // 상품 삭제 처리
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('정말로 이 상품을 삭제하시겠습니까? 삭제된 상품은 복구할 수 없습니다.')) {
      return;
    }
    try {
      await deleteProductPost(productId);
      setProducts(prev => prev.filter(product => product.productId !== productId));
      alert('상품이 삭제되었습니다.');
    } catch (error) {
      console.error('상품 삭제 오류:', error);
      alert(error.message || '상품 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleApproveRefund = async (refundId) => {
    if (!sellerId) return;
    const memo = window.prompt('승인 메모를 입력하세요.', '승인되었습니다.');
    try {
      await approveRefundRequest(refundId, sellerId, memo || '승인');
      await Promise.all([loadSellerRefunds(sellerId), loadSellerOrders(sellerId)]);
      alert('요청을 승인했습니다.');
    } catch (error) {
      console.error('환불 승인 오류:', error);
      alert(error.message || '승인 처리 중 오류가 발생했습니다.');
    }
  };

  const handleRejectRefund = async (refundId) => {
    if (!sellerId) return;
    const memo = window.prompt('거절 사유를 입력하세요.', '사유를 입력해주세요.');
    if (memo === null) return;
    try {
      await rejectRefundRequest(refundId, sellerId, memo || '거절');
      await Promise.all([loadSellerRefunds(sellerId), loadSellerOrders(sellerId)]);
      alert('요청을 거절했습니다.');
    } catch (error) {
      console.error('환불 거절 오류:', error);
      alert(error.message || '거절 처리 중 오류가 발생했습니다.');
    }
  };

  // 답글 작성 시작
  const handleStartReply = (review) => {
    setEditingReplyId(review.reviewId);
    setReplyContent(review.sellerReply || '');
  };

  // 답글 작성 취소
  const handleCancelReply = () => {
    setEditingReplyId(null);
    setReplyContent('');
  };

  // 답글 저장
  const handleSaveReply = async (reviewId) => {
    if (!sellerId) return;
    if (!replyContent.trim()) {
      alert('답글 내용을 입력해주세요.');
      return;
    }
    
    try {
      await addSellerReply(reviewId, sellerId, replyContent.trim());
      
      // 리뷰 목록 다시 로드
      const response = await getReviewsBySellerId(sellerId);
      if (response.rt === 'OK' && response.items) {
        const formattedReviews = response.items.map(review => ({
          reviewId: review.reviewId,
          postId: review.postId,
          productName: review.productName || '',
          brand: review.brand || '',
          userName: review.user?.name || '고객',
          rating: review.rating,
          content: review.content || '',
          sellerReply: review.sellerReply || null,
          sellerReplyAt: review.sellerReplyAt ? formatDateTime(review.sellerReplyAt) : null,
          createdAt: formatDateTime(review.createdAt),
          createdAtRaw: review.createdAt // 정렬을 위한 원본 날짜
        }))
        .sort((a, b) => {
          // 최신순 정렬 (내림차순)
          const dateA = new Date(a.createdAtRaw || 0);
          const dateB = new Date(b.createdAtRaw || 0);
          return dateB.getTime() - dateA.getTime();
        });
        setReviews(formattedReviews);
      }
      
      setEditingReplyId(null);
      setReplyContent('');
      alert('답글이 작성되었습니다.');
    } catch (error) {
      console.error('답글 작성 오류:', error);
      alert(error.message || '답글 작성 중 오류가 발생했습니다.');
    }
  };

  // 답글 삭제
  const handleDeleteReply = async (reviewId) => {
    if (!sellerId) return;
    if (!window.confirm('답글을 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      await deleteSellerReply(reviewId, sellerId);
      
      // 리뷰 목록 다시 로드
      const response = await getReviewsBySellerId(sellerId);
      if (response.rt === 'OK' && response.items) {
        const formattedReviews = response.items.map(review => ({
          reviewId: review.reviewId,
          postId: review.postId,
          productName: review.productName || '',
          brand: review.brand || '',
          userName: review.user?.name || '고객',
          rating: review.rating,
          content: review.content || '',
          sellerReply: review.sellerReply || null,
          sellerReplyAt: review.sellerReplyAt ? formatDateTime(review.sellerReplyAt) : null,
          createdAt: formatDateTime(review.createdAt),
          createdAtRaw: review.createdAt // 정렬을 위한 원본 날짜
        }))
        .sort((a, b) => {
          // 최신순 정렬 (내림차순)
          const dateA = new Date(a.createdAtRaw || 0);
          const dateB = new Date(b.createdAtRaw || 0);
          return dateB.getTime() - dateA.getTime();
        });
        setReviews(formattedReviews);
      }
      
      alert('답글이 삭제되었습니다.');
    } catch (error) {
      console.error('답글 삭제 오류:', error);
      alert(error.message || '답글 삭제 중 오류가 발생했습니다.');
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
            className={activeTab === 'returns' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('returns')}
          >
            취소/반품 관리
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
                <div className="stat-value">{stats.pendingTasks}건</div>
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
                        <div className="recent-order-text">
                          <span className="product-name">{order.productName}</span>
                          <span className="order-meta">
                            {order.orderNumber || '-'} · {(order.price || 0).toLocaleString()}원
                          </span>
                        </div>
                        <div className="recent-order-actions">
                          <span className={`order-status-chip ${getOrderStatusClass(order.status)}`}>
                            {getOrderStatusText(order.status)}
                          </span>
                          <span className="order-meta-secondary">
                            {formatDateTime(order.orderDate)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="section-card">
                <h3>인기 상품</h3>
                {popularProducts.slice(0, 5).length === 0 ? (
                  <div className="empty-state">
                    <p>등록된 상품이 없습니다.</p>
                  </div>
                ) : (
                  <div className="recent-orders">
                    {popularProducts.slice(0, 5).map(product => (
                      <div
                        key={product.productId}
                        className="recent-order-item"
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/product/${product.productId}`)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate(`/product/${product.productId}`);
                          }
                        }}
                      >
                        <div>
                          <span className="product-name">{product.productName}</span>
                          <span className="view-count">
                            찜 {product.wishCount || 0} · 조회수 {product.viewCount}
                          </span>
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
                      <button 
                        className="btn-danger"
                        onClick={() => handleDeleteProduct(product.productId)}
                      >
                        삭제
                      </button>
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
            ) : activeOrders.length === 0 ? (
              <div className="empty-state">
                <p>진행 중인 주문이 없습니다.</p>
              </div>
            ) : (
              <div className="orders-list">
                {activeOrders.map(order => {
                  const statusUpper = (order.status || 'PAID').toUpperCase();
                  return (
                    <div key={order.orderItemId} className="order-card">
                      <div className="order-header">
                        <div className="order-header-left">
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
                            <span className="item-price">
                              단가: {(order.price || 0).toLocaleString()}원
                            </span>
                            <span className="item-total">
                              합계: {(order.totalPrice || 0).toLocaleString()}원
                            </span>
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
                            <button
                              className="btn-primary"
                              onClick={() => handleShipOrder(order.orderItemId)}
                            >
                              배송 처리
                            </button>
                            <button
                              className="btn-secondary"
                              onClick={() => handleSellerCancel(order.orderItemId)}
                            >
                              주문 취소
                            </button>
                          </>
                        )}
                        {['CANCELED', 'CANCELLED', 'REFUNDED'].includes(statusUpper) && (
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

        {activeTab === 'returns' && (
          <div className="tab-content">
            <h2>취소/반품 관리</h2>
            <section className="refund-section">
              <h3>신청 목록</h3>
              {refundsLoading ? (
                <div className="empty-state">
                  <p>요청을 불러오는 중입니다...</p>
                </div>
              ) : refundsError ? (
                <div className="empty-state">
                  <p>{refundsError}</p>
                </div>
              ) : refunds.filter(r => r.status?.toUpperCase() === 'REQUESTED').length === 0 ? (
                <div className="empty-state">
                  <p>대기 중인 신청이 없습니다.</p>
                </div>
              ) : (
                <div className="refunds-list">
                  {refunds.filter(r => r.status?.toUpperCase() === 'REQUESTED').map(refund => (
                    <div key={refund.refundId} className="refund-card">
                      <div className="refund-header">
                        <span className={`order-status ${getOrderStatusClass(refund.status)}`}>
                          {mapRefundStatusText(refund.status)}
                        </span>
                      </div>
                      <div className="refund-body">
                        <div className="refund-row">
                          <label>주문번호</label>
                          <span>{refund.orderNumber || '-'}</span>
                        </div>
                        <div className="refund-row">
                          <label>상품명</label>
                          <span>{refund.productName || '-'}</span>
                        </div>
                        <div className="refund-row">
                          <label>신청일</label>
                          <span>{refund.createdAt ? refund.createdAt.split('T')[0] : '-'}</span>
                        </div>
                        <div className="refund-row">
                          <label>사유</label>
                          <span>{refund.reason || '-'}</span>
                        </div>
                        {refund.reasonDetail && (
                          <div className="refund-row">
                            <label>상세사유</label>
                            <span>{refund.reasonDetail}</span>
                          </div>
                        )}
                        {refund.sellerResponse && (
                          <div className="refund-row">
                            <label>판매자 메모</label>
                            <span>{refund.sellerResponse}</span>
                          </div>
                        )}
                      </div>
                      {refund.status?.toUpperCase() === 'REQUESTED' && (
                        <div className="refund-actions">
                          <button
                            className="btn-primary"
                            onClick={() => handleApproveRefund(refund.refundId)}
                          >
                            승인
                          </button>
                          <button
                            className="btn-danger"
                            onClick={() => handleRejectRefund(refund.refundId)}
                          >
                            거절
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="refund-section">
              <h3>취소/환불 처리된 주문</h3>
              {afterSalesOrders.length === 0 && processedRefunds.length === 0 ? (
                <div className="empty-state">
                  <p>취소/환불 처리된 주문이 없습니다.</p>
                </div>
              ) : (
                <div className="orders-list">
                  {[...afterSalesOrders, ...processedRefunds].map(order => (
                    <div key={order.orderItemId} className="order-card cancelled">
                      <div className="order-header">
                        <div className="order-header-left">
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
                            <img src={resolveImageUrl(order.productImage)} alt={order.productName} />
                          ) : (
                            <div className="thumb-placeholder">이미지 없음</div>
                          )}
                        </div>
                        <div className="order-body-info">
                          <div className="order-item-info">
                            <span className="item-name">{order.productName}</span>
                            <span className="item-quantity">수량: {order.quantity || 0}개</span>
                            <span className="item-total">
                              합계: {(order.totalPrice || 0).toLocaleString()}원
                            </span>
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
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* 리뷰 관리 탭 */}
        {activeTab === 'reviews' && (
          <div className="tab-content">
            <h2>리뷰 관리</h2>
            {reviewsLoading ? (
              <div className="empty-state">
                <p>리뷰를 불러오는 중...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="empty-state">
                <p>리뷰가 없습니다.</p>
              </div>
            ) : (
              <div className="reviews-list">
                {reviews.map(review => (
                  <div key={review.reviewId} className="review-card">
                    <div className="review-header">
                      <div className="review-header-info">
                        <span className="review-info-item">
                          <span className="review-info-label">상품명 : </span>
                          <Link to={`/product/${review.postId}`} className="review-info-value product-name-link">
                            {review.productName}
                          </Link>
                        </span>
                        <span className="review-info-item">
                          <span className="review-info-label">별점 : </span>
                          <span className="review-info-value review-rating">
                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                          </span>
                        </span>
                        <span className="review-info-item">
                          <span className="review-info-label">작성자 : </span>
                          <span className="review-info-value">{review.userName}</span>
                        </span>
                        <span className="review-info-item">
                          <span className="review-info-label">작성일시 : </span>
                          <span className="review-info-value">{review.createdAt}</span>
                        </span>
                      </div>
                    </div>
                    <div className="review-content">
                      {review.content}
                    </div>
                    
                    {/* 리뷰 이미지 표시 */}
                    {review.images && review.images.length > 0 && (
                      <div className="review-images">
                        {review.images.map((imageUrl, index) => (
                          <img
                            key={`${review.reviewId}-${index}`}
                            src={imageUrl}
                            alt={`리뷰 이미지 ${index + 1}`}
                            className="review-image"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x300/CCCCCC/666666?text=No+Image';
                            }}
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* 판매자 답글 표시 */}
                    {review.sellerReply && (
                      <div className="seller-reply">
                        <div className="seller-reply-header">
                          <div className="seller-reply-title-section">
                            {review.brand && (
                              <span className="seller-reply-brand">{review.brand}</span>
                            )}
                          </div>
                          {review.sellerReplyAt && (
                            <span className="seller-reply-date">{review.sellerReplyAt}</span>
                          )}
                        </div>
                        <div className="seller-reply-content">
                          {review.sellerReply}
                        </div>
                        {editingReplyId !== review.reviewId && (
                          <div className="seller-reply-actions">
                            <button 
                              className="btn-secondary"
                              onClick={() => handleStartReply(review)}
                            >
                              수정
                            </button>
                            <button 
                              className="btn-danger"
                              onClick={() => handleDeleteReply(review.reviewId)}
                            >
                              삭제
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* 답글 작성/수정 폼 */}
                    {editingReplyId === review.reviewId ? (
                      <div className="reply-form">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="reply-textarea"
                          rows="8" cols="140"
                          placeholder="답글을 입력하세요"
                          maxLength={1000}
                        />
                        <div className="reply-actions">
                          <button 
                            className="btn-secondary"
                            onClick={handleCancelReply}
                          >
                            취소
                          </button>
                          <button 
                            className="btn-primary"
                            onClick={() => handleSaveReply(review.reviewId)}
                          >
                            저장
                          </button>
                        </div>
                      </div>
                    ) : !review.sellerReply && (
                      <div className="review-actions">
                        <button 
                          className="btn-secondary"
                          onClick={() => handleStartReply(review)}
                        >
                          답변 작성
                        </button>
                      </div>
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

