import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { findPassword } from '../services/findIdPwd';
import './FindPassword.css';

function FindPassword() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 입력값 검증
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    if (!email.trim()) {
      alert('이메일을 입력해주세요.');
      return;
    }

    try {
      const result = await findPassword(name.trim(), email.trim());
      
      if (result.success) {
        // 비밀번호 재설정 페이지로 이동 (이메일을 쿼리 파라미터로 전달)
        navigate(`/reset-password?email=${encodeURIComponent(result.email)}`);
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert('비밀번호 찾기 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="find-password-page">
      <div className="find-password-container">
        <div className="find-password-box">
          <h1 className="find-password-title">DANSUNGSA</h1>
          <p className="find-password-subtitle">비밀번호 찾기</p>
          
          <form className="find-password-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                placeholder="이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <input
                type="email"
                className="form-input"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <button
              type="submit"
              className="btn-find"
            >
              비밀번호 찾기
            </button>
          </form>
          
          <div className="find-links">
            <Link to="/login">로그인</Link>
            <span>|</span>
            <Link to="/find-id">아이디 찾기</Link>
            <span>|</span>
            <Link to="/signup">회원가입</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FindPassword;

