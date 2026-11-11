// Link·IconButton이 쓰는 글자색이 대비 쌍에 등록되어 있는지 본다(tide-v0-impl 티켓 14, Component 완료 기준 5).
// 값의 대비비는 foundation이 검사한다. 여기서는 「등록되어 있는지」만 본다.
import { contrastPairs } from "@tide-tds/foundation";
import {
  checkColorContrast,
  colorContrastRules,
  colorFamilyNames,
  colorSlotHex,
  contrastExclusions,
} from "@tide-tds/foundation/internal";
import { describe, expect, it } from "vitest";

const surfaces = ["bg-canvas", "bg-surface", "bg-raised"] as const;

const registered = (foreground: string, background: string, minRatio: number): boolean =>
  contrastPairs.some(
    (pair) =>
      pair.foreground === foreground &&
      pair.background === background &&
      pair.minRatio === minRatio,
  );

describe("Link 글자색 대비 쌍", () => {
  // Link는 accent 슬롯의 text를 표면 층 위에 쓴다. Role의 text는 Role Token으로 등록되어 있다.
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

// Badge·Card·Separator(tide-v0-impl 티켓 19)가 쓰는 색이 대비 쌍에 등록되어 있거나 제외 목록에 있는지 본다.
describe("Badge 대비 쌍", () => {
  const tideRoles = ["primary", "success", "warning", "danger", "info"] as const;
  it.each(tideRoles)("subtle: text-%s × 같은 Role subtle이 4.5:1로 등록되어 있다", (role) => {
    expect(registered(`text-${role}`, `bg-${role}-subtle`, 4.5)).toBe(true);
  });

  it("subtle neutral: text-default × bg-neutral-subtle이 4.5:1로 등록되어 있다", () => {
    expect(registered("text-default", "bg-neutral-subtle", 4.5)).toBe(true);
  });

  it.each(["neutral", ...tideRoles])(
    "solid: text-on-solid × bg-%s-solid가 4.5:1로 등록되어 있다",
    (role) => {
      expect(registered("text-on-solid", `bg-${role}-solid`, 4.5)).toBe(true);
    },
  );

  it("색 계열 6개가 text × subtle, on-solid × solid 규칙을 light·dark에서 통과한다", () => {
    expect(colorFamilyNames).toEqual(["blue", "gray", "green", "amber", "red", "cyan"]);
    for (const family of colorFamilyNames) {
      const results = checkColorContrast({
        light: colorSlotHex(family, "light"),
        dark: colorSlotHex(family, "dark"),
      });
      const used = results.filter(
        (result) =>
          (result.foreground === "text" && result.background === "subtle") ||
          (result.foreground === "on-solid" && result.background === "solid"),
      );
      // 규칙 2개 × Theme 2개
      expect(used, family).toHaveLength(4);
      expect(
        used.filter((result) => !result.pass),
        family,
      ).toEqual([]);
    }
  });

  it("앱 Role·앱 장식 계열은 text × subtle, on-solid × solid 규칙(4.5:1)으로 검사된다(tide-color가 같은 규칙을 쓴다)", () => {
    const rule = (foreground: string, background: string): boolean =>
      colorContrastRules.some(
        (r) => r.foreground === foreground && r.background === background && r.minRatio === 4.5,
      );
    expect(rule("text", "subtle")).toBe(true);
    expect(rule("on-solid", "solid")).toBe(true);
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

// Alert(tide-v0-impl 티켓 20)가 쓰는 역할 text·border·subtle 배경 조합과 닫기 버튼 포커스 표시가 등록되어 있는지 본다.
describe("Alert 대비 쌍", () => {
  const tideRoles = ["primary", "success", "warning", "danger", "info"] as const;
  const allRoles = ["neutral", ...tideRoles] as const;
  const border = (role: (typeof allRoles)[number]): string =>
    role === "neutral" ? "border-strong" : `border-${role}`;
  const text = (role: (typeof allRoles)[number]): string =>
    role === "neutral" ? "text-default" : `text-${role}`;

  it.each(allRoles)(
    "%s: 글자·아이콘(역할 text) × 같은 Role subtle이 4.5:1로 등록되어 있다",
    (role) => {
      expect(registered(text(role), `bg-${role}-subtle`, 4.5)).toBe(true);
    },
  );

  it.each(allRoles)("%s: 역할 경계 × 같은 Role subtle(안쪽)이 3:1로 등록되어 있다", (role) => {
    expect(registered(border(role), `bg-${role}-subtle`, 3)).toBe(true);
  });

  it.each(allRoles)("%s: 역할 경계 × 표면 층(바깥)이 3:1로 등록되어 있다", (role) => {
    for (const background of surfaces) {
      expect(registered(border(role), background, 3), `${border(role)} × ${background}`).toBe(true);
    }
  });

  it.each(allRoles)(
    "%s: 닫기 버튼 포커스 표시(outline-focus) × 같은 Role subtle이 3:1로 등록되어 있다",
    (role) => {
      expect(registered("outline-focus", `bg-${role}-subtle`, 3)).toBe(true);
    },
  );

  it.each(allRoles)(
    "%s: 닫기 버튼(ghost) hover·누름 글자 × subtle-hover·subtle-active가 4.5:1로 등록되어 있다",
    (role) => {
      for (const state of ["subtle-hover", "subtle-active"]) {
        expect(registered(text(role), `bg-${role}-${state}`, 4.5)).toBe(true);
      }
    },
  );

  it("앱 Role은 text × subtle(4.5:1), border × 표면 층(3:1) 규칙으로 검사된다(tide-color가 같은 규칙을 쓴다)", () => {
    const rule = (foreground: string, background: string, minRatio: number): boolean =>
      colorContrastRules.some(
        (r) =>
          r.foreground === foreground && r.background === background && r.minRatio === minRatio,
      );
    expect(rule("text", "subtle", 4.5)).toBe(true);
    for (const background of surfaces) expect(rule("border", background, 3)).toBe(true);
  });
});

// Avatar(tide-v0-impl 티켓 21)의 fallback은 색 계열의 text(아이콘) × subtle(배경)이다. 색 이름 규칙으로 검사된다.
// 이미지 층은 사용자 사진이라 대비 검사 대상이 아니다.
describe("Avatar 대비 쌍", () => {
  it("색 계열 6개의 fallback 아이콘(text) × 배경(subtle)이 light·dark에서 4.5:1을 통과한다", () => {
    for (const family of colorFamilyNames) {
      const used = checkColorContrast({
        light: colorSlotHex(family, "light"),
        dark: colorSlotHex(family, "dark"),
      }).filter((result) => result.foreground === "text" && result.background === "subtle");
      // Theme 2개
      expect(used, family).toHaveLength(2);
      expect(
        used.filter((result) => !result.pass),
        family,
      ).toEqual([]);
    }
  });

  it("앱 장식 계열은 text × subtle 규칙(4.5:1)으로 검사된다(tide-color가 같은 규칙을 쓴다)", () => {
    expect(
      colorContrastRules.some(
        (r) => r.foreground === "text" && r.background === "subtle" && r.minRatio === 4.5,
      ),
    ).toBe(true);
  });
});

// Progress(tide-v0-impl 티켓 22)의 막대는 accent 슬롯의 text 색, 트랙은 같은 색 subtle이다.
// 막대 × 트랙은 UI 경계 대비(3:1, WCAG 1.4.11)가 필요하다. 이 짝은 글자 기준(4.5:1)으로 이미 등록되어 있어 3:1을 넘는다.
// solid × subtle은 dark에서 3:1이 되지 않아(예: primary 2.90) 막대에 쓰지 않는다.
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

// Skeleton(tide-v0-impl 티켓 22)은 aria-hidden 장식이라 대비 의무가 없다(글자·경계를 올리지 않는다).
// 쓰는 Token(bg-neutral-subtle-active)은 다른 Component 글자 배경으로 대비 쌍에 이미 등록되어 있다.
describe("Skeleton 대비 쌍", () => {
  it("bg-neutral-subtle-active는 text-default의 배경으로 등록되어 있다", () => {
    expect(registered("text-default", "bg-neutral-subtle-active", 4.5)).toBe(true);
  });
});

// Table(tide-v0-impl 티켓 23)의 글자는 text-default 하나다(머리 칸도 같다). 배경은 놓인 표면 층과 본문 행 hover(neutral subtle-hover)다.
// 행 사이 선은 장식용 border-default라 대비 검사에서 제외된 Token이다.
describe("Table 대비 쌍", () => {
  it("글자(text-default) × 표면 층 3개가 4.5:1로 등록되어 있다", () => {
    for (const background of surfaces) {
      expect(registered("text-default", background, 4.5), background).toBe(true);
    }
  });

  it("hover 행: text-default × bg-neutral-subtle-hover가 4.5:1로 등록되어 있다", () => {
    expect(registered("text-default", "bg-neutral-subtle-hover", 4.5)).toBe(true);
  });

  it("행 경계 border-default는 장식용으로 대비 검사에서 제외되어 있다", () => {
    expect(contrastExclusions.some((exclusion) => exclusion.token === "border-default")).toBe(true);
  });
});

// Breadcrumb·Pagination(tide-v0-impl 티켓 24)이 쓰는 글자색과 배경이 대비 쌍에 등록되어 있는지 본다.
// - Breadcrumb: 링크 text-muted(hover text-default), 현재 페이지 text-default. 배경은 놓인 표면 층이다.
//   구분자 아이콘은 장식용이라 대비 대상이 아니다(글자색 text-muted를 따른다).
// - Pagination: 번호·이전/다음은 neutral ghost(text-default, hover bg-neutral-subtle-hover),
//   현재 페이지는 primary subtle(text-primary × bg-primary-subtle). 생략 아이콘은 장식용이다.
describe("Breadcrumb·Pagination 대비 쌍", () => {
  it.each(["text-muted", "text-default"])(
    "%s × 표면 층 3개가 4.5:1로 등록되어 있다",
    (foreground) => {
      for (const background of surfaces) {
        expect(registered(foreground, background, 4.5), `${foreground} × ${background}`).toBe(true);
      }
    },
  );

  it("번호 hover: text-default × bg-neutral-subtle-hover가 4.5:1로 등록되어 있다", () => {
    expect(registered("text-default", "bg-neutral-subtle-hover", 4.5)).toBe(true);
  });

  it("현재 페이지: text-primary × bg-primary-subtle이 4.5:1로 등록되어 있다", () => {
    expect(registered("text-primary", "bg-primary-subtle", 4.5)).toBe(true);
    // 현재 페이지도 링크라 hover·누름 배경으로 바뀐다(Button subtle 규칙).
    expect(registered("text-primary", "bg-primary-subtle-hover", 4.5)).toBe(true);
    expect(registered("text-primary", "bg-primary-subtle-active", 4.5)).toBe(true);
  });

  it("포커스 표시(outline-focus) × 표면 층이 3:1로 등록되어 있다", () => {
    for (const background of surfaces) {
      expect(registered("outline-focus", background, 3), background).toBe(true);
    }
  });
});

// Popover(tide-v0-impl 티켓 25)와 이후 오버레이가 같이 쓰는 raised 표면의 색이 등록되어 있거나 제외 목록에 있는지 본다.
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

// Tooltip(tide-v0-impl 티켓 26)은 Popover와 같은 raised 표면을 쓴다. 안에 조작 요소가 없으므로 포커스 표시 쌍은 쓰지 않는다.
describe("Tooltip 대비 쌍", () => {
  it("글자: text-default × bg-raised가 4.5:1로 등록되어 있다", () => {
    expect(registered("text-default", "bg-raised", 4.5)).toBe(true);
  });

  it("경계(border-raised)는 장식용이라 대비 검사에서 제외되어 있다", () => {
    expect(contrastExclusions.some((item) => item.token === "border-raised")).toBe(true);
  });
});

// Menu(tide-v0-impl 티켓 27)와 Select·Combobox 목록이 같이 쓰는 목록·항목 색이 등록되어 있거나 제외 목록에 있는지 본다.
describe("Menu(목록) 대비 쌍", () => {
  it("항목 글자: text-default × bg-raised가 4.5:1로 등록되어 있다", () => {
    expect(registered("text-default", "bg-raised", 4.5)).toBe(true);
  });

  it("highlight: text-primary × bg-primary-subtle이 4.5:1로 등록되어 있다", () => {
    expect(registered("text-primary", "bg-primary-subtle", 4.5)).toBe(true);
  });

  it("raised 위 항목: text-default × neutral subtle-hover·subtle-active가 4.5:1로 등록되어 있다", () => {
    expect(registered("text-default", "bg-neutral-subtle-hover", 4.5)).toBe(true);
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
