import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Signup.css';

function Signup() {
  const [userType, setUserType] = useState('general'); // 'general' or 'business'
  
  // 일반회원 폼 데이터
  const [generalForm, setGeneralForm] = useState({
    email: '',
    emailVerified: false,
    emailCode: '',
    name: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    address: '',
    addressDetail: ''
  });

  // 사업자 폼 데이터
  const [businessForm, setBusinessForm] = useState({
    email: '',
    emailVerified: false,
    emailCode: '',
    businessName: '',
    businessNumber: '',
    managerName: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    address: '',
    addressDetail: ''
  });

  // 다음 주소 API 호출
  const handleAddressSearch = () => {
    if (window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        oncomplete: function(data) {
          const address = data.address;
          const extraAddress = data.addressType === 'R' ? data.bname : '';
          
          if (userType === 'general') {
            setGeneralForm(prev => ({
              ...prev,
              address: address + (extraAddress ? ` (${extraAddress})` : '')
            }));
          } else {
            setBusinessForm(prev => ({
              ...prev,
              address: address + (extraAddress ? ` (${extraAddress})` : '')
            }));
          }
        }
      }).open();
    }
  };

  // 일반회원 폼 변경
  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 사업자 폼 변경
  const handleBusinessChange = (e) => {
    const { name, value } = e.target;
    setBusinessForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 이메일 인증 코드 전송
  const handleSendEmailCode = () => {
    const email = userType === 'general' ? generalForm.email : businessForm.email;
    if (!email) {
      alert('이메일을 입력해주세요.');
      return;
    }
    // TODO: 이메일 인증 코드 전송 API 호출
    console.log('Send email code to:', email);
    alert('인증 코드가 전송되었습니다.');
  };

  // 이메일 인증 코드 확인
  const handleVerifyEmail = () => {
    const email = userType === 'general' ? generalForm.email : businessForm.email;
    const code = userType === 'general' ? generalForm.emailCode : businessForm.emailCode;
    // TODO: 이메일 인증 코드 확인 API 호출
    console.log('Verify email code:', { email, code });
    if (userType === 'general') {
      setGeneralForm(prev => ({ ...prev, emailVerified: true }));
    } else {
      setBusinessForm(prev => ({ ...prev, emailVerified: true }));
    }
    alert('이메일 인증이 완료되었습니다.');
  };

  // 일반회원 가입 제출
  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    if (!generalForm.emailVerified) {
      alert('이메일 인증을 완료해주세요.');
      return;
    }
    if (generalForm.password !== generalForm.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    const submitData = {
      email: generalForm.email,
      password: generalForm.password,
      name: generalForm.name,
      phone: generalForm.phone,
      address: generalForm.address + ' ' + generalForm.addressDetail,
      isSeller: 0  // 0: 일반, 1: 사업자
    };
    // TODO: 회원가입 API 호출
    console.log('General signup:', submitData);
  };

  // 사업자 가입 제출
  const handleBusinessSubmit = (e) => {
    e.preventDefault();
    if (!businessForm.emailVerified) {
      alert('이메일 인증을 완료해주세요.');
      return;
    }
    if (businessForm.password !== businessForm.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    const submitData = {
      email: businessForm.email,
      password: businessForm.password,
      name: businessForm.managerName, // 담당자명을 name으로 사용
      phone: businessForm.phone,
      address: businessForm.address + ' ' + businessForm.addressDetail,
      isSeller: 1,  // 0: 일반, 1: 사업자
      businessNumber: businessForm.businessNumber
    };
    // TODO: 회원가입 API 호출
    console.log('Business signup:', submitData);
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h1 className="signup-title">DANSUNGSA</h1>
        <p className="signup-subtitle">회원가입</p>

        {/* 회원 유형 선택 */}
        <div className="user-type-selector">
          <button
            type="button"
            className={`type-btn ${userType === 'general' ? 'active' : ''}`}
            onClick={() => setUserType('general')}
          >
            일반회원
          </button>
          <button
            type="button"
            className={`type-btn ${userType === 'business' ? 'active' : ''}`}
            onClick={() => setUserType('business')}
          >
            사업자회원
          </button>
        </div>

        {/* 일반회원 가입 폼 */}
        {userType === 'general' && (
          <div className="signup-box">
            <form onSubmit={handleGeneralSubmit} className="signup-form">
              <div className="form-group">
                <div className="email-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="이메일 *"
                    value={generalForm.email}
                    onChange={handleGeneralChange}
                    required
                    className="form-input"
                    disabled={generalForm.emailVerified}
                  />
                  <button
                    type="button"
                    onClick={handleSendEmailCode}
                    className="btn-verify"
                    disabled={generalForm.emailVerified || !generalForm.email}
                  >
                    {generalForm.emailVerified ? '인증완료' : '인증코드 전송'}
                  </button>
                </div>
              </div>
              {!generalForm.emailVerified && (
                <div className="form-group">
                  <div className="email-group">
                    <input
                      type="text"
                      name="emailCode"
                      placeholder="인증 코드 입력"
                      value={generalForm.emailCode}
                      onChange={handleGeneralChange}
                      className="form-input"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyEmail}
                      className="btn-verify"
                    >
                      인증하기
                    </button>
                  </div>
                </div>
              )}
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="이름 *"
                  value={generalForm.name}
                  onChange={handleGeneralChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="비밀번호 *"
                  value={generalForm.password}
                  onChange={handleGeneralChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="passwordConfirm"
                  placeholder="비밀번호 확인 *"
                  value={generalForm.passwordConfirm}
                  onChange={handleGeneralChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="전화번호 *"
                  value={generalForm.phone}
                  onChange={handleGeneralChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <div className="address-group">
                  <input
                    type="text"
                    name="address"
                    placeholder="주소 *"
                    value={generalForm.address}
                    onChange={handleGeneralChange}
                    required
                    readOnly
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={handleAddressSearch}
                    className="btn-address"
                  >
                    주소 검색
                  </button>
                </div>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="addressDetail"
                  placeholder="상세 주소"
                  value={generalForm.addressDetail}
                  onChange={handleGeneralChange}
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn-signup">
                회원가입
              </button>
            </form>
          </div>
        )}

        {/* 사업자 가입 폼 */}
        {userType === 'business' && (
          <div className="signup-box">
            <form onSubmit={handleBusinessSubmit} className="signup-form">
              <div className="form-group">
                <div className="email-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="이메일 *"
                    value={businessForm.email}
                    onChange={handleBusinessChange}
                    required
                    className="form-input"
                    disabled={businessForm.emailVerified}
                  />
                  <button
                    type="button"
                    onClick={handleSendEmailCode}
                    className="btn-verify"
                    disabled={businessForm.emailVerified || !businessForm.email}
                  >
                    {businessForm.emailVerified ? '인증완료' : '인증코드 전송'}
                  </button>
                </div>
              </div>
              {!businessForm.emailVerified && (
                <div className="form-group">
                  <div className="email-group">
                    <input
                      type="text"
                      name="emailCode"
                      placeholder="인증 코드 입력"
                      value={businessForm.emailCode}
                      onChange={handleBusinessChange}
                      className="form-input"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyEmail}
                      className="btn-verify"
                    >
                      인증하기
                    </button>
                  </div>
                </div>
              )}
              <div className="form-group">
                <input
                  type="text"
                  name="businessName"
                  placeholder="상호명 *"
                  value={businessForm.businessName}
                  onChange={handleBusinessChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="businessNumber"
                  placeholder="사업자등록번호 *"
                  value={businessForm.businessNumber}
                  onChange={handleBusinessChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="managerName"
                  placeholder="담당자명 *"
                  value={businessForm.managerName}
                  onChange={handleBusinessChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="비밀번호 *"
                  value={businessForm.password}
                  onChange={handleBusinessChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="passwordConfirm"
                  placeholder="비밀번호 확인 *"
                  value={businessForm.passwordConfirm}
                  onChange={handleBusinessChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="전화번호 *"
                  value={businessForm.phone}
                  onChange={handleBusinessChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <div className="address-group">
                  <input
                    type="text"
                    name="address"
                    placeholder="주소 *"
                    value={businessForm.address}
                    onChange={handleBusinessChange}
                    required
                    readOnly
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={handleAddressSearch}
                    className="btn-address"
                  >
                    주소 검색
                  </button>
                </div>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="addressDetail"
                  placeholder="상세 주소"
                  value={businessForm.addressDetail}
                  onChange={handleBusinessChange}
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn-signup">
                회원가입
              </button>
            </form>
          </div>
        )}

        <div className="login-link">
          <p>이미 계정이 있으신가요? <Link to="/login">로그인</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
