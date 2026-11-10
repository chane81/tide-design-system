// Radio·RadioGroup의 모양과 동작을 실제 Chromium에서 확인한다(tide-v0-impl 티켓 16).
// 화살표 이동과 하나만 선택되는 동작은 네이티브 라디오가 맡으므로, 같은 name이 넘어가는지와 실제 키 동작을 단언한다.
import { colorFamilyCss, defineColorFamily } from "@tide-tds/foundation/color-family";
import { useState, type ReactElement } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { commands, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { Field } from "./Field.tsx";
import { Radio, type RadioProps } from "./Radio.tsx";
import { RadioGroup } from "./RadioGroup.tsx";

// 앱 Role(brand)을 Role 타입에 더한다(앱의 augmentation과 같다. 티켓 41, ADR 0016).
declare module "@tide-tds/foundation" {
  interface RoleRegistry {
    brand: true;
  }
}

const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;
const transparent = "rgba(0, 0, 0, 0)";

function resolve(value: string): string {
  const probe = document.createElement("div");
  probe.dataset["theme"] = "light";
  probe.style.color = value;
  document.body.append(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved;
}

/** 마우스를 Component 밖으로 옮기고 transition-colors(fast 150ms)가 끝난 뒤 계산값을 읽는다(hover 색 배제). */
async function settle(): Promise<void> {
  const away = document.createElement("div");
  away.style.cssText = "position:fixed;right:0;bottom:0;width:8px;height:8px";
  document.body.append(away);
  await userEvent.hover(away);
  away.remove();
  await new Promise((done) => setTimeout(done, 250));
}

const dot = (input: Element): SVGElement =>
  input.parentElement!.querySelector('[data-mark="dot"]')!;
const visible = (element: Element): boolean => getComputedStyle(element).display !== "none";

function Shipping(props: { readonly onValueChange?: (value: string) => void }): ReactElement {
  return (
    <RadioGroup aria-label="배송" defaultValue="normal" onValueChange={props.onValueChange}>
      <Radio value="normal">일반</Radio>
      <Radio value="fast">빠른</Radio>
      <Radio value="pickup">방문 수령</Radio>
    </RadioGroup>
  );
}

describe("역할과 이름", () => {
  test("radiogroup 안에 radio가 있고, children이 이름이 되며 점 아이콘은 숨는다", async () => {
    await render(<Shipping />);
    await expect.element(page.getByRole("radiogroup", { name: "배송" })).toBeInTheDocument();
    const normal = page.getByRole("radio", { name: "일반" });
    await expect.element(normal).toBeChecked();
    expect(dot(normal.element())).toHaveAttribute("aria-hidden", "true");
  });

  test("묶음 안의 Radio는 같은 name을 자동으로 나눠 쓴다", async () => {
    await render(<Shipping />);
    const names = page
      .getByRole("radio")
      .elements()
      .map((radio) => (radio as HTMLInputElement).name);
    expect(names[0]).not.toBe("");
    expect(new Set(names).size).toBe(1);
  });
});

describe("선택", () => {
  test("화살표 키로 다음 항목으로 옮기며 선택하고(네이티브), onValueChange가 값 하나로 불린다", async () => {
    const onValueChange = vi.fn();
    await render(<Shipping onValueChange={onValueChange} />);
    await userEvent.tab();
    await expect.element(page.getByRole("radio", { name: "일반" })).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}");
    const fast = page.getByRole("radio", { name: "빠른" });
    await expect.element(fast).toHaveFocus();
    await expect.element(fast).toBeChecked();
    await expect.element(page.getByRole("radio", { name: "일반" })).not.toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith("fast");

    await userEvent.keyboard("{ArrowUp}");
    await expect.element(page.getByRole("radio", { name: "일반" })).toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith("normal");
  });

  test("Tab은 묶음 하나에 한 번만 멈춘다", async () => {
    await render(
      <>
        <Shipping />
        <button type="button">다음</button>
      </>,
    );
    await userEvent.tab();
    await userEvent.tab();
    await expect.element(page.getByRole("button", { name: "다음" })).toHaveFocus();
  });

  test("선택 전이면 Space로 포커스된 항목을 고른다", async () => {
    await render(
      <RadioGroup aria-label="크기">
        <Radio value="s">작게</Radio>
        <Radio value="l">크게</Radio>
      </RadioGroup>,
    );
    await userEvent.tab();
    await userEvent.keyboard(" ");
    await expect.element(page.getByRole("radio", { name: "작게" })).toBeChecked();
  });

  test("제어: value와 onValueChange로 앱이 값을 정한다", async () => {
    function Controlled(): ReactElement {
      const [value, setValue] = useState("a");
      return (
        <>
          <RadioGroup aria-label="옵션" value={value} onValueChange={setValue}>
            <Radio value="a">가</Radio>
            <Radio value="b">나</Radio>
          </RadioGroup>
          <output>{`선택 ${value}`}</output>
        </>
      );
    }
    await render(<Controlled />);
    await userEvent.click(page.getByText("나"));
    await expect.element(page.getByText("선택 b")).toBeInTheDocument();
    await expect.element(page.getByRole("radio", { name: "나" })).toBeChecked();
    await expect.element(page.getByRole("radio", { name: "가" })).not.toBeChecked();
  });

  test("묶음 밖에서는 name·defaultChecked를 직접 준다", async () => {
    await render(
      <>
        <Radio name="plan" value="free" defaultChecked>
          무료
        </Radio>
        <Radio name="plan" value="pro">
          유료
        </Radio>
      </>,
    );
    await userEvent.click(page.getByText("유료"));
    await expect.element(page.getByRole("radio", { name: "유료" })).toBeChecked();
    await expect.element(page.getByRole("radio", { name: "무료" })).not.toBeChecked();
  });

  test("선택한 값이 form에 name=value로 제출된다", async () => {
    const submitted: FormData[] = [];
    await render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitted.push(new FormData(event.currentTarget));
        }}
      >
        <RadioGroup aria-label="배송" name="shipping" defaultValue="fast">
          <Radio value="normal">일반</Radio>
          <Radio value="fast">빠른</Radio>
        </RadioGroup>
        <button type="submit">보내기</button>
      </form>,
    );
    await userEvent.click(page.getByRole("button", { name: "보내기" }));
    expect(submitted[0]!.get("shipping")).toBe("fast");
  });

  test("점은 선택했을 때만 보인다", async () => {
    await render(<Shipping />);
    expect(visible(dot(page.getByRole("radio", { name: "일반" }).element()))).toBe(true);
    expect(visible(dot(page.getByRole("radio", { name: "빠른" }).element()))).toBe(false);
  });
});

describe("Field와 묶음", () => {
  test("Field group 안에서 label이 묶음 이름, 설명·오류가 묶음 설명이 되고, aria-invalid는 각 Radio에 붙는다", async () => {
    await render(
      <Field label="배송 방법" description="주문마다 고릅니다." error="배송 방법을 고르세요." group>
        <RadioGroup>
          <Radio value="normal">일반</Radio>
          <Radio value="fast">빠른</Radio>
        </RadioGroup>
      </Field>,
    );
    const group = page.getByRole("radiogroup", { name: "배송 방법" });
    await expect
      .element(group)
      .toHaveAccessibleDescription("주문마다 고릅니다. 배송 방법을 고르세요.");
    expect(group.element()).toHaveAttribute("data-invalid", "");
    expect(group.element()).not.toHaveAttribute("aria-invalid");
    for (const name of ["일반", "빠른"]) {
      await expect
        .element(page.getByRole("radio", { name }))
        .toHaveAttribute("aria-invalid", "true");
    }
  });

  test("required면 각 Radio에 네이티브 required가, 묶음에 aria-required가 붙고, 고르지 않으면 제출이 막힌다", async () => {
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    await render(
      <form onSubmit={(event) => onSubmit(event.nativeEvent as SubmitEvent)}>
        <Field label="결제" group required>
          <RadioGroup>
            <Radio value="card">카드</Radio>
            <Radio value="bank">계좌</Radio>
          </RadioGroup>
        </Field>
        <button type="submit">결제하기</button>
      </form>,
    );
    await expect.element(page.getByRole("radio", { name: "카드" })).toBeRequired();
    expect(page.getByRole("radiogroup").element()).toHaveAttribute("aria-required", "true");
    await userEvent.click(page.getByRole("button", { name: "결제하기" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("disabled면 모든 Radio가 비활성이고 커서는 not-allowed다", async () => {
    await render(
      <Field label="배송" group disabled>
        <RadioGroup>
          <Radio value="a">가</Radio>
          <Radio value="b">나</Radio>
        </RadioGroup>
      </Field>,
    );
    for (const name of ["가", "나"]) {
      const radio = page.getByRole("radio", { name });
      await expect.element(radio).toBeDisabled();
      expect(getComputedStyle(radio.element()).cursor).toBe("not-allowed");
    }
    page.getByText("가").element().closest("label")!.click();
    await expect.element(page.getByRole("radio", { name: "가" })).not.toBeChecked();
  });

  test("Radio에 직접 준 disabled가 묶음 값을 이긴다", async () => {
    await render(
      <RadioGroup aria-label="옵션">
        <Radio value="a">가</Radio>
        <Radio value="b" disabled>
          나
        </Radio>
      </RadioGroup>,
    );
    await expect.element(page.getByRole("radio", { name: "가" })).not.toBeDisabled();
    await expect.element(page.getByRole("radio", { name: "나" })).toBeDisabled();
  });
});

describe("모양", () => {
  test.each([
    ["sm", 16, "14px"],
    ["md", 20, "16px"],
  ] as const)("%s: 원 %ipx, 글자 %s이고 조작 영역은 24×24px이다", async (size, box, font) => {
    await render(
      <Radio value="a" size={size} defaultChecked>
        가
      </Radio>,
    );
    const input = page.getByRole("radio").element();
    expect(input.getBoundingClientRect().width).toBe(box);
    expect(input.parentElement!.getBoundingClientRect().width).toBe(24);
    expect(input.parentElement!.getBoundingClientRect().height).toBe(24);
    expect(getComputedStyle(input.closest("label")!).fontSize).toBe(font);
    expect(getComputedStyle(input).borderTopLeftRadius).toBe("9999px");
  });

  test("value는 필수이고, 지원하지 않는 size·color는 타입 오류다", () => {
    // @ts-expect-error value가 없다.
    const missing: RadioProps = {};
    // @ts-expect-error lg는 Radio size가 아니다.
    const large: RadioProps = { value: "a", size: "lg" };
    // @ts-expect-error 색 계열 이름은 장식·분류 Component용이라 Radio는 받지 않는다(ADR 0016).
    const blue: RadioProps = { value: "a", color: "blue" };
    // augmentation한 앱 Role은 타입을 통과한다.
    const brand: RadioProps = { value: "a", color: "brand" };
    expect([missing, large, blue, brand]).toHaveLength(4);
  });

  test("선택하면 accent solid 배경·경계와 on-solid 점이 된다", async () => {
    await render(
      <div data-theme="light">
        <Radio value="a" color="success" defaultChecked>
          가
        </Radio>
      </div>,
    );
    const input = page.getByRole("radio").element();
    expect(input.closest("label")).toHaveAttribute("data-color", "success");
    if (forcedColors()) return;
    await settle();
    expect(getComputedStyle(input).backgroundColor).toBe(resolve("var(--tide-bg-success-solid)"));
    expect(getComputedStyle(input).borderTopColor).toBe(resolve("var(--tide-border-success)"));
    expect(getComputedStyle(dot(input)).color).toBe(resolve("var(--tide-text-on-solid)"));
  });

  describe("앱 Role", () => {
    // 앱이 RoleRegistry에 brand를 더하고, tide-color로 만든 CSS를 Tide CSS 뒤에 불러오는 것과 같은 순서로 넣는다.
    const brand = defineColorFamily({
      name: "brand",
      scale: {
        50: "#f5f3ff",
        100: "#ede9fe",
        200: "#ddd6fe",
        300: "#c4b5fd",
        400: "#a78bfa",
        500: "#8b5cf6",
        600: "#7c3aed",
        700: "#6d28d9",
        800: "#5b21b6",
        900: "#4c1d95",
        950: "#2e1065",
      },
    });
    let style: HTMLStyleElement | undefined;
    afterEach(() => style?.remove());

    test('color="brand"로 앱 Role을 쓰고, Radio 코드는 그대로다', async () => {
      style = document.createElement("style");
      style.textContent = colorFamilyCss([brand]);
      document.head.append(style);

      await render(
        <div data-theme="light">
          <Radio value="a" color="brand" defaultChecked>
            브랜드
          </Radio>
        </div>,
      );
      const input = page.getByRole("radio").element();
      expect(input.closest("label")).toHaveAttribute("data-color", "brand");
      if (forcedColors()) return;
      await settle();
      expect(getComputedStyle(input).backgroundColor).toBe(resolve("#7c3aed"));
      expect(getComputedStyle(input).borderTopColor).toBe(resolve("#7c3aed"));
    });
  });

  test("label 글자에 올리면 선택됨은 solid-hover, 선택 전은 subtle 배경이 된다", async () => {
    await render(
      <div data-theme="light">
        <Shipping />
      </div>,
    );
    if (forcedColors()) return;
    const wait = (): Promise<void> => new Promise((done) => setTimeout(done, 250));
    await userEvent.hover(page.getByText("일반"));
    await wait();
    expect(
      getComputedStyle(page.getByRole("radio", { name: "일반" }).element()).backgroundColor,
    ).toBe(resolve("var(--tide-bg-primary-solid-hover)"));
    await userEvent.hover(page.getByText("빠른"));
    await wait();
    expect(
      getComputedStyle(page.getByRole("radio", { name: "빠른" }).element()).backgroundColor,
    ).toBe(resolve("var(--tide-bg-primary-subtle)"));
  });

  test("누르면 hover보다 한 단계 진한 -active 배경이다(선택됨 solid-active, 선택 전 subtle-active)", async () => {
    await render(
      <div data-theme="light">
        <RadioGroup aria-label="배송" defaultValue="normal">
          <Radio value="normal">
            <span data-testid="normal">일반</span>
          </Radio>
          <Radio value="fast">
            <span data-testid="fast">빠른</span>
          </Radio>
        </RadioGroup>
      </div>,
    );
    const wait = (): Promise<void> => new Promise((done) => setTimeout(done, 250));
    // 값은 누르는 동안(떼어서 선택이 바뀌기 전) 읽는다.
    const pressed = async (testId: string, name: string): Promise<string> => {
      await commands.mouseDownOn(testId);
      await wait();
      const value = getComputedStyle(page.getByRole("radio", { name }).element()).backgroundColor;
      await commands.mouseUp();
      return value;
    };
    const checked = await pressed("normal", "일반");
    // 일반을 눌렀다 떼도 선택은 일반 그대로라 빠른은 선택 전이다.
    const unchecked = await pressed("fast", "빠른");
    if (forcedColors()) {
      expect([checked, unchecked]).toEqual([resolve("Highlight"), resolve("Canvas")]);
      return;
    }
    expect(checked).toBe(resolve("var(--tide-bg-primary-solid-active)"));
    expect(unchecked).toBe(resolve("var(--tide-bg-primary-subtle-active)"));
  });

  test("키보드 포커스에 focus-ring이 보인다", async () => {
    await render(<Shipping />);
    await userEvent.tab();
    await settle();
    const style = getComputedStyle(page.getByRole("radio", { name: "일반" }).element());
    expect(style.outlineStyle).toBe("solid");
    expect(style.outlineWidth).toBe("2px");
    expect(style.outlineOffset).toBe("2px");
    expect(style.outlineColor).not.toBe(transparent);
  });

  test("forced-colors에서도 선택 점이 원 배경과 다른 색으로 보인다", async () => {
    await render(<Shipping />);
    await settle();
    const input = page.getByRole("radio", { name: "일반" }).element();
    expect(visible(dot(input))).toBe(true);
    expect(getComputedStyle(dot(input)).color).not.toBe(getComputedStyle(input).backgroundColor);
    expect(getComputedStyle(input).borderTopColor).not.toBe(transparent);
    if (forcedColors()) {
      expect(getComputedStyle(input).backgroundColor).toBe(resolve("Highlight"));
      expect(getComputedStyle(dot(input)).color).toBe(resolve("HighlightText"));
    }
  });

  test("ref는 input에, className은 루트 label에 간다", async () => {
    let element: HTMLInputElement | null = null;
    await render(
      <Radio value="a" ref={(node) => void (element = node)} className="gap-4">
        가
      </Radio>,
    );
    const input = page.getByRole("radio").element();
    expect(element).toBe(input);
    expect(getComputedStyle(input.closest("label")!).columnGap).toBe("16px");
  });
});
