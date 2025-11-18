import { useState } from 'react';
import { Link } from 'react-router-dom';
import './FindPassword.css';

function FindPassword() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: ''
  });
  const [step, setStep] = useState(1); // 1: 정보 입력, 2: 비밀번호 재설정

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 비밀번호 찾기 API 호출
    console.log('Find Password attempt:', formData);
    // 임시로 다음 단계로 이동
    // setStep(2);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    // TODO: 비밀번호 재설정 API 호출
    console.log('Reset password');
  };

  return (
    <div className="find-password-page">
      <div className="find-password-container">
        <div className="find-password-box">
          <h1 className="find-password-title">DANSUNGSA</h1>
          <p className="find-password-subtitle">비밀번호 찾기</p>

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="find-password-form">
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="이메일 *"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="이름 *"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="전화번호 *"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn-find">
                비밀번호 찾기
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="reset-password-form">
              <div className="form-group">
                <input
                  type="password"
                  name="newPassword"
                  placeholder="새 비밀번호 *"
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="newPasswordConfirm"
                  placeholder="새 비밀번호 확인 *"
                  required
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn-reset">
                비밀번호 재설정
              </button>
            </form>
          )}

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

