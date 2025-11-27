import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import categoryStructure from '../data/categories.json';
import { getPopularProductPosts, getNewestProductPosts } from '../services/productService';
import { resolveImageUrl } from '../utils/image';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [popularProducts, setPopularProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // 배너 이미지 배열 (4개)
  const bannerImages = [
    { image: '/bannerImage/겨울배너.png', title: '첫 번째 배너', text: '첫 번째 배너 텍스트입니다', link: '/banner1' },
    { image: '/bannerImage/패딩배너.png', title: '두 번째 배너', text: '두 번째 배너 텍스트입니다', link: '/banner2' },
    { image: '/bannerImage/7.png', title: '세 번째 배너', text: '세 번째 배너 텍스트입니다', link: '/banner4' },
    { image: '/bannerImage/11.png', title: '네 번째 배너', text: '네 번째 배너 텍스트입니다', link: '/banner5' }
  ];

  // 이전 슬라이드
  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev === 0 ? bannerImages.length - 1 : prev - 1));
  };

  // 다음 슬라이드
  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
  };

  // 특정 슬라이드로 이동
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // 인기 상품 목록 로드 (4개만)
  useEffect(() => {
    const loadPopularProducts = async () => {
      try {
        setLoadingPopular(true);
        const response = await getPopularProductPosts();
        if (response.rt === 'OK' && response.items) {
          // API 응답을 ProductCard 컴포넌트 형식으로 변환 (최대 4개)
          const formattedProducts = response.items.slice(0, 4).map(item => ({
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
        console.error('인기 상품 로드 오류:', error);
        setPopularProducts([]);
      } finally {
        setLoadingPopular(false);
      }
    };

    loadPopularProducts();
  }, []);

  // 최신 상품 목록 로드 (4개만)
  useEffect(() => {
    const loadNewProducts = async () => {
      try {
        setLoadingNew(true);
        const response = await getNewestProductPosts();
        if (response.rt === 'OK' && response.items) {
          // API 응답을 ProductCard 컴포넌트 형식으로 변환 (최대 4개)
          const formattedProducts = response.items.slice(0, 4).map(item => ({
            id: item.postId,
            brand: item.brand || '',
            name: item.postName || '',
            price: item.price || 0,
            discountPrice: item.discountPrice || null,
            image: resolveImageUrl(item.imageUrl)
          }));
          setNewProducts(formattedProducts);
        }
      } catch (error) {
        console.error('최신 상품 로드 오류:', error);
        setNewProducts([]);
      } finally {
        setLoadingNew(false);
      }
    };

    loadNewProducts();
  }, []);

  // TODO: API 연동 필요
  // 카테고리 구조는 categories.json에서 가져옴
  // 대분류: 전체, 남성, 여성
  // 중분류: 신발, 상의, 아우터, 바지, 원피스/스커트, 가방, 패션소품
  // 소분류: { name, image } 형태로 저장됨

  // 검색 처리
  // TODO: Product 테이블의 productName으로 검색
  // DB: SELECT * FROM Product WHERE productName LIKE '%검색어%' AND status = 'SELLING'
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      alert('검색어를 입력해주세요.');
    }
  };

  // 카테고리 메뉴 토글
  const toggleCategoryMenu = () => {
    setIsCategoryMenuOpen(!isCategoryMenuOpen);
    if (!isCategoryMenuOpen) {
      // 메뉴가 열릴 때 기본값을 "전체"로 설정
      setSelectedMainCategory('전체');
      setSelectedSubCategory(null);
      setSelectedItem(null);
    } else {
      // 메뉴가 닫힐 때 초기화
      setSelectedMainCategory(null);
      setSelectedSubCategory(null);
      setSelectedItem(null);
    }
  };

  // 대분류 선택
  const handleMainCategorySelect = (mainCategory) => {
    setSelectedMainCategory(mainCategory);
    setSelectedSubCategory(null);
    setSelectedItem(null);
  };

  // 중분류 선택
  const handleSubCategorySelect = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setSelectedItem(null);
  };

  // 소분류 선택
  const handleCategoryItemClick = (itemName) => {
    setSelectedItem(itemName);
  };

  // 카테고리 적용 버튼 클릭
  const handleApplyCategory = () => {
    if (!selectedMainCategory) return;

    // gender 값 설정
    const gender = selectedMainCategory === '전체' ? '전체' : selectedMainCategory === '남성' ? 'MEN' : 'WOMEN';
    
    // URL 파라미터 생성
    const params = new URLSearchParams();
    params.append('gender', gender);
    
    // category 값 설정
    if (selectedSubCategory && selectedItem) {
      // 소분류까지 선택된 경우: "중분류 소분류" 형식 (띄어쓰기)
      const categoryName = `${selectedSubCategory} ${selectedItem}`;
      params.append('category', categoryName);
    } else if (selectedSubCategory) {
      // 중분류만 선택된 경우: 중분류만
      params.append('category', selectedSubCategory);
    }
    // 대분류만 선택된 경우: category 파라미터 없이 gender만 전달
    
    navigate(`/products?${params.toString()}`);
    setIsCategoryMenuOpen(false);
    setSelectedMainCategory(null);
    setSelectedSubCategory(null);
    setSelectedItem(null);
  };

  // 카테고리 초기화 버튼 클릭
  const handleResetCategory = () => {
    setSelectedMainCategory(null);
    setSelectedSubCategory(null);
    setSelectedItem(null);
  };

  // 슬라이드 너비 계산 (배너 이미지 개수에 따라)
  const slideWidthPercent = 100 / bannerImages.length;

  return (
    <div className="home">
      {/* 메인 배너 (광고) - 슬라이드 */}
      <section className="main-banner">
        <div className="banner-slider">
          {/* 배너 이미지들 */}
          <div 
            className="banner-slides" 
            style={{ transform: `translateX(-${currentSlide * slideWidthPercent}%)` }}
          >
            {bannerImages.map((banner, index) => (
              <div 
                key={index} 
                className="banner-slide"
                style={{ width: `${slideWidthPercent}%`, flex: `0 0 ${slideWidthPercent}%` }}
              >
                {banner.link ? (
                  <Link to={banner.link} style={{ display: 'block', width: '100%', height: '100%' }}>
                    <img src={banner.image} alt={`배너 ${index + 1}`} style={{ cursor: 'pointer' }} />
                  </Link>
                ) : (
                  <img src={banner.image} alt={`배너 ${index + 1}`} />
                )}
              </div>
            ))}
          </div>

          {/* 좌우 화살표 버튼 */}
          <button className="banner-arrow banner-arrow-left" onClick={goToPrevious}>
            ‹
          </button>
          <button className="banner-arrow banner-arrow-right" onClick={goToNext}>
            ›
          </button>

          {/* 인디케이터 점 */}
          <div className="banner-indicators">
            {bannerImages.map((_, index) => (
              <button
                key={index}
                className={`banner-indicator ${currentSlide === index ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`배너 ${index + 1}로 이동`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 검색 섹션 */}
      <section className="search-section">
        <div className="container">
          <form onSubmit={handleSearch} className="search-form">
            {/* 카테고리 메뉴 버튼 */}
            <button
              type="button"
              onClick={toggleCategoryMenu}
              className="category-menu-btn"
            >
              ☰ 카테고리
            </button>

            {/* 카테고리 모달 */}
            {isCategoryMenuOpen && (
              <div className="category-modal-overlay" onClick={toggleCategoryMenu}>
                <div className="category-modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="category-modal-header">
                    <h2>카테고리 선택</h2>
                    <button 
                      type="button"
                      className="category-modal-close"
                      onClick={toggleCategoryMenu}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="category-levels">
                    {/* 대분류 */}
                    <div className="category-level">
                      {Object.keys(categoryStructure).map(mainCat => (
                        <button
                          key={mainCat}
                          type="button"
                          className={`category-item ${selectedMainCategory === mainCat ? 'active' : ''}`}
                          onClick={() => handleMainCategorySelect(mainCat)}
                        >
                          {mainCat}
                        </button>
                      ))}
                    </div>

                    {/* 중분류 */}
                    {selectedMainCategory && (
                      <div className="category-level">
                        {Object.keys(categoryStructure[selectedMainCategory]).map(subCat => (
                          <button
                            key={subCat}
                            type="button"
                            className={`category-item ${selectedSubCategory === subCat ? 'active' : ''}`}
                            onClick={() => handleSubCategorySelect(subCat)}
                          >
                            {subCat}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* 소분류 */}
                    {selectedMainCategory && selectedSubCategory && (
                      <div className="category-level sub-category-level">
                        <div className="sub-category-grid">
                          {categoryStructure[selectedMainCategory][selectedSubCategory].map(item => (
                            <button
                              key={item.name}
                              type="button"
                              className={`sub-category-item ${selectedItem === item.name ? 'active' : ''}`}
                              onClick={() => handleCategoryItemClick(item.name)}
                            >
                              <div className="sub-category-image">
                                <img src={item.image} alt={item.name} />
                              </div>
                              <span className="sub-category-name">{item.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* 적용/초기화 버튼 */}
                  <div className="category-actions">
                    <button
                      type="button"
                      className="btn-category-reset"
                      onClick={handleResetCategory}
                    >
                      초기화
                    </button>
                    <button
                      type="button"
                      className="btn-category-apply"
                      onClick={handleApplyCategory}
                      disabled={!selectedMainCategory}
                    >
                      적용
                    </button>
                  </div>
                </div>
              </div>
            )}

            <input
              type="text"
              placeholder="상품을 검색해보세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-large"
            />
            <button type="submit" className="search-btn">검색</button>
          </form>
        </div>
      </section>

      {/* 인기 상품 (찜 많은 순) */}
      <section className="popular-products">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">POPULAR</h2>
            <Link to="/products?sort=popular" className="section-more">
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
              <div>인기 상품이 없습니다.</div>
            )}
          </div>
        </div>
      </section>

      {/* 신상품 (최신 등록) */}
      <section className="new-arrivals">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">NEW ARRIVALS</h2>
            <Link to="/products?sort=newest" className="section-more">
              더보기 →
            </Link>
          </div>
          <div className="product-grid">
            {loadingNew ? (
              <div>로딩 중...</div>
            ) : newProducts.length > 0 ? (
              newProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div>최신 상품이 없습니다.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
