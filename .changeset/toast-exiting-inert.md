---
"@tide-tds/components": patch
---

닫히는 Toast는 퇴장 전환(150ms) 동안 `inert`가 되어, 안의 액션·닫기 버튼에 Tab·포커스·누름이 닿지 않는다. 닫은 뒤 옆 Toast로 가는 포커스 이동은 그대로다. 보이는 수(`maxVisible`)를 넘어 밀려났다가 다시 보이는 Toast는 `inert`가 풀린다.
