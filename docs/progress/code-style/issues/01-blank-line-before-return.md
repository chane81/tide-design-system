# 01: `return` 앞 빈 줄

Status: done
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

- [x] `pnpm lint`가 새 규칙을 포함해 통과한다(경고 없음, `--deny-warnings`).
- [x] `pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm format:check`, `pnpm smoke`가 통과한다. oxfmt가 추가된 빈 줄을 지우지 않는다.
- [x] 변경은 빈 줄 추가와 설정뿐이다(`git diff -w --stat`으로 확인).
- [x] changeset: 배포 패키지 소스가 바뀌므로 해당 패키지 patch(동작 변화 없음).

## Comments

- 의존성: catalog에 `@stylistic/eslint-plugin: ^5.10.0`(2026-03-06 배포), `eslint: ^10.14.0`(2026-10-30 배포)을 더하고 루트 devDependency로 `"catalog:"`. `@stylistic`의 peer `eslint`(^9 || ^10)는 빼 두면 pnpm 12.18.0이 자동 설치(그때 최신 10.14.0)했다. catalog 밖에서 버전이 정해지지 않게 명시했다. 두 버전 모두 `minimumReleaseAge`(1440분)를 넘는다.
- 설치 후 다시 확인: `pnpm lint`가 새 규칙 위반을 `@stylistic(padding-line-between-statements)`로 보고했고, `pnpm exec oxlint --fix`가 고쳤다.
- 수정 결과: 111개 파일, 빈 줄 242줄 추가. `git diff -w --ignore-blank-lines`가 비어 있다(`-w`만으로는 빈 줄 추가가 남아 보여서 `--ignore-blank-lines`도 붙였다). 배포 패키지별 파일 수는 components 49, foundation 16, icons 4. 나머지는 apps/docs 34, apps/smoke-next 1, scripts 7.
- 규칙이 기대와 다르게 고친 곳은 없다. `return` 바로 위에 주석이 있는 5곳(apps/docs `ContrastPairs.tsx`, components `listCollection.ts`, foundation `colorCss.ts`, icons `scripts/generate.ts`, `scripts/release-notes.ts`)은 문서대로 빈 줄이 주석 위에 들어갔다. 짧은 화살표 함수 블록 안의 `return`도 앞에 문장이 있으면 띄웠는데, 티켓 의도와 같다.
- `pnpm format:check` 통과: oxfmt 0.77.0은 추가된 빈 줄을 지우지 않는다.
- changeset: `.changeset/blank-line-before-return.md`(foundation·icons·components patch). `apps/docs`도 바뀌었지만 CONTRIBUTING.md 「버전 규칙」대로 TDS changeset 하나로 검사가 통과하므로 docs changeset은 넣지 않았다.
