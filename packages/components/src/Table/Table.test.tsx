// Table의 역할·헤더 연결, 행 hover, 모양을 실제 Chromium에서 확인한다(tide-v0-impl 티켓 23).
// 두 instance에서 모두 돈다. 두 번째 instance(forced-colors·reduced-motion)에서는 행 경계가 시스템 색으로 남는지 본다.
import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  type TableHeaderCellProps,
  type TableProps,
  type TableRowProps,
} from "./index";

const forcedColors = (): boolean => matchMedia("(forced-colors: active)").matches;
const transparent = "rgba(0, 0, 0, 0)";

/** CSS 값 하나를 실제로 계산한 결과. Token 변수와 시스템 색 이름을 계산값과 비교할 때 쓴다. */
function resolve(value: string, theme = "light"): string {
  const probe = document.createElement("div");
  probe.dataset["theme"] = theme;
  probe.style.forcedColorAdjust = "none";
  probe.style.borderColor = value;
  document.body.append(probe);
  const resolved = getComputedStyle(probe).borderTopColor;
  probe.remove();

  return resolved;
}

/** 마우스를 표 밖으로 옮긴다. */
async function hoverAway(): Promise<void> {
  const away = document.createElement("div");
  away.style.cssText = "position:fixed;right:0;bottom:0;width:8px;height:8px";
  document.body.append(away);
  await userEvent.hover(away);
  away.remove();
}

const byTestId = (id: string): HTMLElement => page.getByTestId(id).element() as HTMLElement;

/** 요금 표. 열 머리 3개, 행 머리 1개 + 데이터 칸 2개인 본문 행 2개, 합계 바닥 행 1개 */
function PlanTable({ rowProps }: { rowProps?: TableRowProps } = {}) {
  return (
    <div data-theme="light">
      <Table data-testid="table">
        <caption>요금제</caption>
        <TableHead data-testid="head">
          <TableRow data-testid="head-row">
            <TableHeaderCell data-testid="plan-header">요금제</TableHeaderCell>
            <TableHeaderCell>사용자</TableHeaderCell>
            <TableHeaderCell className="tabular-nums text-end">월 요금</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody data-testid="body">
          <TableRow data-testid="body-row" {...rowProps}>
            <TableHeaderCell scope="row" data-testid="row-header">
              기본
            </TableHeaderCell>
            <TableCell data-testid="cell">5명</TableCell>
            <TableCell data-testid="price" className="tabular-nums text-end">
              10,000원
            </TableCell>
          </TableRow>
          <TableRow>
            <TableHeaderCell scope="row">팀</TableHeaderCell>
            <TableCell>20명</TableCell>
            <TableCell className="tabular-nums text-end">111,000원</TableCell>
          </TableRow>
        </TableBody>
        <tfoot>
          <TableRow data-testid="foot-row">
            <TableHeaderCell scope="row">합계</TableHeaderCell>
            <TableCell>25명</TableCell>
            <TableCell className="tabular-nums text-end">121,000원</TableCell>
          </TableRow>
        </tfoot>
      </Table>
    </div>
  );
}

describe("역할과 헤더 연결", () => {
  test("table·rowgroup·row·columnheader·rowheader·cell 역할로 접근성 트리에 나온다", async () => {
    await render(<PlanTable />);
    // caption이 표의 이름이 된다. 머리 칸은 기본 scope="col"이라 열 머리, 본문 행의 scope="row" 머리 칸은 행 머리, td는 칸이다.
    await expect.element(page.getByRole("table", { name: "요금제" })).toMatchAriaInlineSnapshot(`
      - table "요금제":
        - caption: 요금제
        - rowgroup:
          - row "요금제 사용자 월 요금":
            - columnheader "요금제"
            - columnheader "사용자"
            - columnheader "월 요금"
        - rowgroup:
          - row "기본 5명 10,000원":
            - rowheader "기본"
            - cell "5명"
            - cell "10,000원"
          - row "팀 20명 111,000원":
            - rowheader "팀"
            - cell "20명"
            - cell "111,000원"
        - rowgroup:
          - row "합계 25명 121,000원":
            - rowheader "합계"
            - cell "25명"
            - cell "121,000원"
    `);
    expect(page.getByRole("columnheader").elements()).toHaveLength(3);
    expect(page.getByRole("rowheader").elements()).toHaveLength(3);
    expect(page.getByRole("cell").elements()).toHaveLength(6);
  });

  test("요소는 시맨틱 표 요소이고, 칸은 같은 열 번호의 열 머리와 행 안의 행 머리에 이어진다", async () => {
    await render(<PlanTable />);
    expect(byTestId("table").tagName).toBe("TABLE");
    expect(byTestId("head").tagName).toBe("THEAD");
    expect(byTestId("body").tagName).toBe("TBODY");
    expect(byTestId("body-row").tagName).toBe("TR");
    expect(byTestId("row-header").tagName).toBe("TH");
    expect(byTestId("cell").tagName).toBe("TD");
    // 표 모델(HTML table processing model)의 헤더 연결: 같은 열의 열 머리 + 같은 행의 행 머리다.
    // 열 번호(cellIndex)가 열 머리와 같고, 행 머리는 scope="row"로 행 전체를 맡는다.
    const table = byTestId("table") as HTMLTableElement;
    const cell = byTestId("cell") as HTMLTableCellElement;
    const columnHeader = table.tHead!.rows[0]!.cells[cell.cellIndex]!;
    expect(columnHeader.tagName).toBe("TH");
    expect(columnHeader).toHaveTextContent("사용자");
    expect(byTestId("row-header")).toHaveAttribute("scope", "row");
    expect((cell.parentElement as HTMLTableRowElement).cells[0]).toBe(byTestId("row-header"));
  });

  test('머리 칸은 기본 scope="col"이고, scope는 col·row·colgroup·rowgroup만 받는다', async () => {
    await render(<PlanTable />);
    expect(byTestId("plan-header")).toHaveAttribute("scope", "col");
    expect(byTestId("row-header")).toHaveAttribute("scope", "row");
    // @ts-expect-error -- HTML scope 값이 아니면 타입 오류다.
    const wrong: TableHeaderCellProps = { scope: "column" };
    expect(wrong).toBeDefined();
  });

  test("복잡한 표는 id와 headers로 칸을 머리 칸에 직접 잇는다(속성을 그대로 넘긴다)", async () => {
    await render(
      <Table aria-label="분기 매출">
        <TableHead>
          <TableRow>
            <TableHeaderCell id="q1" scope="col">
              1분기
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell headers="q1" data-testid="cell">
              120
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    await expect.element(page.getByRole("table", { name: "분기 매출" })).toBeInTheDocument();
    await expect
      .element(page.getByRole("columnheader", { name: "1분기" }))
      .toHaveAttribute("scope", "col");
    expect(byTestId("cell")).toHaveAttribute("headers", "q1");
  });

  test("Table에는 variant·size 스타일 축이 없다", () => {
    // @ts-expect-error -- 표는 한 가지 모양이다. 스타일 축을 받지 않는다.
    const variant: TableProps = { variant: "striped" };
    // @ts-expect-error -- 크기 축도 없다. 칸 여백은 className으로 바꾼다.
    const size: TableProps = { size: "sm" };
    // 색 축(Role·색 계열)도 없다. `color`는 React 타입의 HTML 전역 속성(문자열)이라 Card처럼 Omit하지 않는다.
    expect([variant, size]).toHaveLength(2);
  });
});

describe("행 hover", () => {
  test("본문 행은 transition 없이 바로 무채색 bg-hover 배경이 된다", async () => {
    await render(<PlanTable />);
    const row = byTestId("body-row");
    // 반복되는 목록 항목 규칙: transition이 없다(움직임 줄이기와 상관없이 0s).
    expect(getComputedStyle(row).transitionDuration).toBe("0s");
    expect(getComputedStyle(row).transitionProperty).toBe("all");
    await hoverAway();
    if (!forcedColors()) expect(getComputedStyle(row).backgroundColor).toBe(transparent);

    await userEvent.hover(byTestId("cell"));
    // 기다리지 않고 바로 읽는다. transition이 있으면 중간 색이 나온다.
    if (!forcedColors()) {
      expect(getComputedStyle(row).backgroundColor).toBe(resolve("var(--tide-bg-hover)"));
    }
    // 마우스가 떠나면 바로 투명으로 돌아온다.
    await hoverAway();
    if (!forcedColors()) expect(getComputedStyle(row).backgroundColor).toBe(transparent);
  });

  test("dark Theme에서도 무채색 bg-hover다", async () => {
    await render(
      <div data-theme="dark">
        <Table>
          <TableBody>
            <TableRow data-testid="row">
              <TableCell data-testid="cell">내용</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>,
    );
    await userEvent.hover(byTestId("cell"));
    if (forcedColors()) return;
    expect(getComputedStyle(byTestId("row")).backgroundColor).toBe(
      resolve("var(--tide-bg-hover)", "dark"),
    );
  });

  test("머리 행(thead)과 바닥 행(tfoot)은 hover로 바뀌지 않는다", async () => {
    await render(<PlanTable />);
    if (forcedColors()) return;
    await userEvent.hover(byTestId("plan-header"));
    expect(getComputedStyle(byTestId("head-row")).backgroundColor).toBe(transparent);
    await userEvent.hover(page.getByRole("cell", { name: "25명" }));
    expect(getComputedStyle(byTestId("foot-row")).backgroundColor).toBe(transparent);
  });

  test("사용자 className의 hover 배경이 기본 hover를 이긴다", async () => {
    await render(<PlanTable rowProps={{ className: "hover:bg-transparent" }} />);
    await userEvent.hover(byTestId("cell"));
    if (forcedColors()) return;
    expect(getComputedStyle(byTestId("body-row")).backgroundColor).toBe(transparent);
  });
});

describe("모양", () => {
  test("표는 부모 너비를 채우고 경계를 합친다. 글자는 body-sm text-default다", async () => {
    await render(
      <div style={{ width: "480px" }}>
        <PlanTable />
      </div>,
    );
    const style = getComputedStyle(byTestId("table"));
    expect(byTestId("table").getBoundingClientRect().width).toBe(480);
    expect(style.borderCollapse).toBe("collapse");
    expect(style.fontSize).toBe("14px");
    expect(style.lineHeight).toBe("20px");
    if (forcedColors()) return;
    expect(style.color).toBe(resolve("var(--tide-text-default)"));
    expect(style.backgroundColor).toBe(transparent);
  });

  test("행은 아래에 border-default 1px 경계가 있다", async () => {
    await render(<PlanTable />);
    const style = getComputedStyle(byTestId("body-row"));
    expect(style.borderBottomWidth).toBe("1px");
    expect(style.borderBottomStyle).toBe("solid");
    if (forcedColors()) return;
    expect(style.borderBottomColor).toBe(resolve("var(--tide-border-default)"));
  });

  test("칸은 높이 40px, 가로 여백 12px, 시작 쪽 정렬이다. 머리 칸은 label-md(500)다", async () => {
    await render(<PlanTable />);
    const cell = getComputedStyle(byTestId("cell"));
    // 높이 40px = 세로 여백 10px × 2 + 줄 높이 20px. 합친 행 경계(1px)의 절반씩은 칸 상자에 더해진다.
    expect(cell.lineHeight).toBe("20px");
    expect(cell.paddingBottom).toBe("10px");
    expect(cell.paddingLeft).toBe("12px");
    expect(cell.paddingRight).toBe("12px");
    expect(cell.paddingTop).toBe("10px");
    expect(cell.textAlign).toBe("start");
    expect(cell.verticalAlign).toBe("middle");
    expect(cell.fontWeight).toBe("400");

    const header = getComputedStyle(byTestId("plan-header"));
    expect(header.paddingTop).toBe("10px");
    expect(header.lineHeight).toBe("20px");
    expect(header.textAlign).toBe("start");
    expect(header.fontWeight).toBe("500");
    expect(header.fontSize).toBe("14px");
    // 행 머리 칸도 본문과 같은 글자색이다(hover 행 위에서 등록된 대비 쌍 안에 있다).
    if (forcedColors()) return;
    expect(getComputedStyle(byTestId("row-header")).color).toBe(
      resolve("var(--tide-text-default)"),
    );
  });

  test("숫자 열은 tabular-nums와 text-end로 자릿수를 맞춘다", async () => {
    await render(<PlanTable />);
    const price = getComputedStyle(byTestId("price"));
    expect(price.fontVariantNumeric).toBe("tabular-nums");
    expect(price.textAlign).toBe("end");
    // 기본 칸은 비례 숫자다.
    expect(getComputedStyle(byTestId("cell")).fontVariantNumeric).toBe("normal");
  });
});

describe("forced-colors", () => {
  test("행 경계가 사라지지 않고 forced-colors에서는 CanvasText다", async () => {
    await render(<PlanTable />);
    const style = getComputedStyle(byTestId("body-row"));
    expect(style.borderBottomWidth).toBe("1px");
    expect(style.borderBottomColor).not.toBe(transparent);
    if (forcedColors()) {
      expect(style.borderBottomColor).toBe(resolve("CanvasText"));
      expect(getComputedStyle(byTestId("cell")).color).toBe(resolve("CanvasText"));
    }
  });
});

describe("공통 API", () => {
  test("부분마다 ref와 나머지 props를 그 요소에 넘기고, className이 기본 class를 이긴다", async () => {
    const nodes: Record<string, Element | null> = {};
    const keep = (name: string) => (element: Element | null) => {
      nodes[name] = element;
    };
    await render(
      <Table ref={keep("table")} id="plans" className="w-auto" data-testid="table">
        <TableHead ref={keep("head")} className="bg-neutral-subtle" data-testid="head">
          <TableRow ref={keep("headRow")}>
            <TableHeaderCell ref={keep("th")} className="px-4" data-testid="th">
              이름
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody ref={keep("body")} className="text-muted" data-testid="body">
          <TableRow ref={keep("row")} className="border-b-0" data-testid="row">
            <TableCell ref={keep("td")} className="py-1 text-center" data-testid="td">
              값
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(nodes["table"]).toBeInstanceOf(HTMLTableElement);
    expect(nodes["head"]).toBeInstanceOf(HTMLTableSectionElement);
    expect(nodes["body"]).toBeInstanceOf(HTMLTableSectionElement);
    expect(nodes["headRow"]).toBeInstanceOf(HTMLTableRowElement);
    expect(nodes["row"]).toBeInstanceOf(HTMLTableRowElement);
    expect(nodes["th"]).toBeInstanceOf(HTMLTableCellElement);
    expect(nodes["td"]).toBeInstanceOf(HTMLTableCellElement);

    expect(byTestId("table")).toHaveAttribute("id", "plans");
    expect(byTestId("table")).not.toHaveClass("w-full");
    expect(byTestId("head")).toHaveClass("bg-neutral-subtle");
    expect(byTestId("body")).toHaveClass("text-muted");
    expect(byTestId("th")).not.toHaveClass("px-3");
    expect(getComputedStyle(byTestId("th")).paddingLeft).toBe("16px");
    expect(byTestId("row")).not.toHaveClass("border-b");
    expect(getComputedStyle(byTestId("row")).borderBottomWidth).toBe("0px");
    expect(byTestId("td")).not.toHaveClass("py-2.5", "text-start");
    expect(getComputedStyle(byTestId("td")).paddingTop).toBe("4px");
    expect(getComputedStyle(byTestId("td")).textAlign).toBe("center");
  });

  test("기본 class가 없는 묶음(thead·tbody)은 className을 주지 않으면 class 속성이 없다", async () => {
    await render(
      <Table>
        <TableHead data-testid="head">
          <TableRow>
            <TableHeaderCell>이름</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody data-testid="body">
          <TableRow>
            <TableCell>값</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(byTestId("head")).not.toHaveAttribute("class");
    expect(byTestId("body")).not.toHaveAttribute("class");
  });
});
