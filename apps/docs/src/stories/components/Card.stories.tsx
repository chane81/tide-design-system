import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge, Button, Card, Separator } from "@tide-design/components";

const meta = {
  title: "Component/Card",
  component: Card,
  args: {
    children: "결제일은 매월 15일입니다.",
  },
  argTypes: {
    children: { control: "text", table: { type: { summary: "ReactNode" } } },
    render: { control: false, table: { type: { summary: "ReactElement" } } },
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 기본: div, 16px 여백 */
export const Basic: Story = {
  name: "기본",
  render: (args) => (
    <Card {...args} className="max-w-sm">
      <p className="text-body-md">{args.children}</p>
    </Card>
  ),
};

/** 제목·본문·동작을 담는다. article로 렌더해 제목을 이름으로 쓴다. */
export const Article: Story = {
  name: "article로",
  render: () => (
    <Card
      render={<article aria-labelledby="usage-title" />}
      className="flex max-w-sm flex-col gap-3"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 id="usage-title" className="text-heading-xs">
          이번 달 사용량
        </h3>
        <Badge color="warning">한도 80%</Badge>
      </div>
      <p className="text-body-md text-muted">저장 공간 120GB 중 96GB를 쓰고 있습니다.</p>
      <div>
        <Button size="sm" variant="outline">
          요금제 보기
        </Button>
      </div>
    </Card>
  ),
};

/** 목록 항목으로 렌더한다. */
export const List: Story = {
  name: "목록 항목으로",
  render: () => (
    <ul className="flex max-w-sm flex-col gap-2">
      {["디자인 리뷰", "주간 회의", "배포 점검"].map((title) => (
        <Card key={title} render={<li />} className="p-3 text-body-md">
          {title}
        </Card>
      ))}
    </ul>
  ),
};

/** 안쪽 구역을 Separator로 나누고, 여백은 className으로 바꾼다. */
export const Sections: Story = {
  name: "구역 나누기",
  render: () => (
    <Card render={<section aria-label="결제 정보" />} className="max-w-sm p-0">
      <div className="p-4 text-body-md">카드 •••• 4242</div>
      <Separator />
      <div className="p-4 text-body-md text-muted">다음 결제일 11월 15일</div>
    </Card>
  ),
};

/** Do: 관련 내용 한 덩어리를 묶는다. */
export const DoGroupRelated: Story = {
  name: "Do: 관련 내용을 한 덩어리로",
  render: () => (
    <div className="grid max-w-lg grid-cols-2 gap-3">
      <Card className="text-body-md">
        <p className="text-label-md">방문자</p>
        <p className="text-heading-md">1,204</p>
      </Card>
      <Card className="text-body-md">
        <p className="text-label-md">가입</p>
        <p className="text-heading-md">87</p>
      </Card>
    </div>
  ),
};

/** Don't: Card 안에 Card를 겹친다. */
export const DontNested: Story = {
  name: "Don't: Card 안에 Card",
  render: () => (
    <Card className="max-w-sm">
      <Card className="text-body-md">경계가 겹쳐 구역이 흐려집니다.</Card>
    </Card>
  ),
};
