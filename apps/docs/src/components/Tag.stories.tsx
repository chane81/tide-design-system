import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge, Button, Tag, TagGroup, type ColorFamilyName } from "@tide-tds/components";
import { HashIcon } from "@tide-tds/icons";
import { useState, type ReactElement } from "react";
import { expect, userEvent, within } from "storybook/test";

// Tag 문서의 예시. 모든 예시(Do/Don't 포함)는 story로 두고 MDX에서 Canvas로 보여 준다.
// story는 문서·렌더·a11y만 맡는다. 동작 단언(←→·Home/End, Delete·Backspace 제거와 포커스 이동, 지우기 버튼 이름,
// ring, forced-colors)은 components의 `Tag.test.tsx`에 있다.
//
// 키보드 포커스 상태(focus-ring)의 a11y도 보려고 story마다 play에서 Tab으로 첫 태그에 들어간다.

const meta = {
  title: "Component/Tag",
  component: TagGroup,
  // 부분 Component의 props 표도 함께 보여 준다.
  subcomponents: { Tag },
  argTypes: {
    children: { control: false, table: { type: { summary: "ReactNode" } } },
    onRemove: { control: false, table: { type: { summary: "(value: string) => void" } } },
    removeLabel: {
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: '"제거"' } },
    },
  },
  args: { "aria-label": "고른 필터" },
} satisfies Meta<typeof TagGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 캔버스 안 첫 태그에 Tab으로 들어가 키보드 포커스를 둔다. */
async function focusFirstTag(canvasElement: HTMLElement): Promise<void> {
  const canvas = within(canvasElement);
  await userEvent.tab();
  const [first] = canvas.getAllByRole("row");
  await expect(first).toHaveFocus();
}

interface Item {
  readonly value: string;
  readonly label: string;
  readonly color?: ColorFamilyName;
}

const filters: readonly Item[] = [
  { value: "seoul", label: "서울" },
  { value: "under-30", label: "3만 원 이하" },
  { value: "free-shipping", label: "무료 배송" },
  { value: "today", label: "오늘 도착" },
];

/** 지우면 목록에서 빼는 상태 부모. 예시마다 같은 방식을 쓴다. */
function RemovableTags({
  items,
  label,
  removeLabel,
}: {
  readonly items: readonly Item[];
  readonly label: string;
  readonly removeLabel?: string;
}): ReactElement {
  const [tags, setTags] = useState(items);
  return (
    <div className="flex flex-col items-start gap-3">
      <TagGroup
        aria-label={label}
        removeLabel={removeLabel}
        onRemove={(value) => setTags((current) => current.filter((tag) => tag.value !== value))}
      >
        {tags.map((tag) => (
          <Tag key={tag.value} value={tag.value} color={tag.color}>
            {tag.label}
          </Tag>
        ))}
      </TagGroup>
      <Button
        variant="outline"
        color="neutral"
        size="sm"
        disabled={tags.length === items.length}
        onClick={() => setTags(items)}
      >
        되돌리기
      </Button>
    </div>
  );
}

/** 기본: 고른 필터. 지우기 버튼이나 Delete·Backspace로 지우고, 포커스는 옆 태그로 간다. */
export const Basic: Story = {
  name: "기본",
  render: () => <RemovableTags items={filters} label="고른 필터" />,
  play: async ({ canvasElement }) => {
    await focusFirstTag(canvasElement);
  },
};

const categories: readonly Item[] = [
  { value: "design", label: "디자인", color: "blue" },
  { value: "marketing", label: "마케팅", color: "green" },
  { value: "sales", label: "영업", color: "amber" },
  { value: "security", label: "보안", color: "red" },
  { value: "data", label: "데이터", color: "cyan" },
  { value: "docs", label: "문서", color: "gray" },
];

/** 색 계열: 분류마다 뜻 없는 색을 고른다. 기본값은 `gray`다. */
export const Colors: Story = {
  name: "색 계열",
  render: () => <RemovableTags items={categories} label="분류" />,
  play: async ({ canvasElement }) => {
    await focusFirstTag(canvasElement);
  },
};

/** 지우지 않는 태그: `onRemove`가 없으면 지우기 버튼이 없다. 그래도 ←→로 옮겨 다닌다. */
export const ReadOnly: Story = {
  name: "지우지 않는 태그",
  render: (args) => (
    <TagGroup {...args} aria-label="입력한 키워드">
      <Tag value="react">
        <HashIcon />
        react
      </Tag>
      <Tag value="design-system">
        <HashIcon />
        design-system
      </Tag>
      <Tag value="a11y">
        <HashIcon />
        a11y
      </Tag>
    </TagGroup>
  ),
  play: async ({ canvasElement }) => {
    await focusFirstTag(canvasElement);
  },
};

const permissionNames: Record<string, string> = {
  admin: "관리자",
  editor: "편집자",
  viewer: "보기 전용",
};

/** 권한 태그. 관리자 권한은 지울 수 없게 비활성으로 둔다. */
function PermissionTags(): ReactElement {
  const [tags, setTags] = useState(["admin", "editor", "viewer"]);
  return (
    <TagGroup
      aria-label="권한"
      onRemove={(value) => setTags((current) => current.filter((tag) => tag !== value))}
    >
      {tags.map((tag) => (
        <Tag key={tag} value={tag} disabled={tag === "admin"}>
          {permissionNames[tag]}
        </Tag>
      ))}
    </TagGroup>
  );
}

/** 비활성 태그: 흐리게 보이고 지울 수 없으며, 키보드 이동도 건너뛴다. */
export const Disabled: Story = {
  name: "비활성 태그",
  render: () => <PermissionTags />,
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole("row", { name: "편집자" })).toHaveFocus();
  },
};

/** 보이는 제목으로 이름 짓기: `aria-labelledby`로 제목을 묶음 이름으로 쓴다. */
export const Labelled: Story = {
  name: "보이는 제목",
  render: () => (
    <div className="flex flex-col gap-2">
      <h3 id="tag-story-title" className="text-label-md text-default">
        관심 분야
      </h3>
      <TagGroup aria-labelledby="tag-story-title">
        <Tag value="ux">UX 리서치</Tag>
        <Tag value="frontend">프런트엔드</Tag>
      </TagGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await focusFirstTag(canvasElement);
  },
};

/** Do: 사용자가 고르거나 입력한 값을 지울 수 있게 보여 준다. */
export const DoUserValues: Story = {
  name: "Do: 고른 값을 지울 수 있게 보여 준다",
  render: () => <RemovableTags items={filters.slice(0, 3)} label="고른 필터" />,
  play: async ({ canvasElement }) => {
    await focusFirstTag(canvasElement);
  },
};

/** Don't: 바뀌지 않는 상태를 Tag로 보여 준다. 상태는 Badge로 둔다. */
export const DontStatus: Story = {
  name: "Don't: 상태 표시에 Tag를 쓴다",
  render: (args) => (
    <div className="flex flex-col items-start gap-3">
      <TagGroup {...args} aria-label="주문 상태">
        <Tag value="done" color="green">
          배송 완료
        </Tag>
      </TagGroup>
      <p className="text-body-sm text-muted">
        상태는 지우거나 옮겨 다닐 대상이 아니라 Badge로 둡니다:{" "}
        <Badge color="success">배송 완료</Badge>
      </p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await focusFirstTag(canvasElement);
  },
};
