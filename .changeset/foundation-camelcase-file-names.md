---
"@tide-design/foundation": patch
---

`dist` 안 원본 파일 이름을 camelCase로 바꿨다(`color-family.js` → `colorFamily.js` 등). 공개 import 경로(`@tide-design/foundation`, `/internal`, `/color-family`, `/tailwind-merge`, CSS 파일)는 그대로라 앱 코드는 바꿀 것이 없다. `dist` 파일 경로를 직접 import했다면 subpath로 바꾼다.
