# components 패키지의 공용 비공개 코드는 `src/_internal/`에 모은다

근거 원칙: ④ 발견할 수 있음이 외워야 함보다 우선한다, ② 명확함이 화려함보다 우선한다

[ADR 0029](0029-components-always-folders.md)로 공개 Component가 모두 폴더가 되면, `packages/components/src/`에 Component 폴더 30여 개와 공용 폴더 `components`·`constants`·`hooks`·`libs`가 같은 높이에 놓인다. 대소문자를 가리지 않는 정렬에서는 `Combobox/`, `components/`, `constants/`, `Dialog/`처럼 섞여 보이고, `src/components/`는 내부 Component 둘뿐인데 "공개 Component 모음"처럼 읽힌다(2026-11-13, 사용자 결정).

## 결정

- 여러 Component가 함께 쓰는 비공개 코드는 `src/_internal/{components,hooks,libs,constants}`에 둔다. `src/` 바로 아래에는 `index.ts`, `styles.css`, `types.ts`, `_internal/`, 공개 Component 폴더만 남는다.
- 승격 사다리는 Component 폴더 → `_internal/` → 다른 패키지다.
- `_internal/`은 진입점에서 통째로 재수출하지 않는다. 공개해야 하는 것(`cn`)은 `src/index.ts`가 이름을 골라 재수출한다.
- `_internal/`은 `packages/components`에만 둔다. 공개 Component 폴더가 없는 다른 패키지·문서 앱은 지금처럼 `src/{components,hooks,libs,constants}`를 쓴다.

## 고려한 대안

- **`internal/`(밑줄 없음):** 이름은 깔끔하지만 대소문자를 가리지 않는 정렬에서 `IconButton/`과 `Link/` 사이에 끼어 섞인다.
- **분류별 묶음(`inputs/`, `overlays/` 등):** Select처럼 두 분류에 걸치는 Component가 있어 고를 때마다 판단이 갈린다. Storybook 사이드바도 분류 없이 한 줄로 나열한다.
- **계열별 공통 부모(`overlay/`, `choice/`):** `listClass`·`useFieldControl`처럼 여러 계열이 함께 쓰는 코드가 있어 계열끼리 겹친다.
- **`shared/`·`common/`:** 쓰임새가 아니라 "공용"이라는 뜻만 담겨 무엇이든 들어가기 쉽다(구조 규칙 1).

## 결과

- 기존 공용 폴더를 옮기는 작업은 [구조 이행 티켓 05](../progress/project-structure/issues/05-components-internal-folder.md)에서 한다. 공개 API와 공개 import 경로는 바뀌지 않는다.
- `dist` 경로가 `dist/hooks/…`에서 `dist/_internal/hooks/…`로 바뀌므로, 이 경로를 직접 적은 smoke 검사 목록도 함께 고친다.
