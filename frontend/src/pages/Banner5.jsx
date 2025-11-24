import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { getProductPostsByBrand } from '../services/productService';
import './Banner5.css';
import './Home.css';

function Banner5() {
  // 브랜드별 상품 목록 (3개 브랜드)
  const [brandProducts, setBrandProducts] = useState({
    NORTHFACE: { products: [], loading: true },
    brand2: { products: [], loading: true },
    brand3: { products: [], loading: true }
  });

  // 브랜드 목록 (NORTHFACE는 필수, 나머지 2개는 동적으로 결정)
  const brands = ['NORTHFACE', '나이키', '아디다스'];

  // 브랜드별 상품 로드
  useEffect(() => {
    const loadBrandProducts = async () => {
      const brandData = {};
      
      for (const brand of brands) {
        try {
          brandData[brand] = { products: [], loading: true };
          setBrandProducts(prev => ({
            ...prev,
            [brand]: { products: [], loading: true }
          }));

          const response = await getProductPostsByBrand(brand);
          if (response.rt === 'OK' && response.items) {
            // API 응답을 ProductCard 컴포넌트 형식으로 변환 (최대 4개)
            const formattedProducts = response.items.slice(0, 4).map(item => ({
              id: item.postId,
              brand: item.brand || '',
              name: item.postName || '',
              price: item.price || 0,
              discountPrice: item.discountPrice || null,
              image: item.imageUrl ? (item.imageUrl.startsWith('http') ? item.imageUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${item.imageUrl}`) : null
            }));
            
            brandData[brand] = { products: formattedProducts, loading: false };
            setBrandProducts(prev => ({
              ...prev,
              [brand]: { products: formattedProducts, loading: false }
            }));
          } else {
            brandData[brand] = { products: [], loading: false };
            setBrandProducts(prev => ({
              ...prev,
              [brand]: { products: [], loading: false }
            }));
          }
        } catch (error) {
          console.error(`${brand} 상품 로드 오류:`, error);
          brandData[brand] = { products: [], loading: false };
          setBrandProducts(prev => ({
            ...prev,
            [brand]: { products: [], loading: false }
          }));
        }
      }
    };

    loadBrandProducts();
  }, []);

  return (
    <div className="banner5-page">
      {/* 메인 배너 */}
      <section className="main-banner">
        <div className="banner-slider">
          <div className="banner-slides">
            <div className="banner-slide">
              <img src="/bannerImage/11.png" alt="브랜드배너" />
            </div>
          </div>
        </div>
      </section>

      {/* 브랜드별 상품 섹션 */}
      {brands.map(brand => {
        const brandData = brandProducts[brand] || { products: [], loading: true };
        return (
          <section key={brand} className="popular-products">
            <div className="container">
              <div className="section-header">
                <h2 className="section-title">{brand}</h2>
                <Link to={`/products?brand=${encodeURIComponent(brand)}`} className="section-more">
                  더보기 →
                </Link>
              </div>
              <div className="product-grid">
                {brandData.loading ? (
                  <div>로딩 중...</div>
                ) : brandData.products.length > 0 ? (
                  brandData.products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))
                ) : (
                  <div>{brand} 상품이 없습니다.</div>
                )}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default Banner5;
