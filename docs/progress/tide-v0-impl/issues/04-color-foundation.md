# 04: 컬러 Foundation

Status: ready-for-agent
Blocked by: 03 (Storybook과 브라우저 테스트 골격)

## What to build

앱 개발자가 Role 6개와 강도(`solid`/`subtle`)로 배경·글자·테두리 색을 class로 고르고, `data-theme` 속성 하나로 light/dark를 바꿀 수 있다. 실제로 함께 쓰이는 색 조합의 대비는 CI가 보장하고, 대비 쌍에 등록하지 않은 Semantic Token은 CI를 실패시킨다. 디자이너는 Storybook에서 색 스케일과 대비비를 본다.

## 수용 기준

### Primitive

- [ ] 계열 `blue`(primary), `gray`(neutral), `green`(success), `amber`(warning), `red`(danger), `cyan`(info) 각 50~950의 11단계와 `white`, `black`이 있다.
- [ ] 정본은 hex다. `blue-500`은 `#3183f5`다.
- [ ] Tailwind 기본 팔레트를 지운다(`--color-*: initial`). `bg-blue-500`은 Tide 값이다.

### Semantic

- [ ] Tailwind 속성별 namespace(`--background-color-*`, `--text-color-*`, `--border-color-*`, `--outline-color-*`)로 노출한다. 의미 없는 조합(`text-bg-primary` 등)은 생기지 않는다.
- [ ] `bg-<역할>-<solid|subtle>[-hover|-active]`. 강도는 생략하지 않는다.
- [ ] `text-<역할>`, `border-<역할>`. neutral은 이 둘을 두지 않는다.
- [ ] 공통: `bg-canvas`, `bg-surface`, `bg-raised`, `bg-disabled`, `bg-overlay`, `text-default`, `text-muted`, `text-disabled`, `text-on-solid`, `border-default`, `border-strong`, `outline-focus`.
- [ ] shadow 색은 class로 노출하지 않고 `--tide-shadow-color`만 둔다.
- [ ] 매핑은 spec과 tide-v0 티켓 09(컬러 Foundation 결정)를 따른다: solid/hover/active 600/700/800, subtle light 50/100/200·dark 950/900/800(dark neutral만 900/800/700), 역할 text light 800·dark 200, 역할 border light 600·dark 400, 표면 층(canvas·surface·raised), focus-ring blue-600/blue-400, overlay gray-950 alpha 50%/70%, shadow 색 gray-950 8%/black 30%. alpha는 overlay와 shadow에만 8자리 hex로 쓴다.

### Theme

- [ ] `:root`와 `[data-theme="light"]`는 light, `[data-theme="dark"]`는 dark이고 각각 `color-scheme`을 지정한다. 요소 단위 `data-theme`도 동작한다.
- [ ] `dark:` variant는 `data-theme=dark`를 따른다. `prefers-color-scheme` 자동 전환은 없다.
- [ ] 공개 계약은 `--tide-<Utility class 이름>`이고 tokens CSS만 import해도 쓸 수 있다.

### 테스트 (`unit`)

- [ ] 대비 쌍 목록(128쌍 이상)을 light와 dark에서 모두 검사한다. 텍스트 4.5:1, UI 경계·포커스 3:1. 장식용 border, disabled, overlay, shadow는 제외한다.
- [ ] 대비 쌍에 등록되지 않은 Semantic Token이 있으면 실패한다.
- [ ] 컴파일한 CSS에 Semantic namespace class가 있고, Tailwind 기본 팔레트 class가 없다.
- [ ] `--tide-*` 공개 계약 목록을 검사한다.
- [ ] tailwind-merge 설정이 Semantic 색 namespace 충돌을 해결한다.

### 문서

- [ ] 색 Token 블록: Token 원본을 import해 색 스케일과 대비비를 그린다.

## Comments
