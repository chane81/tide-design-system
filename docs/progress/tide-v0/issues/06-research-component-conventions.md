# 레퍼런스 Component 구성과 공통 API 관례 조사

Type: research
Status: resolved
Blocked by: 없음

## Question

레퍼런스 시스템과 shadcn/ui는 v0나 초기 버전에 어떤 Component를 넣었는가? 공통 API 관례(size와 variant 이름, `className` 병합, ref 전달, `asChild`나 polymorphic 패턴, controlled/uncontrolled)는 어떤가? 접근성 동작을 담당하는 headless 라이브러리(Radix Primitives, React Aria, Base UI, Ark UI)는 현재 어떤 상태이고 장단점은 무엇인가?

## Answer

- 초기 구성: shadcn/ui는 2023-01 출시 때 Radix를 감싼 26개, Radix Themes 1.0(2023-08)은 레이아웃과 타이포를 포함해 약 44개, SEED 0.0.1(2025-02)은 모바일 중심으로 약 40개였다. Button, Input, Checkbox, Switch, Dialog, Tabs, Avatar는 셋 모두 처음부터 있었고, Toast, Table, Skeleton은 나중에 추가된 경우가 많았다.
- API 관례: 스타일 축은 `variant`가 가장 흔하다(Carbon은 `kind`, Atlassian은 `appearance`). size 값은 `sm`/`md`/`lg`, `small`/`medium`/`large`, 숫자 단계로 갈린다. `className` 병합은 shadcn의 tailwind-merge(`cn`), Carbon의 이어 붙이기, Atlassian의 금지(Omit)로 나뉜다. shadcn은 React 19에 맞춰 `forwardRef`를 제거했다.
- 조합 패턴: `asChild`는 Radix, Ark, SEED, `render`는 Base UI, React Aria, `as`는 Primer, Carbon이 쓴다. 제어 상태는 모두 `value`/`default*`/`on*Change` 짝이지만 이름과 콜백 인자 모양이 다르다.
- headless 상태(2026-11): 네 라이브러리 모두 React 19 peer를 지원하고 2026-10에 릴리스가 있었다. shadcn은 2026-07에 기본 base를 Radix에서 Base UI로 바꿨다. Radix는 2025-08~2026-06 릴리스 공백이 있었다. React Aria는 범위가 가장 넓다. Ark는 다중 프레임워크용이다.
- 상세와 출처: [docs/research/component-conventions.md](../../../research/component-conventions.md)
