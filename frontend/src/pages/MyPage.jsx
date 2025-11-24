import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MyPage.css';
import { fetchSessionUser, logout, deleteUser } from '../services/authService';
import { getWishlist, removeWishlist } from '../services/productService';
import { getOrdersByUserId, getUserRefunds, cancelRefundRequest, getOrderDetail, confirmOrderItem } from '../services/orderService';
import { getReviewsByUserId, updateReview, deleteReview } from '../services/reviewService';
import ProductCard from '../components/ProductCard';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const REFUND_STATUS = {
  REQUESTED: 'REQ',
  APPROVED: 'APR',
  COMPLETED: 'COM',
  REJECTED: 'REJ',
  CANCELED: 'CAN'
};

const REFUND_STATUS_TEXT = {
  [REFUND_STATUS.REQUESTED]: '승인 대기',
  [REFUND_STATUS.APPROVED]: '승인됨',
  [REFUND_STATUS.COMPLETED]: '처리 완료',
  [REFUND_STATUS.REJECTED]: '거절됨',
  [REFUND_STATUS.CANCELED]: '사용자 취소'
};

const normalizeRefundStatus = (status) => {
  if (!status) return '';
  const upper = status.toUpperCase();
  switch (upper) {
    case 'REQUESTED':
    case REFUND_STATUS.REQUESTED:
      return REFUND_STATUS.REQUESTED;
    case 'APPROVED':
    case REFUND_STATUS.APPROVED:
      return REFUND_STATUS.APPROVED;
    case 'COMPLETED':
    case REFUND_STATUS.COMPLETED:
      return REFUND_STATUS.COMPLETED;
    case 'REJECTED':
    case REFUND_STATUS.REJECTED:
      return REFUND_STATUS.REJECTED;
    case 'CANCELED':
    case 'CANCELLED':
    case REFUND_STATUS.CANCELED:
      return REFUND_STATUS.CANCELED;
    default:
      return upper;
  }
};

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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [orderDetail, setOrderDetail] = useState(null);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false);


  

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

  // 날짜+시간 포맷팅 함수 (YYYY-MM-DD HH:MM)
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
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
      'DELIVERED': '배송완료',
      'CANCEL': '취소됨',
      'CANCELLED': '취소됨',
      'CANCELED': '취소완료',
      'REFUND': '환불',
      'REFUND_REQUESTED': '환불신청함',
      'REFUNDED': '환불완료',
      'COMPLETED': '처리완료',
      'PROCESSING': '처리중'
    };
    return statusMap[status?.toUpperCase()] || status || '';
  };

  // 주문 목록 필터링: 진행 중인 주문만 (PAID, DELIVERING, DELIVERED, PROCESSING)
  // order의 status 또는 orderItem 중 하나라도 진행 중인 상태면 포함
  const activeOrders = orders.filter(order => {
    const orderStatus = (order.status || '').toUpperCase();
    
    // order status가 진행 중인 상태면 포함
    if (orderStatus === 'PAID' || orderStatus === 'DELIVERING' || orderStatus === 'DELIVERED' || orderStatus === 'PROCESSING') {
      return true;
    }
    
    // orderItem 중 하나라도 진행 중인 상태면 포함
    if (order.items && order.items.length > 0) {
      return order.items.some(item => {
        const itemStatus = (item.status || '').toUpperCase();
        return itemStatus === 'PAID' || itemStatus === 'DELIVERING' || itemStatus === 'DELIVERED';
      });
    }
    
    return false;
  });

  // 취소/반품된 주문만
  const cancelledOrders = orders.filter(order => {
    const status = (order.status || '').toUpperCase();
    return status === 'CANCEL' || status === 'CANCELLED' || status === 'CANCELED' ||
           status === 'REFUND' || status === 'REFUND_REQUESTED' || 
           status === 'REFUNDED';
  });

  // 상품별 취소/반품 내역 (refunds + 결제 취소한 주문)
  const cancelledOrderItems = useMemo(() => {
    const items = [];
    const refundOrderItemIds = new Set();
    
    // refunds를 상품별로 변환 (환불/교환 신청이 있는 것만, 거절된 것은 제외)
    refunds.forEach(refund => {
      // 환불 거절된 것은 제외 (주문내역에서만 표시)
      const normalizedRefundStatus = normalizeRefundStatus(refund.status);
      if (normalizedRefundStatus === REFUND_STATUS.REJECTED) {
        return; // 거절된 환불은 취소/반품 내역에 표시하지 않음
      }
      
      // orderItemId가 유효한 경우만 추가
      if (refund.orderItemId) {
        refundOrderItemIds.add(refund.orderItemId);
        // orderItemStatus를 우선 사용, 없으면 refund.status 사용
        const fallbackStatus = normalizedRefundStatus || REFUND_STATUS.REQUESTED;
        const displayStatus = refund.orderItemStatus || fallbackStatus;
        // 이미지 URL 처리: productImage가 있으면 사용, 없으면 빈 문자열
        const productImage = refund.productImage || refund.imageUrl || '';
        items.push({
          type: 'refund',
          refundId: refund.refundId,
          orderItemId: refund.orderItemId,
          orderId: refund.orderId,
          orderNumber: refund.orderNumber || '-',
          productName: refund.productName || '-',
          productImage: productImage,
          quantity: refund.quantity || 1,
          price: refund.refundAmount || refund.price || 0,
          status: displayStatus, // orderItemStatus 우선 사용
          orderItemStatus: refund.orderItemStatus, // 원본 보관
          refundStatus: fallbackStatus, // refund status 보관
          refundType: refund.refundType,
          reason: refund.reason,
          reasonDetail: refund.reasonDetail,
          refundAmount: refund.refundAmount,
          sellerResponse: refund.sellerResponse,
          createdAt: refund.createdAt,
          updatedAt: refund.updatedAt,
          color: refund.color || '',
          productSize: refund.productSize || ''
        });
      }
    });
    
    // orders에서 결제 취소한 item 추가 (refunds에 없는 것만)
    orders.forEach(order => {
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          // refunds에 이미 포함된 item은 제외
          if (!item.orderItemId || refundOrderItemIds.has(item.orderItemId)) {
            return;
          }
          
          const itemStatus = (item.status || '').toUpperCase();
          
          // 결제 취소된 item만 추가 (CANCEL, CANCELLED, CANCELED)
          if (itemStatus === 'CANCEL' || itemStatus === 'CANCELLED' || itemStatus === 'CANCELED') {
            const productImage = item.productImage || item.imageUrl || '';
            items.push({
              type: 'order',
              orderItemId: item.orderItemId,
              orderId: order.orderId,
              orderNumber: order.orderNumber || '-',
              productName: item.productName || '-',
              productImage: productImage,
              quantity: item.quantity || 1,
              price: item.price || 0,
              status: item.status,
              orderDate: order.orderDate,
              color: item.color || '',
              productSize: item.productSize || ''
            });
          }
        });
      }
    });
    
    return items;
  }, [refunds, orders]);

  const getRefundTypeText = (type) => {
    const typeMap = {
      'REFUND': '환불',
      'CANCEL': '취소'
    };
    return typeMap[type] || type;
  };

  const getRefundStatusText = (status) => {
    const normalized = normalizeRefundStatus(status);
    if (!normalized) return status || '';
    return REFUND_STATUS_TEXT[normalized] || status || '';
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
      if (activeTab !== 'orders' && activeTab !== 'refunds') return;
      
      // 주문내역 탭에서도 환불 내역을 로드해야 환불 거절 여부를 확인할 수 있음
      if (activeTab === 'orders' && userId) {
        try {
          const refundResponse = await getUserRefunds(userId);
          setRefunds(refundResponse.items || []);
        } catch (error) {
          console.error('환불 내역 로드 오류:', error);
        }
      }
      
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
              orderItemId: item.orderItemId || item.id,
              productName: item.productName || '',
              quantity: item.quantity || 1,
              price: (item.price || 0) * (item.quantity || 1), // 총 가격
              status: item.status || order.orderStatus || '',
              productImage: item.productImage || item.imageUrl || '',
              color: item.color || '',
              productSize: item.productSize || item.size || ''
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
            orderNumber: review.orderNumber || '',
            sellerReply: review.sellerReply || null,
            sellerReplyAt: review.sellerReplyAt ? formatDateTime(review.sellerReplyAt) : null,
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
        console.log('Refunds response:', response);
        if (response.items) {
          console.log('Refunds items:', response.items);
          response.items.forEach((refund, idx) => {
            console.log(`Refund ${idx}:`, {
              refundId: refund.refundId,
              productName: refund.productName,
              productImage: refund.productImage,
              orderItemId: refund.orderItemId
            });
          });
        }
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

  // 구매확정 처리
  const handleConfirmPurchase = async (orderItemId) => {
    if (!userId) {
      alert('사용자 정보를 찾을 수 없습니다.');
      return;
    }

    if (!window.confirm('구매를 확정하시겠습니까? 구매확정 후에는 환불 신청이 제한될 수 있습니다.')) {
      return;
    }

    try {
      await confirmOrderItem(orderItemId, userId);
      
      // 주문 내역 새로고침
      const response = await getOrdersByUserId(userId);
      if (response.rt === 'OK' && response.items) {
        const formattedOrders = response.items.map(order => {
          let orderDate = '';
          if (order.orderDate) {
            const date = new Date(order.orderDate);
            orderDate = date.toISOString().split('T')[0];
          }
          
          const items = order.items ? order.items.map(item => ({
            orderItemId: item.orderItemId || item.id,
            productName: item.productName || '',
            quantity: item.quantity || 1,
            price: (item.price || 0) * (item.quantity || 1),
            status: item.status || order.orderStatus || '',
            productImage: item.productImage || item.imageUrl || '',
            color: item.color || '',
            productSize: item.productSize || item.size || ''
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
      }
      
      alert('구매확정이 완료되었습니다.');
    } catch (error) {
      console.error('구매확정 오류:', error);
      alert(error.message || '구매확정 중 오류가 발생했습니다.');
    }
  };

  // 회원탈퇴 처리
  const handleDeleteAccount = async () => {
    if (!userId) {
      alert('사용자 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      // 회원 탈퇴 API 호출
      await deleteUser(userId);
      
      // 로그아웃 처리
      try {
        await logout();
      } catch (error) {
        console.error('로그아웃 오류:', error);
      }

      // 모달 닫기
      setShowDeleteModal(false);
      setDeleteConfirmText('');
      
      // 홈으로 이동
      navigate('/');
      
      alert('회원탈퇴가 완료되었습니다.');
    } catch (error) {
      console.error('회원탈퇴 오류:', error);
      alert(error.message || '회원탈퇴 중 오류가 발생했습니다.');
    }
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
          orderNumber: review.orderNumber || '',
          sellerReply: review.sellerReply || null,
          sellerReplyAt: review.sellerReplyAt ? formatDateTime(review.sellerReplyAt) : null,
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
            ) : activeOrders.length === 0 ? (
              <div className="empty-state">
                <p>주문 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="orders-list">
                {activeOrders.map(order => (
                  <div key={order.orderId} className="order-card">
                    <div className="order-header">
                      <div>
                        <span className="order-number">주문번호: {order.orderNumber}</span>
                        <span className="order-date">{order.orderDate}</span>
                      </div>
                      <span className={`order-status ${(order.status || '').toLowerCase()}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="order-items">
                      {order.items.map((item, idx) => {
                        const itemStatus = (item.status || '').toUpperCase();
                        // 환불 거절 여부 확인
                        const refundInfo = refunds.find(ref => ref.orderItemId === item.orderItemId);
                        const refundStatus = refundInfo?.status?.toUpperCase();
                        const isRejected = refundStatus === 'REJECTED';
                        
                        // 구매확정 가능 여부: DELIVERING 상태이거나, 환불 거절 후 DELIVERING 상태 (DELIVERED는 이미 구매확정된 상태이므로 버튼 숨김)
                        const canConfirm = itemStatus === 'DELIVERING' || 
                                          (isRejected && itemStatus === 'DELIVERING');
                        
                        return (
                          <div key={idx} className="order-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: idx < order.items.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                            <div style={{ flex: 1 }}>
                              <span className="item-name" style={{ display: 'block', marginBottom: '5px' }}>{item.productName}</span>
                              <span className="item-quantity" style={{ fontSize: '14px', color: '#666' }}>수량: {item.quantity}</span>
                              <span className="item-price" style={{ fontSize: '14px', color: '#666', marginLeft: '10px' }}>{item.price.toLocaleString()}원</span>
                              {isRejected && (
                                <span style={{ display: 'block', fontSize: '12px', color: '#d32f2f', marginTop: '4px' }}>
                                  환불 신청이 거절되었습니다.
                                </span>
                              )}
                            </div>
                            {canConfirm && (
                              <button
                                className="btn-primary"
                                onClick={() => handleConfirmPurchase(item.orderItemId)}
                                style={{ marginLeft: '10px', padding: '6px 12px', fontSize: '13px' }}
                              >
                                구매확정
                              </button>
                            )}
                          </div>
                        );
                      })}
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
            ) : cancelledOrderItems.length === 0 ? (
              <div className="empty-state">
                <p>취소/반품 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="orders-list">
                {cancelledOrderItems.map((item, idx) => (
                  <div key={item.orderItemId || item.refundId || idx} className="order-card">
                    <div className="order-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span className="order-number">주문번호: {item.orderNumber}</span>
                        <span className="order-date">
                          {item.orderDate || (item.createdAt ? item.createdAt.split('T')[0] : '-')}
                        </span>
                      </div>
                      <span className={`order-status ${(item.status || '').toLowerCase()}`} style={{ padding: '6px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                        {getStatusText(item.status)}
                      </span>
                    </div>
                    <div className="order-body" style={{ display: 'flex', gap: '20px', padding: '15px' }}>
                      <div className="order-product-thumb" style={{ width: '100px', height: '100px', flexShrink: 0 }}>
                        <img 
                          src={resolveImageUrl(item.productImage)} 
                          alt={item.productName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                          onError={(e) => {
                            console.error('Image load error for item:', {
                              productName: item.productName,
                              productImage: item.productImage,
                              type: item.type,
                              orderItemId: item.orderItemId,
                              refundId: item.refundId,
                              resolvedUrl: resolveImageUrl(item.productImage)
                            });
                            e.target.src = 'https://via.placeholder.com/200x250/CCCCCC/666666?text=No+Image';
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully:', {
                              productName: item.productName,
                              productImage: item.productImage,
                              resolvedUrl: resolveImageUrl(item.productImage)
                            });
                          }}
                        />
                      </div>
                      <div className="order-body-info" style={{ flex: 1 }}>
                        <div className="order-item-info">
                          <span className="item-name" style={{ fontSize: '16px', fontWeight: '600', display: 'block', marginBottom: '12px' }}>
                            {item.productName}
                          </span>
                          <div className="order-item-details" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {item.color && (
                              <div className="order-item-detail-row">
                                <span className="detail-label">색상</span>
                                <span className="detail-value">{item.color}</span>
                              </div>
                            )}
                            {item.productSize && (
                              <div className="order-item-detail-row">
                                <span className="detail-label">사이즈</span>
                                <span className="detail-value">{item.productSize}</span>
                              </div>
                            )}
                            <div className="order-item-detail-row">
                              <span className="detail-label">수량</span>
                              <span className="detail-value">{item.quantity || 1}개</span>
                            </div>
                            <div className="order-item-detail-row">
                              <span className="detail-label">가격</span>
                              <span className="detail-value">{(item.price || 0).toLocaleString()}원</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 주문 상세 모달 */}
        {showOrderDetailModal && selectedOrder && (
          <div className="modal-overlay" onClick={() => {
            setShowOrderDetailModal(false);
            setOrderDetail(null);
            setSelectedOrder(null);
          }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3>주문 상세</h3>
              <div className="modal-body">
                {loadingOrderDetail ? (
                  <div className="loading">로딩 중...</div>
                ) : orderDetail ? (
                  <>
                    <div className="refund-detail-section">
                      <div className="refund-detail-row">
                        <label>주문번호</label>
                        <span>{orderDetail.orderNumber || '-'}</span>
                      </div>
                      <div className="refund-detail-row">
                        <label>주문일</label>
                        <span>{formatDate(orderDetail.orderDate || orderDetail.createdAt)}</span>
                      </div>
                      <div className="refund-detail-row">
                        <label>주문 상태</label>
                        <span className={`order-status ${(orderDetail.orderStatus || orderDetail.status || '').toLowerCase()}`}>
                          {getStatusText(orderDetail.orderStatus || orderDetail.status)}
                        </span>
                      </div>
                    </div>
                    {orderDetail.items && orderDetail.items.length > 0 && (
                      <div style={{ marginTop: '20px' }}>
                        <h4 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: '600' }}>주문 상품</h4>
                        <div className="orders-list">
                          {orderDetail.items.map((orderItem, idx) => (
                            <div key={orderItem.orderItemId || idx} className="order-card" style={{ marginBottom: '15px' }}>
                              <div className="order-header">
                                <div>
                                  <span className="item-name" style={{ fontSize: '16px', fontWeight: '600' }}>
                                    {orderItem.productName || '-'}
                                  </span>
                                </div>
                                <span className={`order-status ${(orderItem.status || '').toLowerCase()}`}>
                                  {getStatusText(orderItem.status)}
                                </span>
                              </div>
                              <div className="order-body" style={{ padding: '15px' }}>
                                {orderItem.productImage && (
                                  <div style={{ marginBottom: '10px' }}>
                                    <img 
                                      src={resolveImageUrl(orderItem.productImage)} 
                                      alt={orderItem.productName}
                                      style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                  </div>
                                )}
                                <div className="order-item-info">
                                  {orderItem.color && (
                                    <div style={{ marginBottom: '5px' }}>색상: {orderItem.color}</div>
                                  )}
                                  {orderItem.productSize && (
                                    <div style={{ marginBottom: '5px' }}>사이즈: {orderItem.productSize}</div>
                                  )}
                                  <div style={{ marginBottom: '5px' }}>수량: {orderItem.quantity || 1}개</div>
                                  <div style={{ marginBottom: '5px' }}>
                                    가격: {((orderItem.price || 0) * (orderItem.quantity || 1)).toLocaleString()}원
                                  </div>
                                  <div style={{ marginTop: '10px' }}>
                                    <strong>상태: </strong>
                                    <span className={`order-status ${(orderItem.status || '').toLowerCase()}`}>
                                      {getStatusText(orderItem.status)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="empty-state">
                    <p>주문 상세 정보를 불러올 수 없습니다.</p>
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setShowOrderDetailModal(false);
                    setOrderDetail(null);
                    setSelectedOrder(null);
                  }}
                >
                  닫기
                </button>
              </div>
            </div>
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
                      <Link to={`/product/${review.postId}`} className="review-product-image">
                        <img 
                          src={review.productImage} 
                          alt={review.productName}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/200x250/CCCCCC/666666?text=No+Image';
                          }}
                        />
                      </Link>
                      <div className="review-product-details">
                        <Link to={`/product/${review.postId}`} className="review-product-name">
                          {review.productName}
                        </Link>
                        {review.brand && (
                          <p className="review-brand">{review.brand}</p>
                        )}
                        <div className="review-order-info">
                          {review.orderNumber && <span>주문번호: {review.orderNumber}</span>}
                          <span>작성일: {review.createdAt}</span>
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
                                <span className="seller-reply-label">판매자 답변</span>
                              </div>
                              {review.sellerReplyAt && (
                                <span className="seller-reply-date">{review.sellerReplyAt}</span>
                              )}
                            </div>
                            <div className="seller-reply-content">
                              {review.sellerReply}
                            </div>
                          </div>
                        )}
                        
                        <div className="review-actions">
                          <button 
                            className="btn-secondary"
                            onClick={() => {
                              navigate('/review/edit', {
                                state: {
                                  reviewId: review.reviewId,
                                  postId: review.postId,
                                  productId: review.productId,
                                  productName: review.productName,
                                  productImage: review.productImage,
                                  brand: review.brand,
                                  orderNumber: review.orderNumber
                                }
                              });
                            }}
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


