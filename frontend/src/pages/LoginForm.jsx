import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginForm.css';
import { login } from '../services/authService';

function LoginForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // 폼 입력값 변경 처리
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 로그인 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 입력 검증
    if (!formData.email || !formData.email.trim()) {
      alert('이메일을 입력해주세요.');
      return;
    }
    if (!formData.password || !formData.password.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await login(formData);
      console.log('로그인 성공:', result);
      alert('로그인이 완료되었습니다.');
      // 페이지 새로고침하여 Header가 세션을 다시 로드하도록 함
      window.location.href = '/';
    } catch (error) {
      console.error('로그인 오류:', error);
      alert(error.message || '로그인에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
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
            <button type="submit" className="btn-login" disabled={isSubmitting}>
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

