# 06: radius·Elevation·포커스 표시 Foundation

Status: ready-for-agent
Blocked by: 05 (타이포그래피 Foundation과 Typography)

## What to build

앱 개발자가 radius 5단계와 그림자 3단계를 class로 쓰고, 그림자는 Theme에 따라 저절로 색이 바뀐다. 직접 만든 요소에도 `focus-visible:focus-ring`, `focus:focus-field`로 Tide 포커스 표시를 붙일 수 있다. Windows 고대비 모드에서도 raised 표면의 경계와 포커스 표시가 남는다.

## 수용 기준

### radius

- [ ] `sm` 4px, `md` 6px, `lg` 8px, `xl` 12px, `full`. 나머지 Tailwind 기본값은 지운다.

### Elevation

- [ ] `shadow-sm`/`md`/`lg`. 단계마다 2레이어이고 두 레이어 모두 `--tide-shadow-color`를 `color-mix`로 낮춰 쓴다. 값은 spec 표를 따른다.
- [ ] dark에서도 그림자를 그린다. light raised에도 투명 border 1px를 둔다.

### 포커스 표시

- [ ] `focus-ring`: `outline` 2px, offset 2px. `--tide-focus-ring-width`, `--tide-focus-ring-offset`을 둔다.
- [ ] `focus-field`: border를 focus-ring 색으로 바꾸고 늘어난 1px는 inset shadow로 그려 2px로 보이게 한다. 투명 outline을 함께 둔다.
- [ ] 둘 다 `@utility`로 노출한다.
- [ ] error 입력창에서도 포커스 중에는 focus-field가 이긴다. error+focus 조합을 명시적으로 정의한다.

### tailwind-merge

- [ ] radius, shadow 이름을 Tailwind 기본 그룹에 등록해 사용자 `className`이 이긴다(`rounded-md`, `shadow-lg`).

### 테스트

- [ ] `unit`: 컴파일한 CSS에 radius 5개, shadow 3개, `focus-ring`/`focus-field`가 있고 지운 기본값이 없다.
- [ ] `browser`(forced-colors instance): light raised 투명 border와 포커스 투명 outline이 보이는지 계산값으로 단언한다. error+focus 조합의 계산값을 단언한다.

### 문서

- [ ] radius 블록과 그림자 블록(light/dark)을 Token 원본에서 그린다.

## Comments
