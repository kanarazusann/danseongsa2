import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // 로그인 상태 확인 (나중에 실제 세션 관리로 교체 예정)
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

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
    if (user.isSeller === 1 || user.isSeller === true) {
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
    // isSeller는 0 또는 1 (0: 일반, 1: 사업자)
    if (user.isSeller !== 1 && user.isSeller !== true) {
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
              <Link to="/login" className="icon-link">
                <span className="icon">🔐</span>
                <span className="text">로그인</span>
              </Link>
              {/* 사업자 로그인 상태가 아닐 때만 장바구니 아이콘 표시 */}
              {/* isSeller는 0 또는 1 (0: 일반, 1: 사업자) */}
              {!user || (user.isSeller !== 1 && user.isSeller !== true) ? (
                <a href="#" onClick={handleCartClick} className="icon-link">
                  <span className="icon">🛒</span>
                  <span className="text">장바구니</span>
                </a>
              ) : null}
              <a href="#" onClick={handleMyPageClick} className="icon-link">
                <span className="icon">👤</span>
                <span className="text">{(user && (user.isSeller === 1 || user.isSeller === true)) ? '대시보드' : '마이페이지'}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;