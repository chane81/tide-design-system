import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spinner } from "@tide-design/components";

const meta = {
  title: "Component/Spinner",
  component: Spinner,
  args: {
    size: "md",
  },
  // react-docgen이 `Extract<...>` 별칭을 풀지 못한다. 선택지와 타입을 직접 적는다.
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["xs", "sm", "md", "lg"],
      table: {
        type: { summary: '"xs" | "sm" | "md" | "lg"' },
        defaultValue: { summary: '"md"' },
      },
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

// 예시용 네이티브 버튼 모양.
const buttonClass =
  "inline-flex h-8 items-center gap-2 rounded-md bg-primary-solid px-3 text-label-sm text-on-solid";

/** 기본: md(16px), 이름 「로딩 중」 */
export const Basic: Story = {
  name: "기본",
};

/** size마다 같은 size Component의 텍스트 옆 아이콘 크기다. */
export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex items-center gap-6">
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex items-center gap-2">
          <Spinner size={size} aria-label={`${size} 로딩 중`} />
          <span className="text-label-md text-muted">{size}</span>
        </div>
      ))}
    </div>
  ),
};

/** 무엇을 불러오는지 이름에 적는다. */
export const Label: Story = {
  name: "이름 바꾸기",
  args: {
    "aria-label": "댓글 불러오는 중",
  },
};

/** 보이는 텍스트를 이름으로 쓴다. */
export const LabelledBy: Story = {
  name: "보이는 텍스트를 이름으로",
  render: () => (
    <div className="flex items-center gap-2">
      <Spinner aria-labelledby="payment-status" />
      <span id="payment-status" className="text-body-md">
        결제를 확인하고 있습니다
      </span>
    </div>
  ),
};

/** 글자색을 따른다. 색은 className에 글자색 Semantic Token을 준다. */
export const WithColor: Story = {
  name: "글자색 따르기",
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner aria-label="기본 글자색 로딩 중" />
      <Spinner className="text-muted" aria-label="muted 로딩 중" />
      <Spinner className="text-primary" aria-label="primary 로딩 중" />
    </div>
  ),
};

/** 버튼 안에서는 같은 size의 텍스트 옆 아이콘 자리에 둔다. */
export const InButton: Story = {
  name: "버튼 안에서",
  render: () => (
    <button type="button" className={buttonClass}>
      <Spinner size="sm" aria-hidden="true" />
      저장 중
    </button>
  ),
};

/** Do: 무엇을 불러오는지 이름에 적는다. */
export const DoSpecificLabel: Story = {
  name: "Do: 무엇을 불러오는지 적는다",
  render: () => (
    <section aria-labelledby="comments-title" className="flex flex-col gap-2">
      <h3 id="comments-title" className="text-heading-xs">
        댓글
      </h3>
      <Spinner aria-label="댓글 불러오는 중" />
    </section>
  ),
};

/** Don't: 보이는 텍스트와 이름이 겹친다. 스크린 리더가 「로딩 중」을 두 번 읽는다. */
export const DontDuplicateLabel: Story = {
  name: "Don't: 보이는 텍스트와 이름을 겹친다",
  render: () => (
    <div className="flex items-center gap-2">
      <Spinner />
      <span className="text-body-md">로딩 중</span>
    </div>
  ),
};
