import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { getFilteredProductPosts } from '../services/productService';
import { resolveImageUrl } from '../utils/image';
import './Banner1.css';
import './Home.css';

function Banner1() {
  const [popularProducts, setPopularProducts] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);

  // WINTER 계절 상품 목록 로드 (12개)
  useEffect(() => {
    const loadWinterProducts = async () => {
      try {
        setLoadingPopular(true);
        const response = await getFilteredProductPosts({
          seasons: ['WINTER'],
          sort: 'newest'
        });
        if (response.rt === 'OK' && response.items) {
          // API 응답을 ProductCard 컴포넌트 형식으로 변환 (최대 12개)
          const formattedProducts = response.items.slice(0, 12).map(item => ({
            id: item.postId,
            brand: item.brand || '',
            name: item.postName || '',
            price: item.price || 0,
            discountPrice: item.discountPrice || null,
            image: resolveImageUrl(item.imageUrl)
          }));
          setPopularProducts(formattedProducts);
        }
      } catch (error) {
        console.error('WINTER 상품 로드 오류:', error);
        setPopularProducts([]);
      } finally {
        setLoadingPopular(false);
      }
    };

    loadWinterProducts();
  }, []);

  return (
    <div className="banner1-page">
      {/* 메인 배너 */}
      <section className="main-banner">
        <div className="banner-slider">
          <div className="banner-slides">
            <div className="banner-slide">
              <img src="/bannerImage/겨울배너.png" alt="겨울배너" />
            </div>
          </div>
        </div>
      </section>

      {/* WINTER SALE 상품 */}
      <section className="popular-products">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">WINTER SALE</h2>
            <Link to="/products?season=WINTER" className="section-more">
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
              <div>WINTER 상품이 없습니다.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Banner1;
