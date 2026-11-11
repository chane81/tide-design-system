// Select 동작을 실제 Chromium에서 확인한다(tide-v0-impl 티켓 28).
// 두 instance에서 모두 돈다. 두 번째 instance(forced-colors·reduced-motion)에서는 포커스·위치 표시가 시스템 색
// outline으로 남는지와 고른 옵션이 체크 아이콘으로 보이는지를 본다.
//
// 열려 있는 동안 바깥은 inert라 Playwright click(누를 수 있는지 먼저 확인)이 바깥 요소를 누르지 못한다.
// 바깥 누름은 좌표로 마우스를 누르는 사용자 명령(mouseDownOn·mouseUp)으로 한다(Popover·Menu 테스트와 같다).
import { useState, type ReactElement } from "react";
import { describe, expect, test, vi } from "vitest";
import { commands, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { Button } from "./Button.tsx";
import { Field } from "./Field.tsx";
import { Input } from "./Input.tsx";
import { Select, SelectItem, SelectSection, type SelectProps } from "./Select.tsx";

const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;
const transparent = "rgba(0, 0, 0, 0)";

/** CSS 값 하나를 실제로 계산한 결과. Token 변수를 계산값과 비교할 때 쓴다. */
function resolve(
  property: "backgroundColor" | "color" | "borderTopColor",
  value: string,
  theme = "light",
): string {
  const probe = document.createElement("div");
  probe.dataset["theme"] = theme;
  probe.style.forcedColorAdjust = "none";
  if (property === "borderTopColor") probe.style.borderTopColor = value;
  else probe.style[property] = value;
  document.body.append(probe);
  const resolved = getComputedStyle(probe)[property];
  probe.remove();
  return resolved;
}

/** transition-colors(fast 150ms)가 끝난 뒤 계산값을 읽는다. */
const settle = (): Promise<void> => new Promise((done) => setTimeout(done, 250));

function Fruits(props: Partial<SelectProps>): ReactElement {
  return (
    <div data-theme="light">
      <p data-testid="outside">바깥 글</p>
      <Field label="과일" description="하나만 고릅니다.">
        <Select data-testid="trigger" name="fruit" {...props}>
          <SelectItem value="apple" data-testid="apple">
            Apple
          </SelectItem>
          <SelectItem value="banana" data-testid="banana">
            Banana
          </SelectItem>
          <SelectItem value="cherry" data-testid="cherry" disabled>
            Cherry
          </SelectItem>
          <SelectItem value="grape" data-testid="grape">
            Grape
          </SelectItem>
          <SelectItem value="kiwi" data-testid="kiwi">
            Kiwi
          </SelectItem>
        </Select>
      </Field>
      <button type="button" data-testid="after">
        다음
      </button>
    </div>
  );
}

const byTestId = (testId: string): HTMLElement => page.getByTestId(testId).element() as HTMLElement;
const trigger = (): HTMLElement => byTestId("trigger");
const listbox = (): HTMLElement | null => document.querySelector('[role="listbox"]');
const highlighted = (): string[] =>
  [...document.querySelectorAll("[data-highlighted]")].map((item) => item.textContent ?? "");

/** 바깥(또는 inert가 된 트리거)을 좌표로 누른다. */
async function pressAt(testId: string): Promise<void> {
  await commands.mouseDownOn(testId);
  await commands.mouseUp();
}

/** 목록이 DOM에서 빠질 때까지(퇴장 전환 끝) 기다린다. */
async function expectClosed(): Promise<void> {
  await expect.poll(listbox).toBeNull();
}

/** Tab으로 트리거에 포커스한다(키보드 입력 방식이 된다). */
async function tabToTrigger(): Promise<void> {
  await userEvent.tab();
  expect(document.activeElement).toBe(trigger());
}

describe("이름과 값", () => {
  test("트리거는 Field label과 고른 값을 이름으로 읽고, 설명이 연결된다", async () => {
    await render(<Fruits defaultValue="banana" />);
    const button = page.getByRole("button", { name: "Banana 과일" });
    await expect.element(button).toBeVisible();
    expect(trigger()).toHaveAttribute("aria-haspopup", "listbox");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).toHaveAttribute("type", "button");
    expect(trigger()).toHaveTextContent("Banana");
    await expect.element(button).toHaveAccessibleDescription("하나만 고릅니다.");
    // label의 for가 트리거를 가리킨다(오류 요약 #id 링크용).
    const label = document.querySelector("label")!;
    expect(label.htmlFor).toBe(trigger().id);
    // 숨은 select가 값을 갖고 보조기술에서 숨는다.
    const hidden = document.querySelector<HTMLSelectElement>('select[name="fruit"]')!;
    expect(hidden.value).toBe("banana");
    expect(hidden.closest("[aria-hidden='true']")).not.toBeNull();
    expect(hidden.tabIndex).toBe(-1);
  });

  test("Field label을 누르면 트리거에 포커스가 오고 목록은 열리지 않는다(네이티브 select와 같다)", async () => {
    await render(<Fruits />);
    await userEvent.click(page.getByText("과일", { exact: true }));
    await expect.element(page.getByTestId("trigger")).toHaveFocus();
    expect(listbox()).toBeNull();
  });

  test("고르지 않았으면 placeholder(기본 「선택하세요」)가 muted 글자로 보인다", async () => {
    await render(<Fruits />);
    await expect.element(page.getByRole("button", { name: "선택하세요 과일" })).toBeVisible();
    const value = trigger().querySelector("span")!;
    if (!forcedColors()) {
      expect(getComputedStyle(value).color).toBe(resolve("color", "var(--tide-text-muted)"));
    }
    await render(<Fruits placeholder="과일을 고르세요" />);
    expect(page.getByRole("button", { name: "과일을 고르세요 과일" }).elements()).toHaveLength(1);
  });

  test("Field 없이 aria-label로 이름을 붙인다", async () => {
    await render(
      <Select aria-label="정렬" defaultValue="new">
        <SelectItem value="new">최신순</SelectItem>
        <SelectItem value="old">오래된순</SelectItem>
      </Select>,
    );
    await expect.element(page.getByRole("button", { name: "최신순 정렬" })).toBeVisible();
  });
});

describe("열고 고르기", () => {
  test("누르면 listbox가 열리고 고른 옵션에 위치한다. 누른 옵션을 고르고 닫힌다", async () => {
    const onValueChange = vi.fn();
    await render(<Fruits defaultValue="banana" onValueChange={onValueChange} />);
    await userEvent.click(page.getByTestId("trigger"));
    const list = page.getByRole("listbox", { name: "과일" });
    await expect.element(list).toBeVisible();
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(trigger()).toHaveAttribute("aria-controls", listbox()!.id);
    expect(trigger()).toHaveAttribute("data-open", "");
    expect(page.getByRole("option").elements()).toHaveLength(5);
    await expect.element(page.getByTestId("banana")).toHaveFocus();
    expect(byTestId("banana")).toHaveAttribute("aria-selected", "true");
    expect(byTestId("banana")).toHaveAttribute("data-selected", "");
    expect(byTestId("apple")).toHaveAttribute("aria-selected", "false");

    await userEvent.click(page.getByRole("option", { name: "Grape" }));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("grape");
    await expectClosed();
    await expect.element(page.getByTestId("trigger")).toHaveFocus();
    expect(trigger()).toHaveTextContent("Grape");
    expect(document.querySelector<HTMLSelectElement>("select")!.value).toBe("grape");
  });

  test("Enter·Space·↓는 고른 옵션(없으면 첫 옵션), ↑는 마지막 옵션에 위치해 연다", async () => {
    await render(<Fruits />);
    await tabToTrigger();
    for (const key of ["{Enter}", " ", "{ArrowDown}"]) {
      await userEvent.keyboard(key);
      await expect.element(page.getByTestId("apple")).toHaveFocus();
      expect(highlighted()).toEqual(["Apple"]);
      await userEvent.keyboard("{Escape}");
      await expectClosed();
      await expect.element(page.getByTestId("trigger")).toHaveFocus();
    }
    await userEvent.keyboard("{ArrowUp}");
    await expect.element(page.getByTestId("kiwi")).toHaveFocus();
  });

  test("키보드로 옮겨(비활성 건너뜀) Enter로 고르면 닫히고 포커스가 트리거로 돌아온다", async () => {
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn();
    await render(<Fruits onValueChange={onValueChange} onOpenChange={onOpenChange} />);
    await tabToTrigger();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(page.getByTestId("apple")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    // Cherry(disabled)를 건너뛴다.
    await expect.element(page.getByTestId("grape")).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect.element(page.getByTestId("kiwi")).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect.element(page.getByTestId("apple")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("banana");
    await expectClosed();
    await expect.element(page.getByTestId("trigger")).toHaveFocus();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await expect.element(page.getByRole("button", { name: "Banana 과일" })).toBeVisible();
  });

  test("Space로도 고른다", async () => {
    const onValueChange = vi.fn();
    await render(<Fruits onValueChange={onValueChange} />);
    await tabToTrigger();
    await userEvent.keyboard("{ArrowUp}");
    await expect.element(page.getByTestId("kiwi")).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("kiwi");
    await expectClosed();
  });

  test("비활성 옵션은 aria-disabled이고 눌러도 고르지 않는다", async () => {
    const onValueChange = vi.fn();
    await render(<Fruits defaultOpen onValueChange={onValueChange} />);
    const cherry = byTestId("cherry");
    expect(cherry).toHaveAttribute("aria-disabled", "true");
    expect(cherry).toHaveAttribute("data-disabled", "");
    await userEvent.click(page.getByTestId("cherry"), { force: true });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(listbox()).not.toBeNull();
    expect(getComputedStyle(cherry).cursor).toBe("not-allowed");
  });

  test("Esc·바깥 누름·Tab으로 닫히고 포커스가 트리거로 돌아온다", async () => {
    await render(<Fruits />);
    await tabToTrigger();
    await userEvent.keyboard("{Enter}");
    await expect.element(page.getByTestId("apple")).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expectClosed();
    await expect.element(page.getByTestId("trigger")).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    await expect.element(page.getByTestId("apple")).toHaveFocus();
    expect(byTestId("outside").closest("[inert]")).not.toBeNull();
    await pressAt("outside");
    await expectClosed();
    await expect.element(page.getByTestId("trigger")).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    await expect.element(page.getByTestId("apple")).toHaveFocus();
    await userEvent.tab();
    await expectClosed();
    await expect.element(page.getByTestId("trigger")).toHaveFocus();
  });

  test("열린 동안 트리거를 다시 누르면 닫힌다", async () => {
    await render(<Fruits />);
    await userEvent.click(page.getByTestId("trigger"));
    expect(listbox()).not.toBeNull();
    await pressAt("trigger");
    await expectClosed();
  });

  test("목록 앞뒤에 스크린리더용 숨은 닫기 버튼이 있다", async () => {
    await render(<Fruits defaultOpen />);
    const popover = listbox()!.parentElement!;
    const dismiss = popover.querySelectorAll("button");
    expect(dismiss).toHaveLength(2);
    expect(dismiss[0]).toHaveAttribute("tabindex", "-1");
    // listbox의 자식은 option·group만 될 수 있어 닫기 버튼은 바깥 요소에 listbox 앞뒤로 둔다.
    expect(listbox()!.querySelector("button")).toBeNull();
    expect(dismiss[0]!.compareDocumentPosition(listbox()!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(dismiss[1]!.compareDocumentPosition(listbox()!)).toBe(Node.DOCUMENT_POSITION_PRECEDING);
    (dismiss[0] as HTMLButtonElement).click();
    await expectClosed();
  });
});

describe("타입어헤드", () => {
  // 한글은 IME 조합 중 keydown이 "Process"로 와서 쓰이지 않으므로 영문 옵션으로 확인한다(Menu와 같다).
  test("열린 목록에서 글자를 치면 그 글자로 시작하는 옵션으로 간다", async () => {
    await render(<Fruits />);
    await tabToTrigger();
    await userEvent.keyboard("{Enter}");
    await expect.element(page.getByTestId("apple")).toHaveFocus();
    await userEvent.keyboard("g");
    await expect.element(page.getByTestId("grape")).toHaveFocus();
    // 비활성 옵션(Cherry)으로는 가지 않는다.
    await userEvent.keyboard("c");
    await expect.element(page.getByTestId("grape")).toHaveFocus();
  });

  test("닫힌 트리거에서 글자를 치면 열지 않고 바로 그 옵션을 고른다(네이티브 select와 같다)", async () => {
    const onValueChange = vi.fn();
    await render(<Fruits onValueChange={onValueChange} />);
    await tabToTrigger();
    await userEvent.keyboard("k");
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("kiwi");
    expect(listbox()).toBeNull();
    await expect.element(page.getByRole("button", { name: "Kiwi 과일" })).toHaveFocus();
  });
});

describe("제어와 비제어", () => {
  test("value를 주면 onValueChange로만 바뀐다", async () => {
    const onValueChange = vi.fn();
    await render(<Fruits value="apple" onValueChange={onValueChange} />);
    await userEvent.click(page.getByTestId("trigger"));
    await userEvent.click(page.getByRole("option", { name: "Kiwi" }));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("kiwi");
    await expectClosed();
    // 부모가 바꾸지 않았으므로 그대로다.
    expect(trigger()).toHaveTextContent("Apple");
  });

  test("상태를 가진 부모가 value를 바꾸면 트리거와 폼 값이 따라간다. null이면 비운다", async () => {
    function Controlled(): ReactElement {
      const [value, setValue] = useState<string | null>("apple");
      return (
        <div>
          <Fruits value={value} onValueChange={setValue} />
          <button type="button" onClick={() => setValue(null)}>
            비우기
          </button>
          <output data-testid="value">{value ?? "없음"}</output>
        </div>
      );
    }
    await render(<Controlled />);
    await userEvent.click(page.getByTestId("trigger"));
    await userEvent.click(page.getByRole("option", { name: "Grape" }));
    await expect.element(page.getByTestId("value")).toHaveTextContent("grape");
    expect(trigger()).toHaveTextContent("Grape");
    await expectClosed();
    await userEvent.click(page.getByRole("button", { name: "비우기" }));
    await expect.element(page.getByTestId("value")).toHaveTextContent("없음");
    expect(trigger()).toHaveTextContent("선택하세요");
    expect(document.querySelector<HTMLSelectElement>("select")!.value).toBe("");
  });

  test("open을 주면 열림 상태를 제어하고, defaultOpen이면 열린 채로 시작한다", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = await render(<Fruits open={false} onOpenChange={onOpenChange} />);
    await userEvent.click(page.getByTestId("trigger"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(listbox()).toBeNull();
    await rerender(<Fruits open onOpenChange={onOpenChange} />);
    await expect.poll(listbox).not.toBeNull();

    await render(<Fruits defaultOpen />);
    expect(page.getByRole("listbox").elements().length).toBeGreaterThan(0);
  });
});

describe("Field와 폼", () => {
  test("Field의 오류는 aria-invalid·data-invalid·danger 경계와 설명 다음 오류 메시지로 연결된다", async () => {
    await render(
      <div data-theme="light">
        <Field label="과일" description="하나만 고릅니다." error="과일을 고르세요.">
          <Select>
            <SelectItem value="apple">Apple</SelectItem>
          </Select>
        </Field>
      </div>,
    );
    const button = page.getByRole("button", { name: "선택하세요 과일" });
    await expect.element(button).toHaveAttribute("aria-invalid", "true");
    await expect.element(button).toHaveAttribute("data-invalid", "");
    await expect.element(button).toHaveAccessibleDescription("하나만 고릅니다. 과일을 고르세요.");
    // Field가 그린 설명·오류 요소만 가리킨다(React Aria가 만든 빈 자리 id는 쓰지 않는다).
    const ids = button.element().getAttribute("aria-describedby")!.split(" ");
    expect(ids).toHaveLength(2);
    expect(ids.every((id) => document.getElementById(id) !== null)).toBe(true);
    if (!forcedColors()) {
      expect(getComputedStyle(button.element()).borderTopColor).toBe(
        resolve("borderTopColor", "var(--tide-border-danger)"),
      );
    }
  });

  test("Field의 disabled는 네이티브 :disabled라 열리지 않고 폼에 제출되지 않는다", async () => {
    await render(
      <form data-testid="form">
        <Field label="과일" disabled>
          <Select name="fruit" defaultValue="apple">
            <SelectItem value="apple">Apple</SelectItem>
          </Select>
        </Field>
      </form>,
    );
    const button = page.getByRole("button", { name: "Apple 과일" });
    await expect.element(button).toBeDisabled();
    await userEvent.click(button, { force: true });
    expect(listbox()).toBeNull();
    const form = byTestId("form") as HTMLFormElement;
    expect(new FormData(form).has("fruit")).toBe(false);
    expect(getComputedStyle(button.element()).cursor).toBe("not-allowed");
  });

  test("name으로 고른 값이 폼에 제출되고, reset하면 defaultValue로 돌아간다", async () => {
    const onSubmit = vi.fn();
    await render(
      <form
        data-testid="form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(Object.fromEntries(new FormData(event.currentTarget)));
        }}
      >
        <Fruits defaultValue="apple" />
        <Button type="submit">보내기</Button>
        <Button type="reset">되돌리기</Button>
      </form>,
    );
    await userEvent.click(page.getByRole("button", { name: "보내기" }));
    expect(onSubmit).toHaveBeenLastCalledWith({ fruit: "apple" });
    await userEvent.click(page.getByTestId("trigger"));
    await userEvent.click(page.getByRole("option", { name: "Kiwi" }));
    await expectClosed();
    await userEvent.click(page.getByRole("button", { name: "보내기" }));
    expect(onSubmit).toHaveBeenLastCalledWith({ fruit: "kiwi" });
    await userEvent.click(page.getByRole("button", { name: "되돌리기" }));
    await expect.element(page.getByTestId("trigger")).toHaveTextContent("Apple");
  });

  test("Field required면 비어 있을 때 제출이 막히고 트리거로 포커스가 오며 오류 상태가 된다", async () => {
    const onSubmit = vi.fn();
    await render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(Object.fromEntries(new FormData(event.currentTarget)));
        }}
      >
        <Field label="과일" required>
          <Select data-testid="trigger" name="fruit">
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
          </Select>
        </Field>
        <Button type="submit">보내기</Button>
      </form>,
    );
    expect(document.querySelector("select")).toHaveAttribute("required");
    expect(trigger()).not.toHaveAttribute("aria-invalid");
    await userEvent.click(page.getByRole("button", { name: "보내기" }));
    expect(onSubmit).not.toHaveBeenCalled();
    await expect.element(page.getByTestId("trigger")).toHaveFocus();
    await expect.element(page.getByTestId("trigger")).toHaveAttribute("aria-invalid", "true");
    // 고르면 오류 상태가 풀리고 제출된다.
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");
    await expectClosed();
    await expect.element(page.getByTestId("trigger")).not.toHaveAttribute("aria-invalid");
    await userEvent.click(page.getByRole("button", { name: "보내기" }));
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ fruit: "apple" });
  });

  test("Select에 직접 준 id·invalid가 Field 값을 이긴다", async () => {
    await render(
      <Field label="과일" error="오류">
        <Select id="fruit-select" invalid={false} data-testid="trigger">
          <SelectItem value="apple">Apple</SelectItem>
        </Select>
      </Field>,
    );
    expect(trigger().id).toBe("fruit-select");
    expect(trigger()).not.toHaveAttribute("aria-invalid");
  });
});

describe("모양", () => {
  const sizes: [NonNullable<SelectProps["size"]>, number][] = [
    ["sm", 32],
    ["md", 40],
    ["lg", 48],
  ];

  test.each(sizes)("%s는 같은 size의 Input·Button과 높이 %ipx가 같다", async (size, height) => {
    await render(
      <div className="flex items-center gap-2">
        <Select size={size} aria-label="과일" data-testid="trigger">
          <SelectItem value="apple">Apple</SelectItem>
        </Select>
        <Input size={size} aria-label="검색" data-testid="input" />
        <Button size={size}>검색</Button>
      </div>,
    );
    const select = trigger();
    const input = byTestId("input");
    expect(select.getBoundingClientRect().height).toBe(height);
    expect(input.getBoundingClientRect().height).toBe(height);
    const style = getComputedStyle(select);
    const inputStyle = getComputedStyle(input);
    expect(style.paddingLeft).toBe(inputStyle.paddingLeft);
    expect(style.fontSize).toBe(inputStyle.fontSize);
    expect(style.borderTopLeftRadius).toBe("6px");
  });

  test("기본 size는 md(40px)이고 chevron(장식용 16px)이 오른쪽 끝에 있다", async () => {
    await render(
      <div className="w-60">
        <Select aria-label="과일" data-testid="trigger">
          <SelectItem value="apple">Apple</SelectItem>
        </Select>
      </div>,
    );
    const select = trigger();
    expect(select.getBoundingClientRect().height).toBe(40);
    const chevron = select.querySelector("svg")!;
    expect(chevron).toHaveAttribute("aria-hidden", "true");
    expect(chevron.getBoundingClientRect().width).toBe(16);
    const right = select.getBoundingClientRect().right - chevron.getBoundingClientRect().right;
    // 오른쪽 padding 12px + border 1px
    expect(right).toBe(13);
  });

  test("클릭·키보드 포커스에 focus-field(border focus 색, inset 1px, 투명 outline)가 보인다", async () => {
    await render(<Fruits />);
    await tabToTrigger();
    await settle();
    const style = getComputedStyle(trigger());
    expect(style.outlineStyle).toBe("solid");
    expect(style.outlineWidth).toBe("2px");
    if (forcedColors()) {
      expect(style.boxShadow).toBe("none");
      expect(style.outlineColor).not.toBe(transparent);
    } else {
      const focus = resolve("borderTopColor", "var(--tide-outline-focus)");
      expect(style.borderTopColor).toBe(focus);
      expect(style.boxShadow).toBe(`${focus} 0px 0px 0px 1px inset`);
      expect(style.outlineColor).toBe(transparent);
    }
  });

  test("오류 상태에서도 포커스 중에는 focus-field가 이긴다", async () => {
    await render(<Fruits invalid />);
    await tabToTrigger();
    await settle();
    const style = getComputedStyle(trigger());
    if (forcedColors()) {
      expect(style.outlineColor).not.toBe(transparent);
      return;
    }
    const focus = resolve("borderTopColor", "var(--tide-outline-focus)");
    expect(style.borderTopColor).toBe(focus);
    expect(style.boxShadow).toBe(`${focus} 0px 0px 0px 1px inset`);
  });

  test("forced-colors에서도 트리거 경계가 보인다", async () => {
    await render(<Fruits />);
    const style = getComputedStyle(trigger());
    expect(style.borderTopWidth).toBe("1px");
    expect(style.borderTopStyle).toBe("solid");
    expect(style.borderTopColor).not.toBe(transparent);
  });

  test("목록은 portal로 body에 붙고 z-popover(300)·트리거 아래 4px·트리거보다 좁지 않다", async () => {
    await render(
      <div data-theme="dark" className="p-10">
        <Select aria-label="과일" data-testid="trigger" className="w-72" defaultOpen>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </Select>
      </div>,
    );
    await expect.poll(listbox).not.toBeNull();
    const popover = listbox()!.parentElement!;
    expect(popover.parentElement).toBe(document.body);
    expect(popover).toHaveAttribute("data-theme", "dark");
    expect(popover).toHaveAttribute("data-open", "");
    expect(popover).toHaveAttribute("data-placement", "bottom");
    const style = getComputedStyle(popover);
    expect(style.zIndex).toBe("300");
    expect(style.position).toBe("absolute");
    expect(style.paddingTop).toBe("3px");
    expect(style.borderTopLeftRadius).toBe("8px");
    const box = popover.getBoundingClientRect();
    const triggerBox = trigger().getBoundingClientRect();
    expect(box.top - triggerBox.bottom).toBeCloseTo(4, 0);
    expect(box.left).toBeCloseTo(triggerBox.left, 0);
    expect(box.width).toBeGreaterThanOrEqual(triggerBox.width);
  });

  test("고른 옵션은 subtle-active 배경과 체크 아이콘, 키보드 위치는 highlight이고 겹치면 highlight가 이긴다", async () => {
    await render(<Fruits defaultValue="banana" />);
    // 앞 테스트의 마우스가 옵션 자리에 남아 hover 배경이 생기지 않게 바깥으로 옮겨 둔다.
    await userEvent.hover(page.getByTestId("outside"));
    await tabToTrigger();
    await userEvent.keyboard("{Enter}");
    await expect.element(page.getByTestId("banana")).toHaveFocus();
    const banana = byTestId("banana");
    expect(banana.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(byTestId("apple").querySelector("svg")).toBeNull();
    const highlight = resolve("backgroundColor", "var(--tide-bg-primary-subtle)");
    if (!forcedColors()) expect(getComputedStyle(banana).backgroundColor).toBe(highlight);
    expect(getComputedStyle(banana).outlineStyle).toBe("solid");

    await userEvent.keyboard("{ArrowDown}");
    await expect.element(page.getByTestId("grape")).toHaveFocus();
    expect(highlighted()).toEqual(["Grape"]);
    if (forcedColors()) {
      expect(getComputedStyle(byTestId("grape")).outlineColor).not.toBe(transparent);
      return;
    }
    expect(getComputedStyle(banana).backgroundColor).toBe(
      resolve("backgroundColor", "var(--tide-bg-neutral-subtle-active)"),
    );
    expect(getComputedStyle(byTestId("grape")).backgroundColor).toBe(highlight);
    expect(getComputedStyle(byTestId("apple")).backgroundColor).toBe(transparent);
  });

  test("마우스를 올린 옵션이 위치가 된다", async () => {
    await render(<Fruits />);
    await userEvent.click(page.getByTestId("trigger"));
    await userEvent.hover(page.getByTestId("grape"));
    await expect.element(page.getByTestId("grape")).toHaveFocus();
    expect(highlighted()).toEqual(["Grape"]);
  });

  test("바로 나타나고, 닫히면 opacity만 fast(150ms)로 사라진 뒤 DOM에서 빠진다", async () => {
    const { rerender } = await render(<Fruits open />);
    await expect.poll(listbox).not.toBeNull();
    const popover = listbox()!.parentElement!;
    expect(getComputedStyle(popover).opacity).toBe("1");
    expect(getComputedStyle(popover).transitionProperty).toBe("none");
    // 전환 중 값을 읽어야 하므로 제어 prop을 바꾸고 곧바로 읽는다(Menu 테스트와 같다).
    await rerender(<Fruits open={false} />);
    const style = getComputedStyle(popover);
    expect(style.transitionProperty).toBe("opacity, display");
    expect(style.transitionDuration.split(", ")[0]).toBe("0.15s");
    expect(style.pointerEvents).toBe("none");
    await expectClosed();
  });
});

describe("옵션 묶음과 모으기", () => {
  test("SelectSection은 heading이 이름인 group이고 앞뒤에 구분선이 있다. 묶음 안 옵션도 value로 고른다", async () => {
    const onValueChange = vi.fn();
    await render(
      <Select aria-label="도시" defaultOpen onValueChange={onValueChange}>
        <SelectItem value="none">선택 안 함</SelectItem>
        <SelectSection heading="국내">
          <SelectItem value="seoul">Seoul</SelectItem>
          <SelectItem value="busan">Busan</SelectItem>
        </SelectSection>
        <SelectSection aria-label="해외">
          <SelectItem value="tokyo">Tokyo</SelectItem>
        </SelectSection>
      </Select>,
    );
    await expect.element(page.getByRole("group", { name: "국내" })).toBeVisible();
    await expect.element(page.getByRole("group", { name: "해외" })).toBeVisible();
    // listbox 안에는 separator 역할을 둘 수 없어 구분선은 보조기술에서 숨긴 장식 요소다.
    expect(listbox()!.querySelectorAll('[role="separator"]')).toHaveLength(0);
    expect(listbox()!.querySelectorAll('[role="presentation"][aria-hidden="true"]')).toHaveLength(
      2,
    );
    await userEvent.click(page.getByRole("option", { name: "Busan" }));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("busan");
    expect(document.querySelector<HTMLSelectElement>("select")!.value).toBe("busan");
  });

  test("Fragment·배열 안의 옵션과 아이콘이 있는 옵션도 모으고, 트리거에 옵션 내용이 보인다", async () => {
    const extra = ["Lemon", "Mango"];
    await render(
      <Select aria-label="과일" data-testid="trigger" defaultValue="Mango">
        <>
          <SelectItem value="apple">
            <svg data-testid="icon" aria-hidden="true" viewBox="0 0 16 16" />
            Apple
          </SelectItem>
        </>
        {extra.map((name) => (
          <SelectItem key={name} value={name}>
            {name}
          </SelectItem>
        ))}
      </Select>,
    );
    expect(trigger()).toHaveTextContent("Mango");
    await tabToTrigger();
    await userEvent.keyboard("a");
    expect(trigger()).toHaveTextContent("Apple");
    const icon = trigger().querySelector("svg[data-testid='icon']")!;
    expect(icon.getBoundingClientRect().width).toBe(16);
  });
});

describe("ref와 className", () => {
  test("ref는 트리거 button이고 사용자 className이 이긴다", async () => {
    let element: HTMLButtonElement | null = null;
    await render(
      <Select
        aria-label="과일"
        ref={(node) => {
          element = node;
        }}
        className="rounded-none"
      >
        <SelectItem value="apple" className="font-bold">
          Apple
        </SelectItem>
      </Select>,
    );
    expect(element).toBeInstanceOf(HTMLButtonElement);
    expect(getComputedStyle(element!).borderTopLeftRadius).toBe("0px");
  });

  test("타입: 지원하지 않는 size·value가 없는 옵션은 오류다", () => {
    // @ts-expect-error xs는 입력하기에 작아서 받지 않는다.
    void (<Select size="xs" aria-label="x" />);
    // @ts-expect-error SelectItem은 value가 필요하다.
    void (<SelectItem>사과</SelectItem>);
    // @ts-expect-error 값 변경은 onValueChange다.
    void (<Select onChange={() => undefined} aria-label="x" />);
  });
});
