// Menu 동작을 실제 Chromium에서 확인한다(tide-v0-impl 티켓 27).
// 두 instance에서 모두 돈다. 두 번째 instance(forced-colors·reduced-motion)에서는 highlight 위치가 시스템 색 outline으로
// 남는지와 퇴장이 opacity 전환만 있는지를 본다.
//
// 열려 있는 동안 바깥은 inert라 Playwright click(누를 수 있는지 먼저 확인)이 바깥 요소를 누르지 못한다.
// 바깥 누름은 좌표로 마우스를 누르는 사용자 명령(mouseDownOn·mouseUp)으로 한다(Popover.test.tsx와 같다).
import { useState, type ReactElement, type ReactNode } from "react";
import { describe, expect, test, vi } from "vitest";
import { commands, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { captureExit, openControl, styleSnapshot, transitions } from "../test/motion.ts";

import { Button } from "./Button.tsx";
import { listItemClass } from "./constants/listClass.ts";
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSection,
  MenuTrigger,
  type MenuContentProps,
  type MenuItemProps,
  type MenuProps,
} from "./Menu.tsx";

const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;
const transparent = "rgba(0, 0, 0, 0)";
const wait = (ms: number): Promise<void> => new Promise((done) => setTimeout(done, ms));

/** CSS 값 하나를 실제로 계산한 결과. Token 변수를 계산값과 비교할 때 쓴다. */
function resolve(
  property: "backgroundColor" | "color" | "boxShadow",
  value: string,
  theme = "light",
): string {
  const probe = document.createElement("div");
  probe.dataset["theme"] = theme;
  probe.style.forcedColorAdjust = "none";
  probe.style[property] = value;
  document.body.append(probe);
  const resolved = getComputedStyle(probe)[property];
  probe.remove();
  return resolved;
}

interface ExampleProps extends Omit<MenuProps, "children"> {
  readonly content?: Partial<MenuContentProps>;
  readonly onRename?: () => void;
  readonly onDelete?: () => void;
}

function Example({ content, onRename, onDelete, ...props }: ExampleProps): ReactElement {
  return (
    <div data-theme="light">
      <p data-testid="outside">바깥 글</p>
      <Menu {...props}>
        <MenuTrigger data-testid="trigger">파일 동작</MenuTrigger>
        <MenuContent data-testid="content" {...content}>
          <MenuItem data-testid="rename" onClick={onRename}>
            이름 바꾸기
          </MenuItem>
          <MenuItem data-testid="copy">복제</MenuItem>
          <MenuItem data-testid="archive" disabled>
            보관
          </MenuItem>
          <MenuItem data-testid="share">PDF로 내보내기</MenuItem>
          <MenuItem data-testid="delete" onClick={onDelete}>
            삭제
          </MenuItem>
        </MenuContent>
      </Menu>
    </div>
  );
}

const byTestId = (testId: string): HTMLElement => page.getByTestId(testId).element() as HTMLElement;
const content = (): HTMLElement => byTestId("content");
const trigger = (): HTMLElement => byTestId("trigger");
const highlighted = (): string[] =>
  [...document.querySelectorAll("[data-highlighted]")].map((item) => item.textContent ?? "");

/** 바깥(또는 inert가 된 트리거)을 좌표로 누른다. */
async function pressAt(testId: string): Promise<void> {
  await commands.mouseDownOn(testId);
  await commands.mouseUp();
}

/** 목록이 DOM에서 빠질 때까지(퇴장 전환 끝) 기다린다. */
async function expectClosed(): Promise<void> {
  await expect.element(page.getByTestId("content")).not.toBeInTheDocument();
}

/** Tab으로 트리거에 포커스한다(키보드 입력 방식이 된다). */
async function tabToTrigger(): Promise<void> {
  await userEvent.tab();
  expect(document.activeElement).toBe(trigger());
}

describe("열고 닫기", () => {
  test("트리거를 누르면 menu 역할 목록이 열리고, 목록 자신에 포커스가 온다", async () => {
    await render(<Example />);
    expect(trigger()).toHaveAttribute("aria-haspopup", "true");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).not.toHaveAttribute("data-open");

    await userEvent.click(page.getByTestId("trigger"));
    await expect.element(page.getByRole("menu", { name: "파일 동작" })).toBeVisible();
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(trigger()).toHaveAttribute("aria-controls", content().id);
    expect(trigger()).toHaveAttribute("data-open", "");
    expect(content()).toHaveAttribute("data-open", "");
    // 마우스로 열면 위치 표시 없이 목록 자신이 포커스를 받는다(React Aria useMenuTrigger).
    await expect.element(page.getByTestId("content")).toHaveFocus();
    expect(highlighted()).toEqual([]);
    expect(page.getByRole("menuitem").elements()).toHaveLength(5);

    // 열린 동안 트리거는 바깥(inert)이다. 좌표로 누르면 바깥 누름으로 닫힌다.
    await pressAt("trigger");
    await expectClosed();
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).not.toHaveAttribute("data-open");
  });

  test("Enter·Space·↓로 열면 첫 항목, ↑로 열면 마지막 항목에 위치한다", async () => {
    await render(<Example />);
    await tabToTrigger();
    for (const key of ["{Enter}", " ", "{ArrowDown}"]) {
      await userEvent.keyboard(key);
      await expect.element(page.getByTestId("rename")).toHaveFocus();
      expect(highlighted()).toEqual(["이름 바꾸기"]);
      await userEvent.keyboard("{Escape}");
      await expectClosed();
      await expect.element(page.getByTestId("trigger")).toHaveFocus();
    }
    await userEvent.keyboard("{ArrowUp}");
    await expect.element(page.getByTestId("delete")).toHaveFocus();
    expect(highlighted()).toEqual(["삭제"]);
  });

  test("Esc로 닫으면 포커스가 트리거로 돌아온다", async () => {
    await render(<Example />);
    await tabToTrigger();
    await userEvent.keyboard("{Enter}");
    await expect.element(page.getByRole("menu")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expectClosed();
    await expect.element(page.getByTestId("trigger")).toHaveFocus();
  });

  test("바깥을 누르면 닫히고 포커스가 트리거로 돌아온다", async () => {
    await render(<Example />);
    await userEvent.click(page.getByTestId("trigger"));
    await expect.element(page.getByRole("menu")).toBeVisible();
    expect(byTestId("outside").closest("[inert]")).not.toBeNull();
    await pressAt("outside");
    await expectClosed();
    await expect.element(page.getByTestId("trigger")).toHaveFocus();
    expect(byTestId("outside").closest("[inert]")).toBeNull();
  });

  test("Tab을 누르면 닫힌다", async () => {
    await render(<Example />);
    await tabToTrigger();
    await userEvent.keyboard("{Enter}");
    await expect.element(page.getByTestId("rename")).toHaveFocus();
    await userEvent.tab();
    await expectClosed();
    await expect.element(page.getByTestId("trigger")).toHaveFocus();
  });
});

describe("키보드 탐색", () => {
  test("↓↑로 옮기고 끝에서 처음으로 돌며, 비활성 항목은 건너뛴다", async () => {
    await render(<Example />);
    await tabToTrigger();
    await userEvent.keyboard("{Enter}");
    await expect.element(page.getByTestId("rename")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(page.getByTestId("copy")).toHaveFocus();
    // 보관(disabled)을 건너뛴다.
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(page.getByTestId("share")).toHaveFocus();
    expect(highlighted()).toEqual(["PDF로 내보내기"]);
    await userEvent.keyboard("{ArrowUp}");
    await expect.element(page.getByTestId("copy")).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    // 처음에서 ↑는 마지막으로 돈다.
    await expect.element(page.getByTestId("delete")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(page.getByTestId("rename")).toHaveFocus();
  });

  test("Home·End는 처음·마지막 항목으로 간다", async () => {
    await render(<Example />);
    await tabToTrigger();
    await userEvent.keyboard("{Enter}");
    await expect.element(page.getByTestId("rename")).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect.element(page.getByTestId("delete")).toHaveFocus();
    expect(highlighted()).toEqual(["삭제"]);
    await userEvent.keyboard("{Home}");
    await expect.element(page.getByTestId("rename")).toHaveFocus();
    expect(highlighted()).toEqual(["이름 바꾸기"]);
  });

  // 타입어헤드는 keydown의 글자(e.key)로 찾는다. 한글은 IME 조합 중 keydown이 "Process"로 와서 쓰이지 않으므로
  // 영문으로 시작하는 항목으로 확인한다(판단 보류 참고).
  test("글자를 치면 그 글자로 시작하는 항목으로 간다(타입어헤드)", async () => {
    await render(<Example />);
    await tabToTrigger();
    await userEvent.keyboard("{Enter}");
    await expect.element(page.getByTestId("rename")).toHaveFocus();
    await userEvent.keyboard("p");
    await expect.element(page.getByTestId("share")).toHaveFocus();
  });
});

describe("실행", () => {
  test("Enter로 실행하면 onClick을 한 번 부르고 닫히며 포커스가 트리거로 돌아온다", async () => {
    const onDelete = vi.fn();
    const onOpenChange = vi.fn();
    await render(<Example onDelete={onDelete} onOpenChange={onOpenChange} />);
    await tabToTrigger();
    await userEvent.keyboard("{ArrowUp}");
    await expect.element(page.getByTestId("delete")).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onDelete).toHaveBeenCalledOnce();
    await expectClosed();
    await expect.element(page.getByTestId("trigger")).toHaveFocus();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  test("Space로도 실행한다", async () => {
    const onRename = vi.fn();
    await render(<Example onRename={onRename} />);
    await tabToTrigger();
    await userEvent.keyboard("{Enter}");
    await expect.element(page.getByTestId("rename")).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(onRename).toHaveBeenCalledOnce();
    await expectClosed();
  });

  test("누르면 실행하고 닫힌다", async () => {
    const onRename = vi.fn();
    await render(<Example onRename={onRename} />);
    await userEvent.click(page.getByTestId("trigger"));
    await userEvent.click(page.getByRole("menuitem", { name: "이름 바꾸기" }));
    expect(onRename).toHaveBeenCalledOnce();
    await expectClosed();
  });

  test("비활성 항목은 aria-disabled·data-disabled이고 눌러도 실행하지 않는다", async () => {
    const onClick = vi.fn();
    await render(
      <Menu defaultOpen>
        <MenuTrigger>열기</MenuTrigger>
        <MenuContent data-testid="content">
          <MenuItem>복제</MenuItem>
          <MenuItem data-testid="archive" disabled onClick={onClick}>
            보관
          </MenuItem>
        </MenuContent>
      </Menu>,
    );
    const archive = byTestId("archive");
    expect(archive).toHaveAttribute("aria-disabled", "true");
    expect(archive).toHaveAttribute("data-disabled", "");
    await userEvent.click(page.getByTestId("archive"), { force: true });
    expect(onClick).not.toHaveBeenCalled();
    await expect.element(page.getByRole("menu")).toBeVisible();
    const style = getComputedStyle(archive);
    expect(style.cursor).toBe("not-allowed");
    if (!forcedColors()) expect(style.color).toBe(resolve("color", "var(--tide-text-disabled)"));
  });
});

describe("highlight(키보드 위치와 hover)", () => {
  test("키보드 위치는 primary subtle 배경·primary 글자·투명 outline이고 transition 없이 바로 바뀐다", async () => {
    await render(<Example />);
    // 앞 테스트의 마우스가 항목 자리에 남아 hover 배경이 생기지 않게 바깥으로 옮겨 둔다.
    await userEvent.hover(page.getByTestId("outside"));
    await tabToTrigger();
    await userEvent.keyboard("{Enter}");
    await expect.element(page.getByTestId("rename")).toHaveFocus();
    const item = byTestId("rename");
    const other = byTestId("copy");
    const style = getComputedStyle(item);
    expect(item).toHaveAttribute("data-highlighted", "");
    expect(other).not.toHaveAttribute("data-highlighted");
    expect(style.transitionDuration).toBe("0s");
    expect(getComputedStyle(other).outlineStyle).toBe("none");
    expect(style.outlineStyle).toBe("solid");
    expect(style.outlineWidth).toBe("2px");
    expect(style.outlineOffset).toBe("-2px");
    expect(style.borderTopLeftRadius).toBe("4px");
    if (forcedColors()) return;
    expect(style.backgroundColor).toBe(resolve("backgroundColor", "var(--tide-bg-primary-subtle)"));
    expect(style.color).toBe(resolve("color", "var(--tide-text-primary)"));
    expect(style.outlineColor).toBe(transparent);
    expect(getComputedStyle(other).backgroundColor).toBe(transparent);

    // 옮기면 이전 항목은 바로 투명으로 돌아간다(전환 없음).
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(page.getByTestId("copy")).toHaveFocus();
    expect(getComputedStyle(item).backgroundColor).toBe(transparent);
    expect(item.getAnimations()).toHaveLength(0);
    expect(getComputedStyle(other).backgroundColor).toBe(
      resolve("backgroundColor", "var(--tide-bg-primary-subtle)"),
    );
  });

  test("마우스를 올린 항목이 위치가 되어 같은 highlight로 보인다", async () => {
    await render(<Example />);
    await userEvent.click(page.getByTestId("trigger"));
    await userEvent.hover(page.getByTestId("share"));
    await expect.element(page.getByTestId("share")).toHaveFocus();
    expect(highlighted()).toEqual(["PDF로 내보내기"]);
    // 비활성 항목에 올리면 위치가 옮겨 가지 않는다.
    await userEvent.hover(page.getByTestId("archive"));
    expect(highlighted()).toEqual(["PDF로 내보내기"]);
    if (forcedColors()) return;
    expect(getComputedStyle(byTestId("share")).backgroundColor).toBe(
      resolve("backgroundColor", "var(--tide-bg-primary-subtle)"),
    );
    expect(getComputedStyle(byTestId("archive")).backgroundColor).toBe(transparent);
  });

  test("forced-colors에서는 highlight 위치가 시스템 색 outline으로 보인다", async () => {
    await render(<Example />);
    await tabToTrigger();
    await userEvent.keyboard("{Enter}");
    await expect.element(page.getByTestId("rename")).toHaveFocus();
    if (!forcedColors()) return;
    const item = getComputedStyle(byTestId("rename"));
    const other = getComputedStyle(byTestId("copy"));
    expect(item.outlineStyle).toBe("solid");
    expect(item.outlineWidth).toBe("2px");
    expect(item.outlineColor).not.toBe(transparent);
    expect(item.outlineColor).not.toBe(item.backgroundColor);
    expect(other.outlineStyle).toBe("none");
  });

  test("raised 위 항목 규칙: 선택 유지는 neutral subtle-active, highlight가 겹치면 highlight가 이긴다", async () => {
    // Menu는 선택이 없다. Select·Combobox가 쓸 data-selected 모양을 같은 항목 class로 확인한다.
    await render(
      <div data-theme="light" className="bg-raised p-2">
        <div data-testid="selected" className={listItemClass} data-selected="">
          고른 옵션
        </div>
        <div data-testid="both" className={listItemClass} data-selected="" data-highlighted="">
          고르고 위치한 옵션
        </div>
      </div>,
    );
    if (forcedColors()) return;
    expect(getComputedStyle(byTestId("selected")).backgroundColor).toBe(
      resolve("backgroundColor", "var(--tide-bg-neutral-subtle-active)"),
    );
    expect(getComputedStyle(byTestId("selected")).color).toBe(
      resolve("color", "var(--tide-text-default)"),
    );
    expect(getComputedStyle(byTestId("both")).backgroundColor).toBe(
      resolve("backgroundColor", "var(--tide-bg-primary-subtle)"),
    );
  });

  test("raised 위 항목 규칙: highlight가 아닌 항목의 hover는 무채색 bg-hover다", async () => {
    // 키보드 위치가 따로 있을 때 마우스가 다른 항목 위에 있는 경우다. 같은 항목 class로 확인한다.
    await render(
      <div data-theme="light" className="bg-raised p-2">
        <div data-testid="before" className={listItemClass}>
          앞 항목
        </div>
        <div data-testid="plain" className={listItemClass}>
          항목
        </div>
        <div data-testid="disabled" className={listItemClass} data-disabled="">
          비활성 항목
        </div>
      </div>,
    );
    await userEvent.hover(page.getByTestId("plain"));
    if (forcedColors()) return;
    expect(getComputedStyle(byTestId("plain")).backgroundColor).toBe(
      resolve("backgroundColor", "var(--tide-bg-hover)"),
    );
    await userEvent.hover(page.getByTestId("disabled"));
    expect(getComputedStyle(byTestId("disabled")).backgroundColor).toBe(transparent);
  });
});

describe("묶음", () => {
  test("묶음은 제목이 이름인 group이고, 사이에 구분선이 있다", async () => {
    await render(
      <Menu defaultOpen>
        <MenuTrigger>보기</MenuTrigger>
        <MenuContent data-testid="content">
          <MenuItem>새로 고침</MenuItem>
          <MenuSection heading="정렬">
            <MenuItem>이름순</MenuItem>
            <MenuItem>날짜순</MenuItem>
          </MenuSection>
          <MenuSection aria-label="보기 방식">
            <MenuItem>목록</MenuItem>
            <MenuItem>격자</MenuItem>
          </MenuSection>
        </MenuContent>
      </Menu>,
    );
    await expect.element(page.getByRole("group", { name: "정렬" })).toBeVisible();
    await expect.element(page.getByRole("group", { name: "보기 방식" })).toBeVisible();
    expect(
      page
        .getByRole("group", { name: "정렬" })
        .getByRole("menuitem")
        .elements()
        .map((item) => item.textContent),
    ).toEqual(["이름순", "날짜순"]);
    // 앞 항목과 첫 묶음 사이, 두 묶음 사이에 구분선이 있다.
    expect(content().querySelectorAll("[role='separator']")).toHaveLength(2);
    // 제목은 묶음 이름으로만 쓰고 보조기술에는 따로 드러나지 않는다.
    const heading = page.getByText("정렬").element();
    expect(heading).toHaveAttribute("role", "presentation");
    if (!forcedColors()) {
      expect(getComputedStyle(heading).color).toBe(resolve("color", "var(--tide-text-muted)"));
    }

    // 키보드 이동은 묶음을 넘나든다.
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect.element(page.getByRole("menuitem", { name: "이름순" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect.element(page.getByRole("menuitem", { name: "격자" })).toHaveFocus();
  });

  test("Fragment·배열·서버 컴포넌트의 lazy 참조로 온 항목도 모은다", async () => {
    // 서버 컴포넌트가 만든 client Component 요소는 type이 React lazy 참조로 온다(RSC payload의 `$L`).
    const lazy = (type: unknown): unknown => ({
      $$typeof: Symbol.for("react.lazy"),
      _payload: type,
      _init: (payload: unknown) => payload,
    });
    const LazyItem = lazy(MenuItem) as (props: MenuItemProps) => ReactNode;
    const LazySection = lazy(MenuSection) as typeof MenuSection;
    await render(
      <Menu defaultOpen>
        <MenuTrigger>열기</MenuTrigger>
        <MenuContent>
          <>
            <LazyItem>첫째</LazyItem>
            {["둘째", "셋째"].map((label) => (
              <MenuItem key={label}>{label}</MenuItem>
            ))}
          </>
          <LazySection heading="묶음">
            <LazyItem>넷째</LazyItem>
          </LazySection>
        </MenuContent>
      </Menu>,
    );
    await expect.element(page.getByRole("menu")).toBeVisible();
    expect(
      page
        .getByRole("menuitem")
        .elements()
        .map((item) => item.textContent),
    ).toEqual(["첫째", "둘째", "셋째", "넷째"]);
    await expect.element(page.getByRole("group", { name: "묶음" })).toBeVisible();
  });

  test("아이콘이 있는 항목도 글자로 타입어헤드한다", async () => {
    await render(
      <Menu>
        <MenuTrigger data-testid="trigger">열기</MenuTrigger>
        <MenuContent>
          <MenuItem>
            <svg aria-hidden="true" width="24" height="24" />
            <span>Copy</span>
          </MenuItem>
          <MenuItem>
            <svg aria-hidden="true" width="24" height="24" />
            <span>Paste</span>
          </MenuItem>
        </MenuContent>
      </Menu>,
    );
    await tabToTrigger();
    await userEvent.keyboard("{Enter}");
    await expect.element(page.getByRole("menuitem", { name: "Copy" })).toHaveFocus();
    // 바로 안의 아이콘은 16px로 맞춘다.
    const icon = page.getByRole("menuitem", { name: "Copy" }).element().querySelector("svg");
    expect(icon?.getBoundingClientRect().width).toBe(16);
    await userEvent.keyboard("p");
    await expect.element(page.getByRole("menuitem", { name: "Paste" })).toHaveFocus();
  });
});

describe("제어와 비제어", () => {
  test("defaultOpen이면 처음부터 열려 있고 비제어로 닫힌다", async () => {
    const onOpenChange = vi.fn();
    await render(<Example defaultOpen onOpenChange={onOpenChange} />);
    await expect.element(page.getByRole("menu")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expectClosed();
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  test("open을 주면 onOpenChange만 부르고 부모가 바꿔야 닫힌다", async () => {
    const onOpenChange = vi.fn();
    const screen = await render(<Example open onOpenChange={onOpenChange} />);
    await expect.element(page.getByRole("menu")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    await expect.element(page.getByRole("menu")).toBeVisible();
    await screen.rerender(<Example open={false} onOpenChange={onOpenChange} />);
    await expectClosed();
  });

  test("상태를 가진 부모가 트리거 누름과 실행으로 열고 닫는다", async () => {
    function Controlled(): ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <>
          <output data-testid="state">{open ? "열림" : "닫힘"}</output>
          <Example open={open} onOpenChange={setOpen} />
        </>
      );
    }
    await render(<Controlled />);
    await userEvent.click(page.getByTestId("trigger"));
    await expect.element(page.getByTestId("state")).toHaveTextContent("열림");
    await userEvent.click(page.getByRole("menuitem", { name: "복제" }));
    await expect.element(page.getByTestId("state")).toHaveTextContent("닫힘");
    await expectClosed();
  });
});

describe("이름과 트리거", () => {
  test("이름이 없으면 트리거 글자, aria-label을 주면 그 이름이다", async () => {
    const screen = await render(<Example defaultOpen />);
    expect(content()).toHaveAttribute("aria-labelledby", trigger().id);
    await screen.rerender(<Example defaultOpen content={{ "aria-label": "파일 메뉴" }} />);
    await expect.element(page.getByRole("menu", { name: "파일 메뉴" })).toBeVisible();
    expect(content()).not.toHaveAttribute("aria-labelledby");
  });

  test("트리거에 id를 주면 그 id로 이름을 잇는다", async () => {
    await render(
      <Menu defaultOpen>
        <MenuTrigger id="more-trigger">더보기</MenuTrigger>
        <MenuContent data-testid="content">
          <MenuItem>복제</MenuItem>
        </MenuContent>
      </Menu>,
    );
    await expect.element(page.getByRole("menu", { name: "더보기" })).toBeVisible();
    expect(content()).toHaveAttribute("aria-labelledby", "more-trigger");
  });

  test("Tide Button을 render로 트리거에 쓴다", async () => {
    await render(
      <Menu>
        <MenuTrigger render={<Button variant="outline" />}>정렬</MenuTrigger>
        <MenuContent>
          <MenuItem>이름순</MenuItem>
        </MenuContent>
      </Menu>,
    );
    const button = page.getByRole("button", { name: "정렬" });
    expect(button.element()).toHaveAttribute("data-color", "primary");
    expect(button.element()).toHaveAttribute("type", "button");
    await userEvent.click(button);
    await expect.element(page.getByRole("menu", { name: "정렬" })).toBeVisible();
    expect(button.element()).toHaveAttribute("data-open", "");
  });
});

describe("위치와 표면", () => {
  test("portal로 body에 붙고 z-popover로 쌓이며 트리거 아래 시작 끝에 4px 떨어진다", async () => {
    await render(
      <div data-theme="light" style={{ padding: 40 }}>
        <Example defaultOpen />
      </div>,
    );
    await expect.element(page.getByRole("menu")).toBeVisible();
    const style = getComputedStyle(content());
    expect(style.zIndex).toBe("300");
    expect(style.position).toBe("absolute");
    expect(style.isolation).toBe("isolate");
    expect(content()).toHaveAttribute("data-theme", "light");
    expect(content()).toHaveAttribute("data-placement", "bottom");
    expect(content().parentElement?.closest("[data-testid='outside']")).toBeNull();
    const t = trigger().getBoundingClientRect();
    const c = content().getBoundingClientRect();
    expect(Math.abs(c.top - t.bottom - 4)).toBeLessThanOrEqual(1);
    expect(Math.abs(c.left - t.left)).toBeLessThanOrEqual(1);
  });

  test("raised 표면, shadow-md, radius lg, 1px 경계, 여백 3px이고 항목은 radius sm이다", async () => {
    await render(<Example defaultOpen />);
    await expect.element(page.getByRole("menu")).toBeVisible();
    const style = getComputedStyle(content());
    expect(style.borderTopWidth).toBe("1px");
    expect(style.borderTopLeftRadius).toBe("8px");
    expect(style.padding).toBe("3px");
    expect(style.minWidth).toBe("160px");
    expect(style.maxWidth).toBe("320px");
    // 중첩 규칙: 바깥 8px = 항목 4px + 여백 3px + border 1px
    expect(getComputedStyle(byTestId("rename")).borderTopLeftRadius).toBe("4px");
    if (forcedColors()) {
      expect(style.boxShadow).toBe("none");
      expect(style.borderTopColor).not.toBe(transparent);
      return;
    }
    expect(style.backgroundColor).toBe(resolve("backgroundColor", "var(--tide-bg-raised)"));
    expect(style.color).toBe(resolve("color", "var(--tide-text-default)"));
    expect(style.borderTopColor).toBe(transparent);
    expect(style.boxShadow.endsWith(resolve("boxShadow", "var(--tide-shadow-md)"))).toBe(true);
    expect(getComputedStyle(byTestId("copy")).backgroundColor).toBe(transparent);
  });

  test("dark Theme 영역의 트리거면 목록·highlight도 dark 색이다", async () => {
    await render(
      <div data-theme="dark">
        <Menu>
          <MenuTrigger data-testid="trigger">열기</MenuTrigger>
          <MenuContent data-testid="content">
            <MenuItem data-testid="first">첫째</MenuItem>
          </MenuContent>
        </Menu>
      </div>,
    );
    await tabToTrigger();
    await userEvent.keyboard("{Enter}");
    await expect.element(page.getByTestId("first")).toHaveFocus();
    expect(content()).toHaveAttribute("data-theme", "dark");
    if (forcedColors()) return;
    expect(getComputedStyle(content()).backgroundColor).toBe(
      resolve("backgroundColor", "var(--tide-bg-raised)", "dark"),
    );
    expect(getComputedStyle(byTestId("first")).backgroundColor).toBe(
      resolve("backgroundColor", "var(--tide-bg-primary-subtle)", "dark"),
    );
  });
});

describe("등장과 퇴장 motion", () => {
  // 퇴장 중 값은 data-open이 빠지는 순간에 붙잡는다(test/motion.ts).
  test("등장: 전환 없이 바로 불투명하게 나타난다", async () => {
    const screen = await render(<Example open={false} />);
    await screen.rerender(<Example open />);
    const style = getComputedStyle(content());
    expect(style.transitionProperty).toBe("none");
    expect(style.opacity).toBe("1");
    expect(content().getAnimations()).toHaveLength(0);
  });

  test("퇴장: opacity만 fast(150ms)로 사라진 뒤 DOM에서 빠진다", async () => {
    const screen = await render(<Example open />);
    await expect.element(page.getByRole("menu")).toBeVisible();
    const element = content();
    // 전환 중 값은 data-open이 빠지는 순간에 붙잡는다. rerender 뒤에 읽으면 부하에 따라 퇴장이 끝나 있다(test/motion.ts).
    const exit = captureExit(element, () => ({
      connected: element.isConnected,
      style: styleSnapshot(element),
      running: transitions(element),
    }));
    await screen.rerender(<Example open={false} />);
    const { connected, style, running } = await exit;
    expect(element.hasAttribute("data-open")).toBe(false);
    expect(connected).toBe(true);
    expect(style.transitionProperty).toBe("opacity, display");
    expect(style.transitionDuration.split(", ")[0]).toBe("0.15s");
    expect(style.transitionBehavior).toContain("allow-discrete");
    expect(style.pointerEvents).toBe("none");
    expect(running.has("opacity")).toBe(true);
    expect(running.has("filter")).toBe(false);
    expect(running.has("translate")).toBe(false);
    await expect.poll(() => element.isConnected).toBe(false);
  });

  test("퇴장 중에 다시 열면 같은 요소가 전환 없이 바로 돌아온다", async () => {
    const control = openControl((open) => <Example open={open} />);
    await render(control.element);
    await expect.element(page.getByRole("menu")).toBeVisible();
    const element = content();
    // 닫고 다시 여는 일을 한 task 안에서 한다. 사이에 렌더링 단계가 없어 퇴장 전환이 끝나 요소가 빠질 수 없다(test/motion.ts).
    control.set(false);
    expect(element.hasAttribute("data-open")).toBe(false);
    expect(transitions(element).has("opacity")).toBe(true);
    control.set(true);
    expect(content()).toBe(element);
    expect(getComputedStyle(element).opacity).toBe("1");
    await wait(300);
    expect(element.isConnected).toBe(true);
  });
});

describe("ref·className·타입", () => {
  test("ref는 각 요소에 닿고 className이 기본 class를 이긴다", async () => {
    const triggerRef = vi.fn();
    const contentRef = vi.fn();
    const itemRef = vi.fn();
    await render(
      <Menu defaultOpen>
        <MenuTrigger ref={triggerRef} className="text-primary">
          열기
        </MenuTrigger>
        <MenuContent ref={contentRef} className="p-1" data-testid="content">
          <MenuItem ref={itemRef} className="px-3" data-testid="item">
            복제
          </MenuItem>
        </MenuContent>
      </Menu>,
    );
    await expect.element(page.getByRole("menu")).toBeVisible();
    const button = page.getByRole("button", { name: "열기" }).element();
    expect(triggerRef).toHaveBeenCalledWith(button);
    expect(contentRef).toHaveBeenCalledWith(content());
    expect(itemRef).toHaveBeenCalledWith(byTestId("item"));
    expect(button).toHaveAttribute("class", "text-primary");
    expect(content().className).not.toContain("p-[3px]");
    expect(getComputedStyle(content()).padding).toBe("4px");
    expect(getComputedStyle(byTestId("item")).paddingLeft).toBe("12px");
  });

  test("기본 트리거는 class 속성이 없는 type=button이다", async () => {
    await render(<Example />);
    expect(trigger()).not.toHaveAttribute("class");
    expect(trigger()).toHaveAttribute("type", "button");
  });

  test("지원하지 않는 값은 타입 오류다", () => {
    const props: MenuContentProps = {
      // @ts-expect-error -- placement는 정해진 12가지다.
      placement: "middle",
    };
    // @ts-expect-error -- 역할은 menu로 고정이다.
    const role: MenuContentProps = { role: "listbox" };
    // @ts-expect-error -- 항목 역할은 menuitem으로 고정이다.
    const itemRole: MenuItemProps = { role: "option" };
    // @ts-expect-error -- React Aria 이름(isDisabled, onAction)은 드러내지 않는다. disabled·onClick을 쓴다.
    const aria: MenuItemProps = { isDisabled: true };
    expect([props, role, itemRole, aria]).toHaveLength(4);
  });
});
