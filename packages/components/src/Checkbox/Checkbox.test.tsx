// 두 번째 instance(forced-colors·reduced-motion)에서도 돈다.
import { colorFamilyCss, defineColorFamily } from "@tide-design/foundation/color-family";
import { useState, type ReactElement } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { commands, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { expectFocusHalo, focusBorderColor } from "../../test/focus";

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

const visible = (element: Element): boolean => getComputedStyle(element).display !== "none";

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
    "%s: 상자 %ipx, 글자 %s, 아이콘 %ipx이고 조작 영역은 24×24px이다",
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
    expect(getComputedStyle(primary).backgroundColor).toBe(resolve("var(--tide-bg-primary-solid)"));
    expect(getComputedStyle(primary).borderTopColor).toBe(resolve("var(--tide-border-primary)"));
    expect(getComputedStyle(danger).backgroundColor).toBe(resolve("var(--tide-bg-danger-solid)"));
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
      expect(getComputedStyle(input).backgroundColor).toBe(resolve("#a85c81"));
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
    expect(getComputedStyle(box("체크됨")).backgroundColor).toBe(
      resolve("var(--tide-bg-primary-solid-hover)"),
    );

    await userEvent.hover(page.getByText("체크 전"));
    await wait();
    expect(getComputedStyle(box("체크 전")).backgroundColor).toBe(
      resolve("var(--tide-bg-primary-subtle)"),
    );
    expect(getComputedStyle(box("체크 전")).borderTopColor).toBe(
      resolve("var(--tide-border-strong)"),
    );
    expect(getComputedStyle(box("체크됨")).backgroundColor).toBe(
      resolve("var(--tide-bg-primary-solid)"),
    );

    await userEvent.hover(page.getByText("일부"));
    await wait();
    expect(getComputedStyle(box("일부")).backgroundColor).toBe(
      resolve("var(--tide-bg-primary-solid-hover)"),
    );
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
      const value = getComputedStyle(
        page.getByRole("checkbox", { name }).element(),
      ).backgroundColor;
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
    const before = getComputedStyle(box).backgroundColor;
    await userEvent.hover(page.getByText("꺼짐"));
    await wait();
    expect(getComputedStyle(box).backgroundColor).toBe(before);
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
      expect(getComputedStyle(icon).color).not.toBe(box.backgroundColor);
      expect(getComputedStyle(icon).color).not.toBe(transparent);
      expect(box.borderTopWidth).toBe("1px");
      expect(box.borderTopColor).not.toBe(transparent);
      if (forcedColors()) {
        expect(box.backgroundColor).toBe(resolve("Highlight"));
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
