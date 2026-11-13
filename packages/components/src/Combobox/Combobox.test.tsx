// Combobox 동작을 실제 Chromium에서 확인한다(tide-v0-impl 티켓 29).
// 두 instance에서 모두 돈다. 두 번째 instance(forced-colors·reduced-motion)에서는 포커스·위치 표시가 시스템 색
// outline으로 남는지를 본다.
//
// 목록은 non-modal이라 열린 동안에도 바깥이 inert가 아니다. 그래서 바깥 누름은 보통 click으로 한다(Select와 다르다).
// 한글 IME 조합은 Chrome DevTools Protocol(`cdp()`, vitest 5.1.0 docs/api/browser/context.md)의
// `Input.imeSetComposition`·`Input.insertText`로 실제 compositionstart/update/end를 일으켜 확인한다.
import { useState, type ReactElement } from "react";
import { I18nProvider } from "react-aria";
import { describe, expect, test, vi } from "vitest";
import { cdp, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { captureExit, styleSnapshot } from "../../test/motion.ts";

import { Button } from "../Button/Button.tsx";
import { Combobox, ComboboxItem, ComboboxSection, type ComboboxProps } from "./index.ts";
import { Field } from "../Field/Field.tsx";
import { Input } from "../Input/Input.tsx";
import { Select, SelectItem } from "../Select/index.ts";

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

function Fruits(props: Partial<ComboboxProps>): ReactElement {
  return (
    <div data-theme="light">
      <p data-testid="outside">바깥 글</p>
      <Field label="과일" description="이름을 쳐서 고릅니다.">
        <Combobox data-testid="input" name="fruit" {...props}>
          <ComboboxItem value="apple" data-testid="apple">
            사과
          </ComboboxItem>
          <ComboboxItem value="banana" data-testid="banana">
            바나나
          </ComboboxItem>
          <ComboboxItem value="pear" data-testid="pear">
            배
          </ComboboxItem>
          <ComboboxItem value="cherry" data-testid="cherry" disabled>
            체리
          </ComboboxItem>
          <ComboboxItem value="grape" data-testid="grape">
            포도
          </ComboboxItem>
          <ComboboxItem value="kiwi" data-testid="kiwi">
            키위
          </ComboboxItem>
        </Combobox>
      </Field>
      <button type="button" data-testid="after">
        다음
      </button>
    </div>
  );
}

const byTestId = (testId: string): HTMLElement => page.getByTestId(testId).element() as HTMLElement;
const input = (): HTMLInputElement => byTestId("input") as HTMLInputElement;
const chevron = (): HTMLButtonElement => input().nextElementSibling as HTMLButtonElement;
const listbox = (): HTMLElement | null => document.querySelector('[role="listbox"]');
const optionNames = (): string[] =>
  [...document.querySelectorAll('[role="option"]')].map((option) => option.textContent ?? "");
const highlighted = (): string[] =>
  [...document.querySelectorAll("[data-highlighted]")].map((item) => item.textContent ?? "");
const hiddenValue = (): string | undefined =>
  document.querySelector<HTMLInputElement>('input[type="hidden"][name="fruit"]')?.value;
/** React Aria LiveAnnouncer가 만든 live region의 글자 */
const announced = (): string =>
  document.querySelector('[aria-live="assertive"]')?.textContent?.trim() ?? "";

/** 목록이 DOM에서 빠질 때까지(퇴장 전환 끝) 기다린다. */
async function expectClosed(): Promise<void> {
  await expect.poll(listbox).toBeNull();
}

/** Tab으로 입력에 포커스한다(키보드 입력 방식이 된다). */
async function tabToInput(): Promise<void> {
  await userEvent.tab();
  expect(document.activeElement).toBe(input());
}

/** 가상 포커스가 가리키는 옵션. 입력의 aria-activedescendant로 찾는다. */
const activeOption = (): HTMLElement | null => {
  const id = input().getAttribute("aria-activedescendant");
  return id ? document.getElementById(id) : null;
};

describe("이름과 연결", () => {
  test("입력은 combobox 역할이고 Field label이 이름, 설명이 연결된다", async () => {
    await render(<Fruits />);
    const combobox = page.getByRole("combobox", { name: "과일" });
    await expect.element(combobox).toBeVisible();
    await expect.element(combobox).toHaveAccessibleDescription("이름을 쳐서 고릅니다.");
    expect(input().tagName).toBe("INPUT");
    expect(input()).toHaveAttribute("aria-autocomplete", "list");
    expect(input()).toHaveAttribute("aria-expanded", "false");
    expect(input()).toHaveAttribute("autocomplete", "off");
    expect(input()).not.toHaveAttribute("aria-controls");
    // label의 for가 입력을 가리킨다(label을 누르면 입력에 포커스).
    const label = document.querySelector("label")!;
    expect(label.htmlFor).toBe(input().id);
    await userEvent.click(page.getByText("과일", { exact: true }));
    await expect.element(page.getByTestId("input")).toHaveFocus();
    expect(listbox()).toBeNull();
    // 설명 요소만 가리킨다(React Aria가 만든 값·설명·오류 빈 자리 id는 쓰지 않는다).
    const ids = input().getAttribute("aria-describedby")!.split(" ");
    expect(ids).toHaveLength(1);
    expect(document.getElementById(ids[0]!)).not.toBeNull();
  });

  test("chevron 버튼은 Tab 순서 밖이고 아이콘은 장식용이다", async () => {
    await render(<Fruits />);
    expect(chevron().tagName).toBe("BUTTON");
    expect(chevron()).toHaveAttribute("tabindex", "-1");
    expect(chevron()).toHaveAttribute("aria-haspopup", "listbox");
    expect(chevron().querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    await tabToInput();
    await userEvent.tab();
    await expect.element(page.getByTestId("after")).toHaveFocus();
  });

  test("Field 없이 aria-label로 이름을 붙인다", async () => {
    await render(
      <Combobox aria-label="도시">
        <ComboboxItem value="seoul">서울</ComboboxItem>
      </Combobox>,
    );
    await expect.element(page.getByRole("combobox", { name: "도시" })).toBeVisible();
  });
});

describe("입력 필터링", () => {
  test("치면 목록이 열리고 친 글자가 들어 있는 옵션만 남는다. 포커스는 입력에 있다", async () => {
    const onOpenChange = vi.fn();
    await render(<Fruits onOpenChange={onOpenChange} />);
    await tabToInput();
    await userEvent.keyboard("바");
    await expect.poll(listbox).not.toBeNull();
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(optionNames()).toEqual(["바나나"]);
    expect(input()).toHaveAttribute("aria-expanded", "true");
    expect(input()).toHaveAttribute("aria-controls", listbox()!.id);
    expect(input()).toHaveAttribute("data-open", "");
    expect(document.activeElement).toBe(input());
    // 글자를 지우면 다시 전체가 남는다.
    await userEvent.keyboard("{Backspace}");
    await expect.poll(optionNames).toHaveLength(6);
    await userEvent.keyboard("포");
    await expect.poll(optionNames).toEqual(["포도"]);
  });

  test("대소문자와 악센트를 무시하고 글자 중간에 든 것도 남긴다", async () => {
    await render(
      <Combobox aria-label="도시" data-testid="input">
        <ComboboxItem value="paris">Paris</ComboboxItem>
        <ComboboxItem value="sao-paulo">São Paulo</ComboboxItem>
        <ComboboxItem value="rome">Rome</ComboboxItem>
      </Combobox>,
    );
    await tabToInput();
    await userEvent.keyboard("A");
    await expect.poll(optionNames).toEqual(["Paris", "São Paulo"]);
    await userEvent.keyboard("{Backspace}sao");
    await expect.poll(optionNames).toEqual(["São Paulo"]);
  });

  test("거른 결과가 없으면 목록이 닫히지 않고 「결과가 없습니다」가 보인다", async () => {
    await render(<Fruits />);
    await tabToInput();
    await userEvent.keyboard("수박");
    await expect.poll(listbox).not.toBeNull();
    expect(optionNames()).toEqual([]);
    const popover = listbox()!.parentElement!;
    await expect.element(page.getByText("결과가 없습니다")).toBeVisible();
    // 메시지는 listbox 밖(같은 목록 표면 안)에 있다. listbox 자식은 option·group만 될 수 있다.
    expect(listbox()!.textContent).toBe("");
    expect(popover).toHaveTextContent("결과가 없습니다");
    expect(input()).toHaveAttribute("aria-expanded", "true");
    expect(input()).not.toHaveAttribute("aria-activedescendant");
    // Enter는 아무것도 고르지 않는다.
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(input().value).toBe("");
  });

  test("emptyMessage로 결과 없음 글자를 바꾼다", async () => {
    await render(<Fruits emptyMessage="찾는 과일이 없어요" />);
    await tabToInput();
    await userEvent.keyboard("수박");
    await expect.element(page.getByText("찾는 과일이 없어요")).toBeVisible();
  });

  test("열릴 때와 결과 개수가 바뀔 때 개수를 live region으로 알린다(locale 문구)", async () => {
    await render(<Fruits />);
    await tabToInput();
    await userEvent.keyboard("바");
    // live region(role="log")은 알린 문구를 이어 붙이므로 마지막 문구를 본다.
    await expect.poll(announced).toMatch(/1 option available\.$/);
    await userEvent.keyboard("{Backspace}");
    await expect.poll(announced).toMatch(/6 options available\.$/);
    await userEvent.keyboard("수");
    await expect.poll(announced).toMatch(/0 options available\.$/);

    // 앱 locale이 한국어면 한국어로 알린다(React Aria 번역 문구).
    await render(
      <I18nProvider locale="ko-KR">
        <Combobox aria-label="과일" data-testid="ko">
          <ComboboxItem value="apple">사과</ComboboxItem>
          <ComboboxItem value="banana">바나나</ComboboxItem>
        </Combobox>
      </I18nProvider>,
    );
    await userEvent.click(page.getByTestId("ko"));
    await userEvent.keyboard("사");
    await expect.poll(announced).toMatch(/1개 옵션을 사용할 수 있습니다\.$/);
  });

  test("묶음은 남은 옵션이 없으면 빠지고, 남으면 heading이 이름인 group으로 보인다", async () => {
    await render(
      <Combobox aria-label="도시" data-testid="input">
        <ComboboxItem value="none">선택 안 함</ComboboxItem>
        <ComboboxSection heading="국내">
          <ComboboxItem value="seoul">서울</ComboboxItem>
          <ComboboxItem value="busan">부산</ComboboxItem>
        </ComboboxSection>
        <ComboboxSection aria-label="해외">
          <ComboboxItem value="tokyo">도쿄</ComboboxItem>
        </ComboboxSection>
      </Combobox>,
    );
    await tabToInput();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(page.getByRole("group", { name: "국내" })).toBeVisible();
    await expect.element(page.getByRole("group", { name: "해외" })).toBeVisible();
    expect(listbox()!.querySelectorAll('[role="presentation"][aria-hidden="true"]')).toHaveLength(
      2,
    );
    await userEvent.keyboard("부");
    await expect.poll(optionNames).toEqual(["부산"]);
    expect(page.getByRole("group", { name: "해외" }).elements()).toHaveLength(0);
    await expect.element(page.getByRole("group", { name: "국내" })).toBeVisible();
  });
});

describe("화살표 이동과 선택", () => {
  test("↓는 첫 옵션, ↑는 마지막 옵션에 가상 포커스를 두고 연다. 포커스는 입력에 남는다", async () => {
    await render(<Fruits />);
    await tabToInput();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(activeOption).toBe(byTestId("apple"));
    expect(highlighted()).toEqual(["사과"]);
    expect(document.activeElement).toBe(input());
    expect(optionNames()).toHaveLength(6);
    await userEvent.keyboard("{Escape}");
    await expectClosed();
    await userEvent.keyboard("{ArrowUp}");
    await expect.poll(activeOption).toBe(byTestId("kiwi"));
  });

  test("화살표로 옮기고(비활성 건너뜀) Enter로 고르면 닫히고 입력에 옵션 글자가 들어간다", async () => {
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn();
    await render(<Fruits onValueChange={onValueChange} onOpenChange={onOpenChange} />);
    await tabToInput();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
    await expect.poll(activeOption).toBe(byTestId("pear"));
    // 체리(disabled)를 건너뛴다.
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(activeOption).toBe(byTestId("grape"));
    expect(byTestId("cherry")).toHaveAttribute("aria-disabled", "true");
    expect(byTestId("cherry")).toHaveAttribute("data-disabled", "");
    await userEvent.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("grape");
    await expectClosed();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(input().value).toBe("포도");
    expect(hiddenValue()).toBe("grape");
    expect(document.activeElement).toBe(input());
  });

  test("거른 목록에서 ↓로 옮겨 Enter로 고른다", async () => {
    const onValueChange = vi.fn();
    await render(<Fruits onValueChange={onValueChange} />);
    await tabToInput();
    await userEvent.keyboard("바");
    await expect.poll(optionNames).toEqual(["바나나"]);
    // 치는 동안은 가상 포커스가 없다(친 글자를 Enter로 덮지 않는다).
    expect(input()).not.toHaveAttribute("aria-activedescendant");
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(activeOption).toBe(byTestId("banana"));
    await userEvent.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("banana");
    expect(input().value).toBe("바나나");
  });

  test("다시 열면 고른 옵션이 data-selected와 체크 아이콘으로 보인다", async () => {
    await render(<Fruits defaultValue="banana" />);
    expect(input().value).toBe("바나나");
    expect(hiddenValue()).toBe("banana");
    await tabToInput();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(listbox).not.toBeNull();
    // 열 때는 입력 글자로 거르지 않고 전체를 보인다.
    expect(optionNames()).toHaveLength(6);
    expect(byTestId("banana")).toHaveAttribute("aria-selected", "true");
    expect(byTestId("banana")).toHaveAttribute("data-selected", "");
    expect(byTestId("banana").querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(byTestId("apple")).toHaveAttribute("aria-selected", "false");
    // ↓·↑ 모두 고른 옵션에 위치해 연다.
    await expect.poll(activeOption).toBe(byTestId("banana"));
    await userEvent.keyboard("{Escape}");
    await expectClosed();
    await userEvent.keyboard("{ArrowUp}");
    await expect.poll(activeOption).toBe(byTestId("banana"));
  });

  test("chevron 버튼을 누르면 전체 목록이 열리고, 누른 옵션을 고른다. 포커스는 입력에 있다", async () => {
    const onValueChange = vi.fn();
    await render(<Fruits onValueChange={onValueChange} />);
    await userEvent.click(chevron());
    await expect.poll(listbox).not.toBeNull();
    expect(optionNames()).toHaveLength(6);
    expect(document.activeElement).toBe(input());
    await userEvent.click(page.getByRole("option", { name: "키위" }));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("kiwi");
    await expectClosed();
    expect(input().value).toBe("키위");
    expect(document.activeElement).toBe(input());
  });

  test("열린 동안 chevron 버튼을 다시 누르면 닫히고 다시 열리지 않는다(non-modal 바깥 누름과 겹치지 않는다)", async () => {
    await render(<Fruits />);
    await userEvent.click(chevron());
    await expect.poll(listbox).not.toBeNull();
    await userEvent.click(chevron());
    await expectClosed();
    await new Promise((done) => setTimeout(done, 200));
    expect(listbox()).toBeNull();
  });

  test("마우스를 올린 옵션이 위치가 된다", async () => {
    await render(<Fruits />);
    await userEvent.hover(page.getByTestId("outside"));
    await userEvent.click(chevron());
    await userEvent.hover(page.getByTestId("grape"));
    await expect.poll(highlighted).toEqual(["포도"]);
    expect(activeOption()).toBe(byTestId("grape"));
  });

  test("비활성 옵션은 눌러도 고르지 않는다", async () => {
    const onValueChange = vi.fn();
    await render(<Fruits onValueChange={onValueChange} />);
    await userEvent.click(chevron());
    await userEvent.click(page.getByTestId("cherry"), { force: true });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(listbox()).not.toBeNull();
    expect(getComputedStyle(byTestId("cherry")).cursor).toBe("not-allowed");
  });
});

describe("닫기와 자유 입력 없음", () => {
  test("Esc는 닫고 입력을 고른 옵션의 글자로 되돌린다", async () => {
    await render(<Fruits defaultValue="apple" />);
    await tabToInput();
    // Tab 포커스는 글자를 모두 선택하므로 바로 치면 바뀐다.
    await userEvent.keyboard("배");
    await expect.poll(optionNames).toEqual(["배"]);
    await userEvent.keyboard("{Escape}");
    await expectClosed();
    expect(input().value).toBe("사과");
    expect(document.activeElement).toBe(input());
  });

  test("바깥을 누르면 닫히고, 고르지 않은 글자는 지워진다(바깥은 inert가 아니다)", async () => {
    const onValueChange = vi.fn();
    await render(<Fruits onValueChange={onValueChange} />);
    await tabToInput();
    await userEvent.keyboard("바나");
    await expect.poll(listbox).not.toBeNull();
    expect(byTestId("outside").closest("[inert]")).toBeNull();
    await userEvent.click(page.getByTestId("outside"));
    await expectClosed();
    expect(input().value).toBe("");
    expect(onValueChange).not.toHaveBeenCalled();
    // 포커스를 입력으로 되돌리지 않는다.
    expect(document.activeElement).not.toBe(input());
  });

  test("Tab은 가상 포커스의 옵션을 고르고 닫으며 포커스는 다음 요소로 간다", async () => {
    const onValueChange = vi.fn();
    await render(<Fruits onValueChange={onValueChange} />);
    await tabToInput();
    // 거른 목록이 열린 것을 본 뒤에 ↓를 누른다. 입력으로 목록을 여는 것은 React Stately가 render 뒤 effect에서 하므로,
    // 그 전에 ↓가 도착하면 「닫힌 목록을 ↓로 연다」가 되어 거르지 않은 전체 목록의 첫 옵션(사과)에 간다
    // (useComboBoxState open(…, 'manual') → showAllItems). 한 번에 "포{ArrowDown}"을 보내면 부하에 따라 그렇게 됐다.
    await userEvent.keyboard("포");
    await expect.poll(optionNames).toEqual(["포도"]);
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(activeOption).toBe(byTestId("grape"));
    await userEvent.tab();
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("grape");
    await expectClosed();
    await expect.element(page.getByTestId("after")).toHaveFocus();
    expect(input().value).toBe("포도");
  });

  test("입력을 모두 지우면 고른 값이 비고 onValueChange(null)이 불린다", async () => {
    const onValueChange = vi.fn();
    await render(<Fruits defaultValue="kiwi" onValueChange={onValueChange} />);
    await tabToInput();
    await userEvent.keyboard("{Backspace}{Backspace}");
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(hiddenValue()).toBe("");
  });
});

describe("한글 IME 조합", () => {
  /** 입력에 조합 중 글자를 둔다(compositionstart·update). */
  const compose = (text: string): Promise<unknown> =>
    cdp().send("Input.imeSetComposition", {
      text,
      selectionStart: text.length,
      selectionEnd: text.length,
    });
  /** 조합을 끝내고 글자를 넣는다(compositionend). */
  const commitComposition = (text: string): Promise<unknown> =>
    cdp().send("Input.insertText", { text });
  const pressEnter = async (keyCode = 13): Promise<void> => {
    const key = { key: "Enter", code: "Enter", windowsVirtualKeyCode: keyCode };
    await cdp().send("Input.dispatchKeyEvent", { type: "rawKeyDown", ...key });
    await cdp().send("Input.dispatchKeyEvent", { type: "keyUp", ...key });
  };

  test("조합 중에도 거르고, 조합 중 Enter는 고르거나 입력을 되돌리지 않는다", async () => {
    const events: string[] = [];
    const onValueChange = vi.fn();
    await render(
      <Fruits
        onValueChange={onValueChange}
        onCompositionStart={() => events.push("start")}
        onCompositionEnd={() => events.push("end")}
        onKeyDown={(event) => {
          if (event.key === "Enter") events.push(`enter:${event.nativeEvent.isComposing}`);
        }}
      />,
    );
    await tabToInput();
    await compose("ㅂ");
    await compose("바");
    await expect.poll(optionNames).toEqual(["바나나"]);
    expect(input().value).toBe("바");
    // 조합 중 Enter(IME가 조합을 끝내는 키)
    await pressEnter();
    expect(events).toEqual(["start", "enter:true"]);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(input().value).toBe("바");
    expect(listbox()).not.toBeNull();
    await commitComposition("바");
    expect(events).toEqual(["start", "enter:true", "end"]);
    expect(input().value).toBe("바");
    await expect.poll(optionNames).toEqual(["바나나"]);
    // 조합이 끝난 뒤의 ↓·Enter는 목록 동작이다.
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("banana");
    expect(input().value).toBe("바나나");
  });

  test("여러 음절을 이어 조합해도 최종 글자로 거른다", async () => {
    await render(<Fruits />);
    await tabToInput();
    await compose("ㅍ");
    await compose("포");
    await commitComposition("포");
    await compose("ㄷ");
    await compose("도");
    await expect.poll(optionNames).toEqual(["포도"]);
    await commitComposition("도");
    expect(input().value).toBe("포도");
    await expect.poll(optionNames).toEqual(["포도"]);
  });

  test("조합을 끝낸 직후 keyCode 229 Enter(Safari 순서)도 목록 동작에 쓰지 않는다", async () => {
    const onValueChange = vi.fn();
    await render(<Fruits onValueChange={onValueChange} />);
    await tabToInput();
    await compose("배");
    await commitComposition("배");
    await expect.poll(optionNames).toEqual(["배"]);
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(activeOption).toBe(byTestId("pear"));
    await pressEnter(229);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(input().value).toBe("배");
    expect(listbox()).not.toBeNull();
  });
});

describe("제어와 비제어", () => {
  test("value를 주면 onValueChange로만 바뀌고, 부모가 바꾸면 입력 글자가 따라간다", async () => {
    function Controlled(): ReactElement {
      const [value, setValue] = useState<string | null>("apple");
      return (
        <div>
          <Fruits value={value} onValueChange={setValue} />
          <button type="button" onClick={() => setValue("pear")}>
            배로
          </button>
          <output data-testid="value">{value ?? "없음"}</output>
        </div>
      );
    }
    await render(<Controlled />);
    expect(input().value).toBe("사과");
    await userEvent.click(chevron());
    await userEvent.click(page.getByRole("option", { name: "포도" }));
    await expect.element(page.getByTestId("value")).toHaveTextContent("grape");
    expect(input().value).toBe("포도");
    await expectClosed();
    await userEvent.click(page.getByRole("button", { name: "배로" }));
    await expect.poll(() => input().value).toBe("배");
    expect(hiddenValue()).toBe("pear");
  });

  test("부모가 바꾸지 않으면 고른 값과 입력 글자가 그대로다", async () => {
    const onValueChange = vi.fn();
    await render(<Fruits value="apple" onValueChange={onValueChange} />);
    await userEvent.click(chevron());
    await userEvent.click(page.getByRole("option", { name: "키위" }));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("kiwi");
    await expect.poll(() => input().value).toBe("사과");
    expect(hiddenValue()).toBe("apple");
  });
});

describe("Field와 폼", () => {
  test("Field의 오류는 aria-invalid·data-invalid·danger 경계와 설명 다음 오류 메시지로 연결된다", async () => {
    await render(
      <div data-theme="light">
        <Field label="과일" description="이름을 쳐서 고릅니다." error="과일을 고르세요.">
          <Combobox>
            <ComboboxItem value="apple">사과</ComboboxItem>
          </Combobox>
        </Field>
      </div>,
    );
    const combobox = page.getByRole("combobox", { name: "과일" });
    await expect.element(combobox).toHaveAttribute("aria-invalid", "true");
    await expect.element(combobox).toHaveAttribute("data-invalid", "");
    await expect
      .element(combobox)
      .toHaveAccessibleDescription("이름을 쳐서 고릅니다. 과일을 고르세요.");
    const ids = combobox.element().getAttribute("aria-describedby")!.split(" ");
    expect(ids).toHaveLength(2);
    expect(ids.every((id) => document.getElementById(id) !== null)).toBe(true);
    if (!forcedColors()) {
      expect(getComputedStyle(combobox.element()).borderTopColor).toBe(
        resolve("borderTopColor", "var(--tide-border-danger)"),
      );
    }
  });

  test("Field의 disabled는 입력·버튼 모두 :disabled라 열리지 않고 폼에 제출되지 않는다", async () => {
    await render(
      <form data-testid="form">
        <Field label="과일" disabled>
          <Combobox name="fruit" defaultValue="apple" data-testid="input">
            <ComboboxItem value="apple">사과</ComboboxItem>
          </Combobox>
        </Field>
      </form>,
    );
    await expect.element(page.getByRole("combobox", { name: "과일" })).toBeDisabled();
    expect(chevron()).toBeDisabled();
    await userEvent.click(chevron(), { force: true });
    expect(listbox()).toBeNull();
    const form = byTestId("form") as HTMLFormElement;
    expect(new FormData(form).has("fruit")).toBe(false);
    expect(getComputedStyle(input()).cursor).toBe("not-allowed");
    expect(getComputedStyle(chevron()).cursor).toBe("not-allowed");
  });

  test("name으로 고른 옵션의 value가 제출되고(입력 글자는 아님), reset하면 defaultValue로 돌아간다", async () => {
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
    await userEvent.click(chevron());
    await userEvent.click(page.getByRole("option", { name: "키위" }));
    await expectClosed();
    await userEvent.click(page.getByRole("button", { name: "보내기" }));
    expect(onSubmit).toHaveBeenLastCalledWith({ fruit: "kiwi" });
    await userEvent.click(page.getByRole("button", { name: "되돌리기" }));
    await expect.poll(() => input().value).toBe("사과");
    expect(hiddenValue()).toBe("apple");
  });

  test("Field required면 입력이 required이고, 비어 있으면 제출이 막히고 입력으로 포커스가 오며 오류 상태가 된다", async () => {
    const onSubmit = vi.fn();
    await render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(Object.fromEntries(new FormData(event.currentTarget)));
        }}
      >
        <Field label="과일" required>
          <Combobox data-testid="input" name="fruit">
            <ComboboxItem value="apple">사과</ComboboxItem>
            <ComboboxItem value="banana">바나나</ComboboxItem>
          </Combobox>
        </Field>
        <Button type="submit">보내기</Button>
      </form>,
    );
    expect(input()).toHaveAttribute("required");
    expect(input()).not.toHaveAttribute("aria-invalid");
    await userEvent.click(page.getByRole("button", { name: "보내기" }));
    expect(onSubmit).not.toHaveBeenCalled();
    await expect.element(page.getByTestId("input")).toHaveFocus();
    await expect.element(page.getByTestId("input")).toHaveAttribute("aria-invalid", "true");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expectClosed();
    // 오류 상태는 포커스가 떠날 때 다시 검사한다(React Aria useComboBoxState commitValidation).
    await userEvent.tab();
    await expect.element(page.getByTestId("input")).not.toHaveAttribute("aria-invalid");
    await userEvent.click(page.getByRole("button", { name: "보내기" }));
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ fruit: "apple" });
  });

  test("Combobox에 직접 준 id·invalid가 Field 값을 이긴다", async () => {
    await render(
      <Field label="과일" error="오류">
        <Combobox id="fruit-combobox" invalid={false} data-testid="input">
          <ComboboxItem value="apple">사과</ComboboxItem>
        </Combobox>
      </Field>,
    );
    expect(input().id).toBe("fruit-combobox");
    expect(input()).not.toHaveAttribute("aria-invalid");
  });
});

describe("모양", () => {
  const sizes: [NonNullable<ComboboxProps["size"]>, number, number][] = [
    ["sm", 32, 11],
    ["md", 40, 13],
    ["lg", 48, 17],
  ];

  test.each(sizes)(
    "%s는 같은 size의 Input·Select와 높이 %ipx가 같고 chevron이 Select와 같은 자리(끝에서 %ipx)에 있다",
    async (size, height, end) => {
      await render(
        <div className="flex w-[40rem] items-center gap-2">
          <div className="w-60">
            <Combobox size={size} aria-label="과일" data-testid="input">
              <ComboboxItem value="apple">사과</ComboboxItem>
            </Combobox>
          </div>
          <Input size={size} aria-label="검색" data-testid="plain" className="w-40" />
          <Select size={size} aria-label="정렬" data-testid="select" className="w-40">
            <SelectItem value="new">최신순</SelectItem>
          </Select>
        </div>,
      );
      const box = input().getBoundingClientRect();
      expect(box.height).toBe(height);
      expect(byTestId("plain").getBoundingClientRect().height).toBe(height);
      expect(byTestId("select").getBoundingClientRect().height).toBe(height);
      const style = getComputedStyle(input());
      const plainStyle = getComputedStyle(byTestId("plain"));
      expect(style.paddingLeft).toBe(plainStyle.paddingLeft);
      expect(style.fontSize).toBe(plainStyle.fontSize);
      expect(style.borderTopLeftRadius).toBe("6px");
      const icon = chevron().querySelector("svg")!.getBoundingClientRect();
      expect(icon.width).toBe(16);
      expect(box.right - icon.right).toBe(end);
      const selectIcon = byTestId("select").querySelector("svg")!.getBoundingClientRect();
      expect(byTestId("select").getBoundingClientRect().right - selectIcon.right).toBe(end);
      // 글자가 chevron 밑으로 들어가지 않게 끝 padding이 chevron + 8px를 비운다.
      expect(box.right - Number.parseFloat(style.paddingRight)).toBeLessThanOrEqual(
        icon.left - 8 + 1,
      );
      // 버튼은 입력 끝 안쪽에 겹친다(높이도 입력과 같다).
      const button = chevron().getBoundingClientRect();
      expect(button.right).toBe(box.right);
      expect(button.height).toBe(height);
    },
  );

  test("사용자 className으로 입력 폭을 바꿔도 chevron이 입력 끝에 붙어 있다", async () => {
    await render(
      <Combobox aria-label="과일" data-testid="input" className="w-48">
        <ComboboxItem value="apple">사과</ComboboxItem>
      </Combobox>,
    );
    const box = input().getBoundingClientRect();
    expect(box.width).toBe(192);
    expect(chevron().getBoundingClientRect().right).toBe(box.right);
  });

  test("클릭·키보드 포커스에 focus-field(border focus 색, inset 1px)가 보이고, 투명 outline은 forced-colors에서만 있다", async () => {
    await render(<Fruits />);
    await tabToInput();
    await settle();
    const style = getComputedStyle(input());
    if (forcedColors()) {
      expect(style.boxShadow).toBe("none");
      expect(style.outlineStyle).toBe("solid");
      expect(style.outlineWidth).toBe("2px");
      expect(style.outlineColor).not.toBe(transparent);
    } else {
      const focus = resolve("borderTopColor", "var(--tide-outline-focus)");
      expect(style.borderTopColor).toBe(focus);
      expect(style.boxShadow).toBe(`${focus} 0px 0px 0px 1px inset`);
      expect(style.outlineStyle).toBe("none");
    }
  });

  test("forced-colors에서도 입력 경계가 보이고, chevron은 muted 글자색이다", async () => {
    await render(<Fruits />);
    const style = getComputedStyle(input());
    expect(style.borderTopWidth).toBe("1px");
    expect(style.borderTopStyle).toBe("solid");
    expect(style.borderTopColor).not.toBe(transparent);
    if (!forcedColors()) {
      expect(getComputedStyle(chevron()).color).toBe(resolve("color", "var(--tide-text-muted)"));
    }
  });

  test("목록은 portal로 body에 붙고 z-popover(300)·입력 아래 4px·입력보다 좁지 않다", async () => {
    await render(
      <div data-theme="dark" className="p-10">
        <Combobox aria-label="과일" data-testid="input" className="w-72">
          <ComboboxItem value="apple">사과</ComboboxItem>
          <ComboboxItem value="banana">바나나</ComboboxItem>
        </Combobox>
      </div>,
    );
    await userEvent.click(chevron());
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
    const inputBox = input().getBoundingClientRect();
    expect(box.top - inputBox.bottom).toBeCloseTo(4, 0);
    expect(box.left).toBeCloseTo(inputBox.left, 0);
    expect(box.width).toBeGreaterThanOrEqual(inputBox.width);
  });

  test("가상 포커스의 옵션은 highlight, 고른 옵션은 subtle-active이고 겹치면 highlight가 이긴다", async () => {
    await render(<Fruits defaultValue="banana" />);
    await userEvent.hover(page.getByTestId("outside"));
    await tabToInput();
    // 고른 옵션이 있으면 ↓로 열 때 그 옵션에 위치한다.
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(activeOption).toBe(byTestId("banana"));
    const banana = byTestId("banana");
    const highlight = resolve("backgroundColor", "var(--tide-bg-primary-subtle)");
    if (!forcedColors()) expect(getComputedStyle(banana).backgroundColor).toBe(highlight);
    expect(getComputedStyle(banana).outlineStyle).toBe("solid");

    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(highlighted).toEqual(["배"]);
    if (forcedColors()) {
      expect(getComputedStyle(byTestId("pear")).outlineColor).not.toBe(transparent);
      return;
    }
    expect(getComputedStyle(banana).backgroundColor).toBe(
      resolve("backgroundColor", "var(--tide-bg-neutral-subtle-active)"),
    );
    expect(getComputedStyle(byTestId("pear")).backgroundColor).toBe(highlight);
    expect(getComputedStyle(byTestId("apple")).backgroundColor).toBe(transparent);
  });

  test("결과 없음 글자는 muted이고 옵션 하나 높이(32px)다", async () => {
    await render(<Fruits />);
    await tabToInput();
    await userEvent.keyboard("수박");
    const message = page.getByText("결과가 없습니다").element() as HTMLElement;
    await expect.element(page.getByText("결과가 없습니다")).toBeVisible();
    expect(message.getBoundingClientRect().height).toBe(32);
    if (!forcedColors()) {
      expect(getComputedStyle(message).color).toBe(resolve("color", "var(--tide-text-muted)"));
    }
  });

  test("바로 나타나고, 닫히면 opacity만 fast(150ms)로 사라진 뒤 DOM에서 빠진다", async () => {
    await render(<Fruits />);
    await tabToInput();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(listbox).not.toBeNull();
    const popover = listbox()!.parentElement!;
    expect(getComputedStyle(popover).opacity).toBe("1");
    expect(getComputedStyle(popover).transitionProperty).toBe("none");
    // 닫힌 직후(퇴장 전환 중)의 계산값. Escape 명령이 돌아온 뒤에 읽으면 부하에 따라 퇴장이 이미 끝나 있다(test/motion.ts).
    const exit = captureExit(popover, () => ({
      connected: popover.isConnected,
      style: styleSnapshot(popover),
    }));
    await userEvent.keyboard("{Escape}");
    const { connected, style } = await exit;
    expect(connected).toBe(true);
    expect(style.transitionProperty).toBe("opacity, display");
    expect(style.transitionDuration.split(", ")[0]).toBe("0.15s");
    expect(style.pointerEvents).toBe("none");
    await expectClosed();
  });
});

describe("모으기, ref와 className", () => {
  test("Fragment·배열 안의 옵션도 모으고, textValue가 거르기와 입력 글자에 쓰인다", async () => {
    const extra = ["레몬", "망고"];
    await render(
      <Combobox aria-label="과일" data-testid="input" defaultValue="mango-icon">
        <>
          <ComboboxItem value="apple">사과</ComboboxItem>
        </>
        {extra.map((name) => (
          <ComboboxItem key={name} value={name}>
            {name}
          </ComboboxItem>
        ))}
        <ComboboxItem value="mango-icon" textValue="애플망고">
          <svg aria-hidden="true" viewBox="0 0 16 16" />
          애플망고 (제철)
        </ComboboxItem>
      </Combobox>,
    );
    expect(input().value).toBe("애플망고");
    await tabToInput();
    await userEvent.keyboard("망");
    await expect.poll(optionNames).toEqual(["망고", "애플망고 (제철)"]);
  });

  test("ref는 입력 input이고 사용자 className이 이긴다. 그 밖의 props도 입력에 간다", async () => {
    let element: HTMLInputElement | null = null;
    await render(
      <Combobox
        aria-label="과일"
        placeholder="과일 이름"
        ref={(node) => {
          element = node;
        }}
        className="rounded-none"
      >
        <ComboboxItem value="apple" className="font-bold">
          사과
        </ComboboxItem>
      </Combobox>,
    );
    expect(element).toBeInstanceOf(HTMLInputElement);
    expect(element!).toHaveAttribute("role", "combobox");
    expect(element!).toHaveAttribute("placeholder", "과일 이름");
    expect(getComputedStyle(element!).borderTopLeftRadius).toBe("0px");
  });

  test("타입: 지원하지 않는 size·value가 없는 옵션·onChange는 오류다", () => {
    // @ts-expect-error xs는 입력하기에 작아서 받지 않는다.
    void (<Combobox size="xs" aria-label="x" />);
    // @ts-expect-error ComboboxItem은 value가 필요하다.
    void (<ComboboxItem>사과</ComboboxItem>);
    // @ts-expect-error 값 변경은 onValueChange다.
    void (<Combobox onChange={() => undefined} aria-label="x" />);
  });
});
