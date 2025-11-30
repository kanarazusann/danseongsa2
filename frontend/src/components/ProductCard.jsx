import { Link } from 'react-router-dom';
import './ProductCard.css';
import { resolveImageUrl } from '../utils/image';

function ProductCard({ product }) {
  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice !== null && product.discountPrice !== undefined;
  const resolvedImage = resolveImageUrl(product.image);
  const hasValidImage = !!resolvedImage && resolvedImage.trim() !== '';

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-image">
        {hasValidImage ? (
          <img 
            src={resolvedImage} 
            alt={product.name || '상품 이미지'}
            loading="lazy"
            onError={(e) => {
              console.error('이미지 로드 실패:', resolvedImage);
              e.target.style.display = 'none';
              const placeholder = e.target.parentElement.querySelector('.product-image-placeholder');
              if (placeholder) {
                placeholder.style.display = 'flex';
              } else {
                const newPlaceholder = document.createElement('div');
                newPlaceholder.className = 'product-image-placeholder';
                newPlaceholder.textContent = '이미지 없음';
                e.target.parentElement.appendChild(newPlaceholder);
              }
            }}
          />
        ) : (
          <div className="product-image-placeholder">이미지 없음</div>
        )}
        <div className="product-overlay">
          <button className="quick-view">QUICK VIEW</button>
        </div>
      </div>
      <div className="product-info">
        {product.brand && (
          <p className="product-brand">{product.brand}</p>
        )}
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price-wrapper">
          {hasDiscount && (
            <span className="product-original-price">{product.price.toLocaleString()}원</span>
          )}
          <span className="product-price">{displayPrice.toLocaleString()}원</span>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;