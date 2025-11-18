import { useState } from 'react';
import { Link } from 'react-router-dom';
import './LoginForm.css';

function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // TODO: 실제 로그인 API 호출
    // 임시: DB 더미 데이터와 일치하는 판매자 계정으로 로그인 처리
    if (formData.email === 'seller@dansungsa.com' && formData.password === 'password123') {
      const user = {
        userId: 1,  // DB의 USERID와 일치
        id: 1,      // 호환성을 위해 id도 추가
        email: 'seller@dansungsa.com',
        name: '단성사 판매자',
        phone: '010-1234-5678',
        address: '서울특별시 종로구 종로 123',
        isSeller: 1,  // 판매자 권한 (0: 일반, 1: 사업자) - DB와 일치
        businessNumber: '123-45-67890'
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      alert('로그인 성공!');
      window.location.href = '/sellerDashboard';
      return;
    }
    
    // 일반 로그인 처리 (임시)
    console.log('Login attempt:', formData);
    alert('로그인 기능은 아직 구현 중입니다. 테스트용: seller@dansungsa.com / password123');
  };

//   const handleKakaoLogin = () => {
//     // TODO: 카카오 로그인 연동
//     console.log('Kakao login');
//   };

//   const handleNaverLogin = () => {
//     // TODO: 네이버 로그인 연동
//     console.log('Naver login');
//   };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-box">
          <h1 className="login-title">DANSUNGSA</h1>
          <p className="login-subtitle">로그인</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="이메일"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="비밀번호"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            <button type="submit" className="btn-login">
              로그인
            </button>
          </form>

          <div className="login-links">
            <Link to="/find-id">아이디 찾기</Link>
            <span>|</span>
            <Link to="/find-password">비밀번호 찾기</Link>
          </div>

          {/* <div className="social-login">
            <p className="social-divider">또는</p>
            <button onClick={handleKakaoLogin} className="btn-social btn-kakao">
              카카오로 로그인
            </button>
            <button onClick={handleNaverLogin} className="btn-social btn-naver">
              네이버로 로그인
            </button>
          </div> */}

          <div className="signup-link">
            <p>계정이 없으신가요? <Link to="/signup">회원가입</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;

