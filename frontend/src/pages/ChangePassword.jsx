import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChangePassword.css';
import { fetchSessionUser, changePassword, setSession } from '../services/authService';

function ChangePassword() {
  const navigate = useNavigate();
  const [passwordVerification, setPasswordVerification] = useState('');
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  // 비밀번호 확인
  const handleVerifyPassword = async () => {
    if (!passwordVerification.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    try {
      // 세션에서 사용자 정보 가져오기
      const { item } = await fetchSessionUser();
      
      // 세션의 비밀번호와 입력한 비밀번호 비교
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

  // 비밀번호 입력 핸들러
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    
    // 상태 업데이트
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

  // 비밀번호 보기/숨기기 토글
  const togglePasswordVisibility = (field) => {
    if (field === 'verify') {
      setShowPassword(!showPassword);
    } else {
      setShowPasswords(prev => ({
        ...prev,
        [field]: !prev[field]
      }));
    }
  };

  // 비밀번호 유효성 검사
  const validatePassword = (password) => {
    // 최소 8자, 영문, 숫자 포함
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  };

  // 비밀번호 변경 처리
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!isPasswordVerified) {
      setPasswordError('비밀번호 확인이 필요합니다.');
      return;
    }

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
        // 판매자일 경우 판매자 대시보드로, 일반 회원일 경우 마이페이지로 이동
        if (result.item.isSeller === 1) {
          navigate('/sellerDashboard?tab=business');
        } else {
          navigate('/mypage');
        }
      } else {
        setPasswordError(result.message || '비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('비밀번호 변경 중 오류 발생:', error);
      setPasswordError(error.message || '비밀번호 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-container">
        {/* 비밀번호 변경 섹션 */}
        <div className="info-section">
          <div className="info-header">
            <h2 className="section-title">비밀번호 변경</h2>
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
                    onClick={() => togglePasswordVisibility('verify')}
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

          {/* 비밀번호 변경 폼 */}
          {isPasswordVerified && (
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
                    onClick={() => togglePasswordVisibility('new')}
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
                    onClick={() => togglePasswordVisibility('confirm')}
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

              {/* 저장 버튼 */}
              <div className="save-all-section">
                <button
                  type="submit"
                  className="btn-save-all"
                >
                  비밀번호 변경
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;

