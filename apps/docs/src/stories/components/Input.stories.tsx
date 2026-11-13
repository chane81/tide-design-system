import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Field, Input } from "@tide-design/components";
import { useState, type ReactElement } from "react";

// Input 문서의 예시. 모든 예시(Do/Don't 포함)는 story로 두고 MDX에서 Canvas로 보여 준다.
// story는 문서·렌더·a11y만 맡는다. 동작 단언은 components의 `Input.test.tsx`에 있다.

const sizes = ["sm", "md", "lg"] as const;

const meta = {
  title: "Component/Input",
  component: Input,
  args: {
    size: "md",
    placeholder: "tide@example.com",
  },
  // react-docgen이 `Extract<...>` 별칭을 풀지 못한다. 선택지와 타입을 직접 적는다.
  argTypes: {
    size: {
      control: "inline-radio",
      options: sizes,
      table: { type: { summary: '"sm" | "md" | "lg"' }, defaultValue: { summary: '"md"' } },
    },
    invalid: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    disabled: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    readOnly: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    required: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    type: { control: "text", table: { defaultValue: { summary: '"text"' } } },
  },
  // 모든 예시는 Field 안에 둔다. label이 없는 입력창은 이름이 없다.
  render: (args) => (
    <div className="max-w-sm">
      <Field label="이메일">
        <Input {...args} />
      </Field>
    </div>
  ),
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 기본: md(40px) */
export const Basic: Story = {
  name: "기본",
};

/** size 3개. 같은 size의 Button과 높이가 같다. */
export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-col gap-3">
      {sizes.map((size) => (
        <div key={size} className="flex items-center gap-2">
          <Input size={size} aria-label={`${size} 검색`} placeholder={`${size} 검색`} />
          <Button size={size}>검색</Button>
        </div>
      ))}
    </div>
  ),
};

/** 네이티브 type을 그대로 쓴다. 날짜도 Input 모양이다. */
export const Types: Story = {
  name: "type",
  render: () => (
    <div className="flex max-w-sm flex-col gap-4">
      <Field label="이메일">
        <Input type="email" autoComplete="email" />
      </Field>
      <Field label="비밀번호">
        <Input type="password" autoComplete="current-password" />
      </Field>
      <Field label="인원">
        <Input type="number" min={1} defaultValue={2} />
      </Field>
      <Field label="방문 날짜">
        <Input type="date" />
      </Field>
    </div>
  ),
};

/** 오류 상태. 보통은 Field의 error로 정한다. */
export const Invalid: Story = {
  name: "오류",
  args: { invalid: true, defaultValue: "tide.example.com" },
};

/** 비활성 */
export const Disabled: Story = {
  name: "비활성",
  args: { disabled: true, defaultValue: "tide@example.com" },
};

/** 읽기 전용: 포커스와 복사는 되고 값은 바꿀 수 없다. */
export const ReadOnly: Story = {
  name: "읽기 전용",
  args: { readOnly: true, defaultValue: "tide@example.com" },
};

/** 제어 입력: value와 onChange로 앱이 값을 정한다. */
export const Controlled: Story = {
  name: "제어 입력",
  render: function Controlled(): ReactElement {
    const [value, setValue] = useState("");

    return (
      <div className="flex max-w-sm flex-col gap-2">
        <Field label="닉네임" description={`${value.length}/12자`}>
          <Input maxLength={12} value={value} onChange={(event) => setValue(event.target.value)} />
        </Field>
      </div>
    );
  },
};

/** Do: 날짜는 type="date"로 받는다. */
export const DoDateType: Story = {
  name: 'Do: 날짜는 type="date"로 받는다',
  args: { type: "date", placeholder: undefined },
  render: (args) => (
    <div className="max-w-sm">
      <Field label="생일">
        <Input {...args} />
      </Field>
    </div>
  ),
};

/** Don't: label 없이 둔다. 스크린리더가 무엇을 입력할지 알 수 없다. */
export const DontNoLabel: Story = {
  name: "Don't: label 없이 둔다",
  // 의도적으로 이름이 없는 입력창이라 a11y 검사를 끈다.
  parameters: { a11y: { test: "off" } },
  render: () => <Input placeholder="생일" />,
};
