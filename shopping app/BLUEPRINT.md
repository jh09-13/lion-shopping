# 쇼핑몰 청사진 (Blueprint)

순수 HTML + JS + CSS로 만드는 쇼핑몰. 관리자(admin) / 소비자(consumer) 두 역할을 기준으로
화면과 CRUD를 나누고, **co-location**(기능별로 html/css/js를 한 폴더에 묶는 방식)으로 구성한다.

> 이 문서는 설계 단계 산출물이다. 데이터 저장 방식은 localStorage 프로토타입으로 확정했다
> (`shared/services/data.service.js`). 나중에 백엔드로 바꿀 때는 이 파일 내부 구현만 교체하면 된다.

## 설계 원칙

1. **역할별 분리** — `admin/`, `consumer/`로 최상위를 나눈다. 같은 "상품"이라도
   관리자는 CRUD 전체, 소비자는 조회(R) 위주로 권한이 다르므로 화면 자체를 분리한다.
2. **Co-location** — 폴더 하나가 화면(기능) 하나. 그 화면의 `index.html`, `*.css`, `*.js`가
   같은 폴더에 있다. 전역 `css/`, `js/` 폴더에 다 모아두는 방식은 쓰지 않는다.
3. **역할 / 리소스 / CRUD 3단 구조** — `{역할}/{리소스}/{create|read|update|delete}/` 형태로
   통일한다. 폴더 이름은 항상 CRUD 알파벳에 대응하는 동사(`create`, `read`, `update`, `delete`)로
   고정하고, 그 역할이 실제로 가진 권한만큼만 폴더가 생긴다. 동작 하나 = 폴더 하나 =
   `index.html`/`*.css`/`*.js` 한 세트. 목록 화면 안에 등록/수정/삭제를 모달이나 상태로
   욱여넣지 않고, 화면과 URL 단위로 명시적으로 분리한다.
4. **데이터 계층 분리** — 화면 코드는 localStorage를 직접 호출하지 않고 공통 서비스 모듈
   (`data.service.js`, `auth.service.js`)을 통해서만 데이터에 접근한다. 백엔드가 정해지면
   서비스 모듈 내부 구현만 바꾸면 되고, 화면 코드는 그대로 둔다.
5. **공통 조각 재사용** — header/footer 같은 공통 UI는 `shared/components/`에 두고,
   각 화면에서 `shared/utils/include.util.js`로 불러와 재사용한다.

## 폴더 구조 (예정)

**역할자(admin/consumer) / 리소스(products, orders, users, cart) / CRUD(create, read, update, delete)**
3단 구조로 통일한다. 리소스 폴더 아래에는 그 역할이 실제로 가진 권한만큼만 `create/read/update/delete`
폴더가 생긴다. (상품 상세 보기는 별도 폴더가 아니라 `read` 안에서 목록 조회와 함께 처리한다.)

```
project/
├── admin/
│   ├── products/                      # 리소스: 상품 (C R U D)
│   │   ├── create/
│   │   ├── read/                      # 목록 조회 + 상세 조회 모두 포함
│   │   ├── update/
│   │   └── delete/
│   ├── orders/                        # 리소스: 주문 (R U D, admin은 주문을 생성하지 않음)
│   │   ├── read/
│   │   ├── update/                    # 상태변경
│   │   └── delete/
│   └── users/                         # 리소스: 회원 (R U D, 가입은 consumer/auth에서 함)
│       ├── read/
│       ├── update/
│       └── delete/
└── consumer/
    ├── products/                      # 리소스: 상품 (R만, 조회 전용)
    │   └── read/
    ├── cart/                          # 리소스: 장바구니 (C R U D)
    │   ├── create/
    │   ├── read/
    │   ├── update/                    # 수량 변경
    │   └── delete/
    ├── orders/                        # 리소스: 주문 (C R, 상태변경/삭제는 소비자 권한 밖)
    │   ├── create/                    # 주문 생성/체크아웃
    │   └── read/                      # 내 주문 내역
    └── users/                         # 리소스: 회원 (R U, 본인 정보만)
        ├── read/
        └── update/
```

가장 안쪽 폴더(예: `admin/products/create/`)가 co-location 단위다. `index.html` +
`<폴더명>.css` + `<폴더명>.js` 세 파일이 한 세트로 들어간다.

> **구조 밖 예외 화면** — 아래는 특정 리소스의 CRUD에 속하지 않아서 위 트리에는 넣지 않았지만,
> 실제 구현 때는 여전히 필요하다: 최상위 `index.html`(진입점/역할 선택), `admin/dashboard/`
> (통계 요약), `consumer/auth/`(로그인/회원가입), `shared/`(header·footer·서비스·공통 스타일 —
> 1단계에서 구현 완료, 아래 참고).

## shared/ 공통모듈 (1단계 구현 완료)

```
shared/
├── components/
│   ├── header/            # index.html + header.css + header.js
│   └── footer/            # index.html + footer.css + footer.js
├── services/
│   ├── data.service.js    # localStorage 기반 productService/orderService/userService/cartService
│   └── auth.service.js    # authService.login/signup/logout/getCurrentUser
├── styles/
│   ├── reset.css
│   └── variables.css
└── utils/
    └── include.util.js    # data-include 속성으로 header/footer 같은 조각 삽입
```

## 역할별 CRUD 매트릭스

| 리소스 | 관리자(admin) | 소비자(consumer) |
|---|---|---|
| products | create, read, update, delete | read |
| orders | read, update, delete | create, read |
| users | read, update, delete | read, update |
| cart | 해당 없음 | create, read, update, delete |

## 페이지 ↔ 서비스 모듈 매핑

- `admin/products/create` → `productService.create`
- `admin/products/read` → `productService.getAll` + `getById`
- `admin/products/update` → `productService.getById` + `update`
- `admin/products/delete` → `productService.getById` + `remove`
- `admin/orders/read` → `orderService.getAll`
- `admin/orders/update` → `orderService.getById` + `updateStatus`
- `admin/orders/delete` → `orderService.remove`
- `admin/users/read` → `userService.getAll`
- `admin/users/update` → `userService.getById` + `update`
- `admin/users/delete` → `userService.remove`
- `consumer/products/read` → `productService.getAll` + `getById`
- `consumer/cart/create` → `cartService.addItem`
- `consumer/cart/read` → `cartService.getItems`
- `consumer/cart/update` → `cartService.updateItem`
- `consumer/cart/delete` → `cartService.removeItem`
- `consumer/orders/create` → `orderService.create`
- `consumer/orders/read` → `orderService.getByUser`
- `consumer/users/read` → `userService.getById` (본인 id만)
- `consumer/users/update` → `userService.update` (본인 id만)

## 다음 단계

1. ~~데이터 저장 방식 결정~~ — localStorage 프로토타입으로 확정, `shared/services/` 구현 완료
2. 위 폴더 구조대로 `admin/`, `consumer/` 하위에 실제 `index.html` / `*.css` / `*.js` 파일 생성
3. 각 화면에서 `shared/services/data.service.js`, `auth.service.js` 호출 + 렌더링 로직 작성
4. `shared/utils/include.util.js`로 각 화면에 header/footer 삽입 연결
5. 역할 기반 접근 제어(라우트 가드) 추가
