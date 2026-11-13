// Accordion 동작을 실제 Chromium에서 확인한다(tide-v0-impl 티켓 32).
// 두 instance에서 모두 돈다. 두 번째 instance(forced-colors·reduced-motion)에서는 chevron이 글자색(시스템 색)을 따르는지와
// chevron 회전이 전환 없이 바로 바뀌는지를 본다.
import { useState, type ReactElement } from "react";
import { describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { captureWhen } from "../../test/motion";

import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
  type AccordionItemProps,
  type AccordionPanelProps,
  type AccordionProps,
  type AccordionTriggerProps,
} from "./index";

const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;
const reducedMotion = (): boolean => matchMedia("(prefers-reduced-motion: reduce)").matches;
const transparent = "rgba(0, 0, 0, 0)";
const wait = (ms: number): Promise<void> => new Promise((done) => setTimeout(done, ms));

/** CSS 값 하나를 실제로 계산한 결과. Token 변수를 계산값과 비교할 때 쓴다. */
function resolve(property: "color" | "backgroundColor", value: string): string {
  const probe = document.createElement("div");
  probe.dataset["theme"] = "light";
  probe.style.forcedColorAdjust = "none";
  probe.style[property] = value;
  document.body.append(probe);
  const resolved = getComputedStyle(probe)[property];
  probe.remove();

  return resolved;
}

function Example(props: Partial<AccordionProps>): ReactElement {
  return (
    <div data-theme="light">
      <button type="button" data-testid="before">
        앞
      </button>
      <Accordion data-testid="root" {...props}>
        <AccordionItem value="shipping" data-testid="item-shipping">
          <AccordionTrigger data-testid="shipping">배송</AccordionTrigger>
          <AccordionPanel data-testid="panel-shipping">배송 안내</AccordionPanel>
        </AccordionItem>
        <AccordionItem value="refund" data-testid="item-refund">
          <AccordionTrigger data-testid="refund">환불</AccordionTrigger>
          <AccordionPanel data-testid="panel-refund">
            환불 안내 <input aria-label="주문 번호" />
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem value="archive" disabled data-testid="item-archive">
          <AccordionTrigger data-testid="archive">보관</AccordionTrigger>
          <AccordionPanel data-testid="panel-archive">보관 안내</AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

const byTestId = (testId: string): HTMLElement => page.getByTestId(testId).element() as HTMLElement;
const expanded = (testId: string): string | null => byTestId(testId).getAttribute("aria-expanded");

describe("역할과 연결", () => {
  test("제목(h3) 안의 버튼이 aria-expanded를 노출하고 aria-controls로 패널(region)을 가리킨다", async () => {
    await render(<Example defaultValue={["shipping"]} />);
    const trigger = page.getByRole("button", { name: "배송" });
    await expect.element(trigger).toHaveAttribute("aria-expanded", "true");
    await expect.element(trigger).toHaveAttribute("type", "button");
    // 제목 요소 안에는 버튼만 있다(APG).
    const heading = page.getByRole("heading", { level: 3, name: "배송" }).element();
    expect(heading.children).toHaveLength(1);
    expect(heading.firstElementChild).toBe(trigger.element());

    const panel = page.getByRole("region", { name: "배송" });
    await expect.element(panel).toBeVisible();
    await expect.element(panel).toHaveTextContent("배송 안내");
    expect(trigger.element().getAttribute("aria-controls")).toBe(panel.element().id);
    expect(panel.element().getAttribute("aria-labelledby")).toBe(trigger.element().id);

    // 접힌 항목: aria-expanded false, 패널은 숨고 높이가 없다.
    expect(expanded("refund")).toBe("false");
    expect(byTestId("refund").getAttribute("aria-controls")).toBe(byTestId("panel-refund").id);
    await expect.element(page.getByTestId("panel-refund")).not.toBeVisible();
    expect(byTestId("panel-refund").getBoundingClientRect().height).toBe(0);
    // 접힌 패널도 늘 렌더한다(region 역할만 보조 기술에서 숨는다).
    expect(page.getByRole("region").elements()).toHaveLength(1);
  });

  test("hydration 뒤 접힌 패널은 hidden=until-found이고, 페이지 찾기(beforematch)가 오면 펼친다", async () => {
    await render(<Example />);
    expect(byTestId("panel-refund").getAttribute("hidden")).toBe("until-found");
    byTestId("panel-refund").dispatchEvent(new Event("beforematch"));
    await expect.element(page.getByTestId("refund")).toHaveAttribute("aria-expanded", "true");
    await expect.element(page.getByRole("region", { name: "환불" })).toBeVisible();
  });

  test("level로 제목 단계를, role로 패널 역할(group)을 바꾼다", async () => {
    await render(
      <Accordion defaultValue={["a"]}>
        <AccordionItem value="a">
          <AccordionTrigger level={2}>첫째</AccordionTrigger>
          <AccordionPanel role="group">내용</AccordionPanel>
        </AccordionItem>
      </Accordion>,
    );
    await expect.element(page.getByRole("heading", { level: 2, name: "첫째" })).toBeVisible();
    await expect.element(page.getByRole("group", { name: "첫째" })).toBeVisible();
    expect(page.getByRole("region").elements()).toHaveLength(0);
  });
});

describe("펼치고 접기", () => {
  test("누르면 펼치고 다시 누르면 접는다. 기본은 한 항목만 펼친다", async () => {
    await render(<Example />);
    await userEvent.click(page.getByTestId("shipping"));
    expect(expanded("shipping")).toBe("true");
    expect(byTestId("item-shipping")).toHaveAttribute("data-open", "");
    expect(byTestId("shipping")).toHaveAttribute("data-open", "");
    expect(byTestId("panel-shipping")).toHaveAttribute("data-open", "");
    await expect.element(page.getByRole("region", { name: "배송" })).toBeVisible();

    // 다른 항목을 펼치면 펼쳐 있던 항목이 접힌다.
    await userEvent.click(page.getByTestId("refund"));
    expect(expanded("refund")).toBe("true");
    expect(expanded("shipping")).toBe("false");
    expect(byTestId("item-shipping")).not.toHaveAttribute("data-open");
    await expect.element(page.getByTestId("panel-shipping")).not.toBeVisible();

    // 펼친 항목을 다시 누르면 접힌다(모두 접을 수 있다).
    await userEvent.click(page.getByTestId("refund"));
    expect(expanded("refund")).toBe("false");
  });

  test("multiple이면 여러 항목을 함께 펼친다", async () => {
    await render(<Example multiple />);
    await userEvent.click(page.getByTestId("shipping"));
    await userEvent.click(page.getByTestId("refund"));
    expect(expanded("shipping")).toBe("true");
    expect(expanded("refund")).toBe("true");
    expect(page.getByRole("region").elements()).toHaveLength(2);
  });

  test("Tab으로 트리거를 차례로 지나고 Enter·Space로 펼치고 접는다", async () => {
    await render(<Example />);
    byTestId("before").focus();
    await userEvent.tab();
    await expect.element(page.getByTestId("shipping")).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(expanded("shipping")).toBe("true");
    await userEvent.keyboard("{Enter}");
    expect(expanded("shipping")).toBe("false");
    await userEvent.keyboard(" ");
    expect(expanded("shipping")).toBe("true");
    // 펼친 패널 안의 조작 요소도 Tab 순서에 있다. 접힌 패널 안은 건너뛴다.
    await userEvent.tab();
    await expect.element(page.getByTestId("refund")).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(expanded("refund")).toBe("true");
    expect(expanded("shipping")).toBe("false");
    await userEvent.tab();
    await expect.element(page.getByRole("textbox", { name: "주문 번호" })).toHaveFocus();
    // 비활성 트리거는 Tab 순서 밖이다.
    await userEvent.tab();
    expect(document.activeElement).not.toBe(byTestId("archive"));
  });

  test("비활성 항목은 네이티브 disabled라 펼칠 수 없고, 펼친 채 비활성이면 펼친 채로 남는다", async () => {
    await render(<Example />);
    const archive = byTestId("archive");
    expect(archive).toBeDisabled();
    expect(byTestId("item-archive")).toHaveAttribute("data-disabled", "");
    expect(getComputedStyle(archive).cursor).toBe("not-allowed");
    await userEvent.click(page.getByTestId("archive"), { force: true });
    expect(expanded("archive")).toBe("false");

    await render(
      <Accordion defaultValue={["a"]}>
        <AccordionItem value="a" disabled>
          <AccordionTrigger>잠긴 항목</AccordionTrigger>
          <AccordionPanel>잠긴 내용</AccordionPanel>
        </AccordionItem>
      </Accordion>,
    );
    await expect.element(page.getByRole("region", { name: "잠긴 항목" })).toBeVisible();
  });

  test("접어도 패널 안 입력 상태가 남는다", async () => {
    await render(<Example defaultValue={["refund"]} />);
    await userEvent.fill(page.getByRole("textbox", { name: "주문 번호" }), "A-100");
    await userEvent.click(page.getByTestId("refund"));
    await userEvent.click(page.getByTestId("refund"));
    await expect.element(page.getByRole("textbox", { name: "주문 번호" })).toHaveValue("A-100");
  });
});

describe("제어와 비제어", () => {
  test("value를 주면 onValueChange만 부르고 부모가 바꿔야 바뀐다", async () => {
    const onValueChange = vi.fn();
    await render(<Example value={["shipping"]} onValueChange={onValueChange} />);
    await userEvent.click(page.getByTestId("refund"));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenLastCalledWith(["refund"]);
    expect(expanded("shipping")).toBe("true");
    expect(expanded("refund")).toBe("false");
    await userEvent.click(page.getByTestId("shipping"));
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });

  test("상태를 가진 부모가 값을 바꾸면 따라가고, multiple 값은 펼친 순서다", async () => {
    const onValueChange = vi.fn();
    function Parent(): ReactElement {
      const [value, setValue] = useState<string[]>([]);

      return (
        <>
          <button type="button" onClick={() => setValue(["refund"])}>
            환불 열기
          </button>
          <Example
            multiple
            value={value}
            onValueChange={(next) => {
              onValueChange(next);
              setValue(next);
            }}
          />
        </>
      );
    }
    await render(<Parent />);
    await userEvent.click(page.getByRole("button", { name: "환불 열기" }));
    expect(expanded("refund")).toBe("true");
    await userEvent.click(page.getByTestId("shipping"));
    expect(onValueChange).toHaveBeenLastCalledWith(["refund", "shipping"]);
    expect(expanded("shipping")).toBe("true");
    await userEvent.click(page.getByTestId("refund"));
    expect(onValueChange).toHaveBeenLastCalledWith(["shipping"]);
  });

  test("비제어 defaultValue는 처음 값만 쓰고 onValueChange로 알린다", async () => {
    const onValueChange = vi.fn();
    await render(<Example defaultValue={["refund"]} onValueChange={onValueChange} />);
    expect(expanded("refund")).toBe("true");
    await userEvent.click(page.getByTestId("shipping"));
    expect(onValueChange).toHaveBeenCalledWith(["shipping"]);
    expect(expanded("refund")).toBe("false");
  });

  test("multiple이 아닌데 값이 둘 이상이면 첫 값만 남기며 onValueChange를 부른다", async () => {
    const onValueChange = vi.fn();
    await render(<Example defaultValue={["refund", "shipping"]} onValueChange={onValueChange} />);
    await expect.element(page.getByTestId("shipping")).toHaveAttribute("aria-expanded", "false");
    expect(expanded("refund")).toBe("true");
    expect(onValueChange).toHaveBeenCalledWith(["refund"]);
  });
});

describe("모양과 포커스 표시", () => {
  test("Tab으로 트리거에 포커스하면 focus-ring(outline 2px, offset 2px)이 보이고, 마우스 누름에는 없다", async () => {
    await render(<Example />);
    byTestId("before").focus();
    await userEvent.tab();
    await expect.element(page.getByTestId("shipping")).toHaveFocus();
    await wait(250);
    const style = getComputedStyle(byTestId("shipping"));
    expect(style.outlineStyle).toBe("solid");
    expect(style.outlineWidth).toBe("2px");
    expect(style.outlineOffset).toBe("2px");
    expect(style.outlineColor).not.toBe(transparent);
    expect(style.borderTopLeftRadius).toBe("6px");
    if (!forcedColors()) {
      expect(style.outlineColor).toBe(resolve("color", "var(--tide-outline-focus)"));
    }
    await userEvent.click(page.getByTestId("refund"));
    expect(getComputedStyle(byTestId("refund")).outlineStyle).toBe("none");
  });

  test("루트는 radius lg와 1px 경계, 항목 사이 1px 선, 트리거는 label-lg 글자와 여백 12px·16px다", async () => {
    await render(<Example defaultValue={["shipping"]} />);
    const root = getComputedStyle(byTestId("root"));
    expect(root.borderTopLeftRadius).toBe("8px");
    expect(root.borderTopWidth).toBe("1px");
    expect(getComputedStyle(byTestId("item-shipping")).borderTopWidth).toBe("0px");
    expect(getComputedStyle(byTestId("item-refund")).borderTopWidth).toBe("1px");
    const trigger = getComputedStyle(byTestId("shipping"));
    expect(trigger.fontSize).toBe("16px");
    expect(trigger.fontWeight).toBe("500");
    expect(trigger.paddingTop).toBe("12px");
    expect(trigger.paddingLeft).toBe("16px");
    expect(trigger.cursor).toBe("pointer");
    expect(byTestId("shipping").getBoundingClientRect().width).toBeCloseTo(
      byTestId("item-shipping").getBoundingClientRect().width,
      0,
    );
    const panel = getComputedStyle(byTestId("panel-shipping"));
    expect(panel.paddingLeft).toBe("16px");
    expect(panel.paddingBottom).toBe("16px");
    expect(panel.fontSize).toBe("16px");
    // 접힌 패널은 여백도 0이라 자리를 차지하지 않는다.
    expect(getComputedStyle(byTestId("panel-refund")).paddingBottom).toBe("0px");
  });

  test("chevron은 장식용 16px muted 아이콘이고, hover 배경은 전환 없이 바로 바뀐다", async () => {
    await render(<Example />);
    const chevron = byTestId("shipping").querySelector("svg") as SVGElement;
    expect(chevron).toHaveAttribute("aria-hidden", "true");
    expect(getComputedStyle(chevron).width).toBe("16px");
    // 글자와 chevron 사이 12px, chevron은 끝에 붙는다.
    expect(getComputedStyle(byTestId("shipping")).columnGap).toBe("12px");
    const triggerRect = byTestId("shipping").getBoundingClientRect();
    expect(triggerRect.right - chevron.getBoundingClientRect().right).toBeCloseTo(16, 0);
    if (forcedColors()) {
      // 고대비 모드에서는 chevron이 글자색(시스템 색)을 그대로 따라 보인다.
      expect(getComputedStyle(chevron).color).toBe(getComputedStyle(byTestId("shipping")).color);
      expect(getComputedStyle(chevron).color).not.toBe(transparent);

      return;
    }
    expect(getComputedStyle(chevron).color).toBe(resolve("color", "var(--tide-text-muted)"));
    expect(getComputedStyle(byTestId("shipping")).color).toBe(
      resolve("color", "var(--tide-text-default)"),
    );
    expect(getComputedStyle(byTestId("archive")).color).toBe(
      resolve("color", "var(--tide-text-disabled)"),
    );
    await userEvent.hover(page.getByTestId("shipping"));
    expect(getComputedStyle(byTestId("shipping")).backgroundColor).toBe(
      resolve("backgroundColor", "var(--tide-bg-hover)"),
    );
    expect(getComputedStyle(byTestId("shipping")).transitionDuration).toBe("0s");
    // hover 배경 위 chevron은 text-default다(neutral subtle 위 글자 대비 쌍).
    expect(getComputedStyle(chevron).color).toBe(resolve("color", "var(--tide-text-default)"));
    // 비활성 트리거는 hover 배경이 없고 chevron도 흐린 채다.
    await userEvent.hover(page.getByTestId("archive"), { force: true });
    expect(getComputedStyle(byTestId("archive")).backgroundColor).toBe(transparent);
    expect(getComputedStyle(byTestId("archive").querySelector("svg") as SVGElement).color).toBe(
      resolve("color", "var(--tide-text-disabled)"),
    );
  });
});

describe("chevron motion", () => {
  test("펼치면 chevron이 180° 돌고, 움직임 줄이기가 아니면 fast(150ms)로 돈다. 패널 높이 전환은 없다", async () => {
    await render(<Example />);
    const chevron = (): SVGElement => byTestId("shipping").querySelector("svg") as SVGElement;
    expect(getComputedStyle(chevron()).rotate).toBe("none");
    // 패널에는 전환이 없다(펼치면 바로 보인다).
    expect(getComputedStyle(byTestId("panel-shipping")).transitionDuration).toBe("0s");
    if (reducedMotion()) {
      expect(getComputedStyle(chevron()).transitionDuration).toBe("0s");
      await userEvent.click(page.getByTestId("shipping"));
      // 움직임 줄이기: 바로 돈 상태다.
      expect(chevron().getAnimations()).toHaveLength(0);
      expect(getComputedStyle(chevron()).rotate).toBe("180deg");

      return;
    }
    expect(getComputedStyle(chevron()).transitionProperty).toBe("rotate");
    expect(getComputedStyle(chevron()).transitionDuration).toBe("0.15s");
    // 펼친 순간에 도는 전환을 붙잡는다. click 명령이 돌아온 뒤에 읽으면 부하에 따라 전환이 끝나 있다(test/motion.ts).
    const expanded = captureWhen(
      () => byTestId("shipping").getAttribute("aria-expanded") === "true",
      () =>
        byTestId("shipping")
          .getAnimations({ subtree: true })
          .map((animation) => (animation as CSSTransition).transitionProperty),
    );
    await userEvent.click(page.getByTestId("shipping"));
    const animations = await expanded;
    expect(animations).toEqual(["rotate"]);
    // 패널은 이미 보인다.
    await expect.element(page.getByRole("region", { name: "배송" })).toBeVisible();
    await wait(250);
    expect(getComputedStyle(chevron()).rotate).toBe("180deg");
  });
});

describe("ref·className·타입", () => {
  test("ref는 각 요소(트리거는 버튼)에 닿고 className이 기본 class를 이긴다", async () => {
    const rootRef = vi.fn();
    const itemRef = vi.fn();
    const triggerRef = vi.fn();
    const panelRef = vi.fn();
    await render(
      <Accordion defaultValue={["a"]} ref={rootRef} className="rounded-none" data-testid="root">
        <AccordionItem value="a" ref={itemRef} className="px-2" data-testid="item">
          <AccordionTrigger ref={triggerRef} className="py-1" data-testid="trigger">
            첫째
          </AccordionTrigger>
          <AccordionPanel ref={panelRef} className="p-6" data-testid="panel">
            내용
          </AccordionPanel>
        </AccordionItem>
      </Accordion>,
    );
    expect(rootRef).toHaveBeenCalledWith(byTestId("root"));
    expect(itemRef).toHaveBeenCalledWith(byTestId("item"));
    expect(triggerRef).toHaveBeenCalledWith(byTestId("trigger"));
    expect(byTestId("trigger").tagName).toBe("BUTTON");
    expect(panelRef).toHaveBeenCalledWith(byTestId("panel"));
    expect(getComputedStyle(byTestId("root")).borderTopLeftRadius).toBe("0px");
    expect(getComputedStyle(byTestId("item")).paddingLeft).toBe("8px");
    expect(getComputedStyle(byTestId("trigger")).paddingTop).toBe("4px");
    expect(getComputedStyle(byTestId("panel")).padding).toBe("24px");
  });

  test("앱의 onClick도 불리고 펼침도 바뀐다", async () => {
    const onClick = vi.fn();
    await render(
      <Accordion>
        <AccordionItem value="a">
          <AccordionTrigger onClick={onClick}>첫째</AccordionTrigger>
          <AccordionPanel>내용</AccordionPanel>
        </AccordionItem>
      </Accordion>,
    );
    await userEvent.click(page.getByRole("button", { name: "첫째" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    await expect
      .element(page.getByRole("button", { name: "첫째" }))
      .toHaveAttribute("aria-expanded", "true");
  });

  test("Accordion·AccordionItem 밖의 부분 Component는 오류를 던진다", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(render(<AccordionItem value="a" />)).rejects.toThrow(
      "AccordionItem는 Accordion 안에 둔다.",
    );
    await expect(render(<AccordionPanel />)).rejects.toThrow(
      "AccordionPanel는 AccordionItem 안에 둔다.",
    );
    error.mockRestore();
  });

  test("지원하지 않는 값은 타입 오류다", () => {
    // @ts-expect-error -- 값은 문자열 목록이다(단일 펼침도 목록).
    const single: AccordionProps = { value: "a" };
    // @ts-expect-error -- React Aria 이름(allowsMultipleExpanded)은 드러내지 않는다. multiple을 쓴다.
    const aria: AccordionProps = { allowsMultipleExpanded: true };
    // @ts-expect-error -- 항목은 value가 필수다.
    const missing: AccordionItemProps = { children: "항목" };
    // @ts-expect-error -- React Aria 이름(isDisabled)은 드러내지 않는다. disabled를 쓴다.
    const disabled: AccordionItemProps = { value: "a", isDisabled: true };
    // @ts-expect-error -- 제목 단계는 1~6이다.
    const level: AccordionTriggerProps = { level: 7 };
    // @ts-expect-error -- 트리거 id는 패널과 잇도록 자동으로 만든다.
    const triggerId: AccordionTriggerProps = { id: "trigger" };
    // @ts-expect-error -- 패널 역할은 region·group이다.
    const role: AccordionPanelProps = { role: "dialog" };
    // @ts-expect-error -- 패널을 숨기는 것은 펼침 상태가 정한다.
    const hidden: AccordionPanelProps = { hidden: true };
    expect([single, aria, missing, disabled, level, triggerId, role, hidden]).toHaveLength(8);
  });
});
