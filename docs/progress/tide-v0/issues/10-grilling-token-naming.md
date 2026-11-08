# Token 네이밍과 Utility class 노출 규칙 결정

Type: grilling
Status: resolved
Blocked by: 02, 03

## Question

Primitive Token과 Semantic Token의 이름 규칙, CSS 변수 prefix, Utility class 이름(`bg-primary` 형태 등), Token 원본을 어떤 포맷으로 둘지(DTCG JSON 또는 Tailwind theme CSS 직접 작성), 원본에서 CSS 변수와 Tailwind theme을 만드는 파이프라인을 결정한다.

### 참고 (다른 티켓에서 넘어온 것)

- 「컬러 Foundation 결정」에서 Semantic 색 Token의 구성(역할 6개 × 속성 6개, 표면 3층, 강도와 상태)과 가칭을 정했다. 이 티켓에서는 그 구성을 받아 실제 이름을 정한다.

## Answer

Semantic 색은 **Tailwind 속성별 namespace**로 노출하고, Token 원본은 **TS 객체**로 둔다. 근거와 대안은 [ADR 0003](../../../decisions/0003-token-source-and-utility-namespaces.md)에 적었다. 「컬러 Foundation 결정」의 가칭은 아래 이름으로 확정한다.

### 노출 방식

- **Semantic**: `--background-color-*` → `bg-*`, `--text-color-*` → `text-*`, `--border-color-*` → `border-*`, `--outline-color-*` → `outline-*`. 속성마다 다른 값을 가질 수 있고, 의미 없는 조합(`text-<배경 Token>`)은 생기지 않는다.
  - 근거 버전: tailwindcss 4.3.5 배포 소스 `dist/lib.mjs`. 예를 들어 `bg`의 themeKeys는 `["--background-color", "--color"]`다. 공식 문서 namespace 표(theme.mdx)에는 이 namespace가 없다. 그래서 빌드한 CSS에 기대한 class가 있는지 CI 테스트로 확인한다.
- **Primitive**: `--color-*` namespace에 두고 Utility class로 노출한다(`bg-blue-500`). `--color-*: initial`로 Tailwind 기본 팔레트를 지운 뒤 Tide 값을 채운다. Component 안에서는 쓰지 않는다.
- **공개 계약**: `--tide-<Utility class 이름>`, kebab-case. 예: `--tide-color-blue-500`, `--tide-bg-primary-solid`, `--tide-text-muted`. Tailwind 변수는 `@theme inline`으로 `--tide-*`를 가리키는 내부 연결용이며 공개 계약이 아니다.
- **색 외 Foundation**: 같은 규칙을 적용한다. 공개 계약은 `--tide-<class 이름>`이고, Tailwind 쪽은 표준 namespace(`--text-*`, `--radius-*`, `--shadow-*` 등)에 연결한다. 단계 이름은 각 Foundation 티켓에서 정한다.

### Primitive 계열 이름

색상 이름을 쓴다. 역할 이름은 Semantic에서만 쓴다.

| 계열 | 대응 Role | hue |
|---|---|---|
| `blue` | primary | 257.8 |
| `gray` | neutral | 257.8 |
| `green` | success | 150 |
| `amber` | warning | 75 |
| `red` | danger | 27 |
| `cyan` | info | 225 |

그 외에 `white`, `black`을 둔다. 단계는 `50`~`950`(11단계)이다. 「컬러 스케일 후보 시각 비교」의 초안 표에 있는 `success`/`warning`/`danger`/`info` 계열은 각각 위 이름으로 바꾼다.

### Semantic 이름 문법

| 형태 | 예 |
|---|---|
| `bg-<역할>-<solid\|subtle>[-hover\|-active]` | `bg-primary-solid`, `bg-danger-subtle-hover` |
| `text-<역할>` (neutral 제외) | `text-primary`, `text-danger` |
| `border-<역할>` (neutral 제외) | `border-success` |

- 강도(`solid`/`subtle`)는 생략하지 않는다. 강도 없는 `bg-primary`는 없다.
- 상태 접미사는 CSS 의사 클래스 이름을 따라 `-hover`, `-active`로 한다. 실제 사용 예: `hover:bg-primary-solid-hover`.
- neutral 역할은 별도 text와 border가 없다. 글자는 `text-default`/`text-muted`, 테두리는 `border-default`/`border-strong`을 쓴다.

### 공통 Token 이름

- 표면: `bg-canvas`, `bg-surface`, `bg-raised`
- 그 외 bg: `bg-disabled`, `bg-overlay`
- text: `text-default`, `text-muted`, `text-disabled`, `text-on-solid`
- border: `border-default`, `border-strong`
- focus-ring: `outline-focus`. outline과 offset으로 그린다(forced-colors 모드에서도 남음). 두께와 offset 값은 「v0 Foundation 범위 결정」 이후에 정한다.
- shadow 색: Utility class로 노출하지 않는다. `--tide-shadow-color`만 두고, elevation의 `--shadow-*` 정의 안에서 쓴다.

### Theme 선택자

- `:root`, `[data-theme="light"]`는 light, `[data-theme="dark"]`는 dark다. 각각에 `color-scheme`을 지정한다. 어느 요소에든 붙일 수 있으므로 일부 영역만 다른 Theme으로 둘 수 있다.
- `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))`를 함께 제공한다.
- OS 설정(`prefers-color-scheme`)에 따른 자동 전환은 CSS에 넣지 않는다. 앱이 속성을 설정한다.

### 원본과 파이프라인

- 원본은 TS 객체(`as const`)다. 대비 쌍 목록도 같은 곳에 둔다.
- 직접 만든 빌드 스크립트로 다음을 만든다. ① CSS(`--tide-*` 변수, Theme별 덮어쓰기, `@theme inline` 연결, `@custom-variant`) ② tailwind-merge `extendTailwindMerge` 설정(색이 아닌 커스텀 이름). vitest 대비 쌍 검사는 원본을 직접 import한다.
- DTCG JSON은 지금 만들지 않는다. 필요해지면 TS 원본에서 출력물로 내보낸다.
- 대비 쌍 추가: `text-default` × `bg-neutral-subtle` / `-hover` / `-active`(light, dark).
- 스크립트와 출력 파일이 어느 패키지에 들어갈지는 「모노레포 패키지 구조와 빌드 결정」에서 정한다.
