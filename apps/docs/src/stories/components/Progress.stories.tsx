import type { Meta, StoryObj } from "@storybook/react-vite";
import { Progress, type Role, Spinner } from "@tide-design/components";

// Progress 문서의 예시. 모든 예시(Do/Don't 포함)는 story로 두고 MDX에서 Canvas로 보여 준다.
// story는 문서·렌더·a11y만 맡는다. 동작 단언(역할·값·이름, 움직임 줄이기)은 components의 `Progress.test.tsx`에 있다.

const roles = ["neutral", "primary", "success", "warning", "danger", "info"] as const;

// Storybook의 Meta 타입은 이름(aria-label | aria-labelledby) union props를 풀지 못한다.
// story에서는 평평한 args 타입을 쓴다. 실제 타입 제약은 components의 `Progress.test.tsx`가 단언한다.
interface ProgressStoryArgs {
  value: number;
  max?: number;
  size?: "sm" | "md";
  color?: Role;
  "aria-label": string;
}

const meta = {
  title: "Component/Progress",
  component: Progress,
  args: {
    value: 40,
    max: 100,
    size: "md",
    color: "primary",
    "aria-label": "업로드",
  },
  // react-docgen이 `Extract<...>` 별칭을 풀지 못한다. 선택지와 타입을 직접 적는다.
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100 }, table: { type: { summary: "number" } } },
    max: {
      control: "number",
      table: { type: { summary: "number" }, defaultValue: { summary: "100" } },
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md"],
      table: { type: { summary: '"sm" | "md"' }, defaultValue: { summary: '"md"' } },
    },
    color: {
      control: "select",
      options: roles,
      table: { type: { summary: "Role" }, defaultValue: { summary: '"primary"' } },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<ProgressStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 기본: 40%, md, primary */
export const Basic: Story = {
  name: "기본",
};

/** 보이는 라벨과 값 글자를 함께 둔다. 라벨은 aria-labelledby로 이름이 된다. */
export const WithLabel: Story = {
  name: "보이는 라벨과 값",
  render: () => (
    <div className="flex flex-col gap-2 text-label-md text-default">
      <div className="flex justify-between">
        <span id="upload-label">사진 업로드</span>
        <span className="text-muted">10장 중 3장</span>
      </div>
      <Progress value={3} max={10} aria-labelledby="upload-label" aria-valuetext="10장 중 3장" />
    </div>
  ),
};

/** size 2개 */
export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-col gap-4">
      <Progress value={60} size="sm" aria-label="sm" />
      <Progress value={60} size="md" aria-label="md" />
    </div>
  ),
};

/** color: Role 6개 */
export const Colors: Story = {
  name: "color(Role)",
  render: () => (
    <div className="flex flex-col gap-4">
      {roles.map((role, index) => (
        <Progress key={role} value={20 + index * 15} color={role} aria-label={role} />
      ))}
    </div>
  ),
};

/** Do: 얼마나 남았는지 알 수 있을 때 쓰고, 이름을 붙인다. */
export const DoNameIt: Story = {
  name: "Do: 무엇의 진행인지 이름을 붙인다",
  render: () => (
    <div className="flex flex-col gap-2 text-label-md text-default">
      <span id="backup-label">백업 진행률</span>
      <Progress value={72} aria-labelledby="backup-label" />
    </div>
  ),
};

/** Don't: 얼마나 남았는지 모르는데 Progress를 쓴다. 그때는 Spinner를 쓴다. */
export const DontUnknownProgress: Story = {
  name: "Don't: 값을 모르는데 Progress를 쓴다",
  render: () => (
    <div className="flex flex-col gap-4 text-label-md text-default">
      <Progress value={50} aria-label="서버 응답 기다리는 중" />
      <span className="flex items-center gap-2">
        <Spinner aria-label="서버 응답 기다리는 중" />
        대신 Spinner를 씁니다
      </span>
    </div>
  ),
};
