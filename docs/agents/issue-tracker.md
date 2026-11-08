# 이슈 트래커: Local Markdown

이 저장소의 이슈, 스펙, wayfinder 지도는 `docs/progress/` 아래 markdown 파일로 관리한다. (`.scratch/`는 쓰지 않는다. 진행상황도 문서로 남기는 것이 이 프로젝트의 원칙이다.)

## 규칙

- 기능(작업 묶음)마다 디렉터리 하나: `docs/progress/<feature-slug>/`
- 스펙: `docs/progress/<feature-slug>/spec.md`
- 구현 티켓은 티켓마다 파일 하나: `docs/progress/<feature-slug>/issues/<NN>-<slug>.md`. 번호는 `01`부터 시작한다. 여러 티켓을 파일 하나에 몰아 쓰지 않는다.
- triage 상태는 이슈 파일 상단의 `Status:` 줄에 기록한다. 쓸 수 있는 값은 `triage-labels.md`를 따른다.
- 코멘트와 대화 기록은 파일 하단의 `## Comments` 제목 아래에 이어 붙인다.

## 스킬이 "이슈 트래커에 발행하라"고 할 때

`docs/progress/<feature-slug>/` 아래에 새 파일을 만든다. 디렉터리가 없으면 함께 만든다.

## 스킬이 "관련 티켓을 가져오라"고 할 때

참조된 경로의 파일을 읽는다. 사용자는 보통 경로나 이슈 번호를 직접 넘겨준다.

## Wayfinding 작업

`/wayfinder`가 사용한다. **지도(map)** 는 파일 하나이고, 티켓마다 **하위(child)** 파일이 하나씩 있다.

- **지도**: `docs/progress/<effort>/map.md`. Destination / Notes / Decisions so far / Not yet specified / Out of scope 섹션으로 구성한다.
- **하위 티켓**: `docs/progress/<effort>/issues/NN-<slug>.md`. 번호는 `01`부터 시작하고, 본문에 질문을 적는다. 티켓 유형은 `Type:` 줄에 기록한다(`research`/`prototype`/`grilling`/`task`). 상태는 `Status:` 줄에 기록한다(`claimed`/`resolved`).
- **차단 관계**: 파일 상단에 `Blocked by: NN, NN` 줄을 둔다. 여기 나열된 파일이 모두 `resolved`가 되면 차단이 풀린다.
- **프런티어**: `docs/progress/<effort>/issues/`에서 열려 있고, 차단이 풀렸고, 아무도 claim하지 않은 파일을 찾는다. 번호가 가장 작은 것부터 처리한다.
- **Claim**: 작업을 시작하기 전에 `Status: claimed`로 바꾸고 저장한다.
- **Resolve**: 답을 `## Answer` 제목 아래에 붙이고, `Status: resolved`로 바꾼 다음, `map.md`의 Decisions so far에 요약 한 줄과 링크를 추가한다.

## 리서치 결과 위치 (wayfinder 기본 동작을 바꾼 부분)

research 티켓의 결과는 `research/<name>` 브랜치에 두지 않는다. **`docs/research/<주제>.md`에 main 브랜치로 커밋한다.** 티켓의 `## Answer`에는 해당 파일 링크를 남긴다.
