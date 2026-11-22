import type { ContrastExclusion } from "@tide-design/foundation";
import type { ReactElement } from "react";

type Token = ContrastExclusion["token"];

/** `border-<Role>-subtle`에서 Role을 꺼낸다. */
const subtleRole = (token: Token): string => token.slice("border-".length, -"-subtle".length);

/** 제외 Token 묶음이 실제로 쓰이는 모양. 모르는 묶음은 그리지 않는다. */
// class는 문자열 그대로 적는다. Tailwind가 소스를 스캔해 class를 만든다.
export function ExclusionDemo({ tokens }: { tokens: readonly Token[] }): ReactElement | null {
  const [first] = tokens;

  if (first === "border-default") {
    return (
      <ul className="w-full">
        {["첫 항목", "둘째 항목", "셋째 항목"].map((label) => (
          <li key={label} className="border-b border-default py-1 last:border-b-0">
            {label}
          </li>
        ))}
      </ul>
    );
  }

  if (first === "border-raised") {
    return (
      <div className="rounded-lg border border-raised bg-raised px-4 py-3 shadow-md">raised</div>
    );
  }

  if (first === "bg-disabled" || first === "text-disabled") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-md bg-disabled px-3 py-1.5 text-disabled"
        >
          저장
        </button>
        <input
          disabled
          aria-label="비활성 입력창"
          value="입력값"
          readOnly
          className="w-24 cursor-not-allowed rounded-md border border-default bg-disabled px-2 py-1.5 text-disabled"
        />
      </div>
    );
  }

  if (first === "bg-overlay") {
    return (
      <div aria-hidden="true" className="relative h-20 w-full overflow-hidden rounded-md">
        <div className="flex flex-col gap-2 p-3">
          <span className="h-2 w-3/4 rounded-sm bg-inset" />
          <span className="h-2 w-1/2 rounded-sm bg-inset" />
          <span className="h-2 w-2/3 rounded-sm bg-inset" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-overlay">
          <span className="h-10 w-20 rounded-lg border border-raised bg-raised shadow-lg" />
        </div>
      </div>
    );
  }

  if (first?.endsWith("-subtle")) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {tokens.map((token) => (
          <span
            key={token}
            data-color={subtleRole(token)}
            className="rounded-md border border-accent-subtle bg-accent-subtle px-2 py-0.5 text-accent-on-subtle"
          >
            {subtleRole(token)}
          </span>
        ))}
        <span className="focus-ring rounded-md px-2 py-0.5 text-primary">halo</span>
      </div>
    );
  }

  return null;
}
