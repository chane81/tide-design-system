import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Field, Switch } from "@tide-design/components";
import { useState, type ReactElement } from "react";

// Switch 문서의 예시. 모든 예시(Do/Don't 포함)는 story로 두고 MDX에서 Canvas로 보여 준다.
// story는 문서·렌더·a11y만 맡는다. 동작 단언은 components의 `Switch.test.tsx`에 있다.

const sizes = ["sm", "md", "lg"] as const;
const roles = ["primary", "neutral", "success", "warning", "danger", "info"] as const;

const meta = {
  title: "Component/Switch",
  component: Switch,
  args: {
    children: "알림 받기",
    size: "md",
    color: "primary",
  },
  // react-docgen이 `Extract<...>` 별칭을 풀지 못한다. 선택지와 타입을 직접 적는다.
  argTypes: {
    children: { control: "text", table: { type: { summary: "ReactNode" } } },
    size: {
      control: "inline-radio",
      options: sizes,
      table: { type: { summary: '"sm" | "md" | "lg"' }, defaultValue: { summary: '"md"' } },
    },
    color: {
      control: "select",
      options: roles,
      table: { type: { summary: "Role" }, defaultValue: { summary: '"primary"' } },
    },
    defaultChecked: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    disabled: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    invalid: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    required: { control: "boolean", table: { defaultValue: { summary: "false" } } },
  },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 기본: md, 꺼짐 */
export const Basic: Story = {
  name: "기본",
};

/** 켜짐·꺼짐 */
export const States: Story = {
  name: "켜짐과 꺼짐",
  render: () => (
    <div className="flex flex-col gap-2">
      <Switch>꺼짐</Switch>
      <Switch defaultChecked>켜짐</Switch>
    </div>
  ),
};

/** size 3개. label 텍스트 스타일도 함께 바뀐다. */
export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-col gap-2">
      {sizes.map((size) => (
        <Switch key={size} size={size} defaultChecked>
          {size} 알림
        </Switch>
      ))}
    </div>
  ),
};

/** 켜진 색은 Role로 고른다. 기본은 primary다. */
export const Colors: Story = {
  name: "색",
  render: () => (
    <div className="flex flex-col gap-2">
      {roles.map((role) => (
        <Switch key={role} color={role} defaultChecked>
          {role}
        </Switch>
      ))}
    </div>
  ),
};

/** 비활성 */
export const Disabled: Story = {
  name: "비활성",
  render: () => (
    <div className="flex flex-col gap-2">
      <Switch disabled>꺼짐 비활성</Switch>
      <Switch disabled defaultChecked>
        켜짐 비활성
      </Switch>
    </div>
  ),
};

/** Field로 설명과 오류를 붙인다. Field의 label이 이름이 된다. */
export const WithField: Story = {
  name: "Field와 함께",
  render: () => (
    <div className="flex max-w-sm flex-col gap-4">
      <Field label="자동 업데이트" description="새 버전을 밤에 설치합니다.">
        <Switch name="autoUpdate" defaultChecked />
      </Field>
      <Field label="약관 동의" error="동의해야 가입할 수 있습니다." required>
        <Switch name="terms" />
      </Field>
    </div>
  ),
};

/** 제어: checked와 onChange로 앱이 상태를 정한다. */
export const Controlled: Story = {
  name: "제어",
  render: function Controlled(): ReactElement {
    const [on, setOn] = useState(false);
    return (
      <div className="flex flex-col gap-2">
        <Switch checked={on} onChange={(event) => setOn(event.target.checked)}>
          다크 모드
        </Switch>
        <p className="text-body-sm text-muted">지금: {on ? "켜짐" : "꺼짐"}</p>
      </div>
    );
  },
};

/** form 안에서 name·value가 그대로 제출된다. */
export const InForm: Story = {
  name: "form 제출",
  render: () => (
    <form className="flex flex-col items-start gap-3" onSubmit={(event) => event.preventDefault()}>
      <Switch name="news" defaultChecked>
        소식 메일 받기
      </Switch>
      <Switch name="ads">광고 메일 받기</Switch>
      <Button type="submit" size="sm">
        저장
      </Button>
    </form>
  ),
};

/** Do: label은 켜졌을 때의 상태를 말한다. */
export const DoStateLabel: Story = {
  name: "Do: label은 켜진 상태를 말한다",
  render: () => <Switch defaultChecked>위치 정보 사용</Switch>,
};

/** Don't: 바로 적용되지 않는 선택에 쓴다. 저장 버튼을 눌러야 반영되면 Checkbox를 쓴다. */
export const DontNeedsSubmit: Story = {
  name: "Don't: 저장을 눌러야 반영되는 선택에 쓴다",
  render: () => (
    <form className="flex flex-col items-start gap-3" onSubmit={(event) => event.preventDefault()}>
      <Switch name="agree">개인정보 수집에 동의합니다</Switch>
      <Button type="submit" size="sm">
        가입
      </Button>
    </form>
  ),
};

/** Don't: label 없이 둔다. 스크린리더가 무엇을 켜는지 알 수 없다. */
export const DontNoLabel: Story = {
  name: "Don't: label 없이 둔다",
  // 의도적으로 이름이 없는 스위치라 a11y 검사를 끈다.
  parameters: { a11y: { test: "off" } },
  render: () => <Switch />,
};
