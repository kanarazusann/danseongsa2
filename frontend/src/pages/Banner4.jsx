import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { getFilteredProductPosts } from '../services/productService';
import { resolveImageUrl } from '../utils/image';
import './Banner4.css';
import './Home.css';

function Banner4() {
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
            image: resolveImageUrl(item.imageUrl)
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
    <div className="banner4-page">
      {/* 메인 배너 */}
      <section className="main-banner">
        <div className="banner-slider">
          <div className="banner-slides">
            <div className="banner-slide">
              <img src="/bannerImage/7.png" alt="숏폼배너" />
            </div>
          </div>
        </div>
      </section>

      {/* 단성사 천만릴스 챌린지 배너 */}
      <section className="challenge-banner">
        <div className="container">
          <img src="/bannerImage/단성사 천만릴스 챌린지.png" alt="단성사 천만릴스 챌린지" />
          <div className="challenge-button-wrapper">
            <a 
              href="https://forms.gle/vGSeMLxXtgqXusZ3A" 
              target="_blank" 
              rel="noopener noreferrer"
              className="challenge-button"
            >
              구글폼으로 이동
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Banner4;
