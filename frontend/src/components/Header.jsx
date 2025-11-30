import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './Header.css';
import { fetchSessionUser, logout } from '../services/authService';
import { getCartItems } from '../services/cartService';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  // 세션에서 사용자 정보 로드
  useEffect(() => {
    const loadSession = async () => {
      try {
        console.log('Header: 세션 로드 시작');
        const data = await fetchSessionUser();
        console.log('Header: 세션 로드 성공:', data.item);
        setUser(data.item);
      } catch (error) {
        console.log('Header: 세션 로드 실패:', error);
        setUser(null);
        setCartCount(0);
      }
    };

    loadSession();
  }, [location.pathname]);

  // 장바구니 개수 로드
  useEffect(() => {
    const loadCartCount = async () => {
      // 로그인되어 있고 일반 회원일 때만 장바구니 개수 조회
      if (user && Number(user.isSeller) !== 1 && user.userId) {
        try {
          const response = await getCartItems(user.userId);
          const items = response.items || [];
          setCartCount(items.length);
        } catch (error) {
          console.log('Header: 장바구니 개수 로드 실패:', error);
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };

    loadCartCount();
  }, [user, location.pathname]);

  // 로그인/로그아웃 버튼 클릭 처리
  const handleAuthClick = async (e) => {
    e.preventDefault();
    if (user) {
      if (!window.confirm('로그아웃하시겠습니까?')) {
        return;
      }
      try {
        await logout();
      } catch (error) {
        console.error(error);
      } finally {
        setUser(null);
        navigate('/');
      }
    } else {
      navigate('/login');
    }
  };

  // 마이페이지 클릭 핸들러
  const handleMyPageClick = (e) => {
    e.preventDefault();
    
    // 로그인 안되어 있으면 로그인 화면으로
    if (!user) {
      navigate('/login');
      return;
    }

    // 판매자면 판매자 페이지로, 일반회원이면 마이페이지로
    // isSeller는 0 또는 1 (0: 일반, 1: 사업자)
    if (Number(user.isSeller) === 1) {
      navigate('/sellerDashboard');
    } else {
      navigate('/mypage');
    }
  };

  // 장바구니 클릭 핸들러
  const handleCartClick = (e) => {
    e.preventDefault();
    
    // 비로그인 상태면 로그인 페이지로 이동
    if (!user) {
      navigate('/login');
      return;
    }

    // 일반회원 로그인 상태면 장바구니로 이동
    if (Number(user.isSeller) !== 1) {
      navigate('/cart');
    }
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo">DANSUNGSA</Link>
            
            <div className="header-icons">
              <a href="#" onClick={handleAuthClick} className="icon-link">
                <span className="icon">🔐</span>
                <span className="text">{user ? '로그아웃' : '로그인'}</span>
              </a>
              {/* 비로그인 상태 또는 일반 회원일 때 장바구니 표시 */}
              {!user || Number(user?.isSeller) !== 1 ? (
                <a href="#" onClick={handleCartClick} className="icon-link cart-link">
                  <span className="icon">🛒</span>
                  <span className="text">장바구니</span>
                  {cartCount > 0 && (
                    <span className="cart-badge">{cartCount}</span>
                  )}
                </a>
              ) : null}
              <a href="#" onClick={handleMyPageClick} className="icon-link">
                <span className="icon">👤</span>
                <span className="text">
                  {user && Number(user.isSeller) === 1 ? '대시보드' : '마이페이지'}
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;