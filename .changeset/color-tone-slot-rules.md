---
"@tide-tds/foundation": minor
---

슬롯 규칙을 넓히고 새 슬롯과 무채색 호버 Token을 더했습니다(ADR 0022). 기존 Token·Utility class 이름은 그대로라 코드는 깨지지 않지만 화면 색이 달라집니다.

- 새 슬롯 `faint`(가장 옅은 바탕), `on-subtle`(subtle·faint 위 글자), `subtle-border`(파스텔 테두리)가 생겼습니다. accent Utility class `bg-accent-faint`, `text-accent-on-subtle`, `border-accent-subtle`과 Role Token `bg-<role>-faint`, `text-<role>-on-subtle`, `border-<role>-subtle`을 씁니다. neutral의 `on-subtle`은 `text-default`입니다.
- 호버·클릭은 단계를 바꾸지 않고 덮습니다. light subtle은 100에 gray-950을 4%·8%, dark subtle은 950에 white를 6%·10%, solid는 600에 black을 14%·20% 덮은 값입니다. dark `faint`는 gray-950과 950을 반씩 섞은 값입니다. 모두 빌드할 때 hex로 계산해 CSS에 넣습니다.
- `text`는 light 700, dark 300이 되었고 light `subtle`은 100이 되었습니다.
- 색이 없는 바탕의 호버·클릭용 공통 Token `bg-hover`·`bg-active`를 더했습니다(light gray-950 4%·8%, dark white 6%·10%).
- `defineColorFamily`의 덮어쓸 값에 덮기·섞기를 쓸 수 있고, `tide-color build`의 대비 검사가 새 쌍(on-subtle × faint·subtle 3단계, text × bg-hover·bg-active)으로 돕니다.
- 대비 쌍은 light·dark 모두 기존 기준(텍스트 4.5:1, UI 3:1)을 통과합니다. 파스텔 테두리는 꾸밈이라 검사에서 뺐습니다.
