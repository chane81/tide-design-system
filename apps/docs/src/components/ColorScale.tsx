import { Badge, Button, Card, Link, VisuallyHidden } from "@tide-design/components";
import type { ReactElement } from "react";

import {
  colorTileGroups,
  formatChroma,
  type ColorTile,
  type ColorTileGroup,
} from "../libs/colorTiles.ts";

// 색 Token 블록: Primitive 스케일을 Token 원본에서 그린다(spec 「문서 앱」 Token 블록, 티켓 45).
// - 계열마다 카드 하나. 제목은 계열 이름과 그 계열을 쓰는 Role(장식 계열은 「장식」)이다.
// - 11단계를 한 줄의 타일로 두고, 단계·hex·OKLCH 채도를 모두 타일 안에 적는다. 타일 밖에는 글자를 두지 않는다.
// - 타일 바탕과 글자색만 원본 hex로 칠한다. 글자색은 colorTiles.ts의 tileTextColor가 대비가 높은 쪽(4.5:1 이상)을 고른다.
// - 타일 아래 「쓰임」 패널은 실제 Component(color prop)와 accent class로 그린다. 색을 손으로 칠하지 않는다.
// - 좁은 폭에서는 블록 전체가 가로로 스크롤된다(Table 문서의 overflow-x-auto 영역과 같은 방식). 타일이 줄바꿈되지 않아 11칸이 늘 한 줄이다.

// 11칸의 최소 폭. 고정폭 hex(`#f0f6fe`)가 caption 크기로 타일 여백 안에 들어가는 폭이다.
// white·black 카드도 같은 격자라 두 타일이 계열 타일과 같은 폭이다.
const tileGridClass = "grid grid-cols-[repeat(11,minmax(4.5rem,1fr))] gap-1.5";

function Tile({ tile, prefix }: { tile: ColorTile; prefix: string | null }): ReactElement {
  return (
    <li
      className="flex min-h-24 min-w-0 flex-col justify-end gap-0.5 rounded-lg border border-default p-2"
      style={{ backgroundColor: tile.hex, color: tile.text }}
      data-testid="color-tile"
    >
      <span className="text-label-md font-semibold">
        {/* 타일에는 단계만 보이므로 스크린리더에는 전체 이름(`blue-50`)을 읽힌다. */}
        {prefix && <VisuallyHidden>{prefix}-</VisuallyHidden>}
        {tile.label}
      </span>
      <span className="font-mono text-caption">{tile.hex}</span>
      <span className="font-mono text-caption">
        <abbr title="OKLCH 채도">C</abbr> {formatChroma(tile.hex)}
      </span>
    </li>
  );
}

// 계열로 칠한 견본. Role 계열은 Role 이름으로 Badge·Button·Link를, 장식 계열은 계열 이름을 받는 Badge와 accent 글자를 둔다.
function Samples({ group }: { group: ColorTileGroup }): ReactElement | null {
  const { role, family } = group;
  if (role === null || family === null) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-md border border-default p-3">
      <span className="text-label-sm text-muted">쓰임</span>
      {role === "장식" ? (
        <>
          <Badge color={family} variant="faint">
            분류
          </Badge>
          <Badge color={family} variant="subtle">
            분류
          </Badge>
          <Badge color={family} variant="solid">
            분류
          </Badge>
          <span data-color={family} className="text-body-sm text-accent">
            강조 글자
          </span>
        </>
      ) : (
        <>
          <Badge color={role} variant="faint">
            안내
          </Badge>
          <Badge color={role} variant="subtle">
            확인
          </Badge>
          <Badge color={role} variant="solid">
            완료
          </Badge>
          <Button color={role} variant="solid" size="sm">
            저장
          </Button>
          <Button color={role} variant="subtle" size="sm">
            취소
          </Button>
          <Link color={role} href={`#color-scale-${group.id}`} className="text-body-sm">
            자세히
          </Link>
        </>
      )}
    </div>
  );
}

function ScaleCard({ group }: { group: ColorTileGroup }): ReactElement {
  const headingId = `color-scale-${group.id}`;

  return (
    <Card render={<section aria-labelledby={headingId} />}>
      <h3 id={headingId} className="mb-3 text-body-md">
        <span className="font-semibold">{group.title}</span>
        {group.role && <span className="ml-2 text-muted">{group.role}</span>}
      </h3>
      <ul className={tileGridClass}>
        {group.tiles.map((tile) => (
          <Tile key={tile.name} tile={tile} prefix={group.family} />
        ))}
      </ul>
      <Samples group={group} />
    </Card>
  );
}

/** Primitive 색 스케일. 계열마다 카드 하나에 11단계 타일과 쓰임 견본을 둔다. */
export function ColorScale(): ReactElement {
  return (
    <div className="bg-canvas p-4 text-default">
      {/* 키보드로도 가로 스크롤할 수 있게 포커스와 이름을 준다(Table 문서의 스크롤 영역 안내와 같다). */}
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="색 스케일">
        <div className="flex w-max min-w-full flex-col gap-4">
          {colorTileGroups.map((group) => (
            <ScaleCard key={group.id} group={group} />
          ))}
        </div>
      </div>
    </div>
  );
}
