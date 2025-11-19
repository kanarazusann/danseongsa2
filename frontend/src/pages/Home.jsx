import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import categoryStructure from '../data/categories.json';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // TODO: API 연동 필요
  // 인기 상품 (찜 많은 순)
  // DB: Product + Wishlist 조인하여 COUNT(wishlistId)로 정렬
  // SELECT p.*, COUNT(w.wishlistId) as wishCount, c.brand
  // FROM Product p
  // LEFT JOIN Wishlist w ON p.productId = w.productId
  // LEFT JOIN Category c ON p.categoryId = c.categoryId
  // WHERE p.status = 'SELLING'
  // GROUP BY p.productId
  // ORDER BY wishCount DESC
  const popularProducts = [
    { id: 1, brand: "DANSUNGSA", name: "클래식 오버핏 코트", price: 89000, discountPrice: null, image: "https://via.placeholder.com/400x500/000000/FFFFFF?text=COAT", wishCount: 125 },
    { id: 2, brand: "DANSUNGSA", name: "베이직 티셔츠", price: 29000, discountPrice: null, image: "https://via.placeholder.com/400x500/FFFFFF/000000?text=T-SHIRT", wishCount: 98 },
    { id: 3, brand: "DANSUNGSA", name: "슬림 데님 팬츠", price: 59000, discountPrice: 49000, image: "https://via.placeholder.com/400x500/000000/FFFFFF?text=PANTS", wishCount: 87 },
    { id: 4, brand: "DANSUNGSA", name: "레더 스니커즈", price: 79000, discountPrice: null, image: "https://via.placeholder.com/400x500/FFFFFF/000000?text=SHOES", wishCount: 76 },
  ];

  // TODO: API 연동 필요
  // 신상품 (최신 등록)
  // DB: Product 테이블에서 createdAt 기준 DESC 정렬, status = 'SELLING'
  // SELECT p.*, pi.imageUrl, c.brand
  // FROM Product p
  // LEFT JOIN ProductImage pi ON p.productId = pi.productId AND pi.isMain = true
  // LEFT JOIN Category c ON p.categoryId = c.categoryId
  // WHERE p.status = 'SELLING'
  // ORDER BY p.createdAt DESC
  const newProducts = [
    { id: 5, brand: "DANSUNGSA", name: "미니멀 백팩", price: 49000, discountPrice: null, image: "https://via.placeholder.com/400x500/000000/FFFFFF?text=BAG", createdAt: '2025-01-14' },
    { id: 6, brand: "DANSUNGSA", name: "오버핏 후드", price: 69000, discountPrice: null, image: "https://via.placeholder.com/400x500/FFFFFF/000000?text=HOODIE", createdAt: '2025-01-14' },
    { id: 7, brand: "DANSUNGSA", name: "슬림핏 청바지", price: 89000, discountPrice: 79000, image: "https://via.placeholder.com/400x500/000000/FFFFFF?text=JEANS", createdAt: '2025-01-13' },
    { id: 8, brand: "DANSUNGSA", name: "캔버스 스니커즈", price: 99000, discountPrice: null, image: "https://via.placeholder.com/400x500/FFFFFF/000000?text=SNEAKERS", createdAt: '2025-01-13' },
  ];

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

  return (
    <div className="home">
      {/* 메인 배너 (광고) */}
      <section className="main-banner">
        <div className="banner-content">
          <h1>2024 F/W COLLECTION</h1>
          <p>미니멀한 감성으로 완성하는 가을 스타일</p>
          <Link to="/products" className="btn-primary">컬렉션 보기</Link>
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
            {popularProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
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
            {newProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
