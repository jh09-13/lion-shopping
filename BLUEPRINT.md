# 쇼핑몰 청사진 (Blueprint)

순수 HTML + JS + CSS로 만드는 쇼핑몰. 관리자(admin) / 소비자(consumer) 두 역할을 기준으로
화면과 CRUD를 나누고, **co-location**(기능별로 html/css/js를 한 폴더에 묶는 방식)으로 구성한다.

> 이 문서는 설계 단계 산출물이다. 실제 폴더/파일은 아직 생성하지 않았고,
> 데이터 저장 방식(localStorage vs 백엔드 API)도 아직 미정이다.

## 설계 원칙

1. **역할별 분리** — `admin/`, `consumer/`로 최상위를 나눈다. 같은 "상품"이라도
   관리자는 CRUD 전체, 소비자는 조회(R) 위주로 권한이 다르므로 화면 자체를 분리한다.
2. **Co-location** — 폴더 하나가 화면(기능) 하나. 그 화면의 `index.html`, `*.css`, `*.js`가
   같은 폴더에 있다. 전역 `css/`, `js/` 폴더에 다 모아두는 방식은 쓰지 않는다.
3. **데이터 계층 분리** — 화면 코드는 localStorage나 fetch를 직접 호출하지 않고
   공통 서비스 모듈(`data.service.js`, `auth.service.js`)을 통해서만 데이터에 접근하도록 설계한다.
   백엔드가 정해지면 서비스 모듈 내부 구현만 바꾸면 되고, 화면 코드는 그대로 둔다.
4. **공통 조각 재사용** — header/footer 같은 공통 UI는 `shared/components/`에 두고,
   각 화면에서 재사용한다.

## 폴더 구조 (예정)

```
project/
├── index.html                     # 진입점 (역할 선택 - 실제 인증 전 임시)
├── admin/
│   ├── dashboard/                 # 대시보드 (R - 통계/요약)
│   ├── products/                  # 상품 관리 (C R U D)
│   ├── orders/                    # 주문 관리 (R, U-상태변경, D)
│   └── users/                     # 회원 관리 (R U D)
├── consumer/
│   ├── home/                      # 상품 목록/검색 (R)
│   ├── product-detail/            # 상품 상세 (R) + 장바구니 담기
│   ├── cart/                      # 장바구니 (C R U D)
│   ├── orders/                    # 내 주문 (C-주문생성, R-주문내역)
│   ├── profile/                   # 내 정보 (R U)
│   └── auth/                      # 로그인/회원가입
└── shared/
    ├── components/                # header, footer (html+css+js)
    ├── services/                  # data.service.js, auth.service.js
    ├── styles/                    # reset.css, variables.css
    └── utils/                     # 공통 유틸 (예: html 조각 삽입기)
```

각 기능 폴더(예: `admin/products/`)는 `index.html`, `products.css`, `products.js` 세 파일을
함께 담는다 (co-location). 전역 css/js 폴더로 흩어놓지 않는다.

## 역할별 CRUD 매트릭스

| 리소스 | 관리자(admin) | 소비자(consumer) |
|---|---|---|
| 상품(product) | C R U D | R (조회만) |
| 주문(order) | R, U(상태변경), D | C(주문생성/체크아웃), R(내 주문만) |
| 회원(user) | R U D (전체 회원 관리) | R U (본인 정보만) |
| 장바구니(cart) | 해당 없음 | C R U D |

## 페이지 ↔ 서비스 모듈 매핑

- `admin/products` → `productService` 전체 (getAll/getById/create/update/remove)
- `admin/orders` → `orderService.getAll/updateStatus/remove`
- `admin/users` → `userService.getAll/update/remove`
- `consumer/home`, `consumer/product-detail` → `productService.getAll/getById`
- `consumer/cart` → `cartService` 전체 (getItems/addItem/updateItem/removeItem)
- `consumer/orders` → `orderService.create/getByUser`
- `consumer/profile` → `userService.getById/update` (본인 id만)
- `consumer/auth` → `authService.login/signup/logout`

## 다음 단계 (청사진 이후 실제 구현 시)

1. 데이터 저장 방식 결정 (localStorage 프로토타입 vs 실제 백엔드 API)
2. 위 폴더 구조대로 실제 `index.html` / `*.css` / `*.js` 파일 생성
3. `data.service.js` / `auth.service.js`에 실제 CRUD 로직 구현
4. 각 화면에서 서비스 모듈 호출 + 렌더링 로직 작성
5. 역할 기반 접근 제어(라우트 가드) 추가
