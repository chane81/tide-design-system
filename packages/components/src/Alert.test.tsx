// Alert의 모양과 동작을 실제 Chromium에서 확인한다(tide-v0-impl 티켓 20).
// 두 instance에서 모두 돈다. 두 번째 instance(forced-colors)에서는 배경이 사라져도 경계로 영역이 남는지 본다.
import { colorFamilyCss, defineColorFamily } from "@tide-design/foundation/color-family";
import { useState } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { Alert, type AlertProps } from "./Alert.tsx";

// 앱 Role(brand)을 Role 타입에 더한다(앱의 augmentation과 같다. 티켓 41, ADR 0016).
declare module "@tide-design/foundation" {
  interface RoleRegistry {
    brand: true;
  }
}

const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;

/** CSS 값 하나를 실제로 계산한 결과. Token 변수를 계산값과 비교할 때 쓴다. */
function resolve(value: string, theme = "light"): string {
  const probe = document.createElement("div");
  probe.dataset["theme"] = theme;
  // 시스템 색 이름(CanvasText 등)을 forced-colors가 덮지 않고 그대로 계산하게 한다.
  probe.style.forcedColorAdjust = "none";
  probe.style.borderColor = value;
  document.body.append(probe);
  const resolved = getComputedStyle(probe).borderTopColor;
  probe.remove();
  return resolved;
}

const root = (): HTMLElement => page.getByTestId("alert").element() as HTMLElement;
const icon = (): SVGElement => root().querySelector("svg")!;

const roles = ["neutral", "primary", "success", "warning", "danger", "info"] as const;
const states = ["info", "success", "warning", "danger"] as const;

describe("역할", () => {
  test("기본은 역할이 없는 div다(정적 표시). live region이 아니다", async () => {
    await render(
      <Alert data-testid="alert" title="점검 예정">
        11월 15일 새벽 2시에 점검합니다.
      </Alert>,
    );
    expect(root().tagName).toBe("DIV");
    expect(root()).not.toHaveAttribute("role");
    expect(page.getByRole("alert").elements()).toHaveLength(0);
    expect(page.getByRole("status").elements()).toHaveLength(0);
    await expect
      .element(page.getByTestId("alert"))
      .toHaveTextContent("점검 예정11월 15일 새벽 2시에 점검합니다.");
  });

  test('role="alert"와 role="status"를 루트에 붙인다', async () => {
    await render(
      <>
        <Alert color="danger" role="alert" title="저장하지 못했습니다" />
        <Alert color="success" role="status" title="저장했습니다" />
      </>,
    );
    await expect.element(page.getByRole("alert")).toHaveTextContent("저장하지 못했습니다");
    await expect.element(page.getByRole("status")).toHaveTextContent("저장했습니다");
  });

  test("새로 렌더한 role=alert 안의 텍스트가 접근성 트리에 있다", async () => {
    function Form() {
      const [failed, setFailed] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setFailed(true)}>
            저장
          </button>
          {failed && (
            <Alert color="danger" role="alert">
              네트워크 오류로 저장하지 못했습니다.
            </Alert>
          )}
        </>
      );
    }
    await render(<Form />);
    expect(page.getByRole("alert").elements()).toHaveLength(0);
    await userEvent.click(page.getByRole("button", { name: "저장" }));
    await expect
      .element(page.getByRole("alert"))
      .toHaveTextContent("네트워크 오류로 저장하지 못했습니다.");
  });

  test("role은 alert·status만 받는다", () => {
    // @ts-expect-error -- 알림 역할이 아닌 role은 받지 않는다.
    const button: AlertProps = { role: "button" };
    expect(button.role).toBe("button");
  });
});

describe("상태 아이콘", () => {
  test("아이콘은 장식용이라 읽히지 않는다", async () => {
    await render(<Alert data-testid="alert" color="warning" title="용량 부족" />);
    expect(icon()).toHaveAttribute("aria-hidden", "true");
    expect(page.getByRole("img").elements()).toHaveLength(0);
    await expect.element(page.getByTestId("alert")).toHaveTextContent("용량 부족");
  });

  test("info·success·warning·danger 아이콘은 모양이 서로 다르다(WCAG 1.4.1)", async () => {
    await render(
      <>
        {states.map((state) => (
          <Alert key={state} data-testid={state} color={state} title={state} />
        ))}
      </>,
    );
    const shapes = states.map(
      (state) => page.getByTestId(state).element().querySelector("svg")!.innerHTML,
    );
    expect(new Set(shapes).size).toBe(4);
  });

  test("neutral·primary·앱 Role은 info와 같은 아이콘이다", async () => {
    await render(
      <>
        {(["info", "neutral", "primary", "brand"] as const).map((color) => (
          <Alert key={color} data-testid={color} color={color} title={color} />
        ))}
      </>,
    );
    const shapes = ["info", "neutral", "primary", "brand"].map(
      (color) => page.getByTestId(color).element().querySelector("svg")!.innerHTML,
    );
    expect(new Set(shapes).size).toBe(1);
  });

  test("아이콘은 20px이고 글자색을 따른다", async () => {
    await render(<Alert data-testid="alert" title="안내" />);
    expect(icon().getBoundingClientRect().width).toBe(20);
    expect(icon().getBoundingClientRect().height).toBe(20);
    expect(icon()).toHaveAttribute("stroke", "currentColor");
    expect(getComputedStyle(icon()).color).toBe(getComputedStyle(root()).color);
  });
});

describe("닫기", () => {
  test("onClose가 없으면 닫기 버튼이 없다", async () => {
    await render(<Alert title="안내" />);
    expect(page.getByRole("button").elements()).toHaveLength(0);
  });

  test("닫기 버튼은 이름이 있는 IconButton이고, 누르거나 Enter·Space로 onClose를 부른다", async () => {
    const onClose = vi.fn();
    await render(<Alert title="안내" onClose={onClose} />);
    const button = page.getByRole("button", { name: "닫기" });
    await expect.element(button).toHaveAttribute("type", "button");
    await expect.element(button).toHaveAttribute("data-color", "info");
    // 아이콘은 버튼 안에서도 장식용이다.
    expect(button.element().querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    await userEvent.click(button);
    // 누른 뒤 포커스가 버튼에 있다. 키보드로 두 번 더 누른다.
    await expect.element(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  test("closeLabel로 버튼 이름을 바꾼다", async () => {
    await render(<Alert title="결제 실패" onClose={() => {}} closeLabel="결제 알림 닫기" />);
    await expect.element(page.getByRole("button", { name: "결제 알림 닫기" })).toBeInTheDocument();
  });

  test("제어형이다. 앱이 onClose에서 Alert를 빼면 사라진다", async () => {
    function Notice() {
      const [open, setOpen] = useState(true);
      return open ? <Alert title="새 기능" onClose={() => setOpen(false)} /> : <p>닫힘</p>;
    }
    await render(<Notice />);
    await userEvent.click(page.getByRole("button", { name: "닫기" }));
    await expect.element(page.getByText("닫힘")).toBeInTheDocument();
    expect(page.getByText("새 기능").elements()).toHaveLength(0);
  });

  test("닫기 버튼은 xs(24px) ghost이고 Alert의 Role 파스텔 글자(on-subtle)와 subtle-hover 배경을 쓴다", async () => {
    await render(
      <div data-theme="light">
        <Alert color="danger" title="오류" onClose={() => {}} />
      </div>,
    );
    const button = page.getByRole("button", { name: "닫기" }).element();
    expect(button.getBoundingClientRect().width).toBe(24);
    expect(button.getBoundingClientRect().height).toBe(24);
    expect(button).toHaveAttribute("data-color", "danger");
    if (forcedColors()) return;
    // subtle 바탕 위라 글자는 on-subtle이다(ADR 0022 §1).
    expect(getComputedStyle(button).color).toBe(resolve("var(--tide-text-danger-on-subtle)"));
    await userEvent.hover(button);
    await expect
      .poll(() => getComputedStyle(button).backgroundColor)
      .toBe(resolve("var(--tide-bg-danger-subtle-hover)"));
  });

  test("키보드 포커스에 focus-ring(outline 2px, offset 2px)이 보인다", async () => {
    await render(
      <div data-theme="light">
        <Alert color="success" title="완료" onClose={() => {}} />
      </div>,
    );
    await userEvent.tab();
    // outline 색도 transition-colors(fast 150ms) 대상이라 전환이 끝난 뒤 읽는다.
    await new Promise((done) => setTimeout(done, 250));
    const style = getComputedStyle(page.getByRole("button", { name: "닫기" }).element());
    expect(style.outlineStyle).toBe("solid");
    expect(style.outlineWidth).toBe("2px");
    expect(style.outlineOffset).toBe("2px");
    if (!forcedColors()) {
      expect(style.outlineColor).toBe(resolve("var(--tide-outline-focus)"));
    }
  });
});

describe("모양", () => {
  test("radius lg(8px), 여백 16px, 경계 1px, 그림자 없음", async () => {
    await render(<Alert data-testid="alert" title="안내" />);
    const style = getComputedStyle(root());
    expect(style.borderTopLeftRadius).toBe("8px");
    expect(style.paddingTop).toBe("16px");
    expect(style.paddingInlineStart).toBe("16px");
    expect(style.borderTopWidth).toBe("1px");
    expect(style.borderTopStyle).toBe("solid");
    expect(style.boxShadow).toBe("none");
    expect(style.display).toBe("flex");
  });

  test("제목은 14px 600, 본문은 14px 400이다", async () => {
    await render(
      <Alert title="제목">
        <span>본문</span>
      </Alert>,
    );
    const title = page.getByText("제목", { exact: true }).element();
    const body = page.getByText("본문", { exact: true }).element();
    expect(getComputedStyle(title).fontSize).toBe("14px");
    expect(getComputedStyle(title).fontWeight).toBe("600");
    expect(getComputedStyle(body).fontSize).toBe("14px");
    expect(getComputedStyle(body).fontWeight).toBe("400");
    expect(title.compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test("제목이나 본문이 없으면 그 요소를 만들지 않는다", async () => {
    await render(<Alert data-testid="alert">본문만</Alert>);
    const content = root().children[1]!;
    expect(content.children).toHaveLength(1);
    expect(content).toHaveTextContent("본문만");
  });

  test("긴 본문이 닫기 버튼을 밀어내지 않는다", async () => {
    await render(
      <div style={{ width: 240 }}>
        <Alert data-testid="alert" onClose={() => {}}>
          {"아주긴단어".repeat(20)}
        </Alert>
      </div>,
    );
    const button = page.getByRole("button", { name: "닫기" }).element().getBoundingClientRect();
    const box = root().getBoundingClientRect();
    expect(button.right).toBeLessThanOrEqual(box.right);
  });
});

describe("색", () => {
  test("기본은 info이고 루트에 data-color가 붙는다", async () => {
    await render(<Alert data-testid="alert" title="안내" />);
    expect(root()).toHaveAttribute("data-color", "info");
  });

  test.each(
    roles.flatMap((role) => (["light", "dark"] as const).map((theme) => [role, theme] as const)),
  )(
    "%s(%s)는 같은 Role의 subtle 배경, 파스텔 글자(on-subtle), 파스텔 테두리다",
    async (role, theme) => {
      await render(
        <div data-theme={theme}>
          <Alert data-testid="alert" color={role} title={role} />
        </div>,
      );
      expect(root()).toHaveAttribute("data-color", role);
      if (forcedColors()) return;
      // neutral의 on-subtle은 text-default를 공유한다. 파스텔 테두리는 neutral도 Role Token이 있다(ADR 0022).
      const text =
        role === "neutral" ? "var(--tide-text-default)" : `var(--tide-text-${role}-on-subtle)`;
      const border = `var(--tide-border-${role}-subtle)`;
      const style = getComputedStyle(root());
      expect(style.backgroundColor).toBe(resolve(`var(--tide-bg-${role}-subtle)`, theme));
      expect(style.color).toBe(resolve(text, theme));
      expect(style.borderTopColor).toBe(resolve(border, theme));
    },
  );

  test("바깥 요소의 data-color를 물려받지 않는다", async () => {
    await render(
      <div data-theme="light" data-color="danger">
        <Alert data-testid="alert" title="안내" />
      </div>,
    );
    expect(root()).toHaveAttribute("data-color", "info");
    if (forcedColors()) return;
    expect(getComputedStyle(root()).backgroundColor).toBe(resolve("var(--tide-bg-info-subtle)"));
  });

  test("color는 Role만 받는다. 색 계열 이름은 타입 오류다(ADR 0016)", () => {
    // @ts-expect-error -- 색 계열 이름은 뜻이 없어 Alert color가 아니다.
    const blue: AlertProps = { color: "blue" };
    const names: AlertProps[] = [{ color: "danger" }, { color: "neutral" }, { color: "brand" }];
    expect([blue.color, ...names.map((props) => props.color)]).toEqual([
      "blue",
      "danger",
      "neutral",
      "brand",
    ]);
  });

  describe("앱 Role", () => {
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

    test('color="brand"로 앱 Role의 subtle·on-subtle·subtle-border 슬롯을 쓴다', async () => {
      style = document.createElement("style");
      style.textContent = colorFamilyCss([brand]);
      document.head.append(style);
      await render(
        <div data-theme="light">
          <Alert data-testid="alert" color="brand" title="새 요금제" />
        </div>,
      );
      expect(root()).toHaveAttribute("data-color", "brand");
      if (forcedColors()) return;
      const computed = getComputedStyle(root());
      // light 슬롯: subtle 100, on-subtle 950, subtle-border 200(ADR 0022)
      expect(computed.backgroundColor).toBe(resolve("#fee5f0"));
      expect(computed.color).toBe(resolve("#5c1d3f"));
      expect(computed.borderTopColor).toBe(resolve("#ebcbd9"));
    });
  });
});

describe("forced-colors", () => {
  test("고대비 모드에서는 경계와 글자·아이콘이 CanvasText, 배경이 Canvas가 된다", async () => {
    await render(
      <div data-theme="light">
        <Alert data-testid="alert" color="danger" title="오류" onClose={() => {}} />
      </div>,
    );
    const style = getComputedStyle(root());
    expect(style.borderTopWidth).toBe("1px");
    if (!forcedColors()) {
      expect(style.borderTopColor).toBe(resolve("var(--tide-border-danger-subtle)"));
      return;
    }
    expect(style.borderTopColor).toBe(resolve("CanvasText"));
    expect(style.color).toBe(resolve("CanvasText"));
    expect(style.backgroundColor).toBe(resolve("Canvas"));
    expect(getComputedStyle(icon()).color).toBe(resolve("CanvasText"));
    // 닫기 버튼(ghost)도 투명 경계가 보여 버튼 모양이 남는다.
    const button = getComputedStyle(page.getByRole("button", { name: "닫기" }).element());
    expect(button.borderTopWidth).toBe("1px");
    expect(button.borderTopColor).not.toBe("rgba(0, 0, 0, 0)");
  });
});

describe("공통 API", () => {
  test("ref와 나머지 props를 루트 div에 넘기고, className이 기본 class를 이긴다", async () => {
    let node: HTMLDivElement | null = null;
    await render(
      <Alert
        ref={(element) => {
          node = element;
        }}
        data-testid="alert"
        id="notice"
        aria-label="공지"
        className="rounded-none p-6"
        title="안내"
      />,
    );
    expect(node).toBeInstanceOf(HTMLDivElement);
    expect(root()).toHaveAttribute("id", "notice");
    expect(root()).toHaveAttribute("aria-label", "공지");
    expect(root()).toHaveClass("rounded-none", "p-6");
    expect(root()).not.toHaveClass("rounded-lg");
    expect(root()).not.toHaveClass("p-4");
    expect(getComputedStyle(root()).paddingTop).toBe("24px");
    // title은 제목(ReactNode)이고 HTML title 속성(툴팁)으로 붙지 않는다.
    expect(root()).not.toHaveAttribute("title");
  });

  test("onClose는 인자 없는 콜백이다(DOM의 close 이벤트 핸들러가 아니다)", () => {
    const props: AlertProps = { onClose: () => {} };
    // @ts-expect-error -- 지원하지 않는 prop은 타입 오류다.
    const variant: AlertProps = { variant: "solid" };
    expect([typeof props.onClose, variant]).toEqual(["function", { variant: "solid" }]);
  });
});
