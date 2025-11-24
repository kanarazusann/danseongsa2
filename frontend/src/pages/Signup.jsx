import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Signup.css';
import { requestEmailVerificationCode, verifyEmailCode } from '../services/emailService';
import { registerUser } from '../services/authService';

function Signup() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('general'); // 'general' or 'business'
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 일반회원 폼 데이터
  const [generalForm, setGeneralForm] = useState({
    email: '',
    emailVerified: false,
    emailCode: '',
    name: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    zipcode: '',
    address: '',
    detailAddress: ''
  });

  const [generalVerification, setGeneralVerification] = useState({
    verificationId: '',
    expiresAt: null
  });

  const [businessVerification, setBusinessVerification] = useState({
    verificationId: '',
    expiresAt: null
  });

  // 사업자 폼 데이터
  const [businessForm, setBusinessForm] = useState({
    email: '',
    emailVerified: false,
    emailCode: '',
    brand: '',
    businessNumber: '',
    managerName: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    zipcode: '',
    address: '',
    detailAddress: ''
  });

  useEffect(() => {
    if (window.daum && window.daum.Postcode) {
      return;
    }
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // 다음 주소 검색 API 호출
  const handleAddressSearch = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: function(data) {
        const baseAddress = data.address;
        const extraAddress = data.addressType === 'R' && data.bname ? ` (${data.bname})` : '';
        const formattedAddress = baseAddress + extraAddress;

        if (userType === 'general') {
          setGeneralForm(prev => ({
            ...prev,
            zipcode: data.zonecode,
            address: formattedAddress
          }));
        } else {
          setBusinessForm(prev => ({
            ...prev,
            zipcode: data.zonecode,
            address: formattedAddress
          }));
        }
      }
    }).open();
  };

  // 일반회원 폼 변경
  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setGeneralVerification({ verificationId: '', expiresAt: null });
      setGeneralForm(prev => ({
        ...prev,
        email: value,
        emailCode: '',
        emailVerified: false
      }));
      return;
    }

    setGeneralForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 사업자 폼 변경
  const handleBusinessChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setBusinessVerification({ verificationId: '', expiresAt: null });
      setBusinessForm(prev => ({
        ...prev,
        email: value,
        emailCode: '',
        emailVerified: false
      }));
      return;
    }

    setBusinessForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 이메일 인증 상태 초기화
  const resetVerificationState = (type, options = { keepCode: true }) => {
    if (type === 'general') {
      setGeneralVerification({ verificationId: '', expiresAt: null });
      if (!options.keepCode) {
        setGeneralForm(prev => ({ ...prev, emailCode: '' }));
      }
    } else {
      setBusinessVerification({ verificationId: '', expiresAt: null });
      if (!options.keepCode) {
        setBusinessForm(prev => ({ ...prev, emailCode: '' }));
      }
    }
  };

  // 이메일 인증 코드 발송
  const handleSendEmailCode = async () => {
    const targetForm = userType === 'general' ? generalForm : businessForm;
    const setTargetForm = userType === 'general' ? setGeneralForm : setBusinessForm;
    const setVerification = userType === 'general' ? setGeneralVerification : setBusinessVerification;

    if (!targetForm.email.trim()) {
      alert('이메일을 입력해주세요.');
      return;
    }

    try {
      setIsSendingCode(true);
      resetVerificationState(userType, { keepCode: false });
      const { verificationId, expiresAt } = await requestEmailVerificationCode(targetForm.email.trim());

      setVerification({ verificationId, expiresAt });
      setTargetForm(prev => ({
        ...prev,
        emailVerified: false
      }));

      alert('인증 코드가 전송되었습니다. 이메일을 확인해주세요.');
    } catch (error) {
      console.error('Email verification error:', error);
      alert(error.message || '인증 코드를 발송하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSendingCode(false);
    }
  };

  // 이메일 인증 코드 확인
  const handleVerifyEmail = async () => {
    const targetForm = userType === 'general' ? generalForm : businessForm;
    const setTargetForm = userType === 'general' ? setGeneralForm : setBusinessForm;
    const verification = userType === 'general' ? generalVerification : businessVerification;

    if (!targetForm.emailCode.trim()) {
      alert('인증 코드를 입력해주세요.');
      return;
    }

    if (!verification.verificationId) {
      alert('먼저 인증 코드를 발송해주세요.');
      return;
    }

    try {
      const response = await verifyEmailCode({
        email: targetForm.email.trim(),
        verificationId: verification.verificationId,
        code: targetForm.emailCode.trim()
      });

      setTargetForm(prev => ({
        ...prev,
        emailVerified: true
      }));
      resetVerificationState(userType);
      alert(response.message || '이메일 인증이 완료되었습니다.');
    } catch (error) {
      alert(error.message || '인증 코드 확인에 실패했습니다.');
    }
  };

  // 일반회원 가입 제출
  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    
    // 입력 검증
    if (!generalForm.email || !generalForm.email.trim()) {
      alert('이메일을 입력해주세요.');
      return;
    }
    if (!generalForm.emailVerified) {
      alert('이메일 인증을 완료해주세요.');
      return;
    }
    if (!generalForm.password || !generalForm.password.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }
    if (generalForm.password !== generalForm.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!generalForm.name || !generalForm.name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    if (!generalForm.phone || !generalForm.phone.trim()) {
      alert('전화번호를 입력해주세요.');
      return;
    }
    if (!generalForm.zipcode || !generalForm.address) {
      alert('주소를 검색하여 입력해주세요.');
      return;
    }
    const submitData = {
      email: generalForm.email,
      password: generalForm.password,
      name: generalForm.name,
      phone: generalForm.phone,
      zipcode: generalForm.zipcode,
      address: generalForm.address,
      detailAddress: generalForm.detailAddress,
      isSeller: 0
    };
    try {
      setIsSubmitting(true);
      console.log('회원가입 요청 시작:', submitData);
      const result = await registerUser(submitData);
      console.log('회원가입 성공:', result);
      alert('회원가입이 완료되었습니다.');
      navigate('/');
    } catch (error) {
      console.error('회원가입 오류:', error);
      alert(error.message || '회원가입에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 사업자 가입 제출
  const handleBusinessSubmit = async (e) => {
    e.preventDefault();
    
    // 입력 검증
    if (!businessForm.email || !businessForm.email.trim()) {
      alert('이메일을 입력해주세요.');
      return;
    }
    if (!businessForm.emailVerified) {
      alert('이메일 인증을 완료해주세요.');
      return;
    }
    if (!businessForm.password || !businessForm.password.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }
    if (businessForm.password !== businessForm.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!businessForm.managerName || !businessForm.managerName.trim()) {
      alert('담당자 이름을 입력해주세요.');
      return;
    }
    if (!businessForm.phone || !businessForm.phone.trim()) {
      alert('전화번호를 입력해주세요.');
      return;
    }
    if (!businessForm.zipcode || !businessForm.address) {
      alert('주소를 검색하여 입력해주세요.');
      return;
    }
    if (!businessForm.brand || !businessForm.brand.trim()) {
      alert('상호명을 입력해주세요.');
      return;
    }
    if (!businessForm.businessNumber || !businessForm.businessNumber.trim()) {
      alert('사업자등록번호를 입력해주세요.');
      return;
    }
    const submitData = {
      email: businessForm.email,
      password: businessForm.password,
      name: businessForm.managerName,
      phone: businessForm.phone,
      zipcode: businessForm.zipcode,
      address: businessForm.address,
      detailAddress: businessForm.detailAddress,
      isSeller: 1,
      businessNumber: businessForm.businessNumber,
      brand: businessForm.brand
    };
    try {
      setIsSubmitting(true);
      console.log('사업자 회원가입 요청 시작:', submitData);
      const result = await registerUser(submitData);
      console.log('사업자 회원가입 성공:', result);
      alert('회원가입이 완료되었습니다.');
      navigate('/');
    } catch (error) {
      console.error('사업자 회원가입 오류:', error);
      alert(error.message || '회원가입에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
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
                    className="form-input"
                    disabled={generalForm.emailVerified}
                  />
                  <button
                    type="button"
                    onClick={handleSendEmailCode}
                    className="btn-verify"
                    disabled={generalForm.emailVerified || !generalForm.email || isSendingCode}
                  >
                    {generalForm.emailVerified ? '인증완료' : isSendingCode ? '전송중...' : '인증코드 전송'}
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
              {!generalForm.emailVerified && generalVerification.verificationId && (
                <p className="email-hint">
                  인증 코드는 발급 후 5분간만 유효합니다.
                </p>
              )}
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="이름 *"
                  value={generalForm.name}
                  onChange={handleGeneralChange}
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
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <div className="zipcode-group">
                  <input
                    type="text"
                    name="zipcode"
                    placeholder="우편번호 *"
                    value={generalForm.zipcode}
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
                  name="address"
                  placeholder="주소 *"
                  value={generalForm.address}
                  readOnly
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="detailAddress"
                  placeholder="상세 주소"
                  value={generalForm.detailAddress}
                  onChange={handleGeneralChange}
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn-signup" disabled={isSubmitting}>
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
                    className="form-input"
                    disabled={businessForm.emailVerified}
                  />
                  <button
                    type="button"
                    onClick={handleSendEmailCode}
                    className="btn-verify"
                    disabled={businessForm.emailVerified || !businessForm.email || isSendingCode}
                  >
                    {businessForm.emailVerified ? '인증완료' : isSendingCode ? '전송중...' : '인증코드 전송'}
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
              {!businessForm.emailVerified && businessVerification.verificationId && (
                <p className="email-hint">
                  인증 코드는 발급 후 5분간만 유효합니다.
                </p>
              )}
              <div className="form-group">
                <input
                  type="text"
                  name="brand"
                  placeholder="상호명 *"
                  value={businessForm.brand}
                  onChange={handleBusinessChange}
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
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <div className="zipcode-group">
                  <input
                    type="text"
                    name="zipcode"
                    placeholder="우편번호 *"
                    value={businessForm.zipcode}
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
                  name="address"
                  placeholder="주소 *"
                  value={businessForm.address}
                  readOnly 
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="detailAddress"
                  placeholder="상세 주소"
                  value={businessForm.detailAddress}
                  onChange={handleBusinessChange}
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn-signup" disabled={isSubmitting}>
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
