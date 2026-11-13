import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Badge,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tide-design/components";

const meta = {
  title: "Component/Table",
  component: Table,
  subcomponents: { TableHead, TableBody, TableRow, TableHeaderCell, TableCell },
  argTypes: {
    children: { control: false, table: { type: { summary: "ReactNode" } } },
  },
} satisfies Meta<typeof Table>;

export default meta;

type Story = StoryObj<typeof meta>;

const members = [
  { name: "김하늘", role: "관리자", joined: "2026-03-02" },
  { name: "이바다", role: "편집자", joined: "2026-05-18" },
  { name: "박구름", role: "보기 전용", joined: "2026-09-30" },
];

/** 기본: 머리 행과 본문 행. 본문 행에 마우스를 올리면 배경이 바로 바뀐다. */
export const Basic: Story = {
  name: "기본",
  render: (args) => (
    <Table {...args}>
      <caption className="sr-only">팀 구성원</caption>
      <TableHead>
        <TableRow>
          <TableHeaderCell>이름</TableHeaderCell>
          <TableHeaderCell>권한</TableHeaderCell>
          <TableHeaderCell>가입일</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.name}>
            <TableCell>{member.name}</TableCell>
            <TableCell>{member.role}</TableCell>
            <TableCell className="tabular-nums">{member.joined}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

const invoices = [
  { month: "9월", usage: "1,204", amount: "18,060" },
  { month: "10월", usage: "987", amount: "14,805" },
  { month: "11월", usage: "11,530", amount: "172,950" },
];

/** 숫자 열: tabular-nums와 text-end로 자릿수를 맞춘다. 머리 칸도 같은 쪽으로 맞춘다. */
export const Numeric: Story = {
  name: "숫자 열",
  render: () => (
    <Table className="max-w-md">
      <caption className="sr-only">월별 사용량</caption>
      <TableHead>
        <TableRow>
          <TableHeaderCell>월</TableHeaderCell>
          <TableHeaderCell className="text-end">사용량(GB)</TableHeaderCell>
          <TableHeaderCell className="text-end">금액(원)</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.month}>
            <TableCell>{invoice.month}</TableCell>
            <TableCell className="tabular-nums text-end">{invoice.usage}</TableCell>
            <TableCell className="tabular-nums text-end">{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** 행 머리: 본문 행의 첫 칸이 그 행의 이름이면 TableHeaderCell에 scope="row"를 준다. */
export const RowHeaders: Story = {
  name: '행 머리(scope="row")',
  render: () => (
    <Table className="max-w-md">
      <caption className="sr-only">요금제 비교</caption>
      <TableHead>
        <TableRow>
          <TableHeaderCell>요금제</TableHeaderCell>
          <TableHeaderCell className="text-end">사용자</TableHeaderCell>
          <TableHeaderCell className="text-end">저장 공간</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableHeaderCell scope="row">기본</TableHeaderCell>
          <TableCell className="tabular-nums text-end">5명</TableCell>
          <TableCell className="tabular-nums text-end">10GB</TableCell>
        </TableRow>
        <TableRow>
          <TableHeaderCell scope="row">팀</TableHeaderCell>
          <TableCell className="tabular-nums text-end">50명</TableCell>
          <TableCell className="tabular-nums text-end">1TB</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

/** Card 안에서: 보이는 제목을 caption으로 두고, 좁은 화면에서는 가로로 스크롤한다. */
export const InCard: Story = {
  name: "Card 안에서, 가로 스크롤",
  render: () => (
    <Card className="max-w-sm p-0">
      {/* 스크롤 영역은 키보드로도 스크롤할 수 있게 tabIndex와 이름을 준다(axe scrollable-region-focusable). */}
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="최근 배포 표">
        <Table className="min-w-120">
          <caption className="px-3 pt-3 text-start text-label-lg">최근 배포</caption>
          <TableHead>
            <TableRow>
              <TableHeaderCell>버전</TableHeaderCell>
              <TableHeaderCell>상태</TableHeaderCell>
              <TableHeaderCell>배포한 사람</TableHeaderCell>
              <TableHeaderCell className="text-end">걸린 시간</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell className="tabular-nums">0.3.0</TableCell>
              <TableCell>
                <Badge color="success">성공</Badge>
              </TableCell>
              <TableCell>김하늘</TableCell>
              <TableCell className="tabular-nums text-end">2분 14초</TableCell>
            </TableRow>
            <TableRow className="border-b-0">
              <TableCell className="tabular-nums">0.2.1</TableCell>
              <TableCell>
                <Badge color="danger">실패</Badge>
              </TableCell>
              <TableCell>이바다</TableCell>
              <TableCell className="tabular-nums text-end">48초</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  ),
};

/** Do: 표에 이름(caption)을 붙이고 머리 칸을 TableHeaderCell로 둔다. */
export const DoCaption: Story = {
  name: "Do: 이름과 머리 칸을 둔다",
  render: () => (
    <Table className="max-w-sm">
      <caption className="pb-2 text-start text-label-md">운영 시간</caption>
      <TableHead>
        <TableRow>
          <TableHeaderCell>요일</TableHeaderCell>
          <TableHeaderCell>시간</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableHeaderCell scope="row">평일</TableHeaderCell>
          <TableCell className="tabular-nums">09:00–18:00</TableCell>
        </TableRow>
        <TableRow>
          <TableHeaderCell scope="row">토요일</TableHeaderCell>
          <TableCell className="tabular-nums">10:00–14:00</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

/** Don't: 데이터가 아닌 화면 배치(이름표와 값 나란히 놓기)에 표를 쓴다. */
export const DontLayout: Story = {
  name: "Don't: 배치에 표를 쓴다",
  render: () => (
    <Table className="max-w-sm">
      <TableBody>
        <TableRow>
          <TableCell>
            <span className="text-heading-xs">김하늘</span>
          </TableCell>
          <TableCell>
            <Badge>관리자</Badge>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
