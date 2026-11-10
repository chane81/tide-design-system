import type { Meta, StoryObj } from "@storybook/react-vite";
import { VisuallyHidden } from "@tide-tds/desktop";
import type { ReactElement } from "react";

// VisuallyHidden 문서의 예시. 모든 예시(Do/Don't 포함)는 story로 두고 MDX에서 Canvas로 보여 준다.
// story는 문서·렌더·a11y만 맡는다. 동작 단언은 desktop의 `*.test.tsx`에 있다.
const meta = {
  title: "Component/VisuallyHidden",
  component: VisuallyHidden,
  // props 타입이 `ComponentProps<"span">` 별칭이라 react-docgen이 읽지 못해 표가 빈다. 자주 쓰는 prop만 적는다.
  argTypes: {
    children: {
      description: "보조 기술에 읽힐 텍스트.",
      control: "text",
      table: { type: { summary: "ReactNode" } },
    },
    className: {
      description: "기본 class(`sr-only`) 뒤에 붙는다.",
      control: false,
      table: { type: { summary: "string" } },
    },
  },
} satisfies Meta<typeof VisuallyHidden>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 예시용 닫기 아이콘. 장식이므로 보조 기술에서 숨긴다(아이콘 패키지는 티켓 08). */
function CloseIcon(): ReactElement {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** 아이콘만 있는 버튼에 접근 가능한 이름을 붙인다. */
export const IconButtonName: Story = {
  name: "아이콘 버튼에 이름 붙이기",
  render: () => (
    <button type="button">
      <CloseIcon />
      <VisuallyHidden>닫기</VisuallyHidden>
    </button>
  ),
};

/** 화면에서는 문맥으로 알 수 있는 정보를 보조 기술 사용자에게만 덧붙인다. */
export const SupplementLinkText: Story = {
  name: "링크 문맥 덧붙이기",
  render: () => (
    <div className="flex flex-col gap-2">
      <a href="#notice">
        더 보기<VisuallyHidden> - 공지사항</VisuallyHidden>
      </a>
      <p id="notice" className="text-body-sm text-muted">
        링크가 가리키는 공지사항 영역(예시)
      </p>
    </div>
  ),
};

/** Do: 아이콘 버튼의 이름을 VisuallyHidden으로 준다. */
export const DoNameIconButton: Story = {
  name: "Do: 아이콘 버튼에 이름을 준다",
  render: () => (
    <button type="button">
      <CloseIcon />
      <VisuallyHidden>알림 닫기</VisuallyHidden>
    </button>
  ),
};

/**
 * Don't: 이름 없는 아이콘 버튼. 스크린 리더는 "버튼"이라고만 읽는다.
 * 의도적으로 잘못된 예시라 이 story만 a11y 검사를 끈다.
 */
export const DontUnnamedIconButton: Story = {
  name: "Don't: 이름 없는 아이콘 버튼",
  parameters: {
    a11y: { test: "off" },
  },
  render: () => (
    <button type="button">
      <CloseIcon />
    </button>
  ),
};
