# Tide 원칙

Tide는 접근성, 명확함, 단순함, 발견할 수 있음을 이 순서로 우선한다.

Tide의 모든 결정은 아래 네 원칙을 따른다. 원칙 번호가 곧 우선순위다. 원칙끼리 부딪히면 번호가 작은 원칙을 따른다.

| #   | 원칙                                    | English                     |
| --- | --------------------------------------- | --------------------------- |
| ①   | 접근성이 미려함보다 우선한다            | Accessible over beautiful   |
| ②   | 명확함이 화려함보다 우선한다            | Clarity over flair          |
| ③   | 단순함이 유연함보다 우선한다            | Simple over flexible        |
| ④   | 발견할 수 있음이 외워야 함보다 우선한다 | Discoverable over memorized |

원칙은 가치 판단이다. 측정할 수 있는 규칙은 [기준(Standard)](../standards/)에 따로 둔다.

---

## ① 접근성이 미려함보다 우선한다 · Accessible over beautiful

누구나 쓸 수 있어야 아름다움도 의미가 있다. 시각 표현은 접근성 기준을 통과한 범위 안에서 고른다.

**그래서 우리는**

- 대비 기준을 통과하지 못하는 색 조합은 Semantic Token으로 만들지 않는다.
- 상호작용하는 Component는 모두 키보드 조작과 포커스 표시를 기본으로 갖춘다.
- `#3183f5` 위에 흰 글자를 올리지 않고, 텍스트와 solid 배경에는 더 진한 단계를 쓴다.

**하지 않는 것**

- 보기 좋다는 이유로 포커스 링을 숨기지 않는다.
- 색 하나만으로 상태를 구분하지 않는다.

관련 기준: [접근성 기준](../standards/accessibility.md)

## ② 명확함이 화려함보다 우선한다 · Clarity over flair

사용자는 무엇을 할 수 있는지, 방금 무슨 일이 일어났는지 바로 알 수 있어야 한다. 장식은 의미를 전달할 때만 쓴다.

**그래서 우리는**

- hover, focus, disabled, error 같은 상태를 모두 눈으로 구분할 수 있게 만든다.
- 모션은 상태 변화를 설명할 때만 쓴다.
- Token에는 생김새가 아니라 용도로 이름을 붙인다(Semantic Token).

**하지 않는 것**

- 그라데이션이나 강한 그림자를 기본 스타일로 넣지 않는다.
- 의미 없이 반복되는 애니메이션을 넣지 않는다.

## ③ 단순함이 유연함보다 우선한다 · Simple over flexible

선택지가 적을수록 쓰기 쉽고 결과가 일관된다. 자주 쓰는 경우는 쉽게, 드문 경우는 가능하게 만든다.

**그래서 우리는**

- variant와 size는 꼭 필요한 것만 둔다.
- 드문 요구는 prop을 늘리지 않고 `className` 확장으로 받는다.
- 새 Component를 추가하기 전에 기존 Component 조합으로 해결되는지 먼저 확인한다.

**하지 않는 것**

- 모든 스타일 속성을 prop으로 노출하지 않는다.
- 반대로 `className`을 막아서 확장을 아예 닫아 버리지도 않는다.

## ④ 발견할 수 있음이 외워야 함보다 우선한다 · Discoverable over memorized

사용자는 문서를 외우지 않고 에디터에서 찾는다. 규칙은 자동완성, 타입, 이름에 드러나 있어야 한다.

**그래서 우리는**

- Token을 Utility class로 노출해서 `w-`, `bg-`만 입력해도 자동완성에 뜨게 한다.
- prop에 넣을 수 있는 값은 TypeScript union으로 제한해 타입이 곧 문서가 되게 한다.
- 이름은 [GLOSSARY](../../GLOSSARY.md)의 용어를 따른다.

**하지 않는 것**

- 문서에만 적혀 있고 코드에서는 드러나지 않는 규칙을 만들지 않는다.
- Token에 없는 임의의 값(`w-[37px]` 등)을 써야만 원하는 결과가 나오는 설계를 하지 않는다.

---

## 충돌할 때

번호가 작은 원칙을 따른다.

- **예**: 아이콘 버튼에 `aria-label`을 필수 prop으로 두면 ③ 단순함은 손해를 보지만, ① 접근성이 앞서므로 필수로 둔다.

## 원칙에서 나온 결정

모든 ADR은 `근거 원칙:` 줄로 이 문서의 원칙을 가리킨다. 아래 목록은 원칙별로 그 ADR을 모은 것이다.

- ③ 단순함: [ADR 0001 Token은 프레임워크 무관, v0 Component는 React 전용](../decisions/0001-framework-agnostic-tokens-react-components.md)
- ④ 발견할 수 있음: [ADR 0002 pnpm 모노레포 + Tailwind](../decisions/0002-monorepo-tailwind.md)
- ② 명확함, ③ 단순함, ④ 발견할 수 있음: [ADR 0003 Token 원본은 TS 객체, Semantic 색은 Tailwind 속성별 namespace로 노출](../decisions/0003-token-source-and-utility-namespaces.md)
- ① 접근성, ③ 단순함: [ADR 0004 접근성 동작은 React Aria hooks, 구조와 스타일은 직접 구현](../decisions/0004-react-aria-hooks-own-markup.md)
- ③ 단순함, ④ 발견할 수 있음: [ADR 0005 variant 맵은 직접 작성하고, 조합은 `render` prop으로 한다](../decisions/0005-hand-written-variant-maps-and-render-prop.md)
- ② 명확함: [ADR 0006 패키지는 Foundation과 Target(desktop)으로 나눈다](../decisions/0006-foundation-and-target-packages.md) (ADR 0009로 대체됨)
- ③ 단순함, ④ 발견할 수 있음: [ADR 0007 아이콘은 Lucide를 생성 복사한 `@tide-design/icons`로 배포한다](../decisions/0007-lucide-generated-icons-package.md)
- ③ 단순함: [ADR 0008 세 패키지는 fixed 버전으로 묶고, CI는 OIDC 직접 publish로 배포한다](../decisions/0008-fixed-versions-and-oidc-direct-publish.md)
- ② 명확함, ③ 단순함: [ADR 0009 Component는 `@tide-design/components` 한 패키지로 두고 Target으로 나누지 않는다](../decisions/0009-single-components-package.md)
- ③ 단순함, ④ 발견할 수 있음: [ADR 0010 press 축소를 끄는 prop은 `noPressScale`이다](../decisions/0010-press-scale-opt-out-prop-name.md)
- ① 접근성, ③ 단순함, ④ 발견할 수 있음: [ADR 0011 `color`는 열린 색 이름이고, `data-color`로 accent 슬롯에 꽂는다](../decisions/0011-open-color-names-data-color-accent.md) (ADR 0016으로 일부 대체됨)
- ① 접근성, ③ 단순함, ④ 발견할 수 있음: [ADR 0013 Field는 label·설명·오류를 props로 받고, 입력 Component는 context로 연결한다](../decisions/0013-field-props-and-context-connection.md)
- ① 접근성, ③ 단순함: [ADR 0015 Switch는 `<label>` 루트에 `className`을, 네이티브 input에 `ref`와 HTML 속성을 붙인다](../decisions/0015-switch-label-root-input-ref.md)
- ① 접근성, ② 명확함, ③ 단순함: [ADR 0016 행동·의미 Component의 `color`는 Role만 받고, 앱 브랜드 색은 앱 Role로 더한다](../decisions/0016-role-scoped-color-and-app-roles.md)
- ② 명확함, ③ 단순함: [ADR 0017 Badge의 `color`는 Role과 색 계열 이름을 모두 받는다(`Color`)](../decisions/0017-badge-color-accepts-role-and-color-family.md)
- ① 접근성, ② 명확함, ③ 단순함: [ADR 0022 파스텔 강도와 덮기 방식 상태색으로 컬러 Foundation의 색감을 바꾼다](../decisions/0022-pastel-intensity-and-overlay-states.md)
- ① 접근성, ② 명확함: [ADR 0023 대비 하한을 상태별 세 등급(4.5 / 4.0 / 3)으로 나눈다](../decisions/0023-tiered-contrast-minimum.md)
- ① 접근성, ② 명확함: [ADR 0024 조작 요소 글자 크기를 맞춘다: `sm` 14px, Switch 라벨 body, 목록 항목 14px](../decisions/0024-control-text-sizes.md)
- ② 명확함, ① 접근성: [ADR 0025 Button outline·ghost의 호버·누름을 같은 색 파스텔로 채운다](../decisions/0025-tinted-outline-ghost-states.md)
- ④ 발견할 수 있음, ③ 단순함: [ADR 0028 파일은 쓰는 곳 가까이 두고, 폴더 이름은 네 개로 고정한다](../decisions/0028-colocation-monorepo-structure.md)
