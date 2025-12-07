# 단성사 쇼핑몰 프로젝트 UML 다이어그램

프레젠테이션용 UML 다이어그램 모음

## 1. ERD (Entity Relationship Diagram)

### 데이터베이스 구조

```mermaid
erDiagram
    USER ||--o{ PRODUCTPOST : "판매"
    USER ||--o{ CART : "담기"
    USER ||--o{ WISHLIST : "찜하기"
    USER ||--o{ ORDER : "주문"
    USER ||--o{ REVIEW : "리뷰작성"
    USER ||--o{ REFUND : "환불신청"
    
    CATEGORY ||--o{ PRODUCTPOST : "분류"
    
    PRODUCTPOST ||--o{ PRODUCT : "포함"
    PRODUCTPOST ||--o{ PRODUCTIMAGE : "이미지"
    PRODUCTPOST ||--o{ WISHLIST : "찜됨"
    PRODUCTPOST ||--o{ REVIEW : "리뷰받음"
    
    PRODUCT ||--o{ CART : "담김"
    PRODUCT ||--o{ ORDERITEM : "주문됨"
    
    ORDER ||--|| PAYMENT : "결제"
    ORDER ||--o{ ORDERITEM : "포함"
    
    ORDERITEM ||--o| REVIEW : "리뷰작성"
    ORDERITEM ||--o{ REFUND : "환불"
    
    REVIEW ||--o{ REVIEWIMAGE : "이미지"
    
    USER {
        int USERID_SEQ PK
        string EMAIL
        string PASSWORD
        string NAME
        string PHONE
        int ISSELLER
        string BN_NO
        string BRAND
        timestamp CREATEDAT
        timestamp UPDATEDAT
    }
    
    CATEGORY {
        int CATEGORYID_SEQ PK
        string MAIN_CATEGORY
        string MID_CATEGORY
        string SUB_CATEGORY
        string CATEGORYNAME
        string IMAGE_URL
    }
    
    PRODUCTPOST {
        int POSTID_SEQ PK
        int USERID_SEQ FK
        int CATEGORYID_SEQ FK
        string POSTNAME
        string DESCRIPTION
        string BRAND
        string MATERIAL
        int VIEWCOUNT
        int WISHCOUNT
        int STATUS
        string GENDER
        string SEASON
        timestamp CREATEDAT
        timestamp UPDATEDAT
    }
    
    PRODUCT {
        int PRODUCTID_SEQ PK
        int POSTID_SEQ FK
        string COLOR
        string PRODUCTSIZE
        int PRICE
        int DISCOUNTPRICE
        int STOCK
        int STATUS
        timestamp CREATEDAT
        timestamp UPDATEDAT
    }
    
    PRODUCTIMAGE {
        int IMAGEID_SEQ PK
        int POSTID_SEQ FK
        string IMAGEURL
        int ISMAIN
        string IMAGETYPE
        string LINK
    }
    
    CART {
        int CARTID_SEQ PK
        int USERID_SEQ FK
        int PRODUCTID_SEQ FK
        int QUANTITY
        timestamp CREATEDAT
    }
    
    WISHLIST {
        int WISHLISTID_SEQ PK
        int USERID_SEQ FK
        int POSTID_SEQ FK
        timestamp CREATEDAT
    }
    
    ORDER {
        int ORDERID_SEQ PK
        int USERID_SEQ FK
        string OD_NO
        int TOTALPRICE
        int DISCOUNTAMOUNT
        int DV_FEE
        int FINALPRICE
        string OD_STATUS
        string RECIPIENTNAME
        string RECIPIENTPHONE
        string ADDR
        timestamp CREATEDAT
        timestamp UPDATEDAT
    }
    
    ORDERITEM {
        int ORDERITEMID_SEQ PK
        int ORDERID_SEQ FK
        int PRODUCTID_SEQ FK
        int POSTID_SEQ FK
        int USERID_SEQ FK
        string POSTNAME
        string COLOR
        string PRODUCTSIZE
        int QUANTITY
        int PRICE
        string STATUS
        timestamp CREATEDAT
    }
    
    PAYMENT {
        int PAYMENTID PK
        int ORDERID FK
        string PAYMENTMETHOD
        int AMOUNT
        string STATUS
        string TRANSACTIONID
        timestamp PAIDAT
    }
    
    REVIEW {
        int REVIEWID_SEQ PK
        int POSTID_SEQ FK
        int PRODUCTID_SEQ FK
        int USERID_SEQ FK
        int ORDERITEMID_SEQ FK
        int RATING
        string CONTENT
        string SELLERREPLY
        timestamp CREATEDAT
        timestamp UPDATEDAT
    }
    
    REVIEWIMAGE {
        int REVIEWIMAGEID_SEQ PK
        int REVIEWID_SEQ FK
        string IMAGEURL
        timestamp CREATEDAT
    }
    
    REFUND {
        int REFUNDID_SEQ PK
        int ORDERITEMID_SEQ FK
        int USERID_SEQ FK
        string REFUNDTYPE
        string REASON
        string REASONDETAIL
        int REFUNDAMOUNT
        string STATUS
        timestamp CREATEDAT
        timestamp UPDATEDAT
    }
```

## 2. 시스템 아키텍처 다이어그램

### 전체 시스템 구조

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React + Vite]
        A1[Home]
        A2[ProductList]
        A3[ProductDetail]
        A4[Cart]
        A5[Order]
        A6[Payment]
        A7[MyPage]
        A8[Login/Signup]
        A --> A1
        A --> A2
        A --> A3
        A --> A4
        A --> A5
        A --> A6
        A --> A7
        A --> A8
    end
    
    subgraph "Backend Layer - Spring Boot"
        B[Spring Boot Application]
        B1[Controller Layer]
        B2[Service Layer]
        B3[DAO Layer]
        B4[Repository Layer]
        B5[Entity Layer]
        
        B --> B1
        B1 --> B2
        B2 --> B3
        B3 --> B4
        B4 --> B5
        
        B1 --> B1a[UserController]
        B1 --> B1b[ProductPostController]
        B1 --> B1c[CartController]
        B1 --> B1d[OrderController]
        B1 --> B1e[PaymentController]
        B1 --> B1f[ReviewController]
        B1 --> B1g[WishlistController]
        B1 --> B1h[AuthController]
    end
    
    subgraph "Database"
        C[(Oracle Database)]
        C1[(User Table)]
        C2[(ProductPost Table)]
        C3[(Product Table)]
        C4[(Order Table)]
        C5[(Payment Table)]
        C --> C1
        C --> C2
        C --> C3
        C --> C4
        C --> C5
    end
    
    subgraph "External Services"
        D1[AWS S3<br/>이미지 저장]
        D2[Toss Payments<br/>결제 API]
        D3[Email Service<br/>이메일 인증]
    end
    
    A -->|HTTP/REST API| B1
    B4 -->|JDBC/JPA| C
    B2 -->|Image Upload| D1
    B1e -->|Payment API| D2
    B1h -->|Email API| D3
    
    style A fill:#61dafb
    style B fill:#6db33f
    style C fill:#f80000
    style D1 fill:#ff9900
    style D2 fill:#0052e4
    style D3 fill:#34a853
```

## 3. 레이어별 아키텍처

### 백엔드 레이어 구조

```mermaid
graph LR
    subgraph "Presentation Layer"
        A[Controller]
        A1[UserController]
        A2[ProductPostController]
        A3[CartController]
        A4[OrderController]
        A --> A1
        A --> A2
        A --> A3
        A --> A4
    end
    
    subgraph "Business Logic Layer"
        B[Service]
        B1[UserService]
        B2[ProductPostService]
        B3[CartService]
        B4[OrderService]
        B --> B1
        B --> B2
        B --> B3
        B --> B4
    end
    
    subgraph "Data Access Layer"
        C[DAO]
        C1[UserDAO]
        C2[ProductPostDAO]
        C3[CartDAO]
        C4[OrderDAO]
        C --> C1
        C --> C2
        C --> C3
        C --> C4
    end
    
    subgraph "Repository Layer"
        D[Repository]
        D1[UserRepository]
        D2[ProductPostRepository]
        D3[CartRepository]
        D4[OrderRepository]
        D --> D1
        D --> D2
        D --> D3
        D --> D4
    end
    
    subgraph "Entity Layer"
        E[Entity]
        E1[User]
        E2[ProductPost]
        E3[Cart]
        E4[Order]
        E --> E1
        E --> E2
        E --> E3
        E --> E4
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    
    style A fill:#e1f5ff
    style B fill:#fff4e1
    style C fill:#e8f5e9
    style D fill:#f3e5f5
    style E fill:#fce4ec
```

## 4. 주요 기능 시퀀스 다이어그램

### 주문 및 결제 흐름

```mermaid
sequenceDiagram
    participant User as 사용자
    participant Frontend as React Frontend
    participant CartController as CartController
    participant OrderController as OrderController
    participant PaymentController as PaymentController
    participant OrderService as OrderService
    participant PaymentService as PaymentService
    participant TossAPI as Toss Payments
    participant DB as Oracle DB
    
    User->>Frontend: 장바구니에서 주문하기
    Frontend->>CartController: GET /api/cart
    CartController->>DB: 장바구니 조회
    DB-->>CartController: 장바구니 데이터
    CartController-->>Frontend: 장바구니 목록
    
    User->>Frontend: 주문 정보 입력
    Frontend->>OrderController: POST /api/orders
    OrderController->>OrderService: createOrder()
    OrderService->>DB: 주문 생성
    DB-->>OrderService: Order 생성 완료
    OrderService-->>OrderController: Order 정보
    OrderController-->>Frontend: 주문번호 반환
    
    User->>Frontend: 결제하기
    Frontend->>PaymentController: POST /api/payments/confirm
    PaymentController->>PaymentService: confirmPayment()
    PaymentService->>TossAPI: 결제 승인 요청
    TossAPI-->>PaymentService: 결제 승인 완료
    PaymentService->>DB: Payment 저장
    PaymentService->>DB: Order 상태 업데이트
    DB-->>PaymentService: 저장 완료
    PaymentService-->>PaymentController: 결제 완료
    PaymentController-->>Frontend: 결제 성공 응답
    Frontend-->>User: 주문 완료 안내
```

### 상품 등록 흐름

```mermaid
sequenceDiagram
    participant Seller as 판매자
    participant Frontend as React Frontend
    participant ProductPostController as ProductPostController
    participant ProductPostService as ProductPostService
    participant ImageService as ImageService
    participant S3 as AWS S3
    participant DB as Oracle DB
    
    Seller->>Frontend: 상품 등록 폼 작성
    Frontend->>ProductPostController: POST /productposts
    ProductPostController->>ProductPostService: createProductPost()
    
    alt 이미지 파일이 있는 경우
        ProductPostService->>ImageService: uploadImages()
        ImageService->>S3: 이미지 업로드
        S3-->>ImageService: 이미지 URL
        ImageService-->>ProductPostService: 이미지 URL 목록
    end
    
    ProductPostService->>DB: ProductPost 저장
    ProductPostService->>DB: Product 저장 (여러 개)
    ProductPostService->>DB: ProductImage 저장
    DB-->>ProductPostService: 저장 완료
    ProductPostService-->>ProductPostController: 등록 완료
    ProductPostController-->>Frontend: 상품 등록 성공
    Frontend-->>Seller: 등록 완료 안내
```

## 5. 클래스 다이어그램 (주요 엔티티)

### 핵심 엔티티 관계

```mermaid
classDiagram
    class User {
        +int userId
        +String email
        +String password
        +String name
        +int isSeller
        +String brand
        +register()
        +login()
    }
    
    class ProductPost {
        +int postId
        +String postName
        +String description
        +String brand
        +int viewCount
        +int wishCount
        +int status
        +create()
        +update()
    }
    
    class Product {
        +int productId
        +String color
        +String productSize
        +int price
        +int stock
        +int status
    }
    
    class Order {
        +int orderId
        +String orderNumber
        +int totalPrice
        +int finalPrice
        +String orderStatus
        +create()
        +updateStatus()
    }
    
    class OrderItem {
        +int orderItemId
        +int quantity
        +int price
        +String status
    }
    
    class Payment {
        +int paymentId
        +String paymentMethod
        +int amount
        +String status
        +String transactionId
    }
    
    class Review {
        +int reviewId
        +int rating
        +String content
        +String sellerReply
        +create()
        +update()
    }
    
    User "1" --> "*" ProductPost : 판매
    User "1" --> "*" Order : 주문
    User "1" --> "*" Review : 작성
    ProductPost "1" --> "*" Product : 포함
    Order "1" --> "*" OrderItem : 포함
    Order "1" --> "1" Payment : 결제
    OrderItem "1" --> "0..1" Review : 리뷰
```

## 6. 사용 기술 스택

### 기술 아키텍처

```mermaid
graph TB
    subgraph "Frontend"
        F1[React 18]
        F2[Vite]
        F3[Axios]
        F4[React Router]
        F5[CSS Modules]
    end
    
    subgraph "Backend"
        B1[Spring Boot 3.x]
        B2[Spring Data JPA]
        B3[Spring Security]
        B4[Oracle JDBC]
        B5[BCrypt]
        B6[Session Management]
    end
    
    subgraph "Database"
        D1[Oracle Database]
    end
    
    subgraph "Infrastructure"
        I1[AWS S3]
        I2[Toss Payments API]
        I3[Email Service]
    end
    
    subgraph "Deployment"
        DEP1[Vercel<br/>Frontend]
        DEP2[Oracle Cloud<br/>Backend/DB]
    end
    
    F1 --> F2
    F1 --> F3
    F1 --> F4
    F1 --> F5
    
    B1 --> B2
    B1 --> B3
    B1 --> B4
    B1 --> B5
    B1 --> B6
    
    B2 --> D1
    B1 --> I1
    B1 --> I2
    B1 --> I3
    
    F3 --> B1
    F1 --> DEP1
    B1 --> DEP2
    D1 --> DEP2
    
    style F1 fill:#61dafb
    style B1 fill:#6db33f
    style D1 fill:#f80000
    style I1 fill:#ff9900
    style I2 fill:#0052e4
```

## 7. 데이터 흐름도

### 주요 비즈니스 프로세스

```mermaid
flowchart TD
    Start([시작]) --> A{사용자 타입}
    A -->|일반 사용자| B[상품 조회]
    A -->|판매자| C[상품 등록]
    
    B --> D[장바구니 담기]
    D --> E[주문하기]
    E --> F[결제하기]
    F --> G{결제 성공?}
    G -->|Yes| H[주문 완료]
    G -->|No| I[결제 실패]
    H --> J[배송 대기]
    J --> K[배송 완료]
    K --> L[리뷰 작성]
    
    C --> M[상품 정보 입력]
    M --> N[이미지 업로드]
    N --> O[상품 등록 완료]
    O --> P[주문 수신]
    P --> Q[배송 처리]
    
    L --> End([종료])
    Q --> End
    I --> End
```

## 사용 방법

### Mermaid 다이어그램 렌더링

1. **GitHub/GitLab**: `.md` 파일을 업로드하면 자동으로 렌더링됩니다.
2. **VS Code**: Mermaid 확장 프로그램 설치 후 미리보기 가능
3. **온라인 에디터**: [Mermaid Live Editor](https://mermaid.live/)에 코드 복사해서 사용
4. **PowerPoint/발표자료**: 
   - Mermaid Live Editor에서 SVG/PNG로 내보내기
   - 또는 [diagrams.net](https://app.diagrams.net/)에서 직접 그리기

### 추천 프레젠테이션 구성

1. **시스템 아키텍처** (2번 다이어그램) - 전체 구조 소개
2. **ERD** (1번 다이어그램) - 데이터베이스 설계 설명
3. **주요 기능 시퀀스** (4번 다이어그램) - 핵심 기능 흐름 설명
4. **기술 스택** (6번 다이어그램) - 사용 기술 소개

각 다이어그램은 필요에 따라 편집하여 사용하세요!

