import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "@tide-design/components";

const meta = {
  title: "Component/Separator",
  component: Separator,
  args: {
    orientation: "horizontal",
    decorative: false,
  },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
      table: {
        type: { summary: '"horizontal" | "vertical"' },
        defaultValue: { summary: '"horizontal"' },
      },
    },
    decorative: { control: "boolean", table: { defaultValue: { summary: "false" } } },
  },
  decorators: [
    (Story) => (
      <div className="w-80 text-body-md text-default">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Separator>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 기본: 가로, separator 역할 */
export const Basic: Story = {
  name: "기본",
};

/** 주제가 바뀌는 두 묶음 사이 */
export const Horizontal: Story = {
  name: "가로로 나누기",
  render: () => (
    <div>
      <p>계정 정보</p>
      <Separator className="my-3" />
      <p>알림 설정</p>
    </div>
  ),
};

/** 한 줄 안의 항목 사이. 장식이라 decorative를 준다. */
export const Vertical: Story = {
  name: "세로로 나누기",
  render: () => (
    <div className="flex h-6 items-center gap-3">
      <span>도움말</span>
      <Separator orientation="vertical" decorative />
      <span>약관</span>
      <Separator orientation="vertical" decorative />
      <span>개인정보 처리방침</span>
    </div>
  ),
};

/** 보기만 나누는 선 */
export const Decorative: Story = {
  name: "장식용",
  render: () => (
    <div className="flex flex-col gap-3">
      <p>제목</p>
      <Separator decorative />
      <p>바로 이어지는 같은 주제의 본문</p>
    </div>
  ),
};

/** Do: 주제가 바뀌는 곳에만 의미 구분을 쓴다. */
export const DoTopicChange: Story = {
  name: "Do: 주제가 바뀌는 곳에",
  render: () => (
    <div>
      <p>최근 주문</p>
      <Separator className="my-3" />
      <p>추천 상품</p>
    </div>
  ),
};

/** Don't: 목록 항목마다 의미 구분을 넣는다. */
export const DontEveryItem: Story = {
  name: "Don't: 항목마다 선",
  render: () => (
    <div>
      <p>사과</p>
      <Separator className="my-2" />
      <p>배</p>
      <Separator className="my-2" />
      <p>포도</p>
    </div>
  ),
};
