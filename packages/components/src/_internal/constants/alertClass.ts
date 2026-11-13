// Alert·Toast가 함께 쓴다. Toast는 표면만 raised로 바꾼다.
// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.

/** border는 항상 둔다. forced-colors에서 배경 없이도 영역이 남는다. */
export const alertLayoutClass = "flex items-start gap-3 rounded-lg border p-4";

/** subtle 표면(ADR 0022). 파스텔 테두리는 꾸밈이라 대비 검사에서 뺐다. */
export const alertSurfaceClass = "border-accent-subtle bg-accent-subtle text-accent-on-subtle";

/** 글자 첫 줄 높이(20px)와 같아 첫 줄 가운데에 맞는다. */
export const alertIconClass = "size-5 shrink-0";

/** 긴 단어가 닫기 버튼을 밀어내지 않게 min-w-0을 둔다. */
export const alertContentClass = "flex min-w-0 flex-1 flex-col gap-1";

/** 제목 수준은 화면마다 달라 heading 요소를 쓰지 않는다. */
export const alertTitleClass = "text-body-sm font-semibold";

export const alertDescriptionClass = "text-body-sm";

/** 닫기 버튼(24px)을 음수 margin으로 겹쳐 첫 줄 높이(20px)를 늘리지 않는다. */
export const alertCloseClass = "-my-0.5 -me-1";

/** subtle 바탕 위 닫기 버튼. ghost 기본 색을 on-subtle·subtle-hover·subtle-active로 덮어쓴다(ADR 0022·0023). */
export const alertSubtleCloseClass =
  "text-accent-on-subtle hover:bg-accent-subtle-hover active:bg-accent-subtle-active";
