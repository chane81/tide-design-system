// Breadcrumb 동작을 실제 Chromium에서 확인한다(tide-v0-impl 티켓 24).
// 두 instance에서 모두 돈다. 두 번째 instance(forced-colors·reduced-motion)에서도 밑줄·구분자 숨김·포커스 ring을 본다.
import Next from "next/link.js";
import type { ReactElement } from "react";
import { describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLink,
  type BreadcrumbItemProps,
  type BreadcrumbLinkProps,
  type BreadcrumbProps,
} from "./index";

const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;
const transparent = "rgba(0, 0, 0, 0)";

async function resolveColor(value: string): Promise<string> {
  const probe = document.createElement("div");
  probe.dataset["theme"] = "light";
  probe.style.color = value;
  document.body.append(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();

  return resolved;
}

function Trail(props: BreadcrumbProps): ReactElement {
  return (
    <div data-theme="light">
      <Breadcrumb {...props}>
        <BreadcrumbItem data-testid="first">
          <BreadcrumbLink href="#home">홈</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem data-testid="second">
          <BreadcrumbLink href="#docs">문서</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem data-testid="last">
          <BreadcrumbCurrent>설치</BreadcrumbCurrent>
        </BreadcrumbItem>
      </Breadcrumb>
    </div>
  );
}

describe("랜드마크와 이름", () => {
  test("navigation 랜드마크에 기본 이름 「이동 경로」가 있고 안은 순서 있는 목록이다", async () => {
    await render(<Trail />);
    const nav = page.getByRole("navigation", { name: "이동 경로" });
    await expect.element(nav).toBeInTheDocument();
    expect(nav.element().tagName).toBe("NAV");
    expect(nav.element().firstElementChild?.tagName).toBe("OL");
    // 구분자 아이콘은 접근성 트리에 나오지 않는다. 항목은 링크 둘과 현재 페이지 텍스트다.
    await expect.element(nav).toMatchAriaInlineSnapshot(`
      - navigation "이동 경로":
        - list:
          - listitem:
            - link "홈":
              - /url: "#home"
          - listitem:
            - link "문서":
              - /url: "#docs"
          - listitem: 설치
    `);
  });

  test("aria-label로 이름을 바꾸고, aria-labelledby도 쓸 수 있다", async () => {
    await render(
      <>
        <Trail aria-label="문서 경로" />
        <h2 id="trail-title">위치</h2>
        <Breadcrumb aria-labelledby="trail-title">
          <BreadcrumbItem>
            <BreadcrumbCurrent>홈</BreadcrumbCurrent>
          </BreadcrumbItem>
        </Breadcrumb>
      </>,
    );
    await expect.element(page.getByRole("navigation", { name: "문서 경로" })).toBeInTheDocument();
    // aria-labelledby가 aria-label(기본값)보다 먼저 이름이 된다(accname 계산 순서).
    await expect.element(page.getByRole("navigation", { name: "위치" })).toBeInTheDocument();
  });
});

describe("현재 페이지", () => {
  test("BreadcrumbCurrent는 링크가 아니고 aria-current=page다", async () => {
    await render(<Trail />);
    const current = page.getByText("설치").element();
    expect(current.tagName).toBe("SPAN");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(page.getByRole("link").elements()).toHaveLength(2);
    for (const link of page.getByRole("link").elements()) {
      expect(link).not.toHaveAttribute("aria-current");
    }
  });

  test("현재 페이지는 text-default·굵기 500이고 밑줄이 없다. 링크는 text-muted·밑줄이다", async () => {
    await render(<Trail />);
    const current = getComputedStyle(page.getByText("설치").element());
    const link = getComputedStyle(page.getByRole("link", { name: "홈" }).element());
    expect(current.fontWeight).toBe("500");
    expect(current.textDecorationLine).toBe("none");
    expect(current.fontSize).toBe("14px");
    expect(current.lineHeight).toBe("20px");
    // 색과 관계없이 밑줄로도 링크를 구분한다(WCAG 1.4.1). 고대비 모드에서도 남는다.
    expect(link.textDecorationLine).toBe("underline");
    expect(link.textDecorationThickness).toBe("1px");
    expect(link.textUnderlineOffset).toBe("2px");
    expect(link.cursor).toBe("pointer");
    expect(link.fontSize).toBe("14px");
    if (!forcedColors()) {
      expect(current.color).toBe(await resolveColor("var(--tide-text-default)"));
      expect(link.color).toBe(await resolveColor("var(--tide-text-muted)"));
    }
  });

  test("링크 hover에 글자가 text-default로 짙어지고 밑줄이 2px가 된다", async () => {
    await render(<Trail />);
    const link = page.getByRole("link", { name: "홈" });
    await userEvent.hover(link);
    const style = getComputedStyle(link.element());
    expect(style.textDecorationThickness).toBe("2px");
    if (!forcedColors()) {
      expect(style.color).toBe(await resolveColor("var(--tide-text-default)"));
    }
  });
});

describe("구분자", () => {
  test("첫 항목을 뺀 항목 앞에 장식용 아이콘이 보이고, 읽히지 않는다", async () => {
    await render(<Trail />);
    const separatorOf = (testId: string): SVGElement => {
      const svg = page.getByTestId(testId).element().querySelector("svg");
      if (!svg) throw new Error(`${testId}에 구분자가 없다`);

      return svg;
    };
    expect(getComputedStyle(separatorOf("first")).display).toBe("none");
    for (const testId of ["second", "last"]) {
      const svg = separatorOf(testId);
      expect(svg).toHaveAttribute("aria-hidden", "true");
      // 내용보다 앞에 있다.
      expect(svg.nextElementSibling?.tagName).toMatch(/^(A|SPAN)$/);
      const style = getComputedStyle(svg);
      expect(style.display).not.toBe("none");
      expect(style.width).toBe("16px");
      expect(style.height).toBe("16px");
    }
    // 목록 항목 이름에 구분자가 섞이지 않는다.
    await expect.element(page.getByRole("listitem").nth(2)).toHaveAccessibleName("");
    expect(page.getByRole("img").elements()).toHaveLength(0);
  });

  test("forced-colors에서는 구분자도 시스템 글자색으로 그려진다", async () => {
    if (!forcedColors()) return;
    await render(<Trail />);
    const svg = page.getByTestId("last").element().querySelector("svg");
    if (!svg) throw new Error("구분자가 없다");
    expect(getComputedStyle(svg).stroke).not.toBe(transparent);
    expect(getComputedStyle(svg).stroke).toBe(getComputedStyle(svg).color);
  });
});

describe("포커스", () => {
  test("Tab으로 링크만 차례로 포커스하고 focus-ring(outline 2px, offset 2px)이 보인다", async () => {
    await render(<Trail />);
    await userEvent.tab();
    const home = page.getByRole("link", { name: "홈" });
    await expect.element(home).toHaveFocus();
    const style = getComputedStyle(home.element());
    expect(style.outlineStyle).toBe("solid");
    expect(style.outlineWidth).toBe("2px");
    expect(style.outlineOffset).toBe("2px");
    expect(style.outlineColor).not.toBe(transparent);
    if (!forcedColors()) {
      expect(style.outlineColor).toBe(await resolveColor("var(--tide-outline-focus)"));
    }
    await userEvent.tab();
    await expect.element(page.getByRole("link", { name: "문서" })).toHaveFocus();
    // 현재 페이지는 포커스하지 않는다.
    await userEvent.tab();
    expect(document.activeElement).toBe(document.body);
  });
});

describe("render", () => {
  test("BreadcrumbLink를 Next Link로 렌더하면 props, ref, className을 병합한다", async () => {
    let node: HTMLAnchorElement | null = null;
    const onLinkClick = vi.fn();
    const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault());
    await render(
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink
            render={<Next href="/docs" className="font-bold" onClick={onLinkClick} />}
            ref={(element) => {
              node = element;
            }}
            onClick={onClick}
            className="no-underline"
            data-testid="link"
          >
            문서
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>,
    );
    const link = page.getByRole("link", { name: "문서" });
    const element = link.element();
    expect(element.tagName).toBe("A");
    expect(element).toHaveAttribute("href", "/docs");
    expect(element).toHaveAttribute("data-testid", "link");
    expect(node).toBe(element);
    expect(element).toHaveClass("font-bold");
    // 사용자 className이 기본 밑줄을 이긴다.
    expect(getComputedStyle(element).textDecorationLine).toBe("none");
    await userEvent.click(link);
    expect(onLinkClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("공통 API", () => {
  test("부분마다 ref를 자기 요소에 연결하고 사용자 className이 기본 class를 이긴다", async () => {
    const refs: Record<string, Element | null> = {};
    await render(
      <Breadcrumb
        ref={(element) => {
          refs["nav"] = element;
        }}
        className="mb-4"
      >
        <BreadcrumbItem
          ref={(element) => {
            refs["item"] = element;
          }}
          className="gap-3"
        >
          <BreadcrumbLink
            href="#a"
            ref={(element) => {
              refs["link"] = element;
            }}
          >
            홈
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbCurrent
            ref={(element) => {
              refs["current"] = element;
            }}
            className="text-body-sm"
          >
            설치
          </BreadcrumbCurrent>
        </BreadcrumbItem>
      </Breadcrumb>,
    );
    expect(refs["nav"]?.tagName).toBe("NAV");
    expect(refs["item"]?.tagName).toBe("LI");
    expect(refs["link"]?.tagName).toBe("A");
    expect(refs["current"]?.tagName).toBe("SPAN");
    expect(getComputedStyle(refs["nav"] as Element).marginBottom).toBe("16px");
    expect(getComputedStyle(refs["item"] as Element).columnGap).toBe("12px");
    // 현재 페이지의 label-md를 사용자 body-sm이 이긴다(굵기 400).
    expect(getComputedStyle(refs["current"] as Element).fontWeight).toBe("400");
  });

  test("지원하지 않는 prop은 타입 오류다", () => {
    // @ts-expect-error BreadcrumbLink에는 color가 없다(HTML 전역 color 속성도 Omit했다).
    const colored: BreadcrumbLinkProps = { color: "primary" };
    // @ts-expect-error Breadcrumb에는 variant가 없다.
    const variant: BreadcrumbProps = { variant: "slash" };
    // @ts-expect-error BreadcrumbItem에는 size가 없다.
    const sized: BreadcrumbItemProps = { size: "sm" };
    expect([colored, variant, sized]).toHaveLength(3);
  });
});
