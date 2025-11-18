import { useState } from 'react';
import { Link } from 'react-router-dom';
import './FindId.css';

function FindId() {
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [foundEmail, setFoundEmail] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 아이디 찾기 API 호출
    console.log('Find ID attempt:', formData);
    // 임시로 결과 표시 (실제로는 API 응답으로 처리)
    // setFoundEmail('example@email.com');
  };

  return (
    <div className="find-id-page">
      <div className="find-id-container">
        <div className="find-id-box">
          <h1 className="find-id-title">DANSUNGSA</h1>
          <p className="find-id-subtitle">아이디 찾기</p>

          {!foundEmail ? (
            <form onSubmit={handleSubmit} className="find-id-form">
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
                아이디 찾기
              </button>
            </form>
          ) : (
            <div className="result-box">
              <p className="result-text">회원님의 이메일은</p>
              <p className="result-email">{foundEmail}</p>
              <p className="result-text">입니다.</p>
              <Link to="/login" className="btn-login-link">
                로그인하기
              </Link>
            </div>
          )}

          <div className="find-links">
            <Link to="/login">로그인</Link>
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

export default FindId;

