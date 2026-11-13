---
"@tide-design/components": patch
---

공개 Component를 Component마다 폴더 하나(`Button/Button.js` 등)로 옮기고, 여러 Component가 함께 쓰는 비공개 코드(`components`·`hooks`·`libs`·`constants`)를 `_internal/` 아래로 모았다. `dist` 안 파일 배치가 바뀌었지만 공개 import 경로(`@tide-design/components`, `@tide-design/components/styles.css`)와 export 이름, Component 동작은 그대로다.
