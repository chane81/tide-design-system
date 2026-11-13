# @tide-tds/icons

## 0.11.3

### 기능 추가와 수정 (patch)

- [#65](https://github.com/chane81/tide-design-system/pull/65) [`f6849f8`](https://github.com/chane81/tide-design-system/commit/f6849f8688cc4fd073b73c3806c0ea37d3190cfc) [@chane81](https://github.com/chane81) - 공개 타입·Token의 JSDoc을 1~2줄로 다듬었다. 동작과 공개 API는 그대로다.

- [#59](https://github.com/chane81/tide-design-system/pull/59) [`1cba8b7`](https://github.com/chane81/tide-design-system/commit/1cba8b746955c959f62103b6f72e16ab17112349) [@chane81](https://github.com/chane81) - 소스의 상대 import에서 확장자(`.ts`/`.tsx`)를 뺐다(tsconfig `moduleResolution: "bundler"`). 배포 결과물(JS·d.ts)은 변경 전과 같아 동작과 공개 API는 그대로다.

## 0.11.2

### 기능 추가와 수정 (patch)

- [#58](https://github.com/chane81/tide-design-system/pull/58) [`a871bce`](https://github.com/chane81/tide-design-system/commit/a871bce14db131018dca0744fbc2c13721514a49) [@chane81](https://github.com/chane81) - 소스에서 `return` 앞에 빈 줄을 넣었다(lint 규칙 `padding-line-between-statements`). 빈 줄만 바뀌어 동작과 공개 API는 그대로다.

## 0.11.1

변경 없음. 다른 Tide 패키지와 같은 버전으로 맞췄다.

## 0.11.0

### 호환되지 않는 변경 (minor)

- [#45](https://github.com/chane81/tide-design-system/pull/45) [`495e135`](https://github.com/chane81/tide-design-system/commit/495e135327108dd2c401edf99bb771e2327f0894) [@chane81](https://github.com/chane81) - npm 패키지 이름을 `@tide-tds/*`에서 `@tide-design/*`로 바꿨다. 옛 패키지를 지우고 새 이름으로 설치한 뒤, import와 CSS `@import` 경로의 `@tide-tds/`를 `@tide-design/`로 바꾼다.

  ```sh
  pnpm remove @tide-tds/components @tide-tds/icons
  pnpm add @tide-design/components @tide-design/icons
  ```

  ```css
  @import "@tide-design/components/styles.css";
  ```

  CSS 변수(`--tide-*`), Utility class, Component와 props 이름은 그대로다.

## 0.10.0

변경 없음. 다른 Tide 패키지와 같은 버전으로 맞췄다.

## 0.9.1

변경 없음. 다른 Tide 패키지와 같은 버전으로 맞췄다.

## 0.9.0

변경 없음. 다른 Tide 패키지와 같은 버전으로 맞췄다.

## 0.8.0

변경 없음. 다른 Tide 패키지와 같은 버전으로 맞췄다.

## 0.7.0

변경 없음. 다른 Tide 패키지와 같은 버전으로 맞췄다.

## 0.6.0

변경 없음. 다른 Tide 패키지와 같은 버전으로 맞췄다.

## 0.5.1

변경 없음. 다른 Tide 패키지와 같은 버전으로 맞췄다.

## 0.5.0

변경 없음. 다른 Tide 패키지와 같은 버전으로 맞췄다.

## 0.4.0

변경 없음. 다른 Tide 패키지와 같은 버전으로 맞췄다.

## 0.3.2

변경 없음. 다른 Tide 패키지와 같은 버전으로 맞췄다.

## 0.3.1

변경 없음. 다른 Tide 패키지와 같은 버전으로 맞췄다.

## 0.3.0

변경 없음. 다른 Tide 패키지와 같은 버전으로 맞췄다.

## 0.2.1

변경 없음. 다른 Tide 패키지와 같은 버전으로 맞췄다.

## 0.2.0

변경 없음. 다른 Tide 패키지와 같은 버전으로 맞췄다.

## 0.1.0

### 호환되지 않는 변경 (minor)

- [`81183fd`](https://github.com/chane81/tide-design-system/commit/81183fdd015ecf3c197ebe410fb9a4d9dc8a801b) [@chane81](https://github.com/chane81) - Tide 첫 공개 릴리스입니다. `@tide-tds/components` 하나를 설치하면 Foundation과 아이콘이 함께 설치됩니다. 설치 방법은 문서 사이트의 「시작하기」를 따릅니다.

  - `@tide-tds/foundation`: 컬러(Role 6개, light/dark Theme, 대비 검사), 타이포그래피, radius·그림자·포커스 표시, 움직임·쌓임 단계 Token과 Tailwind CSS 연동, tailwind-merge 설정을 제공합니다.
  - `@tide-tds/icons`: Lucide 기반 아이콘 2,029개를 Tide 이름(`PlusIcon` 등)으로 제공합니다. 쓰지 않는 아이콘은 번들에 들어가지 않습니다.
  - `@tide-tds/components`: `VisuallyHidden`, `Typography`, `Spinner`를 제공합니다. 모두 서버 컴포넌트로 쓸 수 있습니다.
