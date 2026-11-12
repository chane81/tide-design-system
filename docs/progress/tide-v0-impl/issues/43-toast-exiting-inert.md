# 43: 퇴장 중 Toast에 inert

Status: ready-for-agent
Blocked by: 34 (Toast)

## What to build

닫히는 Toast는 퇴장 전환(fast, 150ms) 동안 DOM에 남는다. 지금은 이때 역할만 빠지고 `inert`가 없어서, 키보드와 보조기술이 닫히는 Toast 안의 버튼(액션·닫기)에 닿을 수 있다. 퇴장 중 Toast를 `inert`로 만들어 이 구간에 상호작용하지 못하게 한다. 2026-11-12 보정 일괄 검토에서 정했다(review-backlog 34절).

## 수용 기준

- [ ] 퇴장 전환이 진행되는 동안 그 Toast 요소가 `inert`다. 안의 버튼에 Tab으로 닿지 않고 눌러도 동작하지 않는다.
- [ ] 퇴장 중 Toast가 영역 안의 다른 Toast 포커스 이동(`useToastRegion`의 다음 Toast 찾기)을 방해하지 않는다. 닫은 뒤 포커스가 지금처럼 이동한다.
- [ ] 다시 열리는 경우가 없음을 확인하거나, 있으면 `inert`를 해제한다.
- [ ] 테스트: 퇴장 중 `inert` 단언, Tab 이동 단언. 전환 중 값은 `test/motion.ts` helper로 읽는다(`docs/agents/testing.md`).
- [ ] changeset(components patch).

## Comments
