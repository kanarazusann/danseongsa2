const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const USER_STORAGE_KEY = 'dansungsa_user';

// API 응답 처리
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok || data.rt !== 'OK') {
    throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
  }
  return data;
};

// 로컬 스토리지에서 사용자 정보 가져오기
export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem(USER_STORAGE_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('로컬 스토리지에서 사용자 정보를 가져오는 중 오류:', error);
    return null;
  }
};

// 로컬 스토리지에 사용자 정보 저장하기
export const setStoredUser = (user) => {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('로컬 스토리지에 사용자 정보를 저장하는 중 오류:', error);
  }
};

// 로컬 스토리지에서 사용자 정보 제거하기
export const removeStoredUser = () => {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    console.error('로컬 스토리지에서 사용자 정보를 제거하는 중 오류:', error);
  }
};

// 회원가입 API 호출
export const registerUser = async (payload) => {
  try {
    console.log('회원가입 API 호출:', `${API_BASE_URL}/auth/signup`, payload);
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    console.log('회원가입 API 응답 상태:', response.status, response.statusText);
    const data = await response.json();
    console.log('회원가입 API 응답 데이터:', data);

    if (!response.ok || data.rt !== 'OK') {
      throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
    }
    return data;
  } catch (error) {
    console.error('회원가입 API 호출 오류:', error);
    throw error;
  }
};

// 이메일과 비밀번호 확인
export const verifyCredentials = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/api/users/verify-credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

// 세션 설정
export const setSession = async (userInfo) => {
  const response = await fetch(`${API_BASE_URL}/auth/set-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(userInfo)
  });

  return handleResponse(response);
};

// 로그인 처리 (이메일/비밀번호 확인 후 세션 설정)
export const login = async (payload) => {
  try {
    console.log('로그인 시작:', payload);
    // 이메일과 비밀번호 확인
    const verifyData = await verifyCredentials(payload);
    console.log('인증 확인 결과:', verifyData);
    
    if (verifyData.item) {
      // 인증 성공 시 세션 설정
      console.log('세션 설정 시작:', verifyData.item);
      const sessionResult = await setSession(verifyData.item);
      console.log('세션 설정 결과:', sessionResult);
      
      // 로컬 스토리지에 사용자 정보 저장
      setStoredUser(verifyData.item);
      console.log('로컬 스토리지 저장 완료');
      
      return {
        rt: 'OK',
        item: verifyData.item,
        message: '로그인이 완료되었습니다.'
      };
    } else {
      throw new Error('이메일 또는 비밀번호가 일치하지 않습니다.');
    }
  } catch (error) {
    console.error('로그인 처리 오류:', error);
    throw error;
  }
};

// 로그아웃 API 호출
export const logout = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  });

  // 로컬 스토리지에서 사용자 정보 제거
  removeStoredUser();
  
  return handleResponse(response);
};

// 이메일 존재 여부 확인
export const checkEmailExists = async (email) => {
  const response = await fetch(`${API_BASE_URL}/api/users/email/${encodeURIComponent(email)}/exists`, {
    method: 'GET',
    credentials: 'include'
  });

  const data = await response.json();
  if (data.rt === 'OK') {
    return data.exists;
  }
  return false;
};

// 세션 사용자 정보 가져오기 (로컬 스토리지에서 가져온 후 백엔드에서 존재 여부 확인)
export const fetchSessionUser = async () => {
  try {
    const storedUser = getStoredUser();
    console.log('로컬 스토리지에서 사용자 정보:', storedUser);
    
    if (!storedUser || !storedUser.userId) {
      console.log('로컬 스토리지에 사용자 정보 없음');
      throw new Error('로그인 정보가 없습니다.');
    }

    // 백엔드에서 유저 존재 여부 확인
    const response = await fetch(`${API_BASE_URL}/api/users/${storedUser.userId}/exists`, {
      method: 'GET',
      credentials: 'include'
    });

    const data = await response.json();
    console.log('유저 존재 여부 확인 결과:', data);
    
    if (data.rt === 'OK' && data.exists) {
      // 유저가 존재하면 로컬 스토리지의 정보 반환
      console.log('세션 사용자 정보 반환:', storedUser);
      return { item: storedUser };
    } else {
      // 유저가 존재하지 않으면 로컬 스토리지 제거
      console.log('유저가 존재하지 않음, 로컬 스토리지 제거');
      removeStoredUser();
      throw new Error('로그인 정보가 유효하지 않습니다.');
    }
  } catch (error) {
    console.error('세션 사용자 정보 가져오기 오류:', error);
    // 네트워크 오류 등으로 백엔드 확인 실패 시에도 로컬 스토리지 제거
    removeStoredUser();
    throw error;
  }
};

// 회원정보 수정 API 호출
export const updateUserInfo = async (userId, userInfo) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(userInfo)
    });

    const data = await response.json();

    if (!response.ok || data.rt !== 'OK') {
      throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
    }

    // 세션 업데이트 후 로컬 스토리지도 업데이트
    if (data.item) {
      setStoredUser(data.item);
      console.log('로컬 스토리지 업데이트 완료');
    }

    return data;
  } catch (error) {
    console.error('회원정보 수정 API 호출 오류:', error);
    throw error;
  }
};

// 비밀번호 변경 API 호출
export const changePassword = async (userId, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ newPassword })
    });

    const data = await response.json();

    if (!response.ok || data.rt !== 'OK') {
      throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
    }

    // 세션 업데이트 후 로컬 스토리지도 업데이트
    if (data.item) {
      setStoredUser(data.item);
    }

    return data;
  } catch (error) {
    console.error('비밀번호 변경 API 호출 오류:', error);
    throw error;
  }
};

// 회원 탈퇴 API 호출
export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/delete`, {
      method: 'POST',
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok || data.rt !== 'OK') {
      throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
    }

    // 로컬 스토리지에서 사용자 정보 제거
    removeStoredUser();

    return data;
  } catch (error) {
    console.error('회원 탈퇴 API 호출 오류:', error);
    throw error;
  }
};

