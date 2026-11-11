---
"@tide-tds/components": patch
---

`Skeleton`과 `Progress`를 추가했습니다. 둘 다 `"use client"`가 없어 서버 컴포넌트에서 바로 씁니다. `Skeleton`은 내용이 오기 전 자리를 회색 모양으로 표시하고(`aria-hidden`이라 읽히지 않음), 깜빡임은 움직임 줄이기에서 멈춥니다. `variant`(`text` 기본, 높이 1em/`rect`, 높이는 `className`/`circle`), `size`(`circle`에만, Avatar와 같은 `xs` 24px~`lg` 48px, 기본 `md`)를 받습니다. `Progress`는 값을 아는 진행을 막대로 보여 주는 `role="progressbar"`이고 `aria-valuenow`·`aria-valuemin`·`aria-valuemax`를 노출합니다. `value`(필수, 0~`max`로 자름), `max`(기본 100), `size`(`sm` 4px/`md` 8px, 기본 `md`), `color`(Role만, 앱 Role 포함, 기본 `primary`)를 받고, `aria-label`이나 `aria-labelledby` 중 하나가 타입상 필수입니다. 값을 모르는 진행(indeterminate)은 두지 않으니 Spinner를 씁니다. 움직임 줄이기에서도 진행 표시는 그대로이고 너비 전환만 빠집니다.
