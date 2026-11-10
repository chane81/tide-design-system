# 38: `@tide-tds/desktop`을 `@tide-tds/components`로 바꾸기

Status: done
Blocked by: 37 (Storybook 브라우저 점검과 문서 문체 개편)

## What to build

앱 개발자가 React Component를 `@tide-tds/components` 하나에서 받는다. Target(desktop/mobile)으로 패키지를 나누지 않는다. 터치 환경을 위한 크기나 밀도는 나중에 같은 패키지 안의 size·밀도 옵션으로 다룬다. 2026-11-10 사용자 결정으로 ADR 0006의 Target 패키지 결정을 바꾼다. npm에 아직 배포하지 않았으므로 첫 publish(12) 전에 처리한다.

## 수용 기준

- [x] `packages/desktop` → `packages/components`, 패키지 이름 `@tide-tds/components`. exports, `publishConfig.exports`, 개발용 조건 `@tide-tds/source`, `repository.directory`, LICENSE를 맞춘다.
- [x] 저장소의 모든 참조(앱, smoke, docs, changesets 설정·기존 changeset, CI, turbo, CONTRIBUTING, spec, 티켓 본문, research 문서)를 바꾼다. 과거 기록(완료 티켓 Comments, 머지된 ADR 본문)은 사실 기록이므로 고치지 않는다.
- [x] 새 ADR로 ADR 0006을 대체한다(Target 패키지를 두지 않는 이유, 터치·밀도는 옵션으로). ADR 0006에는 대체되었다는 표시만 단다.
- [x] GLOSSARY의 Target 항목을 새 결정에 맞춘다.
- [x] 문서에서 "데스크톱 밀도의 웹 React Component이고 모바일 브라우저에서도 동작한다" 같은 Target 설명을 정리한다.
- [x] changeset을 넣는다(CONTRIBUTING 규칙).
- [x] lint, format, dist 삭제 후 `pnpm turbo run typecheck test build smoke --force`, changeset 검사가 통과한다.

## Comments

### 2026-11-10 구현 기록

**한 일**

- `git mv packages/desktop packages/components`. `package.json`의 `name`, `description`, `repository.directory`를 바꿨다. exports·`publishConfig.exports`·`@tide-tds/source` 조건과 tsdown·vitest·tsconfig 설정은 상대 경로라 그대로 동작한다. LICENSE에는 패키지 이름이 없어 고칠 것이 없었다.
- 앱(docs, smoke-next)의 의존성·import·`@source` 경로, `scripts/check-changesets.ts`·`scripts/release-notes.ts`·smoke 스크립트의 패키지 목록, CI·release workflow의 playwright 필터, 기존 changeset(`spinner.md`)의 키를 바꾸고 pnpm-lock을 다시 만들었다(새 패키지 받기 없음, `minimumReleaseAge` 그대로). `.changeset/config.json`은 `@tide-tds/*` glob이라 고칠 것이 없었다. turbo 설정에는 패키지 이름이 없었다.
- Storybook 문서(설치, 폰트 로드, 아이콘), CONTRIBUTING, spec, 지도(배포 목표, Out of scope), 티켓 12 수용 기준, research 문서를 고쳤다.
- [ADR 0009](../../../decisions/0009-single-components-package.md)를 쓰고 ADR 0006 맨 위에 대체 표시를 달았다. 원칙 문서의 「원칙에서 나온 결정」에 0009를 더했다.
- changeset은 empty(`rename-components.md`)로 넣었다. 배포된 적 없는 이름을 바꾼 것이라 0.1.0 사용자에게 알릴 변화가 없다(CONTRIBUTING 「릴리스가 필요 없을 때」).

**판단**

- GLOSSARY Target 항목은 지웠다. 정의가 "Component 묶음이 겨냥하는 사용 환경"인데, Component 묶음을 사용 환경으로 나누는 개념 자체가 없어졌다. 정의만 바꿔 남기면 나중에 밀도 옵션을 Target이라고 부를 여지가 생긴다. 밀도 옵션의 용어는 그 옵션을 정할 때 새로 정한다.
- "데스크톱 밀도의 웹 React Component이고 모바일 브라우저에서도 동작한다" 설명은 ADR 0006 Consequences와 GLOSSARY Target에만 있었다. 앞은 머지된 ADR 본문이라 두고, 뒤는 항목째 지웠다. Storybook 문서에는 이 설명이 없었다.
- research 문서(release, testing, storybook)는 맨 위에 이름 변경 안내를 달았다. 실험 환경 설명과 도구 출력(예: changesets 경고 문구)은 그때 쓴 이름 그대로 두고, 분석·제안 문장만 새 이름으로 고쳤다.
- 그대로 둔 desktop: 완료 티켓(01~11, 36, 37)과 tide-v0 resolved 티켓 본문·Comments, 지도 「Decisions so far」와 tide-v0-impl README의 완료 티켓 요약, 머지된 ADR 0002·0006·0007·0008 본문, 티켓 12의 `Blocked by`(이 티켓 제목), Primer 원칙 인용("desktop experiences")의 일반 낱말.

**검증**

- `pnpm lint`, `pnpm format:check` 통과.
- `rm -rf packages/*/dist apps/*/storybook-static` 후 `pnpm turbo run typecheck test build smoke --force`: 15개 태스크 통과(foundation 364, icons 18, components 126, docs 57 테스트, smoke 통과).
- `node scripts/check-changesets.ts main`: 통과(새 changeset 2개: rename-components, spinner).
