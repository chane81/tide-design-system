# 공개 Props에서 Tide props를 `XxxOwnProps`로 나누고, Component JSDoc에 이름 목록을 적는다

근거 원칙: ④ 발견할 수 있음이 외워야 함보다 우선한다, ② 명확함이 화려함보다 우선한다

`<TrendingUpIcon ` 뒤에서 자동완성을 열면 SVG·HTML 속성 수백 개 사이에 `size`·`strokeWidth`가 알파벳순으로 섞여 찾기 어렵다. 공개 Props가 모두 `interface ButtonProps extends Omit<ComponentProps<"button">, "color"> { … }` 꼴이라 모든 Component가 같다(2026-11-14, 사용자 결정).

## 결정

- 공개 Props마다 Tide props만 담은 `XxxOwnProps`를 두고, `XxxProps`는 그것과 네이티브 props를 합친다.
  ```ts
  export interface IconOwnProps {
    size?: number;
    strokeWidth?: number;
  }
  export interface IconProps
    extends IconOwnProps, Omit<ComponentProps<"svg">, keyof IconOwnProps> {}
  ```
  - Tide props는 Props 본문에 적던 것 전부다. 네이티브 이름이어도 Tide가 뜻이나 타입을 바꾼 것(`IconButton`의 필수 `aria-label`, Checkbox의 루트 label용 `className`)은 OwnProps에 들어간다.
  - Omit 키 중 OwnProps와 겹치는 것은 `keyof XxxOwnProps`로 바꾸고, Tide가 제어를 맡아 막는 키(`id`·`role`·`type` 등)는 그대로 적는다. 받는 props 집합은 바뀌지 않는다.
  - 이름 필수 조건 유니온(Progress·TagGroup의 `aria-label`/`aria-labelledby`)은 네이티브 속성 제약이라 OwnProps 밖에 둔다.
  - 네이티브 props가 없는 Props(`TooltipProps`, `MenuSectionProps` 등)와 Tide props가 없는 Props(`TableProps`, `VisuallyHiddenProps` 등)는 나눌 것이 없어 OwnProps를 두지 않는다.
- `XxxOwnProps`는 `XxxProps` 옆에 네임드로 공개한다.
- Component JSDoc 끝에 ``Tide props: `a`, `b` ({@link XxxOwnProps}). 나머지는 `<el>` 속성.`` 한 줄을 붙인다. 이름만 적고 기본값·설명은 OwnProps JSDoc이 맡는다. 아이콘은 생성기가 같은 줄을 쓴다.
- 목록과 OwnProps 키가 어긋나면 패키지 `test/ownProps.test.ts`가 실패한다(TypeScript로 `keyof`와 비교).

## 고려한 대안

- **`htmlProps={{ … }}`로 HTML 속성을 묶는다:** 자동완성은 가장 깔끔하지만 `className`·`aria-*`가 한 단계 안으로 들어가고, 폼 라이브러리의 `{...register("name")}` spread가 깨진다. React 생태계 Component 관례와도 달라 기각했다.
- **OwnProps만 두고 JSDoc 목록은 두지 않는다:** 정의로 이동해야 보인다. 마우스를 올리는 것만으로 보이게 목록을 함께 둔다.

## 결과

- 공개 타입이 늘어날 뿐 기존 props는 그대로라 patch다(CONTRIBUTING 「버전 규칙」).
- 새 공개 Component는 처음부터 OwnProps와 JSDoc 목록을 함께 쓴다. 빠뜨리면 드리프트 테스트가 진입점 export와 목록을 맞춰 보며 실패한다.
