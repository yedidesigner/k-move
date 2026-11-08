/** Fit natural-height text, not a clipped flex item. No truncation or scrolling. */
export function fitWinnerLetterText(
  box: HTMLElement,
  text: HTMLElement,
  maximum: number,
): boolean {
  const style = getComputedStyle(box);
  const number = (value: string) => Number.parseFloat(value) || 0;
  const width = box.clientWidth - number(style.paddingLeft) - number(style.paddingRight);
  const height = box.clientHeight - number(style.paddingTop) - number(style.paddingBottom);
  if (width <= 2 || height <= 2) return false;

  const range = document.createRange();
  range.selectNodeContents(text);
  // Keep a pixel of clearance for fractional layout and handwritten ink overhang.
  const fits = (size: number) => {
    text.style.fontSize = `${size}px`;
    if (text.scrollWidth > width - 1 || text.scrollHeight > height - 1) return false;
    // Some handwriting fonts paint above/below their CSS line box. Measure the
    // real text range too, not just scrollHeight, to keep their ink on the paper.
    if (typeof range.getBoundingClientRect !== "function") return true;
    const bounds = box.getBoundingClientRect();
    const glyphs = range.getBoundingClientRect();
    return glyphs.left >= bounds.left + 0.5 && glyphs.right <= bounds.right - 0.5 &&
      glyphs.top >= bounds.top + 0.5 && glyphs.bottom <= bounds.bottom - 0.5;
  };
  const upper = Number.isFinite(maximum) ? Math.max(1, maximum) : 30;
  let low = 0.5;
  let high = upper;
  let best = 0.5;
  for (let i = 0; i < 12; i++) {
    const candidate = (low + high) / 2;
    if (fits(candidate)) {
      best = candidate;
      low = candidate;
    } else {
      high = candidate;
    }
  }
  // Round down, never up, so a previously fitting last line cannot overflow.
  const size = Math.max(0.5, Math.floor(best * 10) / 10);
  const complete = fits(size);
  box.dataset.textFit = complete ? "ready" : "pending";
  return complete;
}
