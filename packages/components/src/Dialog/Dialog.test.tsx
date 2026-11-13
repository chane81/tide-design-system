// Dialog·AlertDialog 동작을 실제 Chromium에서 확인한다(tide-v0-impl 티켓 30).
// 두 instance에서 모두 돈다. 두 번째 instance(forced-colors·reduced-motion)에서는 경계가 시스템 색으로 남는지와
// 등장·퇴장이 opacity 전환만 남는지를 본다.
//
// 열려 있는 동안 바깥은 inert라 Playwright click(누를 수 있는지 먼저 확인)이 바깥 요소를 누르지 못한다.
// 바깥 막(backdrop)은 가운데가 Dialog로 덮여 있어 모서리를 좌표로 누른다(mouseDownAtCorner·mouseUp).
import { useState, type ReactElement } from "react";
import { describe, expect, test, vi } from "vitest";
import { commands, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { captureExit, captureWhen, styleSnapshot, transitions } from "../../test/motion.ts";

import { AlertDialog } from "../AlertDialog/AlertDialog.tsx";
import { Button } from "../Button/Button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  type DialogContentProps,
  type DialogProps,
} from "./index.ts";
import { Select, SelectItem } from "../Select/Select.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip/Tooltip.tsx";

const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;
const reducedMotion = (): boolean => matchMedia("(prefers-reduced-motion: reduce)").matches;
const transparent = "rgba(0, 0, 0, 0)";

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

interface ExampleProps extends Omit<DialogProps, "children"> {
  readonly content?: Partial<DialogContentProps>;
}

function Example({ content, ...props }: ExampleProps): ReactElement {
  return (
    <div data-theme="light">
      <p data-testid="outside">바깥 글</p>
      <Dialog {...props}>
        <DialogTrigger data-testid="trigger">이름 바꾸기</DialogTrigger>
        <DialogContent data-testid="content" {...content}>
          <DialogTitle>프로젝트 이름 바꾸기</DialogTitle>
          <DialogDescription>새 이름은 모든 멤버에게 보입니다.</DialogDescription>
          <input aria-label="새 이름" data-testid="input" />
          <DialogFooter>
            <DialogClose data-testid="cancel">취소</DialogClose>
            <button type="button" data-testid="save">
              저장
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AlertExample(props: Omit<DialogProps, "children">): ReactElement {
  return (
    <div data-theme="light">
      <p data-testid="outside">바깥 글</p>
      <AlertDialog {...props}>
        <DialogTrigger data-testid="trigger">삭제</DialogTrigger>
        <DialogContent data-testid="content">
          <DialogTitle>프로젝트를 삭제할까요?</DialogTitle>
          <DialogDescription>삭제하면 되돌릴 수 없습니다.</DialogDescription>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" color="neutral" />}>취소</DialogClose>
            <DialogClose render={<Button color="danger" />}>삭제</DialogClose>
          </DialogFooter>
        </DialogContent>
      </AlertDialog>
    </div>
  );
}

const content = (): HTMLElement => page.getByTestId("content").element() as HTMLElement;
const backdrop = (): HTMLElement => content().parentElement as HTMLElement;
const trigger = (): HTMLElement => page.getByTestId("trigger").element() as HTMLElement;

/** 바깥 막의 모서리를 누른다. */
async function pressBackdrop(): Promise<void> {
  backdrop().dataset["testid"] = "backdrop";
  await commands.mouseDownAtCorner("backdrop");
  await commands.mouseUp();
}

/**
 * 포커스가 그 요소에 올 때까지 기다린다. React Aria FocusScope는 내용이 DOM에서 빠진 뒤 다음 프레임에 포커스를
 * 되돌린다(Popover와 같다, 디버그 기록으로 확인).
 */
async function expectFocused(element: Element): Promise<void> {
  await expect.poll(() => document.activeElement).toBe(element);
}

/** 내용이 DOM에서 빠질 때까지(퇴장 전환 끝) 기다린다. */
async function expectClosed(): Promise<void> {
  await expect.element(page.getByTestId("content")).not.toBeInTheDocument();
}

describe("역할과 이름", () => {
  test("트리거는 dialog를 여는 버튼이고, 내용은 제목을 이름으로·설명을 설명으로 가진 dialog다", async () => {
    await render(<Example />);
    // React Aria는 dialog 트리거에 aria-haspopup을 붙이지 않는다(스크린리더가 menu로 읽는 경우가 많아서, useOverlayTrigger 소스).
    expect(trigger()).not.toHaveAttribute("aria-haspopup");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger());
    const dialog = page.getByRole("dialog", { name: "프로젝트 이름 바꾸기" });
    await expect.element(dialog).toBeVisible();
    await expect.element(dialog).toHaveAccessibleDescription("새 이름은 모든 멤버에게 보입니다.");
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(trigger()).toHaveAttribute("aria-controls", content().id);
    expect(trigger()).toHaveAttribute("data-open", "");
    expect(content()).toHaveAttribute("data-open", "");
    expect(page.getByRole("heading", { level: 2 }).element()).toHaveTextContent(
      "프로젝트 이름 바꾸기",
    );
  });

  test("제목이 없으면 트리거 글자가, aria-label을 주면 그 값이 이름이다", async () => {
    const screen = await render(
      <Dialog defaultOpen>
        <DialogTrigger>공유 설정</DialogTrigger>
        <DialogContent>내용</DialogContent>
      </Dialog>,
    );
    await expect.element(page.getByRole("dialog", { name: "공유 설정" })).toBeVisible();
    expect(page.getByRole("dialog").element()).not.toHaveAttribute("aria-describedby");
    await screen.rerender(
      <Dialog defaultOpen>
        <DialogTrigger>공유 설정</DialogTrigger>
        <DialogContent aria-label="링크 공유">내용</DialogContent>
      </Dialog>,
    );
    await expect.element(page.getByRole("dialog", { name: "링크 공유" })).toBeVisible();
  });

  test("제목·설명에 id를 주면 그 id로 잇는다", async () => {
    await render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle id="my-title">제목</DialogTitle>
          <DialogDescription id="my-desc">설명</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    const dialog = page.getByRole("dialog").element();
    expect(dialog).toHaveAttribute("aria-labelledby", "my-title");
    expect(dialog).toHaveAttribute("aria-describedby", "my-desc");
  });
});

describe("열고 닫기와 포커스 복귀", () => {
  test("Enter로 열고 Esc로 닫으면 포커스가 트리거로 돌아온다", async () => {
    await render(<Example />);
    trigger().focus();
    await userEvent.keyboard("{Enter}");
    await expect.element(page.getByRole("dialog")).toBeVisible();
    // 열리면 포커스가 Dialog 안으로 온다(Dialog 요소 자신).
    expect(content().contains(document.activeElement)).toBe(true);
    await userEvent.keyboard("{Escape}");
    await expectClosed();
    await expectFocused(trigger());
  });

  test("닫기 버튼(IconButton, 이름 「닫기」)을 누르면 닫히고 포커스가 트리거로 돌아온다", async () => {
    await render(<Example />);
    await userEvent.click(trigger());
    const close = page.getByRole("button", { name: "닫기" });
    await expect.element(close).toBeVisible();
    await userEvent.click(close);
    await expectClosed();
    await expectFocused(trigger());
  });

  test("closeLabel로 닫기 버튼 이름을 바꾼다", async () => {
    await render(<Example defaultOpen content={{ closeLabel: "이름 바꾸기 닫기" }} />);
    await expect.element(page.getByRole("button", { name: "이름 바꾸기 닫기" })).toBeVisible();
  });

  test("DialogClose는 닫고, onClick에서 preventDefault하면 닫지 않는다", async () => {
    const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    const screen = await render(
      <Dialog defaultOpen>
        <DialogContent data-testid="content" aria-label="확인">
          <DialogClose onClick={onClick}>머무르기</DialogClose>
          <DialogClose>닫기 동작</DialogClose>
        </DialogContent>
      </Dialog>,
    );
    await userEvent.click(page.getByRole("button", { name: "머무르기" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "닫기 동작" }));
    await expectClosed();
  });

  test("바깥 막을 누르면 닫히고 포커스가 트리거로 돌아온다. 안을 누르면 닫히지 않는다", async () => {
    await render(<Example />);
    await userEvent.click(trigger());
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await userEvent.click(page.getByRole("heading"));
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await pressBackdrop();
    await expectClosed();
    await expectFocused(trigger());
  });

  test("트리거 없이 open으로 열면 닫힌 뒤 포커스가 열기 전 요소로 돌아간다", async () => {
    function Controlled(): ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            메뉴 항목
          </button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent data-testid="content">
              <DialogTitle>보관</DialogTitle>
            </DialogContent>
          </Dialog>
        </>
      );
    }
    await render(<Controlled />);
    const opener = page.getByRole("button", { name: "메뉴 항목" });
    await userEvent.click(opener);
    await expect.element(page.getByRole("dialog", { name: "보관" })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expectClosed();
    await expectFocused(opener.element());
  });

  test("open을 주면 onOpenChange만 부르고 부모가 바꿔야 닫힌다", async () => {
    const onOpenChange = vi.fn();
    await render(<Example open onOpenChange={onOpenChange} />);
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await expect.element(page.getByRole("dialog")).toBeVisible();
  });
});

describe("모달 동작", () => {
  test("Tab과 Shift+Tab은 Dialog 안에서 돈다", async () => {
    await render(<Example />);
    await userEvent.click(trigger());
    await expect.element(page.getByRole("dialog")).toBeVisible();
    const input = page.getByTestId("input").element();
    const cancel = page.getByTestId("cancel").element();
    const save = page.getByTestId("save").element();
    const close = page.getByRole("button", { name: "닫기" }).element();
    // 순서: 입력 → 취소 → 저장 → 닫기(끝 위쪽, DOM 마지막) → 다시 입력
    await userEvent.tab();
    expect(document.activeElement).toBe(input);
    await userEvent.tab();
    expect(document.activeElement).toBe(cancel);
    await userEvent.tab();
    expect(document.activeElement).toBe(save);
    await userEvent.tab();
    expect(document.activeElement).toBe(close);
    await userEvent.tab();
    expect(document.activeElement).toBe(input);
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(close);
  });

  test("열린 동안 바깥은 inert이고 페이지 스크롤이 잠기며, 닫으면 풀린다", async () => {
    await render(<Example />);
    const outside = page.getByTestId("outside").element();
    await userEvent.click(trigger());
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(outside.closest("[inert]")).not.toBeNull();
    expect(content().closest("[inert]")).toBeNull();
    expect(getComputedStyle(document.documentElement).overflow).toBe("hidden");
    await userEvent.keyboard("{Escape}");
    await expectClosed();
    expect(outside.closest("[inert]")).toBeNull();
    expect(getComputedStyle(document.documentElement).overflow).not.toBe("hidden");
  });

  test("안의 요소가 autoFocus면 그 요소에 포커스가 간다", async () => {
    await render(
      <Dialog defaultOpen>
        <DialogContent aria-label="이름">
          {/* oxlint-disable-next-line jsx-a11y/no-autofocus -- autoFocus 동작을 확인한다. */}
          <input aria-label="이름" autoFocus />
        </DialogContent>
      </Dialog>,
    );
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(document.activeElement).toBe(page.getByRole("textbox").element());
  });
});

describe("AlertDialog", () => {
  test("alertdialog 역할이고 이름은 제목, 설명은 알릴 내용이며 닫기 버튼이 없다", async () => {
    await render(<AlertExample />);
    await userEvent.click(trigger());
    const dialog = page.getByRole("alertdialog", { name: "프로젝트를 삭제할까요?" });
    await expect.element(dialog).toBeVisible();
    await expect.element(dialog).toHaveAccessibleDescription("삭제하면 되돌릴 수 없습니다.");
    expect(page.getByRole("button", { name: "닫기" }).query()).toBeNull();
    expect(page.getByRole("dialog").query()).toBeNull();
  });

  test("열리면 첫 조작 요소(취소)에 포커스가 온다", async () => {
    await render(<AlertExample />);
    await userEvent.click(trigger());
    await expect.element(page.getByRole("alertdialog")).toBeVisible();
    await expect
      .poll(() => document.activeElement)
      .toBe(page.getByRole("button", { name: "취소" }).element());
  });

  test("바깥 막을 눌러도 닫히지 않고 Esc는 닫는다", async () => {
    await render(<AlertExample />);
    await userEvent.click(trigger());
    await expect.element(page.getByRole("alertdialog")).toBeVisible();
    await pressBackdrop();
    await new Promise((done) => setTimeout(done, 200));
    await expect.element(page.getByRole("alertdialog")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expectClosed();
    await expectFocused(trigger());
  });

  test("위험 동작 버튼(Button color=danger)을 누르면 닫히고 포커스가 트리거로 돌아온다", async () => {
    await render(<AlertExample />);
    await userEvent.click(trigger());
    const confirm = page.getByRole("button", { name: "삭제" }).last();
    await expect.element(confirm).toBeVisible();
    expect(confirm.element()).toHaveAttribute("data-color", "danger");
    await userEvent.click(confirm);
    await expectClosed();
    await expectFocused(trigger());
  });
});

describe("다른 오버레이와 함께", () => {
  test("Dialog 안에서 연 Select 목록이 Dialog 위에 보이고, Esc는 목록만 닫는다", async () => {
    await render(
      <div data-theme="light">
        <Dialog defaultOpen>
          <DialogContent data-testid="content" aria-label="정렬 설정">
            <Select aria-label="정렬" defaultValue="new" data-testid="select">
              <SelectItem value="new">최신순</SelectItem>
              <SelectItem value="old">오래된순</SelectItem>
            </Select>
          </DialogContent>
        </Dialog>
      </div>,
    );
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await userEvent.click(page.getByTestId("select"));
    const listbox = page.getByRole("listbox");
    await expect.element(listbox).toBeVisible();
    const list = listbox.element().parentElement as HTMLElement;
    expect(Number(getComputedStyle(list).zIndex)).toBeGreaterThan(
      Number(getComputedStyle(backdrop()).zIndex),
    );
    // 목록이 놓인 곳에서 가장 위에 그려진 요소가 목록이다.
    const option = page.getByRole("option", { name: "오래된순" }).element();
    const rect = option.getBoundingClientRect();
    const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    expect(option.contains(top)).toBe(true);
    expect(list.closest("[inert]")).toBeNull();

    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("listbox")).not.toBeInTheDocument();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await userEvent.click(page.getByTestId("select"));
    await userEvent.click(page.getByRole("option", { name: "오래된순" }));
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await expect.element(page.getByTestId("select")).toHaveTextContent("오래된순");
  });

  test("Dialog 안 Tooltip은 위에 보이고 inert가 되지 않으며, Esc는 Tooltip만 닫는다", async () => {
    await render(
      <div data-theme="light">
        <Dialog defaultOpen>
          <DialogContent data-testid="content" aria-label="공유">
            <Tooltip delay={0}>
              <TooltipTrigger data-testid="tip-trigger">링크 복사</TooltipTrigger>
              <TooltipContent data-testid="tip">주소를 클립보드에 넣습니다</TooltipContent>
            </Tooltip>
          </DialogContent>
        </Dialog>
      </div>,
    );
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await userEvent.tab();
    const tipTrigger = page.getByTestId("tip-trigger").element();
    expect(document.activeElement).toBe(tipTrigger);
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    const tip = page.getByTestId("tip").element() as HTMLElement;
    expect(Number(getComputedStyle(tip).zIndex)).toBeGreaterThan(
      Number(getComputedStyle(backdrop()).zIndex),
    );
    expect(tip.closest("[inert]")).toBeNull();
    expect(tip.closest("[aria-hidden='true']")).toBeNull();
    await expect
      .element(page.getByRole("button", { name: "링크 복사" }))
      .toHaveAccessibleDescription("주소를 클립보드에 넣습니다");
    const rect = tip.getBoundingClientRect();
    const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    expect(tip.contains(top)).toBe(true);

    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("tooltip")).not.toBeInTheDocument();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(document.activeElement).toBe(tipTrigger);
  });
});

describe("표면과 쌓임", () => {
  test("portal로 body에 붙고, 바깥 막은 화면 전체를 bg-overlay로 덮으며 z-modal로 쌓인다", async () => {
    await render(<Example defaultOpen />);
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(backdrop().parentElement?.closest("[data-theme]")).toBeNull();
    expect(document.body.contains(backdrop())).toBe(true);
    const style = getComputedStyle(backdrop());
    expect(style.position).toBe("fixed");
    expect(style.zIndex).toBe(
      getComputedStyle(document.documentElement).getPropertyValue("--tide-z-modal").trim(),
    );
    expect(style.zIndex).toBe("200");
    expect(style.isolation).toBe("isolate");
    const rect = backdrop().getBoundingClientRect();
    expect(rect.width).toBe(window.innerWidth);
    expect(rect.height).toBe(window.innerHeight);
    if (forcedColors()) return;
    expect(style.backgroundColor).toBe(resolve("backgroundColor", "var(--tide-bg-overlay)"));
    // overlay는 gray-950 alpha 50%(light)다.
    expect(style.backgroundColor).toMatch(/^(rgba|oklab|oklch|color)\(.*0\.5\)$/);
  });

  test("raised 표면, shadow-lg, radius xl(12px), 1px border-raised 경계와 24px 여백이다", async () => {
    await render(<Example defaultOpen />);
    await expect.element(page.getByRole("dialog")).toBeVisible();
    const style = getComputedStyle(content());
    expect(style.borderTopWidth).toBe("1px");
    expect(style.borderTopStyle).toBe("solid");
    expect(style.borderTopLeftRadius).toBe("12px");
    expect(style.padding).toBe("24px");
    expect(style.outlineStyle).toBe("none");
    if (forcedColors()) return;
    expect(style.backgroundColor).toBe(resolve("backgroundColor", "var(--tide-bg-raised)"));
    expect(style.color).toBe(resolve("color", "var(--tide-text-default)"));
    expect(style.borderTopColor).toBe(transparent);
    expect(style.boxShadow.endsWith(resolve("boxShadow", "var(--tide-shadow-lg)"))).toBe(true);
  });

  test("size는 최대 폭 sm 384px, md 512px(기본), lg 640px이다", async () => {
    const screen = await render(<Example defaultOpen />);
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(getComputedStyle(content()).maxWidth).toBe("512px");
    await screen.rerender(<Example defaultOpen content={{ size: "sm" }} />);
    expect(getComputedStyle(content()).maxWidth).toBe("384px");
    await screen.rerender(<Example defaultOpen content={{ size: "lg" }} />);
    expect(getComputedStyle(content()).maxWidth).toBe("640px");
  });

  test("dark Theme 영역의 트리거면 막과 내용도 dark 색이다", async () => {
    await render(
      <div data-theme="dark">
        <Dialog>
          <DialogTrigger data-testid="trigger">열기</DialogTrigger>
          <DialogContent data-testid="content" aria-label="설정">
            내용
          </DialogContent>
        </Dialog>
      </div>,
    );
    await userEvent.click(trigger());
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(backdrop()).toHaveAttribute("data-theme", "dark");
    if (forcedColors()) return;
    expect(getComputedStyle(content()).backgroundColor).toBe(
      resolve("backgroundColor", "var(--tide-bg-raised)", "dark"),
    );
    expect(getComputedStyle(backdrop()).backgroundColor).toBe(
      resolve("backgroundColor", "var(--tide-bg-overlay)", "dark"),
    );
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
  // rerender가 돌아온 뒤에 읽으면 부하가 클 때 전환이 먼저 끝난다.
  test("등장: opacity + scale 0.96 → 1을 normal(300ms)로, 막은 opacity로 들어온다", async () => {
    const screen = await render(<Example open={false} />);
    const entered = captureWhen(
      () => document.querySelector("[data-testid='content'][data-open]") !== null,
      () => ({
        style: styleSnapshot(content()),
        running: transitions(content()),
        backdropStyle: styleSnapshot(backdrop()),
        backdropRunning: transitions(backdrop()),
      }),
    );
    await screen.rerender(<Example open />);
    const { style, running, backdropStyle, backdropRunning } = await entered;
    expect(style.transitionDuration.split(", ")[0]).toBe("0.3s");
    expect(style.transitionTimingFunction.startsWith("cubic-bezier(0, 0, 0.2, 1)")).toBe(true);
    expect(style.transitionProperty).not.toContain("all");
    expect(running.get("opacity")?.from["opacity"]).toBe("0");

    expect(backdropStyle.transitionDuration.split(", ")[0]).toBe("0.3s");
    expect(backdropStyle.transitionBehavior).toContain("allow-discrete");
    expect(backdropRunning.get("opacity")?.from["opacity"]).toBe("0");

    if (reducedMotion()) {
      // 움직임 줄이기: 확대 없이 opacity만 바뀐다.
      expect(style.transitionProperty).toBe("opacity");
      expect(running.has("scale")).toBe(false);
      return;
    }
    expect(style.transitionProperty).toBe("opacity, scale");
    expect(running.get("scale")?.from["scale"]).toBe("0.96");
  });

  test("퇴장: opacity + scale 0.98로 fast(150ms)에 사라진 뒤 DOM에서 빠진다", async () => {
    const screen = await render(<Example open />);
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await Promise.all(
      [content(), backdrop()].flatMap((element) =>
        element.getAnimations().map((animation) => animation.finished),
      ),
    );
    const element = content();
    const layer = backdrop();

    const exit = captureExit(element, () => ({
      connected: element.isConnected,
      style: styleSnapshot(element),
      running: transitions(element),
      layerStyle: styleSnapshot(layer),
      layerRunning: transitions(layer),
    }));
    await screen.rerender(<Example open={false} />);
    const { connected, style, running, layerStyle, layerRunning } = await exit;
    expect(element.hasAttribute("data-open")).toBe(false);
    expect(connected).toBe(true);
    expect(style.transitionDuration.split(", ")[0]).toBe("0.15s");
    expect(layerStyle.transitionDuration.split(", ")[0]).toBe("0.15s");
    // 퇴장 중에는 막과 Dialog가 눌리지 않는다.
    expect(layerStyle.pointerEvents).toBe("none");
    expect(style.pointerEvents).toBe("none");
    expect(running.get("opacity")?.to["opacity"]).toBe("0");
    expect(layerRunning.has("display")).toBe(true);
    if (reducedMotion()) {
      expect(running.has("scale")).toBe(false);
    } else {
      expect(running.get("scale")?.to["scale"]).toBe("0.98");
    }
    await expect.poll(() => layer.isConnected).toBe(false);
  });
});

describe("ref·className·타입", () => {
  test("ref는 각 요소에 닿고 className이 기본 class를 이긴다", async () => {
    const triggerRef = vi.fn();
    const contentRef = vi.fn();
    await render(
      <Dialog defaultOpen>
        <DialogTrigger ref={triggerRef} className="text-primary">
          열기
        </DialogTrigger>
        <DialogContent ref={contentRef} className="p-2" data-testid="content">
          <DialogTitle className="text-heading-xs">제목</DialogTitle>
          <DialogDescription className="text-body-sm">설명</DialogDescription>
          <DialogFooter className="justify-start" data-testid="footer" />
        </DialogContent>
      </Dialog>,
    );
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(contentRef).toHaveBeenCalledWith(content());
    expect(triggerRef).toHaveBeenCalled();
    expect(content().className).toContain("p-2");
    expect(content().className).not.toContain("p-6");
    expect(getComputedStyle(content()).padding).toBe("8px");
    expect(page.getByRole("heading").element().className).not.toContain("text-heading-sm");
    const footer = page.getByTestId("footer").element();
    expect(footer.className).toContain("justify-start");
    expect(footer.className).not.toContain("justify-end");
  });

  test("기본 트리거·닫기는 class 속성이 없는 type=button이다", async () => {
    await render(<Example />);
    expect(trigger()).not.toHaveAttribute("class");
    expect(trigger()).toHaveAttribute("type", "button");
  });

  test("지원하지 않는 값은 타입 오류다", () => {
    // @ts-expect-error -- size는 sm·md·lg다.
    const size: DialogContentProps = { size: "xl" };
    // @ts-expect-error -- 역할은 dialog(AlertDialog 안에서는 alertdialog)로 고정이다.
    const role: DialogContentProps = { role: "alertdialog" };
    // @ts-expect-error -- React Aria 이름(isDismissable)은 드러내지 않는다.
    const dismissable: DialogContentProps = { isDismissable: true };
    expect([size, role, dismissable]).toHaveLength(3);
  });
});
