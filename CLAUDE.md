# Tide Design System

`#148cfc`(blue)를 primary로 삼아 확장하는 디자인 시스템. 원칙(principles), 파운데이션(foundations), 컴포넌트(components) 세 층으로 구성한다.

- 테크 스택: vite, vitest, storybook, pnpm, typescript, oxlint, oxfmt
- 한 번에 만들지 않는다. 리서치, 진행상황, 결정은 모두 `docs/` 아래 분류별 폴더에 md로 남긴다(구조는 `docs/agents/domain.md` 참고).
- 문서와 주석은 한글로 작성한다.
- 파일·폴더 배치는 `.claude/rules/monorepo-structure.md`를 따른다(콜로케이션, 폴더 이름 `components`·`hooks`·`libs`·`constants`).
- 코드 주석은 `.claude/rules/code-comments.md`를 따른다(코드로 안 보이는 이유·제약만 1~2줄).

## Agent skills

### Issue tracker

Local markdown 트래커를 `docs/progress/` 아래에 둔다. 리서치 결과는 `docs/research/`에 커밋한다. See `docs/agents/issue-tracker.md`.

### Triage labels

기본 라벨 다섯 개(`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`)를 `Status:` 줄에 쓴다. See `docs/agents/triage-labels.md`.

### Domain docs

single-context 구조: 루트에 `GLOSSARY.md`, ADR은 `docs/decisions/`. See `docs/agents/domain.md`.
