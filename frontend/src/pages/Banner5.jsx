import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { getFilteredProductPosts } from '../services/productService';
import './Banner5.css';
import './Home.css';

function Banner5() {
  const [popularProducts, setPopularProducts] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);

  // 패딩 상품 목록 로드 (12개)
  useEffect(() => {
    const loadPaddingProducts = async () => {
      try {
        setLoadingPopular(true);
        // 아우터 카테고리로 필터링 (패딩은 아우터 카테고리 아래에 있음)
        const response = await getFilteredProductPosts({
          category: '아우터',
          sort: 'newest'
        });
        if (response.rt === 'OK' && response.items) {
          // categoryName에 "패딩"이 포함된 상품만 필터링
          const paddingProducts = response.items.filter(item => 
            item.categoryName && item.categoryName.includes('패딩')
          );
          
          // API 응답을 ProductCard 컴포넌트 형식으로 변환 (최대 12개)
          const formattedProducts = paddingProducts.slice(0, 12).map(item => ({
            id: item.postId,
            brand: item.brand || '',
            name: item.postName || '',
            price: item.price || 0,
            discountPrice: item.discountPrice || null,
            image: item.imageUrl ? (item.imageUrl.startsWith('http') ? item.imageUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${item.imageUrl}`) : null
          }));
          setPopularProducts(formattedProducts);
        }
      } catch (error) {
        console.error('패딩 상품 로드 오류:', error);
        setPopularProducts([]);
      } finally {
        setLoadingPopular(false);
      }
    };

    loadPaddingProducts();
  }, []);

  return (
    <div className="banner5-page">
      {/* 메인 배너 */}
      <section className="main-banner">
        <div className="banner-slider">
          <div className="banner-slides">
            <div className="banner-slide">
              <img src="/bannerImage/패딩배너.png" alt="패딩배너" />
            </div>
          </div>
        </div>
      </section>

      {/* 패딩 상품 */}
      <section className="popular-products">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">패딩</h2>
            <Link to="/products?category=아우터&search=패딩" className="section-more">
              더보기 →
            </Link>
          </div>
          <div className="product-grid">
            {loadingPopular ? (
              <div>로딩 중...</div>
            ) : popularProducts.length > 0 ? (
              popularProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div>패딩 상품이 없습니다.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Banner5;
