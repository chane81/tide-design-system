import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Field,
  Input,
  Radio,
  RadioGroup,
  Textarea,
} from "@tide-design/components";
import { useState, type ReactElement } from "react";

// Field 문서의 예시. 모든 예시(Do/Don't 포함)는 story로 두고 MDX에서 Canvas로 보여 준다.
// story는 문서·렌더·a11y만 맡는다. 동작 단언은 components의 `Field.test.tsx`, `Input.test.tsx`에 있다.

const meta = {
  title: "Component/Field",
  component: Field,
  args: {
    label: "이메일",
    children: <Input type="email" placeholder="tide@example.com" />,
  },
  argTypes: {
    label: { control: "text", table: { type: { summary: "ReactNode" } } },
    description: { control: "text", table: { type: { summary: "ReactNode" } } },
    error: { control: "text", table: { type: { summary: "ReactNode" } } },
    invalid: { control: "boolean", table: { defaultValue: { summary: "error가 있으면 true" } } },
    required: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    disabled: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    htmlFor: { control: "text", table: { defaultValue: { summary: "자동 생성" } } },
    group: { control: false, table: { defaultValue: { summary: "false" } } },
    children: { control: false, table: { type: { summary: "ReactNode" } } },
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 기본: label과 Input */
export const Basic: Story = {
  name: "기본",
};

/** 설명을 붙인다. 입력창 아래에 보이고 함께 읽힌다. */
export const WithDescription: Story = {
  name: "설명",
  args: { description: "로그인할 때 씁니다." },
};

/** 오류 메시지. error가 있으면 오류 상태가 된다. */
export const WithError: Story = {
  name: "오류",
  args: {
    description: "로그인할 때 씁니다.",
    error: "이메일 형식이 아닙니다. @를 넣어 주세요.",
    children: <Input type="email" defaultValue="tide.example.com" />,
  },
};

/** 입력하는 동안 오류를 고치면 오류 상태가 풀린다. */
export const Validation: Story = {
  name: "입력하며 검사하기",
  render: function Validation(): ReactElement {
    const [value, setValue] = useState("tide");
    const error = value.includes("@") ? undefined : "이메일 형식이 아닙니다. @를 넣어 주세요.";

    return (
      <Field label="이메일" error={error}>
        <Input type="email" value={value} onChange={(event) => setValue(event.target.value)} />
      </Field>
    );
  },
};

/** 필수 입력. label 뒤에 *가 보인다. */
export const Required: Story = {
  name: "필수",
  args: { required: true },
};

/** 비활성 */
export const Disabled: Story = {
  name: "비활성",
  args: { disabled: true, children: <Input defaultValue="tide@example.com" /> },
};

/** Textarea에도 같은 방식으로 붙인다. */
export const WithTextarea: Story = {
  name: "Textarea",
  args: {
    label: "문의 내용",
    description: "500자까지 씁니다.",
    children: <Textarea placeholder="무엇이 궁금한가요?" />,
  },
};

/** 폼 하나: Field를 세로로 쌓고 제출 버튼을 둔다. */
export const Form: Story = {
  name: "폼",
  render: () => (
    <form className="flex flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
      <Field label="이름" required>
        <Input name="name" autoComplete="name" />
      </Field>
      <Field label="이메일" description="답장을 받을 주소입니다." required>
        <Input name="email" type="email" autoComplete="email" />
      </Field>
      <Field label="방문 날짜">
        <Input name="date" type="date" />
      </Field>
      <Field label="문의 내용">
        <Textarea name="message" />
      </Field>
      <div>
        <Button type="submit">보내기</Button>
      </div>
    </form>
  ),
};

/** Do: 오류 메시지에 고치는 방법을 적는다. */
export const DoSpecificError: Story = {
  name: "Do: 고치는 방법을 적는다",
  args: {
    label: "비밀번호",
    error: "8자 이상으로 씁니다. 지금 5자입니다.",
    children: <Input type="password" defaultValue="tide1" />,
  },
};

/** Don't: 무엇이 틀렸는지 알 수 없는 오류 메시지 */
export const DontVagueError: Story = {
  name: "Don't: 「잘못된 입력」만 적는다",
  args: {
    label: "비밀번호",
    error: "잘못된 입력입니다.",
    children: <Input type="password" defaultValue="tide1" />,
  },
};

/** Do: label은 항상 보이게 둔다. */
export const DoVisibleLabel: Story = {
  name: "Do: label을 보이게 둔다",
  args: { label: "검색어", children: <Input type="search" placeholder="예: 버튼" /> },
};

/** Don't: placeholder를 label 대신 쓴다. 입력하면 사라지고 이름이 없다. */
export const DontPlaceholderLabel: Story = {
  name: "Don't: placeholder를 label 대신 쓴다",
  // 의도적으로 이름이 없는 입력창이라 a11y 검사를 끈다.
  parameters: { a11y: { test: "off" } },
  render: () => <Input type="search" placeholder="검색어" />,
};

/** 묶음(CheckboxGroup·RadioGroup)에 붙인다. `group`이면 label이 묶음의 이름이 된다. */
export const WithGroup: Story = {
  name: "묶음",
  render: () => (
    <div className="flex flex-col gap-6">
      <Field label="배송 방법" description="주문마다 고릅니다." group>
        <RadioGroup name="shipping" defaultValue="normal">
          <Radio value="normal">일반 배송</Radio>
          <Radio value="fast">빠른 배송</Radio>
        </RadioGroup>
      </Field>
      <Field label="알림 받을 곳" error="하나 이상 고르세요." group>
        <CheckboxGroup>
          <Checkbox name="notify" value="email">
            이메일
          </Checkbox>
          <Checkbox name="notify" value="sms">
            문자
          </Checkbox>
        </CheckboxGroup>
      </Field>
    </div>
  ),
};
