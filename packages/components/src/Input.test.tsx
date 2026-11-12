// Input·Textarea의 모양과 동작을 실제 Chromium에서 확인한다(tide-v0-impl 티켓 15).
// 두 instance에서 모두 돈다. 두 번째 instance(forced-colors·reduced-motion)에서는
// border 색과 box-shadow가 시스템 색으로 덮이므로, 투명 outline이 보여 포커스 표시가 남는지를 계산값으로 단언한다.
import { useState, type ReactElement } from "react";
import { describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { Button } from "./Button.tsx";
import { Field } from "./Field.tsx";
import { Input, type InputProps } from "./Input.tsx";
import { Textarea, type TextareaProps } from "./Textarea.tsx";

const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;
const transparent = "rgba(0, 0, 0, 0)";

/** CSS 값 하나를 실제로 계산한 결과. Token 변수를 계산값과 비교할 때 쓴다. */
function resolve(value: string): string {
  const probe = document.createElement("div");
  probe.dataset["theme"] = "light";
  probe.style.borderColor = value;
  document.body.append(probe);
  const resolved = getComputedStyle(probe).borderTopColor;
  probe.remove();
  return resolved;
}

/** transition-colors(fast 150ms)가 끝난 뒤 계산값을 읽는다. */
const settle = (): Promise<void> => new Promise((done) => setTimeout(done, 250));

describe("size", () => {
  const sizes: [NonNullable<InputProps["size"]>, number, string][] = [
    // size, 높이, 텍스트 스타일
    ["sm", 32, "label-md"],
    ["md", 40, "label-md"],
    ["lg", 48, "label-lg"],
  ];

  test.each(sizes)(
    "%s는 높이 %ipx로 같은 size의 Button과 같고, %s 크기·행간에 보통 굵기, radius md(6px)다",
    async (size, height, textStyle) => {
      await render(
        <div className="flex items-center gap-2">
          <Input size={size} aria-label="검색" />
          <Input size={size} type="date" aria-label="날짜" />
          <Button size={size}>검색</Button>
          <span data-testid="text" className={`text-${textStyle}`}>
            글자
          </span>
        </div>,
      );
      const input = page.getByRole("textbox", { name: "검색" }).element();
      const date = page.getByLabelText("날짜").element();
      const button = page.getByRole("button").element();
      const style = getComputedStyle(input);
      const text = getComputedStyle(page.getByTestId("text").element());

      expect(input.getBoundingClientRect().height).toBe(height);
      expect(date.getBoundingClientRect().height).toBe(height);
      expect(button.getBoundingClientRect().height).toBe(height);
      expect(style.borderRadius).toBe("6px");
      expect(style.fontSize).toBe(text.fontSize);
      expect(style.lineHeight).toBe(text.lineHeight);
      expect(style.fontWeight).toBe("400");
    },
  );

  test("기본 size는 md(40px)다", async () => {
    await render(<Input aria-label="검색" />);
    expect(page.getByRole("textbox").element().getBoundingClientRect().height).toBe(40);
  });

  test("Textarea 글자 크기는 같은 size의 Input과 같고, 기본 3줄에 세로로만 크기를 바꾼다", async () => {
    await render(
      <div>
        {(["sm", "md", "lg"] as const).map((size) => (
          <div key={size}>
            <Input size={size} aria-label={`input-${size}`} />
            <Textarea size={size} aria-label={`textarea-${size}`} />
          </div>
        ))}
      </div>,
    );
    for (const size of ["sm", "md", "lg"] as const) {
      const input = getComputedStyle(
        page.getByRole("textbox", { name: `input-${size}` }).element(),
      );
      const textarea = page.getByRole("textbox", { name: `textarea-${size}` }).element();
      const style = getComputedStyle(textarea);
      expect(style.fontSize).toBe(input.fontSize);
      expect(style.fontWeight).toBe("400");
      expect(style.borderRadius).toBe("6px");
      expect(style.resize).toBe("vertical");
      expect(textarea).toHaveAttribute("rows", "3");
    }
  });

  test("지원하지 않는 size는 타입 오류다", () => {
    // @ts-expect-error Input은 xs를 받지 않는다.
    const input: InputProps = { size: "xs" };
    // @ts-expect-error Textarea는 xs를 받지 않는다.
    const textarea: TextareaProps = { size: "xs" };
    expect([input, textarea]).toHaveLength(2);
  });
});

describe("입력", () => {
  test("비제어: defaultValue에서 시작해 입력하면 바뀌고 onChange가 불린다", async () => {
    const onChange = vi.fn();
    await render(<Input aria-label="이름" defaultValue="타" onChange={onChange} />);
    const input = page.getByRole("textbox", { name: "이름" });
    await expect.element(input).toHaveValue("타");
    await userEvent.fill(input, "타이드");
    await expect.element(input).toHaveValue("타이드");
    expect(onChange).toHaveBeenCalled();
  });

  test("제어: value와 onChange로 값을 앱이 정한다", async () => {
    function Upper(): ReactElement {
      const [value, setValue] = useState("");
      return (
        <div>
          <Textarea
            aria-label="메모"
            value={value}
            onChange={(event) => setValue(event.target.value.toUpperCase())}
          />
          <output>{value.length}</output>
        </div>
      );
    }
    await render(<Upper />);
    const textarea = page.getByRole("textbox", { name: "메모" });
    await userEvent.fill(textarea, "tide");
    await expect.element(textarea).toHaveValue("TIDE");
    await expect.element(page.getByRole("status")).toHaveTextContent("4");
  });

  test("readOnly면 포커스는 받지만 입력해도 값이 바뀌지 않는다", async () => {
    await render(<Input aria-label="코드" readOnly defaultValue="TIDE-1" />);
    const input = page.getByRole("textbox", { name: "코드" });
    await userEvent.click(input);
    await expect.element(input).toHaveFocus();
    await userEvent.keyboard("abc");
    await expect.element(input).toHaveValue("TIDE-1");
  });

  test("disabled면 포커스를 받지 않고 cursor가 not-allowed다", async () => {
    await render(
      <div>
        <Input aria-label="이름" disabled />
        <Textarea aria-label="메모" disabled />
      </div>,
    );
    for (const name of ["이름", "메모"]) {
      const element = page.getByRole("textbox", { name });
      await expect.element(element).toBeDisabled();
      expect(getComputedStyle(element.element()).cursor).toBe("not-allowed");
    }
    await userEvent.tab();
    expect(document.activeElement).toBe(document.body);
  });

  test("Field 밖에서 invalid를 주면 aria-invalid와 data-invalid가 붙는다", async () => {
    await render(
      <div>
        <Input aria-label="이름" invalid />
        <Textarea aria-label="메모" invalid />
      </div>,
    );
    for (const name of ["이름", "메모"]) {
      const element = page.getByRole("textbox", { name }).element();
      expect(element).toHaveAttribute("aria-invalid", "true");
      expect(element).toHaveAttribute("data-invalid", "");
    }
  });

  test("ref는 네이티브 요소에 연결되고, className은 기본 class를 이긴다", async () => {
    let input: HTMLInputElement | null = null;
    let textarea: HTMLTextAreaElement | null = null;
    await render(
      <div>
        <Input
          aria-label="이름"
          ref={(node) => {
            input = node;
          }}
          className="px-8"
        />
        <Textarea
          aria-label="메모"
          ref={(node) => {
            textarea = node;
          }}
          className="resize-none"
        />
      </div>,
    );
    expect(input).toBeInstanceOf(HTMLInputElement);
    expect(textarea).toBeInstanceOf(HTMLTextAreaElement);
    expect(getComputedStyle(input!).paddingLeft).toBe("32px");
    expect(getComputedStyle(textarea!).resize).toBe("none");
  });
});

describe("포커스 표시", () => {
  test("클릭으로 포커스해도 focus-field(border focus 색, inset 1px)가 보이고, 투명 outline은 forced-colors에서만 있다", async () => {
    await render(
      <div data-theme="light">
        <Input aria-label="이름" />
      </div>,
    );
    const input = page.getByRole("textbox", { name: "이름" });
    if (!forcedColors()) {
      expect(getComputedStyle(input.element()).borderTopColor).toBe(
        resolve("var(--tide-border-strong)"),
      );
    }
    await userEvent.click(input);
    await settle();
    const style = getComputedStyle(input.element());

    expect(style.borderTopWidth).toBe("1px");
    if (forcedColors()) {
      // border 색과 box-shadow는 시스템 색으로 덮이고, 투명 outline이 시스템 색으로 그려져 포커스 표시가 남는다.
      expect(style.boxShadow).toBe("none");
      expect(style.outlineStyle).toBe("solid");
      expect(style.outlineWidth).toBe("2px");
      expect(style.outlineColor).not.toBe(transparent);
    } else {
      const focus = resolve("var(--tide-outline-focus)");
      expect(style.borderTopColor).toBe(focus);
      expect(style.boxShadow).toBe(`${focus} 0px 0px 0px 1px inset`);
      // 평소에는 outline이 없다. 투명 outline은 forced-colors에서만 둔다.
      expect(style.outlineStyle).toBe("none");
    }
  });

  test("클릭 직후에도 outline이 번쩍이지 않는다", async () => {
    // 평소 투명 outline을 두면 transition-colors가 outline-color를 글자색에서 투명으로 150ms 동안 전환해,
    // 클릭 직후 글자색 outline이 잠깐 보였다(회귀 방지).
    await render(
      <div data-theme="light">
        <Input aria-label="이름" />
        <Textarea aria-label="메모" />
      </div>,
    );
    for (const name of ["이름", "메모"]) {
      const field = page.getByRole("textbox", { name });
      await userEvent.click(field);
      const style = getComputedStyle(field.element());
      if (forcedColors()) {
        expect(style.outlineStyle).toBe("solid");
      } else {
        expect(style.outlineStyle).toBe("none");
      }
    }
  });

  test("Textarea도 키보드 포커스에 focus-field가 보인다", async () => {
    await render(
      <div data-theme="light">
        <Textarea aria-label="메모" />
      </div>,
    );
    await userEvent.tab();
    const textarea = page.getByRole("textbox", { name: "메모" });
    await expect.element(textarea).toHaveFocus();
    await settle();
    const style = getComputedStyle(textarea.element());
    if (forcedColors()) {
      expect(style.outlineWidth).toBe("2px");
      expect(style.outlineColor).not.toBe(transparent);
    } else {
      expect(style.outlineStyle).toBe("none");
      expect(style.boxShadow).toBe(`${resolve("var(--tide-outline-focus)")} 0px 0px 0px 1px inset`);
    }
  });

  test("오류 상태에서도 포커스 중에는 focus-field가 이기고, 오류 메시지는 계속 보인다", async () => {
    await render(
      <div data-theme="light">
        <Field label="이메일" error="이메일 형식이 아닙니다.">
          <Input />
        </Field>
        <button type="button">다음</button>
      </div>,
    );
    const input = page.getByRole("textbox", { name: "이메일" });
    const message = page.getByText("이메일 형식이 아닙니다.");
    const danger = resolve("var(--tide-border-danger)");
    const focus = resolve("var(--tide-outline-focus)");

    if (!forcedColors()) expect(getComputedStyle(input.element()).borderTopColor).toBe(danger);
    await expect.element(message).toBeVisible();

    await userEvent.click(input);
    await settle();
    const focused = getComputedStyle(input.element());
    await expect.element(message).toBeVisible();
    await expect.element(input).toHaveAttribute("aria-invalid", "true");
    if (forcedColors()) {
      expect(focused.boxShadow).toBe("none");
      expect(focused.outlineColor).not.toBe(transparent);
    } else {
      // 빨강 border 안쪽에 파랑 inset이 겹쳐 두 줄로 보이지 않는다.
      expect(focused.borderTopColor).toBe(focus);
      expect(focused.borderLeftColor).toBe(focus);
      expect(focused.boxShadow).toBe(`${focus} 0px 0px 0px 1px inset`);
      expect(focused.outlineStyle).toBe("none");
    }

    await userEvent.click(page.getByRole("button", { name: "다음" }));
    await settle();
    if (!forcedColors()) {
      const blurred = getComputedStyle(input.element());
      expect(blurred.borderTopColor).toBe(danger);
      expect(blurred.boxShadow).toBe("none");
    }
  });

  test("경계 색은 transition-colors(fast 150ms)로 바뀐다", async () => {
    await render(<Input aria-label="이름" />);
    const style = getComputedStyle(page.getByRole("textbox").element());
    expect(style.transitionProperty).toContain("border-color");
    expect(style.transitionDuration.split(",")[0]).toBe("0.15s");
  });
});

describe("forced-colors", () => {
  test("경계가 보인다", async () => {
    await render(<Input aria-label="이름" />);
    const style = getComputedStyle(page.getByRole("textbox").element());
    expect(style.borderTopWidth).toBe("1px");
    expect(style.borderTopStyle).toBe("solid");
    expect(style.borderTopColor).not.toBe(transparent);
  });
});
