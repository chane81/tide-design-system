// 두 번째 instance(forced-colors·reduced-motion)에서도 돈다.
import { duration, easing } from "@tide-design/foundation";
import { colorFamilyCss, defineColorFamily } from "@tide-design/foundation/color-family";
import { useState, type ReactElement } from "react";
import { afterEach, describe, expect, onTestFinished, test, vi } from "vitest";
import { commands, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { expectFocusHalo, focusBorderColor } from "../../test/focus";
import { afterChange, transitions } from "../../test/motion";

import { Checkbox, type CheckboxProps } from "./Checkbox";
import { CheckboxGroup } from "../CheckboxGroup/CheckboxGroup";
import { Field } from "../Field/Field";

// 앱 Role(brand)을 Role 타입에 더한다(ADR 0016).
declare module "@tide-design/foundation" {
  interface RoleRegistry {
    brand: true;
  }
}

const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;
const reducedMotion = (): boolean => matchMedia("(prefers-reduced-motion: reduce)").matches;
const ms = (name: keyof typeof duration): number => Number.parseFloat(duration[name]);
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

/** hover 색을 빼려고 마우스를 밖으로 옮기고 전환(fast 150ms)이 끝난 뒤 읽는다. */
async function settle(): Promise<void> {
  const away = document.createElement("div");
  away.style.cssText = "position:fixed;right:0;bottom:0;width:8px;height:8px";
  document.body.append(away);
  await userEvent.hover(away);
  away.remove();
  await new Promise((done) => setTimeout(done, 250));
}

const mark = (input: Element, kind: "check" | "indeterminate"): SVGElement =>
  input.parentElement!.querySelector(`[data-mark="${kind}"]`)!;

/** background-color는 hover 색 전환이라 선택 움직임에서 뺀다. */
const moving = (found: Map<string, unknown>): string[] =>
  [...found.keys()].filter((key) => key !== "background-color").sort();

const fillLayer = (input: Element): HTMLElement =>
  input.parentElement!.querySelector("[data-fill]")!;

/** 사용자에게 보이는 상자 바탕. 채움 레이어가 보이면 그 색, 아니면 input 바탕이다. */
function fill(input: Element): string {
  const layer = fillLayer(input);
  for (const animation of layer.getAnimations()) animation.finish();
  const style = getComputedStyle(layer);

  return style.display !== "none" && style.opacity === "1"
    ? style.backgroundColor
    : getComputedStyle(input).backgroundColor;
}

/** 표시는 opacity로 숨는다. 도는 전환을 끝낸 뒤 읽는다. */
function visible(element: Element): boolean {
  for (const animation of element.getAnimations()) animation.finish();

  return getComputedStyle(element).opacity !== "0";
}

describe("역할과 이름", () => {
  test("children이 체크박스의 이름이 되고, 아이콘은 보조 기술에서 숨는다", async () => {
    await render(<Checkbox>약관에 동의합니다</Checkbox>);
    const checkbox = page.getByRole("checkbox", { name: "약관에 동의합니다" });
    await expect.element(checkbox).toBeInTheDocument();
    await expect.element(checkbox).not.toBeChecked();
    expect(mark(checkbox.element(), "check")).toHaveAttribute("aria-hidden", "true");
    expect(mark(checkbox.element(), "indeterminate")).toHaveAttribute("aria-hidden", "true");
  });

  test("글자 없이 aria-label로 이름을 붙인다", async () => {
    await render(<Checkbox aria-label="행 선택" />);
    await expect.element(page.getByRole("checkbox", { name: "행 선택" })).toBeInTheDocument();
  });
});

describe("체크", () => {
  test("label을 누르거나 Space를 누르면 바뀌고 onChange가 불린다", async () => {
    const onChange = vi.fn();
    await render(<Checkbox onChange={onChange}>알림 받기</Checkbox>);
    const checkbox = page.getByRole("checkbox", { name: "알림 받기" });

    await userEvent.tab();
    await expect.element(checkbox).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect.element(checkbox).toBeChecked();

    await userEvent.click(page.getByText("알림 받기"));
    await expect.element(checkbox).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  test("체크 아이콘은 체크했을 때만 보인다", async () => {
    await render(<Checkbox defaultChecked>알림</Checkbox>);
    const input = page.getByRole("checkbox").element();
    expect(visible(mark(input, "check"))).toBe(true);
    expect(visible(mark(input, "indeterminate"))).toBe(false);
    await userEvent.click(page.getByRole("checkbox"));
    expect(visible(mark(input, "check"))).toBe(false);
  });

  test("제어: checked와 onChange로 앱이 값을 정한다", async () => {
    function Controlled(): ReactElement {
      const [checked, setChecked] = useState(false);

      return (
        <>
          <Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)}>
            알림
          </Checkbox>
          <output>{checked ? "켬" : "끔"}</output>
        </>
      );
    }
    await render(<Controlled />);
    await userEvent.click(page.getByRole("checkbox"));
    await expect.element(page.getByText("켬")).toBeInTheDocument();
    await expect.element(page.getByRole("checkbox")).toBeChecked();
  });

  test("체크하면 form에 name=value로 제출된다", async () => {
    const submitted: FormData[] = [];
    await render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitted.push(new FormData(event.currentTarget));
        }}
      >
        <Checkbox name="agree" value="yes" defaultChecked>
          동의
        </Checkbox>
        <Checkbox name="ad" value="yes">
          광고 수신
        </Checkbox>
        <button type="submit">보내기</button>
      </form>,
    );
    await userEvent.click(page.getByRole("button", { name: "보내기" }));
    expect(submitted[0]!.get("agree")).toBe("yes");
    expect(submitted[0]!.has("ad")).toBe(false);
  });
});

describe("indeterminate", () => {
  test("일부 선택 상태로 읽히고, 체크 대신 가로줄이 보인다", async () => {
    await render(
      <Checkbox indeterminate defaultChecked>
        전체 선택
      </Checkbox>,
    );
    const checkbox = page.getByRole("checkbox", { name: "전체 선택" });
    await expect.element(checkbox).toBePartiallyChecked();
    expect(visible(mark(checkbox.element(), "indeterminate"))).toBe(true);
    expect(visible(mark(checkbox.element(), "check"))).toBe(false);
  });

  test("전체 선택: 누르면 브라우저가 지운 상태를 앱이 다시 계산한 값으로 맞춘다", async () => {
    function SelectAll(): ReactElement {
      const [items, setItems] = useState([true, false]);
      const all = items.every(Boolean);
      const some = items.some(Boolean);

      return (
        <>
          <Checkbox
            checked={all}
            indeterminate={some && !all}
            onChange={(event) => setItems(items.map(() => event.target.checked))}
          >
            전체
          </Checkbox>
          {items.map((checked, index) => (
            <Checkbox
              key={index}
              checked={checked}
              onChange={(event) =>
                setItems(items.map((item, i) => (i === index ? event.target.checked : item)))
              }
            >
              {`항목 ${index + 1}`}
            </Checkbox>
          ))}
        </>
      );
    }
    await render(<SelectAll />);
    const all = page.getByRole("checkbox", { name: "전체" });
    await expect.element(all).toBePartiallyChecked();

    await userEvent.click(all);
    await expect.element(all).toBeChecked();
    await expect.element(all).not.toBePartiallyChecked();
    await expect.element(page.getByRole("checkbox", { name: "항목 2" })).toBeChecked();

    await userEvent.click(page.getByRole("checkbox", { name: "항목 1" }));
    await expect.element(all).toBePartiallyChecked();
  });
});

describe("disabled", () => {
  test("네이티브 disabled라 바뀌지 않고, 커서는 not-allowed다", async () => {
    await render(<Checkbox disabled>알림</Checkbox>);
    const checkbox = page.getByRole("checkbox", { name: "알림" });
    await expect.element(checkbox).toBeDisabled();
    // Playwright는 비활성 컨트롤의 label을 누르지 않으므로 DOM click으로 누른다.
    page.getByText("알림").element().closest("label")!.click();
    await expect.element(checkbox).not.toBeChecked();
    expect(getComputedStyle(checkbox.element()).cursor).toBe("not-allowed");
    expect(getComputedStyle(checkbox.element().closest("label")!).cursor).toBe("not-allowed");
  });

  test("활성 상태의 커서는 pointer다", async () => {
    await render(<Checkbox>알림</Checkbox>);
    const checkbox = page.getByRole("checkbox").element();
    expect(getComputedStyle(checkbox).cursor).toBe("pointer");
    expect(getComputedStyle(checkbox.closest("label")!).cursor).toBe("pointer");
  });
});

describe("크기", () => {
  test.each([
    ["sm", 16, "14px", 12],
    ["md", 20, "16px", 16],
  ] as const)(
    "%s: 상자 %ipx, 글자 %s, 아이콘 %ipx(선 2px)이고 조작 영역은 24×24px이다",
    async (size, box, font, icon) => {
      await render(
        <Checkbox size={size} defaultChecked>
          알림
        </Checkbox>,
      );
      const input = page.getByRole("checkbox").element();
      expect(input.getBoundingClientRect().width).toBe(box);
      expect(input.getBoundingClientRect().height).toBe(box);
      const area = input.parentElement!.getBoundingClientRect();
      expect(area.width).toBe(24);
      expect(area.height).toBe(24);
      expect(getComputedStyle(input.closest("label")!).fontSize).toBe(font);
      expect(mark(input, "check").getBoundingClientRect().width).toBe(icon);
      for (const kind of ["check", "indeterminate"] as const) {
        const width = Number.parseFloat(getComputedStyle(mark(input, kind)).strokeWidth);
        expect((width * icon) / 24, kind).toBe(2);
      }
      expect(getComputedStyle(input).borderTopLeftRadius).toBe("4px");
    },
  );

  test("글자 없이 써도 누르는 영역이 24×24px이고, 상자 밖 영역을 눌러도 바뀐다", async () => {
    await render(<Checkbox aria-label="행 선택" />);
    const checkbox = page.getByRole("checkbox");
    const label = checkbox.element().closest("label")!;
    expect(label.getBoundingClientRect().width).toBeGreaterThanOrEqual(24);
    expect(label.getBoundingClientRect().height).toBeGreaterThanOrEqual(24);
    // 조작 영역 왼쪽 위 모서리(상자 밖 2px 안쪽)를 누른다.
    await userEvent.click(checkbox.element().parentElement!, {
      position: { x: 1, y: 1 },
    });
    await expect.element(checkbox).toBeChecked();
  });

  test("지원하지 않는 size·color는 타입 오류다", () => {
    // @ts-expect-error lg는 Checkbox size가 아니다.
    const props: CheckboxProps = { size: "lg" };
    // @ts-expect-error 색 계열 이름은 받지 않는다(ADR 0016).
    const blue: CheckboxProps = { color: "blue" };
    const brand: CheckboxProps = { color: "brand" };
    expect([props, blue, brand]).toHaveLength(3);
  });
});

describe("색", () => {
  test("루트에 data-color(기본 primary)가 붙고, 체크하면 accent solid 배경과 accent 경계가 된다", async () => {
    await render(
      <div data-theme="light">
        <Checkbox defaultChecked>기본</Checkbox>
        <Checkbox color="danger" defaultChecked>
          위험
        </Checkbox>
      </div>,
    );
    const primary = page.getByRole("checkbox", { name: "기본" }).element();
    const danger = page.getByRole("checkbox", { name: "위험" }).element();
    expect(primary.closest("label")).toHaveAttribute("data-color", "primary");
    expect(danger.closest("label")).toHaveAttribute("data-color", "danger");
    if (forcedColors()) return; // 시스템 색으로 바뀌므로 Token 비교는 기본 instance에서만 한다.
    await settle();
    expect(fill(primary)).toBe(resolve("var(--tide-bg-primary-solid)"));
    expect(getComputedStyle(primary).borderTopColor).toBe(resolve("var(--tide-border-primary)"));
    expect(fill(danger)).toBe(resolve("var(--tide-bg-danger-solid)"));
    expect(getComputedStyle(mark(primary, "check")).color).toBe(
      resolve("var(--tide-text-on-solid)"),
    );
  });

  test("체크 전에는 canvas 배경과 border-strong 경계다", async () => {
    await render(
      <div data-theme="light">
        <Checkbox>알림</Checkbox>
      </div>,
    );
    if (forcedColors()) return;
    const style = getComputedStyle(page.getByRole("checkbox").element());
    expect(style.backgroundColor).toBe(resolve("var(--tide-bg-canvas)"));
    expect(style.borderTopColor).toBe(resolve("var(--tide-border-strong)"));
  });

  describe("앱 Role", () => {
    // 앱처럼 tide-color로 만든 CSS를 Tide CSS 뒤에 넣는다.
    const brand = defineColorFamily({
      name: "brand",
      scale: {
        50: "#fcf0f5",
        100: "#fee5f0",
        200: "#ebcbd9",
        300: "#e1adc4",
        400: "#dc7dac",
        500: "#c75b93",
        600: "#a85c81",
        700: "#90406a",
        800: "#793157",
        900: "#68274a",
        950: "#5c1d3f",
      },
    });
    let style: HTMLStyleElement | undefined;
    afterEach(() => style?.remove());

    test('color="brand"로 앱 Role을 쓰고, Checkbox 코드는 그대로다', async () => {
      style = document.createElement("style");
      style.textContent = colorFamilyCss([brand]);
      document.head.append(style);

      await render(
        <div data-theme="light">
          <Checkbox color="brand" defaultChecked>
            브랜드
          </Checkbox>
        </div>,
      );
      const input = page.getByRole("checkbox").element();
      expect(input.closest("label")).toHaveAttribute("data-color", "brand");
      if (forcedColors()) return;
      await settle();
      expect(fill(input)).toBe(resolve("#a85c81"));
      expect(getComputedStyle(input).borderTopColor).toBe(resolve("#a85c81"));
    });
  });
});

describe("hover", () => {
  const wait = (): Promise<void> => new Promise((done) => setTimeout(done, 250));

  test("label 글자에 올리면 체크됨은 solid-hover, 체크 전은 subtle 배경이 되고 경계는 그대로다", async () => {
    await render(
      <div data-theme="light" className="flex flex-col gap-4">
        <Checkbox defaultChecked>체크됨</Checkbox>
        <Checkbox>체크 전</Checkbox>
        <Checkbox indeterminate>일부</Checkbox>
      </div>,
    );
    if (forcedColors()) return;
    const box = (name: string): HTMLElement =>
      page.getByRole("checkbox", { name }).element() as HTMLElement;

    await userEvent.hover(page.getByText("체크됨"));
    await wait();
    expect(fill(box("체크됨"))).toBe(resolve("var(--tide-bg-primary-solid-hover)"));

    await userEvent.hover(page.getByText("체크 전"));
    await wait();
    expect(fill(box("체크 전"))).toBe(resolve("var(--tide-bg-primary-subtle)"));
    expect(getComputedStyle(box("체크 전")).borderTopColor).toBe(
      resolve("var(--tide-border-strong)"),
    );
    expect(fill(box("체크됨"))).toBe(resolve("var(--tide-bg-primary-solid)"));

    await userEvent.hover(page.getByText("일부"));
    await wait();
    expect(fill(box("일부"))).toBe(resolve("var(--tide-bg-primary-solid-hover)"));
  });

  test("누르면 hover보다 한 단계 진한 -active 배경이다(체크됨 solid-active, 체크 전 subtle-active)", async () => {
    await render(
      <div data-theme="light" className="flex flex-col gap-4">
        <Checkbox defaultChecked>
          <span data-testid="checked">체크됨</span>
        </Checkbox>
        <Checkbox>
          <span data-testid="unchecked">체크 전</span>
        </Checkbox>
        <Checkbox indeterminate>
          <span data-testid="indeterminate">일부</span>
        </Checkbox>
      </div>,
    );
    const pressed = async (testId: string, name: string): Promise<string> => {
      await commands.mouseDownOn(testId);
      await wait();
      const value = fill(page.getByRole("checkbox", { name }).element());
      await commands.mouseUp();

      return value;
    };
    const checked = await pressed("checked", "체크됨");
    const unchecked = await pressed("unchecked", "체크 전");
    const indeterminate = await pressed("indeterminate", "일부");
    // 떼면 토글되므로 누르는 동안 읽는다.
    if (forcedColors()) {
      expect([checked, unchecked, indeterminate]).toEqual([
        resolve("Highlight"),
        resolve("Canvas"),
        resolve("Highlight"),
      ]);

      return;
    }
    expect(checked).toBe(resolve("var(--tide-bg-primary-solid-active)"));
    expect(unchecked).toBe(resolve("var(--tide-bg-primary-subtle-active)"));
    expect(indeterminate).toBe(resolve("var(--tide-bg-primary-solid-active)"));
  });

  test("비활성은 hover에도 바뀌지 않는다", async () => {
    await render(
      <div data-theme="light">
        <Checkbox disabled defaultChecked>
          꺼짐
        </Checkbox>
      </div>,
    );
    const box = page.getByRole("checkbox").element();
    const before = fill(box);
    await userEvent.hover(page.getByText("꺼짐"));
    await wait();
    expect(fill(box)).toBe(before);
  });

  test("forced-colors에서 hover해도 체크 전 상자는 Canvas다", async () => {
    await render(<Checkbox>알림</Checkbox>);
    if (!forcedColors()) return;
    await userEvent.hover(page.getByText("알림"));
    await wait();
    expect(getComputedStyle(page.getByRole("checkbox").element()).backgroundColor).toBe(
      resolve("Canvas"),
    );
  });
});

describe("오류", () => {
  test("invalid면 aria-invalid와 data-invalid가 붙고, 체크해도 경계가 danger다", async () => {
    await render(
      <div data-theme="light">
        <Checkbox invalid defaultChecked>
          동의
        </Checkbox>
      </div>,
    );
    const checkbox = page.getByRole("checkbox");
    await expect.element(checkbox).toHaveAttribute("aria-invalid", "true");
    await expect.element(checkbox).toHaveAttribute("data-invalid", "");
    if (forcedColors()) return;
    await settle();
    expect(getComputedStyle(checkbox.element()).borderTopColor).toBe(
      resolve("var(--tide-border-danger)"),
    );
  });
});

describe("오류 채움(ADR 0035)", () => {
  const wait = (): Promise<void> => new Promise((done) => setTimeout(done, 250));
  const bg = (element: Element): string => fill(element);

  test("체크·indeterminate 오류 Checkbox는 Checkbox 색 대신 danger solid로 차고 표시는 흰색이다", async () => {
    await render(
      <div data-theme="light">
        <Checkbox invalid defaultChecked>
          체크
        </Checkbox>
        <Checkbox invalid indeterminate>
          일부
        </Checkbox>
      </div>,
    );
    await settle();
    const checked = page.getByRole("checkbox", { name: "체크" }).element();
    const partial = page.getByRole("checkbox", { name: "일부" }).element();
    if (forcedColors()) {
      expect([bg(checked), bg(partial)]).toEqual([resolve("Highlight"), resolve("Highlight")]);

      return;
    }
    for (const input of [checked, partial]) {
      expect(bg(input)).toBe(resolve("var(--tide-bg-danger-solid)"));
      expect(getComputedStyle(input).borderTopColor).toBe(resolve("var(--tide-border-danger)"));
    }
    expect(getComputedStyle(mark(checked, "check")).color).toBe(
      resolve("var(--tide-text-on-solid)"),
    );
    expect(getComputedStyle(mark(partial, "indeterminate")).color).toBe(
      resolve("var(--tide-text-on-solid)"),
    );
  });

  test("체크된 오류 Checkbox의 hover·누름은 danger solid-hover·solid-active다", async () => {
    await render(
      <div data-theme="light">
        <Checkbox invalid defaultChecked color="success">
          <span data-testid="label">체크</span>
        </Checkbox>
      </div>,
    );
    const input = page.getByRole("checkbox").element();
    await userEvent.hover(page.getByTestId("label"));
    await wait();
    const hovered = bg(input);
    await commands.mouseDownOn("label");
    await wait();
    const pressed = bg(input);
    await commands.mouseUp();
    if (forcedColors()) return;
    expect(hovered).toBe(resolve("var(--tide-bg-danger-solid-hover)"));
    expect(pressed).toBe(resolve("var(--tide-bg-danger-solid-active)"));
  });

  test("체크 전 오류 Checkbox는 테두리만 danger이고 hover 바탕은 danger subtle이다", async () => {
    await render(
      <div data-theme="light">
        <Checkbox invalid>
          <span data-testid="label">동의</span>
        </Checkbox>
      </div>,
    );
    await settle();
    const input = page.getByRole("checkbox").element();
    if (forcedColors()) return;
    expect(bg(input)).toBe(resolve("var(--tide-bg-canvas)"));
    expect(getComputedStyle(input).borderTopColor).toBe(resolve("var(--tide-border-danger)"));
    await userEvent.hover(page.getByTestId("label"));
    await wait();
    expect(bg(input)).toBe(resolve("var(--tide-bg-danger-subtle)"));
  });

  test("비활성이면 오류여도 비활성 색이다", async () => {
    await render(
      <div data-theme="light">
        <Checkbox invalid disabled defaultChecked>
          체크
        </Checkbox>
      </div>,
    );
    if (forcedColors()) return;
    const input = page.getByRole("checkbox").element();
    expect(bg(input)).toBe(resolve("var(--tide-bg-disabled)"));
    expect(getComputedStyle(input).borderTopColor).toBe(resolve("var(--tide-border-default)"));
    expect(getComputedStyle(mark(input, "check")).color).toBe(resolve("var(--tide-text-disabled)"));
  });
});

describe("포커스 표시", () => {
  test("키보드 포커스에 focus-field(테두리 focus 색 + 3px halo)가 상자 둘레에 보인다", async () => {
    await render(
      <div data-theme="light">
        <Checkbox>알림</Checkbox>
      </div>,
    );
    await userEvent.tab();
    await settle();
    const box = page.getByRole("checkbox").element();
    expectFocusHalo(box, { adjustNone: true });
    if (!forcedColors())
      expect(getComputedStyle(box).borderTopColor).toBe(focusBorderColor.primary);
  });

  test("체크된 success 상자는 포커스 중에도 테두리가 success 색이고 halo도 success다", async () => {
    await render(
      <div data-theme="light">
        <Checkbox color="success" defaultChecked>
          알림
        </Checkbox>
      </div>,
    );
    await userEvent.tab();
    await settle();
    const box = page.getByRole("checkbox").element();
    expectFocusHalo(box, { tone: "success", adjustNone: true });
    if (!forcedColors()) {
      expect(getComputedStyle(box).borderTopColor).toBe(focusBorderColor.success);
    }
  });

  test("오류 상태에서 키보드 포커스하면 테두리와 halo가 오류 색이다", async () => {
    await render(
      <div data-theme="light">
        <Checkbox invalid>약관 동의</Checkbox>
      </div>,
    );
    await userEvent.tab();
    await settle();
    const box = page.getByRole("checkbox").element();
    expectFocusHalo(box, { tone: "danger", adjustNone: true });
    if (!forcedColors()) expect(getComputedStyle(box).borderTopColor).toBe(focusBorderColor.danger);
  });

  test("경계·배경 색은 transition-colors(fast 150ms)로 바뀐다", async () => {
    await render(<Checkbox>알림</Checkbox>);
    const style = getComputedStyle(page.getByRole("checkbox").element());
    expect(style.transitionProperty).toContain("background-color");
    expect(style.transitionDuration.split(",")[0]).toBe("0.15s");
  });
});

describe("움직임(ADR 0037)", () => {
  test("체크하면 채움이 0.7배에서 커지고(opacity fast, scale normal), 체크는 fast 지연 뒤 normal로 그려진다", async () => {
    await render(<Checkbox>알림</Checkbox>);
    const input = page.getByRole("checkbox").element();
    const running = afterChange(input, () => ({
      layer: transitions(fillLayer(input)),
      check: transitions(mark(input, "check")),
    }));
    await userEvent.click(page.getByRole("checkbox"));
    const { layer, check } = await running;

    if (reducedMotion()) {
      expect([...check.keys()]).toEqual(["opacity"]);
      expect(check.get("opacity")!.duration).toBe(ms("fast"));
      expect(check.get("opacity")!.delay).toBe(0);
      expect(getComputedStyle(mark(input, "check")).strokeDasharray).toBe("none");

      return;
    }
    expect(moving(layer)).toEqual(["opacity", "scale"]);
    expect(layer.get("opacity")!.duration).toBe(ms("fast"));
    expect(layer.get("scale")!.duration).toBe(ms("normal"));
    expect(Number.parseFloat(String(layer.get("scale")!.from["scale"]))).toBe(0.7);
    expect(layer.get("scale")!.easing).toBe(easing.out);

    expect([...check.keys()].sort()).toEqual(["opacity", "stroke-dashoffset"]);
    const draw = check.get("stroke-dashoffset")!;
    expect(Number.parseFloat(String(draw.from["strokeDashoffset"]))).toBe(1);
    expect(Number.parseFloat(String(draw.to["strokeDashoffset"]))).toBe(0);
    for (const running of check.values()) {
      expect(running.duration).toBe(ms("normal"));
      expect(running.delay).toBe(ms("fast"));
      expect(running.easing).toBe(easing.out);
    }
  });

  test("해제하면 지연 없이 체크가 fast로 거꾸로 지워지고, 채움도 fast로 줄며 사라진다", async () => {
    await render(<Checkbox defaultChecked>알림</Checkbox>);
    const input = page.getByRole("checkbox").element();
    const running = afterChange(input, () => ({
      layer: transitions(fillLayer(input)),
      check: transitions(mark(input, "check")),
    }));
    await userEvent.click(page.getByRole("checkbox"));
    const { layer, check } = await running;

    const expected = reducedMotion() ? ["opacity"] : ["opacity", "stroke-dashoffset"];
    expect([...check.keys()].sort()).toEqual(expected);
    for (const running of [...check.values(), ...layer.values()].filter(
      (running) => running !== layer.get("background-color"),
    )) {
      expect(running.duration).toBe(ms("fast"));
      expect(running.delay).toBe(0);
    }
    if (!reducedMotion()) {
      expect(moving(layer)).toEqual(["opacity", "scale"]);
      expect(
        Number.parseFloat(String(check.get("stroke-dashoffset")!.to["strokeDashoffset"])),
      ).toBe(1);
    }
  });

  test("움직임 줄이기에서 채움은 크기 변화 없이 opacity만 바뀐다", async () => {
    // forced-colors instance에서는 채움 레이어가 숨어, 기본 instance에서 움직임 줄이기만 켠다.
    if (forcedColors()) return;
    await commands.emulateReducedMotion(true);
    onTestFinished(() => commands.emulateReducedMotion(false));
    expect(reducedMotion()).toBe(true);
    await render(<Checkbox>알림</Checkbox>);
    const input = page.getByRole("checkbox").element();
    const running = afterChange(input, () => transitions(fillLayer(input)));
    await userEvent.click(page.getByRole("checkbox"));
    const layer = await running;
    expect(moving(layer)).toEqual(["opacity"]);
    expect(layer.get("opacity")!.duration).toBe(ms("fast"));
    expect(getComputedStyle(fillLayer(input)).scale).toBe("none");
  });

  test("그리는 도중 다시 누르면 지금 위치에서 되돌아간다", async () => {
    await render(<Checkbox>알림</Checkbox>);
    if (reducedMotion()) return;
    const input = page.getByRole("checkbox").element();
    const drawing = afterChange(input, () => {
      const draw = mark(input, "check")
        .getAnimations()
        .find(
          (animation) =>
            animation instanceof CSSTransition &&
            animation.transitionProperty === "stroke-dashoffset",
        )!;
      // 반쯤 그린 자리에 세워 두고 다시 누른다.
      draw.pause();
      draw.currentTime = ms("fast") + ms("normal") / 2;
    });
    await userEvent.click(page.getByRole("checkbox"));
    await drawing;

    const back = afterChange(input, () => transitions(mark(input, "check")));
    await userEvent.click(page.getByRole("checkbox"));
    const from = Number.parseFloat(
      String((await back).get("stroke-dashoffset")!.from["strokeDashoffset"]),
    );
    expect(from).toBeGreaterThan(0);
    expect(from).toBeLessThan(1);
  });

  test("Space로 체크해도 같게 움직이고, 상태는 움직임을 기다리지 않고 바로 바뀐다", async () => {
    await render(<Checkbox>알림</Checkbox>);
    const input = page.getByRole("checkbox").element() as HTMLInputElement;
    const running = afterChange(input, () => ({
      checked: input.checked,
      check: transitions(mark(input, "check")),
    }));
    await userEvent.tab();
    await userEvent.keyboard(" ");
    const { checked, check } = await running;
    expect(checked).toBe(true);
    expect(check.has(reducedMotion() ? "opacity" : "stroke-dashoffset")).toBe(true);
  });

  test("누르거나 올려도 루트와 상자 크기는 그대로다", async () => {
    await render(
      <Checkbox>
        <span data-testid="label">알림</span>
      </Checkbox>,
    );
    const input = page.getByRole("checkbox").element();
    const before = input.getBoundingClientRect().width;
    await userEvent.hover(page.getByTestId("label"));
    await commands.mouseDownOn("label");
    const pressed = {
      box: getComputedStyle(input).scale,
      root: getComputedStyle(input.closest("label")!).scale,
      width: input.getBoundingClientRect().width,
    };
    await commands.mouseUp();
    expect(pressed).toEqual({ box: "none", root: "none", width: before });
  });

  test("처음 렌더할 때 이미 선택된 채움·표시는 움직이지 않고 그려진 채로 나온다", async () => {
    await render(
      <>
        <Checkbox defaultChecked>비제어</Checkbox>
        <Checkbox checked readOnly>
          제어
        </Checkbox>
        <Checkbox indeterminate>일부</Checkbox>
      </>,
    );
    for (const [name, kind] of [
      ["비제어", "check"],
      ["제어", "check"],
      ["일부", "indeterminate"],
    ] as const) {
      const input = page.getByRole("checkbox", { name }).element();
      const icon = mark(input, kind);
      expect(icon.getAnimations(), name).toHaveLength(0);
      expect(fillLayer(input).getAnimations(), name).toHaveLength(0);
      expect(getComputedStyle(icon).opacity, name).toBe("1");
      if (forcedColors()) continue;
      expect(getComputedStyle(fillLayer(input)).opacity, name).toBe("1");
      if (!reducedMotion()) expect(getComputedStyle(icon).strokeDashoffset, name).toBe("0px");
    }
  });

  test("indeterminate: 가로줄도 fast 지연 뒤 그려지고, 전체 선택으로 바뀌면 체크가 그려진다", async () => {
    function SelectAll(): ReactElement {
      const [items, setItems] = useState([true, true]);
      const all = items.every(Boolean);

      return (
        <>
          <Checkbox
            checked={all}
            indeterminate={items.some(Boolean) && !all}
            onChange={(event) => setItems(items.map(() => event.target.checked))}
          >
            전체
          </Checkbox>
          <Checkbox
            checked={items[0]}
            onChange={(event) => setItems([event.target.checked, items[1]!])}
          >
            항목 1
          </Checkbox>
        </>
      );
    }
    await render(<SelectAll />);
    const all = page.getByRole("checkbox", { name: "전체" }).element();
    const item = page.getByRole("checkbox", { name: "항목 1" }).element();
    const property = reducedMotion() ? "opacity" : "stroke-dashoffset";

    const minus = afterChange(item, () => transitions(mark(all, "indeterminate")));
    await userEvent.click(page.getByRole("checkbox", { name: "항목 1" }));
    const drawn = await minus;
    expect(drawn.has(property)).toBe(true);
    if (!reducedMotion()) expect(drawn.get(property)!.delay).toBe(ms("fast"));
    expect(visible(mark(all, "check"))).toBe(false);

    const check = afterChange(all, () => transitions(mark(all, "check")));
    await userEvent.click(page.getByRole("checkbox", { name: "전체" }));
    expect((await check).has(property)).toBe(true);
    expect(visible(mark(all, "indeterminate"))).toBe(false);
  });

  test("체크·indeterminate 표시는 scale이 걸린 채움 레이어보다 위에 그려진다", async () => {
    await render(
      <>
        <Checkbox defaultChecked>체크</Checkbox>
        <Checkbox indeterminate>일부</Checkbox>
      </>,
    );
    for (const [name, kind] of [
      ["체크", "check"],
      ["일부", "indeterminate"],
    ] as const) {
      const input = page.getByRole("checkbox", { name }).element();
      const layer = input.parentElement?.querySelector("[data-fill]");
      const icon = mark(input, kind);
      // 위치 지정이 없으면 transform·scale이 걸린 형제가 나중 단계에 그려져 덮는다.
      expect(getComputedStyle(icon).position).not.toBe("static");
      expect(layer?.compareDocumentPosition(icon)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    }
  });
});

describe("forced-colors", () => {
  test("체크·indeterminate 표시가 상자 배경과 다른 색으로 보이고, 경계가 보인다", async () => {
    await render(
      <div data-theme="light">
        <Checkbox defaultChecked>체크</Checkbox>
        <Checkbox indeterminate>일부</Checkbox>
      </div>,
    );
    await settle();
    for (const [name, kind] of [
      ["체크", "check"],
      ["일부", "indeterminate"],
    ] as const) {
      const input = page.getByRole("checkbox", { name }).element();
      const icon = mark(input, kind);
      const box = getComputedStyle(input);
      expect(visible(icon)).toBe(true);
      expect(getComputedStyle(icon).color).not.toBe(fill(input));
      expect(getComputedStyle(icon).color).not.toBe(transparent);
      expect(box.borderTopWidth).toBe("1px");
      expect(box.borderTopColor).not.toBe(transparent);
      if (forcedColors()) {
        expect(fill(input)).toBe(resolve("Highlight"));
        expect(getComputedStyle(icon).color).toBe(resolve("HighlightText"));
      }
    }
  });

  test("선택 전 상자는 Canvas 배경에 CanvasText 경계다", async () => {
    await render(<Checkbox>알림</Checkbox>);
    if (!forcedColors()) return;
    const box = getComputedStyle(page.getByRole("checkbox").element());
    expect(box.backgroundColor).toBe(resolve("Canvas"));
    expect(box.borderTopColor).toBe(resolve("CanvasText"));
  });
});

describe("ref와 className", () => {
  test("루트 label에 style과 상태(data-disabled, data-invalid)가 붙는다", async () => {
    await render(
      <Checkbox disabled invalid style={{ marginTop: 12 }}>
        알림
      </Checkbox>,
    );
    const label = page.getByRole("checkbox").element().closest("label")!;
    expect(label).toHaveAttribute("data-disabled", "");
    expect(label).toHaveAttribute("data-invalid", "");
    expect(label.style.marginTop).toBe("12px");
  });

  test("ref는 input에, className은 루트 label에 가고 기본 class를 이긴다", async () => {
    let element: HTMLInputElement | null = null;
    await render(
      <Checkbox ref={(node) => void (element = node)} className="gap-4" data-testid="input">
        알림
      </Checkbox>,
    );
    expect(element).toBe(page.getByTestId("input").element());
    expect(getComputedStyle(page.getByTestId("input").element().closest("label")!).columnGap).toBe(
      "16px",
    );
  });
});

describe("CheckboxGroup", () => {
  test("Field group 안에서 label이 묶음 이름, 설명·오류가 묶음 설명이 되고, aria-invalid는 각 Checkbox에 붙는다", async () => {
    await render(
      <Field
        label="알림 받을 곳"
        description="하나 이상 고릅니다."
        error="알림 받을 곳을 고르세요."
        group
        htmlFor="notify"
      >
        <CheckboxGroup>
          <Checkbox name="notify" value="email">
            이메일
          </Checkbox>
          <Checkbox name="notify" value="sms">
            문자
          </Checkbox>
        </CheckboxGroup>
      </Field>,
    );
    const group = page.getByRole("group", { name: "알림 받을 곳" });
    await expect.element(group).toBeInTheDocument();
    await expect
      .element(group)
      .toHaveAccessibleDescription("하나 이상 고릅니다. 알림 받을 곳을 고르세요.");
    expect(group.element()).toHaveAttribute("id", "notify");
    expect(group.element()).toHaveAttribute("data-invalid", "");
    expect(group.element()).not.toHaveAttribute("aria-invalid");

    const email = page.getByRole("checkbox", { name: "이메일" });
    const sms = page.getByRole("checkbox", { name: "문자" });
    await expect.element(email).toHaveAttribute("aria-invalid", "true");
    await expect.element(sms).toHaveAttribute("aria-invalid", "true");
    expect(email.element().id).not.toBe("notify");
    expect(email.element().id).toBe("");
    expect(page.getByText("알림 받을 곳").element().tagName).toBe("SPAN");
  });

  test("Field disabled면 안의 Checkbox가 모두 비활성이고, required는 각 Checkbox에 넘기지 않는다", async () => {
    await render(
      <Field label="관심사" group disabled required>
        <CheckboxGroup>
          <Checkbox>디자인</Checkbox>
          <Checkbox>개발</Checkbox>
        </CheckboxGroup>
      </Field>,
    );
    await expect.element(page.getByRole("checkbox", { name: "디자인" })).toBeDisabled();
    await expect.element(page.getByRole("checkbox", { name: "개발" })).toBeDisabled();
    // 묶음의 「하나 이상」은 네이티브 required로 나타낼 수 없다(각자 필수가 된다).
    await expect.element(page.getByRole("checkbox", { name: "디자인" })).not.toBeRequired();
    expect(page.getByRole("group").element()).toHaveAttribute("data-disabled", "");
  });

  test("Field 밖에서는 aria-label로 이름을 붙이고, orientation으로 가로로 늘어놓는다", async () => {
    await render(
      <CheckboxGroup aria-label="요일" orientation="horizontal">
        <Checkbox>월</Checkbox>
        <Checkbox>화</Checkbox>
      </CheckboxGroup>,
    );
    const group = page.getByRole("group", { name: "요일" });
    expect(getComputedStyle(group.element()).flexDirection).toBe("row");
  });

  test("Checkbox에 직접 준 값이 묶음 값을 이긴다", async () => {
    await render(
      <CheckboxGroup aria-label="옵션" invalid disabled>
        <Checkbox invalid={false} disabled={false}>
          선물 포장
        </Checkbox>
      </CheckboxGroup>,
    );
    const checkbox = page.getByRole("checkbox", { name: "선물 포장" });
    await expect.element(checkbox).not.toBeDisabled();
    expect(checkbox.element()).not.toHaveAttribute("aria-invalid");
  });
});

describe("Field 안의 단일 Checkbox", () => {
  test("Field 설명·오류가 체크박스 설명으로 연결된다", async () => {
    await render(
      <Field label="약관" error="약관에 동의해야 합니다.">
        <Checkbox>동의합니다</Checkbox>
      </Field>,
    );
    const checkbox = page.getByRole("checkbox");
    await expect.element(checkbox).toHaveAccessibleDescription("약관에 동의해야 합니다.");
    await expect.element(checkbox).toHaveAttribute("aria-invalid", "true");
  });
});
