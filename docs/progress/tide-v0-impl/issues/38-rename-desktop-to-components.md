# 38: `@tide-tds/desktop`을 `@tide-tds/components`로 바꾸기

Status: ready-for-agent
Blocked by: 37 (Storybook 브라우저 점검과 문서 문체 개편)

## What to build

앱 개발자가 React Component를 `@tide-tds/components` 하나에서 받는다. Target(desktop/mobile)으로 패키지를 나누지 않는다. 터치 환경을 위한 크기나 밀도는 나중에 같은 패키지 안의 size·밀도 옵션으로 다룬다. 2026-11-10 사용자 결정으로 ADR 0006의 Target 패키지 결정을 바꾼다. npm에 아직 배포하지 않았으므로 첫 publish(12) 전에 처리한다.

## 수용 기준

- [ ] `packages/desktop` → `packages/components`, 패키지 이름 `@tide-tds/components`. exports, `publishConfig.exports`, 개발용 조건 `@tide-tds/source`, `repository.directory`, LICENSE를 맞춘다.
- [ ] 저장소의 모든 참조(앱, smoke, docs, changesets 설정·기존 changeset, CI, turbo, CONTRIBUTING, spec, 티켓 본문, research 문서)를 바꾼다. 과거 기록(완료 티켓 Comments, 머지된 ADR 본문)은 사실 기록이므로 고치지 않는다.
- [ ] 새 ADR로 ADR 0006을 대체한다(Target 패키지를 두지 않는 이유, 터치·밀도는 옵션으로). ADR 0006에는 대체되었다는 표시만 단다.
- [ ] GLOSSARY의 Target 항목을 새 결정에 맞춘다.
- [ ] 문서에서 "데스크톱 밀도의 웹 React Component이고 모바일 브라우저에서도 동작한다" 같은 Target 설명을 정리한다.
- [ ] changeset을 넣는다(CONTRIBUTING 규칙).
- [ ] lint, format, dist 삭제 후 `pnpm turbo run typecheck test build smoke --force`, changeset 검사가 통과한다.

## Comments
