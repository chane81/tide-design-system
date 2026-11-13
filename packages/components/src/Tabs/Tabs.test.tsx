// Tabs 동작을 실제 Chromium에서 확인한다(tide-v0-impl 티켓 31).
// 두 instance에서 모두 돈다. 두 번째 instance(forced-colors·reduced-motion)에서는 고른 탭의 막대가 시스템 강조색으로
// 남는지와 막대 전환이 opacity만인지를 본다.
import { useState, type ReactElement, type ReactNode } from "react";
import { I18nProvider } from "react-aria";
import { describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { captureWhen } from "../../test/motion.ts";

import {
  Tab,
  TabList,
  TabPanel,
  Tabs,
  type TabListProps,
  type TabPanelProps,
  type TabProps,
  type TabsProps,
} from "./index.ts";

const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;
const transparent = "rgba(0, 0, 0, 0)";
const wait = (ms: number): Promise<void> => new Promise((done) => setTimeout(done, ms));

/** CSS 값 하나를 실제로 계산한 결과. Token 변수를 계산값과 비교할 때 쓴다. */
function resolve(property: "color" | "borderTopColor", value: string): string {
  const probe = document.createElement("div");
  probe.dataset["theme"] = "light";
  probe.style.forcedColorAdjust = "none";
  if (property === "borderTopColor") probe.style.borderTop = `1px solid ${value}`;
  else probe.style.color = value;
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
    // 고르지 않은 탭은 없는 패널을 가리키지 않는다.
    expect(byTestId("security")).not.toHaveAttribute("aria-controls");
    expect(byTestId("security")).not.toHaveAttribute("data-selected");

    const tabpanel = page.getByRole("tabpanel", { name: "계정" });
    await expect.element(tabpanel).toHaveTextContent("계정 패널");
    expect(account.element().getAttribute("aria-controls")).toBe(panel().id);
    expect(panel().getAttribute("aria-labelledby")).toBe(account.element().id);
    // 고른 탭의 패널만 렌더한다.
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
    // 고르지 않은 탭은 Tab 순서 밖이다(roving tabindex).
    expect(byTestId("account")).toHaveAttribute("tabindex", "-1");
    await userEvent.tab();
    // 보안 패널은 첫 내용이 글자라 패널 자신이 Tab 순서에 있다.
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
    // 결제(비활성)를 건너뛴다.
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
  test("Tab으로 탭에 포커스하면 focus-ring(outline 2px, offset 2px)이 보인다", async () => {
    await render(<Example />);
    await tabIntoList();
    await expect.element(page.getByTestId("account")).toHaveFocus();
    // focus-ring 색이 transition에 묶이지 않는지도 함께 본다(글자색 전환 없음).
    await wait(250);
    const style = getComputedStyle(byTestId("account"));
    expect(style.outlineStyle).toBe("solid");
    expect(style.outlineWidth).toBe("2px");
    expect(style.outlineOffset).toBe("2px");
    expect(style.outlineColor).not.toBe(transparent);
    expect(style.borderTopLeftRadius).toBe("6px");
    if (!forcedColors()) {
      expect(style.outlineColor).toBe(resolve("color", "var(--tide-outline-focus)"));
    }
    // 마우스로 누른 탭은 ring이 없다(focus-visible).
    await userEvent.click(page.getByTestId("security"));
    expect(getComputedStyle(byTestId("security")).outlineStyle).toBe("none");
  });

  test("패널에 키보드 포커스가 오면 focus-ring이 보인다", async () => {
    await render(<Example />);
    await tabIntoList();
    await userEvent.tab();
    await expect.element(page.getByRole("tabpanel")).toHaveFocus();
    const style = getComputedStyle(panel());
    expect(style.outlineStyle).toBe("solid");
    expect(style.outlineWidth).toBe("2px");
  });

  test("고른 탭은 primary 글자와 2px 막대로, 고르지 않은 탭은 muted 글자에 막대가 없다", async () => {
    await render(<Example />);
    // 앞 테스트의 마우스가 탭 위에 남아 hover 글자가 되지 않게 바깥으로 옮겨 둔다.
    await userEvent.hover(page.getByTestId("before"));
    const selected = getComputedStyle(byTestId("account"), "::after");
    const other = getComputedStyle(byTestId("security"), "::after");
    expect(selected.opacity).toBe("1");
    expect(other.opacity).toBe("0");
    expect(selected.borderBottomWidth).toBe("2px");
    expect(selected.position).toBe("absolute");
    expect(selected.bottom).toBe("-1px");
    // 막대가 탭 폭 전체에 걸쳐 탭 목록 선(border-default 1px)과 겹친다.
    expect(Number.parseFloat(selected.width)).toBeCloseTo(
      byTestId("account").getBoundingClientRect().width,
      1,
    );
    expect(getComputedStyle(byTestId("list")).borderBottomWidth).toBe("1px");
    expect(getComputedStyle(byTestId("account")).fontSize).toBe("14px");
    expect(getComputedStyle(byTestId("account")).height).toBe("36px");
    if (forcedColors()) return;
    expect(selected.borderBottomColor).toBe(
      resolve("borderTopColor", "var(--tide-border-primary)"),
    );
    expect(getComputedStyle(byTestId("account")).color).toBe(
      resolve("color", "var(--tide-text-primary)"),
    );
    expect(getComputedStyle(byTestId("security")).color).toBe(
      resolve("color", "var(--tide-text-muted)"),
    );
    // 고르지 않은 탭 hover는 text-default로 바로 바뀐다.
    await userEvent.hover(page.getByTestId("security"));
    expect(getComputedStyle(byTestId("security")).color).toBe(
      resolve("color", "var(--tide-text-default)"),
    );
    expect(getComputedStyle(byTestId("security")).transitionDuration).toBe("0s");
  });

  test("세로 탭은 막대가 끝쪽(오른쪽)에 서고 탭 목록 선도 끝쪽이다", async () => {
    await render(<Example orientation="vertical" />);
    const selected = getComputedStyle(byTestId("account"), "::after");
    expect(selected.borderRightWidth).toBe("2px");
    expect(selected.borderBottomWidth).toBe("0px");
    expect(selected.right).toBe("-1px");
    expect(Number.parseFloat(selected.height)).toBeCloseTo(
      byTestId("account").getBoundingClientRect().height,
      1,
    );
    expect(getComputedStyle(byTestId("list")).borderRightWidth).toBe("1px");
    expect(getComputedStyle(byTestId("root")).flexDirection).toBe("row");
  });

  test("forced-colors에서는 고른 탭의 막대가 시스템 강조색으로 남아 색 없이도 구분된다", async () => {
    await render(<Example />);
    if (!forcedColors()) return;
    const selected = getComputedStyle(byTestId("account"), "::after");
    const other = getComputedStyle(byTestId("security"), "::after");
    expect(selected.forcedColorAdjust).toBe("none");
    expect(selected.opacity).toBe("1");
    expect(selected.borderBottomWidth).toBe("2px");
    expect(selected.borderBottomColor).not.toBe(transparent);
    expect(selected.borderBottomColor).not.toBe(
      getComputedStyle(byTestId("account")).backgroundColor,
    );
    expect(other.opacity).toBe("0");
  });
});

describe("막대 motion", () => {
  test("고른 표시는 opacity fast(150ms)로 바뀌고, 움직임 줄이기가 아니면 가운데에서 펼쳐진다", async () => {
    await render(<Example />);
    const after = getComputedStyle(byTestId("security"), "::after");
    expect(after.transitionDuration).toBe("0.15s");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // 움직임 줄이기: 확대 없이 opacity만 바뀐다.
      expect(after.transitionProperty).toBe("opacity");
      expect(after.scale).toBe("none");
      return;
    }
    expect(after.transitionProperty).toBe("opacity, scale");
    expect(after.scale).toBe("0 1");
    expect(getComputedStyle(byTestId("account"), "::after").scale).toBe("1");

    // 막 고른 탭의 막대가 전환 중이다. 고른 순간에 붙잡는다. click 명령이 돌아온 뒤에 읽으면 부하에 따라 전환이
    // 끝나 있다(test/motion.ts).
    const selected = captureWhen(
      () => byTestId("security").getAttribute("aria-selected") === "true",
      () =>
        byTestId("security")
          .getAnimations({ subtree: true })
          .map((animation) => (animation as CSSTransition).transitionProperty),
    );
    await userEvent.click(page.getByTestId("security"));
    const animations = await selected;
    expect(animations).toEqual(expect.arrayContaining(["opacity", "scale"]));
    await wait(250);
    expect(getComputedStyle(byTestId("security"), "::after").scale).toBe("1");
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
    // 첫 내용이 조작 요소면 패널을 Tab 순서에서 뺄 수 있다.
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
    expect([none, orientation, activation, role, missing, aria, panelId, listRole]).toHaveLength(8);
  });
});
