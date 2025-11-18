-- 테스트 사용자 데이터 삽입
-- LoginForm.jsx에서 사용하는 seller@dansungsa.com 계정과 일치하도록 설정

-- 시퀀스가 이미 생성되어 있다고 가정
-- 만약 시퀀스가 없다면: CREATE SEQUENCE SEQ_USER_USERID START WITH 1 INCREMENT BY 1;

-- 판매자 계정 (userId = 1)
INSERT INTO "USER" (
    USERID,
    EMAIL,
    PASSWORD,
    NAME,
    PHONE,
    ADDRESS,
    ISSELLER,
    BUSINESSNUMBER,
    CREATEDAT,
    UPDATEDAT
) VALUES (
    SEQ_USER_USERID.NEXTVAL,
    'seller@dansungsa.com',
    'password123',  -- 실제로는 해시된 비밀번호를 사용해야 하지만, 테스트용으로 평문 사용
    '단성사 판매자',
    '010-1234-5678',
    '서울특별시 종로구 종로 123',
    1,  -- 판매자 (1: 사업자)
    '123-45-67890',
    SYSTIMESTAMP,
    SYSTIMESTAMP
);

-- 일반 회원 계정 (선택사항)
INSERT INTO "USER" (
    USERID,
    EMAIL,
    PASSWORD,
    NAME,
    PHONE,
    ADDRESS,
    ISSELLER,
    CREATEDAT,
    UPDATEDAT
) VALUES (
    SEQ_USER_USERID.NEXTVAL,
    'user@dansungsa.com',
    'password123',
    '일반 회원',
    '010-9876-5432',
    '서울특별시 강남구 테헤란로 456',
    0,  -- 일반 회원 (0: 일반)
    SYSTIMESTAMP,
    SYSTIMESTAMP
);

-- 확인용 쿼리
SELECT USERID, EMAIL, NAME, ISSELLER, BUSINESSNUMBER FROM "USER";

