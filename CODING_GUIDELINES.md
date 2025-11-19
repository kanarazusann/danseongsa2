# CODING_GUIDELINES
- **프로젝트명**: 단성사 (웹쇼핑몰, 무신사같은사이트)
- **기술 스택**: Spring Boot, JPA, Oracle DB, React



## 📚 추가 참고사항

### 1. 기존 코드 활용
- **기존 코드를 적극 반영**하여 일관성 유지
- **비슷한 기능이 있다면 참고**하여 구현
- **새로운 기능이나 사용하지않았던 코드를 사용할시 상세하게 설명**

### 2. 테스트
- **기능 구현 후 순차적으로 다음 지시사항** 확인
- **에러 발생 시 즉시 수정**

### 3. 핵심 개발 원칙 (⚠️ 매우 중요)
- **기능을 하나하나 쪼개서 아주 간단하게 함수형식으로 구현**
- **필요할 때 함수를 불러와서 조합하여 사용**
- **입력 검증은 프론트엔드에서 처리** (백엔드는 검증 로직 포함하지 않음)
- **의존성을 최대한 낮추기** (각 Service는 단일 책임만 수행)

---

# 🎯 React 코딩 가이드라인

## 1️⃣ 프로젝트 구조 규칙

### 디렉토리 구조
```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── ComponentName.jsx
│   └── ComponentName.css
├── pages/              # 페이지 컴포넌트 (라우트에 연결되는 컴포넌트)
│   ├── PageName.jsx
│   └── PageName.css
├── hooks/              # 커스텀 훅 (필요시 생성)
├── utils/              # 유틸리티 함수 (필요시 생성)
├── services/           # API 호출 함수 (필요시 생성)
├── context/            # Context API (필요시 생성)
├── App.jsx
├── App.css
├── main.jsx
└── index.css
```

### 파일 네이밍 규칙
- **컴포넌트 파일**: PascalCase 사용 (예: `ProductCard.jsx`, `Header.jsx`)
- **CSS 파일**: 컴포넌트와 동일한 이름 사용 (예: `ProductCard.css`, `Header.css`)
- **유틸리티 파일**: camelCase 사용 (예: `formatPrice.js`, `validateEmail.js`)
- **상수 파일**: UPPER_SNAKE_CASE 사용 (예: `API_ENDPOINTS.js`)

---

## 2️⃣ 컴포넌트 작성 규칙

### 기본 구조
```jsx
// 1. import 문 (외부 라이브러리 → 내부 컴포넌트 → CSS 순서)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './ComponentName.css';

// 2. 컴포넌트 함수 정의
function ComponentName({ prop1, prop2 }) {
  // 3. Hooks (useState, useEffect 등)
  const [state, setState] = useState(initialValue);
  
  // 4. 이벤트 핸들러 함수
  const handleClick = () => {
    // 로직
  };
  
  // 5. useEffect 등 부수 효과
  useEffect(() => {
    // 로직
  }, [dependencies]);
  
  // 6. 렌더링
  return (
    <div className="component-name">
      {/* JSX */}
    </div>
  );
}

// 7. export
export default ComponentName;
```

### 컴포넌트 작성 원칙
- **함수형 컴포넌트만 사용** (클래스 컴포넌트 사용 금지)
- **컴포넌트는 하나의 파일에 하나만** 작성
- **컴포넌트 이름은 파일명과 동일**하게 작성
- **props는 구조 분해 할당**으로 받기
- **컴포넌트는 최대한 작고 단일 책임**을 가지도록 작성

### Props 규칙
- **필수 props는 구조 분해 할당 시 기본값 설정하지 않기**
- **선택적 props는 기본값 설정 또는 조건부 렌더링**
- **props 타입 검증 필요시 propTypes 사용 고려** (현재는 주석으로 명시)

---

## 3️⃣ 상태 관리 규칙

### useState 사용 규칙
- **상태는 최소한으로 유지** (불필요한 상태 생성 금지)
- **관련된 상태는 객체로 묶기** (예: `{ email, password }`)
- **상태 초기값은 명확하게 설정**

```jsx
// ✅ 좋은 예
const [formData, setFormData] = useState({
  email: '',
  password: '',
  name: ''
});

// ❌ 나쁜 예
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [name, setName] = useState('');
```

### useEffect 사용 규칙
- **의존성 배열을 항상 명시** (빈 배열 `[]`도 명시)
- **cleanup 함수 필요시 반드시 작성** (메모리 누수 방지)
- **의존성 배열에 실제 사용하는 값만 포함**

```jsx
// ✅ 좋은 예
useEffect(() => {
  const fetchData = async () => {
    // API 호출
  };
  fetchData();
  
  return () => {
    // cleanup
  };
}, [dependency]);

// ❌ 나쁜 예
useEffect(() => {
  // 의존성 배열 없음
});
```

---

## 4️⃣ 네이밍 규칙

### 변수 및 함수
- **변수명**: camelCase (예: `userName`, `productList`)
- **함수명**: camelCase, 동사로 시작 (예: `handleSubmit`, `fetchProductData`)
- **이벤트 핸들러**: `handle` 접두사 사용 (예: `handleClick`, `handleSubmit`)
- **Boolean 변수**: `is`, `has`, `should` 접두사 사용 (예: `isLoading`, `hasError`)

### 상수
- **상수**: UPPER_SNAKE_CASE (예: `API_BASE_URL`, `MAX_IMAGE_COUNT`)
- **컴포넌트 내부 상수**: 일반 변수처럼 camelCase 사용 가능

### CSS 클래스명
- **kebab-case 사용** (예: `product-card`, `header-top`)
- **BEM 방법론 권장** (필수는 아님, 일관성 유지)
- **컴포넌트명을 prefix로 사용** (예: `product-card`, `product-image`)

---

## 5️⃣ API 통신 규칙

### API 호출 구조
- **API 호출 함수는 별도 파일로 분리** (`services/` 디렉토리)
- **에러 처리는 반드시 포함**
- **로딩 상태 관리 필수**
- **async/await 사용 권장**

```jsx
// services/api.js 예시 구조
export const fetchProduct = async (productId) => {
  try {
    const response = await fetch(`/products?productId=${productId}`);
    if (!response.ok) throw new Error('상품 조회 실패');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

### API 호출 패턴
- **현재는 TODO 주석으로 표시** (백엔드 연동 전)
- **API 엔드포인트는 상수로 관리**
- **요청/응답 데이터 구조는 주석으로 명시**
- **GET 요청은 쿼리 파라미터 방식** 사용 (예: `?productId=123`, `?categoryName=신발 스니커즈`)

```jsx
// 단일 파라미터
export const fetchProduct = async (productId) => {
  const response = await fetch(`/products?productId=${productId}`);
  return await response.json();
};

// 여러 파라미터 (필터링/검색)
export const fetchProducts = async (filters) => {
  const params = new URLSearchParams();
  if (filters.categoryName) params.append('categoryName', filters.categoryName);
  if (filters.minPrice) params.append('minPrice', filters.minPrice);
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
  
  const response = await fetch(`/products?${params.toString()}`);
  return await response.json();
};

// POST/PUT/DELETE는 body에 데이터 포함
export const createProduct = async (productData) => {
  const response = await fetch('/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  });
  return await response.json();
};
```

---

## 6️⃣ 스타일링 규칙

### CSS 파일 관리
- **각 컴포넌트/페이지마다 별도 CSS 파일** 사용
- **CSS 파일명은 컴포넌트명과 동일**
- **전역 스타일은 `index.css`에만** 작성
- **공통 스타일은 `App.css`에** 작성

### CSS 클래스명 규칙
- **컴포넌트명을 prefix로 사용** (예: `.product-card`, `.product-image`)
- **의미 있는 클래스명 사용** (예: `.product-card` ✅, `.box1` ❌)
- **인라인 스타일 최소화** (필요시에만 사용)

### 반응형 디자인
- **모바일 우선 설계** 권장
- **미디어 쿼리 사용 시 일관된 breakpoint** 사용
- **주요 breakpoint**: 768px (태블릿), 1024px (데스크톱)

---

## 7️⃣ 에러 처리 규칙

### 에러 처리 패턴
- **try-catch로 에러 처리**
- **사용자에게 명확한 에러 메시지 표시**
- **콘솔 에러는 개발용으로만** 사용
- **API 에러는 적절한 폴백 UI 제공**

```jsx
// ✅ 좋은 예
try {
  const data = await fetchData();
  setProduct(data);
} catch (error) {
  console.error('Error:', error);
  setError('상품을 불러오는데 실패했습니다.');
  // 에러 UI 표시
}
```

### 유효성 검사 (⚠️ 중요)
- **폼 입력값은 반드시 프론트엔드에서 검증**
- **검증 실패 시 명확한 메시지 표시**
- **검증 함수는 재사용 가능하게 분리**
- **백엔드로 전송하기 전에 모든 입력값 검증 완료**

---

## 8️⃣ 주석 및 문서화 규칙

### 주석 작성 규칙 (⚠️ 중요)
- **모든 기능(함수, 컴포넌트)마다 어떤 일을 수행하는지 간단하게 주석 추가**
- **복잡한 로직은 주석으로 설명**
- **TODO 주석은 반드시 작성** (백엔드 연동 전)
- **함수의 목적과 파라미터 설명** (복잡한 경우)
- **한국어 주석 사용** (프로젝트 특성상)
- **이모티콘 사용하지 않음** (텍스트만 사용)

```jsx
// ✅ 좋은 예
// TODO: API 연동 필요
// DB: ProductPost + Product + ProductImage 조인
// SELECT pp.*, p.color, p.productSize, p.price
// FROM ProductPost pp
// LEFT JOIN Product p ON pp.postId = p.postId
// WHERE pp.postId = ? AND pp.status = 'SELLING'

// ❌ 나쁜 예
// API 호출
```

### 코드 설명
- **의도가 불분명한 코드는 주석 필수**
- **주석은 코드와 함께 업데이트** (주석과 코드 불일치 방지)

---

## 9️⃣ 코드 품질 규칙

### 코드 작성 원칙
- **DRY (Don't Repeat Yourself)**: 중복 코드 제거
- **KISS (Keep It Simple, Stupid)**: 단순하게 작성
- **YAGNI (You Aren't Gonna Need It)**: 필요 없는 기능 추가 금지
- **단일 책임 원칙**: 하나의 함수/컴포넌트는 하나의 일만

### 리팩토링 규칙
- **기능 동작 확인 후 리팩토링**
- **리팩토링 시 기존 동작 보장**
- **작은 단위로 리팩토링**

### 성능 최적화
- **불필요한 리렌더링 방지** (useMemo, useCallback 적절히 사용)
- **큰 리스트는 가상화 고려** (필요시)
- **이미지 최적화** (lazy loading 등)

---

## 🔟 라우팅 규칙

### React Router 사용
- **라우트 경로는 kebab-case** 사용 (예: `/product-detail`, `/find-id`)
- **파라미터는 쿼리 스트링 방식** 사용 (예: `/product?id=123`, `/products?categoryName=신발 스니커즈`)
- **라우트는 `App.jsx`에 중앙 관리**
- **쿼리 파라미터는 useSearchParams 훅** 사용하여 읽기

```jsx
// ✅ 좋은 예
import { useSearchParams } from 'react-router-dom';

function ProductDetail() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  
  // 네비게이션 시
  navigate(`/product?productId=${productId}`);
}

// ❌ 나쁜 예 (동적 라우트 사용)
// <Route path="/product/:id" element={<ProductDetail />} />
```

### 네비게이션
- **Link 컴포넌트 사용** (a 태그 대신)
- **프로그래밍 방식 네비게이션은 useNavigate** 사용
- **쿼리 파라미터는 URL에 직접 포함** (예: `navigate('/product?productId=123')`)
- **상태 전달은 location.state** 사용 (쿼리 파라미터와 함께 사용 가능)

---

## 1️⃣1️⃣ 인증 및 권한 관리

### 현재 상태
- **임시로 localStorage 사용** (나중에 실제 세션 관리로 교체 예정)
- **인증 상태는 Header 컴포넌트에서 관리**
- **로그인 필요 페이지는 인증 체크 후 리다이렉트**

### 권한 관리
- **일반 회원 vs 판매자 구분** (`isSeller` 플래그 사용)
- **권한별 다른 UI 표시**
- **권한 없는 페이지 접근 시 리다이렉트**

---

## 1️⃣2️⃣ 데이터베이스 연동 준비

### API 연동 전 준비사항
- **DB 스키마를 참고하여 데이터 구조 설계**
- **API 엔드포인트 명세 확인**
- **요청/응답 데이터 타입 정의**
- **에러 응답 처리 방법 확인**

### 임시 데이터
- **현재는 하드코딩된 임시 데이터 사용**
- **임시 데이터는 실제 DB 구조와 일치**하도록 작성
- **TODO 주석으로 API 연동 필요 부분 명시**

---

## 1️⃣3️⃣ Git 커밋 규칙

### 커밋 메시지 형식
```
[타입] 간단한 설명

상세 설명 (선택사항)
```

### 타입
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `style`: 코드 포맷팅, 세미콜론 누락 등
- `refactor`: 코드 리팩토링
- `docs`: 문서 수정
- `test`: 테스트 코드 추가/수정
- `chore`: 빌드 업무 수정, 패키지 매니저 설정 등

### 예시
```
feat: 상품 상세 페이지 구현

- 상품 정보 표시
- 이미지 갤러리 기능
- 장바구니 추가 기능
- TODO: API 연동 필요
```

---

## 1️⃣4️⃣ 코드 리뷰 체크리스트

### 구현 전 확인사항
- [ ] 기존 코드 스타일과 일관성 유지
- [ ] 비슷한 기능이 있는지 확인
- [ ] DB 스키마와 데이터 구조 일치 확인

### 구현 후 확인사항
- [ ] 에러 없이 동작하는지 확인
- [ ] 브라우저 콘솔 에러 확인
- [ ] 반응형 디자인 확인 (모바일/태블릿/데스크톱)
- [ ] 불필요한 console.log 제거
- [ ] TODO 주석 작성 (API 연동 필요 부분)
- [ ] 코드 중복 제거
- [ ] 의미 있는 변수/함수명 사용

---

## 1️⃣5️⃣ 금지 사항

### 절대 하지 말아야 할 것
- ❌ **클래스 컴포넌트 사용 금지**
- ❌ **var 사용 금지** (const, let만 사용)
- ❌ **인라인 스타일 남용 금지**
- ❌ **하드코딩된 값 남용** (매직 넘버/문자열)
- ❌ **console.log 남용** (디버깅 후 제거)
- ❌ **주석 처리된 코드 커밋 금지**
- ❌ **한글 변수명/함수명 사용 금지** (주석은 한글 가능)
- ❌ **비동기 함수 에러 처리 누락 금지**

---

## 1️⃣6️⃣ 예외 및 특수 케이스

### 예외 처리
- **위 규칙을 따를 수 없는 특수한 경우** 주석으로 이유 명시
- **새로운 패턴 도입 시** 상세한 설명 추가
- **기존 코드와 다른 스타일 사용 시** 반드시 이유 명시

---

# 🚀 Spring Boot 백엔드 코딩 가이드라인

## ⚠️ 중요 규칙
- **백엔드 작업 시 항상 `oracle_db_schema.sql` 파일을 참고하여 작업**
- **DB 스키마와 Entity, DTO 구조가 일치하도록 작성**
- **테이블명, 컬럼명은 SQL 파일과 정확히 일치** (대소문자 주의)
- **데이터 타입 매핑 확인**: NUMBER → int(Integer), VARCHAR2 → String, CLOB → String, TIMESTAMP → Timestamp

## 1️⃣ 프로젝트 구조 규칙

### 디렉토리 구조
```
src/main/java/com/example/backend/
├── BackendApplication.java      # 메인 애플리케이션 클래스
├── controller/                  # REST API 컨트롤러
│   └── ProductController.java
├── service/                     # 비즈니스 로직
│   └── ProductService.java
├── dao/                         # 데이터 접근 객체 (Repository 래퍼)
│   └── ProductDAO.java
├── repository/                  # JPA Repository 인터페이스
│   └── ProductRepository.java
├── entity/                      # JPA 엔티티 (DB 테이블 매핑)
│   └── Product.java
├── dto/                         # 데이터 전송 객체
│   └── ProductDTO.java
└── config/                      # 설정 클래스 (필요시)
    └── WebConfig.java
```

### 패키지 네이밍 규칙
- **패키지명**: 소문자, 단어 구분 없음 (예: `com.example.backend.controller`)
- **클래스명**: PascalCase (예: `ProductController`, `UserService`)
- **인터페이스명**: PascalCase, 명확한 이름 (예: `ProductRepository`)

---

## 2️⃣ 레이어별 작성 규칙

### Controller (컨트롤러)
- **역할**: HTTP 요청/응답 처리, 요청 검증
- **어노테이션**: `@RestController`, `@CrossOrigin`, `@RequestMapping` (선택)
- **의존성 주입**: `@Autowired` 필드 주입 사용

```java
@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/products")
    public Map<String, Object> getProducts(@RequestParam(required = false) int productId) {
        Map<String, Object> map = new HashMap<String, Object>();
        
        try {
            if (productId != null) {
                // 단일 상품 조회
                Product product = productService.findById(productId);
                if (product != null) {
                    map.put("rt", "OK");
                    map.put("item", product);
                } else {
                    map.put("rt", "FAIL");
                    map.put("message", "상품을 찾을 수 없습니다.");
                }
            } else {
                // 전체 상품 조회
                List<Product> products = productService.findAll();
                map.put("rt", "OK");
                map.put("items", products);
            }
        } catch (Exception e) {
            map.put("rt", "FAIL");
            map.put("message", "오류가 발생했습니다: " + e.getMessage());
        }
        
        return map;
    }
}
```

### Controller 작성 원칙
- **응답은 Map<String, Object> 형식** 사용 (`rt`, `item`/`items`, `message` 키 사용)
- **rt 값**: "OK" (성공), "FAIL" (실패)
- **에러 처리는 try-catch로 감싸기**
- **쿼리 파라미터는 @RequestParam** 사용 (프론트엔드와 일치)
- **필수 파라미터는 required = false로 설정 후 null 체크**

---

### Service (서비스)
- **역할**: 비즈니스 로직 처리, 트랜잭션 관리
- **어노테이션**: `@Service`
- **의존성 주입**: `@Autowired` 필드 주입 사용

```java
@Service
public class ProductService {

    @Autowired
    private ProductDAO productDAO;
    
    public Product findById(int productId) {
        return productDAO.findById(productId);
    }
    
    public List<Product> findAll() {
        return productDAO.findAll();
    }
    
    public Product save(Product product) {
        return productDAO.save(product);
    }
}
```

### Service 작성 원칙
- **비즈니스 로직만 포함** (데이터 접근은 DAO에 위임)
- **트랜잭션 처리는 @Transactional** 사용 (필요시)
- **예외는 상위로 전파** (Controller에서 처리)
- **기능을 하나하나 쪼개서 아주 간단하게 함수형식으로 구현**
- **필요할 때 함수를 불러와서 조합하여 사용**
- **의존성을 최대한 낮추기** (각 Service는 단일 책임만 수행)
- **입력 검증은 하지 않음** (프론트엔드에서 처리)

---

### DAO (데이터 접근 객체)
- **역할**: Repository 래핑, 복잡한 쿼리 처리
- **어노테이션**: `@Repository`
- **의존성 주입**: `@Autowired` 필드 주입 사용

```java
@Repository
public class ProductDAO {

    @Autowired
    private ProductRepository productRepository;
    
    public Product findById(int productId) {
        return productRepository.findById(productId).orElse(null);
    }
    
    public List<Product> findAll() {
        return productRepository.findAll();
    }
    
    public Product save(Product product) {
        return productRepository.save(product);
    }
}
```

### DAO 작성 원칙
- **Repository 메서드를 래핑**하여 사용
- **Optional 처리**: `.orElse(null)` 또는 `.orElseThrow()` 사용
- **복잡한 쿼리는 @Query** 사용 (Repository에 작성)

---

### Repository (JPA Repository)
- **역할**: 데이터베이스 접근 인터페이스
- **상속**: `JpaRepository<Entity, ID>` 상속

```java
public interface ProductPostRepository extends JpaRepository<ProductPost, Integer> {  // ⚠️ Long 대신 Integer 사용
    
    // 기본 메서드: findAll(), findById(), save(), delete() 등 자동 제공
    
    // 커스텀 쿼리 (필요시)
    @Query("SELECT pp FROM ProductPost pp WHERE pp.status = :status")
    List<ProductPost> findByStatus(@Param("status") String status);
    
    // 메서드명으로 쿼리 생성
    List<ProductPost> findByCategoryName(String categoryName);
}
```

### Repository 작성 원칙
- **기본 CRUD는 JpaRepository 메서드 활용**
- **커스텀 쿼리는 @Query** 사용
- **메서드명 규칙**: `findBy`, `countBy`, `deleteBy` 등

---

### Entity (엔티티)
- **역할**: 데이터베이스 테이블과 매핑
- **어노테이션**: `@Entity`, `@Table`, `@Id`, `@Column` 등
- **Lombok 사용**: `@Data`, `@AllArgsConstructor`, `@NoArgsConstructor`

```java
@Entity
@Table(name = "product")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "product_seq")
    @SequenceGenerator(name = "product_seq", sequenceName = "PRODUCT_SEQ", allocationSize = 1)
    @Column(name = "product_id")
    private int productId;  // ⚠️ Long 대신 int 사용
    
    @Column(name = "seller_id", nullable = false)
    private int sellerId;  // ⚠️ Long 대신 int 사용
    
    @Column(name = "category_id", nullable = false)
    private int categoryId;  // ⚠️ Long 대신 int 사용
    
    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;
    
    @Column(name = "price", nullable = false)
    private Integer price;
    
    @Column(name = "discount_price")
    private Integer discountPrice;
    
    @Column(name = "view_count", columnDefinition = "NUMBER DEFAULT 0")
    private Integer viewCount = 0;
    
    @Column(name = "status", length = 20)
    private String status; // SELLING, SOLD_OUT
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private Timestamp updatedAt;
}
```

### Entity 작성 원칙
- **테이블명은 @Table로 명시** (소문자, 언더스코어 사용)
- **컬럼명은 @Column으로 명시** (DB 컬럼명과 일치)
- **Primary Key는 @Id, @GeneratedValue** 사용
- **Oracle은 SEQUENCE 사용** (GenerationType.SEQUENCE)
- **nullable, length 등 제약조건 명시**
- **Timestamp는 @CreationTimestamp, @UpdateTimestamp** 사용

---

### DTO (데이터 전송 객체)
- **역할**: 계층 간 데이터 전송, Entity와 분리
- **Lombok 사용**: `@Data`

```java
@Data
public class ProductDTO {
    
    private int productId;  // ⚠️ Long 대신 int 사용
    private int sellerId;  // ⚠️ Long 대신 int 사용
    private int categoryId;  // ⚠️ Long 대신 int 사용
    private String productName;
    private Integer price;
    private Integer discountPrice;
    private Integer viewCount;
    private String status;
    
    // Entity로 변환
    public Product toEntity() {
        return new Product(
            productId, sellerId, categoryId, productName,
            price, discountPrice, viewCount, status, null, null
        );
    }
    
    // Entity에서 DTO로 변환
    public static ProductDTO fromEntity(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setProductId(product.getProductId());
        dto.setSellerId(product.getSellerId());
        dto.setCategoryId(product.getCategoryId());
        dto.setProductName(product.getProductName());
        dto.setPrice(product.getPrice());
        dto.setDiscountPrice(product.getDiscountPrice());
        dto.setViewCount(product.getViewCount());
        dto.setStatus(product.getStatus());
        return dto;
    }
}
```

### DTO 작성 원칙
- **Entity와 분리하여 사용**
- **toEntity(), fromEntity() 메서드 제공** (변환 로직)
- **필요한 필드만 포함**

---

## 3️⃣ API 엔드포인트 규칙

### URL 패턴
- **기본 경로**: `/{리소스명}` (예: `/products`, `/users`)
- **쿼리 파라미터 방식 사용** (프론트엔드와 일치)
  - 단일 조회: `/products?productId=123`
  - 필터링: `/products?categoryName=신발 스니커즈&minPrice=10000`
  - 검색: `/products?keyword=신발&minPrice=10000`

### HTTP 메서드
- **GET**: 조회 (SELECT)
- **POST**: 생성 (INSERT)
- **PUT**: 수정 (UPDATE)
- **DELETE**: 삭제 (DELETE)

### 응답 형식
```java
// 성공 응답
{
    "rt": "OK",
    "item": { ... },        // 단일 객체
    "items": [ ... ],       // 리스트
    "message": "성공 메시지" // 선택사항
}

// 실패 응답
{
    "rt": "FAIL",
    "message": "에러 메시지"
}
```

---

## 4️⃣ 네이밍 규칙

### 클래스명
- **Controller**: `{리소스명}Controller` (예: `ProductController`, `UserController`)
- **Service**: `{리소스명}Service` (예: `ProductService`, `UserService`)
- **DAO**: `{리소스명}DAO` (예: `ProductDAO`, `UserDAO`)
- **Repository**: `{리소스명}Repository` (예: `ProductRepository`, `UserRepository`)
- **Entity**: 단수형 (예: `Product`, `User`, `Order`)
- **DTO**: `{리소스명}DTO` (예: `ProductDTO`, `UserDTO`)

### 메서드명
- **조회**: `findById()`, `findAll()`, `findBy{조건}()`
- **생성**: `save()`, `create()`
- **수정**: `update()`, `modify()`
- **삭제**: `delete()`, `remove()`

### 변수명
- **camelCase 사용** (예: `productId`, `userName`, `orderList`)
- **Boolean 변수**: `is`, `has` 접두사 (예: `isSeller`, `hasDiscount`)

---

## 5️⃣ 의존성 주입 규칙

### 현재 방식: 필드 주입
```java
@Autowired
private ProductService productService;
```

### 주의사항
- **순환 참조 주의**
- **테스트 시 Mock 객체 주입 필요**
- **필드 주입은 현재 프로젝트 스타일 유지**

---

## 6️⃣ 트랜잭션 관리

### 트랜잭션이란?
**트랜잭션(Transaction)**은 여러 데이터베이스 작업을 하나의 작업 단위로 묶는 것입니다.
- **모두 성공**하면 → 커밋 (변경사항 저장)
- **하나라도 실패**하면 → 롤백 (모든 변경사항 취소)

### 실제 예시
```java
// 주문 생성 시 여러 작업이 필요
@Transactional
public Order createOrder(Order order) {
    // 1. 주문 저장
    Order savedOrder = orderDAO.save(order);
    
    // 2. 재고 차감
    productDAO.decreaseStock(order.getProductId(), order.getQuantity());
    
    // 3. 결제 처리
    paymentDAO.processPayment(order.getOrderId(), order.getTotalPrice());
    
    // 만약 3번에서 실패하면 → 1번, 2번도 모두 취소됨!
    return savedOrder;
}
```

### @Transactional 사용
```java
@Service
public class OrderService {
    
    @Autowired
    private OrderDAO orderDAO;
    
    @Transactional  // 이 메서드 안의 모든 DB 작업이 하나의 트랜잭션
    public Order createOrder(Order order) {
        // 여러 DB 작업이 하나의 트랜잭션으로 처리됨
        Order savedOrder = orderDAO.save(order);
        // 추가 작업...
        return savedOrder;
    }
    
    @Transactional(readOnly = true)  // 읽기 전용 (성능 최적화)
    public Order findById(int orderId) {
        return orderDAO.findById(orderId);
    }
}
```

### 트랜잭션 규칙
- **Service 레이어에 @Transactional** 적용
- **읽기 전용**: `@Transactional(readOnly = true)` (조회만 할 때 성능 향상)
- **롤백 조건**: 기본적으로 RuntimeException 발생 시 자동 롤백
- **필요한 경우에만 사용** (단순 조회는 불필요)

---

## 7️⃣ 예외 처리 규칙

### Controller에서 예외 처리
```java
@GetMapping("/products")
public Map<String, Object> getProducts(@RequestParam int productId) {
    Map<String, Object> map = new HashMap<String, Object>();
    
    try {
        Product product = productService.findById(productId);
        if (product != null) {
            map.put("rt", "OK");
            map.put("item", product);
        } else {
            map.put("rt", "FAIL");
            map.put("message", "상품을 찾을 수 없습니다.");
        }
    } catch (Exception e) {
        map.put("rt", "FAIL");
        map.put("message", "오류가 발생했습니다: " + e.getMessage());
        // 로깅
        e.printStackTrace();
    }
    
    return map;
}
```

### 예외 처리 원칙
- **Controller에서 try-catch로 처리**
- **사용자에게 명확한 에러 메시지 제공**
- **예외 로깅 필수** (e.printStackTrace() 또는 로거 사용)
- **민감한 정보는 에러 메시지에 포함하지 않기**

---

## 8️⃣ 쿼리 작성 규칙

### JPA 메서드명 쿼리
```java
// Repository에 메서드명으로 쿼리 생성
List<ProductPost> findByCategoryName(String categoryName);
List<ProductPost> findByStatus(String status);
```

### @Query 어노테이션
```java
@Query("SELECT pp FROM ProductPost pp WHERE pp.categoryName = :categoryName AND pp.status = :status")
List<ProductPost> findByCategoryAndStatus(@Param("categoryName") String categoryName, @Param("status") String status);

// 네이티브 쿼리 (복잡한 경우)
@Query(value = "SELECT * FROM product_post pp WHERE pp.category_name = :categoryName", nativeQuery = true)
List<ProductPost> findPostsByCategory(@Param("categoryName") String categoryName);
```

### 쿼리 작성 원칙
- **간단한 쿼리는 메서드명으로 생성**
- **복잡한 쿼리는 @Query 사용**
- **네이티브 쿼리는 최소화** (필요시에만)
- **파라미터는 @Param으로 명시**

---

## 9️⃣ Oracle DB 특화 규칙

### 시퀀스 사용
```java
@Id
@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "product_seq")
@SequenceGenerator(name = "product_seq", sequenceName = "PRODUCT_SEQ", allocationSize = 1)
private int productId;  // ⚠️ Long 대신 int 사용
```

### 데이터 타입 매핑
- **NUMBER → Integer (int)** ⚠️ **Long 사용 금지, 모든 숫자는 int 사용**
- **VARCHAR2 → String**
- **DATE, TIMESTAMP → Timestamp**
- **CHAR(1) → String** (Y/N 플래그)

### 숫자 타입 규칙
- **모든 숫자 타입은 int(Integer) 사용** (Long 사용 금지)
- **PK(기본키)도 int 사용** (예: `private int productId;`)
- **FK(외래키)도 int 사용** (예: `private int sellerId;`)
- **가격, 수량, 재고 등 모든 숫자 필드는 int 사용**

### 주의사항
- **Oracle은 대소문자 구분** (테이블명, 컬럼명 주의)
- **시퀀스는 allocationSize = 1** 권장
- **날짜는 @CreationTimestamp, @UpdateTimestamp** 사용

---

## 🔟 CORS 설정 규칙

### @CrossOrigin 사용
```java
@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ProductController {
    // ...
}
```

### CORS 규칙
- **개발 환경**: localhost 포트 허용
- **프로덕션**: 실제 도메인으로 변경 필요
- **전역 설정**: WebConfig에서 설정 가능 (필요시)

---

## 1️⃣1️⃣ Lombok 사용 규칙

### Entity에서 사용
```java
@Entity
@Table(name = "product")
@Data                    // getter, setter, toString, equals, hashCode
@AllArgsConstructor      // 모든 필드 생성자
@NoArgsConstructor       // 기본 생성자
public class Product {
    // ...
}
```

### DTO에서 사용
```java
@Data
public class ProductDTO {
    // getter, setter 자동 생성
}
```

### Lombok 규칙
- **Entity, DTO에서 @Data 사용**
- **필요시 @Builder, @Getter, @Setter** 개별 사용
- **@AllArgsConstructor, @NoArgsConstructor** Entity에 필수

---

## 1️⃣2️⃣ 주석 및 문서화 규칙

### 주석 작성 규칙 (⚠️ 중요)
- **모든 기능(메서드, 함수)마다 어떤 일을 수행하는지 간단하게 주석 추가**
- **복잡한 로직은 주석으로 설명**
- **메서드의 목적과 파라미터 설명** (복잡한 경우)
- **한국어 주석 사용** (프로젝트 특성상)
- **TODO 주석으로 향후 작업 명시**
- **이모티콘 사용하지 않음** (텍스트만 사용)

```java
// 유저 ID로 유저 정보 조회
public UserDTO getUserById(int userId) {
    User user = userDAO.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
    return convertToDTO(user);
}

// 모든 유저 목록 조회
public List<UserDTO> getAllUsers() {
    List<User> users = userDAO.findAll();
    return users.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
}

// 이메일 존재 여부 확인
public boolean emailExists(String email) {
    return userDAO.existsByEmail(email != null ? email.trim() : "");
}
```

```java
// TODO: 페이지네이션 추가 필요
// DB: ProductPost + Product + ProductImage 조인
// SELECT pp.*, p.color, p.productSize, p.price
// FROM product_post pp
// LEFT JOIN product p ON pp.post_id = p.post_id
// WHERE pp.post_id = ? AND pp.status = 'SELLING'
```

---

## 1️⃣3️⃣ 코드 품질 규칙

### 코드 작성 원칙
- **DRY (Don't Repeat Yourself)**: 중복 코드 제거
- **단일 책임 원칙**: 각 레이어는 하나의 책임만
- **의존성 역전**: 상위 레이어가 하위 레이어에 의존
- **의존성 최소화**: 각 Service는 최소한의 의존성만 가져야 함

### 기능 분리 원칙 (⚠️ 중요)
- **기능을 하나하나 쪼개서 아주 간단하게 함수형식으로 구현**
- **각 함수는 하나의 작은 작업만 수행**
- **필요할 때 함수를 불러와서 조합하여 사용**
- **복잡한 로직은 여러 작은 함수로 분리**

```java
// ✅ 좋은 예: 기능을 작은 함수로 분리
@Service
public class ProductPostService {
    
    @Autowired
    private ProductPostDAO productPostDAO;
    
    @Autowired
    private ProductService productService;  // 다른 Service 조합
    
    @Autowired
    private ProductImageService productImageService;  // 다른 Service 조합
    
    @Transactional
    public ProductPost createProductPost(ProductPostDTO dto, int sellerId, List<MultipartFile> imageFiles) {
        User seller = getUserById(sellerId);  // 작은 함수 호출
        ProductPost productPost = createProductPostEntity(dto, seller);  // 작은 함수 호출
        ProductPost savedPost = productPostDAO.save(productPost);
        
        productService.createProducts(savedPost, dto.getProducts());  // 다른 Service 함수 호출
        productImageService.saveProductImages(savedPost, imageFiles);  // 다른 Service 함수 호출
        
        return savedPost;
    }
    
    private User getUserById(int sellerId) {  // 작은 함수
        return userDAO.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("판매자를 찾을 수 없습니다."));
    }
    
    private ProductPost createProductPostEntity(ProductPostDTO dto, User seller) {  // 작은 함수
        ProductPost productPost = new ProductPost();
        productPost.setSeller(seller);
        productPost.setCategoryName(dto.getCategoryName());
        // ... 간단한 설정만
        return productPost;
    }
}

// ❌ 나쁜 예: 모든 로직이 하나의 큰 함수에
@Service
public class ProductPostService {
    @Transactional
    public ProductPost createProductPost(...) {
        // 100줄 이상의 복잡한 로직
        // 검증, 변환, 저장, 이미지 처리 등 모든 것이 섞여있음
    }
}
```

### 입력 검증 원칙 (⚠️ 중요)
- **입력 검증은 프론트엔드에서 처리**
- **백엔드 Service는 검증 로직을 포함하지 않음**
- **백엔드는 존재 여부 확인 등 최소한의 검증만 수행**

```java
// ✅ 좋은 예: 검증 없이 간단하게
@Service
public class UserService {
    @Transactional
    public User registerUser(UserDTO request) {
        // 검증 없이 바로 저장
        User user = new User();
        user.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        user.setPassword(request.getPassword());
        // ...
        return userDAO.save(user);
    }
    
    // 존재 여부 확인만 제공
    public boolean emailExists(String email) {
        return userDAO.existsByEmail(email != null ? email.trim() : "");
    }
}

// ❌ 나쁜 예: 백엔드에서 검증
@Service
public class UserService {
    @Transactional
    public User registerUser(UserDTO request) {
        // 백엔드에서 검증 (프론트엔드로 이동해야 함)
        if (!StringUtils.hasText(request.getEmail())) {
            throw new IllegalArgumentException("이메일을 입력해주세요.");
        }
        // ...
    }
}
```

### 의존성 최소화 원칙 (⚠️ 중요)
- **각 Service는 최소한의 의존성만 가져야 함**
- **기능별로 별도의 Service로 분리**
- **Service 간 의존성은 최소화**

```java
// ✅ 좋은 예: 기능별로 분리된 Service
@Service
public class ImageService {  // 이미지 저장만 담당
    public String saveImageFile(MultipartFile file) { ... }
}

@Service
public class ProductService {  // 상품 생성만 담당
    public List<Product> createProducts(...) { ... }
}

@Service
public class ProductImageService {  // 상품 이미지 저장만 담당
    @Autowired
    private ImageService imageService;  // 필요한 Service만 주입
    
    public List<ProductImage> saveProductImages(...) { ... }
}

@Service
public class ProductPostService {  // 게시물 생성만 담당
    @Autowired
    private ProductService productService;  // 필요한 Service만 주입
    @Autowired
    private ProductImageService productImageService;  // 필요한 Service만 주입
    
    public ProductPost createProductPost(...) {
        // 작은 함수들을 조합하여 사용
    }
}

// ❌ 나쁜 예: 모든 기능이 하나의 Service에
@Service
public class ProductPostService {
    @Autowired
    private ProductPostDAO productPostDAO;
    @Autowired
    private ProductDAO productDAO;
    @Autowired
    private ProductImageDAO productImageDAO;
    @Autowired
    private UserDAO userDAO;
    // 너무 많은 의존성...
}
```

### 리팩토링 규칙
- **기능 동작 확인 후 리팩토링**
- **작은 단위로 리팩토링**
- **기존 동작 보장**

---

## 1️⃣4️⃣ Git 커밋 규칙

### 커밋 메시지 형식
```
[타입] 간단한 설명

상세 설명 (선택사항)
```

### 타입
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `refactor`: 코드 리팩토링
- `docs`: 문서 수정
- `test`: 테스트 코드 추가/수정
- `chore`: 빌드 업무 수정, 설정 변경 등

### 예시
```
feat: 상품 조회 API 구현

- ProductController에 GET /products 엔드포인트 추가
- ProductService, ProductDAO, ProductRepository 구현
- 쿼리 파라미터로 productId 조회 지원
```

---

## 1️⃣5️⃣ 금지 사항

### 절대 하지 말아야 할 것
- ❌ **Entity를 직접 Controller에서 반환** (DTO 사용)
- ❌ **Service에서 예외를 삼키기** (상위로 전파)
- ❌ **하드코딩된 값 남용** (상수로 관리)
- ❌ **System.out.println 사용** (로거 사용)
- ❌ **트랜잭션 없이 여러 DB 작업 수행**
- ❌ **N+1 쿼리 문제 발생** (즉시 로딩, 페치 조인 사용)
- ❌ **SQL 인젝션 취약점** (파라미터 바인딩 사용)

---

## 1️⃣6️⃣ 코드 리뷰 체크리스트

### 구현 전 확인사항
- [ ] 기존 코드 스타일과 일관성 유지
- [ ] DB 스키마와 Entity 매핑 일치 확인
- [ ] 프론트엔드 API 요청 형식과 일치 확인

### 구현 후 확인사항
- [ ] API 엔드포인트 테스트 (Postman 등)
- [ ] 에러 처리 확인
- [ ] 쿼리 성능 확인 (N+1 문제 체크)
- [ ] 로깅 확인
- [ ] CORS 설정 확인
- [ ] 응답 형식 일관성 확인 (rt, item/items, message)

---

## 1️⃣7️⃣ 예외 및 특수 케이스

### 예외 처리
- **위 규칙을 따를 수 없는 특수한 경우** 주석으로 이유 명시
- **새로운 패턴 도입 시** 상세한 설명 추가
- **기존 코드와 다른 스타일 사용 시** 반드시 이유 명시

---

# 📊 Oracle DB 스키마

## 📌 주요 구조 설명

### 게시물과 상품의 관계
- **상품게시물(ProductPost)**: 하나의 게시물 (예: "나이키 에어맥스 신발")
- **상품(Product)**: 게시물에 속한 여러 상품 옵션 (사이즈, 색상별)
- **관계**: 게시물 1개 → 상품 여러개 (1:N)
- **예시**:
  - 게시물: "나이키 에어맥스 신발"
    - 상품1: 블랙, 250, 100000원
    - 상품2: 블랙, 260, 100000원
    - 상품3: 화이트, 250, 100000원

### 주요 변경사항
- 게시물과 상품을 분리하여 하나의 게시물에 여러 옵션(사이즈, 색상) 관리
- 카테고리 테이블 제거: `categoryName`을 상품게시물에 직접 포함
- 이미지는 게시물에 속함 (postId)
- 장바구니, 주문은 실제 상품(productId)을 선택
- 찜은 게시물(postId)을 선택 (게시물 단위 찜)

---

## 1️⃣ CREATE TABLE (모든 테이블 정의)


회원(User)
- userId (PK, int)  //회원고유id(seq) ⚠️ Long 대신 int 사용
- email (String, unique, not null) //로그인이메일
- password (String, not null)  //비밀번호
- name (String, not null)  // 이름
- phone (String)  // 전화번호
- isSeller (Boolean, default: false) // 사업자인지 일반회원인지 구분
- businessNumber (String, nullable) // 사업자등록번호 
- brand (String, nullable) // 상호명 (isSeller = 1 일 때 필수)
- zipcode (String) // 다음 주소검색 API 우편번호
- address (String) // 기본 주소
- detailAddress (String) // 상세 주소
- createdAt (Timestamp)  //회원가입날짜
- updatedAt (Timestamp)  //회원정보수정날짜

상품게시물(ProductPost)
- postId (PK, int)  //게시물고유id(seq) ⚠️ Long 대신 int 사용
- sellerId (FK -> User)  // user의 isSeller가 true인 회원과 join
- categoryName (String, not null) // 카테고리명 (예: "신발 스니커즈", "상의 맨투맨" - 중간에 띄어쓰기 넣어서 상세구분까지 표기)
- postName (String, not null) // 게시물명 (예: "나이키 에어맥스 신발")
- description (Text) // 상품 설명
- brand (String) // 브랜드 (예: "나이키", "아디다스", "퓨마" 등)
- material (String) // 주요소재 (예: "면", "폴리에스터", "나일론" 등)
- viewCount (Integer, default: 0)  //조회수
- wishCount (Integer, default: 0)  //찜수 (WISHLIST 테이블 트리거로 자동 업데이트)
- status (String) // SELLING, SOLD_OUT(게시물상태)
- gender (String) // 성별 (MEN, WOMEN, UNISEX)
- season (String) // 계절 (SPRING, SUMMER, FALL, WINTER, ALL_SEASON)
- createdAt (Timestamp)  // 게시물올린날짜
- updatedAt (Timestamp)  //게시물수정한날짜

상품(Product)
- productId (PK, int)  //상품고유id(seq) ⚠️ Long 대신 int 사용
- postId (FK -> ProductPost)  //게시물id(게시물 table과 join) - 하나의 게시물에 여러 상품
- color (String, not null) // 컬러 (black, white, navy, gray, red 등)
- productSize (String, not null) // 사이즈 (S, M, L, XL, FREE, 250, 260 등) ⚠️ Oracle 예약어 SIZE 대신 productSize 사용
- price (Integer, not null)  // 가격
- discountPrice (Integer, nullable)  // 할인된가격
- stock (Integer, default: 0)  // 재고수량
- status (String) // SELLING, SOLD_OUT(해당 옵션의 판매상태)
- createdAt (Timestamp)  // 상품등록날짜
- updatedAt (Timestamp)  //상품수정한날짜

상품이미지(ProductImage)
- imageId (PK, int)  // 이미지id(seq) ⚠️ Long 대신 int 사용
- postId (FK -> ProductPost)  //게시물id(게시물 table과 join) - 게시물에 속한 이미지
- imageUrl (String, not null)  //이미지경로
- isMain (Integer, default: 0) // 대표이미지 여부 (0: 일반, 1: 대표)
- imageType (String) // 이미지 타입 (GALLERY: 갤러리 이미지, DESCRIPTION: 상품 설명 이미지)
- createdAt (Timestamp)  // 이미지 만들어진 날짜

 장바구니(Cart)
- cartId (PK, int)  // 장바구니id(seq) ⚠️ Long 대신 int 사용
- userId (FK -> User)  // 유저id(user table과 join)
- productId (FK -> Product)  // 상품id (상품 table 과 join) - color, productSize 정보는 Product에서 조회
- quantity (Integer, not null)  // 해당상품수량
- createdAt (Timestamp)  // 장바구니에추가된날짜

 찜(Wishlist)
- wishlistId (PK, int)  // 찜id(seq) ⚠️ Long 대신 int 사용
- userId (FK -> User)  // 유저id (user table과 join)
- postId (FK -> ProductPost)  // 게시물id (게시물 table과 join)
- createdAt (Timestamp)  // 찜목록에추가된날짜
- 유니크 제약조건: (userId, postId) - 한 유저가 같은 게시물을 중복 찜할 수 없음

 주문(Order)
- orderId (PK, int) //주문id (seq) ⚠️ Long 대신 int 사용
- userId (FK -> User)  // userid(user테이블과 join)
- orderNumber (String, unique) // 주문번호 (예: ORD20250114-001)
- totalPrice (Integer, not null) // 상품 총액
- discountAmount (Integer, default: 0) //할인된 금액
- deliveryFee (Integer, default: 0) // 배송비
- finalPrice (Integer, not null) // 최종 결제금액
- orderStatus (String) //  CONFIRMED, PAID, DELIVERED, CANCELLED  주문상태
- recipientName (String, not null) // 받는 분 이름
- recipientPhone (String, not null) // 받는 분 전화번호
- zipcode (String) // 우편번호 (다음 주소검색 API 사용)
- address (String, not null) // 주소 (다음 주소검색 API에서 받은 기본 주소)
- detailAddress (String) // 상세 주소 (사용자가 직접 입력)
- deliveryMemo (String) // 배송 메모 (문 앞, 경비실 등)
- createdAt (Timestamp)  // 주문된 날짜
- updatedAt (Timestamp)  //주문이 수정된 날짜

 주문상세(OrderItem)
- orderItemId (PK, int)  // 주문상세id(seq) ⚠️ Long 대신 int 사용   <= 상품별
- orderId (FK -> Order)  // 주문id (order table과 join)
- productId (FK -> Product)  //상품id(상품 table과 join) - 실제 구매한 상품 옵션
- postId (FK -> ProductPost)  //게시물id(게시물 table과 join) - 주문 당시 게시물 정보
- sellerId (FK -> User) // 판매자  (user테이블과 join)
- postName (String) // 주문 당시 게시물명 (예: "나이키 에어맥스 신발")
- color (String) // 주문 당시 색상
- productSize (String) // 주문 당시 사이즈 ⚠️ Oracle 예약어 SIZE 대신 productSize 사용
- quantity (Integer, not null)  //수량
- price (Integer, not null) // 주문 당시 수량과 상품가격을 곱한 가격
- status (String) // CONFIRMED, CANCELLED, REFUNDED
- createdAt (Timestamp)  //주문된 날짜

 결제(Payment)
- paymentId (PK, int)  //결제고유id(seq) ⚠️ Long 대신 int 사용
- orderId (FK -> Order)  //order table과 join
- accountId (FK -> Account, nullable)  //계좌번호(계좌이체 결제용)
- paymentMethod (String) // CARD, ACCOUNT, TOSS
- amount (Integer, not null) //  결제금액
- status (String) // COMPLETED, FAILED, CANCELLED
- transactionId (String) // PG사 거래번호 (카드결제, 토스페이 등)
- paidAt (Timestamp) // 결제된 날짜

 계좌(Account)
- accountId (PK, int)  계좌고유id (seq) ⚠️ Long 대신 int 사용
- userId (FK -> User)  유저아이디 조인
- bankName (String, not null)  은행이름
- accountNumber (String, not null)  계좌번호
- accountHolder (String, not null)    통장에 적힌 이름 (결제계좌가 가족계좌일수도있기때문)
- balance (Integer, default: 0) // 잔액
- isDefault (Boolean, default: false)   true면 기본계좌로 설정
- createdAt (Timestamp)  //  계좌등록날짜

 리뷰(Review)
- reviewId (PK, int)  //리뷰고유id ⚠️ Long 대신 int 사용 
- postId (FK -> ProductPost)  //게시물id(게시물 table과 join) - 리뷰는 게시물 기준
- productId (FK -> Product, nullable)  //상품id(상품 table과 join, nullable) - 특정 옵션에 대한 리뷰인 경우
- userId (FK -> User)  유저아이디
- orderItemId (FK -> OrderItem) // 실구매자 검증용
- rating (Integer, not null) // 1~5점
- content (Text)  //리뷰텍스트
- createdAt (Timestamp)  //글쓴날짜
- updatedAt (Timestamp)  //수정한날짜

리뷰이미지(ReviewImage)
- reviewImageId (PK, int)  //리뷰이미지id(seq) ⚠️ Long 대신 int 사용
- reviewId (FK -> Review)  //리뷰id(리뷰 table과 join)
- imageUrl (String, not null)  //이미지경로
- createdAt (Timestamp)  // 이미지 업로드 날짜

 환불/교환(Refund)
- refundId (PK, int) 환불/교환 고유 id ⚠️ Long 대신 int 사용
- orderItemId (FK -> OrderItem)  주문상세id
- userId (FK -> User)  유저id
- refundType (String) // REFUND, EXCHANGE  환불이냐 교환이냐
- reason (String, not null)  이유 (아마 선택식)
- reasonDetail (Text)  이유를 텍스트로
- refundAmount (Integer)   환불하는 총가격
- accountId (FK -> Account, nullable) // 환불받을 계좌(계좌결제일경우만, null 가능)
- status (String) // 
고객: "사이즈 안맞아서 환불할게요" → REQUESTED
판매자: "확인했습니다. 환불 승인합니다" → APPROVED
고객 상품 반송 완료
판매자 확인 후 환불금 입금 → COMPLETED
- createdAt (Timestamp)  //환불/교환신청시간 


**그리고 모든 작업은 db를 참고꼭하기 그리고 커서 너가 이상하다고 생각이들면 꼭 나에게 정말할거냐 물어보고 하면 안되는 이유 알려줘 **