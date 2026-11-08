/**
 * Korean handwriting styles with verified website/webfont permission on their
 * Noonnu listing. We deliberately avoid bundling font binaries: permitted web
 * fonts are fetched from the published CDN URLs instead.
 *
 * User-requested removal:
 * - 그리운X국한박 송글손글 감성 흘림체
 *
 * Requested but NOT enabled without separate permission / a verified webfont URL:
 * - 다이어리체 (얼리폰트)
 * - 휴먼범석체 (이범석)
 * - 온글잎 루루체 (verified public webfont URL not found in current Noonnu index)
 */
export const WINNER_LETTER_FONTS = [
  { family: "WrlSongam", name: "송암 이형식체" },
  { family: "WrlSchoolChalk", name: "학교안심 분필" },
  { family: "WrlKyobo", name: "교보손글씨 2020 박도연" },
  { family: "WrlGeuriunCat", name: "그리운X국한박 신고양이" },
  { family: "WrlCafe24Star", name: "카페24 빛나는별" },
  { family: "WrlLeeSeoyun", name: "이서윤체" },
  { family: "WrlSimGyeongha", name: "심경하체" },
  { family: "WrlMiSaeng", name: "미생체" },
  { family: "WrlGangwonSaeum", name: "강원교육새음체" },
  { family: "WrlOmuDaye", name: "오뮤 다예쁨체" },
  { family: "WrlOngleipUiyeon", name: "온글잎 의연체" },
  { family: "WrlOngleipParkDahyeon", name: "온글잎 박다현체" },
] as const;

export type WinnerLetterFont = (typeof WINNER_LETTER_FONTS)[number];

/**
 * Shuffled without replacement until each available face has been used once.
 * Letter assignments are computed once per mailbox/content version, so
 * changing tabs, revealing the envelope, or re-rendering never changes the
 * font of an already-opened letter.
 */
export function randomLetterFontSequence(
  count: number,
  random: () => number = Math.random,
): WinnerLetterFont[] {
  const result: WinnerLetterFont[] = [];
  let pool: WinnerLetterFont[] = [];
  const required = Number.isFinite(count) ? Math.max(0, Math.min(100, Math.floor(count))) : 0;
  while (result.length < required) {
    if (pool.length === 0) {
      pool = [...WINNER_LETTER_FONTS];
      for (let i = pool.length - 1; i > 0; i--) {
        const raw = random();
        const index = Math.max(0, Math.min(i, Math.floor((Number.isFinite(raw) ? raw : 0) * (i + 1))));
        [pool[i], pool[index]] = [pool[index]!, pool[i]!];
      }
      // Avoid an accidental duplicate between the end and start of cycles.
      if (result.length && pool[0]?.family === result[result.length - 1]?.family) {
        const nextDifferent = pool.findIndex(f => f.family !== pool[0]?.family);
        if (nextDifferent > 0) [pool[0], pool[nextDifferent]] = [pool[nextDifferent]!, pool[0]!];
      }
    }
    const next = pool.shift();
    if (next) result.push(next);
  }
  return result;
}


/**
 * Find the largest font size that fits within the actual letter viewport.
 * DOM dimensions depend on the selected handwriting font and device width, so
 * callers measure rendered text after each candidate size instead of guessing
 * from character count. The minimum is a legibility fallback, not scrolling.
 */
export function findLargestFittingLetterSize(
  fits: (size: number) => boolean,
  minimum = 8,
  maximum = 30,
): number {
  let low = Math.max(1, Math.floor(minimum));
  let high = Math.max(low, Math.floor(maximum));
  let best = low;
  while (low <= high) {
    const candidate = Math.floor((low + high) / 2);
    if (fits(candidate)) {
      best = candidate;
      low = candidate + 1;
    } else {
      high = candidate - 1;
    }
  }
  return best;
}
