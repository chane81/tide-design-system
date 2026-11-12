import { UserIcon } from "@tide-tds/icons";
import type { ComponentProps, ReactElement } from "react";

import { cn } from "./cn.ts";
import type { ColorFamilyName, Size } from "./types.ts";

// 이 파일은 hook·state·이벤트를 쓰지 않으므로 "use client"가 없다. 서버 컴포넌트에서 쓸 수 있다.
//
// 로드 실패 fallback을 JS 없이 처리하는 방식(tide-v0-impl 티켓 21):
// - 맨 아래 층에 fallback 아이콘을 늘 그리고, 그 위 층에 이미지를 CSS `background-image`로 깐다.
// - 이미지를 받으면 위 층이 아이콘을 덮는다. 받지 못하면(404, 이미지가 아닌 응답, 깨진 데이터) 배경 이미지는
//   아무것도 그리지 않으므로 아래 층의 아이콘이 그대로 보인다. 로드 결과를 JS로 알 필요가 없다.
// - `<img>`를 위 층에 두면 실패했을 때 Chromium이 깨진 이미지 아이콘과 alt 텍스트를 fallback 위에 그린다
//   (forced-colors에서도). CSS로는 이를 지울 수 없어 `<img>`를 쓰지 않는다. `Avatar.test.tsx`가 이 동작을 단언한다.
// - 그래서 이름은 `<img alt>` 대신 루트의 `role="img"` + `aria-label`로 붙인다.

/** Avatar의 size. 공통 size 4개를 모두 받는다. 높이는 spec size 표와 같다(24·32·40·48px). */
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
   * fallback 배경과 아이콘의 색 계열(Tide 색 계열 8개(장식 계열 purple·mint 포함)와 앱이 `ColorFamilyRegistry`에 더한 계열).
   * 뜻이 없는 장식 색이라 Role은 받지 않는다(ADR 0016·0017 후속). 기본값은 `gray`다.
   * 루트에 `data-color`로 붙고 바깥 요소의 색을 물려받지 않는다.
   */
  color?: ColorFamilyName;
}

// class는 문자열 그대로 적는다. Tailwind가 빌드 결과를 스캔해 class를 만들기 때문에 이름을 조합하면 안 된다.
/** 원 크기와 fallback 아이콘 크기(원의 약 60%). */
const sizeClass: Record<AvatarSize, string> = {
  xs: "size-6 [&_svg]:size-4",
  sm: "size-8 [&_svg]:size-5",
  md: "size-10 [&_svg]:size-6",
  lg: "size-12 [&_svg]:size-7",
};

// - radius는 full이다(티켓 21 수용 기준).
// - fallback 색은 accent 슬롯이다(ADR 0011). text-accent × bg-accent-subtle은 색 이름 규칙 text × subtle(4.5:1)로 검사된다.
// - overflow-hidden으로 이미지 층을 원 안에 자른다.
// - forced-colors에서는 배경이 Canvas, 아이콘이 CanvasText가 된다. 배경 이미지(url)는 브라우저가 그대로 그린다.
const baseClass =
  "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-subtle text-accent align-middle select-none [&_svg]:shrink-0";

/** 이미지 층. 아이콘 위에 원 전체를 덮고, `object-fit: cover`처럼 가운데를 채운다. */
const imageClass = "absolute inset-0 bg-cover bg-center bg-no-repeat";

/**
 * CSS `url("…")` 값을 만든다. 따옴표·역슬래시·줄바꿈을 CSS escape(`\HH `)로 바꿔 문자열 밖으로 나가지 못하게 한다.
 */
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
      {/* 아래 층: fallback 아이콘. IconBase는 이름이 없으면 aria-hidden이다. */}
      <UserIcon aria-hidden="true" />
      {/* 위 층: 이미지. 실패하면 아무것도 그리지 않는다. */}
      {src ? (
        <span aria-hidden="true" className={imageClass} style={{ backgroundImage: cssUrl(src) }} />
      ) : null}
    </span>
  );
}
