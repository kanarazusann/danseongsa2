import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { fetchSessionUser } from '../services/authService';
import './SellerPage.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// 날짜 포맷팅 함수 (YYYY-MM-DD)
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateString;
  }
};

// 전화번호 포맷팅 함수 (010-1234-5678)
const formatPhone = (phone) => {
  if (!phone) return '-';
  // 숫자만 추출
  const numbers = phone.replace(/\D/g, '');
  // 3자리-4자리-4자리 또는 3자리-3자리-4자리 형식
  if (numbers.length === 11) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  } else if (numbers.length === 10) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
  }
  return phone;
};

// 사업자등록번호 포맷팅 함수 (3자리-2자리-5자리)
const formatBusinessNumber = (businessNumber) => {
  if (!businessNumber) return '-';
  // 숫자만 추출
  const numbers = businessNumber.replace(/\D/g, '');
  // 10자리 숫자일 경우 3-2-5 형식으로 포맷팅
  if (numbers.length === 10) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5)}`;
  }
  return businessNumber;
};

function SellerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sellerId = searchParams.get('sellerId');
  
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    if (!sellerId) {
      navigate('/');
      return;
    }

    const fetchSellerData = async () => {
      setLoading(true);
      
      try {
        // 본인 체크: 세션 유저와 sellerId 비교
        const sessionUser = await fetchSessionUser();
        if (sessionUser?.item?.userId === parseInt(sellerId)) {
          // 본인이면 판매자 대시보드로 이동
          navigate('/sellerDashboard');
          return;
        }

        // 판매자 정보 및 상품 목록 조회
        const response = await fetch(`${API_BASE_URL}/api/seller/${sellerId}`, {
          credentials: 'include'
        });
        
        const data = await response.json();
        if (response.ok && data.rt === 'OK') {
          const sellerInfo = data.item;
          
          // 판매자 정보 설정
          setSeller({
            userId: sellerInfo.userId,
            brand: sellerInfo.brand || '브랜드 미지정',
            businessNumber: sellerInfo.businessNumber,
            phone: sellerInfo.phone,
            createdAt: sellerInfo.createdAt,
            totalProducts: sellerInfo.totalProducts || 0
          });
          
          // 이미지 URL 해결 함수
          const resolveImageUrl = (url) => {
            if (!url || typeof url !== 'string' || url.trim() === '') return null;
            const trimmedUrl = url.trim();
            if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) return trimmedUrl;
            if (trimmedUrl.startsWith('/')) return `${API_BASE_URL}${trimmedUrl}`;
            return `${API_BASE_URL}/${trimmedUrl}`;
          };
          
          // 상품 목록 설정
          const sellerProducts = (sellerInfo.products || []).map(product => {
            const imageUrl = product.image || product.imageUrl;
            const resolvedImage = imageUrl ? resolveImageUrl(imageUrl) : null;
            console.log('상품 이미지:', { 
              postId: product.postId || product.id,
              name: product.name || product.postName,
              originalImage: product.image,
              originalImageUrl: product.imageUrl,
              imageUrl, 
              resolvedImage,
              wishCount: product.wishCount || 0
            }); // 디버깅용
            return {
              id: product.id || product.postId,
              name: product.name || product.postName,
              brand: product.brand,
              price: product.price,
              discountPrice: product.discountPrice,
              image: resolvedImage || (imageUrl ? imageUrl : null), // resolvedImage가 null이어도 원본 URL 시도
              categoryName: product.categoryName,
              wishCount: product.wishCount || 0
            };
          });
          
          console.log('판매자 상품 목록 (정렬 전):', sellerProducts); // 디버깅용
          console.log('wishCount 기준 정렬:', sellerProducts.map(p => ({ name: p.name, wishCount: p.wishCount })).sort((a, b) => b.wishCount - a.wishCount)); // 디버깅용
          setProducts(sellerProducts);
        } else {
          alert(data.message || '판매자 정보를 불러오지 못했습니다.');
          navigate('/');
        }
      } catch (error) {
        console.error('판매자 정보 조회 오류:', error);
        alert('판매자 정보를 불러오는 중 오류가 발생했습니다.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [sellerId, navigate]);

  // 정렬 함수 (조건부 return 이전에 정의해야 함)
  const sortProducts = useCallback((productList, sort) => {
    const sorted = [...productList]; // 원본 배열 복사
    switch (sort) {
      case 'newest':
        return sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
      case 'oldest':
        return sorted.sort((a, b) => (a.id || 0) - (b.id || 0));
      case 'price-low':
        return sorted.sort((a, b) => {
          const priceA = a.discountPrice || a.price || 0;
          const priceB = b.discountPrice || b.price || 0;
          return priceA - priceB;
        });
      case 'price-high':
        return sorted.sort((a, b) => {
          const priceA = a.discountPrice || a.price || 0;
          const priceB = b.discountPrice || b.price || 0;
          return priceB - priceA;
        });
      case 'popular':
        return sorted.sort((a, b) => {
          const wishCountA = Number(a.wishCount) || 0;
          const wishCountB = Number(b.wishCount) || 0;
          const result = wishCountA - wishCountB; // ASC: 찜 수가 적은 순서대로 (작은 것부터 큰 것)
          if (result === 0) {
            // wishCount가 같으면 id로 정렬 (안정적 정렬)
            return (a.id || 0) - (b.id || 0);
          }
          return result;
        });
      default:
        return sorted;
    }
  }, []);

  // 정렬된 상품 목록 (조건부 return 이전에 정의해야 함)
  const sortedProducts = useMemo(() => {
    const sorted = sortProducts(products, sortOption);
    if (sortOption === 'popular') {
      console.log('인기순 정렬 결과:', sorted.slice(0, 5).map(p => ({ name: p.name, wishCount: p.wishCount }))); // 디버깅용
    }
    return sorted;
  }, [products, sortOption, sortProducts]);

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortOption(newSort);
    // 정렬은 useMemo에서 자동으로 처리됨
  };

  if (loading) {
    return (
      <div className="seller-page">
        <div className="container">
          <div className="loading">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="seller-page">
        <div className="container">
          <div className="empty-state">
            <p>판매자를 찾을 수 없습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-page">
      <div className="container">
        {/* 판매자 정보 섹션 */}
        <div className="seller-info-section">
          <div className="seller-header">
            <h1 className="seller-name">{seller.brand}</h1>
            <div className="seller-stats">
              <div className="stat-item">
                <span className="stat-label">판매 상품</span>
                <span className="stat-value">{seller.totalProducts}개</span>
              </div>
            </div>
          </div>
          
          <div className="seller-details">
            <div className="detail-item">
              <span className="detail-label">사업자등록번호</span>
              <span className="detail-value">{formatBusinessNumber(seller.businessNumber)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">가입일</span>
              <span className="detail-value">{formatDate(seller.createdAt)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">연락처</span>
              <span className="detail-value">{formatPhone(seller.phone)}</span>
            </div>
          </div>
        </div>

        {/* 판매 상품 섹션 */}
        <div className="seller-products-section">
          <div className="products-header">
            <h2 className="section-title">판매 상품</h2>
            <div className="sort-controls">
              <select 
                value={sortOption} 
                onChange={handleSortChange}
                className="sort-select"
              >
                <option value="newest">최신순</option>
                <option value="oldest">등록순</option>
                <option value="popular">인기순</option>
                <option value="price-low">가격 낮은순</option>
                <option value="price-high">가격 높은순</option>
              </select>
            </div>
          </div>

          {sortedProducts.length === 0 ? (
            <div className="no-products">
              <p>등록된 상품이 없습니다.</p>
            </div>
          ) : (
            <div className="products-grid">
              {sortedProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SellerPage;
