// 내부 서브패스(앱 개발자용 아님).
import { contrastExclusions } from "@tide-design/foundation/internal";
import type { ReactElement } from "react";

import { ExclusionDemo } from "./components/ExclusionDemo";
import { groupExclusions } from "./libs/exclusionGroups";

const groups = groupExclusions(contrastExclusions);

/** 대비 검사에서 뺀 Token을 이유별로 묶어 light·dark 견본과 함께 보여 준다. */
export function ContrastExclusions(): ReactElement {
  return (
    <ul className="grid grid-cols-1 gap-4 bg-canvas p-4 text-default md:grid-cols-2">
      {groups.map((group) => (
        <li key={group.tokens.join()} className="overflow-hidden rounded-lg border border-default">
          <div className="flex">
            {(["light", "dark"] as const).map((theme) => (
              <section
                key={theme}
                data-theme={theme}
                aria-label={theme}
                className="flex min-h-28 flex-1 items-center justify-center bg-canvas p-4 text-default"
              >
                <ExclusionDemo tokens={group.tokens} />
              </section>
            ))}
          </div>
          <div className="flex flex-col gap-2 border-t border-default p-3">
            <div className="flex flex-wrap gap-1">
              {group.tokens.map((token) => (
                <code key={token} className="rounded-sm bg-inset px-1.5 font-mono">
                  {token}
                </code>
              ))}
            </div>
            <p className="text-muted">{group.summary}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
