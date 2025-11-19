import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import categoriesData from '../data/categories.json';
import './ProductEdit.css';

function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  
  // 카테고리 선택 상태
  const [selectedMainCategory, setSelectedMainCategory] = useState(null); // 대분류 (전체, 남성, 여성)
  const [selectedSubCategory, setSelectedSubCategory] = useState(null); // 중분류 (신발, 상의 등)
  const [selectedItem, setSelectedItem] = useState(null); // 소분류 (스니커즈, 맨투맨 등)

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

  // 상품 이미지 (갤러리)
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // 기존 이미지 URL 저장
  // 상품 설명 이미지
  const [descriptionImages, setDescriptionImages] = useState([]);
  
  // 드래그 앤 드롭을 위한 상태
  const [draggedIndex, setDraggedIndex] = useState(null);

  // 옵션 리스트
  const apparelSizes = ['S', 'M', 'L', 'XL', 'FREE'];
  const shoeSizes = ['230', '240', '250', '260', '270', '280'];
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

  const categoryName = formData.categoryName || '';
  const isShoesCategory = categoryName.startsWith('신발');
  const isBagOrAccessory = categoryName.startsWith('가방') || categoryName.startsWith('패션소품');
  const getSizeOptionsForCategory = () => {
    if (isBagOrAccessory) {
      return [];
    }
    if (isShoesCategory) {
      return shoeSizes;
    }
    return apparelSizes;
  };
  const sizeOptionsForCategory = getSizeOptionsForCategory();

  // 페이지 로드 시 상단으로 스크롤
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // 기존 상품 데이터 불러오기
  useEffect(() => {
    const fetchProduct = async () => {
      setLoadingProduct(true);
      
      try {
        // TODO: 실제 API 연동 필요
        // const response = await fetch(`http://localhost:8080/api/products/${id}`, {
        //   method: 'GET',
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('token')}`
        //   }
        // });
        // const data = await response.json();
        // const product = data.data;

        // TODO: 실제 API 연동 필요
        // const response = await fetch(`/productposts?postId=${id}`, {
        //   method: 'GET',
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('token')}`
        //   }
        // });
        // const data = await response.json();
        // const productPost = data.item;

        // 임시 데이터 (실제로는 API에서 가져옴)
        const productPost = {
          postId: parseInt(id),
          postName: '클래식 오버핏 코트',
          categoryName: '아우터 코트',
          gender: 'UNISEX',
          material: 'wool',
          season: 'FALL',
          status: 'SELLING',
          description: '미니멀한 디자인으로 완성된 클래식 오버핏 코트입니다. 고급스러운 소재와 완벽한 핏으로 어떤 스타일에도 잘 어울립니다.',
          images: [
            { imageId: 1, imageUrl: 'https://via.placeholder.com/800x1000/000000/FFFFFF?text=COAT+1', isMain: true },
            { imageId: 2, imageUrl: 'https://via.placeholder.com/800x1000/FFFFFF/000000?text=COAT+2', isMain: false },
            { imageId: 3, imageUrl: 'https://via.placeholder.com/800x1000/000000/FFFFFF?text=COAT+3', isMain: false },
            { imageId: 4, imageUrl: 'https://via.placeholder.com/800x1000/FFFFFF/000000?text=COAT+4', isMain: false },
          ],
          descriptionImages: [
            { imageId: 101, imageUrl: 'https://via.placeholder.com/900x600/000000/FFFFFF?text=DESC+1' },
            { imageId: 102, imageUrl: 'https://via.placeholder.com/900x600/FFFFFF/000000?text=DESC+2' }
          ],
          products: [
            { productId: 1, color: 'black', productSize: 'S', price: 89000, discountPrice: 69000, stock: 10, status: 'SELLING' },
            { productId: 2, color: 'black', productSize: 'M', price: 89000, discountPrice: 69000, stock: 15, status: 'SELLING' },
            { productId: 3, color: 'black', productSize: 'L', price: 89000, discountPrice: 69000, stock: 8, status: 'SELLING' },
            { productId: 4, color: 'white', productSize: 'M', price: 89000, discountPrice: null, stock: 5, status: 'SELLING' },
            { productId: 5, color: 'white', productSize: 'L', price: 89000, discountPrice: null, stock: 12, status: 'SELLING' }
          ]
        };

        // 게시물 정보 채우기
        setFormData({
          postName: productPost.postName || '',
          description: productPost.description || '',
          categoryName: productPost.categoryName || '',
          material: productPost.material || '',
          gender: productPost.gender || '',
          season: productPost.season || '',
          status: productPost.status || 'SELLING'
        });

        // 카테고리명에서 대분류, 중분류, 소분류 파싱
        if (productPost.categoryName) {
          const categoryParts = productPost.categoryName.split(' ');
          if (categoryParts.length >= 2) {
            const subCategory = categoryParts[0]; // 중분류 (예: "신발")
            const item = categoryParts.slice(1).join(' '); // 소분류 (예: "스니커즈")
            
            // gender에 따라 대분류 설정
            let mainCategory = '전체';
            if (productPost.gender === 'MEN') {
              mainCategory = '남성';
            } else if (productPost.gender === 'WOMEN') {
              mainCategory = '여성';
            }
            
            setSelectedMainCategory(mainCategory);
            setSelectedSubCategory(subCategory);
            setSelectedItem(item);
          }
        }

        // 상품 옵션 데이터 채우기
        if (productPost.products && productPost.products.length > 0) {
          const options = productPost.products.map(product => {
            let discountPercentage = '';
            if (product.discountPrice && product.price) {
              discountPercentage = Math.round((1 - product.discountPrice / product.price) * 100).toString();
            }
            return {
              id: product.productId, // 기존 상품 ID 유지
              productId: product.productId, // 수정 시 사용
              color: product.color || '',
              productSize: product.productSize || '',
              price: product.price?.toString() || '',
              discountPrice: product.discountPrice?.toString() || '',
              discountPercentage: discountPercentage,
              stock: product.stock || 0,
              status: product.status || 'SELLING',
              isExisting: true // 기존 상품 옵션 표시
            };
          });
          setProductOptions(options);
        }

        // 기존 이미지 설정
        if (productPost.images && productPost.images.length > 0) {
          const existingImagesList = productPost.images.map((img, index) => ({
            imageId: img.imageId,
            preview: img.imageUrl,
            isMain: img.isMain || index === 0,
            isExisting: true, // 기존 이미지 표시
            file: null // 기존 이미지는 file이 없음
          }));
          setImages(existingImagesList);
          setPreviewUrls(productPost.images.map(img => img.imageUrl));
          setExistingImages(productPost.images.map(img => img.imageUrl));
        }

        // 상품 설명 이미지 설정
        if (productPost.descriptionImages && productPost.descriptionImages.length > 0) {
          const existingDescription = productPost.descriptionImages.map(img => ({
            imageId: img.imageId,
            preview: img.imageUrl,
            isExisting: true,
            file: null
          }));
          setDescriptionImages(existingDescription);
        }

      } catch (error) {
        console.error('상품 데이터 로드 중 오류 발생:', error);
        alert('상품 데이터를 불러오는 중 오류가 발생했습니다.');
        navigate('/sellerDashboard');
      } finally {
        setLoadingProduct(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate]);

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
  // 대분류 선택 핸들러
  const handleMainCategorySelect = (mainCategory) => {
    setSelectedMainCategory(mainCategory);
    setSelectedSubCategory(null);
    setSelectedItem(null);
    setFormData(prev => ({ ...prev, categoryName: '' }));
    
    // 대분류에 따라 성별 자동 설정
    if (mainCategory === '남성') {
      setFormData(prev => ({ ...prev, gender: 'MEN' }));
    } else if (mainCategory === '여성') {
      setFormData(prev => ({ ...prev, gender: 'WOMEN' }));
    } else if (mainCategory === '전체') {
      setFormData(prev => ({ ...prev, gender: 'UNISEX' }));
    }
  };

  // 중분류 선택 핸들러
  const handleSubCategorySelect = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setSelectedItem(null);
    setFormData(prev => ({ ...prev, categoryName: '' }));
  };

  // 소분류 선택 핸들러
  const handleItemSelect = (item) => {
    setSelectedItem(item);
    // categoryName 자동 생성: "중분류 소분류" 형식 (예: "신발 스니커즈")
    if (selectedSubCategory && item) {
      setFormData(prev => ({ ...prev, categoryName: `${selectedSubCategory} ${item}` }));
    }
  };

  // 상품 옵션 추가
  const handleAddProductOption = () => {
    const newOption = {
      id: Date.now(), // 임시 ID
      productId: null, // 새로 추가되는 옵션은 productId가 없음
      color: '',
      productSize: '',
      price: '',
      discountPrice: '',
      discountPercentage: '',
      stock: 0,
      status: 'SELLING',
      isExisting: false // 새로 추가된 옵션
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
          isMain: images.length === 0, // 첫 번째 이미지를 대표 이미지로
          isExisting: false
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

  // 상품 설명 이미지 업로드
  const handleDescriptionImagesChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + descriptionImages.length > 10) {
      alert('상품 설명 이미지는 최대 10개까지 등록할 수 있습니다.');
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} 파일 크기가 5MB를 초과합니다.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage = {
          file,
          preview: reader.result,
          isExisting: false
        };
        setDescriptionImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDescriptionImageRemove = (index) => {
    setDescriptionImages(prev => prev.filter((_, i) => i !== index));
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
  const validateForm = (optionsToCheck) => {
    if (!formData.postName.trim()) {
      alert('게시물명을 입력해주세요.');
      return false;
    }
    if (!formData.categoryName.trim()) {
      alert('카테고리를 선택해주세요.');
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
    if (descriptionImages.length === 0) {
      alert('상품 설명 이미지를 최소 1개 이상 등록해주세요.');
      return false;
    }
    if (optionsToCheck.length === 0) {
      alert('상품 옵션을 최소 1개 이상 추가해주세요.');
      return false;
    }
    for (let i = 0; i < optionsToCheck.length; i++) {
      const option = optionsToCheck[i];
      if (!option.color) {
        alert(`${i + 1}번째 상품 옵션의 색상을 선택해주세요.`);
        return false;
      }
      if (sizeOptionsForCategory.length > 0) {
        if (!option.productSize) {
          alert(`${i + 1}번째 상품 옵션의 사이즈를 선택해주세요.`);
          return false;
        }
        if (!sizeOptionsForCategory.includes(option.productSize)) {
          alert(`${i + 1}번째 상품 옵션의 사이즈는 허용된 값만 선택할 수 있습니다.`);
          return false;
        }
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

  // 상품 수정 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedOptions = productOptions.map(option => ({
      ...option,
      productSize: sizeOptionsForCategory.length > 0 ? option.productSize : 'FREE'
    }));

    if (!validateForm(normalizedOptions)) {
      return;
    }

    setLoading(true);

    try {
      // TODO: 실제 API 연동 필요
      // FormData를 사용하여 이미지 파일과 함께 전송
      const submitData = new FormData();
      
      // 게시물 기본 정보 (ProductPost)
      submitData.append('postId', id);
      submitData.append('postName', formData.postName);
      submitData.append('description', formData.description);
      submitData.append('categoryName', formData.categoryName);
      submitData.append('material', formData.material);
      submitData.append('gender', formData.gender);
      submitData.append('season', formData.season);
      submitData.append('status', formData.status);
      
      // 상품 옵션 정보 (Product) - JSON으로 전송
      const productsData = normalizedOptions.map(option => ({
        productId: option.productId, // 기존 상품은 ID 유지, 새 상품은 null
        color: option.color,
        productSize: option.productSize,
        price: parseInt(option.price),
        discountPrice: option.discountPrice ? parseInt(option.discountPrice) : null,
        stock: parseInt(option.stock) || 0,
        status: option.status
      }));
      submitData.append('products', JSON.stringify(productsData));
      
      // 기존 이미지 정보 (삭제된 이미지 제외)
      const keptExistingImages = images
        .filter(img => img.isExisting)
        .map(img => img.imageId);
      submitData.append('keptImageIds', JSON.stringify(keptExistingImages));
      
      // 새로 추가된 이미지 파일들
      images
        .filter(img => !img.isExisting && img.file)
        .forEach((image, index) => {
          submitData.append('images', image.file);
          submitData.append(`imageIsMain_${index}`, image.isMain);
        });
      
      // 기존 상품 설명 이미지 유지
      const keptExistingDescriptionImages = descriptionImages
        .filter(img => img.isExisting)
        .map(img => img.imageId);
      submitData.append('keptDescriptionImageIds', JSON.stringify(keptExistingDescriptionImages));

      // 새로 추가된 설명 이미지 파일들
      descriptionImages
        .filter(img => !img.isExisting && img.file)
        .forEach((image) => {
          submitData.append('descriptionImages', image.file);
        });
      
      // 대표 이미지 인덱스
      const mainImageIndex = images.findIndex(img => img.isMain);
      submitData.append('mainImageIndex', mainImageIndex);

      // API 호출 (임시)
      // const response = await fetch(`/productposts?postId=${id}`, {
      //   method: 'PUT',
      //   body: submitData,
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // });

      // const data = await response.json();
      // if (data.rt === 'OK') {
      //   alert('상품이 성공적으로 수정되었습니다.');
      //   navigate('/sellerDashboard');
      // } else {
      //   alert('상품 수정에 실패했습니다: ' + data.message);
      // }

      // 임시 성공 처리
      console.log('수정 데이터:', {
        postId: id,
        postData: formData,
        products: productsData,
        imagesCount: images.length
      });
      alert('상품이 성공적으로 수정되었습니다.');
      navigate('/sellerDashboard?tab=products');
      
    } catch (error) {
      console.error('상품 수정 중 오류 발생:', error);
      alert('상품 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="product-register">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p>상품 데이터를 불러오는 중...</p>
          </div>

          {/* 상품 설명 이미지 섹션 */}
          <div className="form-section">
            <h2 className="section-title">상품 설명 이미지</h2>
            <div className="form-group">
              <label className="form-label">
                설명 이미지 <span className="required">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleDescriptionImagesChange}
                className="form-input-file"
                id="description-image-upload"
              />
              <label htmlFor="description-image-upload" className="file-upload-label">
                설명 이미지 추가 (최대 10개, 각 5MB 이하)
              </label>
              <p className="form-hint">
                상품 설명 영역에 노출될 상세 이미지입니다.
              </p>
            </div>

            {descriptionImages.length > 0 && (
              <div className="description-image-preview-list">
                {descriptionImages.map((image, index) => (
                  <div key={`desc-${index}`} className="description-image-item">
                    <img src={image.preview} alt={`설명 이미지 ${index + 1}`} />
                    {image.isExisting && <span className="existing-label">기존</span>}
                    <button
                      type="button"
                      className="btn-description-image-remove"
                      onClick={() => handleDescriptionImageRemove(index)}
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-register">
      <div className="container">
        <h1 className="register-title">상품 수정</h1>

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
                  카테고리 <span className="required">*</span>
                </label>
                <div className="category-selector">
                  {/* 대분류 선택 */}
                  <div className="category-level-select">
                    <label className="category-label">대분류</label>
                    <select
                      value={selectedMainCategory || ''}
                      onChange={(e) => handleMainCategorySelect(e.target.value)}
                      className="form-input"
                      required
                    >
                      <option value="">선택하세요</option>
                      <option value="전체">전체</option>
                      <option value="남성">남성</option>
                      <option value="여성">여성</option>
                    </select>
                  </div>

                  {/* 중분류 선택 */}
                  {selectedMainCategory && (
                    <div className="category-level-select">
                      <label className="category-label">중분류</label>
                      <select
                        value={selectedSubCategory || ''}
                        onChange={(e) => handleSubCategorySelect(e.target.value)}
                        className="form-input"
                        required
                      >
                        <option value="">선택하세요</option>
                        {Object.keys(categoriesData[selectedMainCategory] || {}).map(subCat => (
                          <option key={subCat} value={subCat}>
                            {subCat}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* 소분류 선택 */}
                  {selectedMainCategory && selectedSubCategory && (
                    <div className="category-level-select">
                      <label className="category-label">소분류</label>
                      <select
                        value={selectedItem || ''}
                        onChange={(e) => handleItemSelect(e.target.value)}
                        className="form-input"
                        required
                      >
                        <option value="">선택하세요</option>
                        {categoriesData[selectedMainCategory]?.[selectedSubCategory]?.map(item => (
                          <option key={item.name} value={item.name}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* 선택된 카테고리명 표시 */}
                  {formData.categoryName && (
                    <div className="selected-category">
                      <span className="category-display">선택된 카테고리: {formData.categoryName}</span>
                    </div>
                  )}
                </div>
                <p className="form-hint">대분류 → 중분류 → 소분류 순서로 선택하세요</p>
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
                          {sizeOptionsForCategory.length > 0 ? (
                            <select
                              value={option.productSize}
                              onChange={(e) => handleProductOptionChange(option.id, 'productSize', e.target.value)}
                              className="form-input-small"
                              required
                            >
                              <option value="">선택</option>
                              {sizeOptionsForCategory.map(size => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="size-na-text">선택 없음</span>
                          )}
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
                이미지 추가 (최대 10개, 각 5MB 이하)
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
                      {image.isExisting && <div className="existing-badge">기존</div>}
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
              {loading ? '수정 중...' : '상품 수정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductEdit;

