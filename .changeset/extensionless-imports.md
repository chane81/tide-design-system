---
"@tide-design/foundation": patch
"@tide-design/icons": patch
"@tide-design/components": patch
---

소스의 상대 import에서 확장자(`.ts`/`.tsx`)를 뺐다(tsconfig `moduleResolution: "bundler"`). 배포 결과물(JS·d.ts)은 변경 전과 같아 동작과 공개 API는 그대로다.
