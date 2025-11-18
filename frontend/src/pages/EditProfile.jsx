import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditProfile.css';

function EditProfile() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [addressData, setAddressData] = useState({
    zipCode: '',
    address: '',
    detailAddress: ''
  });
  const [passwordVerification, setPasswordVerification] = useState('');
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editUserInfo, setEditUserInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });

  // TODO: API 연동 필요
  // 사용자 정보 가져오기
  useEffect(() => {
    // 임시 데이터 (실제로는 API에서 가져옴)
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      const defaultName = user.name || '홍길동';
      const defaultPhone = user.phone || '010-1234-5678';
      const defaultEmail = user.email || 'hong@example.com';
      
      setUserInfo({
        name: defaultName,
        phone: defaultPhone,
        email: defaultEmail
      });
      setEditUserInfo({
        name: defaultName,
        phone: defaultPhone,
        email: defaultEmail
      });
      setAddressData({
        zipCode: user.zipCode || '03181',
        address: user.address || '서울특별시 종로구 종로',
        detailAddress: user.detailAddress || '단성사 5층'
      });
    } else {
      // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
      navigate('/login');
    }
  }, [navigate]);

  // 이름 마스킹 (예: 홍길동 -> 홍*동)
  const maskName = (name) => {
    if (name.length <= 2) return name;
    return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
  };

  // 전화번호 마스킹 (예: 010-1234-5678 -> 010-****-5678)
  const maskPhone = (phone) => {
    const parts = phone.split('-');
    if (parts.length === 3) {
      return `${parts[0]}-****-${parts[2]}`;
    }
    return phone;
  };

  // 이메일 마스킹 (예: hong@example.com -> ho****@example.com)
  const maskEmail = (email) => {
    const [local, domain] = email.split('@');
    if (local.length <= 2) return email;
    return local.substring(0, 2) + '****@' + domain;
  };

  const handleAddressChange = (e) => {
    setAddressData({
      ...addressData,
      [e.target.name]: e.target.value
    });
  };

  // 다음 주소 API 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSearchZipCode = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: function(data) {
        // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드
        let addr = ''; // 주소 변수
        let extraAddr = ''; // 참고항목 변수

        // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
        if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
          addr = data.roadAddress;
        } else { // 사용자가 지번 주소를 선택했을 경우(J)
          addr = data.jibunAddress;
        }

        // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
        if(data.userSelectedType === 'R'){
          // 법정동명이 있을 경우 추가한다. (법정리는 제외)
          // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
          if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
            extraAddr += data.bname;
          }
          // 건물명이 있고, 공동주택일 경우 추가한다.
          if(data.buildingName !== '' && data.apartment === 'Y'){
            extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
          }
          // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
          if(extraAddr !== ''){
            extraAddr = ' (' + extraAddr + ')';
          }
        }

        // 우편번호와 주소 정보를 해당 필드에 넣는다.
        setAddressData({
          zipCode: data.zonecode,
          address: addr + extraAddr,
          detailAddress: addressData.detailAddress // 상세주소는 유지
        });
      },
      width: '100%',
      height: '100%'
    }).open();
  };

  // 비밀번호 확인
  const handleVerifyPassword = () => {
    if (!passwordVerification.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    // TODO: API 호출로 비밀번호 확인
    // 예: const isValid = await verifyPassword(passwordVerification);
    // 임시로 항상 성공으로 처리 (실제로는 API에서 확인)
    const isValid = true; // 실제로는 API 응답으로 확인

    if (isValid) {
      setIsPasswordVerified(true);
      setPasswordVerification('');
      alert('비밀번호가 확인되었습니다.');
    } else {
      alert('비밀번호가 일치하지 않습니다.');
      setPasswordVerification('');
    }
  };

  // 모든 변경사항을 한 번에 저장
  const handleSaveAll = () => {
    if (!isPasswordVerified) {
      alert('비밀번호 확인이 필요합니다.');
      return;
    }

    const errors = [];

    // 개인정보 저장
    if (!editUserInfo.name.trim() || !editUserInfo.phone.trim()) {
      errors.push('이름과 전화번호를 입력해주세요.');
    }

    // 에러가 있으면 표시
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    // TODO: API 호출로 교체
    // await updateUserInfo({ ...editUserInfo, address: addressData });
    // await updateAddress(addressData);

    setUserInfo({ ...editUserInfo });
    alert('변경사항이 저장되었습니다.');
    navigate('/mypage');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };




  const handleEditInfoChange = (e) => {
    setEditUserInfo({
      ...editUserInfo,
      [e.target.name]: e.target.value
    });
  };


  return (
    <div className="edit-profile-page">
      <div className="edit-profile-container">
        {/* 개인정보 섹션 */}
        <div className="info-section">
          <div className="info-header">
            <h2 className="section-title">개인정보</h2>
          </div>
          
          {/* 비밀번호 확인 */}
          {!isPasswordVerified && (
            <div className="password-verify-section">
              <div className="form-group">
                <label className="form-label">비밀번호 확인</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordVerification}
                    onChange={(e) => setPasswordVerification(e.target.value)}
                    className="form-input password-input"
                    placeholder="비밀번호를 입력하세요"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleVerifyPassword();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
              <button
                type="button"
                className="btn-verify-password"
                onClick={handleVerifyPassword}
              >
                확인
              </button>
            </div>
          )}

          {isPasswordVerified && (
            <div className="info-edit-form">
              <div className="form-group">
                <label className="form-label">성명</label>
                <input
                  type="text"
                  name="name"
                  value={editUserInfo.name}
                  onChange={handleEditInfoChange}
                  className="form-input"
                  placeholder="이름을 입력하세요"
                  disabled={!isPasswordVerified}
                />
              </div>
              <div className="form-group">
                <label className="form-label">연락처</label>
                <input
                  type="tel"
                  name="phone"
                  value={editUserInfo.phone}
                  onChange={handleEditInfoChange}
                  className="form-input"
                  placeholder="전화번호를 입력하세요"
                  disabled={!isPasswordVerified}
                />
              </div>
              <div className="form-group">
                <label className="form-label">아이디(이메일)</label>
                <input
                  type="email"
                  name="email"
                  value={editUserInfo.email}
                  readOnly
                  className="form-input"
                  disabled={!isPasswordVerified}
                />
              </div>
              <div className="form-group">
                <label className="form-label">주소</label>
                <div className="address-inputs">
                  <div className="zipcode-group">
                    <input
                      type="text"
                      name="zipCode"
                      value={addressData.zipCode}
                      className="form-input zipcode-input"
                      placeholder="우편번호"
                      readOnly
                      disabled={!isPasswordVerified}
                    />
                    <button
                      type="button"
                      className="btn-zipcode"
                      onClick={handleSearchZipCode}
                      disabled={!isPasswordVerified}
                    >
                      우편번호 검색
                    </button>
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={addressData.address}
                    className="form-input"
                    placeholder="주소"
                    readOnly
                    disabled={!isPasswordVerified}
                  />
                  <input
                    type="text"
                    name="detailAddress"
                    value={addressData.detailAddress}
                    onChange={handleAddressChange}
                    className="form-input"
                    placeholder="상세주소"
                    disabled={!isPasswordVerified}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 저장 버튼 */}
        {isPasswordVerified && (
          <div className="save-all-section">
            <button
              type="button"
              className="btn-save-all"
              onClick={handleSaveAll}
            >
              저장
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditProfile;

