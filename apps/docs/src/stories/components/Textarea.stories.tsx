import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field, Input, Textarea } from "@tide-design/components";

const sizes = ["sm", "md", "lg"] as const;

const meta = {
  title: "Component/Textarea",
  component: Textarea,
  args: {
    size: "md",
    rows: 3,
    placeholder: "무엇이 궁금한가요?",
  },
  argTypes: {
    size: {
      control: "inline-radio",
      options: sizes,
      table: { type: { summary: '"sm" | "md" | "lg"' }, defaultValue: { summary: '"md"' } },
    },
    rows: { control: "number", table: { defaultValue: { summary: "3" } } },
    invalid: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    disabled: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    readOnly: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    required: { control: "boolean", table: { defaultValue: { summary: "false" } } },
  },
  render: (args) => (
    <div className="max-w-sm">
      <Field label="문의 내용">
        <Textarea {...args} />
      </Field>
    </div>
  ),
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 기본: md, 3줄 */
export const Basic: Story = {
  name: "기본",
};

/** size 3개. 글자 크기는 같은 size의 Input과 같다. */
export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex max-w-sm flex-col gap-4">
      {sizes.map((size) => (
        <div key={size} className="flex flex-col gap-2">
          <Input size={size} aria-label={`${size} 제목`} placeholder={`${size} 제목`} />
          <Textarea size={size} aria-label={`${size} 내용`} placeholder={`${size} 내용`} />
        </div>
      ))}
    </div>
  ),
};

/** rows로 처음 높이를 정한다. 사용자는 세로로 크기를 바꿀 수 있다. */
export const Rows: Story = {
  name: "줄 수",
  args: { rows: 6 },
};

/** 오류 상태. 보통은 Field의 error로 정한다. */
export const Invalid: Story = {
  name: "오류",
  render: (args) => (
    <div className="max-w-sm">
      <Field label="문의 내용" error="10자 이상 씁니다.">
        <Textarea {...args} defaultValue="문의" />
      </Field>
    </div>
  ),
};

/** 비활성 */
export const Disabled: Story = {
  name: "비활성",
  args: { disabled: true, defaultValue: "보낸 문의는 고칠 수 없습니다." },
};

/** Do: 여러 줄 글에 쓴다. */
export const DoLongText: Story = {
  name: "Do: 여러 줄 글에 쓴다",
  args: { placeholder: "겪은 문제를 순서대로 적어 주세요." },
};

/** Don't: 한 줄 값에 쓴다. 한 줄 값은 Input을 쓴다. */
export const DontShortValue: Story = {
  name: "Don't: 한 줄 값에 쓴다",
  render: () => (
    <div className="max-w-sm">
      <Field label="우편번호">
        <Textarea rows={3} />
      </Field>
    </div>
  ),
};
