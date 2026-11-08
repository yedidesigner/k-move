/**
 * Eight Korean handwriting styles with verified website/webfont permission on
 * their official Noonnu listing. We deliberately avoid bundling font binaries:
 * the licensed fonts are fetched directly from the Noonnu-published CDN URLs.
 *
 * Requested but NOT enabled without separate permission:
 * - 다이어리체 (얼리폰트): embedding/webfont requires individual permission.
 * - 휴먼범석체 (이범석): software/web embedding is conditional, no public webfont snippet.
 */
export const WINNER_LETTER_FONTS = [
  { family: "WrlSongam", name: "송암 이형식체" },
  { family: "WrlGeuriunFlow", name: "그리운X국한박 송글손글 감성 흘림체" },
  { family: "WrlSchoolChalk", name: "학교안심 분필" },
  { family: "WrlKyobo", name: "교보손글씨 2020 박도연" },
  { family: "WrlGeuriunCat", name: "그리운X국한박 신고양이" },
  { family: "WrlCafe24Star", name: "카페24 빛나는별" },
  { family: "WrlLeeSeoyun", name: "이서윤체" },
  { family: "WrlSimGyeongha", name: "심경하체" },
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
