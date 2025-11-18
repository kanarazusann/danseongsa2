import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductRegister.css';
import { fetchSessionUser } from '../services/authService';

function ProductRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sessionUser, setSessionUser] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchSessionUser();
        setSessionUser(data.item);
      } catch {
        setSessionUser(null);
      } finally {
        setSessionChecked(true);
      }
    };
    loadUser();
  }, []);

  // 게시물 기본 정보 (ProductPost)
  const [formData, setFormData] = useState({
    postName: '',
    description: '',
    categoryName: '',
    material: '',
    gender: '',
    season: '',
    status: 'SELLING'
  });

  // 상품 옵션 리스트 (Product) - 색상, 사이즈별로 개별 등록
  const [productOptions, setProductOptions] = useState([]);

  // 상품 이미지 (여러 개)
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  
  // 드래그 앤 드롭을 위한 상태
  const [draggedIndex, setDraggedIndex] = useState(null);

  // 옵션 리스트
  const sizeOptions = ['S', 'M', 'L', 'XL', 'FREE'];
  const genderOptions = [
    { value: 'MEN', label: '남성' },
    { value: 'WOMEN', label: '여성' },
    { value: 'UNISEX', label: '공용' }
  ];
  const seasonOptions = [
    { value: 'SPRING', label: '봄' },
    { value: 'SUMMER', label: '여름' },
    { value: 'FALL', label: '가을' },
    { value: 'WINTER', label: '겨울' },
    { value: 'ALL_SEASON', label: '사계절' }
  ];
  const colorOptions = [
    { value: 'black', label: '블랙' },
    { value: 'white', label: '화이트' },
    { value: 'navy', label: '네이비' },
    { value: 'gray', label: '그레이' },
    { value: 'red', label: '레드' },
    { value: 'beige', label: '베이지' },
    { value: 'brown', label: '브라운' },
    { value: 'blue', label: '블루' },
    { value: 'green', label: '그린' }
  ];
  const materialOptions = [
    'cotton', 'polyester', 'wool', 'denim', 'leather', 'silk', 'linen', 'nylon', 'cashmere'
  ];

  // 할인가 계산 함수
  const calculateDiscountPrice = (price, percentage) => {
    if (!price || !percentage) return '';
    const priceNum = parseInt(price);
    const percentageNum = parseInt(percentage);
    if (priceNum <= 0 || percentageNum <= 0 || percentageNum >= 100) return '';
    return Math.floor(priceNum * (1 - percentageNum / 100));
  };

  // 게시물 정보 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 상품 옵션 추가
  const handleAddProductOption = () => {
    const newOption = {
      id: Date.now(), // 임시 ID
      color: '',
      productSize: '',
      price: '',
      discountPrice: '',
      discountPercentage: '',
      stock: 0,
      status: 'SELLING'
    };
    setProductOptions(prev => [...prev, newOption]);
  };

  // 상품 옵션 삭제
  const handleRemoveProductOption = (id) => {
    setProductOptions(prev => prev.filter(option => option.id !== id));
  };

  // 상품 옵션 변경
  const handleProductOptionChange = (id, field, value) => {
    setProductOptions(prev => prev.map(option => {
      if (option.id === id) {
        const updated = { ...option, [field]: value };
        // 할인율이 변경되면 할인가 자동 계산
        if (field === 'discountPercentage' && updated.price) {
          updated.discountPrice = calculateDiscountPrice(updated.price, value) || '';
        }
        return updated;
      }
      return option;
    }));
  };

  // 이미지 파일 선택 핸들러
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 10) {
      alert('이미지는 최대 10개까지 등록할 수 있습니다.');
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB 제한
        alert(`${file.name} 파일 크기가 5MB를 초과합니다.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage = {
          file: file,
          preview: reader.result,
          isMain: images.length === 0 // 첫 번째 이미지를 대표 이미지로
        };
        setImages(prev => [...prev, newImage]);
        setPreviewUrls(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // 이미지 삭제 핸들러
  const handleImageRemove = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    
    // 첫 번째 이미지를 대표 이미지로 설정
    if (newImages.length > 0 && index === 0) {
      newImages[0].isMain = true;
    }
    
    setImages(newImages);
    setPreviewUrls(newPreviews);
  };

  // 대표 이미지 설정 핸들러
  const handleSetMainImage = (index) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isMain: i === index
    }));
    setImages(newImages);
  };

  // 드래그 시작
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  // 드래그 중 (오버)
  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const newPreviews = [...previewUrls];

    const draggedImage = newImages[draggedIndex];
    const draggedPreview = newPreviews[draggedIndex];

    newImages.splice(draggedIndex, 1);
    newPreviews.splice(draggedIndex, 1);

    newImages.splice(index, 0, draggedImage);
    newPreviews.splice(index, 0, draggedPreview);

    setImages(newImages);
    setPreviewUrls(newPreviews);
    setDraggedIndex(index);
  };

  // 드래그 끝
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // 이미지 순서 변경 (왼쪽으로)
  const handleMoveImageLeft = (index) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    setImages(newImages);
    
    const newPreviews = [...previewUrls];
    [newPreviews[index - 1], newPreviews[index]] = [newPreviews[index], newPreviews[index - 1]];
    setPreviewUrls(newPreviews);
  };

  // 이미지 순서 변경 (오른쪽으로)
  const handleMoveImageRight = (index) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    setImages(newImages);
    
    const newPreviews = [...previewUrls];
    [newPreviews[index], newPreviews[index + 1]] = [newPreviews[index + 1], newPreviews[index]];
    setPreviewUrls(newPreviews);
  };


  // 폼 유효성 검사
  const validateForm = () => {
    if (!formData.postName.trim()) {
      alert('게시물명을 입력해주세요.');
      return false;
    }
    if (!formData.categoryName.trim()) {
      alert('카테고리명을 입력해주세요.');
      return false;
    }
    if (!formData.gender) {
      alert('성별을 선택해주세요.');
      return false;
    }
    if (!formData.season) {
      alert('계절을 선택해주세요.');
      return false;
    }
    if (!formData.material.trim()) {
      alert('소재를 입력해주세요.');
      return false;
    }
    if (images.length === 0) {
      alert('상품 이미지를 최소 1개 이상 등록해주세요.');
      return false;
    }
    if (productOptions.length === 0) {
      alert('상품 옵션을 최소 1개 이상 추가해주세요.');
      return false;
    }
    // 각 상품 옵션 검증
    for (let i = 0; i < productOptions.length; i++) {
      const option = productOptions[i];
      if (!option.color) {
        alert(`${i + 1}번째 상품 옵션의 색상을 선택해주세요.`);
        return false;
      }
      if (!option.productSize) {
        alert(`${i + 1}번째 상품 옵션의 사이즈를 선택해주세요.`);
        return false;
      }
      if (!option.price || parseInt(option.price) <= 0) {
        alert(`${i + 1}번째 상품 옵션의 가격을 올바르게 입력해주세요.`);
        return false;
      }
      if (option.discountPercentage) {
        const percentage = parseInt(option.discountPercentage);
        if (percentage <= 0 || percentage >= 100) {
          alert(`${i + 1}번째 상품 옵션의 할인율은 1% 이상 99% 이하여야 합니다.`);
          return false;
        }
      }
      if (option.stock < 0) {
        alert(`${i + 1}번째 상품 옵션의 재고는 0 이상이어야 합니다.`);
        return false;
      }
    }
    return true;
  };

  // 상품 등록 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!sessionChecked) {
      alert('로그인 정보를 확인 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (!sessionUser) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (Number(sessionUser.isSeller) !== 1) {
      alert('판매자만 상품을 등록할 수 있습니다.');
      navigate('/sellerDashboard');
      return;
    }

    const sellerId = sessionUser.userId;
    if (!sellerId) {
      alert('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      // FormData를 사용하여 이미지 파일과 함께 전송
      const submitData = new FormData();
      
      // 게시물 기본 정보 (ProductPost)
      submitData.append('postName', formData.postName);
      submitData.append('description', formData.description || '');
      submitData.append('categoryName', formData.categoryName);
      submitData.append('material', formData.material || '');
      submitData.append('gender', formData.gender);
      submitData.append('season', formData.season);
      submitData.append('status', formData.status);
      
      // 판매자 ID 전달 (실제 로그인한 사용자)
      submitData.append('sellerId', sellerId.toString());
      
      // 상품 옵션 정보 (Product) - JSON으로 전송
      const productsData = productOptions.map(option => ({
        color: option.color,
        productSize: option.productSize,
        price: parseInt(option.price),
        discountPrice: option.discountPrice ? parseInt(option.discountPrice) : null,
        stock: parseInt(option.stock) || 0,
        status: option.status
      }));
      submitData.append('products', JSON.stringify(productsData));
      
      // 이미지 파일들
      images.forEach((image, index) => {
        submitData.append('images', image.file);
        submitData.append(`imageIsMain_${index}`, image.isMain);
      });

      // 디버깅: 전송할 데이터 확인
      console.log('전송 데이터:', {
        postName: formData.postName,
        categoryName: formData.categoryName,
        gender: formData.gender,
        season: formData.season,
        status: formData.status,
        sellerId: sellerId,
        productsCount: productsData.length,
        imagesCount: images.length
      });

      // API 호출
      const response = await fetch('http://localhost:8080/productposts', {
        method: 'POST',
        body: submitData
        // FormData를 사용할 때는 Content-Type 헤더를 설정하지 않음 (브라우저가 자동으로 설정)
      });

      // 응답 상태 확인
      if (!response.ok) {
        const errorText = await response.text();
        console.error('서버 응답 오류:', response.status, errorText);
        throw new Error(`서버 오류 (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      if (data.rt === 'OK') {
        alert('상품이 성공적으로 등록되었습니다.');
        navigate('/sellerDashboard?tab=products');
      } else {
        alert('상품 등록에 실패했습니다: ' + (data.message || '알 수 없는 오류'));
      }
      
    } catch (error) {
      console.error('상품 등록 중 오류 발생:', error);
      alert('상품 등록 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-register">
      <div className="container">
        <h1 className="register-title">상품 등록</h1>

        <form onSubmit={handleSubmit} className="register-form">
          {/* 게시물 기본 정보 섹션 */}
          <div className="form-section">
            <h2 className="section-title">게시물 기본 정보</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">
                  게시물명 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="postName"
                  value={formData.postName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="예) 나이키 에어맥스 신발"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  카테고리명 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="예) 신발 스니커즈"
                  required
                />
                <p className="form-hint">예: 상의 맨투맨, 하의 청바지, 신발 스니커즈</p>
              </div>

              <div className="form-group">
                <label className="form-label">
                  성별 <span className="required">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="">선택하세요</option>
                  {genderOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  계절 <span className="required">*</span>
                </label>
                <select
                  name="season"
                  value={formData.season}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="">선택하세요</option>
                  {seasonOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  소재 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="material"
                  value={formData.material}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="예) cotton, wool, denim"
                  list="material-options"
                  required
                />
                <datalist id="material-options">
                  {materialOptions.map(material => (
                    <option key={material} value={material} />
                  ))}
                </datalist>
              </div>

              <div className="form-group">
                <label className="form-label">
                  판매 상태 <span className="required">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="SELLING">판매중</option>
                  <option value="SOLD_OUT">품절</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  상품 설명
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows="5"
                  placeholder="상품에 대한 설명을 입력하세요"
                />
              </div>
            </div>
          </div>

          {/* 상품 옵션 섹션 */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">상품 옵션 (색상, 사이즈별)</h2>
              <button
                type="button"
                className="btn-add-option"
                onClick={handleAddProductOption}
              >
                + 옵션 추가
              </button>
            </div>
            <p className="form-hint">각 색상과 사이즈 조합별로 가격, 할인가, 재고를 입력하세요.</p>
            
            {productOptions.length === 0 ? (
              <div className="empty-options">
                <p>상품 옵션을 추가해주세요.</p>
              </div>
            ) : (
              <div className="product-options-table">
                <table className="options-table">
                  <thead>
                    <tr>
                      <th>색상</th>
                      <th>사이즈</th>
                      <th>정가</th>
                      <th>할인율</th>
                      <th>할인가</th>
                      <th>재고</th>
                      <th>상태</th>
                      <th>삭제</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productOptions.map((option, index) => (
                      <tr key={option.id}>
                        <td>
                          <select
                            value={option.color}
                            onChange={(e) => handleProductOptionChange(option.id, 'color', e.target.value)}
                            className="form-input-small"
                            required
                          >
                            <option value="">선택</option>
                            {colorOptions.map(color => (
                              <option key={color.value} value={color.value}>
                                {color.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            value={option.productSize}
                            onChange={(e) => handleProductOptionChange(option.id, 'productSize', e.target.value)}
                            className="form-input-small"
                            required
                          >
                            <option value="">선택</option>
                            {sizeOptions.map(size => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            value={option.price}
                            onChange={(e) => handleProductOptionChange(option.id, 'price', e.target.value)}
                            className="form-input-small"
                            placeholder="0"
                            min="0"
                            required
                          />
                        </td>
                        <td>
                          <select
                            value={option.discountPercentage}
                            onChange={(e) => handleProductOptionChange(option.id, 'discountPercentage', e.target.value)}
                            className="form-input-small"
                          >
                            <option value="">없음</option>
                            {[5, 10, 15, 20, 25, 30, 35, 40, 50].map(percent => (
                              <option key={percent} value={percent}>
                                {percent}%
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            value={option.discountPrice}
                            onChange={(e) => handleProductOptionChange(option.id, 'discountPrice', e.target.value)}
                            className="form-input-small"
                            placeholder="0"
                            min="0"
                            readOnly={!!option.discountPercentage}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={option.stock}
                            onChange={(e) => handleProductOptionChange(option.id, 'stock', e.target.value)}
                            className="form-input-small"
                            placeholder="0"
                            min="0"
                            required
                          />
                        </td>
                        <td>
                          <select
                            value={option.status}
                            onChange={(e) => handleProductOptionChange(option.id, 'status', e.target.value)}
                            className="form-input-small"
                          >
                            <option value="SELLING">판매중</option>
                            <option value="SOLD_OUT">품절</option>
                          </select>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-remove-option"
                            onClick={() => handleRemoveProductOption(option.id)}
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 이미지 업로드 섹션 */}
          <div className="form-section">
            <h2 className="section-title">상품 이미지</h2>
            <div className="form-group">
              <label className="form-label">
                이미지 <span className="required">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="form-input-file"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="file-upload-label">
                이미지 선택 (최대 10개, 각 5MB 이하)
              </label>
              <p className="form-hint">
                첫 번째 이미지가 대표 이미지로 설정됩니다. 드래그하여 순서를 변경할 수 있습니다.
              </p>
            </div>

            {previewUrls.length > 0 && (
              <div className="image-preview-container">
                {images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`image-preview-item ${draggedIndex === index ? 'dragging' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="image-preview-wrapper">
                      <img src={image.preview} alt={`미리보기 ${index + 1}`} draggable={false} />
                      {image.isMain && <div className="main-badge">대표</div>}
                      <div className="image-navigation-overlay">
                        <button
                          type="button"
                          className="nav-arrow nav-arrow-left"
                          onClick={() => handleMoveImageLeft(index)}
                          disabled={index === 0}
                          title="왼쪽으로 이동"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          className="nav-arrow nav-arrow-right"
                          onClick={() => handleMoveImageRight(index)}
                          disabled={index === images.length - 1}
                          title="오른쪽으로 이동"
                        >
                          ›
                        </button>
                      </div>
                    </div>
                    <div className="image-preview-actions">
                      <button
                        type="button"
                        className="btn-image-action"
                        onClick={() => handleSetMainImage(index)}
                        disabled={image.isMain}
                        title="대표 이미지로 설정"
                      >
                        대표
                      </button>
                      <button
                        type="button"
                        className="btn-image-action btn-danger"
                        onClick={() => handleImageRemove(index)}
                        title="삭제"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 버튼 섹션 */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/sellerDashboard')}
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? '등록 중...' : '상품 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductRegister;

