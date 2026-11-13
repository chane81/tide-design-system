import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleCheckIcon, PlusIcon, SearchIcon, TrashIcon, XIcon } from "@tide-design/icons";

import { IconSearch } from "../../components/IconSearch/index";

// 버튼 모양은 예시용 네이티브 버튼이다.
const meta = {
  title: "Foundation/아이콘",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const row = { display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" } as const;
const cell = { display: "flex", flexDirection: "column", alignItems: "center", gap: 8 } as const;

/** 크기 규칙 표의 값(14·16·20·24px). 렌더된 선 두께는 크기와 무관하게 2px다. */
export const Sizes: Story = {
  name: "크기",
  render: () => (
    <div style={row}>
      {[14, 16, 20, 24].map((size) => (
        <div key={size} style={cell}>
          <PlusIcon size={size} />
          <span style={{ fontSize: 12 }}>{size}px</span>
        </div>
      ))}
    </div>
  ),
};

/** label(굵기 500) 옆은 2px, body(굵기 400) 옆은 1.5px. */
export const StrokeWidths: Story = {
  name: "선 두께",
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        <SearchIcon />
        label 옆: strokeWidth 2(기본값)
      </span>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 14,
          fontWeight: 400,
        }}
      >
        <SearchIcon strokeWidth={1.5} />
        body 옆: strokeWidth 1.5
      </span>
    </div>
  ),
};

/** 텍스트 옆 아이콘은 장식용이다. 기본값 그대로 두면 보조 기술에서 숨는다. */
export const Decorative: Story = {
  name: "장식용 아이콘",
  render: () => (
    <button type="button" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <TrashIcon />
      삭제
    </button>
  ),
};

/** 아이콘만으로 의미를 전할 때는 aria-label로 이름을 준다. role="img"가 붙는다. */
export const Named: Story = {
  name: "이름 있는 아이콘",
  render: () => (
    <p style={{ display: "inline-flex", alignItems: "center", gap: 6, margin: 0 }}>
      <CircleCheckIcon aria-label="완료" />
      배포 작업
    </p>
  ),
};

/** 아이콘만 있는 버튼은 버튼에 이름을 준다. 안의 아이콘은 장식용으로 둔다. */
export const IconOnlyButton: Story = {
  name: "아이콘만 있는 버튼",
  render: () => (
    <button type="button" aria-label="닫기" style={{ display: "inline-flex", padding: 4 }}>
      <XIcon size={20} />
    </button>
  ),
};

/** MDX에 직접 넣으므로 사이드바·문서에서는 숨기고 렌더·a11y 검사에만 쓴다. */
export const Search: Story = {
  name: "검색",
  tags: ["!dev", "!autodocs"],
  render: () => <IconSearch />,
};
