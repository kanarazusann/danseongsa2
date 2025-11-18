import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './Header.css';
import { fetchSessionUser, logout } from '../services/authService';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const data = await fetchSessionUser();
        setUser(data.item);
      } catch {
        setUser(null);
      }
    };

    loadSession();
  }, [location.pathname]);

  const handleAuthClick = async (e) => {
    e.preventDefault();
    if (user) {
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
                <a href="#" onClick={handleCartClick} className="icon-link">
                  <span className="icon">🛒</span>
                  <span className="text">장바구니</span>
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