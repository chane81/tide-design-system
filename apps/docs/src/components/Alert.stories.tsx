import type { Meta, StoryObj } from "@storybook/react-vite";
import { Alert, Button, Link } from "@tide-tds/components";
import { useState } from "react";

// Alert 문서의 예시. 모든 예시(Do/Don't 포함)는 story로 두고 MDX에서 Canvas로 보여 준다.
// story는 문서·렌더·a11y만 맡는다. 동작 단언은 components의 `Alert.test.tsx`에 있다.

const roles = ["neutral", "primary", "success", "warning", "danger", "info"] as const;

const meta = {
  title: "Component/Alert",
  component: Alert,
  args: {
    title: "점검 예정",
    children: "11월 15일 새벽 2시부터 30분 동안 결제를 쓸 수 없습니다.",
    color: "info",
  },
  // react-docgen이 `Role`(interface 키) 별칭을 풀지 못한다. 선택지와 타입을 직접 적는다.
  argTypes: {
    title: { control: "text", table: { type: { summary: "ReactNode" } } },
    children: { control: "text", table: { type: { summary: "ReactNode" } } },
    color: {
      control: "select",
      options: roles,
      table: { type: { summary: "Role" }, defaultValue: { summary: '"info"' } },
    },
    role: {
      control: "inline-radio",
      options: [undefined, "status", "alert"],
      table: { type: { summary: '"alert" | "status"' }, defaultValue: { summary: "없음" } },
    },
    onClose: { control: false, table: { type: { summary: "() => void" } } },
    closeLabel: { control: "text", table: { defaultValue: { summary: '"닫기"' } } },
  },
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 기본: info, 정적 표시(역할 없음) */
export const Basic: Story = {
  name: "기본",
  render: (args) => <Alert {...args} className="max-w-lg" />,
};

/** 상태 4개. 아이콘 모양이 서로 다르다. */
export const States: Story = {
  name: "상태",
  render: () => (
    <div className="flex max-w-lg flex-col gap-3">
      <Alert color="info" title="안내">
        새 결제 수단은 다음 달부터 쓸 수 있습니다.
      </Alert>
      <Alert color="success" title="저장했습니다">
        변경 사항이 모든 기기에 반영되었습니다.
      </Alert>
      <Alert color="warning" title="저장 공간이 부족합니다">
        120GB 중 110GB를 쓰고 있습니다.
      </Alert>
      <Alert color="danger" title="결제하지 못했습니다">
        카드 유효 기간이 지났습니다. 결제 수단을 바꿔 주세요.
      </Alert>
    </div>
  ),
};

/** 상태가 아닌 일반 알림. info와 같은 아이콘이다. */
export const OtherRoles: Story = {
  name: "일반 알림(neutral·primary)",
  render: () => (
    <div className="flex max-w-lg flex-col gap-3">
      <Alert color="neutral" title="읽기 전용">
        이 문서는 보관된 상태라 고칠 수 없습니다.
      </Alert>
      <Alert color="primary" title="새 기능">
        대시보드에서 팀 사용량을 볼 수 있습니다.
      </Alert>
    </div>
  ),
};

/** 제목만, 본문만 */
export const TitleOrBody: Story = {
  args: {
    children: "11월 15일 새벽 2시부터 30분 동안 결제를 쓸 수 없습니다.1231",
  },

  name: "제목만·본문만",

  render: () => (
    <div className="flex max-w-lg flex-col gap-3">
      <Alert color="success" title="초대 메일을 보냈습니다" />
      <Alert color="info">초대받은 사람은 7일 안에 수락해야 합니다.</Alert>
    </div>
  ),
};

/** 본문에 목록과 같은 Role의 Link를 넣는다. */
export const RichContent: Story = {
  name: "목록과 링크",
  render: () => (
    <Alert color="danger" title="입력을 확인해 주세요" className="max-w-lg">
      <ul className="list-disc ps-5">
        <li>이메일 형식이 아닙니다.</li>
        <li>비밀번호는 8자 이상입니다.</li>
      </ul>
      <p className="mt-1">
        도움이 필요하면{" "}
        <Link href="#help" color="danger">
          고객 센터
        </Link>
        에 문의하세요.
      </p>
    </Alert>
  ),
};

function DismissibleExample() {
  const [open, setOpen] = useState(true);
  return open ? (
    <Alert
      color="primary"
      title="새 기능"
      onClose={() => setOpen(false)}
      closeLabel="새 기능 알림 닫기"
      className="max-w-lg"
    >
      대시보드에서 팀 사용량을 볼 수 있습니다.
    </Alert>
  ) : (
    <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
      다시 보이기
    </Button>
  );
}

/** 닫기: onClose를 주면 닫기 버튼이 생긴다. 빼는 일은 앱이 한다. */
export const Dismissible: Story = {
  name: "닫기",
  render: () => <DismissibleExample />,
};

function LiveRegionExample() {
  const [result, setResult] = useState<"idle" | "saved" | "failed">("idle");
  return (
    <div className="flex max-w-lg flex-col gap-3">
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setResult("saved")}>
          저장 성공 흉내
        </Button>
        <Button size="sm" variant="outline" color="danger" onClick={() => setResult("failed")}>
          저장 실패 흉내
        </Button>
      </div>
      {result === "saved" && <Alert color="success" role="status" title="저장했습니다" />}
      {result === "failed" && (
        <Alert color="danger" role="alert" title="저장하지 못했습니다">
          네트워크 연결을 확인하고 다시 시도해 주세요.
        </Alert>
      )}
    </div>
  );
}

/** 사용자 동작 뒤에 새로 나타나는 Alert는 role로 알린다. */
export const LiveRegion: Story = {
  name: "동작 뒤에 알리기(role)",
  render: () => <LiveRegionExample />,
};

/** Do: 상태를 제목 텍스트로 말한다. */
export const DoStateInText: Story = {
  name: "Do: 상태를 텍스트로",
  render: () => (
    <Alert color="danger" title="결제하지 못했습니다" className="max-w-lg">
      카드 유효 기간이 지났습니다.
    </Alert>
  ),
};

/** Do: 본문 링크는 Alert와 같은 Role로 칠한다. */
export const DoLinkSameRole: Story = {
  name: "Do: 링크는 같은 Role로",
  render: () => (
    <Alert color="warning" title="저장 공간이 부족합니다" className="max-w-lg">
      <Link href="#plan" color="warning">
        요금제 바꾸기
      </Link>
    </Alert>
  ),
};

/** Don't: 처음부터 있는 Alert에 role="alert"를 붙인다. */
export const DontStaticAlertRole: Story = {
  name: "Don't: 처음부터 있는 Alert에 role",
  render: () => (
    <Alert color="info" role="alert" title="점검 예정" className="max-w-lg">
      11월 15일 새벽 2시에 점검합니다.
    </Alert>
  ),
};

/** Don't: 무엇이 잘못됐는지 말하지 않고 색·아이콘에 맡긴다. */
export const DontColorOnly: Story = {
  name: "Don't: 색과 아이콘에 맡기기",
  render: () => (
    <Alert color="danger" className="max-w-lg">
      다시 시도해 주세요.
    </Alert>
  ),
};
