import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditProfile.css';
import { fetchSessionUser, updateUserInfo, setSession, changePassword } from '../services/authService';

function EditSellerProfile() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    name: '',
    phone: '',
    email: '',
    businessName: '',
    businessNumber: ''
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
    email: '',
    businessName: '',
    businessNumber: ''
  });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  const [passwordError, setPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');

  // 사용자 정보 가져오기
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { item } = await fetchSessionUser();
        const defaultName = item.name || '';
        const defaultPhone = item.phone || '';
        const defaultEmail = item.email || '';
        const defaultBusinessName = item.brand || '';
        const defaultBusinessNumber = item.businessNumber || '';

        setUserInfo({
          name: defaultName,
          phone: defaultPhone,
          email: defaultEmail,
          businessName: defaultBusinessName,
          businessNumber: defaultBusinessNumber
        });
        setEditUserInfo({
          name: defaultName,
          phone: defaultPhone,
          email: defaultEmail,
          businessName: defaultBusinessName,
          businessNumber: defaultBusinessNumber
        });
        setAddressData({
          zipCode: item.zipcode || '',
          address: item.address || '',
          detailAddress: item.detailAddress || ''
        });
      } catch (error) {
        navigate('/login');
      }
    };

    loadUser();
  }, [navigate]);

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
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleSearchZipCode = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: function(data) {
        let addr = '';
        let extraAddr = '';

        if (data.userSelectedType === 'R') {
          addr = data.roadAddress;
        } else {
          addr = data.jibunAddress;
        }

        if(data.userSelectedType === 'R'){
          if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
            extraAddr += data.bname;
          }
          if(data.buildingName !== '' && data.apartment === 'Y'){
            extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
          }
          if(extraAddr !== ''){
            extraAddr = ' (' + extraAddr + ')';
          }
        }

        setAddressData({
          zipCode: data.zonecode,
          address: addr + extraAddr,
          detailAddress: addressData.detailAddress
        });
      },
      width: '100%',
      height: '100%'
    }).open();
  };

  // 비밀번호 확인
  const handleVerifyPassword = async () => {
    if (!passwordVerification.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    try {
      const { item } = await fetchSessionUser();
      
      if (item.password === passwordVerification) {
        setIsPasswordVerified(true);
        setPasswordVerification('');
        alert('비밀번호가 확인되었습니다.');
      } else {
        alert('비밀번호가 일치하지 않습니다.');
        setPasswordVerification('');
      }
    } catch (error) {
      console.error('비밀번호 확인 중 오류:', error);
      alert('비밀번호 확인 중 오류가 발생했습니다.');
      setPasswordVerification('');
    }
  };

  // 모든 변경사항을 한 번에 저장
  const handleSaveAll = async () => {
    if (!isPasswordVerified) {
      alert('비밀번호 확인이 필요합니다.');
      return;
    }

    // 입력 검사
    const errors = [];
    if (!editUserInfo.name || !editUserInfo.name.trim()) {
      errors.push('이름을 입력해주세요.');
    }
    if (!editUserInfo.phone || !editUserInfo.phone.trim()) {
      errors.push('전화번호를 입력해주세요.');
    }
    if (!editUserInfo.businessName || !editUserInfo.businessName.trim()) {
      errors.push('상호명을 입력해주세요.');
    }
    if (!editUserInfo.businessNumber || !editUserInfo.businessNumber.trim()) {
      errors.push('사업자번호를 입력해주세요.');
    }
    if (!addressData.zipCode || !addressData.zipCode.trim()) {
      errors.push('우편번호를 입력해주세요.');
    }
    if (!addressData.address || !addressData.address.trim()) {
      errors.push('주소를 입력해주세요.');
    }
    if (!addressData.detailAddress || !addressData.detailAddress.trim()) {
      errors.push('상세주소를 입력해주세요.');
    }

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    try {
      const { item } = await fetchSessionUser();
      const userId = item.userId;

      const updateData = {
        name: editUserInfo.name.trim(),
        phone: editUserInfo.phone.trim(),
        brand: editUserInfo.businessName.trim(),
        businessNumber: editUserInfo.businessNumber.trim(),
        zipcode: addressData.zipCode.trim(),
        address: addressData.address.trim(),
        detailAddress: addressData.detailAddress.trim()
      };

      const result = await updateUserInfo(userId, updateData);

      if (result.rt === 'OK' && result.item) {
        await setSession(result.item);
        setUserInfo({ ...editUserInfo });
        alert('변경사항이 저장되었습니다.');
        navigate('/sellerDashboard?tab=business');
      } else {
        alert(result.message || '회원정보 수정에 실패했습니다.');
      }
    } catch (error) {
      alert(error.message || '회원정보 수정 중 오류가 발생했습니다.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const togglePasswordVisibilityChange = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // 비밀번호 변경 입력 핸들러
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    
    setPasswordData(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      
      // 새 비밀번호 입력 시 실시간 유효성 검사
      if (name === 'newPassword') {
        if (!value) {
          setNewPasswordError('');
        } else if (value.length < 8) {
          setNewPasswordError('비밀번호는 8자 이상이어야 합니다.');
        } else if (!/[A-Za-z]/.test(value)) {
          setNewPasswordError('비밀번호에 영문을 포함해야 합니다.');
        } else if (!/\d/.test(value)) {
          setNewPasswordError('비밀번호에 숫자를 포함해야 합니다.');
        } else {
          setNewPasswordError('');
        }
        
        // 비밀번호 확인과 일치 여부도 체크
        if (updated.confirmPassword && value !== updated.confirmPassword) {
          setPasswordError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
        } else if (updated.confirmPassword && value === updated.confirmPassword) {
          setPasswordError('');
        } else {
          setPasswordError('');
        }
      }
      
      // 새 비밀번호 확인 입력 시 일치 여부만 체크
      if (name === 'confirmPassword') {
        if (updated.newPassword && value !== updated.newPassword) {
          setPasswordError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
        } else if (updated.newPassword && value === updated.newPassword) {
          setPasswordError('');
        } else {
          setPasswordError('');
        }
      }
      
      return updated;
    });
  };

  // 비밀번호 유효성 검사
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  };

  // 비밀번호 변경 처리
  const handleChangePassword = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!passwordData.newPassword) {
      setPasswordError('새 비밀번호를 입력해주세요.');
      return;
    }

    if (!validatePassword(passwordData.newPassword)) {
      setPasswordError('비밀번호는 8자 이상이며 영문과 숫자를 포함해야 합니다.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const { item } = await fetchSessionUser();
      const userId = item.userId;

      const result = await changePassword(userId, passwordData.newPassword);

      if (result.rt === 'OK') {
        await setSession(result.item);
        alert('비밀번호가 성공적으로 변경되었습니다.');
        setShowChangePassword(false);
        setPasswordData({ newPassword: '', confirmPassword: '' });
        setPasswordError('');
        setNewPasswordError('');
      } else {
        setPasswordError(result.message || '비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('비밀번호 변경 중 오류 발생:', error);
      setPasswordError(error.message || '비밀번호 변경 중 오류가 발생했습니다.');
    }
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
        {/* 사업자 정보 섹션 */}
        <div className="info-section">
          <div className="info-header">
            <h2 className="section-title">사업자 정보</h2>
          </div>
          
          {/* 비밀번호 확인 전: 비밀번호 확인 섹션만 표시 */}
          {!isPasswordVerified ? (
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
          ) : (
            /* 비밀번호 확인 후: 정보 수정 폼만 표시 */
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
                <label className="form-label">상호명</label>
                <input
                  type="text"
                  name="businessName"
                  value={editUserInfo.businessName}
                  onChange={handleEditInfoChange}
                  className="form-input"
                  placeholder="상호명을 입력하세요"
                  disabled={!isPasswordVerified}
                />
              </div>
              <div className="form-group">
                <label className="form-label">사업자번호</label>
                <input
                  type="text"
                  name="businessNumber"
                  value={editUserInfo.businessNumber}
                  onChange={handleEditInfoChange}
                  className="form-input"
                  placeholder="123-45-67890"
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
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowChangePassword(!showChangePassword)}
              style={{ marginLeft: '10px' }}
            >
              {showChangePassword ? '비밀번호 변경 취소' : '비밀번호 변경'}
            </button>
          </div>
        )}

        {/* 비밀번호 변경 섹션 */}
        {isPasswordVerified && showChangePassword && (
          <div className="info-section" style={{ marginTop: '30px' }}>
            <div className="info-header">
              <h2 className="section-title">비밀번호 변경</h2>
            </div>
            <form onSubmit={handleChangePassword} className="info-edit-form">
              <div className="form-group">
                <label className="form-label">새 비밀번호</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="form-input password-input"
                    placeholder="새 비밀번호를 입력하세요"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibilityChange('new')}
                  >
                    {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {newPasswordError ? (
                  <p style={{ fontSize: '12px', color: '#e74c3c', marginTop: '8px', marginLeft: '0' }}>
                    {newPasswordError}
                  </p>
                ) : (
                  <p style={{ fontSize: '12px', color: '#999', marginTop: '8px', marginLeft: '0' }}>
                    8자 이상, 영문과 숫자를 포함해야 합니다.
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">새 비밀번호 확인</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="form-input password-input"
                    placeholder="새 비밀번호를 다시 입력하세요"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibilityChange('confirm')}
                  >
                    {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {passwordError && (
                <p style={{ fontSize: '12px', color: '#e74c3c', marginTop: '8px', marginLeft: '0' }}>
                  {passwordError}
                </p>
              )}

              <div className="save-all-section">
                <button
                  type="submit"
                  className="btn-save-all"
                >
                  비밀번호 변경
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditSellerProfile;

