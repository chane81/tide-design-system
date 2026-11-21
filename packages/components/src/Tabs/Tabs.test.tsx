import { useState, type ReactElement, type ReactNode } from "react";
import { I18nProvider } from "react-aria";
import { describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { expectFocusRing, expectNoFocusHalo } from "../../test/focus";

import { captureWhen, openControl, transitions } from "../../test/motion";

import {
  Tab,
  TabList,
  TabPanel,
  Tabs,
  type TabListProps,
  type TabPanelProps,
  type TabProps,
  type TabsOrientation,
  type TabsProps,
  type TabsShape,
} from "./index";

const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;
const transparent = "rgba(0, 0, 0, 0)";
const wait = (ms: number): Promise<void> => new Promise((done) => setTimeout(done, ms));

/** CSS 값 하나를 실제로 계산한 결과. Token 변수를 계산값과 비교할 때 쓴다. */
function resolve(property: "color" | "borderTopColor" | "backgroundColor", value: string): string {
  const probe = document.createElement("div");
  probe.dataset["theme"] = "light";
  probe.style.forcedColorAdjust = "none";
  if (property === "borderTopColor") probe.style.borderTop = `1px solid ${value}`;
  else probe.style[property] = value;
  document.body.append(probe);
  const resolved = getComputedStyle(probe)[property];
  probe.remove();

  return resolved;
}

type ExampleProps = Partial<Omit<TabsProps, "children">> & {
  readonly list?: Partial<TabListProps>;
};

function Example({ list, ...props }: ExampleProps): ReactElement {
  const rootProps = { defaultValue: "account", ...props } as TabsProps;

  return (
    <div data-theme="light">
      <button type="button" data-testid="before">
        앞
      </button>
      <Tabs {...rootProps} data-testid="root">
        <TabList aria-label="설정" data-testid="list" {...list}>
          <Tab value="account" data-testid="account">
            계정
          </Tab>
          <Tab value="security" data-testid="security">
            보안
          </Tab>
          <Tab value="billing" data-testid="billing" disabled>
            결제
          </Tab>
          <Tab value="notifications" data-testid="notifications">
            알림
          </Tab>
        </TabList>
        <TabPanel value="account">계정 패널</TabPanel>
        <TabPanel value="security">
          보안 패널 <button type="button">비밀번호 바꾸기</button>
        </TabPanel>
        <TabPanel value="billing">결제 패널</TabPanel>
        <TabPanel value="notifications">알림 패널</TabPanel>
      </Tabs>
    </div>
  );
}

const byTestId = (testId: string): HTMLElement => page.getByTestId(testId).element() as HTMLElement;
const panel = (): HTMLElement => page.getByRole("tabpanel").element() as HTMLElement;
const indicator = (): HTMLElement =>
  document.querySelector<HTMLElement>("[data-indicator]") as HTMLElement;

/** 표시가 탭의 자리에 있는지. 밑줄은 진행 방향의 위치·길이만, box는 네 값을 모두 본다. */
function placement(
  testId: string,
  orientation: TabsOrientation,
  shape: TabsShape,
): { actual: number[]; expected: number[] } {
  const tab = byTestId(testId).getBoundingClientRect();
  const box = indicator().getBoundingClientRect();
  const pick = (rect: DOMRect): number[] => {
    if (shape === "box") return [rect.left, rect.top, rect.width, rect.height];

    return orientation === "horizontal" ? [rect.left, rect.width] : [rect.top, rect.height];
  };

  return { actual: pick(box), expected: pick(tab) };
}

const onTab = (testId: string, orientation: TabsOrientation, shape: TabsShape): boolean => {
  const { actual, expected } = placement(testId, orientation, shape);

  return actual.every((value, index) => Math.abs(value - (expected[index] ?? 0)) < 0.5);
};

function expectOn(testId: string, orientation: TabsOrientation, shape: TabsShape): void {
  const { actual, expected } = placement(testId, orientation, shape);
  actual.forEach((value, index) => expect(value).toBeCloseTo(expected[index] ?? 0, 0));
}

const selectedTab = (): string | null =>
  document.querySelector('[role="tab"][aria-selected="true"]')?.textContent ?? null;

/** 키보드 입력 방식으로 바꾸려고 앞 버튼에서 Tab을 눌러 탭 목록에 들어간다. */
async function tabIntoList(): Promise<void> {
  byTestId("before").focus();
  await userEvent.tab();
}

describe("역할과 연결", () => {
  test("tablist·tab·tabpanel 역할이고 고른 탭과 패널이 id로 이어진다", async () => {
    await render(<Example />);
    const list = page.getByRole("tablist", { name: "설정" });
    await expect.element(list).toHaveAttribute("aria-orientation", "horizontal");
    expect(page.getByRole("tab").elements()).toHaveLength(4);
    const account = page.getByRole("tab", { name: "계정" });
    await expect.element(account).toHaveAttribute("aria-selected", "true");
    await expect.element(account).toHaveAttribute("data-selected", "");
    await expect.element(account).toHaveAttribute("type", "button");
    await expect
      .element(page.getByRole("tab", { name: "보안" }))
      .toHaveAttribute("aria-selected", "false");
    expect(byTestId("security")).not.toHaveAttribute("aria-controls");
    expect(byTestId("security")).not.toHaveAttribute("data-selected");

    const tabpanel = page.getByRole("tabpanel", { name: "계정" });
    await expect.element(tabpanel).toHaveTextContent("계정 패널");
    expect(account.element().getAttribute("aria-controls")).toBe(panel().id);
    expect(panel().getAttribute("aria-labelledby")).toBe(account.element().id);
    expect(page.getByRole("tabpanel").elements()).toHaveLength(1);
    expect(byTestId("root")).toHaveAttribute("data-orientation", "horizontal");
  });

  test("값에 공백이 있어도 id가 이어진다", async () => {
    await render(
      <Tabs defaultValue="first tab">
        <TabList aria-label="목록">
          <Tab value="first tab">첫째</Tab>
        </TabList>
        <TabPanel value="first tab">내용</TabPanel>
      </Tabs>,
    );
    const tab = page.getByRole("tab", { name: "첫째" }).element();
    expect(tab.id).not.toMatch(/\s/);
    expect(tab.getAttribute("aria-controls")).toBe(panel().id);
    await expect.element(page.getByRole("tabpanel", { name: "첫째" })).toBeVisible();
  });
});

describe("키보드 탐색", () => {
  test("Tab으로 들어오면 고른 탭에 포커스가 오고, 다음 Tab은 패널로 간다", async () => {
    await render(<Example defaultValue="security" />);
    await tabIntoList();
    await expect.element(page.getByTestId("security")).toHaveFocus();
    expect(byTestId("account")).toHaveAttribute("tabindex", "-1");
    await userEvent.tab();
    await expect.element(page.getByRole("tabpanel")).toHaveFocus();
    expect(panel()).toHaveAttribute("tabindex", "0");
  });

  test("→←로 옮기며 바로 고르고(자동 활성화), 끝에서 처음으로 돌며 비활성 탭은 건너뛴다", async () => {
    const onValueChange = vi.fn();
    await render(<Example onValueChange={onValueChange} />);
    await tabIntoList();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(page.getByTestId("security")).toHaveFocus();
    expect(selectedTab()).toBe("보안");
    await expect.element(page.getByRole("tabpanel", { name: "보안" })).toBeVisible();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(page.getByTestId("notifications")).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(page.getByTestId("account")).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(page.getByTestId("notifications")).toHaveFocus();
    expect(selectedTab()).toBe("알림");
    expect(onValueChange.mock.calls.map(([value]) => value)).toEqual([
      "security",
      "notifications",
      "account",
      "notifications",
    ]);
  });

  test("Home·End는 처음·마지막 탭으로 간다", async () => {
    await render(<Example defaultValue="security" />);
    await tabIntoList();
    await userEvent.keyboard("{End}");
    await expect.element(page.getByTestId("notifications")).toHaveFocus();
    expect(selectedTab()).toBe("알림");
    await userEvent.keyboard("{Home}");
    await expect.element(page.getByTestId("account")).toHaveFocus();
    expect(selectedTab()).toBe("계정");
  });

  test("가로 탭 목록은 ↓↑를 쓰지 않는다", async () => {
    await render(<Example />);
    await tabIntoList();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(page.getByTestId("account")).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    await expect.element(page.getByTestId("account")).toHaveFocus();
  });

  test("수동 활성화(manual)는 화살표로 포커스만 옮기고 Enter·Space로 고른다", async () => {
    const onValueChange = vi.fn();
    await render(<Example activationMode="manual" onValueChange={onValueChange} />);
    await tabIntoList();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(page.getByTestId("security")).toHaveFocus();
    expect(selectedTab()).toBe("계정");
    await expect.element(page.getByRole("tabpanel")).toHaveTextContent("계정 패널");
    await userEvent.keyboard("{Enter}");
    expect(selectedTab()).toBe("보안");
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(page.getByTestId("notifications")).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(selectedTab()).toBe("알림");
    expect(onValueChange.mock.calls.map(([value]) => value)).toEqual(["security", "notifications"]);
  });

  test("세로(vertical)는 aria-orientation이 vertical이고 ↓↑로 옮긴다", async () => {
    await render(<Example orientation="vertical" />);
    await expect.element(page.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");
    expect(byTestId("root")).toHaveAttribute("data-orientation", "vertical");
    await tabIntoList();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(page.getByTestId("security")).toHaveFocus();
    expect(selectedTab()).toBe("보안");
    await userEvent.keyboard("{ArrowUp}");
    await expect.element(page.getByTestId("account")).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect.element(page.getByTestId("notifications")).toHaveFocus();
  });

  test("RTL locale에서는 ←가 다음 탭, →가 이전 탭이다", async () => {
    await render(
      <I18nProvider locale="ar-EG">
        <div dir="rtl">
          <Example />
        </div>
      </I18nProvider>,
    );
    await tabIntoList();
    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(page.getByTestId("security")).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(page.getByTestId("account")).toHaveFocus();
  });
});

describe("누름과 비활성", () => {
  test("탭을 누르면 고르고 패널이 바뀐다. 이미 고른 탭을 누르면 onValueChange를 부르지 않는다", async () => {
    const onValueChange = vi.fn();
    await render(<Example onValueChange={onValueChange} />);
    await userEvent.click(page.getByTestId("account"));
    expect(onValueChange).not.toHaveBeenCalled();
    await userEvent.click(page.getByTestId("notifications"));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("notifications");
    await expect.element(page.getByRole("tabpanel")).toHaveTextContent("알림 패널");
  });

  test("비활성 탭은 네이티브 disabled·aria-disabled이고 눌러도 고르지 않는다", async () => {
    const onValueChange = vi.fn();
    await render(<Example onValueChange={onValueChange} />);
    const billing = byTestId("billing");
    expect(billing).toBeDisabled();
    expect(billing).toHaveAttribute("aria-disabled", "true");
    billing.click();
    await wait(50);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(selectedTab()).toBe("계정");
    expect(getComputedStyle(billing).cursor).toBe("not-allowed");
  });
});

describe("제어와 비제어", () => {
  test("value를 주면 onValueChange만 부르고 부모가 바꿔야 바뀐다", async () => {
    const onValueChange = vi.fn();
    await render(
      <Example defaultValue={undefined} value="account" onValueChange={onValueChange} />,
    );
    await userEvent.click(page.getByTestId("security"));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("security");
    expect(selectedTab()).toBe("계정");
    await expect.element(page.getByRole("tabpanel")).toHaveTextContent("계정 패널");
  });

  test("상태를 가진 부모가 값을 바꾸면 탭과 패널이 따라간다", async () => {
    function Controlled(): ReactElement {
      const [value, setValue] = useState("account");

      return (
        <>
          <button type="button" onClick={() => setValue("notifications")}>
            알림으로
          </button>
          <Example defaultValue={undefined} value={value} onValueChange={setValue} />
          <output data-testid="value">{value}</output>
        </>
      );
    }
    await render(<Controlled />);
    await userEvent.click(page.getByTestId("security"));
    await expect.element(page.getByTestId("value")).toHaveTextContent("security");
    expect(selectedTab()).toBe("보안");
    await userEvent.click(page.getByRole("button", { name: "알림으로" }));
    expect(selectedTab()).toBe("알림");
    await expect.element(page.getByRole("tabpanel")).toHaveTextContent("알림 패널");
  });

  test("준 값과 같은 탭이 없으면 첫 활성 탭을 고르며 onValueChange를 부른다", async () => {
    const onValueChange = vi.fn();
    await render(
      <Tabs defaultValue="missing" onValueChange={onValueChange}>
        <TabList aria-label="목록">
          <Tab value="a" disabled>
            비활성
          </Tab>
          <Tab value="b">둘째</Tab>
        </TabList>
        <TabPanel value="a">A</TabPanel>
        <TabPanel value="b">B</TabPanel>
      </Tabs>,
    );
    await expect.element(page.getByRole("tabpanel")).toHaveTextContent("B");
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(selectedTab()).toBe("둘째");
  });
});

describe("포커스 표시와 고른 표시", () => {
  test("Tab으로 탭에 포커스하면 focus-ring(2px 링 + 3px halo)이 보인다", async () => {
    await render(<Example />);
    await tabIntoList();
    await expect.element(page.getByTestId("account")).toHaveFocus();
    expectFocusRing(byTestId("account"));
    expect(getComputedStyle(byTestId("account")).borderTopLeftRadius).toBe("6px");
    await userEvent.click(page.getByTestId("security"));
    expectNoFocusHalo(byTestId("security"));
  });

  test("패널에 키보드 포커스가 오면 focus-ring이 보인다", async () => {
    await render(<Example />);
    await tabIntoList();
    await userEvent.tab();
    await expect.element(page.getByRole("tabpanel")).toHaveFocus();
    expectFocusRing(panel());
  });

  test("고른 탭은 primary 글자, 고르지 않은 탭은 muted 글자다. hover는 전환 없이 default 글자다", async () => {
    await render(<Example />);
    await userEvent.hover(page.getByTestId("before"));
    expect(getComputedStyle(byTestId("account")).fontSize).toBe("14px");
    expect(getComputedStyle(byTestId("account")).height).toBe("36px");
    if (forcedColors()) return;
    expect(getComputedStyle(byTestId("account")).color).toBe(
      resolve("color", "var(--tide-text-primary)"),
    );
    expect(getComputedStyle(byTestId("security")).color).toBe(
      resolve("color", "var(--tide-text-muted)"),
    );
    const security = getComputedStyle(byTestId("security"));
    expect(security.transitionProperty).toContain("color");
    expect(security.transitionDuration).toBe("0.15s");
    await userEvent.hover(page.getByTestId("security"));
    await expect
      .poll(() => getComputedStyle(byTestId("security")).color)
      .toBe(resolve("color", "var(--tide-text-default)"));
  });
});

describe("고른 표시(indicator)", () => {
  test("기본(underline)은 탭 목록 안 표시 하나가 고른 탭 아래 2px 밑줄로 놓이고, 탭 자체 막대는 숨는다", async () => {
    await render(<Example />);
    expect(byTestId("root")).toHaveAttribute("data-shape", "underline");
    expect(byTestId("list").querySelectorAll("[data-indicator]")).toHaveLength(1);
    expect(indicator()).toHaveAttribute("aria-hidden", "true");
    await expect.element(page.getByTestId("list")).toHaveAttribute("data-measured", "");
    const style = getComputedStyle(indicator());
    expect(style.visibility).toBe("visible");
    expect(style.borderBottomWidth).toBe("2px");
    expect(style.bottom).toBe("-1px");
    expectOn("account", "horizontal", "underline");
    expect(getComputedStyle(byTestId("account"), "::after").opacity).toBe("0");
    expect(getComputedStyle(byTestId("list")).borderBottomWidth).toBe("1px");
    if (forcedColors()) return;
    expect(style.borderBottomColor).toBe(resolve("borderTopColor", "var(--tide-border-primary)"));
  });

  test("누르거나 키보드(→, End, Home)로 고르면 표시가 새 탭의 위치·크기로 간다", async () => {
    await render(<Example />);
    await userEvent.click(page.getByTestId("notifications"));
    await expect.poll(() => onTab("notifications", "horizontal", "underline")).toBe(true);
    await tabIntoList();
    await userEvent.keyboard("{Home}");
    await expect.poll(() => onTab("account", "horizontal", "underline")).toBe(true);
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => onTab("security", "horizontal", "underline")).toBe(true);
    await userEvent.keyboard("{End}");
    await expect.poll(() => onTab("notifications", "horizontal", "underline")).toBe(true);
  });

  test("box는 옅은 탭 목록 바탕 위에 고른 탭을 둥근 사각형 바탕으로 보인다", async () => {
    await render(<Example shape="box" />);
    expect(byTestId("root")).toHaveAttribute("data-shape", "box");
    await expect.element(page.getByTestId("list")).toHaveAttribute("data-measured", "");
    const list = getComputedStyle(byTestId("list"));
    expect(list.borderBottomWidth).toBe("0px");
    expect(list.padding).toBe("4px");
    expect(list.borderTopLeftRadius).toBe("8px");
    const style = getComputedStyle(indicator());
    expect(style.borderTopLeftRadius).toBe("6px");
    expectOn("account", "horizontal", "box");
    if (forcedColors()) return;
    expect(list.backgroundColor).toBe(resolve("backgroundColor", "var(--tide-bg-inset)"));
    expect(style.backgroundColor).toBe(resolve("backgroundColor", "var(--tide-bg-inset-raised)"));
    expect(style.boxShadow).not.toBe("none");
    expect(style.borderTopWidth).toBe("1px");
    expect(style.borderTopColor).toBe(resolve("borderTopColor", "var(--tide-border-inset-raised)"));
    expect(getComputedStyle(byTestId("account")).color).toBe(
      resolve("color", "var(--tide-text-primary)"),
    );
    await userEvent.click(page.getByTestId("security"));
    await expect.poll(() => onTab("security", "horizontal", "box")).toBe(true);
  });

  test.each(["underline", "box"] as const)(
    "세로(%s)는 표시가 고른 탭의 세로 위치·높이를 따르고 ↓로 옮기면 따라간다",
    async (shape) => {
      await render(<Example orientation="vertical" shape={shape} />);
      await expect.element(page.getByTestId("list")).toHaveAttribute("data-measured", "");
      expectOn("account", "vertical", shape);
      if (shape === "underline") {
        const style = getComputedStyle(indicator());
        expect(style.borderRightWidth).toBe("2px");
        expect(style.borderBottomWidth).toBe("0px");
        expect(style.right).toBe("-1px");
        expect(getComputedStyle(byTestId("list")).borderRightWidth).toBe("1px");
      }
      expect(getComputedStyle(byTestId("root")).flexDirection).toBe("row");
      await tabIntoList();
      await userEvent.keyboard("{ArrowDown}");
      await expect.poll(() => onTab("security", "vertical", shape)).toBe(true);
    },
  );

  test.each([
    ["transform scale", { transform: "scale(0.5)", transformOrigin: "0 0" }],
    ["zoom", { zoom: 2 }],
  ] as const)("조상에 %s가 있어도 표시가 고른 탭 자리에 놓인다", async (_name, style) => {
    await render(
      <div style={style}>
        <Example shape="box" />
      </div>,
    );
    await expect.element(page.getByTestId("list")).toHaveAttribute("data-measured", "");
    expectOn("account", "horizontal", "box");
    await userEvent.click(page.getByTestId("notifications"));
    await expect.poll(() => onTab("notifications", "horizontal", "box")).toBe(true);
  });

  test("탭 글자가 바뀌어 폭이 달라지면 표시가 transition 없이 새 폭을 따른다", async () => {
    function Relabel(): ReactElement {
      const [label, setLabel] = useState("계정");

      return (
        <>
          <button type="button" onClick={() => setLabel("계정과 프로필 설정")}>
            이름 바꾸기
          </button>
          <Tabs defaultValue="a">
            <TabList aria-label="목록" data-testid="list">
              <Tab value="a" data-testid="a">
                {label}
              </Tab>
              <Tab value="b">보안</Tab>
            </TabList>
          </Tabs>
        </>
      );
    }
    await render(<Relabel />);
    await expect.element(page.getByTestId("list")).toHaveAttribute("data-measured", "");
    const before = byTestId("a").getBoundingClientRect().width;
    await userEvent.click(page.getByRole("button", { name: "이름 바꾸기" }));
    await expect.poll(() => byTestId("a").getBoundingClientRect().width).toBeGreaterThan(before);
    await expect.poll(() => onTab("a", "horizontal", "underline")).toBe(true);
    expect(indicator().getAnimations()).toHaveLength(0);
  });

  test("숨은 채 마운트되면 재기 전까지 표시를 숨기고 고른 탭 자체 막대로 보이며, 보이게 되면 transition 없이 놓인다", async () => {
    const control = openControl(
      (shown) => (
        <div hidden={!shown}>
          <Example />
        </div>
      ),
      false,
    );
    await render(control.element);
    expect(byTestId("list")).not.toHaveAttribute("data-measured");
    expect(getComputedStyle(indicator()).visibility).toBe("hidden");
    expect(getComputedStyle(byTestId("account"), "::after").opacity).toBe("1");
    expect(getComputedStyle(byTestId("security"), "::after").opacity).toBe("0");

    const placed = captureWhen(
      () => byTestId("list").hasAttribute("data-measured"),
      () => indicator().getAnimations().length,
    );
    control.set(true);
    expect(await placed).toBe(0);
    expectOn("account", "horizontal", "underline");
    expect(getComputedStyle(byTestId("account"), "::after").opacity).toBe("0");
  });

  test.each(["underline", "box"] as const)(
    "forced-colors(%s)에서는 표시가 시스템 강조색 경계로 남아 색 없이도 구분된다",
    async (shape) => {
      await render(<Example shape={shape} />);
      if (!forcedColors()) return;
      await expect.element(page.getByTestId("list")).toHaveAttribute("data-measured", "");
      const style = getComputedStyle(indicator());
      expect(style.forcedColorAdjust).toBe("none");
      expect(style.visibility).toBe("visible");
      const color = shape === "underline" ? style.borderBottomColor : style.borderTopColor;
      expect(shape === "underline" ? style.borderBottomWidth : style.borderTopWidth).toBe("2px");
      expect(color).not.toBe(transparent);
      expect(color).not.toBe(getComputedStyle(byTestId("list")).backgroundColor);
      if (shape === "box") expect(style.backgroundColor).toBe(transparent);
    },
  );
});

describe("고른 표시 motion", () => {
  test.each(["underline", "box"] as const)(
    "첫 렌더(%s)에는 transition 없이 제자리에 놓인다",
    async (shape) => {
      const placed = captureWhen(
        () => document.querySelector("[data-measured]") !== null,
        () => document.querySelector("[data-indicator]")?.getAnimations().length,
      );
      await render(<Example shape={shape} defaultValue="notifications" />);
      expect(await placed).toBe(0);
      expectOn("notifications", "horizontal", shape);
    },
  );

  test("고른 탭이 바뀌면 위치·크기가 normal(300ms) ease-out으로 미끄러진다. 움직임 줄이기에서는 바로 옮겨진다", async () => {
    await render(<Example />);
    await expect.element(page.getByTestId("list")).toHaveAttribute("data-measured", "");
    const style = getComputedStyle(indicator());
    const sliding = captureWhen(
      () => byTestId("notifications").getAttribute("aria-selected") === "true",
      () => [...transitions(indicator()).keys()],
    );
    await userEvent.click(page.getByTestId("notifications"));
    const running = await sliding;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      expect(style.transitionDuration).toBe("0s");
      expect(running).toEqual([]);
      expectOn("notifications", "horizontal", "underline");

      return;
    }
    expect(style.transitionProperty).toBe("translate, width, height");
    expect(style.transitionDuration).toBe("0.3s");
    expect(style.transitionTimingFunction).toBe("cubic-bezier(0, 0, 0.2, 1)");
    // 예시 탭은 글자 수가 같아 폭은 그대로이고 위치만 옮겨진다.
    expect(running).toEqual(["translate"]);
    expect(style.opacity).toBe("1");
    await expect.poll(() => onTab("notifications", "horizontal", "underline")).toBe(true);
  });
});

describe("항목 모으기", () => {
  test("Fragment·배열·서버 컴포넌트의 lazy 참조로 온 탭도 모은다", async () => {
    // 서버 컴포넌트가 만든 client Component 요소는 type이 React lazy 참조로 온다(RSC payload의 `$L`).
    const LazyTab = {
      $$typeof: Symbol.for("react.lazy"),
      _payload: Tab,
      _init: (payload: unknown) => payload,
    } as unknown as (props: TabProps) => ReactNode;
    await render(
      <Tabs defaultValue="first">
        <TabList aria-label="목록">
          <>
            <LazyTab value="first">첫째</LazyTab>
            {["second", "third"].map((value) => (
              <Tab key={value} value={value}>
                {value}
              </Tab>
            ))}
          </>
        </TabList>
        <TabPanel value="first">첫째 패널</TabPanel>
      </Tabs>,
    );
    expect(
      page
        .getByRole("tab")
        .elements()
        .map((tab) => tab.textContent),
    ).toEqual(["첫째", "second", "third"]);
    await expect.element(page.getByRole("tabpanel", { name: "첫째" })).toBeVisible();
  });

  test("아이콘(장식용 svg)이 있는 탭은 16px 아이콘과 글자 사이 8px이다", async () => {
    await render(
      <Tabs defaultValue="a">
        <TabList aria-label="목록">
          <Tab value="a" data-testid="icon-tab">
            <svg data-testid="icon" aria-hidden="true" viewBox="0 0 16 16" />
            사진
          </Tab>
        </TabList>
      </Tabs>,
    );
    await expect.element(page.getByRole("tab", { name: "사진" })).toBeVisible();
    expect(getComputedStyle(byTestId("icon")).width).toBe("16px");
    expect(getComputedStyle(byTestId("icon-tab")).columnGap).toBe("8px");
  });
});

describe("ref·className·타입", () => {
  test("ref는 각 요소에 닿고 className이 기본 class를 이긴다", async () => {
    const rootRef = vi.fn();
    const listRef = vi.fn();
    const tabRef = vi.fn();
    const panelRef = vi.fn();
    await render(
      <Tabs defaultValue="a" ref={rootRef} className="gap-2" data-testid="root">
        <TabList ref={listRef} className="gap-3" aria-label="목록" data-testid="list">
          <Tab ref={tabRef} value="a" className="px-5" data-testid="tab">
            첫째
          </Tab>
        </TabList>
        <TabPanel ref={panelRef} value="a" className="p-1" data-testid="panel" tabIndex={-1}>
          <button type="button">안의 버튼</button>
        </TabPanel>
      </Tabs>,
    );
    expect(rootRef).toHaveBeenCalledWith(byTestId("root"));
    expect(listRef).toHaveBeenCalledWith(byTestId("list"));
    expect(tabRef).toHaveBeenCalledWith(byTestId("tab"));
    expect(panelRef).toHaveBeenCalledWith(byTestId("panel"));
    expect(getComputedStyle(byTestId("root")).rowGap).toBe("8px");
    expect(getComputedStyle(byTestId("list")).columnGap).toBe("12px");
    expect(getComputedStyle(byTestId("tab")).paddingLeft).toBe("20px");
    expect(getComputedStyle(byTestId("panel")).padding).toBe("4px");
    expect(byTestId("panel")).toHaveAttribute("tabindex", "-1");
  });

  test("Tabs 밖의 부분 Component는 오류를 던진다", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(render(<TabPanel value="a" />)).rejects.toThrow("TabPanel는 Tabs 안에 둔다.");
    error.mockRestore();
  });

  test("지원하지 않는 값은 타입 오류다", () => {
    // @ts-expect-error -- value나 defaultValue 하나는 꼭 준다(서버 렌더에서 패널이 바로 보이게).
    const none: TabsProps = { orientation: "horizontal" };
    // @ts-expect-error -- orientation은 horizontal·vertical이다.
    const orientation: TabsProps = { defaultValue: "a", orientation: "diagonal" };
    // @ts-expect-error -- shape는 underline·box다. Badge 값(rounded)은 받지 않는다.
    const shape: TabsProps = { defaultValue: "a", shape: "rounded" };
    // @ts-expect-error -- React Aria 이름(keyboardActivation)은 드러내지 않는다. activationMode를 쓴다.
    const activation: TabsProps = { defaultValue: "a", keyboardActivation: "manual" };
    // @ts-expect-error -- 탭 역할은 tab으로 고정이다.
    const role: TabProps = { value: "a", role: "option" };
    // @ts-expect-error -- 탭은 value가 필수다.
    const missing: TabProps = { children: "탭" };
    // @ts-expect-error -- React Aria 이름(isDisabled)은 드러내지 않는다. disabled를 쓴다.
    const aria: TabProps = { value: "a", isDisabled: true };
    // @ts-expect-error -- 패널 id는 탭과 잇도록 자동으로 만든다.
    const panelId: TabPanelProps = { value: "a", id: "panel" };
    // @ts-expect-error -- 탭 목록 역할은 tablist로 고정이다.
    const listRole: TabListProps = { role: "menu" };
    expect([
      none,
      orientation,
      shape,
      activation,
      role,
      missing,
      aria,
      panelId,
      listRole,
    ]).toHaveLength(9);
  });
});
