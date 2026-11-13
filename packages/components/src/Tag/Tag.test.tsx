// Tag 동작을 실제 Chromium에서 확인한다(tide-v0-impl 티켓 33).
// 두 instance에서 모두 돈다. 두 번째 instance(forced-colors·reduced-motion)에서는 태그 경계가 시스템 색으로 남는지와
// 지우기 아이콘이 버튼 글자색을 따르는지를 본다.
import { useState, type ReactElement } from "react";
import { I18nProvider } from "react-aria";
import { describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { Tag, TagGroup, type TagGroupProps, type TagProps } from "./index.ts";

const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;
const transparent = "rgba(0, 0, 0, 0)";
const wait = (ms: number): Promise<void> => new Promise((done) => setTimeout(done, ms));

/** CSS 값 하나를 실제로 계산한 결과. Token 변수를 계산값과 비교할 때 쓴다. data-color로 accent 슬롯을 고른다. */
function resolve(property: "color" | "backgroundColor", value: string, color?: string): string {
  const probe = document.createElement("div");
  probe.dataset["theme"] = "light";
  if (color) probe.dataset["color"] = color;
  probe.style.forcedColorAdjust = "none";
  if (property === "backgroundColor") probe.style.backgroundColor = value;
  else probe.style.color = value;
  document.body.append(probe);
  const resolved = getComputedStyle(probe)[property];
  probe.remove();

  return resolved;
}

const initial = [
  { value: "design", label: "디자인", color: "blue" },
  { value: "marketing", label: "마케팅", color: "green" },
  { value: "archive", label: "보관", disabled: true },
  { value: "sales", label: "영업" },
] as const;

interface ExampleProps {
  readonly removable?: boolean;
  readonly onRemove?: (value: string) => void;
  readonly group?: Partial<TagGroupProps>;
}

/** 지우면 목록에서 빼는 상태 부모 */
function Example({ removable = true, onRemove, group }: ExampleProps): ReactElement {
  const [tags, setTags] = useState<readonly (typeof initial)[number][]>(initial);

  return (
    <div data-theme="light">
      <button type="button" data-testid="before">
        앞
      </button>
      <TagGroup
        aria-label="고른 분류"
        data-testid="group"
        onRemove={
          removable
            ? (value) => {
                onRemove?.(value);
                setTags((current) => current.filter((tag) => tag.value !== value));
              }
            : undefined
        }
        {...(group as object)}
      >
        {tags.map((tag) => (
          <Tag
            key={tag.value}
            value={tag.value}
            data-testid={tag.value}
            color={"color" in tag ? tag.color : undefined}
            disabled={"disabled" in tag ? tag.disabled : undefined}
          >
            {tag.label}
          </Tag>
        ))}
      </TagGroup>
      <button type="button" data-testid="after">
        뒤
      </button>
    </div>
  );
}

const byTestId = (testId: string): HTMLElement => page.getByTestId(testId).element() as HTMLElement;
const removeButton = (testId: string): HTMLButtonElement =>
  byTestId(testId).querySelector("button") as HTMLButtonElement;
const rows = (): string[] =>
  [...document.querySelectorAll('[role="row"]')].map((row) => row.textContent ?? "");

/** 키보드 입력 방식으로 바꾸려고 앞 버튼에서 Tab을 눌러 묶음에 들어간다. */
async function tabIntoGroup(): Promise<void> {
  byTestId("before").focus();
  await userEvent.tab();
}

describe("역할과 이름", () => {
  test("묶음은 이름 있는 grid, 태그는 row 안 gridcell이고 지우기 버튼은 「제거 + 태그 글자」로 읽힌다", async () => {
    await render(<Example />);
    await expect.element(page.getByRole("grid", { name: "고른 분류" })).toBeInTheDocument();
    expect(page.getByRole("row").elements()).toHaveLength(4);
    expect(page.getByRole("gridcell").elements()).toHaveLength(4);
    await expect
      .element(page.getByRole("button", { name: "제거 디자인" }))
      .toHaveAttribute("type", "button");
    await expect.element(page.getByRole("button", { name: "제거 영업" })).toBeInTheDocument();
    // 지우기 버튼은 Tab 순서에서 빠진다(키보드는 Delete로 지운다).
    expect(removeButton("design")).toHaveAttribute("tabindex", "-1");
    // 태그 행의 이름은 글자다.
    await expect.element(page.getByRole("row", { name: "마케팅" })).toBeInTheDocument();
  });

  test("removeLabel로 버튼 이름 앞부분을 바꾼다", async () => {
    await render(<Example group={{ removeLabel: "지우기" }} />);
    await expect.element(page.getByRole("button", { name: "지우기 디자인" })).toBeInTheDocument();
  });

  test("aria-labelledby로 보이는 제목을 이름으로 쓴다", async () => {
    await render(
      <div>
        <h3 id="tag-title">관심 분야</h3>
        <TagGroup aria-labelledby="tag-title">
          <Tag value="a">가</Tag>
        </TagGroup>
      </div>,
    );
    await expect.element(page.getByRole("grid", { name: "관심 분야" })).toBeInTheDocument();
  });

  test("onRemove가 없으면 지우기 버튼이 없다", async () => {
    await render(<Example removable={false} />);
    expect(page.getByRole("button", { name: /제거/ }).elements()).toHaveLength(0);
  });
});

describe("키보드", () => {
  test("Tab 자리는 태그 하나이고, ←→로 옮기며(끝에서 돈다) 비활성 태그는 건너뛰고 Home·End로 끝에 간다", async () => {
    await render(<Example />);
    await tabIntoGroup();
    await expect.element(page.getByTestId("design")).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(page.getByTestId("marketing")).toHaveFocus();
    // 보관(비활성)은 건너뛴다.
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(page.getByTestId("sales")).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(page.getByTestId("design")).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(page.getByTestId("sales")).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect.element(page.getByTestId("design")).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect.element(page.getByTestId("sales")).toHaveFocus();
    // Tab은 묶음을 떠난다(지우기 버튼에 들르지 않는다).
    await userEvent.tab();
    await expect.element(page.getByTestId("after")).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect.element(page.getByTestId("sales")).toHaveFocus();
  });

  test("RTL locale에서는 ←가 다음 태그다", async () => {
    await render(
      <I18nProvider locale="ar-EG">
        <Example />
      </I18nProvider>,
    );
    await tabIntoGroup();
    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(page.getByTestId("marketing")).toHaveFocus();
  });

  test("Delete로 지우면 다음 태그로 포커스가 옮겨 간다", async () => {
    const onRemove = vi.fn();
    await render(<Example onRemove={onRemove} />);
    await tabIntoGroup();
    await userEvent.keyboard("{Delete}");
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledWith("design");
    expect(rows()).toEqual(["마케팅", "보관", "영업"]);
    await expect.element(page.getByTestId("marketing")).toHaveFocus();
  });

  test("Backspace로도 지우고, 마지막 태그를 지우면 앞 태그로 옮겨 간다(비활성은 건너뛴다)", async () => {
    await render(<Example />);
    await tabIntoGroup();
    await userEvent.keyboard("{End}");
    await expect.element(page.getByTestId("sales")).toHaveFocus();
    await userEvent.keyboard("{Backspace}");
    expect(rows()).toEqual(["디자인", "마케팅", "보관"]);
    await expect.element(page.getByTestId("marketing")).toHaveFocus();
  });

  test("태그를 모두 지우면 묶음(group 역할)에 포커스가 남는다", async () => {
    await render(
      <div>
        <button type="button" data-testid="before">
          앞
        </button>
        <SingleTag />
      </div>,
    );
    await tabIntoGroup();
    await userEvent.keyboard("{Delete}");
    const group = page.getByRole("group", { name: "키워드" });
    await expect.element(group).toHaveFocus();
  });

  test("키보드로 들어온 태그는 Delete 안내를 설명으로 갖는다", async () => {
    await render(<Example />);
    await tabIntoGroup();
    await expect
      .element(page.getByTestId("design"))
      .toHaveAccessibleDescription("Press Delete to remove tag.");
  });

  test("비활성 태그는 aria-disabled이고 지우기 버튼도 비활성이다", async () => {
    const onRemove = vi.fn();
    await render(<Example onRemove={onRemove} />);
    await expect.element(page.getByTestId("archive")).toHaveAttribute("aria-disabled", "true");
    expect(removeButton("archive")).toBeDisabled();
    await userEvent.click(removeButton("archive"), { force: true });
    expect(onRemove).not.toHaveBeenCalled();
  });
});

function SingleTag(): ReactElement {
  const [tags, setTags] = useState(["react"]);

  return (
    <TagGroup
      aria-label="키워드"
      onRemove={(value) => setTags(tags.filter((tag) => tag !== value))}
    >
      {tags.map((tag) => (
        <Tag key={tag} value={tag}>
          {tag}
        </Tag>
      ))}
    </TagGroup>
  );
}

describe("지우기 버튼", () => {
  test("누르면 그 태그를 지우고 옆 태그로 포커스가 옮겨 간다", async () => {
    const onRemove = vi.fn();
    await render(<Example onRemove={onRemove} />);
    await userEvent.click(page.getByRole("button", { name: "제거 마케팅" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledWith("marketing");
    expect(rows()).toEqual(["디자인", "보관", "영업"]);
    // 다음 태그(보관)는 비활성이라 건너뛴다.
    await expect.element(page.getByTestId("sales")).toHaveFocus();
  });

  test("IconButton ghost xs(24×24)이고, 아이콘은 장식용 16px이며 태그 글자색을 따른다", async () => {
    await render(<Example />);
    const button = removeButton("design");
    const rect = button.getBoundingClientRect();
    expect(rect.width).toBe(24);
    expect(rect.height).toBe(24);
    const icon = button.querySelector("svg") as SVGElement;
    expect(icon.closest("[aria-hidden='true']")).not.toBeNull();
    expect(icon.getBoundingClientRect().width).toBe(16);
    // 버튼은 태그 끝에서 3px + border 1px 안쪽, 위아래 가운데다.
    const row = byTestId("design").getBoundingClientRect();
    expect(row.right - rect.right).toBeCloseTo(4, 0);
    expect(rect.top - row.top).toBeCloseTo(4, 0);
    if (forcedColors()) {
      // 고대비 모드에서는 아이콘이 버튼 글자색(시스템 색)을 따른다.
      expect(getComputedStyle(icon).color).toBe(getComputedStyle(button).color);
      expect(getComputedStyle(icon).color).not.toBe(transparent);

      return;
    }
    expect(getComputedStyle(button).color).toBe(resolve("color", "var(--tide-blue-on-subtle)"));
    expect(getComputedStyle(icon).color).toBe(resolve("color", "var(--tide-blue-on-subtle)"));
  });

  test("hover 배경은 태그 색의 subtle-hover다(IconButton의 neutral이 아니다)", async () => {
    if (forcedColors()) return;
    await render(<Example />);
    await userEvent.hover(page.getByRole("button", { name: "제거 디자인" }));
    await wait(200);
    expect(getComputedStyle(removeButton("design")).backgroundColor).toBe(
      resolve("backgroundColor", "var(--tide-blue-subtle-hover)"),
    );
    expect(getComputedStyle(removeButton("design")).borderTopLeftRadius).toBe("4px");
    // 비활성 태그의 버튼은 hover 배경이 없다.
    await userEvent.hover(removeButton("archive"), { force: true });
    await wait(200);
    expect(getComputedStyle(removeButton("archive")).backgroundColor).toBe(transparent);
  });
});

describe("모양과 포커스 표시", () => {
  test("태그는 radius sm(4px), 높이 32px, label-md 글자, 색 계열 subtle 배경 + on-subtle 글자 + 파스텔 테두리다(기본 gray)", async () => {
    await render(<Example />);
    const design = getComputedStyle(byTestId("design"));
    expect(design.borderTopLeftRadius).toBe("4px");
    expect(byTestId("design").getBoundingClientRect().height).toBe(32);
    expect(design.fontSize).toBe("14px");
    expect(design.fontWeight).toBe("500");
    expect(design.paddingLeft).toBe("10px");
    expect(design.paddingRight).toBe("3px");
    expect(byTestId("design")).toHaveAttribute("data-color", "blue");
    expect(byTestId("sales")).toHaveAttribute("data-color", "gray");
    if (forcedColors()) {
      // 투명 경계가 시스템 색으로 보여 배경 없이도 태그 모양이 남는다.
      expect(design.borderTopColor).not.toBe(transparent);
      expect(design.borderTopWidth).toBe("1px");

      return;
    }
    expect(design.backgroundColor).toBe(resolve("backgroundColor", "var(--tide-blue-subtle)"));
    expect(design.color).toBe(resolve("color", "var(--tide-blue-on-subtle)"));
    expect(design.borderTopColor).toBe(resolve("color", "var(--tide-blue-subtle-border)"));
    const sales = getComputedStyle(byTestId("sales"));
    expect(sales.backgroundColor).toBe(resolve("backgroundColor", "var(--tide-gray-subtle)"));
    expect(sales.color).toBe(resolve("color", "var(--tide-gray-on-subtle)"));
    const archive = getComputedStyle(byTestId("archive"));
    expect(archive.backgroundColor).toBe(resolve("backgroundColor", "var(--tide-bg-disabled)"));
    expect(archive.color).toBe(resolve("color", "var(--tide-text-disabled)"));
  });

  test("지우기 버튼이 없으면 끝쪽 여백이 10px다", async () => {
    await render(<Example removable={false} />);
    expect(getComputedStyle(byTestId("design")).paddingRight).toBe("10px");
    expect(byTestId("design").getBoundingClientRect().height).toBe(32);
  });

  test("바깥 data-color를 물려받지 않는다", async () => {
    await render(
      <div data-color="danger">
        <Example />
      </div>,
    );
    expect(byTestId("sales")).toHaveAttribute("data-color", "gray");
  });

  test("Tab으로 태그에 포커스하면 focus-ring(outline 2px, offset 2px)이 보인다", async () => {
    await render(<Example />);
    await tabIntoGroup();
    await expect.element(page.getByTestId("design")).toHaveFocus();
    await wait(250);
    const style = getComputedStyle(byTestId("design"));
    expect(style.outlineStyle).toBe("solid");
    expect(style.outlineWidth).toBe("2px");
    expect(style.outlineOffset).toBe("2px");
    expect(style.outlineColor).not.toBe(transparent);
    if (!forcedColors()) {
      expect(style.outlineColor).toBe(resolve("color", "var(--tide-outline-focus)"));
    }
  });
});

describe("공통 API", () => {
  test("ref는 묶음과 태그의 DOM 요소이고, className은 마지막에 들어가 이긴다", async () => {
    const groupRef = { current: null as HTMLDivElement | null };
    const tagRef = { current: null as HTMLDivElement | null };
    await render(
      <TagGroup aria-label="키워드" ref={groupRef} className="gap-4">
        <Tag value="a" ref={tagRef} className="ps-4">
          가
        </Tag>
      </TagGroup>,
    );
    expect(groupRef.current).toHaveAttribute("role", "grid");
    expect(tagRef.current).toHaveAttribute("role", "row");
    expect(getComputedStyle(groupRef.current as HTMLElement).columnGap).toBe("16px");
    expect(getComputedStyle(tagRef.current as HTMLElement).paddingLeft).toBe("16px");
  });

  test("Fragment·배열 안의 태그도 모은다", async () => {
    await render(
      <TagGroup aria-label="키워드">
        <>
          <Tag value="a">가</Tag>
          {[
            <Tag key="b" value="b">
              나
            </Tag>,
          ]}
        </>
      </TagGroup>,
    );
    expect(rows()).toEqual(["가", "나"]);
  });

  test("지원하지 않는 값은 타입 오류다", () => {
    // @ts-expect-error -- 묶음 이름(aria-label 또는 aria-labelledby)은 필수다.
    const unnamed: TagGroupProps = {};
    // @ts-expect-error -- React Aria 이름(selectionMode)은 드러내지 않는다. Tag는 선택이 없다.
    const selection: TagGroupProps = { "aria-label": "a", selectionMode: "single" };
    // @ts-expect-error -- 태그는 value가 필수다.
    const missing: TagProps = { children: "가" };
    // @ts-expect-error -- React Aria 이름(isDisabled)은 드러내지 않는다. disabled를 쓴다.
    const disabled: TagProps = { value: "a", children: "가", isDisabled: true };
    // @ts-expect-error -- Tag는 뜻 없는 분류 색이라 Role(danger)은 받지 않는다.
    const role: TagProps = { value: "a", children: "가", color: "danger" };
    // @ts-expect-error -- 태그 글자는 필수다.
    const empty: TagProps = { value: "a" };
    const family: TagProps = { value: "a", children: "가", color: "cyan" };
    // 장식 계열 purple·mint도 색 계열이다(ADR 0022 §5).
    const purple: TagProps = { value: "a", children: "가", color: "purple" };
    const mint: TagProps = { value: "a", children: "가", color: "mint" };
    expect([unnamed, selection, missing, disabled, role, empty, family, purple, mint]).toHaveLength(
      9,
    );
  });
});
