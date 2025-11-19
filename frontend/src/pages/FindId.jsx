import { useState } from 'react';
import { Link } from 'react-router-dom';
import { findId } from '../services/findIdPwd';
import './FindId.css';

function FindId() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [foundEmail, setFoundEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFoundEmail('');

    // 입력값 검증
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    if (!phone.trim()) {
      alert('전화번호를 입력해주세요.');
      return;
    }

    // 전화번호 11자리 검증
    const phoneNumber = phone.trim();
    if (phoneNumber.length !== 11) {
      alert('전화번호는 11자리로 입력해주세요.');
      return;
    }

    try {
      const result = await findId(name.trim(), phone.trim());
      
      if (result.success) {
        setFoundEmail(result.email);
      } else {
        alert(result.message);
        setFoundEmail('');
      }
    } catch (err) {
      alert('아이디 찾기 중 오류가 발생했습니다.');
      setFoundEmail('');
    }
  };

  return (
    <div className="find-id-page">
      <div className="find-id-container">
        <div className="find-id-box">
          <h1 className="find-id-title">DANSUNGSA</h1>
          <p className="find-id-subtitle">아이디 찾기</p>
          
          {!foundEmail ? (
            <>
              <form className="find-id-form" onSubmit={handleSubmit}>
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
                    type="tel"
                    className="form-input"
                    placeholder="전화번호(- 없이 입력)"
                    value={phone}
                    onChange={(e) => {
                      // 숫자만 입력 가능하도록 필터링
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setPhone(value);
                    }}
                    maxLength={11}
                  />
                </div>
                
                <button
                  type="submit"
                  className="btn-find"
                >
                  아이디 찾기
                </button>
              </form>
            </>
          ) : (
            <div className="result-box">
              <p className="result-text">회원님의 아이디는</p>
              <div className="result-email">{foundEmail}</div>
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
