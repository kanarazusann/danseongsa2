import { Link } from 'react-router-dom';
import './ProductCard.css';

function ProductCard({ product }) {
  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice !== null && product.discountPrice !== undefined;

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-image">
        {product.image ? (
          <img src={product.image} alt={product.name} />
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