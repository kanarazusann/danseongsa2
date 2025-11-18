import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import './SellerPage.css';

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
      
      // TODO: API 연동 필요
      // 실제 API 호출 예시:
      // const sellerResponse = await fetch(`/users?sellerId=${sellerId}`);
      // const sellerData = await sellerResponse.json();
      // setSeller(sellerData.item);
      
      // const productsResponse = await fetch(`/products?sellerId=${sellerId}`);
      // const productsData = await productsResponse.json();
      // setProducts(productsData.items || []);

      // 임시 데이터 (실제로는 API에서 가져옴)
      const mockSeller = {
        userId: parseInt(sellerId),
        name: '단성사 스토어',
        email: 'seller@danseongsa.com',
        phone: '010-1234-5678',
        businessNumber: '123-45-67890',
        createdAt: '2024-01-15',
        totalProducts: 25,
        totalSales: 150
      };

      const mockProducts = [
        {
          id: 1,
          name: '클래식 오버핏 코트',
          brand: 'DANSUNGSA',
          price: 89000,
          discountPrice: null,
          image: 'https://via.placeholder.com/300x400/000000/FFFFFF?text=COAT',
          categoryName: '아우터 코트',
          gender: 'UNISEX',
          season: 'FALL'
        },
        {
          id: 2,
          name: '베이직 맨투맨',
          brand: 'DANSUNGSA',
          price: 45000,
          discountPrice: 35000,
          image: 'https://via.placeholder.com/300x400/FFFFFF/000000?text=TSHIRT',
          categoryName: '상의 맨투맨',
          gender: 'UNISEX',
          season: 'ALL_SEASON'
        },
        {
          id: 3,
          name: '슬림핏 청바지',
          brand: 'DANSUNGSA',
          price: 69000,
          discountPrice: null,
          image: 'https://via.placeholder.com/300x400/000080/FFFFFF?text=JEANS',
          categoryName: '하의 청바지',
          gender: 'UNISEX',
          season: 'ALL_SEASON'
        },
        {
          id: 4,
          name: '캐주얼 스니커즈',
          brand: 'DANSUNGSA',
          price: 99000,
          discountPrice: 79000,
          image: 'https://via.placeholder.com/300x400/CCCCCC/000000?text=SNEAKERS',
          categoryName: '신발 스니커즈',
          gender: 'UNISEX',
          season: 'ALL_SEASON'
        },
        {
          id: 5,
          name: '울 코트',
          brand: 'DANSUNGSA',
          price: 129000,
          discountPrice: null,
          image: 'https://via.placeholder.com/300x400/000000/FFFFFF?text=WOOL+COAT',
          categoryName: '아우터 코트',
          gender: 'UNISEX',
          season: 'WINTER'
        },
        {
          id: 6,
          name: '후드 집업',
          brand: 'DANSUNGSA',
          price: 65000,
          discountPrice: 55000,
          image: 'https://via.placeholder.com/300x400/333333/FFFFFF?text=HOODIE',
          categoryName: '상의 후드',
          gender: 'UNISEX',
          season: 'FALL'
        }
      ];

      setSeller(mockSeller);
      setProducts(mockProducts);
      setLoading(false);
    };

    fetchSellerData();
  }, [sellerId, navigate]);

  // 정렬 함수
  const sortProducts = (productList, sort) => {
    const sorted = [...productList];
    switch (sort) {
      case 'newest':
        return sorted.sort((a, b) => b.id - a.id);
      case 'oldest':
        return sorted.sort((a, b) => a.id - b.id);
      case 'price-low':
        return sorted.sort((a, b) => {
          const priceA = a.discountPrice || a.price;
          const priceB = b.discountPrice || b.price;
          return priceA - priceB;
        });
      case 'price-high':
        return sorted.sort((a, b) => {
          const priceA = a.discountPrice || a.price;
          const priceB = b.discountPrice || b.price;
          return priceB - priceA;
        });
      default:
        return sorted;
    }
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortOption(newSort);
    const sorted = sortProducts(products, newSort);
    setProducts(sorted);
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
            <h1 className="seller-name">{seller.name}</h1>
            <div className="seller-stats">
              <div className="stat-item">
                <span className="stat-label">판매 상품</span>
                <span className="stat-value">{seller.totalProducts}개</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">총 판매량</span>
                <span className="stat-value">{seller.totalSales}개</span>
              </div>
            </div>
          </div>
          
          <div className="seller-details">
            <div className="detail-item">
              <span className="detail-label">사업자등록번호</span>
              <span className="detail-value">{seller.businessNumber}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">가입일</span>
              <span className="detail-value">{seller.createdAt}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">연락처</span>
              <span className="detail-value">{seller.phone}</span>
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
                <option value="price-low">가격 낮은순</option>
                <option value="price-high">가격 높은순</option>
              </select>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="no-products">
              <p>등록된 상품이 없습니다.</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SellerPage;

