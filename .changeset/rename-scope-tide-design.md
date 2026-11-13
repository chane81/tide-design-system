---
"@tide-design/foundation": minor
"@tide-design/icons": minor
"@tide-design/components": minor
---

npm 패키지 이름을 `@tide-tds/*`에서 `@tide-design/*`로 바꿨다. 옛 패키지를 지우고 새 이름으로 설치한 뒤, import와 CSS `@import` 경로의 `@tide-tds/`를 `@tide-design/`로 바꾼다.

```sh
pnpm remove @tide-tds/components @tide-tds/icons
pnpm add @tide-design/components @tide-design/icons
```

```css
@import "@tide-design/components/styles.css";
```

CSS 변수(`--tide-*`), Utility class, Component와 props 이름은 그대로다.
