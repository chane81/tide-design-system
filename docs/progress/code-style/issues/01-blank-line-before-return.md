# 01: `return` 앞 빈 줄

Status: ready-for-agent
Blocked by: 구조 이행 06 ([project-structure/issues/06](../../project-structure/issues/06-components-split-files.md))

## What to build

`return` 앞에 다른 문장이 있으면 빈 줄 하나로 띄운다. 블록의 첫 문장인 `return`은 그대로 둔다. lint 규칙으로 강제하고 기존 코드는 `--fix`로 한 번에 고친다.

```tsx
// ❌
const value = useMemo(() => ({ state }), [state]);
return <MenuContext value={value}>{children}</MenuContext>;

// ✅
const value = useMemo(() => ({ state }), [state]);

return <MenuContext value={value}>{children}</MenuContext>;
```

## 방법 (2026-11-13 확인)

- oxlint 1.92.0에는 이 규칙이 없다. JS 플러그인(`jsPlugins`, alpha)으로 `@stylistic/eslint-plugin` 5.10.0의 `padding-line-between-statements`를 쓴다. oxlint는 JS 플러그인의 fixer를 `--fix`로 적용한다(oxc.rs linter 문서 automatic-fixes·js-plugins).
- 설정: `{ "blankLine": "always", "prev": "*", "next": "return" }` (eslint-stylistic 규칙 문서). `return` 바로 위 주석이 있으면 빈 줄은 주석 위로 들어간다.
- 임시 프로젝트에서 oxlint 1.92.0 + @stylistic 5.10.0으로 감지·`--fix` 동작을 확인했다. `@stylistic`은 `eslint`(^9 || ^10)를 peer로 요구한다.

## 할 일

- `pnpm-workspace.yaml` catalog에 `@stylistic/eslint-plugin`(필요하면 peer `eslint`)을 더하고 루트 devDependency로 `"catalog:"` 지정. `catalogMode: strict`, `minimumReleaseAge`는 그대로.
- 루트 `.oxlintrc.json`에 `jsPlugins`와 규칙을 `error`로 더한다.
- `pnpm exec oxlint --fix`로 저장소 전체에 적용하고, 수정 결과만 담은 커밋을 따로 만든다(설정 커밋과 분리).
- 규칙이 의도와 다르게 고친 곳(예: 한 줄짜리 화살표 함수 블록)이 있으면 Comments에 적는다.

## 수용 기준

- [ ] `pnpm lint`가 새 규칙을 포함해 통과한다(경고 없음, `--deny-warnings`).
- [ ] `pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm format:check`, `pnpm smoke`가 통과한다. oxfmt가 추가된 빈 줄을 지우지 않는다.
- [ ] 변경은 빈 줄 추가와 설정뿐이다(`git diff -w --stat`으로 확인).
- [ ] changeset: 배포 패키지 소스가 바뀌므로 해당 패키지 patch(동작 변화 없음).
