# z-index 층 결정

Type: grilling
Status: resolved
Blocked by: 12, 13

## Question

겹치는 요소(dropdown, sticky, overlay, modal, toast 등)의 쌓임 순서를 정한다. 층 이름과 값, 그리고 Tailwind 쪽 노출 방식을 정한다. 「접근성 동작 구현 방식 결정」에서 top-layer(`<dialog>`, popover API)나 Portal을 쓰기로 하면, z-index Token이 필요한 범위가 줄어든다.

### 참고 (다른 티켓에서 넘어온 것)

- 「v0 Foundation 범위 결정」: z-index는 Semantic 층 이름을 둔다. 이름은 표면 층(`canvas`/`surface`/`raised`)과 섞이지 않게 짓는다. GLOSSARY에서 `layer`는 Avoid로 둔 단어다.
- Tailwind 4.3.x에서 z-index에 theme namespace가 있는지는 공식 문서로 확인한다.
- 「접근성 동작 구현 방식 결정」: React Aria 오버레이 hook은 기본적으로 `document.body`에 portal로 렌더한다(`UNSAFE_PortalProvider`로 컨테이너를 바꿀 수 있음). 따라서 z-index 층이 필요하다는 전제는 유지된다. 직접 만드는 마크업에서 top-layer(`<dialog>`, popover API)를 함께 쓸지는 여기서 판단한다.
- 「radius·elevation·focus ring 형태 결정」: WCAG 2.4.11 Focus Not Obscured(Minimum, AA)를 여기서 다룬다. 포커스된 요소가 sticky 헤더, Toast 등에 완전히 가려지지 않아야 한다(예: `scroll-padding`으로 sticky 높이만큼 여백을 두는 방법).

## Answer

v0는 top-layer를 쓰지 않고, 모든 오버레이를 React Aria portal과 z-index Token으로 쌓는다. 이 구분을 **쌓임 단계**라고 부른다(GLOSSARY). Tailwind 동작은 tailwindcss **4.3.5** npm 패키지 소스(`dist/lib.mjs`)로 확인했다. 새 ADR은 만들지 않았다.

### 1. top-layer를 쓰지 않음

- `<dialog>.showModal()`이나 popover API를 쓰면 브라우저 top-layer에 올라가 z-index가 필요 없다. 하지만 섞어 쓰면 깨진다. Dialog를 top-layer에 올리면, 그 안에서 연 Select 목록(React Aria가 `document.body`에 portal함)이 top-layer **아래**에 그려져 Dialog에 가려진다.
- 해결하려면 모든 오버레이를 top-layer로 옮겨야 하는데, 이는 React Aria hooks의 기본 동작(portal)과 어긋난다. 그래서 v0는 portal + z-index 한 가지 방식으로 통일한다(③ 단순함). top-layer 전환은 v0 이후 후보다.

### 2. 쌓임 단계

| 이름 | 값 | 쓰는 곳 |
|---|---|---|
| `sticky` | 100 | 앱의 sticky 헤더·사이드바. v0 Tide Component는 쓰지 않음 |
| `modal` | 200 | Dialog·AlertDialog와 그 backdrop |
| `popover` | 300 | Popover, Menu, Select·Combobox 목록 |
| `toast` | 400 | Toast 영역 |
| `tooltip` | 500 | Tooltip |

- `popover`가 `modal`보다 위다. Dialog 안에서 연 Select 목록이 Dialog 위에 보여야 하기 때문이다. 반대 경우(Dialog 뒤 페이지의 Popover가 Dialog 위로 올라옴)는 생기지 않는다. modal이 열려 있으면 뒤 페이지를 조작할 수 없다.
- Dialog 위에 AlertDialog를 띄우면 둘 다 `modal`이고, 나중에 portal된 쪽이 DOM 순서상 위에 온다.
- 값 사이를 100씩 띄워 앱이 자기 단계를 끼울 수 있게 했다.

### 3. Tailwind 노출

- tailwindcss 4.3.5의 `z-*` class는 `--z-index-*` namespace를 찾는다. 기본 theme에는 이 값이 없다. `--z-index-sticky` 등을 등록해 `z-sticky`, `z-modal`, `z-popover`, `z-toast`, `z-tooltip`으로 쓴다.
- 숫자 해석(`z-10`, `z-50`)은 끌 수 없으므로 그대로 둔다.
- 공개 계약은 `--tide-z-sticky` 등 `--tide-z-*`다(ADR 0003). 새 이름이므로 생성되는 tailwind-merge 설정에 들어간다.

### 4. Component 내부 쌓임

- Component 안에서 겹침이 필요하면 루트에 `isolate`(`isolation: isolate`)를 걸고 내부에서는 `z-0`, `z-1`만 쓴다. 예: 붙어 있는 버튼 묶음에서 포커스된 버튼의 ring을 옆 버튼 위로 올리는 경우.
- 쌓임 단계 Token은 오버레이 루트에만 쓴다. 내부 z-index가 밖으로 새어 앱의 sticky 헤더 위로 올라가는 일을 막는다.

### 5. WCAG 2.4.11 Focus Not Obscured (Minimum)

AA는 포커스된 요소가 **완전히** 가려지는 경우만 실패다(부분적으로 가려지는 것은 AAA 2.4.12).

- sticky 헤더: Tide가 막을 수 없는 앱 영역이다. Storybook 가이드에 "`scroll-padding-top`을 sticky 높이만큼 준다"를 적는다.
- Toast: 화면 모서리(기본 아래 오른쪽)의 좁은 영역에 쌓고 폭을 제한해, 포커스된 요소를 완전히 가리는 일을 줄인다. 위치 옵션은 Toast spec에서 정한다.
- Tooltip·Popover: 트리거를 덮지 않는 위치에 놓는다. React Aria 위치 계산(`useOverlayPosition`)의 기본 동작이 이를 보장하는지는 확인하지 못했으므로 Popover spec에서 확인한다.

### 다른 티켓에 주는 영향

- 지도의 「Storybook 문서 구성」: `scroll-padding-top` 가이드가 들어간다.
- Toast spec: 위치와 폭 제한(위 5번).
- Popover spec: 위치 계산이 트리거를 덮지 않는지 확인.

## Comments

- 2026-11-09 grilling 진행. top-layer 미사용, 쌓임 단계 5개와 순서(popover가 modal 위), `--z-index-*` 노출, 용어 「쌓임 단계」, Component 내부 `isolate` 규칙, 2.4.11 대응을 모두 추천안대로 확정했다.
