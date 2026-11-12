# 조작 요소 글자 크기를 맞춘다: `sm` 14px, Switch 라벨 body, 목록 항목 14px

근거 원칙: ① 접근성이 미려함보다 우선한다, ② 명확함이 화려함보다 우선한다

[Component API 결정](../progress/tide-v0/issues/14-grilling-component-api.md)의 size 표는 `xs`와 `sm`이 모두 `label-sm`(12/16)을 쓴다. Foundation·Component 리뷰(2026-11-12)에서 Storybook 화면을 보니 32px 높이 안의 12px 글자가 작아 보였고, 특히 Input·Select·Combobox `sm`은 사용자가 **입력한 값**까지 12px로 보였다. 12px는 읽는 글자가 아니라 보조 글자(caption, Badge `sm`) 크기다.

## 결정

### 1. `sm`은 14px

size 표의 `sm` 텍스트 스타일을 `label-sm`에서 `label-md`(14/20)로 바꾼다. 높이·padding·아이콘 크기는 그대로다.

| size | 높이 | 텍스트 스타일 (전) | 텍스트 스타일 (후) |
| ---- | ---- | ------------------ | ------------------ |
| `xs` | 24px | `label-sm`         | `label-sm`         |
| `sm` | 32px | `label-sm`         | `label-md`         |
| `md` | 40px | `label-md`         | `label-md`         |
| `lg` | 48px | `label-lg`         | `label-lg`         |

- 적용: Button `sm`, Input·Select·Combobox 트리거 `sm`(`input-style.ts`), Textarea `sm`(`caption` → `body-sm`, 한 줄일 때 글자 위아래 여백이 Input `sm`과 같도록 세로 padding 6px → 5px).
- `sm`과 `md`는 글자 크기가 같고 높이·좌우 padding으로 구분한다. 32px 안에 20px 행간이라 위아래 6px(border 포함)가 남는다.
- `xs`(24px)는 12px를 유지한다. 24px 높이에는 16px 행간이 맞고, 표·툴바 안 보조 버튼 용도라서다.
- Badge `sm`, Switch `sm`은 표시·라벨 크기 규칙이 따로 있어 이 결정에 포함하지 않는다.

### 2. Switch 라벨은 Checkbox·Radio와 같은 `body` 스타일

Switch 라벨은 `label-sm`/`label-md`/`label-lg`(500)였고 Checkbox·Radio 라벨은 `body-sm`/`body-md`(400)였다. 같은 폼에 섞으면 선택 컨트롤 라벨의 굵기와 크기(md 기준 14px·16px)가 달랐다. Switch를 `body-sm`/`body-md`/`body-lg`로 바꾼다(결정: 사용자, 2026-11-13). track 크기는 그대로이고 루트가 `items-center`라 한 줄 라벨은 track 가운데에 맞는다.

### 3. 목록 항목은 14px

Menu·Select·Combobox 목록 항목은 `body-md`(16/24, 높이 36px)였는데 트리거(Button·Select `md`)는 14px라, Select를 열면 같은 값이 커져 보였다. 항목과 Combobox 「결과 없음」을 `body-sm`(14/20, 높이 32px)으로 바꾼다(결정: 사용자, 2026-11-13). 여백(6px·8px)과 아이콘 16px은 그대로다.

## 결과

- 같은 size의 Input·Select·Button을 한 줄에 둘 때 높이는 그대로 같다(행간 20px이 32px 안에 들어감).
- Switch 라벨은 굵기가 400으로 가벼워지고 md는 14px → 16px로 커진다. 목록은 항목마다 4px 낮아진다.
- `sm` 버튼은 글자 폭이 늘어 조금 넓어진다. 고정 폭으로 배치한 앱은 확인이 필요하다(changeset에 적는다).
