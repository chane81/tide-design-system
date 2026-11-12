import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "@tide-tds/components";
import { CheckIcon } from "@tide-tds/icons";

// Badge 문서의 예시. 모든 예시(Do/Don't 포함)는 story로 두고 MDX에서 Canvas로 보여 준다.
// story는 문서·렌더·a11y만 맡는다. 동작 단언은 components의 `Badge.test.tsx`에 있다.

const roles = ["neutral", "primary", "success", "warning", "danger", "info"] as const;
const roleLabel: Record<(typeof roles)[number], string> = {
  neutral: "초안",
  primary: "새 기능",
  success: "완료",
  warning: "검토 필요",
  danger: "실패",
  info: "안내",
};

const families = ["gray", "blue", "green", "amber", "red", "cyan", "purple", "mint"] as const;
const familyLabel: Record<(typeof families)[number], string> = {
  gray: "문서",
  blue: "디자인",
  green: "마케팅",
  amber: "영업",
  red: "보안",
  cyan: "데이터",
  purple: "일정",
  mint: "교육",
};

const meta = {
  title: "Component/Badge",
  component: Badge,
  args: {
    children: "완료",
    variant: "subtle",
    size: "md",
    color: "neutral",
  },
  // react-docgen이 `Extract<...>` 별칭을 풀지 못한다. 선택지와 타입을 직접 적는다.
  argTypes: {
    children: { control: "text", table: { type: { summary: "ReactNode" } } },
    variant: {
      control: "inline-radio",
      options: ["subtle", "faint", "solid"],
      table: {
        type: { summary: '"subtle" | "faint" | "solid"' },
        defaultValue: { summary: '"subtle"' },
      },
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md"],
      table: { type: { summary: '"sm" | "md"' }, defaultValue: { summary: '"md"' } },
    },
    color: {
      control: "select",
      options: [...roles, ...families],
      table: {
        type: { summary: "Color(Role | ColorFamilyName)" },
        defaultValue: { summary: '"neutral"' },
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 기본: neutral subtle, md */
export const Basic: Story = {
  name: "기본",
};

/** 상태: Role 6개. 텍스트가 상태를 말하고 색은 뜻을 거든다. */
export const Colors: Story = {
  name: "상태(Role)",
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {roles.map((role) => (
        <Badge key={role} color={role}>
          {roleLabel[role]}
        </Badge>
      ))}
    </div>
  ),
};

/** 분류: 색 계열 8개. 색에 뜻이 없고 같은 분류를 같은 색으로 묶는다. */
export const Families: Story = {
  name: "분류(색 계열)",
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {families.map((family) => (
        <Badge key={family} color={family}>
          {familyLabel[family]}
        </Badge>
      ))}
    </div>
  ),
};

/** subtle, faint, solid */
export const Variants: Story = {
  name: "채움 방식",
  render: () => (
    <div className="flex flex-col gap-3">
      {(["subtle", "faint", "solid"] as const).map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-2">
          {roles.map((role) => (
            <Badge key={role} color={role} variant={variant}>
              {roleLabel[role]}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  ),
};

/** faint: 덜 중요한 표시. 한 목록 안에서는 faint로 맞춘다. */
export const Faint: Story = {
  name: "덜 중요한 표시(faint)",
  render: () => (
    <ul className="flex flex-col gap-2 text-body-md text-default">
      <li className="flex items-center gap-2">
        로그인 화면 개편{" "}
        <Badge variant="faint" color="blue">
          디자인
        </Badge>
      </li>
      <li className="flex items-center gap-2">
        가을 할인 안내문{" "}
        <Badge variant="faint" color="green">
          마케팅
        </Badge>
      </li>
      <li className="flex items-center gap-2">
        신입 온보딩 자료{" "}
        <Badge variant="faint" color="mint">
          교육
        </Badge>
      </li>
    </ul>
  ),
};

/** size 2개 */
export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex items-center gap-3">
      <Badge size="sm" color="success">
        sm 완료
      </Badge>
      <Badge size="md" color="success">
        md 완료
      </Badge>
    </div>
  ),
};

/** 아이콘을 텍스트와 함께 넣는다. 아이콘만 두지 않는다. */
export const WithIcon: Story = {
  name: "아이콘과 함께",
  render: () => (
    <Badge color="success">
      <CheckIcon />
      배포됨
    </Badge>
  ),
};

/** 제목·목록 옆에 붙인다. */
export const InContext: Story = {
  name: "제목 옆에",
  render: () => (
    <ul className="flex flex-col gap-2 text-body-md text-default">
      <li className="flex items-center gap-2">
        결제 API <Badge color="success">정상</Badge>
      </li>
      <li className="flex items-center gap-2">
        알림 서버 <Badge color="warning">지연</Badge>
      </li>
      <li className="flex items-center gap-2">
        검색 색인 <Badge color="danger">중단</Badge>
      </li>
    </ul>
  ),
};

/** Do: 상태를 텍스트로 말한다. */
export const DoTextState: Story = {
  name: "Do: 상태를 텍스트로",
  render: () => (
    <div className="flex items-center gap-2">
      <Badge color="success">승인됨</Badge>
      <Badge color="danger">거절됨</Badge>
    </div>
  ),
};

/** Do: 상태는 Role, 분류는 색 이름 */
export const DoRoleForStatus: Story = {
  name: "Do: 상태는 Role, 분류는 색 이름",
  render: () => (
    <p className="flex items-center gap-2 text-body-md text-default">
      로그인 화면 개편 <Badge color="blue">디자인</Badge>
      <Badge color="success">완료</Badge>
    </p>
  ),
};

/** Don't: 상태를 색 계열 이름으로 칠한다. */
export const DontFamilyForStatus: Story = {
  name: "Don't: 상태를 색 이름으로",
  render: () => (
    <div className="flex items-center gap-2">
      <Badge color="green">완료</Badge>
      <Badge color="red">실패</Badge>
    </div>
  ),
};

/** Don't: 급한 상태를 faint로 낮춘다. */
export const DontFaintForUrgent: Story = {
  name: "Don't: 급한 상태를 faint로",
  render: () => (
    <p className="flex items-center gap-2 text-body-md text-default">
      결제 서버{" "}
      <Badge variant="faint" color="danger">
        중단
      </Badge>
    </p>
  ),
};

/** Don't: 색만 다르고 텍스트가 같다. */
export const DontColorOnly: Story = {
  name: "Don't: 색만으로 구분",
  render: () => (
    <div className="flex items-center gap-2">
      <Badge color="success">상태</Badge>
      <Badge color="danger">상태</Badge>
    </div>
  ),
};

/** Don't: 누를 수 있는 것처럼 쓴다. */
export const DontAsButton: Story = {
  name: "Don't: 버튼처럼",
  render: () => (
    <p className="text-body-md text-default">
      필터: <Badge color="primary">디자인 ×</Badge>
    </p>
  ),
};
