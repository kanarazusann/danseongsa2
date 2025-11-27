import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Cart.css';
import { fetchSessionUser } from '../services/authService';
import {
  getCartItems,
  updateCartItemQuantity,
  removeCartItem,
  removeCartItems
} from '../services/cartService';
import { resolveImageUrl } from '../utils/image';

function Cart() {
  const navigate = useNavigate();
  const [sessionUser, setSessionUser] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [processingIds, setProcessingIds] = useState(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchSessionUser();
        setSessionUser(data.item);
      } catch (error) {
        alert('로그인이 필요합니다.');
        navigate('/login');
      } finally {
        setSessionChecked(true);
      }
    };
    loadUser();
  }, [navigate]);

  const loadCartItems = useCallback(async () => {
    if (!sessionUser?.userId) return;
    setLoading(true);
    try {
      const response = await getCartItems(sessionUser.userId);
      const items = response.items || [];
      setCartItems(items);
      setSelectedItems(new Set(items.map(item => item.cartId)));
      setErrorMessage('');
    } catch (error) {
      console.error('장바구니 로드 오류:', error);
      setErrorMessage(error.message || '장바구니를 불러오지 못했습니다.');
      setCartItems([]);
      setSelectedItems(new Set());
    } finally {
      setLoading(false);
    }
  }, [sessionUser]);

  useEffect(() => {
    if (sessionUser?.userId) {
      loadCartItems();
    }
  }, [sessionUser, loadCartItems]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(new Set(cartItems.map(item => item.cartId)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (cartId) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(cartId)) {
        next.delete(cartId);
      } else {
        next.add(cartId);
      }
      return next;
    });
  };

  const handleQuantityChange = async (cartId, requestedQuantity) => {
    if (requestedQuantity < 1 || !sessionUser) return;
    const target = cartItems.find(item => item.cartId === cartId);
    if (!target) return;

    const maxQuantity = target.stock != null ? Math.max(1, target.stock) : requestedQuantity;
    const quantity = Math.min(requestedQuantity, maxQuantity);
    if (quantity === target.quantity) return;

    setProcessingIds(prev => {
      const next = new Set(prev);
      next.add(cartId);
      return next;
    });

    setCartItems(prev =>
      prev.map(item => (item.cartId === cartId ? { ...item, quantity } : item))
    );

    try {
      const response = await updateCartItemQuantity({
        cartId,
        userId: sessionUser.userId,
        quantity
      });
      if (response.item) {
        setCartItems(prev =>
          prev.map(item => (item.cartId === cartId ? response.item : item))
        );
      }
    } catch (error) {
      console.error('수량 변경 오류:', error);
      alert(error.message || '수량 변경 중 오류가 발생했습니다.');
      loadCartItems();
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(cartId);
        return next;
      });
    }
  };

  const handleDeleteItem = async (cartId) => {
    if (!sessionUser) return;
    if (!window.confirm('장바구니에서 삭제하시겠습니까?')) {
      return;
    }

    setProcessingIds(prev => {
      const next = new Set(prev);
      next.add(cartId);
      return next;
    });

    try {
      await removeCartItem({ cartId, userId: sessionUser.userId });
      setCartItems(prev => prev.filter(item => item.cartId !== cartId));
      setSelectedItems(prev => {
        const next = new Set(prev);
        next.delete(cartId);
        return next;
      });
    } catch (error) {
      console.error('장바구니 삭제 오류:', error);
      alert(error.message || '상품 삭제 중 오류가 발생했습니다.');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(cartId);
        return next;
      });
    }
  };

  const handleDeleteSelected = async () => {
    if (!sessionUser) return;
    if (selectedItems.size === 0) {
      alert('삭제할 상품을 선택해주세요.');
      return;
    }
    if (!window.confirm(`선택한 ${selectedItems.size}개의 상품을 삭제하시겠습니까?`)) {
      return;
    }

    setBulkProcessing(true);
    try {
      await removeCartItems({
        userId: sessionUser.userId,
        cartIds: Array.from(selectedItems)
      });
      setCartItems(prev => prev.filter(item => !selectedItems.has(item.cartId)));
      setSelectedItems(new Set());
    } catch (error) {
      console.error('선택 삭제 오류:', error);
      alert(error.message || '선택한 상품 삭제 중 오류가 발생했습니다.');
    } finally {
      setBulkProcessing(false);
    }
  };

  const selectedCount = selectedItems.size;

  const totals = useMemo(() => {
    const totalPrice = cartItems
      .filter(item => selectedItems.has(item.cartId))
      .reduce((sum, item) => {
        const price = item.discountPrice ?? item.price ?? 0;
        return sum + price * item.quantity;
      }, 0);
    const shipping = totalPrice === 0 ? 0 : totalPrice >= 50000 ? 0 : 3000;
    const finalPrice = totalPrice + shipping;
    return { totalPrice, shipping, finalPrice };
  }, [cartItems, selectedItems]);

  const isAllSelected =
    cartItems.length > 0 && selectedItems.size === cartItems.length;

  const handleOrder = () => {
    if (selectedCount === 0) {
      alert('주문할 상품을 선택해주세요.');
      return;
    }
    const selectedCartItems = cartItems.filter(item => selectedItems.has(item.cartId));
    navigate('/order', { state: { selectedItems: selectedCartItems } });
  };

  if (!sessionChecked || loading) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="loading">장바구니를 불러오는 중입니다...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="cart-title">장바구니</h1>

        {errorMessage && (
          <div className="cart-error">
            <p>{errorMessage}</p>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <p className="empty-message">장바구니가 비어있습니다.</p>
            <Link to="/products" className="btn-primary">
              쇼핑하러 가기
            </Link>
          </div>
        ) : (
          <>
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
                disabled={selectedCount === 0 || bulkProcessing}
              >
                선택 삭제 ({selectedCount})
              </button>
            </div>

            <div className="cart-items">
              {cartItems.map(item => {
                const itemPrice = item.discountPrice ?? item.price ?? 0;
                const itemTotal = itemPrice * item.quantity;
                const isSelected = selectedItems.has(item.cartId);
                const isProcessing = processingIds.has(item.cartId);

                return (
                  <div key={item.cartId} className={`cart-item ${isSelected ? 'selected' : ''}`}>
                    <div className="cart-item-checkbox">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectItem(item.cartId)}
                      />
                    </div>
                    <Link to={`/product/${item.postId}`} className="cart-item-image">
                      {item.imageUrl ? (
                        <img src={resolveImageUrl(item.imageUrl)} alt={item.postName} />
                      ) : (
                        <div className="product-image-placeholder">이미지 없음</div>
                      )}
                    </Link>
                    <div className="cart-item-info">
                      <Link to={`/product/${item.postId}`} className="cart-item-name">
                        {item.postName}
                      </Link>
                      <p className="cart-item-brand">{item.brand}</p>
                      <p className="cart-item-option">
                        {item.color} / {item.productSize}
                      </p>
                      <div className="cart-item-price">
                        {item.discountPrice ? (
                          <>
                            <span className="original-price">{item.price?.toLocaleString()}원</span>
                            <span className="discount-price">
                              {item.discountPrice.toLocaleString()}원
                            </span>
                          </>
                        ) : (
                          <span>{item.price?.toLocaleString()}원</span>
                        )}
                      </div>
                    </div>
                    <div className="cart-item-quantity">
                      <button
                        onClick={() => handleQuantityChange(item.cartId, item.quantity - 1)}
                        className="quantity-btn"
                        disabled={item.quantity <= 1 || isProcessing}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(item.cartId, parseInt(e.target.value, 10) || 1)
                        }
                        min="1"
                        className="quantity-input"
                        disabled={isProcessing}
                      />
                      <button
                        onClick={() => handleQuantityChange(item.cartId, item.quantity + 1)}
                        className="quantity-btn"
                        disabled={isProcessing}
                      >
                        +
                      </button>
                      {item.stock != null && (
                        <span className="stock-info">재고 {item.stock}개</span>
                      )}
                    </div>
                    <div className="cart-item-total">
                      <span className="total-label">합계</span>
                      <span className="total-price">{itemTotal.toLocaleString()}원</span>
                    </div>
                    <button
                      onClick={() => handleDeleteItem(item.cartId)}
                      className="cart-item-delete"
                      title="삭제"
                      disabled={isProcessing}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary">
              <div className="summary-info">
                <div className="summary-row">
                  <span>선택 상품</span>
                  <span>{selectedCount}개</span>
                </div>
                <div className="summary-row">
                  <span>상품 금액</span>
                  <span>{totals.totalPrice.toLocaleString()}원</span>
                </div>
                <div className="summary-row">
                  <span>배송비</span>
                  <span>{totals.shipping === 0 ? '무료' : '3,000원'}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total">
                  <span>총 결제금액</span>
                  <span className="final-price">
                    {totals.finalPrice.toLocaleString()}원
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
