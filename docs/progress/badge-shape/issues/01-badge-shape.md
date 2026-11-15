# 01: Badge에 `shape` prop 더하기

Status: resolved

## What to build

`Badge`에 `shape?: "rounded" | "pill"`을 더한다. 기본값 `rounded`는 지금 모양(`rounded-sm`, 4px)이고 `pill`은 `rounded-full`이다. 이름은 `Badge` 그대로 둔다(사용자 결정 2026-11-15).

## 할 일

- [x] components: `BadgeShape` 타입, `shape` JSDoc, `shapeClass` 맵. `baseClass`의 `rounded-sm`을 맵으로 옮긴다. JSDoc의 Tide props 목록에 `shape`를 더한다.
- [x] `pill` 좌우 여백 한 단계 늘리기(`sm` 6→8px, `md` 8→10px)
- [x] 테스트: 기본값 rounded, pill class·radius·높이, pill 여백, `round` 값 타입 오류
- [x] 문서: Storybook 예시(controls 포함)·MDX「모양 바꾸기」·Don't(모양 섞기), GLOSSARY Badge 항목
- [x] changeset(`@tide-design/components` minor)

## 판단한 곳

- prop 이름은 `variant`가 아니라 `shape`다. Badge의 `variant`는 이미 강도(subtle·faint·solid)다.
- 값 이름은 `round`를 쓰지 않는다. 원(circle)과 헷갈린다.
- `BadgeShape`는 내보내지 않는다. `BadgeVariant`·`BadgeSize`도 공개하지 않고 `BadgeOwnProps`·`BadgeProps`만 공개하는 관례를 따른다(ADR 0031). 필요하면 `BadgeProps["shape"]`로 꺼낸다.
- `pill` 여백은 Storybook에서 눈으로 확인하지 못해 늘리는 쪽으로 구현했다. 양끝 반원이 글자 쪽으로 파고들어 같은 여백이면 좁아 보인다. 여백은 shape×size 맵(`paddingClass`)으로 두어 `sizeClass`에서 뺐다. PR에서 확인을 요청한다.

## 범위 밖

- 아이콘 모서리에 붙는 숫자·점 배지(위치 기준, `99+` 줄임, 스크린리더 문구)
- Tag에 `shape` 넣기
