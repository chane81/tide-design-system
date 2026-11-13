import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@tide-design/components";
import { useState, type ReactElement } from "react";

// Pagination 문서의 예시. 모든 예시(Do/Don't 포함)는 story로 두고 MDX에서 Canvas로 보여 준다.
// story는 문서·렌더·a11y만 맡는다. 동작 단언(랜드마크·이름, aria-current, 이전/다음 이름과 disabled)은
// components의 `Pagination.test.tsx`에 있다.

const meta = {
  title: "Component/Pagination",
  component: Pagination,
  // 부분 Component의 props 표도 함께 보여 준다.
  subcomponents: {
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
  },
  argTypes: {
    children: { control: false, table: { type: { summary: "ReactNode" } } },
  },
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 보일 번호 목록. 처음·끝과 현재 앞뒤 1쪽을 보이고, 그 사이는 생략(null)이다. 이 계산은 앱이 한다. */
function pageRange(current: number, total: number): (number | null)[] {
  const pages = [1, current - 1, current, current + 1, total]
    .filter((value) => value >= 1 && value <= total)
    .filter((value, index, list) => list.indexOf(value) === index);
  return pages.flatMap((value, index) =>
    index > 0 && value - (pages[index - 1] ?? 0) > 1 ? [null, value] : [value],
  );
}

/** URL로 페이지를 바꾸는 예시. 링크마다 `?page=N`이다. */
function LinkPages({ current, total }: { current: number; total: number }): ReactElement {
  return (
    <Pagination>
      <PaginationItem>
        {/* 첫 페이지에서는 disabled. 링크로 렌더해도 aria-disabled와 이동 차단이 붙는다. */}
        <PaginationPrevious render={<a href={`#page=${current - 1}`} />} disabled={current === 1} />
      </PaginationItem>
      {pageRange(current, total).map((value, index) => (
        <PaginationItem key={value ?? `gap-${index}`}>
          {value === null ? (
            <PaginationEllipsis />
          ) : (
            <PaginationLink href={`#page=${value}`} current={value === current}>
              {value}
            </PaginationLink>
          )}
        </PaginationItem>
      ))}
      <PaginationItem>
        <PaginationNext render={<a href={`#page=${current + 1}`} />} disabled={current === total} />
      </PaginationItem>
    </Pagination>
  );
}

/** 기본: 20쪽 중 7쪽. 번호는 링크이고 현재 페이지는 채움으로 보인다. */
export const Basic: Story = {
  name: "기본",
  render: () => <LinkPages current={7} total={20} />,
};

/** 첫 페이지: 이전이 disabled다. 쪽 수가 적으면 생략 없이 모두 보인다. */
export const FirstPage: Story = {
  name: "첫 페이지",
  render: () => <LinkPages current={1} total={3} />,
};

/** 상태로 바꾸기: 링크 대신 button으로 렌더하고 onClick으로 페이지를 바꾼다. */
export const WithState: Story = {
  name: "상태로 페이지 바꾸기",
  render: function Render() {
    const total = 5;
    const [current, setCurrent] = useState(2);
    return (
      <Pagination aria-label="댓글 페이지">
        <PaginationItem>
          <PaginationPrevious
            disabled={current === 1}
            onClick={() => setCurrent((value) => value - 1)}
          />
        </PaginationItem>
        {Array.from({ length: total }, (_, index) => index + 1).map((value) => (
          <PaginationItem key={value}>
            <PaginationLink
              render={<button type="button" onClick={() => setCurrent(value)} />}
              current={value === current}
            >
              {value}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            disabled={current === total}
            onClick={() => setCurrent((value) => value + 1)}
          />
        </PaginationItem>
      </Pagination>
    );
  },
};

/** Do: 처음과 끝에서는 이전/다음을 지우지 않고 disabled로 둔다. 자리가 그대로라 번호가 움직이지 않는다. */
export const DoDisableEdges: Story = {
  name: "Do: 끝에서는 disabled로 둔다",
  render: () => <LinkPages current={5} total={5} />,
};

/** Don't: 현재 페이지(current)를 표시하지 않는다. 화면에서도 스크린리더에서도 지금 어느 쪽인지 알 수 없다. */
export const DontNoCurrent: Story = {
  name: "Don't: 현재 페이지를 표시하지 않는다",
  render: () => (
    <Pagination>
      <PaginationItem>
        <PaginationPrevious />
      </PaginationItem>
      {[1, 2, 3].map((value) => (
        <PaginationItem key={value}>
          <PaginationLink href={`#page=${value}`}>{value}</PaginationLink>
        </PaginationItem>
      ))}
      <PaginationItem>
        <PaginationNext />
      </PaginationItem>
    </Pagination>
  ),
};
