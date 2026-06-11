/** 公開求人のレアリティ仕様 */
export const RARITY = {
  /** ロボット系オペレーターのレアリティ */
  ROBOT: 1,
  /** "エリート" タグと等価 */
  ELITE: 5,
  /** "上級エリート" タグと等価 */
  UPPER_ELITE: 6,
  /** 「星4以上確定」判定の下限 */
  HIGH_RARITY_MIN: 4,
} as const;

/** タグ選択の制限 */
export const RECRUIT_LIMITS = {
  MAX_SELECTED_TAGS: 6,
  WARNING_THRESHOLD: 7,
} as const;

/**
 * OCR API のタイムアウト。
 * クライアント側はサーバー側の Vision API 呼び出しより長く待つ必要がある。
 */
export const OCR_TIMEOUT = {
  CLIENT_MS: 30_000,
  SERVER_MS: 15_000,
} as const;
