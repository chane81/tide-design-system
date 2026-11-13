import { UserIcon } from "@tide-design/icons";
import type { ComponentProps, ReactElement } from "react";

import { cn } from "../_internal/libs/cn";
import type { ColorFamilyName, Size } from "../types";

// 아이콘 위에 이미지를 CSS 배경으로 깔아, 로드에 실패하면 JS 없이 아래 아이콘이 보이게 한다. `<img>`는 실패 시
// Chromium이 깨진 아이콘·alt를 그리고 CSS로 지울 수 없어 쓰지 않는다. 그래서 이름은 루트 `role="img"`로 붙인다.
type AvatarSize = Extract<Size, "xs" | "sm" | "md" | "lg">;

export interface AvatarProps extends Omit<
  ComponentProps<"span">,
  "color" | "children" | "role" | "aria-label"
> {
  /** 사용자 이미지 주소. 없거나 빈 문자열이거나 불러오지 못하면 fallback 아이콘이 보인다. */
  src?: string;
  /**
   * 대체 텍스트(보통 사람 이름). 필수다. 주면 루트가 `role="img"`가 되고 이 텍스트가 이름이 된다.
   * 옆에 이름이 이미 적혀 있는 장식용이면 `""`를 주어 읽히지 않게 한다. 이미지가 없어도 같다.
   */
  alt: string;
  /** `xs` 24px, `sm` 32px, `md` 40px, `lg` 48px. 기본값은 `md`다. */
  size?: AvatarSize;
  /**
   * fallback 배경과 아이콘의 색 계열(Tide 색 계열 + 앱이 `ColorFamilyRegistry`에 더한 계열). 기본값 `gray`.
   * 장식 색이라 Role은 받지 않는다. 바깥 요소의 색을 물려받지 않는다.
   */
  color?: ColorFamilyName;
}

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔한다.
const sizeClass: Record<AvatarSize, string> = {
  xs: "size-6 [&_svg]:size-4",
  sm: "size-8 [&_svg]:size-5",
  md: "size-10 [&_svg]:size-6",
  lg: "size-12 [&_svg]:size-7",
};

// fallback 글자·배경 대비는 on-subtle × subtle 규칙으로 검사된다(ADR 0022).
const baseClass =
  "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-subtle text-accent-on-subtle align-middle select-none [&_svg]:shrink-0";

const imageClass = "absolute inset-0 bg-cover bg-center bg-no-repeat";

/** 따옴표·역슬래시·줄바꿈을 CSS escape(`\HH `)로 바꿔 `src`가 `url("…")` 문자열 밖으로 나가지 못하게 한다. */
function cssUrl(src: string): string {
  const escaped = src.replace(/["\\\n\r\f]/g, (char) => `\\${char.charCodeAt(0).toString(16)} `);

  return `url("${escaped}")`;
}

/**
 * 사용자 이미지를 원 안에 보여 준다. 이미지가 없거나 불러오지 못하면 fallback 아이콘이 보인다.
 * 누르는 동작이 없다. 클릭이 필요하면 Button이나 IconButton 안에 넣는다. 서버 컴포넌트로 쓸 수 있다.
 */
export function Avatar({
  src,
  alt,
  size = "md",
  color = "gray",
  className,
  ...props
}: AvatarProps): ReactElement {
  const named = alt !== "";

  return (
    <span
      {...props}
      // 장식용(alt="")이면 역할과 이름이 없다. 안의 아이콘·이미지 층은 모두 숨겨져 아무것도 읽히지 않는다.
      {...(named ? { role: "img", "aria-label": alt } : {})}
      // 색은 항상 붙인다(기본 gray). 바깥 data-color를 물려받지 않게 한다(ADR 0011).
      data-color={color}
      className={cn(baseClass, sizeClass[size], className)}
    >
      <UserIcon aria-hidden="true" />
      {src ? (
        <span aria-hidden="true" className={imageClass} style={{ backgroundImage: cssUrl(src) }} />
      ) : null}
    </span>
  );
}
