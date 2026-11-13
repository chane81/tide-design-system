// Toast 동작을 실제 Chromium에서 확인한다(tide-v0-impl 티켓 34).
// 두 instance에서 모두 돈다. 두 번째 instance(forced-colors·reduced-motion)에서는 경계가 시스템 색으로 남는지와
// 등장·퇴장이 opacity 전환만 남는지를 본다.
//
// 자동 닫힘 시간은 가짜 타이머(setTimeout·clearTimeout·Date만)로 앞당긴다. react-stately Timer가 setTimeout과
// Date.now로 남은 시간을 잰다. 가짜 타이머는 Toast를 띄운 뒤에 켜고 테스트 끝에 끈다.
import { useState, type ReactElement } from "react";
import { I18nProvider } from "react-aria";
import { afterEach, describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { captureExit, captureWhen, styleSnapshot, transitions } from "../../test/motion.ts";

import { Button } from "../Button/Button.tsx";
import { Dialog, DialogContent, DialogTitle } from "../Dialog/index.ts";
import {
  ToastQueue,
  ToastRegion,
  type ToastOptions,
  type ToastQueueOptions,
  type ToastRegionProps,
} from "./index.ts";

const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;
const reducedMotion = (): boolean => matchMedia("(prefers-reduced-motion: reduce)").matches;
const transparent = "rgba(0, 0, 0, 0)";

/** CSS 값 하나를 실제로 계산한 결과. Token 변수를 계산값과 비교할 때 쓴다. */
function resolve(property: "backgroundColor" | "color", value: string, color?: string): string {
  const probe = document.createElement("div");
  probe.dataset["theme"] = "light";
  if (color) probe.dataset["color"] = color;
  probe.style.forcedColorAdjust = "none";
  probe.style[property] = value;
  document.body.append(probe);
  const resolved = getComputedStyle(probe)[property];
  probe.remove();
  return resolved;
}

afterEach(() => {
  vi.useRealTimers();
});

/** 영역을 그리고 큐를 돌려준다. */
async function setup(
  options?: ToastQueueOptions,
  props?: Partial<ToastRegionProps>,
): Promise<ToastQueue> {
  const queue = new ToastQueue(options);
  await render(
    <div data-theme="light">
      <button type="button" data-testid="outside">
        저장
      </button>
      <ToastRegion queue={queue} data-testid="region" {...props} />
    </div>,
  );
  return queue;
}

const region = (): HTMLElement => page.getByTestId("region").element() as HTMLElement;
const toastByName = (name: string) => page.getByRole("alertdialog", { name });

/** Toast를 띄우고 그 요소가 보일 때까지 기다린다. */
async function show(queue: ToastQueue, options: ToastOptions): Promise<HTMLElement> {
  queue.add(options);
  const locator = toastByName(String(options.title));
  await expect.element(locator).toBeVisible();
  return locator.element() as HTMLElement;
}

/** 등장 전환이 끝날 때까지 기다린다. */
async function settle(element: Element): Promise<void> {
  await Promise.all(element.getAnimations().map((animation) => animation.finished));
}

/** setTimeout·Date만 가짜로 바꾼다. React(MessageChannel)·requestAnimationFrame·Playwright 통신은 그대로다. */
function fakeTimers(): void {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
}

/** 다음 두 프레임까지 기다린다. 가짜 타이머를 켠 동안 렌더·effect가 끝나기를 기다릴 때 쓴다. */
async function frames(): Promise<void> {
  for (let i = 0; i < 2; i += 1) await new Promise((done) => requestAnimationFrame(done));
}

/** 가짜 타이머를 켠 채로 Toast를 띄운다. 자동 닫힘 타이머가 가짜 setTimeout으로 시작된다. */
async function addFaked(queue: ToastQueue, options: ToastOptions): Promise<HTMLElement> {
  queue.add(options);
  await frames();
  const found = [...document.querySelectorAll("[role='alertdialog']")].find((element) =>
    element.textContent?.startsWith(String(options.title)),
  );
  if (!found) throw new Error(`Toast를 찾지 못했다: ${String(options.title)}`);
  return found as HTMLElement;
}

describe("영역과 읽기", () => {
  test("Toast가 없으면 아무것도 그리지 않고, 띄우면 body에 portal한 region 랜드마크가 생긴다", async () => {
    const queue = new ToastQueue();
    // 기본 이름은 React Aria 번역이라 locale을 따른다(ko-KR 「1개 알림.」).
    await render(
      <I18nProvider locale="ko-KR">
        <ToastRegion queue={queue} data-testid="region" />
      </I18nProvider>,
    );
    expect(document.querySelector("[role='region']")).toBeNull();
    await show(queue, { title: "저장했습니다" });
    const landmark = page.getByRole("region", { name: "1개 알림." });
    await expect.element(landmark).toBeVisible();
    expect(region().parentElement).toBe(document.body);
    // 열린 모달 오버레이가 바깥을 inert로 막을 때 빠지는 표시(React Aria useToastRegion)
    expect(region()).toHaveAttribute("data-react-aria-top-layer");
  });

  test("aria-label로 영역 이름을 바꾼다", async () => {
    const queue = await setup(undefined, { "aria-label": "알림" });
    await show(queue, { title: "저장했습니다" });
    await expect.element(page.getByRole("region", { name: "알림" })).toBeVisible();
  });

  test("Toast는 제목이 이름, 본문이 설명인 alertdialog이고 안의 글자는 alert로 읽힌다", async () => {
    const queue = await setup();
    const toast = await show(queue, {
      title: "업로드 완료",
      description: "파일 3개를 올렸습니다.",
    });
    await expect
      .element(toastByName("업로드 완료"))
      .toHaveAccessibleDescription("파일 3개를 올렸습니다.");
    expect(toast).toHaveAttribute("aria-modal", "false");
    expect(toast).toHaveAttribute("tabindex", "0");
    const alert = toast.querySelector("[role='alert']");
    expect(alert).not.toBeNull();
    expect(alert).toHaveAttribute("aria-atomic", "true");
    expect(alert).toHaveTextContent("업로드 완료파일 3개를 올렸습니다.");
    // 상태 아이콘은 장식용이다.
    expect(toast.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  test("본문이 없으면 설명이 없다", async () => {
    const queue = await setup();
    const toast = await show(queue, { title: "복사했습니다" });
    expect(toast).not.toHaveAttribute("aria-describedby");
  });
});

describe("큐", () => {
  test("한 번에 3개까지 보이고, 새 Toast가 DOM 앞·화면 아래에 온다. 닫으면 기다리던 Toast가 나온다", async () => {
    const queue = await setup();
    for (const title of ["하나", "둘", "셋", "넷"]) queue.add({ title });
    await expect.element(toastByName("넷")).toBeVisible();
    await expect.poll(() => page.getByRole("alertdialog").elements().length).toBe(3);
    const titles = page
      .getByRole("alertdialog")
      .elements()
      .map((element) => element.querySelector("[role='alert'] > div")?.textContent);
    expect(titles).toEqual(["넷", "셋", "둘"]);
    const newest = toastByName("넷").element().getBoundingClientRect();
    const older = toastByName("셋").element().getBoundingClientRect();
    expect(newest.top).toBeGreaterThan(older.top);

    await userEvent.click(page.getByRole("button", { name: "닫기" }).first());
    await expect.element(toastByName("하나")).toBeVisible();
    await expect.poll(() => page.getByRole("alertdialog").elements().length).toBe(3);
  });

  test("maxVisible로 보이는 수를 바꾸고, queue.close·clear로 닫는다", async () => {
    const onClose = vi.fn();
    const queue = await setup({ maxVisible: 1 });
    queue.add({ title: "하나", onClose });
    const key = queue.add({ title: "둘" });
    await expect.element(toastByName("둘")).toBeVisible();
    expect(page.getByRole("alertdialog").elements()).toHaveLength(1);
    queue.close(key);
    await expect.element(toastByName("하나")).toBeVisible();
    queue.add({ title: "셋" });
    await expect.element(toastByName("셋")).toBeVisible();
    queue.clear();
    await expect.poll(() => document.querySelector("[role='region']")).toBeNull();
    // clear는 onClose를 부르지 않는다(react-stately ToastQueue.clear).
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("자동 닫힘", () => {
  // 가짜 타이머를 켠 동안에는 expect.element·expect.poll(타이머로 다시 시도)을 쓰지 않고 frames()로 렌더를 기다린다.
  // vitest 5.1.0 browser는 요소를 기다리는 명령(hover·unhover·click 등 locator 명령)이 도는 동안, 가짜 타이머가 켜져
  // 있으면 실제 50ms마다 `vi.advanceTimersByTime(50)`을 부른다(`@vitest/browser` dist/context.js
  // `advanceFakeTimersWhilePending`). 그래서 그런 명령 뒤에는 가짜 시계가 명령에 걸린 실제 시간만큼 움직여 있다.
  // 부하가 크면 수 초가 될 수 있으니, 명령을 쓰는 테스트는 그 시간이 결과를 바꾸지 않게 짠다.
  test("기본 5초 뒤에 닫히고 onClose를 부른다. 그 전에는 닫히지 않는다", async () => {
    const onClose = vi.fn();
    const queue = await setup();
    fakeTimers();
    const toast = await addFaked(queue, { title: "저장했습니다", onClose });
    vi.advanceTimersByTime(4800);
    await frames();
    expect(toast).toHaveAttribute("data-open", "");
    expect(onClose).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    await frames();
    expect(onClose).toHaveBeenCalledOnce();
    expect(toast).not.toHaveAttribute("data-open");
    vi.useRealTimers();
    await expect.poll(() => toast.isConnected).toBe(false);
  });

  test("5초보다 짧은 timeout은 5초로 올리고, 긴 값은 그대로 쓴다", async () => {
    const queue = await setup();
    fakeTimers();
    const short = await addFaked(queue, { title: "짧게", timeout: 1000 });
    const long = await addFaked(queue, { title: "길게", timeout: 8000 });
    vi.advanceTimersByTime(4800);
    await frames();
    expect(short).toHaveAttribute("data-open", "");
    vi.advanceTimersByTime(300);
    await frames();
    expect(short).not.toHaveAttribute("data-open");
    expect(long).toHaveAttribute("data-open", "");
    vi.advanceTimersByTime(3000);
    await frames();
    expect(long).not.toHaveAttribute("data-open");
  });

  test("timeout null·Infinity는 자동으로 닫지 않는다", async () => {
    const queue = await setup();
    fakeTimers();
    const none = await addFaked(queue, { title: "직접 닫기", timeout: null });
    const infinite = await addFaked(queue, { title: "무한", timeout: Number.POSITIVE_INFINITY });
    vi.advanceTimersByTime(600_000);
    await frames();
    expect(none).toHaveAttribute("data-open", "");
    expect(infinite).toHaveAttribute("data-open", "");
  });

  test("액션이 있거나 danger(오류)면 timeout을 줘도 자동으로 닫지 않는다", async () => {
    const queue = await setup();
    fakeTimers();
    const action = await addFaked(queue, {
      title: "삭제했습니다",
      action: { label: "되돌리기" },
      timeout: 5000,
    });
    const error = await addFaked(queue, {
      title: "저장하지 못했습니다",
      color: "danger",
      timeout: 5000,
    });
    vi.advanceTimersByTime(600_000);
    await frames();
    expect(action).toHaveAttribute("data-open", "");
    expect(error).toHaveAttribute("data-open", "");
  });

  test("영역에 마우스를 올린 동안 멈추고, 떠나면 남은 시간이 지나 닫힌다", async () => {
    // hover·unhover 명령이 도는 동안 가짜 시계가 실제 시간만큼 움직인다(describe 주석). 5초 Toast는 부하로 명령이 2초를
    // 넘기면 마우스가 닿기 전에 닫혀 hover가 Toast를 찾지 못했다(전체 turbo 실행, 2026-11-12). 그래서 테스트 시간 제한
    // (15초)보다 훨씬 긴 60초 Toast를 쓰고, 마우스가 들어오고 나간 순간의 가짜 시각을 그 자리에서 기록해 남은 시간을
    // 정확히 계산한다. 명령이 얼마나 걸리든 결과가 같다.
    const timeout = 60_000;
    const queue = await setup();
    fakeTimers();
    const toast = await addFaked(queue, { title: "저장했습니다", timeout });
    // 자동 닫힘 타이머는 addFaked 안(effect)에서 시작했고, 그 뒤로는 가짜 시계를 움직이지 않았다.
    const startedAt = Date.now();
    const moments: { enter?: number; leave?: number } = {};
    region().addEventListener("pointerenter", () => (moments.enter ??= Date.now()));
    region().addEventListener("pointerleave", () => (moments.leave ??= Date.now()));

    vi.advanceTimersByTime(3000);
    await userEvent.hover(toast);
    expect(moments.enter).toBeDefined();
    // 올린 동안에는 남은 시간을 훨씬 넘겨도 닫히지 않는다.
    vi.advanceTimersByTime(10 * timeout);
    await frames();
    expect(toast).toHaveAttribute("data-open", "");

    await userEvent.unhover(toast);
    expect(moments.leave).toBeDefined();
    // 떠난 순간부터 남은 시간(올리기 전까지 흐른 시간을 뺀 값)이 지나면 닫힌다.
    const closesAt = moments.leave! + timeout - (moments.enter! - startedAt);
    vi.advanceTimersByTime(closesAt - Date.now() - 1);
    await frames();
    expect(toast).toHaveAttribute("data-open", "");
    vi.advanceTimersByTime(1);
    await frames();
    expect(toast).not.toHaveAttribute("data-open");
  });

  test("포커스가 영역 안에 있는 동안 멈추고, 떠나면 남은 시간이 지나 닫힌다", async () => {
    const queue = await setup();
    fakeTimers();
    const toast = await addFaked(queue, { title: "저장했습니다" });
    vi.advanceTimersByTime(3000);
    toast.focus();
    vi.advanceTimersByTime(60_000);
    await frames();
    expect(toast).toHaveAttribute("data-open", "");
    (page.getByTestId("outside").element() as HTMLElement).focus();
    vi.advanceTimersByTime(1000);
    await frames();
    expect(toast).toHaveAttribute("data-open", "");
    vi.advanceTimersByTime(1100);
    await frames();
    expect(toast).not.toHaveAttribute("data-open");
  });
});

describe("닫기·액션과 포커스", () => {
  test("닫기 버튼(IconButton, 이름 「닫기」)을 누르면 닫히고 onClose를 부른다. closeLabel로 이름을 바꾼다", async () => {
    const onClose = vi.fn();
    const queue = await setup();
    const toast = await show(queue, { title: "저장했습니다", onClose, closeLabel: "알림 닫기" });
    const close = page.getByRole("button", { name: "알림 닫기" });
    expect(close.element()).toHaveAttribute("type", "button");
    await userEvent.click(close);
    expect(onClose).toHaveBeenCalledOnce();
    await expect.poll(() => toast.isConnected).toBe(false);
  });

  test("액션 버튼은 onClick을 부르고 닫는다. preventDefault하면 닫지 않는다", async () => {
    const undo = vi.fn();
    const queue = await setup();
    const toast = await show(queue, {
      title: "삭제했습니다",
      action: { label: "되돌리기", onClick: undo },
    });
    await userEvent.click(page.getByRole("button", { name: "되돌리기" }));
    expect(undo).toHaveBeenCalledOnce();
    await expect.poll(() => toast.isConnected).toBe(false);

    const kept = await show(queue, {
      title: "연결이 끊겼습니다",
      action: { label: "다시 시도", onClick: (event) => event.preventDefault() },
    });
    await userEvent.click(page.getByRole("button", { name: "다시 시도" }));
    expect(kept).toHaveAttribute("data-open", "");
  });

  test("F6으로 영역에 들어가고, Tab으로 Toast와 버튼에 닿는다", async () => {
    const queue = await setup();
    await show(queue, { title: "삭제했습니다", action: { label: "되돌리기" } });
    const outside = page.getByTestId("outside").element() as HTMLElement;
    outside.focus();
    await userEvent.keyboard("{F6}");
    await expect.poll(() => region().contains(document.activeElement)).toBe(true);
    // 영역 안의 첫 Toast로 Tab이 간다.
    const toast = toastByName("삭제했습니다").element();
    if (document.activeElement === region()) await userEvent.tab();
    expect(document.activeElement).toBe(toast);
    await userEvent.tab();
    expect(document.activeElement).toBe(page.getByRole("button", { name: "되돌리기" }).element());
    await userEvent.tab();
    expect(document.activeElement).toBe(page.getByRole("button", { name: "닫기" }).element());
  });

  test("키보드로 닫으면 포커스가 옆 Toast로, 마지막을 닫으면 영역에 들어오기 전 요소로 돌아간다", async () => {
    const queue = await setup();
    await show(queue, { title: "하나", timeout: null });
    await show(queue, { title: "둘", timeout: null });
    const outside = page.getByTestId("outside").element() as HTMLElement;
    outside.focus();
    await userEvent.keyboard("{F6}");
    await expect.poll(() => region().contains(document.activeElement)).toBe(true);
    if (document.activeElement === region()) await userEvent.tab();
    expect(document.activeElement).toBe(toastByName("둘").element());
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect.element(toastByName("둘")).not.toBeInTheDocument();
    await expect.poll(() => document.activeElement).toBe(toastByName("하나").element());

    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => document.activeElement).toBe(outside);
  });
});

describe("퇴장 중 상호작용", () => {
  /** 요소에서 도는 전환을 멈춘다. 퇴장 전환이 끝나지 않아 Toast가 퇴장 중인 채로 DOM에 남는다(useOverlayPresence). */
  function pause(element: Element): Animation[] {
    const running = element.getAnimations();
    for (const animation of running) animation.pause();
    return running;
  }

  test("퇴장 중 Toast는 inert라 안의 버튼에 Tab·포커스가 닿지 않고, 끝나면 DOM에서 빠진다", async () => {
    const queue = await setup();
    const older = await show(queue, { title: "하나", action: { label: "되돌리기" } });
    const newer = await show(queue, { title: "둘", timeout: null });
    await settle(older);
    // DOM은 새것이 먼저다(둘, 하나). 하나를 닫으면 Tab 순서의 마지막 Toast가 퇴장한다.
    expect(page.getByRole("alertdialog").elements()).toEqual([newer, older]);
    // 퇴장이 시작되는 순간 전환을 멈춰 둔다(test/motion.ts의 captureExit, 렌더링 단계보다 먼저 돈다).
    const exit = captureExit(older, () => ({ inert: older.inert, paused: pause(older) }));
    await userEvent.click(page.getByRole("button", { name: "되돌리기" }));
    const { inert, paused } = await exit;
    expect(inert).toBe(true);
    expect(paused.length).toBeGreaterThan(0);
    expect(older.isConnected).toBe(true);

    const buttons = [...older.querySelectorAll("button")];
    expect(buttons).toHaveLength(2);
    // inert 안의 요소는 focus()로도 포커스를 받지 않는다.
    const newerClose = newer.querySelector("button") as HTMLButtonElement;
    newerClose.focus();
    expect(document.activeElement).toBe(newerClose);
    for (const button of buttons) {
      button.focus();
      expect(document.activeElement).toBe(newerClose);
    }
    // 남은 Toast의 마지막 버튼에서 Tab을 누르면 퇴장 중 Toast의 버튼을 건너뛴다.
    await userEvent.tab();
    expect(older.contains(document.activeElement)).toBe(false);
    expect(older.inert).toBe(true);

    for (const animation of paused) animation.finish();
    await expect.poll(() => older.isConnected).toBe(false);
  });

  test("보이는 수를 넘어 밀려난(퇴장 중) Toast가 다시 보이면 inert가 풀린다", async () => {
    const queue = await setup({ maxVisible: 1 });
    const first = await show(queue, { title: "하나", timeout: null });
    await settle(first);
    // 둘을 띄우면 하나가 보이는 목록에서 밀려나 퇴장한다. 그 순간 둘을 닫으면 하나가 같은 key로 다시 보인다.
    let secondKey = "";
    const reopened = captureExit(first, () => {
      const inert = first.inert;
      queue.close(secondKey);
      return inert;
    });
    secondKey = queue.add({ title: "둘", timeout: null });
    expect(await reopened).toBe(true);
    await expect.poll(() => first.hasAttribute("data-open")).toBe(true);
    expect(first.isConnected).toBe(true);
    expect(first.inert).toBe(false);
    expect(first.hasAttribute("inert")).toBe(false);
    expect(first.getAttribute("role")).toBe("alertdialog");
    const close = first.querySelector("button") as HTMLButtonElement;
    close.focus();
    expect(document.activeElement).toBe(close);
  });
});

describe("다른 오버레이와 함께", () => {
  test("열린 Dialog 위에 보이고 inert·aria-hidden이 아니며, 눌러도 Dialog가 닫히지 않는다", async () => {
    const queue = new ToastQueue();
    function App(): ReactElement {
      const [open, setOpen] = useState(true);
      return (
        <div data-theme="light">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent data-testid="content">
              <DialogTitle>설정</DialogTitle>
              <Button onClick={() => queue.add({ title: "저장했습니다", timeout: null })}>
                저장
              </Button>
            </DialogContent>
          </Dialog>
          <ToastRegion queue={queue} data-testid="region" />
        </div>
      );
    }
    await render(<App />);
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await userEvent.click(page.getByRole("button", { name: "저장" }));
    const toast = toastByName("저장했습니다");
    await expect.element(toast).toBeVisible();
    // Dialog가 연 뒤 body에 붙었어도 inert·aria-hidden이 되지 않는다.
    expect(region().closest("[inert]")).toBeNull();
    expect(region().closest("[aria-hidden='true']")).toBeNull();
    const backdrop = (page.getByTestId("content").element() as HTMLElement)
      .parentElement as HTMLElement;
    expect(Number(getComputedStyle(region()).zIndex)).toBeGreaterThan(
      Number(getComputedStyle(backdrop).zIndex),
    );
    const close = page.getByRole("button", { name: "닫기" }).last();
    const rect = close.element().getBoundingClientRect();
    const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    expect(close.element().contains(top)).toBe(true);

    await userEvent.click(close);
    await expect.element(toast).not.toBeInTheDocument();
    await expect.element(page.getByRole("dialog")).toBeVisible();
  });
});

describe("위치·표면·색", () => {
  test("아래 끝쪽(오른쪽) 16px에 고정되고 폭은 최대 384px, z-toast(400)로 쌓인다", async () => {
    const queue = await setup();
    const toast = await show(queue, { title: "저장했습니다", description: "긴 본문 ".repeat(40) });
    const style = getComputedStyle(region());
    expect(style.position).toBe("fixed");
    expect(style.zIndex).toBe("400");
    expect(style.isolation).toBe("isolate");
    const rect = region().getBoundingClientRect();
    expect(Math.round(window.innerWidth - rect.right)).toBe(16);
    expect(Math.round(window.innerHeight - rect.bottom)).toBe(16);
    expect(rect.width).toBeLessThanOrEqual(384);
    expect(toast.getBoundingClientRect().width).toBe(rect.width);
  });

  test("raised 표면, shadow-md, radius lg(8px), 1px 경계, 16px 여백이고 글자는 text-default, 아이콘만 역할 색이다", async () => {
    const queue = await setup();
    const toast = await show(queue, { title: "업로드 실패", color: "warning" });
    expect(toast).toHaveAttribute("data-color", "warning");
    const style = getComputedStyle(toast);
    expect(style.borderTopLeftRadius).toBe("8px");
    expect(style.borderTopWidth).toBe("1px");
    expect(style.paddingTop).toBe("16px");
    expect(style.paddingInlineStart).toBe("16px");
    if (forcedColors()) return;
    expect(style.backgroundColor).toBe(resolve("backgroundColor", "var(--tide-bg-raised)"));
    expect(style.color).toBe(resolve("color", "var(--tide-text-default)"));
    expect(style.boxShadow).not.toBe("none");
    const icon = toast.querySelector("svg") as SVGElement;
    expect(getComputedStyle(icon).color).toBe(resolve("color", "var(--tide-text-warning)"));
    expect(icon.getBoundingClientRect().width).toBe(20);
  });

  test("기본 color는 info이고, 닫기(ghost xs 24px)·액션(outline sm 32px) 버튼은 neutral이다", async () => {
    const queue = await setup();
    const toast = await show(queue, { title: "새 버전", action: { label: "새로 고침" } });
    expect(toast).toHaveAttribute("data-color", "info");
    const close = page.getByRole("button", { name: "닫기" }).element() as HTMLElement;
    const action = page.getByRole("button", { name: "새로 고침" }).element() as HTMLElement;
    // raised 위 Role 색 글자는 bg-active 위에서 4:1에도 못 미치는 색이 있어 버튼은 neutral(text-default)이다(티켓 03·46).
    expect(close).toHaveAttribute("data-color", "neutral");
    expect(action).toHaveAttribute("data-color", "neutral");
    expect(close.getBoundingClientRect().height).toBe(24);
    expect(action.getBoundingClientRect().height).toBe(32);
  });

  test("Toast·영역 포커스 표시는 focus-ring이다", async () => {
    const queue = await setup();
    const toast = await show(queue, { title: "저장했습니다", timeout: null });
    (page.getByTestId("outside").element() as HTMLElement).focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(toast);
    await expect.poll(() => getComputedStyle(toast).outlineWidth).toBe("2px");
    expect(getComputedStyle(toast).outlineOffset).toBe("2px");
  });

  test("forced-colors에서는 그림자 없이 경계가 시스템 색으로 보인다", async () => {
    const queue = await setup();
    const toast = await show(queue, { title: "저장했습니다" });
    if (!forcedColors()) return;
    const style = getComputedStyle(toast);
    expect(style.boxShadow).toBe("none");
    expect(style.borderTopColor).not.toBe(transparent);
    expect(style.borderTopColor).not.toBe(style.backgroundColor);
  });
});

describe("등장과 퇴장 motion", () => {
  test("등장: opacity + blur 4px + 아래 4px에서 normal(300ms)로 떠오른다. 움직임 줄이기에서는 opacity만", async () => {
    const queue = await setup();
    // 전환 중 값(등장 300ms)은 Toast가 DOM에 들어온 순간에 붙잡는다. poll 뒤에 읽으면 부하에 따라 등장이 끝나 있다(test/motion.ts).
    const toastNow = (): HTMLElement | null => document.querySelector("[role='alertdialog']");
    const entered = captureWhen(
      () => toastNow() !== null,
      () => ({ style: styleSnapshot(toastNow()!), running: transitions(toastNow()!) }),
    );
    queue.add({ title: "저장했습니다" });
    const { style, running } = await entered;
    expect(style.transitionDuration.split(", ")[0]).toBe("0.3s");
    expect(style.transitionTimingFunction.startsWith("cubic-bezier(0, 0, 0.2, 1)")).toBe(true);
    expect(style.transitionProperty).not.toContain("all");
    expect(running.get("opacity")?.from["opacity"]).toBe("0");
    if (reducedMotion()) {
      expect(style.transitionProperty).toBe("opacity, display");
      expect(running.has("filter")).toBe(false);
      expect(running.has("translate")).toBe(false);
      return;
    }
    expect(style.transitionProperty).toBe("opacity, filter, translate, display");
    expect(running.get("filter")?.from["filter"]).toBe("blur(4px)");
    expect(running.get("translate")?.from["translate"]).toBe("0px 4px");
  });

  test("퇴장: 같은 조합의 절반으로 fast(150ms)에 사라진 뒤 DOM에서 빠진다", async () => {
    const queue = await setup();
    const key = queue.add({ title: "저장했습니다" });
    const toast = await (async () => {
      await expect.element(toastByName("저장했습니다")).toBeVisible();
      return toastByName("저장했습니다").element() as HTMLElement;
    })();
    await settle(toast);
    // 전환 중 값은 data-open이 빠지는 순간에 붙잡는다. poll 뒤에 읽으면 부하에 따라 퇴장이 끝나 있다(test/motion.ts).
    const exit = captureExit(toast, () => ({
      connected: toast.isConnected,
      role: toast.getAttribute("role"),
      inert: toast.inert,
      style: styleSnapshot(toast),
      running: transitions(toast),
    }));
    queue.close(key);
    const { connected, role, inert, style, running } = await exit;
    expect(connected).toBe(true);
    // 퇴장 중에는 역할이 빠져 스크린 리더·포커스 이동에서 빠지고, inert라 안의 버튼에 닿지 않는다(티켓 43).
    expect(role).toBeNull();
    expect(inert).toBe(true);
    expect(style.transitionDuration.split(", ")[0]).toBe("0.15s");
    expect(style.pointerEvents).toBe("none");
    expect(running.get("opacity")?.to["opacity"]).toBe("0");
    expect(running.has("display")).toBe(true);
    if (reducedMotion()) {
      expect(running.has("filter")).toBe(false);
      expect(running.has("translate")).toBe(false);
    } else {
      expect(running.get("filter")?.to["filter"]).toBe("blur(2px)");
      expect(running.get("translate")?.to["translate"]).toBe("0px 2px");
    }
    await expect.poll(() => toast.isConnected).toBe(false);
    // 마지막 Toast가 빠지면 영역도 빠진다.
    expect(document.querySelector("[role='region']")).toBeNull();
  });
});

describe("ref·className·타입", () => {
  test("ref는 영역에 닿고 className이 기본 class를 이긴다", async () => {
    let element: HTMLDivElement | null = null;
    const queue = await setup(undefined, {
      ref: (node: HTMLDivElement | null) => {
        element = node;
      },
      className: "bottom-8",
    });
    await show(queue, { title: "저장했습니다" });
    expect(element).toBe(region());
    expect(getComputedStyle(region()).bottom).toBe("32px");
  });

  test("지원하지 않는 값은 타입 오류다", () => {
    // @ts-expect-error -- 색 계열 이름은 받지 않는다(Role만).
    const family: ToastOptions = { title: "a", color: "blue" };
    // @ts-expect-error -- 제목은 필수다.
    const untitled: ToastOptions = { description: "a" };
    // @ts-expect-error -- 역할은 region으로 고정이다.
    const role: Partial<ToastRegionProps> = { role: "status" };
    // @ts-expect-error -- React Aria 이름(maxVisibleToasts)은 드러내지 않는다.
    const max: ToastQueueOptions = { maxVisibleToasts: 2 };
    expect([family, untitled, role, max]).toHaveLength(4);
  });
});
