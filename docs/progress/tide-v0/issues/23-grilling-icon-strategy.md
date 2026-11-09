# 아이콘 전략 결정

Type: grilling
Status: resolved
Blocked by: 12, 15

## Question

v0 Component 안에서 쓸 아이콘과, 사용자에게 제공할 아이콘을 어떻게 마련할지 정한다. 대상은 직접 제작할지 외부 세트를 쓸지(라이선스 포함), 배포 형식(React Component, SVG sprite 등)과 패키지 위치, 크기 규칙(텍스트 스타일과의 짝), 접근성 처리(장식용 아이콘과 의미가 있는 아이콘의 구분)다.

### 참고 (다른 티켓에서 넘어온 것)

- 「v0 Foundation 범위 결정」: 아이콘은 v0에 넣는다.
- 「컬러 Foundation 결정」: 아이콘 색은 별도 속성 없이 `currentColor`를 따른다.
- 「v0 Component 목록과 우선순위 결정」: Component 내부에 필요한 아이콘은 다음과 같다. Checkbox 체크와 indeterminate, Select·Combobox·Accordion의 chevron, Dialog·Toast·Alert·Tag의 닫기(x), Pagination 화살표와 Breadcrumb 구분자, Alert·Toast의 역할별 상태 아이콘(info, success, warning, danger), Avatar fallback(사람).
- 「모노레포 패키지 구조와 빌드 결정」: 배포 패키지는 `@tide-tds/foundation`(프레임워크 무관)과 `@tide-tds/desktop`(React) 두 개다. 아이콘을 둘 중 어디에 둘지, 아니면 별도 패키지(예: `@tide-tds/icons`)로 둘지 여기서 정한다. React Component 형식이면 foundation에는 둘 수 없다(ADR 0001).

## Answer

아이콘 세트는 **Lucide**다. `lucide-static`의 SVG로 React Component를 생성해 **`@tide-tds/icons`** 로 배포하고, desktop 내부 아이콘도 여기서 가져온다([ADR 0007](../../../decisions/0007-lucide-generated-icons-package.md)). 확인한 버전: `lucide-static`·`lucide-react` 1.70.0(ISC), 2026-11-09 npm 기준. Lucide 접근성 동작은 context7의 Lucide 1.49.0 문서(1.70.0 문서가 없어 가장 가까운 버전)로 확인했다. 크기와 선 두께 규칙은 jakub.kr 스킬 `better-ui/icons.md`(커밋 `659cc4e`)를 참고했다.

### 1. 세트와 배포

- Lucide를 쓴다. shadcn 기본값이라 사용자가 이미 아는 세트이고(④ 발견할 수 있음), 라이선스가 단순하다. filled 변형이 거의 없으므로 "기본은 outline, 활성은 fill" 패턴은 v0에서 쓰지 않는다.
- `lucide-react`를 의존성으로 두지 않는다. `lucide-static`을 devDependency로 두고 빌드 스크립트가 SVG를 읽어 Component를 생성한다. 런타임 외부 의존성은 0이다.
- `@tide-tds/desktop`은 `@tide-tds/icons`(workspace 패키지)를 dependency로 쓴다. 앱은 desktop만 설치해도 icons가 함께 들어온다.
- 앱은 Tide와 같은 모양의 아이콘이 필요할 때 `@tide-tds/icons`에서 import한다. 다른 라이브러리를 써도 된다. Component의 아이콘 자리는 `ReactNode`를 받는다.
- 저작권: Lucide LICENSE(ISC 전문 + Feather 유래 아이콘의 MIT 전문)를 패키지에 그대로 포함한다.

### 2. 이름과 props

- 모든 아이콘은 `Icon` 접미사로 export한다(`PlusIcon`, `SearchIcon`, `MenuIcon`). 접미사 없는 이름은 내보내지 않는다. Lucide의 `menu`, `table`이 Tide `Menu`, `Table` Component와 겹치기 때문이다(② 명확함).
- props:
  - `size`: px 숫자, 기본 16
  - `strokeWidth`: 기본 2. 렌더된 두께 기준이다(`vector-effect: non-scaling-stroke`). 크기가 달라도 두께가 유지된다
  - `aria-label`: 주면 `aria-hidden`이 빠지고 `role="img"`가 붙는다. 안 주면 장식용(`aria-hidden="true"`, `focusable="false"`)이다
  - 나머지 SVG 속성(`className` 등)은 그대로 넘긴다
- props 모양은 Lucide와 같게 맞춰 Lucide를 써 본 사람에게 익숙하게 한다(④).
- 색은 `currentColor`다(「컬러 Foundation 결정」).

### 3. 크기와 선 두께

| Component size | 텍스트 스타일 | 텍스트 옆 아이콘 | IconButton 아이콘 |
|---|---|---|---|
| xs (24px) | `label-sm` 12px | 14px | 16px |
| sm (32px) | `label-sm` 12px | 14px | 16px |
| md (40px) | `label-md` 14px | 16px | 20px |
| lg (48px) | `label-lg` 16px | 20px | 24px |

- 선 두께는 렌더 기준으로 label(굵기 500) 옆에서 2px, body(굵기 400) 옆에서 1.5px다.
- sm 텍스트 옆 아이콘은 24번에서 14px와 16px를 Pretendard와 나란히 놓고 비교해 **14px**로 정했다(1.17em, jakub 범위 1~1.25em 안).
- 한 화면에서 아이콘 세트를 섞지 않는다(가이드).

### 4. 접근성

- Tide Component 내부 아이콘은 항상 장식용이다. 의미는 옆 텍스트나 Component가 전달한다. IconButton은 `aria-label`(필수), Alert는 제목과 role, Checkbox는 네이티브 checked 상태가 맡는다.
- 상태 아이콘(info, success, warning, danger)은 색과 모양을 함께 다르게 한다. 색만으로 구분하지 않는다(WCAG 1.4.1).
- 앱 가이드: 아이콘만으로 의미를 전할 때는 `aria-label`을 준다. 텍스트 옆 아이콘은 기본값(숨김)을 그대로 둔다.

### 다른 티켓에 주는 영향

- ADR 0006: 배포 패키지가 세 개가 된다는 정정을 붙였다.
- 「그림자·포커스 표시·motion 시각 비교」(24번): 아이콘 크기 표를 함께 확인한다.
- 지도의 「Storybook 문서 구성」: 아이콘 목록(검색) 페이지와 사용 가이드가 들어간다.
- 지도의 「버전과 배포 정책」: Lucide가 아이콘 이름을 바꾸거나 지울 때의 semver 처리를 다룬다.

## Comments

- 2026-11-09 grilling 진행. Lucide, 내부 아이콘 복사, 크기·선 두께, 접근성은 추천안대로 확정했다. 처음에는 공개 아이콘 패키지 없이 앱이 필요하면 `lucide-react`를 직접 설치하는 안을 추천했다. 사용자가 앱에서 `@tide-tds/icons`로 불러 쓰는 것도 좋다고 해서 생성형 복사 패키지로 바꿨다. desktop 내부 아이콘도 그 패키지에서 가져오도록 출처를 하나로 합쳤다(ADR 0007).
- 2026-11-09 「그림자·포커스 표시·motion 시각 비교」(24번)에서 값을 확정해 Answer를 고쳤다. sm 텍스트 옆 아이콘 16px → 14px.
