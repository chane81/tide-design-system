// Pagination 동작을 실제 Chromium에서 확인한다(tide-v0-impl 티켓 24).
// 두 instance에서 모두 돈다. 두 번째 instance(forced-colors·reduced-motion)에서도 포커스 ring·크기·disabled를 본다.
// 페이지 번호는 Button, 이전/다음은 IconButton이라 채움 방식·누름 반응 전체는 Button.test.tsx·IconButton.test.tsx가 본다.
import NextLink from "next/link.js";
import type { ReactElement } from "react";
import { describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  type PaginationLinkProps,
  type PaginationNextProps,
  type PaginationPreviousProps,
  type PaginationProps,
} from "./Pagination.tsx";

// nodenext 타입 해석은 CJS인 next/link를 module.exports({ default })로 보지만, Vite는 default를 바로 준다.
const Next = ("default" in NextLink ? NextLink.default : NextLink) as typeof NextLink.default;

const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;
const transparent = "rgba(0, 0, 0, 0)";

async function resolve(property: "backgroundColor" | "color", value: string): Promise<string> {
  const probe = document.createElement("div");
  probe.dataset["theme"] = "light";
  probe.style[property] = value;
  document.body.append(probe);
  const resolved = getComputedStyle(probe)[property];
  probe.remove();
  return resolved;
}

/** 10쪽 중 `current`쪽. 앞뒤 1쪽과 처음·끝을 보이고 사이를 생략한다(범위 계산은 앱이 한다). */
function Pages({ current, ...props }: PaginationProps & { current: number }): ReactElement {
  const shown = [1, current - 1, current, current + 1, 10].filter(
    (value, index, list) => value >= 1 && value <= 10 && list.indexOf(value) === index,
  );
  return (
    <div data-theme="light">
      <Pagination {...props}>
        <PaginationItem>
          <PaginationPrevious disabled={current === 1} />
        </PaginationItem>
        {shown.map((value, index) => (
          <PaginationItem key={value}>
            {index > 0 && value - (shown[index - 1] ?? 0) > 1 ? <PaginationEllipsis /> : null}
            <PaginationLink href={`#page-${value}`} current={value === current}>
              {value}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext disabled={current === 10} />
        </PaginationItem>
      </Pagination>
    </div>
  );
}

describe("랜드마크와 이름", () => {
  test("navigation 랜드마크에 기본 이름 「페이지 이동」이 있고 안은 목록이다", async () => {
    await render(<Pages current={5} />);
    const nav = page.getByRole("navigation", { name: "페이지 이동" });
    await expect.element(nav).toBeInTheDocument();
    expect(nav.element().firstElementChild?.tagName).toBe("UL");
    // 화살표·생략 아이콘은 읽히지 않는다. 생략 자리는 텍스트 「페이지 생략」으로 읽힌다.
    await expect.element(nav).toMatchAriaInlineSnapshot(`
      - navigation "페이지 이동":
        - list:
          - listitem:
            - button "이전 페이지"
          - listitem:
            - link "1":
              - /url: "#page-1"
          - listitem:
            - text: 페이지 생략
            - link "4":
              - /url: "#page-4"
          - listitem:
            - link "5":
              - /url: "#page-5"
          - listitem:
            - link "6":
              - /url: "#page-6"
          - listitem:
            - text: 페이지 생략
            - link "10":
              - /url: "#page-10"
          - listitem:
            - button "다음 페이지"
    `);
    expect(page.getByRole("img").elements()).toHaveLength(0);
  });

  test("aria-label로 이름을 바꾼다", async () => {
    await render(<Pages current={1} aria-label="댓글 페이지" />);
    await expect.element(page.getByRole("navigation", { name: "댓글 페이지" })).toBeInTheDocument();
  });
});

describe("현재 페이지", () => {
  test("current인 번호만 aria-current=page이고 primary subtle 채움이다", async () => {
    await render(<Pages current={5} />);
    const current = page.getByRole("link", { name: "5" }).element();
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current).toHaveAttribute("data-color", "primary");
    const others = page
      .getByRole("link")
      .elements()
      .filter((element) => element !== current);
    expect(others).toHaveLength(4);
    for (const element of others) {
      expect(element).not.toHaveAttribute("aria-current");
      expect(element).toHaveAttribute("data-color", "neutral");
    }
    if (!forcedColors()) {
      const style = getComputedStyle(current);
      expect(style.backgroundColor).toBe(
        await resolve("backgroundColor", "var(--tide-bg-primary-subtle)"),
      );
      // 현재 페이지는 Button subtle이라 글자가 파스텔 글자 on-subtle이다(ADR 0022).
      expect(style.color).toBe(await resolve("color", "var(--tide-text-primary-on-subtle)"));
      const other = getComputedStyle(others[0] as Element);
      expect(other.backgroundColor).toBe(transparent);
      expect(other.color).toBe(await resolve("color", "var(--tide-text-default)"));
    }
  });
});

describe("크기", () => {
  test("번호·이전/다음·생략 칸은 32×32px(24×24 이상)이고, 두 자리 번호는 넓어진다", async () => {
    await render(
      <Pagination>
        <PaginationItem>
          <PaginationPrevious />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#1">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis data-testid="ellipsis" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#128">128</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext />
        </PaginationItem>
      </Pagination>,
    );
    const box = (element: Element) => element.getBoundingClientRect();
    for (const element of [
      page.getByRole("button", { name: "이전 페이지" }).element(),
      page.getByRole("button", { name: "다음 페이지" }).element(),
      page.getByRole("link", { name: "1", exact: true }).element(),
      page.getByTestId("ellipsis").element(),
    ]) {
      expect(box(element).width).toBe(32);
      expect(box(element).height).toBe(32);
    }
    const wide = page.getByRole("link", { name: "128" }).element();
    expect(box(wide).height).toBe(32);
    expect(box(wide).width).toBeGreaterThan(32);
    expect(getComputedStyle(wide).paddingInlineStart).toBe("8px");
    expect(getComputedStyle(wide).fontVariantNumeric).toBe("tabular-nums");
    // 화살표 아이콘은 16px다(IconButton sm).
    const arrow = page.getByRole("button", { name: "이전 페이지" }).element().querySelector("svg");
    expect(arrow && box(arrow).width).toBe(16);
  });
});

describe("이전/다음", () => {
  test("기본 이름이 있고 aria-label로 바꾼다. 화살표 아이콘은 읽히지 않는다", async () => {
    await render(
      <Pagination>
        <PaginationItem>
          <PaginationPrevious aria-label="이전 댓글" />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext />
        </PaginationItem>
      </Pagination>,
    );
    const previous = page.getByRole("button", { name: "이전 댓글" });
    await expect.element(previous).toBeInTheDocument();
    await expect.element(page.getByRole("button", { name: "다음 페이지" })).toBeInTheDocument();
    expect(previous.element()).toHaveAttribute("type", "button");
    expect(previous.element().querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  test("button의 disabled는 네이티브 disabled라 누를 수 없고 포커스되지 않는다", async () => {
    const onClick = vi.fn();
    await render(
      <Pagination>
        <PaginationItem>
          <PaginationPrevious disabled onClick={onClick} />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext onClick={onClick} />
        </PaginationItem>
      </Pagination>,
    );
    const previous = page.getByRole("button", { name: "이전 페이지" });
    await expect.element(previous).toBeDisabled();
    await userEvent.tab();
    await expect.element(page.getByRole("button", { name: "다음 페이지" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(getComputedStyle(previous.element()).cursor).toBe("not-allowed");
    if (!forcedColors()) {
      expect(getComputedStyle(previous.element()).color).toBe(
        await resolve("color", "var(--tide-text-disabled)"),
      );
    }
  });

  test("Next Link로 렌더한 disabled는 aria-disabled이고 이동과 onClick을 막는다", async () => {
    const onClick = vi.fn();
    const onLinkClick = vi.fn();
    await render(
      <Pagination>
        <PaginationItem>
          <PaginationPrevious
            render={<Next href="/list?page=0" onClick={onLinkClick} />}
            disabled
            onClick={onClick}
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext render={<Next href="/list?page=2" />} />
        </PaginationItem>
      </Pagination>,
    );
    const previous = page.getByRole("link", { name: "이전 페이지" });
    const element = previous.element();
    expect(element.tagName).toBe("A");
    expect(element).toHaveAttribute("aria-disabled", "true");
    expect(element).toHaveAttribute("data-disabled");
    // aria-disabled 요소는 playwright가 누르지 않으므로 DOM click으로 누른다.
    (element as HTMLElement).click();
    expect(onClick).not.toHaveBeenCalled();
    expect(onLinkClick).toHaveBeenCalledTimes(1);
    expect(location.pathname).not.toBe("/list");
    const next = page.getByRole("link", { name: "다음 페이지" }).element();
    expect(next).toHaveAttribute("href", "/list?page=2");
    expect(next).not.toHaveAttribute("aria-disabled");
  });
});

describe("포커스", () => {
  test("Tab으로 번호 링크에 포커스하면 focus-ring(outline 2px, offset 2px)이 보인다", async () => {
    await render(<Pages current={1} />);
    await userEvent.tab();
    const first = page.getByRole("link", { name: "1", exact: true });
    // 첫 페이지라 이전 버튼은 disabled로 건너뛴다.
    await expect.element(first).toHaveFocus();
    // outline 색도 transition-colors(fast 150ms) 대상이라 전환이 끝난 뒤 읽는다.
    await new Promise((resolve) => setTimeout(resolve, 250));
    const style = getComputedStyle(first.element());
    expect(style.outlineStyle).toBe("solid");
    expect(style.outlineWidth).toBe("2px");
    expect(style.outlineOffset).toBe("2px");
    expect(style.outlineColor).not.toBe(transparent);
    if (!forcedColors()) {
      expect(style.outlineColor).toBe(await resolve("color", "var(--tide-outline-focus)"));
    }
  });

  test("forced-colors에서는 번호의 투명 border가 경계로 보인다", async () => {
    if (!forcedColors()) return;
    await render(<Pages current={3} />);
    const style = getComputedStyle(page.getByRole("link", { name: "4" }).element());
    expect(style.borderTopWidth).toBe("1px");
    expect(style.borderTopColor).not.toBe(transparent);
  });

  test("움직임 줄이기에서는 번호를 눌러도 줄어들지 않는다(transition에 scale이 없다)", async () => {
    await render(<Pages current={3} />);
    const style = getComputedStyle(page.getByRole("link", { name: "4" }).element());
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      expect(style.transitionProperty).not.toContain("scale");
    } else {
      expect(style.transitionProperty).toContain("scale");
    }
  });
});

describe("render", () => {
  test("PaginationLink를 Next Link로 렌더하면 props, ref, className을 병합한다", async () => {
    let node: HTMLAnchorElement | null = null;
    const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault());
    await render(
      <Pagination>
        <PaginationItem>
          <PaginationLink
            render={<Next href="/list?page=3" className="font-bold" />}
            ref={(element) => {
              node = element;
            }}
            onClick={onClick}
            className="min-w-10"
            current
          >
            3
          </PaginationLink>
        </PaginationItem>
      </Pagination>,
    );
    const link = page.getByRole("link", { name: "3" });
    const element = link.element();
    expect(element.tagName).toBe("A");
    expect(element).toHaveAttribute("href", "/list?page=3");
    expect(element).toHaveAttribute("aria-current", "page");
    expect(node).toBe(element);
    expect(element).toHaveClass("font-bold");
    // 사용자 className이 기본 최소 폭(32px)을 이긴다.
    expect(element.getBoundingClientRect().width).toBe(40);
    await userEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("상태로 바꾸는 앱은 render로 button을 쓴다", async () => {
    const onClick = vi.fn();
    await render(
      <Pagination>
        <PaginationItem>
          <PaginationLink render={<button type="button" onClick={onClick} />} current>
            2
          </PaginationLink>
        </PaginationItem>
      </Pagination>,
    );
    const button = page.getByRole("button", { name: "2" });
    expect(button.element()).toHaveAttribute("aria-current", "page");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("공통 API", () => {
  test("부분마다 ref를 자기 요소에 연결하고, 기본 class가 없는 항목은 class 속성이 없다", async () => {
    const refs: Record<string, Element | null> = {};
    await render(
      <Pagination
        ref={(element) => {
          refs["nav"] = element;
        }}
        className="mt-4"
      >
        <PaginationItem
          ref={(element) => {
            refs["item"] = element;
          }}
        >
          <PaginationPrevious
            ref={(element) => {
              refs["previous"] = element;
            }}
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis
            ref={(element) => {
              refs["ellipsis"] = element;
            }}
            className="text-default"
          >
            12쪽 생략
          </PaginationEllipsis>
        </PaginationItem>
      </Pagination>,
    );
    expect(refs["nav"]?.tagName).toBe("NAV");
    expect(refs["item"]?.tagName).toBe("LI");
    expect(refs["item"]).not.toHaveAttribute("class");
    expect(refs["previous"]?.tagName).toBe("BUTTON");
    expect(refs["ellipsis"]?.tagName).toBe("SPAN");
    expect(refs["ellipsis"]).toHaveTextContent("12쪽 생략");
    expect(getComputedStyle(refs["nav"] as Element).marginTop).toBe("16px");
  });

  test("지원하지 않는 prop은 타입 오류다", () => {
    // @ts-expect-error PaginationLink에는 color가 없다(HTML 전역 color 속성도 Omit했다).
    const colored: PaginationLinkProps = { color: "primary" };
    // @ts-expect-error PaginationLink에는 variant가 없다.
    const variant: PaginationLinkProps = { variant: "solid" };
    // @ts-expect-error 이전/다음의 size는 32px로 고정이다.
    const sized: PaginationPreviousProps = { size: "lg" };
    // @ts-expect-error 이전/다음의 아이콘은 바꾸지 않는다.
    const icon: PaginationNextProps = { children: "다음" };
    // @ts-expect-error Pagination에는 size가 없다.
    const nav: PaginationProps = { size: "sm" };
    expect([colored, variant, sized, icon, nav]).toHaveLength(5);
  });
});
