import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, Button, IconButton } from "@tide-design/components";

// Avatar 문서의 예시. 모든 예시(Do/Don't 포함)는 story로 두고 MDX에서 Canvas로 보여 준다.
// story는 문서·렌더·a11y만 맡는다. 동작 단언(이름, 로드 실패 fallback)은 components의 `Avatar.test.tsx`에 있다.

// 예시 사진. 네트워크 없이 그려지도록 SVG data URL로 둔다.
const photo = (from: string, to: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="96" height="96" fill="url(#g)"/><circle cx="48" cy="38" r="18" fill="#fff" fill-opacity=".85"/><rect x="18" y="62" width="60" height="40" rx="30" fill="#fff" fill-opacity=".85"/></svg>`,
  )}`;
const photoA = photo("#3183f5", "#7048e8");
const photoB = photo("#0ca678", "#1098ad");
// 불러오지 못하는 이미지(깨진 데이터)
const broken = "data:image/png;base64,AAAA";

const families = ["gray", "blue", "green", "amber", "red", "cyan", "purple", "mint"] as const;

const meta = {
  title: "Component/Avatar",
  component: Avatar,
  args: {
    alt: "홍길동",
    src: photoA,
    size: "md",
    color: "gray",
  },
  // react-docgen이 `Extract<...>` 별칭을 풀지 못한다. 선택지와 타입을 직접 적는다.
  argTypes: {
    alt: { control: "text", table: { type: { summary: "string" } } },
    src: { control: "text", table: { type: { summary: "string" } } },
    size: {
      control: "inline-radio",
      options: ["xs", "sm", "md", "lg"],
      table: {
        type: { summary: '"xs" | "sm" | "md" | "lg"' },
        defaultValue: { summary: '"md"' },
      },
    },
    color: {
      control: "select",
      options: families,
      table: { type: { summary: "ColorFamilyName" }, defaultValue: { summary: '"gray"' } },
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 기본: 사진, md */
export const Basic: Story = {
  name: "기본",
};

/** 이미지가 없거나 불러오지 못하면 fallback 아이콘이 보인다. */
export const Fallback: Story = {
  name: "fallback",
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar alt="사진 있음" src={photoA} />
      <Avatar alt="사진 없음" />
      <Avatar alt="사진을 불러오지 못함" src={broken} />
    </div>
  ),
};

/** size 4개 */
export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex items-center gap-3">
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <Avatar key={size} alt={`홍길동 ${size}`} size={size} src={photoB} />
      ))}
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <Avatar key={size} alt={`사진 없음 ${size}`} size={size} />
      ))}
    </div>
  ),
};

/** fallback 색: 색 계열 8개. 색에 뜻이 없고, 사람을 구분하는 데 돕는다. */
export const Colors: Story = {
  name: "fallback 색(색 계열)",
  render: () => (
    <div className="flex items-center gap-3">
      {families.map((family) => (
        <Avatar key={family} alt={family} color={family} />
      ))}
    </div>
  ),
};

/** 이름이 옆에 적혀 있으면 장식용(alt="")으로 둔다. */
export const Decorative: Story = {
  name: "이름 옆에(장식용)",
  render: () => (
    <ul className="flex flex-col gap-3 text-body-md text-default">
      <li className="flex items-center gap-2">
        <Avatar alt="" size="sm" src={photoA} />
        홍길동
      </li>
      <li className="flex items-center gap-2">
        <Avatar alt="" size="sm" color="cyan" />
        김철수
      </li>
    </ul>
  ),
};

/** Do: 눌러야 하면 Button이나 IconButton 안에 넣는다. */
export const DoWrapInButton: Story = {
  name: "Do: Button·IconButton으로 감싼다",
  render: () => (
    <div className="flex items-center gap-3">
      <Button variant="ghost">
        <Avatar alt="" size="xs" src={photoA} />
        홍길동
      </Button>
      <IconButton aria-label="내 계정" variant="ghost" size="lg">
        <Avatar alt="" src={photoB} />
      </IconButton>
    </div>
  ),
};

/** Don't: Avatar에 onClick만 단다. */
export const DontOnClick: Story = {
  name: "Don't: Avatar에 onClick만 단다",
  // 의도적으로 키보드로 닿지 않는 클릭 요소라 a11y 검사를 끈다.
  parameters: { a11y: { test: "off" } },
  render: () => <Avatar alt="내 계정" src={photoB} onClick={() => undefined} />,
};
