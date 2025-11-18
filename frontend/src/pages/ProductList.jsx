import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import categoryStructure from '../data/categories.json';
import './ProductList.css';

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [sortOption, setSortOption] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // URL 파라미터에서 필터 값 가져오기
  const category = searchParams.get('category') || '';
  const gender = searchParams.get('gender') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const color = searchParams.get('color') || '';
  const size = searchParams.get('size') || '';
  const season = searchParams.get('season') || '';

  useEffect(() => {
    // 정렬 옵션이 URL 파라미터로 변경되면 상태 업데이트
    setSortOption(sort);
    // 검색어가 URL 파라미터로 변경되면 입력값 업데이트
    setSearchInput(search);
  }, [sort, search]);

  useEffect(() => {
    // TODO: API 연동 필요
    // 실제 API 호출 예시:
    // const fetchProducts = async () => {
    //   const params = new URLSearchParams();
    //   if (category) params.append('category', category);
    //   if (gender) params.append('gender', gender);
    //   if (search) params.append('search', search);
    //   params.append('sort', sortOption);
    //   
    //   const response = await fetch(`/api/products?${params.toString()}`);
    //   const data = await response.json();
    //   setProducts(data);
    //   setLoading(false);
    // };
    // fetchProducts();

    // 임시 데이터 (실제로는 API에서 가져옴)
    setLoading(true);
    
    // 카테고리 필터링 시뮬레이션
    let filteredProducts = getMockProducts();
    
    if (category) {
      // categoryName으로 필터링
      // category 형식: "중분류 소분류" 또는 "중분류"
      // DB의 categoryName 형식: "중분류 소분류" (예: "신발 스니커즈")
      filteredProducts = filteredProducts.filter(p => 
        p.categoryName && p.categoryName === category
      );
    }
    
    if (gender) {
      // gender로 필터링
      filteredProducts = filteredProducts.filter(p => 
        p.gender === gender || p.gender === 'UNISEX'
      );
    }
    
    if (search) {
      // 검색어로 필터링 (productName)
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (color) {
      // color로 필터링
      filteredProducts = filteredProducts.filter(p => 
        p.color && p.color.toLowerCase() === color.toLowerCase()
      );
    }
    
    if (size) {
      // size로 필터링
      filteredProducts = filteredProducts.filter(p => 
        p.size && p.size === size
      );
    }
    
    if (season) {
      // season으로 필터링
      filteredProducts = filteredProducts.filter(p => 
        p.season && (p.season === season || p.season === 'ALL_SEASON')
      );
    }
    
    // 정렬
    const sortedProducts = sortProducts(filteredProducts, sortOption);
    
    setProducts(sortedProducts);
    setLoading(false);
  }, [category, gender, search, sortOption, color, size, season]);

  // 정렬 함수
  const sortProducts = (productList, sort) => {
    const sorted = [...productList];
    switch (sort) {
      case 'popular':
        // 인기순 (찜 많은 순)
        return sorted.sort((a, b) => (b.wishCount || 0) - (a.wishCount || 0));
      case 'newest':
        // 최신순
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'price-low':
        // 가격 낮은순
        return sorted.sort((a, b) => {
          const priceA = a.discountPrice || a.price;
          const priceB = b.discountPrice || b.price;
          return priceA - priceB;
        });
      case 'price-high':
        // 가격 높은순
        return sorted.sort((a, b) => {
          const priceA = a.discountPrice || a.price;
          const priceB = b.discountPrice || b.price;
          return priceB - priceA;
        });
      default:
        return sorted;
    }
  };

  // 정렬 옵션 변경
  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortOption(newSort);
    // URL 파라미터 업데이트
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    setSearchParams(params);
  };

  // 필터 변경 핸들러
  const handleFilterChange = (filterType, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(filterType, value);
    } else {
      params.delete(filterType);
    }
    setSearchParams(params);
  };

  // 필터 초기화
  const handleResetFilters = () => {
    const params = new URLSearchParams();
    // category, search, sort는 유지
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);
    setSearchParams(params);
  };

  // 임시 상품 데이터 (실제로는 API에서 가져옴)
  // 필터링 테스트를 위해 다양한 조합으로 구성
  const getMockProducts = () => {
    return [
      // UNISEX 상품들
      { id: 1, brand: "DANSUNGSA", name: "클래식 오버핏 코트", price: 89000, discountPrice: null, image: "https://via.placeholder.com/400x500/000000/FFFFFF?text=COAT", wishCount: 125, categoryName: "아우터 코트", gender: "UNISEX", color: "black", size: "L", season: "FALL", createdAt: '2025-01-10' },
      { id: 2, brand: "DANSUNGSA", name: "베이직 티셔츠", price: 29000, discountPrice: null, image: "https://via.placeholder.com/400x500/FFFFFF/000000?text=T-SHIRT", wishCount: 98, categoryName: "상의 반소매", gender: "UNISEX", color: "white", size: "M", season: "ALL_SEASON", createdAt: '2025-01-11' },
      { id: 3, brand: "DANSUNGSA", name: "슬림 데님 팬츠", price: 59000, discountPrice: 49000, image: "https://via.placeholder.com/400x500/000000/FFFFFF?text=PANTS", wishCount: 87, categoryName: "바지 데님", gender: "UNISEX", color: "navy", size: "M", season: "ALL_SEASON", createdAt: '2025-01-12' },
      { id: 4, brand: "DANSUNGSA", name: "레더 스니커즈", price: 79000, discountPrice: null, image: "https://via.placeholder.com/400x500/FFFFFF/000000?text=SHOES", wishCount: 76, categoryName: "신발 스니커즈", gender: "UNISEX", color: "black", size: "FREE", season: "ALL_SEASON", createdAt: '2025-01-13' },
      { id: 5, brand: "DANSUNGSA", name: "미니멀 백팩", price: 49000, discountPrice: null, image: "https://via.placeholder.com/400x500/000000/FFFFFF?text=BAG", wishCount: 65, categoryName: "가방 백팩", gender: "UNISEX", color: "black", size: "FREE", season: "ALL_SEASON", createdAt: '2025-01-14' },
      { id: 8, brand: "DANSUNGSA", name: "캔버스 스니커즈", price: 99000, discountPrice: null, image: "https://via.placeholder.com/400x500/FFFFFF/000000?text=SNEAKERS", wishCount: 32, categoryName: "신발 스니커즈", gender: "UNISEX", color: "white", size: "FREE", season: "ALL_SEASON", createdAt: '2025-01-13' },
      { id: 12, brand: "DANSUNGSA", name: "린넨 셔츠", price: 59000, discountPrice: null, image: "https://via.placeholder.com/400x500/FFFFFF/000000?text=SHIRT", wishCount: 38, categoryName: "상의 셔츠", gender: "UNISEX", color: "white", size: "M", season: "SUMMER", createdAt: '2025-01-09' },
      { id: 13, brand: "DANSUNGSA", name: "오버핏 후드티", price: 69000, discountPrice: null, image: "https://via.placeholder.com/400x500/000000/FFFFFF?text=HOODIE2", wishCount: 55, categoryName: "상의 후드", gender: "UNISEX", color: "gray", size: "L", season: "FALL", createdAt: '2025-01-08' },
      { id: 14, brand: "DANSUNGSA", name: "데님 재킷", price: 129000, discountPrice: null, image: "https://via.placeholder.com/400x500/000000/FFFFFF?text=JACKET2", wishCount: 46, categoryName: "아우터 재킷", gender: "UNISEX", color: "navy", size: "M", season: "SPRING", createdAt: '2025-01-07' },
      { id: 15, brand: "DANSUNGSA", name: "크롭 맨투맨", price: 39000, discountPrice: null, image: "https://via.placeholder.com/400x500/FFFFFF/000000?text=TSHIRT2", wishCount: 22, categoryName: "상의 맨투맨", gender: "UNISEX", color: "red", size: "S", season: "SPRING", createdAt: '2025-01-06' },
      { id: 16, brand: "DANSUNGSA", name: "슬림핏 청바지", price: 89000, discountPrice: 79000, image: "https://via.placeholder.com/400x500/000000/FFFFFF?text=JEANS2", wishCount: 44, categoryName: "바지 데님", gender: "UNISEX", color: "navy", size: "L", season: "ALL_SEASON", createdAt: '2025-01-05' },
      { id: 17, brand: "DANSUNGSA", name: "울 코트", price: 159000, discountPrice: 139000, image: "https://via.placeholder.com/400x500/000000/FFFFFF?text=COAT3", wishCount: 29, categoryName: "아우터 코트", gender: "UNISEX", color: "black", size: "XL", season: "WINTER", createdAt: '2025-01-04' },
      { id: 18, brand: "DANSUNGSA", name: "트레이닝 팬츠", price: 49000, discountPrice: null, image: "https://via.placeholder.com/400x500/FFFFFF/000000?text=PANTS2", wishCount: 35, categoryName: "바지 트레이닝", gender: "UNISEX", color: "gray", size: "M", season: "ALL_SEASON", createdAt: '2025-01-03' },
      { id: 19, brand: "DANSUNGSA", name: "크로스백", price: 59000, discountPrice: null, image: "https://via.placeholder.com/400x500/000000/FFFFFF?text=BAG2", wishCount: 28, categoryName: "가방 크로스백", gender: "UNISEX", color: "navy", size: "FREE", season: "ALL_SEASON", createdAt: "2025-01-02" },
      { id: 20, brand: "DANSUNGSA", name: "스니커즈 화이트", price: 119000, discountPrice: null, image: "https://via.placeholder.com/400x500/FFFFFF/000000?text=SHOES2", wishCount: 41, categoryName: "신발 스니커즈", gender: "UNISEX", color: "white", size: "FREE", season: "ALL_SEASON", createdAt: "2025-01-01" },
      
      // MEN 상품들
      { id: 6, brand: "DANSUNGSA", name: "오버핏 후드", price: 69000, discountPrice: null, image: "https://via.placeholder.com/400x500/FFFFFF/000000?text=HOODIE", wishCount: 54, categoryName: "상의 후드", gender: "MEN", color: "gray", size: "XL", season: "FALL", createdAt: '2025-01-14' },
      { id: 11, brand: "DANSUNGSA", name: "데님 재킷", price: 129000, discountPrice: null, image: "https://via.placeholder.com/400x500/000000/FFFFFF?text=JACKET", wishCount: 45, categoryName: "아우터 재킷", gender: "MEN", color: "navy", size: "L", season: "SPRING", createdAt: '2025-01-10' },
      { id: 21, brand: "DANSUNGSA", name: "맨즈 슬림 청바지", price: 99000, discountPrice: 89000, image: "https://via.placeholder.com/400x500/000000/FFFFFF?text=JEANS3", wishCount: 52, categoryName: "바지 데님", gender: "MEN", color: "black", size: "L", season: "ALL_SEASON", createdAt: "2024-12-30" },
      { id: 22, brand: "DANSUNGSA", name: "맨즈 후드 집업", price: 79000, discountPrice: null, image: "https://via.placeholder.com/400x500/FFFFFF/000000?text=HOODIE3", wishCount: 48, categoryName: "아우터 후드 집업", gender: "MEN", color: "black", size: "XL", season: "FALL", createdAt: "2024-12-29" },
      { id: 23, brand: "DANSUNGSA", name: "맨즈 셔츠", price: 69000, discountPrice: null, image: "https://via.placeholder.com/400x500/FFFFFF/000000?text=SHIRT2", wishCount: 37, categoryName: "상의 셔츠", gender: "MEN", color: "white", size: "L", season: "SPRING", createdAt: "2024-12-28" },
      { id: 24, brand: "DANSUNGSA", name: "맨즈 트레이닝 팬츠", price: 59000, discountPrice: null, image: "https://via.placeholder.com/400x500/000000/FFFFFF?text=PANTS3", wishCount: 33, categoryName: "바지 트레이닝", gender: "MEN", color: "gray", size: "XL", season: "ALL_SEASON", createdAt: "2024-12-27" },
      { id: 25, brand: "DANSUNGSA", name: "맨즈 코트", price: 189000, discountPrice: 169000, image: "https://via.placeholder.com/400x500/000000/FFFFFF?text=COAT4", wishCount: 31, categoryName: "아우터 코트", gender: "MEN", color: "navy", size: "L", season: "WINTER", createdAt: "2024-12-26" },
      { id: 26, brand: "DANSUNGSA", name: "맨즈 스니커즈", price: 109000, discountPrice: null, image: "https://via.placeholder.com/400x500/FFFFFF/000000?text=SHOES3", wishCount: 39, categoryName: "신발 스니커즈", gender: "MEN", color: "black", size: "FREE", season: "ALL_SEASON", createdAt: "2024-12-25" },
      { id: 27, brand: "DANSUNGSA", name: "맨즈 맨투맨", price: 49000, discountPrice: null, image: "https://via.placeholder.com/400x500/FFFFFF/000000?text=TSHIRT3", wishCount: 26, categoryName: "상의 맨투맨", gender: "MEN", color: "navy", size: "M", season: "FALL", createdAt: "2024-12-24" },
      { id: 28, brand: "DANSUNGSA", name: "맨즈 백팩", price: 69000, discountPrice: null, image: "https://via.placeholder.com/400x500/000000/FFFFFF?text=BAG3", wishCount: 24, categoryName: "가방 백팩", gender: "MEN", color: "black", size: "FREE", season: "ALL_SEASON", createdAt: "2024-12-23" },
      
      // WOMEN 상품들
      { id: 7, brand: "DANSUNGSA", name: "슬림핏 청바지", price: 89000, discountPrice: 79000, image: "https://via.placeholder.com/400x500/000000/FFFFFF?text=JEANS", wishCount: 43, categoryName: "바지 데님", gender: "WOMEN", color: "navy", size: "S", season: "ALL_SEASON", createdAt: '2025-01-13' },
      { id: 9, brand: "DANSUNGSA", name: "울 코트", price: 159000, discountPrice: 139000, image: "https://via.placeholder.com/400x500/000000/FFFFFF?text=COAT2", wishCount: 28, categoryName: "아우터 코트", gender: "WOMEN", color: "navy", size: "M", season: "WINTER", createdAt: '2025-01-12' },
      { id: 10, brand: "DANSUNGSA", name: "크롭 맨투맨", price: 39000, discountPrice: null, image: "https://via.placeholder.com/400x500/FFFFFF/000000?text=TSHIRT", wishCount: 21, categoryName: "상의 맨투맨", gender: "WOMEN", color: "red", size: "S", season: "SPRING", createdAt: '2025-01-11' },
      { id: 29, brand: "DANSUNGSA", name: "우먼즈 원피스", price: 129000, discountPrice: null, image: "https://via.placeholder.com/400x500/FFFFFF/000000?text=DRESS", wishCount: 47, categoryName: "원피스 미디 원피스", gender: "WOMEN", color: "red", size: "M", season: "SPRING", createdAt: "2024-12-22" },
      { id: 30, brand: "DANSUNGSA", name: "우먼즈 스커트", price: 79000, discountPrice: null, image: "https://via.placeholder.com/400x500/FFFFFF/000000?text=SKIRT", wishCount: 34, categoryName: "원피스/스커트 미니 스커트", gender: "WOMEN", color: "black", size: "S", season: "SUMMER", createdAt: "2024-12-21" },
      { id: 31, brand: "DANSUNGSA", name: "우먼즈 블라우스", price: 69000, discountPrice: null, image: "https://via.placeholder.com/400x500/FFFFFF/000000?text=BLOUSE", wishCount: 30, categoryName: "상의 셔츠", gender: "WOMEN", color: "white", size: "S", season: "SPRING", createdAt: "2024-12-20" },
      { id: 32, brand: "DANSUNGSA", name: "우먼즈 코트", price: 179000, discountPrice: 159000, image: "https://via.placeholder.com/400x500/000000/FFFFFF?text=COAT5", wishCount: 27, categoryName: "아우터 코트", gender: "WOMEN", color: "navy", size: "S", season: "WINTER", createdAt: "2024-12-19" },
      { id: 33, brand: "DANSUNGSA", name: "우먼즈 스니커즈", price: 99000, discountPrice: null, image: "https://via.placeholder.com/400x500/FFFFFF/000000?text=SHOES4", wishCount: 25, categoryName: "신발 스니커즈", gender: "WOMEN", color: "white", size: "FREE", season: "ALL_SEASON", createdAt: "2024-12-18" },
      { id: 34, brand: "DANSUNGSA", name: "우먼즈 가디건", price: 89000, discountPrice: null, image: "https://via.placeholder.com/400x500/FFFFFF/000000?text=CARDIGAN", wishCount: 23, categoryName: "아우터 가디건", gender: "WOMEN", color: "gray", size: "M", season: "FALL", createdAt: "2024-12-17" },
      { id: 35, brand: "DANSUNGSA", name: "우먼즈 토트백", price: 79000, discountPrice: null, image: "https://via.placeholder.com/400x500/FFFFFF/000000?text=BAG4", wishCount: 20, categoryName: "가방 토트백", gender: "WOMEN", color: "navy", size: "FREE", season: "ALL_SEASON", createdAt: "2024-12-16" },
      { id: 36, brand: "DANSUNGSA", name: "우먼즈 티셔츠", price: 39000, discountPrice: null, image: "https://via.placeholder.com/400x500/FFFFFF/000000?text=TSHIRT4", wishCount: 18, categoryName: "상의 반소매", gender: "WOMEN", color: "red", size: "S", season: "SUMMER", createdAt: "2024-12-15" },
      { id: 37, brand: "DANSUNGSA", name: "우먼즈 팬츠", price: 69000, discountPrice: null, image: "https://via.placeholder.com/400x500/FFFFFF/000000?text=PANTS4", wishCount: 16, categoryName: "바지 코튼", gender: "WOMEN", color: "white", size: "S", season: "SPRING", createdAt: "2024-12-14" },
    ];
  };

  // 검색 처리
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    // 검색 시 카테고리와 필터 제거 (독립적으로 작동)
    params.delete('category');
    params.delete('gender');
    params.delete('color');
    params.delete('size');
    params.delete('season');
    
    if (searchInput.trim()) {
      params.set('search', searchInput.trim());
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  // TODO: 카테고리 이미지는 이제 JSON 파일에서 직접 가져옴
  // 소분류는 { name, image } 형태로 JSON에 저장됨


  // 카테고리 메뉴 토글
  const toggleCategoryMenu = () => {
    setIsCategoryMenuOpen(!isCategoryMenuOpen);
    if (!isCategoryMenuOpen) {
      setSelectedMainCategory('전체');
      setSelectedSubCategory(null);
      setSelectedItem(null);
    } else {
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
  const handleCategoryItemClick = (item) => {
    setSelectedItem(item);
  };

  // 카테고리 적용 버튼 클릭
  const handleApplyCategory = () => {
    if (!selectedMainCategory) return;

    const gender = selectedMainCategory === '전체' ? '전체' : selectedMainCategory === '남성' ? 'MEN' : 'WOMEN';
    
    const params = new URLSearchParams(searchParams);
    // 카테고리 적용 시 검색어와 필터 제거 (독립적으로 작동)
    params.delete('search');
    params.delete('color');
    params.delete('size');
    params.delete('season');
    
    params.set('gender', gender);
    
    if (selectedSubCategory && selectedItem) {
      // 소분류까지 선택된 경우: "중분류 소분류" 형식 (한 칸 띄어쓰기)
      const categoryName = `${selectedSubCategory} ${selectedItem}`;
      params.set('category', categoryName);
    } else if (selectedSubCategory) {
      // 중분류만 선택된 경우: 중분류만
      params.set('category', selectedSubCategory);
    } else {
      params.delete('category');
    }
    
    setSearchParams(params);
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

  // 필터 정보 표시
  const getFilterInfo = () => {
    if (category) {
      // category 형식: "중분류 소분류" 또는 "중분류"
      return category;
    }
    if (gender) {
      // gender가 있으면 표시
      const genderText = gender === 'MEN' ? '남성' : gender === 'WOMEN' ? '여성' : '전체';
      return genderText;
    }
    return '전체 상품';
  };

  if (loading) {
    return (
      <div className="product-list">
        <div className="container">
          <div className="loading">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-list">
      <div className="container">
        <div className="list-content">
          {/* 필터 사이드바 */}
          <aside className="filter-sidebar">
            <div className="filter-header">
              <h2>필터</h2>
              {(color || size || season) && (
                <button onClick={handleResetFilters} className="reset-filters-btn">
                  필터 초기화
                </button>
              )}
            </div>

            {/* 컬러 필터 */}
            <div className="filter-group">
              <h3 className="filter-title">컬러</h3>
              <div className="filter-options">
                <label className="filter-option">
                  <input
                    type="radio"
                    name="color"
                    value=""
                    checked={!color}
                    onChange={() => handleFilterChange('color', '')}
                  />
                  <span>전체</span>
                </label>
                {['black', 'white', 'navy', 'gray', 'red'].map(c => (
                  <label key={c} className="filter-option">
                    <input
                      type="radio"
                      name="color"
                      value={c}
                      checked={color === c}
                      onChange={() => handleFilterChange('color', c)}
                    />
                    <span>{c === 'black' ? '블랙' : c === 'white' ? '화이트' : c === 'navy' ? '네이비' : c === 'gray' ? '그레이' : '레드'}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 사이즈 필터 */}
            <div className="filter-group">
              <h3 className="filter-title">사이즈</h3>
              <div className="filter-options">
                <label className="filter-option">
                  <input
                    type="radio"
                    name="size"
                    value=""
                    checked={!size}
                    onChange={() => handleFilterChange('size', '')}
                  />
                  <span>전체</span>
                </label>
                {['S', 'M', 'L', 'XL', 'FREE'].map(s => (
                  <label key={s} className="filter-option">
                    <input
                      type="radio"
                      name="size"
                      value={s}
                      checked={size === s}
                      onChange={() => handleFilterChange('size', s)}
                    />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 계절 필터 */}
            <div className="filter-group">
              <h3 className="filter-title">계절</h3>
              <div className="filter-options">
                <label className="filter-option">
                  <input
                    type="radio"
                    name="season"
                    value=""
                    checked={!season}
                    onChange={() => handleFilterChange('season', '')}
                  />
                  <span>전체</span>
                </label>
                {[
                  { value: 'SPRING', label: '봄' },
                  { value: 'SUMMER', label: '여름' },
                  { value: 'FALL', label: '가을' },
                  { value: 'WINTER', label: '겨울' },
                ].map(s => (
                  <label key={s.value} className="filter-option">
                    <input
                      type="radio"
                      name="season"
                      value={s.value}
                      checked={season === s.value}
                      onChange={() => handleFilterChange('season', s.value)}
                    />
                    <span>{s.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* 메인 콘텐츠 */}
          <div className="list-main">
            {/* 검색창 */}
            <div className="search-section">
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
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-btn">검색</button>
              </form>
            </div>

            {/* 필터 정보 및 정렬 */}
            <div className="list-header">
              <div className="filter-info">
                <h1>{getFilterInfo()}</h1>
                <p className="product-count">총 {products.length}개의 상품</p>
              </div>
              <div className="sort-controls">
                <label htmlFor="sort-select">정렬:</label>
                <select 
                  id="sort-select" 
                  value={sortOption} 
                  onChange={handleSortChange}
                  className="sort-select"
                >
                  <option value="newest">최신순</option>
                  <option value="popular">인기순</option>
                  <option value="price-low">가격 낮은순</option>
                  <option value="price-high">가격 높은순</option>
                </select>
              </div>
            </div>

            {/* 상품 목록 */}
            {products.length === 0 ? (
              <div className="empty-state">
                <p>검색 결과가 없습니다.</p>
                <p className="empty-subtitle">다른 검색어나 카테고리를 선택해보세요.</p>
              </div>
            ) : (
              <div className="product-grid">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductList;
