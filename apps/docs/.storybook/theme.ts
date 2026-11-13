// 문서 앱의 Theme 상태. `<html data-theme>`를 바꾸고, Docs 컨테이너가 같은 값을 구독한다.
// Theme은 기본이 light이고 OS 설정(prefers-color-scheme)은 따르지 않는다.

export const THEMES = ["light", "dark"] as const;
export type ThemeName = (typeof THEMES)[number];
export const DEFAULT_THEME: ThemeName = "light";

export function toTheme(value: unknown): ThemeName {
  return THEMES.find((theme) => theme === value) ?? DEFAULT_THEME;
}

let current: ThemeName = DEFAULT_THEME;
const listeners = new Set<() => void>();

/** 지금 적용된 Theme. `useSyncExternalStore`의 snapshot으로 쓴다. */
export function getTheme(): ThemeName {
  return current;
}

/** Theme이 바뀔 때 부를 함수를 등록한다. 돌려준 함수로 해제한다. */
export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/**
 * Theme을 바꾸는 유일한 함수. 툴바 decorator와 globals 채널 구독이 함께 쓴다.
 * 전환 순간에는 transition을 꺼서 색이 한꺼번에 바뀌게 한다.
 */
export function applyTheme(theme: ThemeName): void {
  const root = document.documentElement;
  if (root.dataset.theme !== theme) {
    const style = document.createElement("style");
    style.textContent = "*, *::before, *::after { transition: none !important; }";
    document.head.append(style);

    root.dataset.theme = theme;
    // reflow를 강제해 transition 없는 상태로 새 계산값을 확정한 뒤, 다음 frame에 원래대로 돌린다.
    void root.offsetHeight;
    requestAnimationFrame(() => style.remove());
  }
  if (current === theme) return;
  current = theme;
  for (const listener of listeners) listener();
}
