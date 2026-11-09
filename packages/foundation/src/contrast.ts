/** 함께 쓰이는 글자(또는 경계)와 배경의 짝. Utility class 이름으로 적는다. */
export interface ContrastPair {
  readonly foreground: string;
  readonly background: string;
  /** 텍스트는 4.5, UI 경계와 포커스는 3 */
  readonly minRatio: 4.5 | 3;
}

// 대비 쌍 목록. light와 dark에서 모두 검사한다. 목록과 검사는 컬러 Foundation(04)에서 채운다.
export const contrastPairs: readonly ContrastPair[] = [];
