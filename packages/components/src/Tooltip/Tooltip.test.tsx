// Tooltip 동작을 실제 Chromium에서 확인한다(tide-v0-impl 티켓 26).
// 두 instance에서 모두 돈다. 두 번째 instance(forced-colors·reduced-motion)에서는 경계가 시스템 색으로 남는지와
// 퇴장이 그대로 opacity 전환인지를 본다.
//
// React Aria Tooltip 상태는 전역 warmup을 갖는다. 한 Tooltip이 닫힌 뒤 0.5초 안에 다른 Tooltip을 열면 delay 없이 바로
// 열린다. delay를 재는 테스트는 그 시간이 지나기를 먼저 기다린다. 나머지는 delay={0}으로 연다.
import { useState, type ReactElement } from "react";
import { describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { captureExit, openControl, styleSnapshot, transitions } from "../../test/motion.ts";

import { IconButton } from "../IconButton/IconButton.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "../Popover/index.ts";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  type TooltipContentProps,
  type TooltipProps,
  type TooltipTriggerProps,
} from "./index.ts";

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

interface ExampleProps extends Omit<TooltipProps, "children"> {
  readonly content?: Partial<TooltipContentProps>;
  readonly trigger?: Partial<TooltipTriggerProps>;
}

function Example({ content, trigger, delay = 0, ...props }: ExampleProps): ReactElement {
  return (
    <div data-theme="light" style={{ padding: 80 }}>
      <button type="button" data-testid="before">
        앞 버튼
      </button>
      <Tooltip delay={delay} {...props}>
        <TooltipTrigger data-testid="trigger" {...trigger}>
          저장
        </TooltipTrigger>
        <TooltipContent data-testid="content" {...content}>
          Ctrl+S로도 저장합니다
        </TooltipContent>
      </Tooltip>
      <button type="button" data-testid="after">
        뒤 버튼
      </button>
    </div>
  );
}

const content = (): HTMLElement => page.getByTestId("content").element() as HTMLElement;
const trigger = (): HTMLElement => page.getByTestId("trigger").element() as HTMLElement;

/** 설명이 DOM에서 빠질 때까지(퇴장 전환 끝) 기다린다. */
async function expectClosed(): Promise<void> {
  await expect.element(page.getByTestId("content")).not.toBeInTheDocument();
}

/**
 * 마우스를 트리거에 올린다. 먼저 앞 버튼으로 옮겨 포인터가 트리거 밖에서 들어오게 한다.
 * React Aria는 마지막 입력이 포인터(pointermove)일 때만 hover로 연다.
 * 테스트 시작 때 마우스는 페이지 밖에 있다(test/browser-setup.ts). 앞 테스트 자리에 마우스가 남아 있으면 Chromium이
 * 새로 그린 트리거에 약 0.1초 뒤 pointerenter를 보내 render 직후 Tooltip이 저절로 열린다.
 */
async function hoverTrigger(): Promise<void> {
  await userEvent.hover(page.getByTestId("before"));
  await userEvent.hover(page.getByTestId("trigger"));
}

/** 키보드로 트리거에 포커스한다(앞 버튼에서 Tab). 키보드 포커스여야 Tooltip이 열린다. */
async function tabToTrigger(): Promise<void> {
  (page.getByTestId("before").element() as HTMLElement).focus();
  await userEvent.tab();
  expect(document.activeElement).toBe(trigger());
}

describe("hover로 열고 닫기", () => {
  test("delay(기본 500ms)가 지난 뒤에 열린다", async () => {
    // 앞 테스트 파일·테스트의 warmup(0.5초)이 끝나기를 기다린다.
    await wait(700);
    await render(<Example delay={500} />);
    await userEvent.hover(page.getByTestId("before"));
    const start = performance.now();
    await userEvent.hover(page.getByTestId("trigger"));
    await expect.element(page.getByRole("tooltip"), { timeout: 5000 }).toBeVisible();
    expect(performance.now() - start).toBeGreaterThanOrEqual(480);
  });

  test("마우스를 올리면 열리고 설명이 트리거에 연결되며, 떠나면 닫힌다", async () => {
    await render(<Example />);
    expect(trigger()).not.toHaveAttribute("aria-describedby");
    await expect.element(page.getByTestId("content")).not.toBeInTheDocument();

    await hoverTrigger();
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    expect(trigger()).toHaveAttribute("aria-describedby", content().id);
    await expect
      .element(page.getByRole("button", { name: "저장" }))
      .toHaveAccessibleDescription("Ctrl+S로도 저장합니다");
    expect(content()).toHaveAttribute("data-open", "");
    // 마우스로 연 Tooltip은 포커스를 옮기지 않는다.
    expect(document.activeElement).toBe(document.body);

    await userEvent.hover(page.getByTestId("after"));
    await expectClosed();
    expect(trigger()).not.toHaveAttribute("aria-describedby");
  });

  test("설명 위로 포인터를 옮기면 닫히지 않는다(WCAG 1.4.13)", async () => {
    await render(<Example />);
    await hoverTrigger();
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    await userEvent.hover(page.getByTestId("content"));
    // closeDelay(300ms)가 지나도 열려 있다.
    await wait(500);
    expect(content()).toHaveAttribute("data-open", "");
    await userEvent.hover(page.getByTestId("after"));
    await expectClosed();
  });

  test("트리거를 누르면 닫힌다", async () => {
    await render(<Example />);
    await hoverTrigger();
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    await userEvent.click(page.getByTestId("trigger"));
    await expectClosed();
  });
});

describe("키보드", () => {
  test("Tab으로 포커스하면 delay 없이 열리고 Esc로 닫혀도 포커스는 트리거에 남는다", async () => {
    // delay가 길어도 키보드 포커스는 기다리지 않는다.
    await render(<Example delay={5000} />);
    await tabToTrigger();
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    expect(trigger()).toHaveAttribute("aria-describedby", content().id);

    await userEvent.keyboard("{Escape}");
    await expectClosed();
    expect(document.activeElement).toBe(trigger());
  });

  test("Tab으로 떠나면 닫힌다", async () => {
    await render(<Example />);
    await tabToTrigger();
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    await userEvent.tab();
    expect(document.activeElement).toBe(page.getByTestId("after").element());
    await expectClosed();
  });

  test("마우스로 눌러 생긴 포커스로는 열리지 않는다", async () => {
    await render(<Example />);
    // 누르면 hover로 열린 것도 닫히고, 포커스(포커스 표시 없음)로는 다시 열리지 않는다.
    await userEvent.click(page.getByTestId("trigger"));
    await userEvent.hover(page.getByTestId("after"));
    await wait(400);
    await expect.element(page.getByTestId("content")).not.toBeInTheDocument();
  });

  test("disabled면 열리지 않고 트리거는 그대로 포커스된다", async () => {
    await render(<Example disabled />);
    await tabToTrigger();
    await hoverTrigger();
    await wait(300);
    await expect.element(page.getByTestId("content")).not.toBeInTheDocument();
    expect(trigger()).not.toHaveAttribute("aria-describedby");
  });
});

describe("제어와 연결", () => {
  test("defaultOpen이면 처음부터 열려 있고 비제어로 닫힌다", async () => {
    const onOpenChange = vi.fn();
    await render(<Example defaultOpen onOpenChange={onOpenChange} />);
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expectClosed();
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  test("open을 주면 onOpenChange만 부르고 부모가 바꿔야 닫힌다", async () => {
    const onOpenChange = vi.fn();
    const screen = await render(<Example open onOpenChange={onOpenChange} />);
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    await screen.rerender(<Example open={false} onOpenChange={onOpenChange} />);
    await expectClosed();
  });

  test("상태를 가진 부모가 hover로 열고 닫는다", async () => {
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
    await hoverTrigger();
    await expect.element(page.getByTestId("state")).toHaveTextContent("열림");
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    await userEvent.hover(page.getByTestId("after"));
    await expect.element(page.getByTestId("state")).toHaveTextContent("닫힘");
    await expectClosed();
  });

  test("앱의 aria-describedby 뒤에 설명 id를 더한다", async () => {
    await render(
      <>
        <p id="hint">변경 사항이 있습니다</p>
        <Example defaultOpen trigger={{ "aria-describedby": "hint" }} />
      </>,
    );
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    expect(trigger()).toHaveAttribute("aria-describedby", `hint ${content().id}`);
  });

  test("IconButton을 render로 트리거에 쓴다", async () => {
    await render(
      <>
        <button type="button" data-testid="before">
          앞 버튼
        </button>
        <Tooltip delay={0}>
          <TooltipTrigger
            render={
              <IconButton aria-label="복사" variant="ghost" color="neutral">
                <svg aria-hidden="true" />
              </IconButton>
            }
            data-testid="trigger"
          />
          <TooltipContent>클립보드에 복사</TooltipContent>
        </Tooltip>
      </>,
    );
    const button = page.getByRole("button", { name: "복사" });
    expect(button.element()).toHaveAttribute("data-color", "neutral");
    await hoverTrigger();
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    await expect.element(button).toHaveAccessibleDescription("클립보드에 복사");
  });
});

describe("위치와 쌓임", () => {
  test("portal로 body에 붙고 z-tooltip으로 쌓이며 트리거의 Theme을 이어받는다", async () => {
    await render(<Example defaultOpen />);
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    const style = getComputedStyle(content());
    expect(style.zIndex).toBe("500");
    expect(style.position).toBe("absolute");
    expect(style.isolation).toBe("isolate");
    expect(content().parentElement).toBe(document.body);
    expect(content()).toHaveAttribute("data-theme", "light");
  });

  test("열린 Popover 위에 보이고 inert가 되지 않으며, Esc는 Tooltip만 닫는다", async () => {
    await render(
      <div data-theme="light" style={{ padding: 80 }}>
        <Popover defaultOpen>
          <PopoverTrigger>공유</PopoverTrigger>
          <PopoverContent data-testid="popover">
            <Tooltip delay={0}>
              <TooltipTrigger data-testid="trigger">링크 복사</TooltipTrigger>
              <TooltipContent data-testid="content">주소를 클립보드에 넣습니다</TooltipContent>
            </Tooltip>
          </PopoverContent>
        </Popover>
      </div>,
    );
    await expect.element(page.getByRole("dialog")).toBeVisible();
    // Popover가 열리면 dialog에 포커스가 온다. Tab으로 안의 트리거에 키보드 포커스한다.
    await userEvent.tab();
    expect(document.activeElement).toBe(trigger());
    await expect.element(page.getByRole("tooltip")).toBeVisible();

    const popover = page.getByTestId("popover").element() as HTMLElement;
    expect(Number(getComputedStyle(content()).zIndex)).toBeGreaterThan(
      Number(getComputedStyle(popover).zIndex),
    );
    // Popover(모달)가 바깥을 inert로 막아도 Tooltip은 막히지 않는다.
    expect(content().closest("[inert]")).toBeNull();
    expect(content().closest("[aria-hidden='true']")).toBeNull();
    await expect
      .element(page.getByRole("button", { name: "링크 복사" }))
      .toHaveAccessibleDescription("주소를 클립보드에 넣습니다");
    // 설명이 놓인 곳에서 가장 위에 그려진 요소가 Tooltip이다.
    const rect = content().getBoundingClientRect();
    const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    expect(content().contains(top)).toBe(true);

    await userEvent.keyboard("{Escape}");
    await expectClosed();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(document.activeElement).toBe(trigger());
  });

  test.each(["top", "bottom", "left", "right"] as const)(
    "placement %s는 트리거의 그쪽에 4px 떨어져 놓인다",
    async (placement) => {
      // 어느 쪽에도 뒤집히지 않도록 사방에 공간을 둔다.
      await render(
        <div data-theme="light" style={{ padding: 200 }}>
          <Tooltip defaultOpen>
            <TooltipTrigger data-testid="trigger">열기</TooltipTrigger>
            <TooltipContent data-testid="content" placement={placement}>
              짧은 설명
            </TooltipContent>
          </Tooltip>
        </div>,
      );
      await expect
        .element(page.getByTestId("content"))
        .toHaveAttribute("data-placement", placement);
      const t = trigger().getBoundingClientRect();
      const c = content().getBoundingClientRect();
      const gap = {
        bottom: c.top - t.bottom,
        top: t.top - c.bottom,
        left: t.left - c.right,
        right: c.left - t.right,
      };
      // 트리거 위치가 소수 px이라 1px 안쪽 오차를 둔다.
      expect(Math.abs(gap[placement] - 4)).toBeLessThanOrEqual(1);
    },
  );

  test("위 공간이 모자라면 아래로 뒤집힌다", async () => {
    await render(
      <div data-theme="light">
        <Tooltip defaultOpen>
          <TooltipTrigger data-testid="trigger" style={{ position: "fixed", top: 4, left: 40 }}>
            맨 위
          </TooltipTrigger>
          <TooltipContent data-testid="content">아래에 뜹니다</TooltipContent>
        </Tooltip>
      </div>,
    );
    await expect.element(page.getByTestId("content")).toHaveAttribute("data-placement", "bottom");
    expect(content().getBoundingClientRect().top).toBeGreaterThanOrEqual(
      trigger().getBoundingClientRect().bottom,
    );
  });
});

describe("표면", () => {
  test("raised 표면, shadow-md, radius lg, 1px border-raised, 여백 4px·8px, body-sm이다", async () => {
    await render(<Example defaultOpen />);
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    const style = getComputedStyle(content());
    expect(style.borderTopWidth).toBe("1px");
    expect(style.borderTopStyle).toBe("solid");
    expect(style.borderTopLeftRadius).toBe("8px");
    expect(style.padding).toBe("4px 8px");
    expect(style.fontSize).toBe("14px");
    expect(style.maxWidth).toBe("240px");
    if (forcedColors()) return;
    expect(style.backgroundColor).toBe(resolve("backgroundColor", "var(--tide-bg-raised)"));
    expect(style.color).toBe(resolve("color", "var(--tide-text-default)"));
    expect(style.borderTopColor).toBe(transparent);
    expect(style.boxShadow.endsWith(resolve("boxShadow", "var(--tide-shadow-md)"))).toBe(true);
  });

  test("dark Theme 영역의 트리거면 설명도 dark 색이다", async () => {
    await render(
      <div data-theme="dark">
        <Tooltip defaultOpen>
          <TooltipTrigger>열기</TooltipTrigger>
          <TooltipContent data-testid="content">설명</TooltipContent>
        </Tooltip>
      </div>,
    );
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    expect(content()).toHaveAttribute("data-theme", "dark");
    if (forcedColors()) return;
    expect(getComputedStyle(content()).backgroundColor).toBe(
      resolve("backgroundColor", "var(--tide-bg-raised)", "dark"),
    );
  });

  test("forced-colors에서는 그림자 없이 경계가 시스템 색으로 보인다", async () => {
    await render(<Example defaultOpen />);
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    if (!forcedColors()) return;
    const style = getComputedStyle(content());
    expect(style.boxShadow).toBe("none");
    expect(style.borderTopWidth).toBe("1px");
    expect(style.borderTopColor).not.toBe(transparent);
    expect(style.borderTopColor).not.toBe(style.backgroundColor);
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
    expect(style.display).not.toBe("none");
    expect(content().getAnimations()).toHaveLength(0);
  });

  test("퇴장: opacity만 fast(150ms)로 사라진 뒤 DOM에서 빠진다", async () => {
    const screen = await render(<Example open />);
    await expect.element(page.getByRole("tooltip")).toBeVisible();
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
    expect(style.transitionTimingFunction.startsWith("cubic-bezier(0, 0, 0.2, 1)")).toBe(true);
    expect(style.transitionBehavior).toContain("allow-discrete");
    expect(style.pointerEvents).toBe("none");
    expect(running.get("opacity")?.to["opacity"]).toBe("0");
    expect(running.has("display")).toBe(true);
    // 이동·blur·확대는 없다(움직임 줄이기와 같은 값).
    expect(running.has("filter")).toBe(false);
    expect(running.has("translate")).toBe(false);
    expect(running.has("scale")).toBe(false);
    await expect.poll(() => element.isConnected).toBe(false);
  });

  test("퇴장 중에 다시 열면 같은 요소가 전환 없이 바로 돌아온다", async () => {
    const control = openControl((open) => <Example open={open} />);
    await render(control.element);
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    const element = content();
    // 닫고 다시 여는 일을 한 task 안에서 한다. 사이에 렌더링 단계가 없어 퇴장 전환이 끝나 요소가 빠질 수 없다(test/motion.ts).
    control.set(false);
    expect(element.hasAttribute("data-open")).toBe(false);
    expect(element.isConnected).toBe(true);
    expect(transitions(element).has("opacity")).toBe(true);
    control.set(true);
    expect(content()).toBe(element);
    expect(getComputedStyle(element).opacity).toBe("1");
    expect(element.getAnimations()).toHaveLength(0);
    await wait(300);
    expect(element.isConnected).toBe(true);
  });
});

describe("ref·className·타입", () => {
  test("ref는 각 요소에 닿고 className이 기본 class를 이긴다", async () => {
    const triggerRef = vi.fn();
    const contentRef = vi.fn();
    await render(
      <Tooltip defaultOpen>
        <TooltipTrigger ref={triggerRef} className="text-primary">
          열기
        </TooltipTrigger>
        <TooltipContent ref={contentRef} className="px-3" data-testid="content">
          설명
        </TooltipContent>
      </Tooltip>,
    );
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    const button = page.getByRole("button", { name: "열기" }).element();
    expect(triggerRef).toHaveBeenCalledWith(button);
    expect(contentRef).toHaveBeenCalledWith(content());
    expect(button).toHaveAttribute("class", "text-primary");
    expect(content().className).toContain("px-3");
    expect(content().className).not.toContain("px-2");
    expect(getComputedStyle(content()).paddingLeft).toBe("12px");
  });

  test("기본 트리거는 class 속성이 없는 type=button이다", async () => {
    await render(<Example />);
    expect(trigger()).not.toHaveAttribute("class");
    expect(trigger()).toHaveAttribute("type", "button");
  });

  test("지원하지 않는 값은 타입 오류다", () => {
    const props: TooltipContentProps = {
      // @ts-expect-error -- placement는 정해진 12가지다.
      placement: "middle",
    };
    // @ts-expect-error -- 역할은 tooltip으로 고정이다.
    const role: TooltipContentProps = { role: "dialog" };
    // @ts-expect-error -- 설명 id는 트리거의 aria-describedby가 가리키므로 바꾸지 않는다.
    const id: TooltipContentProps = { id: "x" };
    // @ts-expect-error -- React Aria 이름(isDisabled)은 드러내지 않는다. disabled를 쓴다.
    const aria: Omit<TooltipProps, "children"> = { isDisabled: true };
    expect([props, role, id, aria]).toHaveLength(4);
  });
});
