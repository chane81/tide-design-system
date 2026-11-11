// 전환 중 값을 결정적으로 읽는 browser 테스트 helper.
//
// 왜 필요한가: 닫기 동작(Escape, rerender, queue.close)을 `await`한 뒤 계산 스타일·도는 transition을 읽으면, 그 사이에
// 렌더링 단계가 돌 수 있다. 부하가 크면 150ms 퇴장이 그 사이에 끝나 요소가 DOM에서 빠지고 `''`를 읽는다
// (Combobox 「바로 나타나고, 닫히면…」, 전체 turbo 실행, 2026-11-12).
//
// 근거(1차 자료):
// - DOM Standard 4.3 Mutation observers: 변경 기록은 "mutation observer microtask"로 알린다. 그래서 callback은 변경을 일으킨
//   task(React commit) 끝의 microtask checkpoint에서, 다음 렌더링 단계보다 먼저 돈다(HTML event loop processing model).
// - Web Animations 1 §4.5.18·§6.13: timeline 시각과 transition 이벤트는 렌더링 단계의 "update animations and send events"에서만
//   나아간다. 같은 task 안에서는 막 만든 transition이 끝날 수 없다.
// - CSS Transitions 1 §6.2: `transitionrun`은 transition이 만들어질 때 생기지만 dispatch는 위 렌더링 단계에서 한다. 렌더링이
//   전환 길이보다 늦으면 run·start·end가 한꺼번에 오고, 그때는 이미 끝난 transition이 `getAnimations()`에 없다. 그래서
//   `transitionrun` 리스너 대신 MutationObserver를 쓴다.
import { expect } from "vitest";

/** 단언에 쓰는 계산 스타일 키. `getComputedStyle` 결과는 live라 나중에 읽으면 바뀌므로 값을 복사해 둔다. */
const styleKeys = [
  "display",
  "opacity",
  "pointerEvents",
  "transitionBehavior",
  "transitionDuration",
  "transitionProperty",
  "transitionTimingFunction",
] as const;

export type StyleSnapshot = Pick<CSSStyleDeclaration, (typeof styleKeys)[number]>;

/** 지금 계산 스타일 중 motion 단언에 쓰는 값을 복사한다. */
export function styleSnapshot(element: Element): StyleSnapshot {
  const style = getComputedStyle(element);
  return Object.fromEntries(styleKeys.map((key) => [key, style[key]])) as StyleSnapshot;
}

/** 도는 transition 하나의 시작(from)·끝(to) keyframe 복사본 */
export interface TransitionSnapshot {
  from: Record<string, unknown>;
  to: Record<string, unknown>;
}

/** 요소에서 도는 CSS transition을 속성 이름으로 찾아, 시작·끝 keyframe을 그 자리에서 복사해 둔다. */
export function transitions(element: Element): Map<string, TransitionSnapshot> {
  const found = new Map<string, TransitionSnapshot>();
  for (const animation of element.getAnimations()) {
    if (!(animation instanceof CSSTransition)) continue;
    const frames = (animation.effect as KeyframeEffect | null)?.getKeyframes() ?? [];
    found.set(animation.transitionProperty, { from: frames[0] ?? {}, to: frames.at(-1) ?? {} });
  }
  return found;
}

/**
 * `condition`이 참이 되는 DOM 변경이 일어나면, 그 변경을 알리는 microtask 안에서 `read`를 돌려 결과를 돌려준다.
 * 상태를 바꾸는 동작(Escape, rerender, click…) **전에** 부르고, 동작을 마친 뒤 결과를 `await`한다.
 * `read`는 렌더링 단계보다 먼저 돌므로, 그때 만든 transition은 아직 끝나지 않았다(위 근거).
 */
export function captureWhen<T>(condition: () => boolean, read: () => T): Promise<T> {
  // 동작 전에 이미 참이면 전환 시작을 붙잡을 수 없다. 테스트를 잘못 쓴 것이다.
  expect(condition(), "captureWhen: 동작 전에 이미 조건이 참이다").toBe(false);
  return new Promise<T>((resolve, reject) => {
    const observer = new MutationObserver(() => {
      if (!condition()) return;
      observer.disconnect();
      try {
        resolve(read());
      } catch (error) {
        reject(error);
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true });
  });
}

/** `element`에서 `data-open`이 빠지는(퇴장 전환이 시작되는) 순간에 `read`를 돌린다. */
export function captureExit<T>(element: Element, read: () => T): Promise<T> {
  return captureWhen(() => !element.hasAttribute("data-open"), read);
}
