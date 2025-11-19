const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// 아이디 찾기 API 호출
export const findId = async (name, phone) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/find-id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ name: name.trim(), phone: phone.trim() })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.rt === 'OK') {
      return {
        success: true,
        email: data.email
      };
    } else {
      return {
        success: false,
        message: data.message || '일치하는 회원 정보를 찾을 수 없습니다.'
      };
    }
  } catch (error) {
    console.error('아이디 찾기 API 호출 오류:', error);
    return {
      success: false,
      message: '아이디 찾기 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류')
    };
  }
};

// 비밀번호 찾기 API 호출
export const findPassword = async (name, email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/find-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ name: name.trim(), email: email.trim() })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.rt === 'OK') {
      return {
        success: true,
        email: data.email
      };
    } else {
      return {
        success: false,
        message: data.message || '일치하는 회원 정보를 찾을 수 없습니다.'
      };
    }
  } catch (error) {
    console.error('비밀번호 찾기 API 호출 오류:', error);
    return {
      success: false,
      message: '비밀번호 찾기 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류')
    };
  }
};

// 비밀번호 재설정 API 호출
export const resetPassword = async (email, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ email: email.trim(), password: newPassword })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.rt === 'OK') {
      return {
        success: true,
        message: data.message || '비밀번호가 재설정되었습니다.'
      };
    } else {
      return {
        success: false,
        message: data.message || '비밀번호 재설정에 실패했습니다.'
      };
    }
  } catch (error) {
    console.error('비밀번호 재설정 API 호출 오류:', error);
    return {
      success: false,
      message: '비밀번호 재설정 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류')
    };
  }
};
