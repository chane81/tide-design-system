import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, IconButton } from "@tide-design/components";
import { CircleCheckIcon, PlusIcon, SearchIcon, TrashIcon, XIcon } from "@tide-design/icons";

import { IconSearch } from "../../components/IconSearch/index";

const meta = {
  title: "Foundation/아이콘",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const row = { display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" } as const;
const cell = { display: "flex", flexDirection: "column", alignItems: "center", gap: 8 } as const;

/** 크기 규칙 표의 값(14·16·20·24px). 렌더된 선 두께는 크기와 무관하게 1.5px다. */
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

/** 기본은 1.5px, 강조할 때(굵은 글자 옆 등)는 2px. */
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
          fontWeight: 400,
        }}
      >
        <SearchIcon />
        기본: strokeWidth 1.5
      </span>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        <SearchIcon strokeWidth={2} />
        강조(굵은 글자 옆): strokeWidth 2
      </span>
    </div>
  ),
};

/** 텍스트 옆 아이콘은 장식용이다. 기본값 그대로 두면 보조 기술에서 숨는다. */
export const Decorative: Story = {
  name: "장식용 아이콘",
  render: () => (
    <Button variant="outline" color="neutral" startIcon={<TrashIcon />}>
      삭제
    </Button>
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
    <IconButton variant="ghost" color="neutral" aria-label="닫기">
      <XIcon />
    </IconButton>
  ),
};

/** MDX에 직접 넣으므로 사이드바·문서에서는 숨기고 렌더·a11y 검사에만 쓴다. */
export const Search: Story = {
  name: "검색",
  tags: ["!dev", "!autodocs"],
  render: () => <IconSearch />,
};
