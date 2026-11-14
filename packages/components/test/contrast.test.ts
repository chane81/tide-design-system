// 각 Component가 쓰는 색이 대비 쌍에 등록됐는지와 하한 등급(ADR 0023)만 본다. 대비비는 foundation이 검사한다.
import { contrastPairs } from "@tide-design/foundation";
import {
  checkColorContrast,
  colorContrastRules,
  colorFamilyNames,
  colorSlotHex,
  contrastExclusions,
} from "@tide-design/foundation/internal";
import { describe, expect, it } from "vitest";

const surfaces = ["bg-canvas", "bg-surface", "bg-raised"] as const;

/** 등록된 쌍인지. 반투명 배경(bg-hover·bg-active)은 아래 표면(`surface`)까지 같아야 한다. */
const registered = (
  foreground: string,
  background: string,
  minRatio: number,
  surface?: string,
): boolean =>
  contrastPairs.some(
    (pair) =>
      pair.foreground === foreground &&
      pair.background === background &&
      pair.minRatio === minRatio &&
      pair.surface === surface,
  );

/** 색 이름 규칙(colorContrastRules)에 있는지. 앱 Role·앱 계열은 tide-color가 같은 규칙으로 검사한다. */
const ruled = (foreground: string, background: string, minRatio: number): boolean =>
  colorContrastRules.some(
    (r) => r.foreground === foreground && r.background === background && r.minRatio === minRatio,
  );

/** neutral on-subtle × subtle-active는 목록 선택 유지 바탕이기도 해서 4.5로 등록되어 있다. */
const subtleActiveRatio = (role: string): number => (role === "neutral" ? 4.5 : 4);

/** Tide 색 계열 8개가 색 이름 규칙의 그 짝들을 light·dark에서 통과하는지 */
function familiesPass(pairs: readonly (readonly [string, string])[]): void {
  for (const family of colorFamilyNames) {
    const used = checkColorContrast({
      light: colorSlotHex(family, "light"),
      dark: colorSlotHex(family, "dark"),
    }).filter((result) =>
      pairs.some(([fg, bg]) => result.foreground === fg && result.background === bg),
    );
    expect(used, family).toHaveLength(pairs.length * 2);
    expect(
      used.filter((result) => !result.pass),
      family,
    ).toEqual([]);
  }
}

describe("Link 글자색 대비 쌍", () => {
  // neutral은 역할 text가 없어 text-default다.
  const roleText = [
    "text-default",
    "text-primary",
    "text-success",
    "text-warning",
    "text-danger",
    "text-info",
  ];

  it.each(roleText)("%s × 표면 층 3개가 4.5:1로 등록되어 있다", (foreground) => {
    for (const background of surfaces) {
      expect(registered(foreground, background, 4.5), `${foreground} × ${background}`).toBe(true);
    }
  });

  it("앱 Role은 text 슬롯 × 표면 층 규칙(4.5:1)으로 검사된다(tide-color가 같은 규칙을 쓴다)", () => {
    for (const background of surfaces) {
      expect(
        colorContrastRules.some(
          (rule) =>
            rule.foreground === "text" && rule.background === background && rule.minRatio === 4.5,
        ),
        `text × ${background}`,
      ).toBe(true);
    }
  });

  it("포커스 표시(outline-focus) × 표면 층이 3:1로 등록되어 있다", () => {
    for (const background of surfaces) {
      expect(registered("outline-focus", background, 3)).toBe(true);
    }
  });
});

// subtle 테두리는 꾸밈이라 제외 목록에 있다(ADR 0022).
describe("Badge 대비 쌍", () => {
  const tideRoles = ["primary", "success", "warning", "danger", "info"] as const;
  it.each(tideRoles)(
    "subtle·faint: text-%s-on-subtle × 같은 Role subtle·faint가 4.5:1로 등록되어 있다",
    (role) => {
      expect(registered(`text-${role}-on-subtle`, `bg-${role}-subtle`, 4.5)).toBe(true);
      expect(registered(`text-${role}-on-subtle`, `bg-${role}-faint`, 4.5)).toBe(true);
    },
  );

  it("subtle·faint neutral: text-default × bg-neutral-subtle·faint가 4.5:1로 등록되어 있다", () => {
    expect(registered("text-default", "bg-neutral-subtle", 4.5)).toBe(true);
    expect(registered("text-default", "bg-neutral-faint", 4.5)).toBe(true);
  });

  it.each(["neutral", ...tideRoles])(
    "subtle 테두리 border-%s-subtle은 꾸밈이라 대비 검사에서 제외되어 있다",
    (role) => {
      expect(contrastExclusions.some((item) => item.token === `border-${role}-subtle`)).toBe(true);
    },
  );

  it.each(["neutral", ...tideRoles])(
    "solid: text-on-solid × bg-%s-solid가 4:1(solid 위 글자)로 등록되어 있다",
    (role) => {
      expect(registered("text-on-solid", `bg-${role}-solid`, 4)).toBe(true);
    },
  );

  it("색 계열 8개가 on-subtle × subtle·faint, on-solid × solid 규칙을 light·dark에서 통과한다", () => {
    expect(colorFamilyNames).toEqual([
      "blue",
      "gray",
      "green",
      "amber",
      "red",
      "cyan",
      "purple",
      "mint",
    ]);
    familiesPass([
      ["on-subtle", "subtle"],
      ["on-subtle", "faint"],
      ["on-solid", "solid"],
    ]);
  });

  it("앱 Role·앱 장식 계열은 on-subtle × subtle·faint(4.5:1), on-solid × solid(4:1) 규칙으로 검사된다(tide-color가 같은 규칙을 쓴다)", () => {
    expect(ruled("on-subtle", "subtle", 4.5)).toBe(true);
    expect(ruled("on-subtle", "faint", 4.5)).toBe(true);
    expect(ruled("on-solid", "solid", 4)).toBe(true);
  });
});

describe("Card·Separator 대비 쌍", () => {
  it("Card 글자: text-default × bg-surface가 4.5:1로 등록되어 있다", () => {
    expect(registered("text-default", "bg-surface", 4.5)).toBe(true);
  });

  it("Card 경계와 Separator 선(border-default)은 장식용 구분선으로 대비 검사에서 제외되어 있다", () => {
    expect(contrastExclusions.some((item) => item.token === "border-default")).toBe(true);
  });
});

describe("Alert 대비 쌍", () => {
  const tideRoles = ["primary", "success", "warning", "danger", "info"] as const;
  const allRoles = ["neutral", ...tideRoles] as const;
  // neutral의 on-subtle은 text-default를 공유한다.
  const onSubtle = (role: (typeof allRoles)[number]): string =>
    role === "neutral" ? "text-default" : `text-${role}-on-subtle`;

  it.each(allRoles)(
    "%s: 글자·아이콘(on-subtle) × 같은 Role subtle이 4.5:1로 등록되어 있다",
    (role) => {
      expect(registered(onSubtle(role), `bg-${role}-subtle`, 4.5)).toBe(true);
    },
  );

  it.each(allRoles)("%s: 파스텔 테두리는 꾸밈이라 대비 검사에서 제외되어 있다", (role) => {
    expect(contrastExclusions.some((item) => item.token === `border-${role}-subtle`)).toBe(true);
  });

  it.each(allRoles)(
    "%s: 닫기 버튼(ghost) 포커스 halo(subtle-border)는 대비 검사에서 제외되어 있다",
    (role) => {
      expect(contrastExclusions.some((item) => item.token === `border-${role}-subtle`)).toBe(true);
    },
  );

  it.each(allRoles)(
    "%s: 닫기 버튼(ghost) 글자 on-subtle × subtle(4.5:1)·subtle-hover·subtle-active(일시 상태)가 등록되어 있다",
    (role) => {
      expect(registered(onSubtle(role), `bg-${role}-subtle`, 4.5)).toBe(true);
      expect(registered(onSubtle(role), `bg-${role}-subtle-hover`, 4)).toBe(true);
      expect(registered(onSubtle(role), `bg-${role}-subtle-active`, subtleActiveRatio(role))).toBe(
        true,
      );
    },
  );

  it("앱 Role은 on-subtle × subtle(4.5:1), subtle-hover·subtle-active(4:1) 규칙으로 검사된다(tide-color가 같은 규칙을 쓴다)", () => {
    expect(ruled("on-subtle", "subtle", 4.5)).toBe(true);
    expect(ruled("on-subtle", "subtle-hover", 4)).toBe(true);
    expect(ruled("on-subtle", "subtle-active", 4)).toBe(true);
  });
});

// 이미지 층은 사용자 사진이라 대비 검사 대상이 아니다.
describe("Avatar 대비 쌍", () => {
  it("색 계열 8개의 fallback 아이콘(on-subtle) × 배경(subtle)이 light·dark에서 4.5:1을 통과한다", () => {
    familiesPass([["on-subtle", "subtle"]]);
  });

  it("앱 장식 계열은 on-subtle × subtle 규칙(4.5:1)으로 검사된다(tide-color가 같은 규칙을 쓴다)", () => {
    expect(ruled("on-subtle", "subtle", 4.5)).toBe(true);
  });
});

// 막대 × 트랙은 UI 경계 3:1이 필요하다. solid × subtle은 dark에서 3:1이 안 돼(primary 2.90) 막대에 쓰지 않는다.
describe("Progress 대비 쌍", () => {
  const tideRoles = ["primary", "success", "warning", "danger", "info"] as const;

  it.each(tideRoles)(
    "%s: 막대(text-%s) × 트랙(같은 Role subtle)이 3:1 이상(4.5:1)으로 등록되어 있다",
    (role) => {
      expect(registered(`text-${role}`, `bg-${role}-subtle`, 4.5)).toBe(true);
    },
  );

  it("neutral: 막대(text-default) × 트랙(bg-neutral-subtle)이 3:1 이상(4.5:1)으로 등록되어 있다", () => {
    expect(registered("text-default", "bg-neutral-subtle", 4.5)).toBe(true);
  });

  it("앱 Role은 text × subtle 규칙(4.5:1)으로 검사된다(tide-color가 같은 규칙을 쓴다)", () => {
    expect(
      colorContrastRules.some(
        (r) => r.foreground === "text" && r.background === "subtle" && r.minRatio >= 3,
      ),
    ).toBe(true);
  });
});

// Skeleton은 aria-hidden 장식이라 대비 의무가 없다.
describe("Skeleton 대비 쌍", () => {
  it("bg-neutral-subtle-active는 text-default의 배경으로 등록되어 있다", () => {
    expect(registered("text-default", "bg-neutral-subtle-active", 4.5)).toBe(true);
  });
});

describe("Table 대비 쌍", () => {
  it("글자(text-default) × 표면 층 3개가 4.5:1로 등록되어 있다", () => {
    for (const background of surfaces) {
      expect(registered("text-default", background, 4.5), background).toBe(true);
    }
  });

  it("hover 행: text-default × bg-hover(canvas·raised 위 합성)가 4:1(일시 상태)로 등록되어 있다", () => {
    expect(registered("text-default", "bg-hover", 4, "bg-canvas")).toBe(true);
    expect(registered("text-default", "bg-hover", 4, "bg-raised")).toBe(true);
  });

  it("행 경계 border-default는 장식용으로 대비 검사에서 제외되어 있다", () => {
    expect(contrastExclusions.some((exclusion) => exclusion.token === "border-default")).toBe(true);
  });
});

describe("Breadcrumb·Pagination 대비 쌍", () => {
  it.each(["text-muted", "text-default"])(
    "%s × 표면 층 3개가 4.5:1로 등록되어 있다",
    (foreground) => {
      for (const background of surfaces) {
        expect(registered(foreground, background, 4.5), `${foreground} × ${background}`).toBe(true);
      }
    },
  );

  it("번호 hover·누름: text-default × bg-hover·bg-active(canvas 위 합성)가 4:1(일시 상태)로 등록되어 있다", () => {
    expect(registered("text-default", "bg-hover", 4, "bg-canvas")).toBe(true);
    expect(registered("text-default", "bg-active", 4, "bg-canvas")).toBe(true);
  });

  it("현재 페이지: text-primary-on-subtle × bg-primary-subtle(4.5:1)과 hover·누름(4:1)이 등록되어 있다", () => {
    // 현재 페이지도 링크라 hover·누름 배경으로 바뀐다(Button subtle 규칙).
    expect(registered("text-primary-on-subtle", "bg-primary-subtle", 4.5)).toBe(true);
    for (const state of ["subtle-hover", "subtle-active"]) {
      expect(registered("text-primary-on-subtle", `bg-primary-${state}`, 4), state).toBe(true);
    }
  });

  it("포커스 표시(outline-focus) × 표면 층이 3:1로 등록되어 있다", () => {
    for (const background of surfaces) {
      expect(registered("outline-focus", background, 3), background).toBe(true);
    }
  });
});

describe("Popover(오버레이 표면) 대비 쌍", () => {
  it("글자: text-default × bg-raised가 4.5:1로 등록되어 있다", () => {
    expect(registered("text-default", "bg-raised", 4.5)).toBe(true);
  });

  it("안의 조작 요소 포커스 표시: outline-focus × bg-raised가 3:1로 등록되어 있다", () => {
    expect(registered("outline-focus", "bg-raised", 3)).toBe(true);
  });

  it("경계(border-raised)는 장식용이라 대비 검사에서 제외되어 있다", () => {
    expect(contrastExclusions.some((item) => item.token === "border-raised")).toBe(true);
  });
});

// Tooltip은 안에 조작 요소가 없어 포커스 표시 쌍을 쓰지 않는다.
describe("Tooltip 대비 쌍", () => {
  it("글자: text-default × bg-raised가 4.5:1로 등록되어 있다", () => {
    expect(registered("text-default", "bg-raised", 4.5)).toBe(true);
  });

  it("경계(border-raised)는 장식용이라 대비 검사에서 제외되어 있다", () => {
    expect(contrastExclusions.some((item) => item.token === "border-raised")).toBe(true);
  });
});

describe("Menu(목록) 대비 쌍", () => {
  it("항목 글자: text-default × bg-raised가 4.5:1로 등록되어 있다", () => {
    expect(registered("text-default", "bg-raised", 4.5)).toBe(true);
  });

  it("highlight: text-primary × bg-primary-subtle이 4.5:1로 등록되어 있다", () => {
    expect(registered("text-primary", "bg-primary-subtle", 4.5)).toBe(true);
  });

  it("raised 위 항목 hover: text-default × bg-hover(raised 위 합성)가 4:1(일시 상태)로 등록되어 있다", () => {
    expect(registered("text-default", "bg-hover", 4, "bg-raised")).toBe(true);
  });

  it("고른 옵션 선택 유지: text-default × bg-neutral-subtle-active가 4.5:1로 등록되어 있다", () => {
    expect(registered("text-default", "bg-neutral-subtle-active", 4.5)).toBe(true);
  });

  it("묶음 제목: text-muted × bg-raised가 4.5:1로 등록되어 있다", () => {
    expect(registered("text-muted", "bg-raised", 4.5)).toBe(true);
  });

  it("비활성 글자(text-disabled), 구분선(border-default), 경계(border-raised)는 대비 검사에서 제외되어 있다", () => {
    for (const token of ["text-disabled", "border-default", "border-raised"]) {
      expect(
        contrastExclusions.some((item) => item.token === token),
        token,
      ).toBe(true);
    }
  });
});

describe("Select 대비 쌍", () => {
  it("트리거 값·placeholder·chevron: text-default·text-muted × bg-canvas가 4.5:1로 등록되어 있다", () => {
    expect(registered("text-default", "bg-canvas", 4.5)).toBe(true);
    expect(registered("text-muted", "bg-canvas", 4.5)).toBe(true);
  });

  it("트리거 경계·오류 경계·focus-field: border-strong·border-danger·outline-focus × bg-canvas가 3:1로 등록되어 있다", () => {
    for (const token of ["border-strong", "border-danger", "outline-focus"]) {
      expect(registered(token, "bg-canvas", 3), token).toBe(true);
    }
  });

  it("고른 옵션 체크 아이콘: highlight면 text-primary × bg-primary-subtle, 아니면 text-default × bg-neutral-subtle-active다", () => {
    expect(registered("text-primary", "bg-primary-subtle", 4.5)).toBe(true);
    expect(registered("text-default", "bg-neutral-subtle-active", 4.5)).toBe(true);
  });

  it("비활성 트리거(bg-disabled·text-disabled·border-default)는 대비 검사에서 제외되어 있다", () => {
    for (const token of ["bg-disabled", "text-disabled", "border-default"]) {
      expect(
        contrastExclusions.some((item) => item.token === token),
        token,
      ).toBe(true);
    }
  });
});

describe("Combobox 대비 쌍", () => {
  it("입력 글자·placeholder·chevron: text-default·text-muted × bg-canvas가 4.5:1로 등록되어 있다", () => {
    expect(registered("text-default", "bg-canvas", 4.5)).toBe(true);
    expect(registered("text-muted", "bg-canvas", 4.5)).toBe(true);
  });

  it("입력 경계·오류 경계·focus-field: border-strong·border-danger·outline-focus × bg-canvas가 3:1로 등록되어 있다", () => {
    for (const token of ["border-strong", "border-danger", "outline-focus"]) {
      expect(registered(token, "bg-canvas", 3), token).toBe(true);
    }
  });

  it("결과 없음 글자: text-muted × bg-raised가 4.5:1로 등록되어 있다", () => {
    expect(registered("text-muted", "bg-raised", 4.5)).toBe(true);
  });

  it("비활성 입력·chevron(bg-disabled·text-disabled·border-default)은 대비 검사에서 제외되어 있다", () => {
    for (const token of ["bg-disabled", "text-disabled", "border-default"]) {
      expect(
        contrastExclusions.some((item) => item.token === token),
        token,
      ).toBe(true);
    }
  });
});

// 닫기·Footer 버튼 색은 Button·IconButton 대비 쌍이 맡는다.
describe("Dialog·AlertDialog 대비 쌍", () => {
  it("제목·본문 글자: text-default × bg-raised가 4.5:1로 등록되어 있다", () => {
    expect(registered("text-default", "bg-raised", 4.5)).toBe(true);
  });

  it("설명 글자: text-muted × bg-raised가 4.5:1로 등록되어 있다", () => {
    expect(registered("text-muted", "bg-raised", 4.5)).toBe(true);
  });

  it("안의 조작 요소 포커스 표시: outline-focus × bg-raised가 3:1로 등록되어 있다", () => {
    expect(registered("outline-focus", "bg-raised", 3)).toBe(true);
  });

  it("뒤를 가리는 막(bg-overlay)과 경계(border-raised)는 대비 검사에서 제외되어 있다", () => {
    for (const token of ["bg-overlay", "border-raised"]) {
      expect(
        contrastExclusions.some((item) => item.token === token),
        token,
      ).toBe(true);
    }
  });
});

describe("Tabs 대비 쌍", () => {
  it.each(["text-muted", "text-default", "text-primary"])(
    "탭 글자 %s × 표면 층 3개가 4.5:1로 등록되어 있다",
    (foreground) => {
      for (const background of surfaces) {
        expect(registered(foreground, background, 4.5), `${foreground} × ${background}`).toBe(true);
      }
    },
  );

  it("고른 표시 막대(border-primary)와 포커스 표시(outline-focus) × 표면 층이 3:1로 등록되어 있다", () => {
    for (const foreground of ["border-primary", "outline-focus"]) {
      for (const background of surfaces) {
        expect(registered(foreground, background, 3), `${foreground} × ${background}`).toBe(true);
      }
    }
  });

  it("탭 목록 선(border-default)과 비활성 글자(text-disabled)는 대비 검사에서 제외되어 있다", () => {
    for (const token of ["border-default", "text-disabled"]) {
      expect(
        contrastExclusions.some((item) => item.token === token),
        token,
      ).toBe(true);
    }
  });
});

// chevron은 그래픽이라 3:1이면 되지만 4.5:1 쌍으로 등록되어 있다.
describe("Accordion 대비 쌍", () => {
  it.each(["text-default", "text-muted"])(
    "트리거·패널 글자와 chevron %s × 표면 층 3개가 4.5:1로 등록되어 있다",
    (foreground) => {
      for (const background of surfaces) {
        expect(registered(foreground, background, 4.5), `${foreground} × ${background}`).toBe(true);
      }
    },
  );

  it("hover 배경(bg-hover, canvas·raised 위 합성) 위 트리거 글자·chevron(text-default)이 4:1(일시 상태)로 등록되어 있다", () => {
    expect(registered("text-default", "bg-hover", 4, "bg-canvas")).toBe(true);
    expect(registered("text-default", "bg-hover", 4, "bg-raised")).toBe(true);
  });

  it("포커스 표시(outline-focus) × 표면 층이 3:1로 등록되어 있다", () => {
    for (const background of surfaces) {
      expect(registered("outline-focus", background, 3), background).toBe(true);
    }
  });

  it("경계·구분선(border-default)과 비활성 글자(text-disabled)는 대비 검사에서 제외되어 있다", () => {
    for (const token of ["border-default", "text-disabled"]) {
      expect(
        contrastExclusions.some((item) => item.token === token),
        token,
      ).toBe(true);
    }
  });
});

describe("Tag 대비 쌍", () => {
  it("색 계열 8개의 글자(on-subtle) × subtle(4.5:1)·subtle-hover·subtle-active(4:1)가 light·dark에서 통과한다", () => {
    familiesPass([
      ["on-subtle", "subtle"],
      ["on-subtle", "subtle-hover"],
      ["on-subtle", "subtle-active"],
    ]);
  });

  it("앱 장식 계열도 on-subtle × subtle(4.5:1)·subtle-hover·subtle-active(4:1) 규칙으로 검사된다(tide-color가 같은 규칙을 쓴다)", () => {
    expect(ruled("on-subtle", "subtle", 4.5)).toBe(true);
    expect(ruled("on-subtle", "subtle-hover", 4)).toBe(true);
    expect(ruled("on-subtle", "subtle-active", 4)).toBe(true);
  });

  it("포커스 표시(outline-focus) × 표면 층이 3:1로 등록되어 있다", () => {
    for (const background of surfaces) {
      expect(registered("outline-focus", background, 3), background).toBe(true);
    }
  });

  it("비활성 태그의 배경·글자(bg-disabled·text-disabled)는 대비 검사에서 제외되어 있다", () => {
    for (const token of ["bg-disabled", "text-disabled"]) {
      expect(
        contrastExclusions.some((item) => item.token === token),
        token,
      ).toBe(true);
    }
  });
});

// Toast의 닫기·액션 버튼은 neutral이다.
describe("Toast 대비 쌍", () => {
  const tideRoles = ["primary", "success", "warning", "danger", "info"] as const;
  const allRoles = ["neutral", ...tideRoles] as const;
  const text = (role: (typeof allRoles)[number]): string =>
    role === "neutral" ? "text-default" : `text-${role}`;

  it("제목·본문 글자: text-default × bg-raised가 4.5:1로 등록되어 있다", () => {
    expect(registered("text-default", "bg-raised", 4.5)).toBe(true);
  });

  it.each(allRoles)("%s: 상태 아이콘(역할 text) × bg-raised가 4.5:1로 등록되어 있다", (role) => {
    expect(registered(text(role), "bg-raised", 4.5)).toBe(true);
  });

  it("닫기(ghost)·액션(outline) 버튼 글자 text-default × bg-raised(4.5:1)와 bg-hover·bg-active(raised 위 합성, 4:1)가 등록되어 있다", () => {
    expect(registered("text-default", "bg-raised", 4.5)).toBe(true);
    expect(registered("text-default", "bg-hover", 4, "bg-raised")).toBe(true);
    expect(registered("text-default", "bg-active", 4, "bg-raised")).toBe(true);
  });

  it("raised 위 Role 색 글자 × bg-hover·bg-active는 등록하지 않는다(dark 누름 warning·danger가 4:1에도 미달, 버튼은 neutral)", () => {
    for (const role of tideRoles) {
      for (const background of ["bg-hover", "bg-active"]) {
        expect(
          contrastPairs.some(
            (pair) =>
              pair.foreground === `text-${role}` &&
              pair.background === background &&
              pair.surface === "bg-raised",
          ),
          `${role} × ${background}`,
        ).toBe(false);
      }
    }
  });

  it("액션 버튼(outline, neutral) 경계 border-strong × bg-raised가 3:1로 등록되어 있다", () => {
    expect(registered("border-strong", "bg-raised", 3)).toBe(true);
  });

  it("Toast·영역·버튼 포커스 표시: outline-focus × bg-raised·표면 층이 3:1로 등록되어 있다", () => {
    for (const background of surfaces) {
      expect(registered("outline-focus", background, 3), background).toBe(true);
    }
  });

  it("앱 Role은 text × 표면 층(4.5:1), border × 표면 층(3:1) 규칙으로 검사된다(tide-color가 같은 규칙을 쓴다)", () => {
    const rule = (foreground: string, minRatio: number): boolean =>
      colorContrastRules.some(
        (r) =>
          r.foreground === foreground && r.background === "bg-raised" && r.minRatio === minRatio,
      );
    expect(rule("text", 4.5)).toBe(true);
    expect(rule("border", 3)).toBe(true);
  });

  it("경계(border-raised)는 장식용이라 대비 검사에서 제외되어 있다", () => {
    expect(contrastExclusions.some((item) => item.token === "border-raised")).toBe(true);
  });
});

describe("Button·IconButton 채움 방식 대비 쌍", () => {
  const tideRoles = ["primary", "success", "warning", "danger", "info"] as const;
  const allRoles = ["neutral", ...tideRoles] as const;
  const onSubtle = (role: (typeof allRoles)[number]): string =>
    role === "neutral" ? "text-default" : `text-${role}-on-subtle`;

  it.each(allRoles)(
    "%s subtle: on-subtle × subtle(4.5:1), subtle-hover·subtle-active(일시 상태)가 등록되어 있다",
    (role) => {
      expect(registered(onSubtle(role), `bg-${role}-subtle`, 4.5)).toBe(true);
      expect(registered(onSubtle(role), `bg-${role}-subtle-hover`, 4)).toBe(true);
      expect(registered(onSubtle(role), `bg-${role}-subtle-active`, subtleActiveRatio(role))).toBe(
        true,
      );
    },
  );

  it.each(allRoles)(
    "%s solid: on-solid × solid 3단계가 4:1(solid 위 글자)로 등록되어 있다",
    (role) => {
      for (const state of ["solid", "solid-hover", "solid-active"]) {
        expect(registered("text-on-solid", `bg-${role}-${state}`, 4), state).toBe(true);
      }
    },
  );

  // outline·ghost: Role은 같은 색 faint·subtle, neutral은 색 없이 덮는다(ADR 0025).
  it.each(tideRoles)(
    "%s outline·ghost: text × 같은 Role faint·subtle이 4.5:1로 등록되어 있다",
    (role) => {
      expect(registered(`text-${role}`, `bg-${role}-faint`, 4.5)).toBe(true);
      expect(registered(`text-${role}`, `bg-${role}-subtle`, 4.5)).toBe(true);
    },
  );

  it("neutral outline·ghost: text-default × bg-hover·bg-active(canvas·raised 위 합성)가 4:1(일시 상태)로 등록되어 있다", () => {
    for (const surface of ["bg-canvas", "bg-raised"] as const) {
      expect(registered("text-default", "bg-hover", 4, surface)).toBe(true);
      expect(registered("text-default", "bg-active", 4, surface)).toBe(true);
    }
  });

  it("앱 Role은 on-subtle × subtle 3단계, on-solid × solid 3단계, text × faint·subtle 규칙으로 검사된다(tide-color가 같은 규칙을 쓴다)", () => {
    expect(ruled("on-subtle", "subtle", 4.5)).toBe(true);
    expect(ruled("on-subtle", "subtle-hover", 4)).toBe(true);
    expect(ruled("on-subtle", "subtle-active", 4)).toBe(true);
    for (const background of ["solid", "solid-hover", "solid-active"]) {
      expect(ruled("on-solid", background, 4), background).toBe(true);
    }
    expect(ruled("text", "faint", 4.5)).toBe(true);
    expect(ruled("text", "subtle", 4.5)).toBe(true);
  });
});

describe("Switch 대비 쌍", () => {
  const tideRoles = ["primary", "success", "warning", "danger", "info"] as const;

  it.each(tideRoles)(
    "%s: 꺼짐 누름 thumb(역할 text) × 같은 Role subtle-active가 3:1(UI 요소)로 등록되어 있다",
    (role) => {
      expect(registered(`text-${role}`, `bg-${role}-subtle-active`, 3)).toBe(true);
    },
  );

  it("neutral 꺼짐 누름 thumb(text-default) × bg-neutral-subtle-active는 4.5:1로 등록되어 있다(3:1을 넘는다)", () => {
    expect(registered("text-default", "bg-neutral-subtle-active", 4.5)).toBe(true);
  });

  it.each(tideRoles)(
    "%s: 꺼짐 hover thumb(역할 text) × 같은 Role subtle이 4.5:1로 등록되어 있다",
    (role) => {
      expect(registered(`text-${role}`, `bg-${role}-subtle`, 4.5)).toBe(true);
    },
  );

  it("꺼짐 thumb text-muted × 표면 층이 4.5:1, 경계·포커스 표시 × 표면 층이 3:1로 등록되어 있다", () => {
    for (const background of surfaces) {
      expect(registered("text-muted", background, 4.5), background).toBe(true);
      for (const foreground of ["border-strong", "border-primary", "outline-focus"]) {
        expect(registered(foreground, background, 3), `${foreground} × ${background}`).toBe(true);
      }
    }
  });

  it("앱 Role은 text × subtle-active(3:1) 규칙으로 thumb을 검사한다(tide-color가 같은 규칙을 쓴다)", () => {
    expect(ruled("text", "subtle-active", 3)).toBe(true);
  });

  it("색 계열 8개가 thumb 규칙(text × subtle-active)을 light·dark에서 통과한다", () => {
    familiesPass([["text", "subtle-active"]]);
  });
});
