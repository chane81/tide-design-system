// Popover 동작을 실제 Chromium에서 확인한다(tide-v0-impl 티켓 25).
// 두 instance에서 모두 돈다. 두 번째 instance(forced-colors·reduced-motion)에서는 경계가 시스템 색으로 남는지와
// 등장·퇴장이 opacity 전환만 남는지를 본다.
//
// 열려 있는 동안 바깥은 inert라 Playwright click(누를 수 있는지 먼저 확인)이 바깥 요소를 누르지 못한다.
// 바깥 누름은 좌표로 마우스를 누르는 사용자 명령(mouseDownOn·mouseUp)으로 한다.
import { useState, type ReactElement } from "react";
import { describe, expect, test, vi } from "vitest";
import { commands, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import {
  captureExit,
  captureWhen,
  openControl,
  styleSnapshot,
  transitions,
} from "../../test/motion";

import { Button } from "../Button/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  type PopoverContentProps,
  type PopoverProps,
  type PopoverTriggerProps,
} from "./index";

const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;
const reducedMotion = (): boolean => matchMedia("(prefers-reduced-motion: reduce)").matches;
const transparent = "rgba(0, 0, 0, 0)";

/** CSS 값 하나를 실제로 계산한 결과. Token 변수를 계산값과 비교할 때 쓴다. */
function resolve(
  property: "backgroundColor" | "color" | "borderTopColor" | "boxShadow",
  value: string,
  theme = "light",
): string {
  const probe = document.createElement("div");
  probe.dataset["theme"] = theme;
  probe.style.forcedColorAdjust = "none";
  probe.style[property === "borderTopColor" ? "borderColor" : property] = value;
  if (property === "borderTopColor") probe.style.border = `1px solid ${value}`;
  document.body.append(probe);
  const resolved = getComputedStyle(probe)[property];
  probe.remove();

  return resolved;
}

interface ExampleProps extends Omit<PopoverProps, "children"> {
  readonly content?: Partial<PopoverContentProps>;
  readonly trigger?: Partial<PopoverTriggerProps>;
}

function Example({ content, trigger, ...props }: ExampleProps): ReactElement {
  return (
    <div data-theme="light">
      <p data-testid="outside">바깥 글</p>
      <Popover {...props}>
        <PopoverTrigger data-testid="trigger" {...trigger}>
          알림 설정
        </PopoverTrigger>
        <PopoverContent data-testid="content" {...content}>
          <p>새 글 알림을 받습니다.</p>
          <button type="button">저장</button>
        </PopoverContent>
      </Popover>
    </div>
  );
}

const content = (): HTMLElement => page.getByTestId("content").element() as HTMLElement;
const trigger = (): HTMLElement => page.getByTestId("trigger").element() as HTMLElement;

/** 바깥(또는 inert가 된 트리거)을 좌표로 누른다. */
async function pressAt(testId: string): Promise<void> {
  await commands.mouseDownOn(testId);
  await commands.mouseUp();
}

/** 내용이 DOM에서 빠질 때까지(퇴장 전환 끝) 기다린다. */
async function expectClosed(): Promise<void> {
  await expect.element(page.getByTestId("content")).not.toBeInTheDocument();
}

describe("열고 닫기", () => {
  test("트리거를 누르면 열리고 다시 누르면 닫힌다", async () => {
    await render(<Example />);
    await expect.element(page.getByTestId("trigger")).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).not.toHaveAttribute("data-open");
    await expect.element(page.getByTestId("content")).not.toBeInTheDocument();

    await userEvent.click(page.getByTestId("trigger"));
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(trigger()).toHaveAttribute("aria-controls", content().id);
    expect(trigger()).toHaveAttribute("data-open", "");
    expect(content()).toHaveAttribute("data-open", "");

    // 열린 동안 트리거는 바깥(inert)이다. 좌표로 누르면 바깥 누름으로 닫히고, 같은 누름으로 다시 열리지 않는다.
    await pressAt("trigger");
    await expectClosed();
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).not.toHaveAttribute("aria-controls");
    expect(trigger()).not.toHaveAttribute("data-open");
  });

  test("Enter와 Space로 열고 Esc로 닫으면 포커스가 트리거로 돌아온다", async () => {
    await render(<Example />);
    await userEvent.tab();
    expect(document.activeElement).toBe(trigger());
    await userEvent.keyboard("{Enter}");
    await expect.element(page.getByRole("dialog")).toBeVisible();
    // 열리면 포커스가 내용(dialog) 자신으로 간다.
    await expect.element(page.getByTestId("content")).toHaveFocus();

    await userEvent.keyboard("{Escape}");
    await expectClosed();
    await expect.element(page.getByTestId("trigger")).toHaveFocus();

    await userEvent.keyboard(" ");
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expectClosed();
    await expect.element(page.getByTestId("trigger")).toHaveFocus();
  });

  test("바깥을 누르면 닫히고 포커스가 트리거로 돌아온다", async () => {
    await render(<Example />);
    await userEvent.click(page.getByTestId("trigger"));
    await expect.element(page.getByRole("dialog")).toBeVisible();
    // 열린 동안 바깥은 inert다(React Aria usePopover 모달 기본값).
    expect(
      (page.getByTestId("outside").element() as HTMLElement).closest("[inert]"),
    ).not.toBeNull();

    await pressAt("outside");
    await expectClosed();
    await expect.element(page.getByTestId("trigger")).toHaveFocus();
    expect((page.getByTestId("outside").element() as HTMLElement).closest("[inert]")).toBeNull();
  });

  test("안을 누르면 닫히지 않는다", async () => {
    await render(<Example />);
    await userEvent.click(page.getByTestId("trigger"));
    await userEvent.click(page.getByRole("button", { name: "저장" }));
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(document.activeElement).toBe(page.getByRole("button", { name: "저장" }).element());
  });
});

describe("포커스", () => {
  test("Tab은 내용 안에서 돈다", async () => {
    await render(
      <Popover defaultOpen>
        <PopoverTrigger>열기</PopoverTrigger>
        <PopoverContent data-testid="content">
          <button type="button">첫째</button>
          <button type="button">둘째</button>
        </PopoverContent>
      </Popover>,
    );
    await expect.element(page.getByTestId("content")).toHaveFocus();
    await userEvent.tab();
    await expect.element(page.getByRole("button", { name: "첫째" })).toHaveFocus();
    await userEvent.tab();
    await expect.element(page.getByRole("button", { name: "둘째" })).toHaveFocus();
    await userEvent.tab();
    await expect.element(page.getByRole("button", { name: "첫째" })).toHaveFocus();
  });

  test("안의 요소가 autoFocus면 그 요소에 포커스가 간다", async () => {
    await render(
      <Popover>
        <PopoverTrigger>이름 바꾸기</PopoverTrigger>
        <PopoverContent>
          {/* oxlint-disable-next-line jsx-a11y/no-autofocus -- Popover를 연 사용자가 바로 입력하는 경우를 본다. */}
          <input aria-label="새 이름" autoFocus />
        </PopoverContent>
      </Popover>,
    );
    await userEvent.click(page.getByRole("button", { name: "이름 바꾸기" }));
    await expect.element(page.getByRole("textbox", { name: "새 이름" })).toHaveFocus();
  });
});

describe("제어와 비제어", () => {
  test("defaultOpen이면 처음부터 열려 있고 비제어로 닫힌다", async () => {
    const onOpenChange = vi.fn();
    await render(<Example defaultOpen onOpenChange={onOpenChange} />);
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expectClosed();
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  test("open을 주면 onOpenChange만 부르고 부모가 바꿔야 닫힌다", async () => {
    const onOpenChange = vi.fn();
    const screen = await render(<Example open onOpenChange={onOpenChange} />);
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    // 부모가 open을 바꾸지 않았으므로 그대로 열려 있다.
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(content()).toHaveAttribute("data-open", "");

    await screen.rerender(<Example open={false} onOpenChange={onOpenChange} />);
    await expectClosed();
  });

  test("상태를 가진 부모가 트리거 누름으로 열고 닫는다", async () => {
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
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByTestId("state")).toHaveTextContent("닫힘");
    await expectClosed();
  });
});

describe("이름과 연결", () => {
  test("이름이 없으면 트리거 글자가 dialog 이름이다", async () => {
    await render(<Example defaultOpen />);
    await expect.element(page.getByRole("dialog", { name: "알림 설정" })).toBeVisible();
    expect(content()).toHaveAttribute("aria-labelledby", trigger().id);
  });

  test("트리거에 id를 주면 그 id로 이름을 잇는다", async () => {
    await render(<Example defaultOpen trigger={{ id: "notify-trigger" }} />);
    await expect.element(page.getByRole("dialog", { name: "알림 설정" })).toBeVisible();
    expect(content()).toHaveAttribute("aria-labelledby", "notify-trigger");
  });

  test("aria-label·aria-labelledby가 이름을 바꾼다", async () => {
    const screen = await render(<Example defaultOpen content={{ "aria-label": "알림 옵션" }} />);
    await expect.element(page.getByRole("dialog", { name: "알림 옵션" })).toBeVisible();
    expect(content()).not.toHaveAttribute("aria-labelledby");
    await screen.rerender(
      <>
        <h2 id="popover-heading">받을 알림</h2>
        <Example defaultOpen content={{ "aria-labelledby": "popover-heading" }} />
      </>,
    );
    await expect.element(page.getByRole("dialog", { name: "받을 알림" })).toBeVisible();
  });

  test("Tide Button을 render로 트리거에 쓴다", async () => {
    await render(
      <Popover>
        <PopoverTrigger render={<Button variant="outline" />} data-testid="trigger">
          필터
        </PopoverTrigger>
        <PopoverContent>필터 목록</PopoverContent>
      </Popover>,
    );
    const button = page.getByRole("button", { name: "필터" });
    expect(button.element()).toHaveAttribute("data-color", "primary");
    expect(button.element()).toHaveAttribute("type", "button");
    await userEvent.click(button);
    await expect.element(page.getByRole("dialog", { name: "필터" })).toBeVisible();
    expect(button.element()).toHaveAttribute("data-open", "");
  });
});

describe("위치와 쌓임", () => {
  test("portal로 body에 붙고 z-popover로 쌓인다", async () => {
    await render(<Example defaultOpen />);
    await expect.element(page.getByRole("dialog")).toBeVisible();
    const style = getComputedStyle(content());
    expect(style.zIndex).toBe("300");
    expect(style.position).toBe("absolute");
    expect(style.isolation).toBe("isolate");
    // portal은 Theme 영역 밖(body)이지만 트리거의 data-theme을 옮겨 받는다.
    expect(content().closest("[data-theme]")).toBe(content());
    expect(content()).toHaveAttribute("data-theme", "light");
    expect(content().parentElement?.closest("[data-testid='outside']")).toBeNull();
  });

  test("dark Theme 영역의 트리거면 내용도 dark 색이다", async () => {
    await render(
      <div data-theme="dark">
        <Popover defaultOpen>
          <PopoverTrigger>열기</PopoverTrigger>
          <PopoverContent data-testid="content">내용</PopoverContent>
        </Popover>
      </div>,
    );
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(content()).toHaveAttribute("data-theme", "dark");
    if (forcedColors()) return;
    expect(getComputedStyle(content()).backgroundColor).toBe(
      resolve("backgroundColor", "var(--tide-bg-raised)", "dark"),
    );
  });

  test.each(["bottom", "top", "left", "right"] as const)(
    "placement %s는 트리거의 그쪽에 8px 떨어져 놓이고 트리거를 덮지 않는다",
    async (placement) => {
      await render(
        <div data-theme="light" style={{ padding: 160 }}>
          <Popover defaultOpen>
            <PopoverTrigger data-testid="trigger">열기</PopoverTrigger>
            <PopoverContent data-testid="content" placement={placement}>
              짧은 내용
            </PopoverContent>
          </Popover>
        </div>,
      );
      await expect
        .element(page.getByTestId("content"))
        .toHaveAttribute("data-placement", placement);
      const t = trigger().getBoundingClientRect();
      // 등장 전환(translate)이 끝난 뒤의 자리를 본다.
      await Promise.all(
        content()
          .getAnimations()
          .map((animation) => animation.finished),
      );
      const c = content().getBoundingClientRect();
      const gap = {
        bottom: c.top - t.bottom,
        top: t.top - c.bottom,
        left: t.left - c.right,
        right: c.left - t.right,
      };
      // 트리거 위치가 소수 px이라 1px 안쪽 오차를 둔다.
      expect(Math.abs(gap[placement] - 8)).toBeLessThanOrEqual(1);
    },
  );

  test("아래 공간이 모자라면 위로 뒤집혀 트리거를 덮지 않는다(WCAG 2.4.11)", async () => {
    await render(
      <div data-theme="light">
        <Popover defaultOpen>
          <PopoverTrigger data-testid="trigger" style={{ position: "fixed", bottom: 16, left: 40 }}>
            열기
          </PopoverTrigger>
          <PopoverContent data-testid="content">
            <p style={{ height: 160 }}>긴 내용</p>
          </PopoverContent>
        </Popover>
      </div>,
    );
    await expect.element(page.getByTestId("content")).toHaveAttribute("data-placement", "top");
    await Promise.all(
      content()
        .getAnimations()
        .map((animation) => animation.finished),
    );
    const t = trigger().getBoundingClientRect();
    const c = content().getBoundingClientRect();
    expect(c.bottom).toBeLessThanOrEqual(t.top);
  });

  test("위아래 모두 모자라면 높이를 줄이고 스크롤해 트리거를 덮지 않는다", async () => {
    await render(
      <div data-theme="light">
        <Popover defaultOpen>
          <PopoverTrigger
            data-testid="trigger"
            style={{ position: "fixed", top: "50%", left: 40, transform: "translateY(-50%)" }}
          >
            열기
          </PopoverTrigger>
          <PopoverContent data-testid="content">
            <p style={{ height: 4000 }}>아주 긴 내용</p>
          </PopoverContent>
        </Popover>
      </div>,
    );
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await Promise.all(
      content()
        .getAnimations()
        .map((animation) => animation.finished),
    );
    const t = trigger().getBoundingClientRect();
    const c = content().getBoundingClientRect();
    const overlaps = c.top < t.bottom && c.bottom > t.top && c.left < t.right && c.right > t.left;
    expect(overlaps).toBe(false);
    expect(content().scrollHeight).toBeGreaterThan(content().clientHeight);
    expect(getComputedStyle(content()).overflowY).toBe("auto");
  });
});

describe("표면", () => {
  test("raised 표면, shadow-md, radius lg, 1px border-raised 경계와 16px 여백이다", async () => {
    await render(<Example defaultOpen />);
    await expect.element(page.getByRole("dialog")).toBeVisible();
    const style = getComputedStyle(content());
    expect(style.borderTopWidth).toBe("1px");
    expect(style.borderTopStyle).toBe("solid");
    expect(style.borderTopLeftRadius).toBe("8px");
    expect(style.padding).toBe("16px");
    expect(style.maxWidth).toBe("320px");
    expect(style.outlineStyle).toBe("none");
    if (forcedColors()) return;
    expect(style.backgroundColor).toBe(resolve("backgroundColor", "var(--tide-bg-raised)"));
    expect(style.color).toBe(resolve("color", "var(--tide-text-default)"));
    expect(style.borderTopColor).toBe(transparent);
    // Tailwind shadow class는 ring·inset 자리(투명 0px)를 앞에 두고 마지막 두 레이어가 shadow-md다.
    expect(style.boxShadow.endsWith(resolve("boxShadow", "var(--tide-shadow-md)"))).toBe(true);
  });

  test("forced-colors에서는 그림자 없이 경계가 시스템 색으로 보인다", async () => {
    await render(<Example defaultOpen />);
    await expect.element(page.getByRole("dialog")).toBeVisible();
    if (!forcedColors()) return;
    const style = getComputedStyle(content());
    expect(style.boxShadow).toBe("none");
    expect(style.borderTopWidth).toBe("1px");
    expect(style.borderTopColor).not.toBe(transparent);
    expect(style.borderTopColor).not.toBe(style.backgroundColor);
  });
});

describe("등장과 퇴장 motion", () => {
  // 전환 중 값(등장 300ms, 퇴장 150ms)은 data-open이 붙거나 빠지는 순간에 붙잡는다(test/motion.ts).
  // 입력 명령이나 rerender가 돌아온 뒤에 읽으면 부하가 클 때 전환이 먼저 끝난다(전체 실행에서 재현).
  test("등장: opacity + blur 4px + 트리거 쪽 4px에서 normal(300ms)로 들어온다", async () => {
    const screen = await render(<Example open={false} />);
    const entered = captureWhen(
      () => document.querySelector("[data-testid='content'][data-open]") !== null,
      () => ({ style: styleSnapshot(content()), running: transitions(content()) }),
    );
    await screen.rerender(<Example open />);
    const { style, running } = await entered;
    expect(style.transitionBehavior).toContain("allow-discrete");
    expect(style.transitionDuration.split(", ")[0]).toBe("0.3s");
    expect(style.transitionTimingFunction.startsWith("cubic-bezier(0, 0, 0.2, 1)")).toBe(true);
    expect(style.transitionProperty).not.toContain("all");

    expect(running.get("opacity")?.from["opacity"]).toBe("0");
    if (reducedMotion()) {
      // 움직임 줄이기: 이동·blur 없이 opacity만 바뀐다.
      expect(style.transitionProperty).toBe("opacity, display");
      expect(running.has("filter")).toBe(false);
      expect(running.has("translate")).toBe(false);

      return;
    }
    expect(style.transitionProperty).toBe("opacity, filter, translate, display");
    expect(running.get("filter")?.from["filter"]).toBe("blur(4px)");
    // placement bottom: 트리거 쪽(위)으로 4px 떨어진 곳에서 시작한다.
    expect(running.get("translate")?.from["translate"]).toBe("0px -4px");
  });

  test("퇴장: 같은 조합의 절반(blur 2px, 2px)으로 fast(150ms)에 사라진 뒤 DOM에서 빠진다", async () => {
    const screen = await render(<Example open />);
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await Promise.all(
      content()
        .getAnimations()
        .map((animation) => animation.finished),
    );
    const element = content();

    const exit = captureExit(element, () => ({
      connected: element.isConnected,
      style: styleSnapshot(element),
      running: transitions(element),
    }));
    await screen.rerender(<Example open={false} />);
    const { connected, style, running } = await exit;
    expect(element.hasAttribute("data-open")).toBe(false);
    // 퇴장 중에도 DOM에 남아 전환을 그린다.
    expect(connected).toBe(true);
    expect(style.transitionDuration.split(", ")[0]).toBe("0.15s");
    expect(style.pointerEvents).toBe("none");
    expect(running.get("opacity")?.to["opacity"]).toBe("0");
    // display는 allow-discrete로 전환 끝까지 none이 되지 않는다.
    expect(running.has("display")).toBe(true);
    if (reducedMotion()) {
      expect(running.has("filter")).toBe(false);
      expect(running.has("translate")).toBe(false);
    } else {
      expect(running.get("filter")?.to["filter"]).toBe("blur(2px)");
      expect(running.get("translate")?.to["translate"]).toBe("0px -2px");
    }
    await expect.poll(() => element.isConnected).toBe(false);
  });

  test("퇴장 중에 다시 열면 같은 요소가 DOM에 남아 열린 상태로 돌아온다", async () => {
    // 퇴장(150ms) 안에 다시 열어야 하므로 사용자 입력 대신 열림 상태를 바로 바꾼다. 닫고 다시 여는 일을 한 task 안에서
    // 해서, 사이에 렌더링 단계가 없어 퇴장 전환이 끝나 요소가 빠질 수 없다(test/motion.ts).
    const control = openControl((open) => <Example open={open} />);
    await render(control.element);
    await expect.element(page.getByRole("dialog")).toBeVisible();
    const element = content();
    // 등장 전환(300ms)이 끝난 뒤 닫는다. 등장 시작값(opacity 0)에서 닫으면 바뀌는 값이 없어 퇴장 전환이 생기지 않는다.
    await Promise.all(element.getAnimations().map((animation) => animation.finished));
    control.set(false);
    expect(element.hasAttribute("data-open")).toBe(false);
    expect(element.isConnected).toBe(true);
    expect(transitions(element).has("opacity")).toBe(true);
    control.set(true);
    expect(content()).toBe(element);
    expect(element).toHaveAttribute("data-open", "");
    // 처음 퇴장 시간이 지나도 빠지지 않는다.
    await new Promise((done) => setTimeout(done, 400));
    expect(element.isConnected).toBe(true);
    await expect.element(page.getByRole("dialog")).toBeVisible();
  });
});

describe("ref·className·타입", () => {
  test("ref는 각 요소에 닿고 className이 기본 class를 이긴다", async () => {
    const triggerRef = vi.fn();
    const contentRef = vi.fn();
    await render(
      <Popover defaultOpen>
        <PopoverTrigger ref={triggerRef} className="text-primary">
          열기
        </PopoverTrigger>
        <PopoverContent ref={contentRef} className="p-2" data-testid="content">
          내용
        </PopoverContent>
      </Popover>,
    );
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(triggerRef).toHaveBeenCalledWith(page.getByRole("button", { name: "열기" }).element());
    expect(contentRef).toHaveBeenCalledWith(content());
    expect(page.getByRole("button", { name: "열기" }).element()).toHaveAttribute(
      "class",
      "text-primary",
    );
    expect(content().className).toContain("p-2");
    expect(content().className).not.toContain("p-4");
    expect(getComputedStyle(content()).padding).toBe("8px");
  });

  test("기본 트리거는 class 속성이 없는 type=button이다", async () => {
    await render(<Example />);
    expect(trigger()).not.toHaveAttribute("class");
    expect(trigger()).toHaveAttribute("type", "button");
  });

  test("지원하지 않는 값은 타입 오류다", () => {
    const props: PopoverContentProps = {
      // @ts-expect-error -- placement는 정해진 12가지다.
      placement: "middle",
    };
    // @ts-expect-error -- 역할은 dialog로 고정이다.
    const role: PopoverContentProps = { role: "menu" };
    // @ts-expect-error -- 내용 id는 트리거의 aria-controls가 가리키므로 바꾸지 않는다.
    const id: PopoverContentProps = { id: "x" };
    expect([props, role, id]).toHaveLength(3);
  });
});
