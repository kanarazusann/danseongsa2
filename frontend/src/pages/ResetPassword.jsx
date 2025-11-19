import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPassword } from '../services/findIdPwd';
import './ResetPassword.css';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 입력값 검증
    if (!newPassword.trim()) {
      alert('비밀번호를 입력하세요.');
      return;
    }

    if (!confirmPassword.trim()) {
      alert('비밀번호를 재입력하세요.');
      return;
    }

    // 비밀번호 일치 검증
    if (newPassword !== confirmPassword) {
      alert('비밀번호 일치하지 않습니다.');
      return;
    }

    if (!email) {
      alert('이메일 정보가 없습니다. 로그인 페이지로 이동합니다.');
      navigate('/login');
      return;
    }

    try {
      const result = await resetPassword(email, newPassword);
      
      if (result.success) {
        alert(result.message);
        navigate('/login');
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert('비밀번호 재설정 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-box">
          <h1 className="reset-password-title">DANSUNGSA</h1>
          <p className="reset-password-subtitle">비밀번호 재설정</p>
          
          <form className="reset-password-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="password"
                className="form-input"
                placeholder="새 비밀번호"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <input
                type="password"
                className="form-input"
                placeholder="재입력"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            
            <button
              type="submit"
              className="btn-reset"
            >
              재설정
            </button>
          </form>
          
          <div className="find-links">
            <Link to="/login">로그인</Link>
            <span>|</span>
            <Link to="/find-id">아이디 찾기</Link>
            <span>|</span>
            <Link to="/find-password">비밀번호 찾기</Link>
            <span>|</span>
            <Link to="/signup">회원가입</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;

