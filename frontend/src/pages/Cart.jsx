import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Cart.css';

function Cart() {
  const navigate = useNavigate();
  const [testData, setTestData] = useState(null);

  useEffect(() => {
        // 테스트 데이터 가져오기
        fetchData();
    }, []);

    const fetchData = async () => {
    try {
        const response = await fetch(`http://localhost:8080/test`);
        const data = await response.json();
        if(data.rt === "OK") {
            setTestData(data.item);   // 서버 데이터 state에 저장
        } else {
            alert("해당 게시글이 존재하지 않습니다.");
        }
    } catch(err) {
        console.error(err);
    }
};

  
  // 임시 장바구니 데이터 (나중에 API로 교체)
  const [cartItems, setCartItems] = useState([
    {
      cartId: 1,
      productId: 1,
      productName: '클래식 오버핏 코트',
      productImage: 'https://via.placeholder.com/300x400/000000/FFFFFF?text=COAT',
      price: 89000,
      discountPrice: null,
      quantity: 1,
      createdAt: '2025-01-14'
    },
    {
      cartId: 2,
      productId: 2,
      productName: '베이직 티셔츠',
      productImage: 'https://via.placeholder.com/300x400/FFFFFF/000000?text=T-SHIRT',
      price: 29000,
      discountPrice: null,
      quantity: 2,
      createdAt: '2025-01-14'
    },
    {
      cartId: 3,
      productId: 3,
      productName: '슬림 데님 팬츠',
      productImage: 'https://via.placeholder.com/300x400/000000/FFFFFF?text=PANTS',
      price: 59000,
      discountPrice: 49000,
      quantity: 1,
      createdAt: '2025-01-13'
    }
  ]);

  const [selectedItems, setSelectedItems] = useState(new Set(cartItems.map(item => item.cartId)));

  // 전체 선택/해제
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(new Set(cartItems.map(item => item.cartId)));
    } else {
      setSelectedItems(new Set());
    }
  };

  // 개별 선택/해제
  const handleSelectItem = (cartId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(cartId)) {
      newSelected.delete(cartId);
    } else {
      newSelected.add(cartId);
    }
    setSelectedItems(newSelected);
  };

  // 수량 변경
  const handleQuantityChange = (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(cartItems.map(item =>
      item.cartId === cartId ? { ...item, quantity: newQuantity } : item
    ));
  };

  // 상품 삭제
  const handleDeleteItem = (cartId) => {
    if (window.confirm('장바구니에서 삭제하시겠습니까?')) {
      setCartItems(cartItems.filter(item => item.cartId !== cartId));
      const newSelected = new Set(selectedItems);
      newSelected.delete(cartId);
      setSelectedItems(newSelected);
    }
  };

  // 선택된 상품 삭제
  const handleDeleteSelected = () => {
    if (selectedItems.size === 0) {
      alert('삭제할 상품을 선택해주세요.');
      return;
    }
    if (window.confirm(`선택한 ${selectedItems.size}개의 상품을 삭제하시겠습니까?`)) {
      setCartItems(cartItems.filter(item => !selectedItems.has(item.cartId)));
      setSelectedItems(new Set());
    }
  };

  // 총 금액 계산
  const calculateTotal = () => {
    return cartItems
      .filter(item => selectedItems.has(item.cartId))
      .reduce((total, item) => {
        const itemPrice = item.discountPrice || item.price;
        return total + (itemPrice * item.quantity);
      }, 0);
  };

  // 선택된 상품 수
  const selectedCount = selectedItems.size;
  const totalPrice = calculateTotal();

  const isAllSelected = cartItems.length > 0 && selectedItems.size === cartItems.length;

  // 주문하기 핸들러
  const handleOrder = () => {
    if (selectedCount === 0) {
      alert('주문할 상품을 선택해주세요.');
      return;
    }

    // 선택된 상품들만 필터링
    const selectedCartItems = cartItems.filter(item => selectedItems.has(item.cartId));
    
    // 주문 페이지로 이동 (선택된 상품들 전달)
    navigate('/order', { state: { selectedItems: selectedCartItems } });
  };

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="cart-title">장바구니</h1>
        <h1>{testData ? testData.name : '로딩 중...'}</h1>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <p className="empty-message">장바구니가 비어있습니다.</p>
            <Link to="/products" className="btn-primary">
              쇼핑하러 가기
            </Link>
          </div>
        ) : (
          <>
            {/* 장바구니 상품 목록 */}
            <div className="cart-header">
              <label className="select-all-checkbox">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
                <span>전체 선택</span>
              </label>
              <button
                onClick={handleDeleteSelected}
                className="btn-delete-selected"
                disabled={selectedCount === 0}
              >
                선택 삭제 ({selectedCount})
              </button>
            </div>

            <div className="cart-items">
              {cartItems.map(item => {
                const itemPrice = item.discountPrice || item.price;
                const itemTotal = itemPrice * item.quantity;
                const isSelected = selectedItems.has(item.cartId);

                return (
                  <div key={item.cartId} className={`cart-item ${isSelected ? 'selected' : ''}`}>
                    <div className="cart-item-checkbox">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectItem(item.cartId)}
                      />
                    </div>
                    <Link to={`/product/${item.productId}`} className="cart-item-image">
                      <img src={item.productImage} alt={item.productName} />
                    </Link>
                    <div className="cart-item-info">
                      <Link to={`/product/${item.productId}`} className="cart-item-name">
                        {item.productName}
                      </Link>
                      <div className="cart-item-price">
                        {item.discountPrice ? (
                          <>
                            <span className="original-price">{item.price.toLocaleString()}원</span>
                            <span className="discount-price">{item.discountPrice.toLocaleString()}원</span>
                          </>
                        ) : (
                          <span>{item.price.toLocaleString()}원</span>
                        )}
                      </div>
                    </div>
                    <div className="cart-item-quantity">
                      <button
                        onClick={() => handleQuantityChange(item.cartId, item.quantity - 1)}
                        className="quantity-btn"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.cartId, parseInt(e.target.value) || 1)}
                        min="1"
                        className="quantity-input"
                      />
                      <button
                        onClick={() => handleQuantityChange(item.cartId, item.quantity + 1)}
                        className="quantity-btn"
                      >
                        +
                      </button>
                    </div>
                    <div className="cart-item-total">
                      <span className="total-label">합계</span>
                      <span className="total-price">{itemTotal.toLocaleString()}원</span>
                    </div>
                    <button
                      onClick={() => handleDeleteItem(item.cartId)}
                      className="cart-item-delete"
                      title="삭제"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>

            {/* 주문 요약 */}
            <div className="cart-summary">
              <div className="summary-info">
                <div className="summary-row">
                  <span>선택 상품</span>
                  <span>{selectedCount}개</span>
                </div>
                <div className="summary-row">
                  <span>상품 금액</span>
                  <span>{totalPrice.toLocaleString()}원</span>
                </div>
                <div className="summary-row">
                  <span>배송비</span>
                  <span>{totalPrice >= 50000 ? '무료' : '3,000원'}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total">
                  <span>총 결제금액</span>
                  <span className="final-price">
                    {(totalPrice + (totalPrice >= 50000 ? 0 : 3000)).toLocaleString()}원
                  </span>
                </div>
              </div>
              <div className="summary-actions">
                <button
                  className="btn-order"
                  disabled={selectedCount === 0}
                  onClick={handleOrder}
                >
                  주문하기 ({selectedCount})
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;
