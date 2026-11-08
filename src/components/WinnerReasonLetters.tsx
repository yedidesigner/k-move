import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, LockKeyhole, MailOpen, RotateCcw } from "lucide-react";
import { WINNER_LETTER_FONTS, randomLetterFontSequence, findLargestFittingLetterSize } from "@/lib/winner-letter-fonts";
import "./winner-reason-letters.css";

const CLOSED_IMAGE = "/images/envelope-yd-closed-hq-v2.avif";
const OPEN_IMAGE = "/images/envelope-yd-open-hq-v2.avif";

export function WinnerReasonLetters({
  recipient,
  letters,
  instructor,
}: {
  recipient: string;
  letters: string[];
  instructor: boolean;
}) {
  const readable = letters.filter((reason) => reason.trim().length > 0);
  const [opened, setOpened] = useState(false);
  const [current, setCurrent] = useState(0);
  const [fontSize, setFontSize] = useState(30);
  const letterRef = useRef<HTMLElement | null>(null);
  // Each note receives a random, stable handwriting font. No changes while reading.
  const letterContentSignature = recipient + "\u241f" + readable.join("\u241e");
  const letterFontOrder = useMemo(() => randomLetterFontSequence(readable.length), [letterContentSignature]);
  const selectedFont = letterFontOrder[current] ?? WINNER_LETTER_FONTS[0];
  const hasPrevious = opened && current > 0;
  const hasNext = opened && current < readable.length - 1;
  // Keep all characters, but collapse excess line breaks to avoid wasting paper space.
  const displayedReason = (readable[current] ?? "").replace(/\s+/g, " ").trim();

  useLayoutEffect(() => {
    if (!opened) return;
    const sheet = letterRef.current;
    const message = sheet?.querySelector<HTMLElement>(".wrl-letter-message");
    const signature = sheet?.querySelector<HTMLElement>(".wrl-letter-signature");
    if (!sheet || !message || !signature) return;

    let active = true;
    let frame = 0;
    const fit = () => {
      if (!active || !sheet.isConnected || !message.clientHeight || !message.clientWidth) return;
      const fits = (size: number) => {
        sheet.style.fontSize = size + "px";
        return message.scrollHeight <= message.clientHeight + 1 &&
          message.scrollWidth <= message.clientWidth + 1 &&
          signature.scrollWidth <= signature.clientWidth + 1 &&
          sheet.scrollHeight <= sheet.clientHeight + 1;
      };
      const largest = findLargestFittingLetterSize(fits, 8, 30);
      sheet.style.fontSize = largest + "px";
      setFontSize(largest);
    };
    const schedule = () => {
      if (!active) return;
      if (typeof window.requestAnimationFrame === "function") {
        if (frame) window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(fit);
      } else fit();
    };
    // Layout is known before paint, so initial open is not visibly clipped.
    fit();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    observer?.observe(sheet);
    window.addEventListener("resize", schedule);
    const fonts = document.fonts;
    if (fonts) {
      // Refit after external handwritten webfont finishes loading.
      void fonts.load('30px "' + selectedFont.family + '"').then(schedule, schedule);
      void fonts.ready.then(schedule, schedule);
      fonts.addEventListener("loadingdone", schedule);
    }
    return () => {
      active = false;
      if (frame && typeof window.cancelAnimationFrame === "function") window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", schedule);
      fonts?.removeEventListener("loadingdone", schedule);
    };
  }, [opened, current, displayedReason, selectedFont.family]);


  function restart() {
    setCurrent(0);
    setOpened(false);
  }

  return (
    <section className="wrl-mailbox" aria-label={recipient + "님의 익명 선정 이유 편지함"}>
      <header className="wrl-heading">
        <span className="wrl-kicker">
          <MailOpen size={14} aria-hidden /> A LETTER FOR YOU
        </span>
        <h5>{instructor ? recipient + "님에게 도착한 편지" : "친구들이 남긴 한마디"}</h5>
        <p>
          {instructor
            ? "1등 학생에게 전달되는 편지입니다. 누가 작성했는지는 표시되지 않습니다."
            : "축하합니다. 이번 회차 1등으로 선정되었어요. 친구들의 마음을 편지로 만나보세요."}
        </p>
      </header>

      {readable.length > 0 ? (
        <>
          <div className={"wrl-stage" + (opened ? " is-open" : "")}>
            <div className="wrl-envelope-art">
              <img
                className="wrl-envelope-closed"
                src={CLOSED_IMAGE}
                alt="YEDI'S DESIGN CLASS가 새겨진 파란색 닫힌 봉투"
                aria-hidden={opened}
                loading="eager"
                decoding="async"
              />
              <div className="wrl-open-scene" aria-hidden={!opened}>
                <img
                  className="wrl-envelope-open"
                  src={OPEN_IMAGE}
                  alt=""
                  loading="eager"
                  decoding="async"
                />
                {opened && (
                  <article
                    ref={letterRef}
                    className="wrl-letter"
                    key={String(current) + ":" + recipient}
                    aria-live="polite"
                    data-letter-font={selectedFont.name}
                    style={{
                      fontFamily: '"' + selectedFont.family + '", "Apple SD Gothic Neo", sans-serif',
                      fontSize: fontSize + "px",
                    }}
                  >
                    <span className="wrl-letter-kicker">A NOTE FROM A CLASSMATE</span>
                    <p className="wrl-letter-message">{displayedReason}</p>
                    <span className="wrl-letter-signature">- 당신을 응원하는 누군가 -</span>
                  </article>
                )}
              </div>
            </div>
          </div>

          <div className="wrl-controls">
            {!opened ? (
              <button type="button" className="wrl-main-button" onClick={() => setOpened(true)}>
                <MailOpen size={16} aria-hidden /> 편지 열기
              </button>
            ) : (
              <>
                {hasPrevious && (
                  <button type="button" className="wrl-sub-button" onClick={() => setCurrent(index => index - 1)}>
                    <ArrowLeft size={15} aria-hidden /> 이전 편지
                  </button>
                )}
                {hasNext && (
                  <button type="button" className="wrl-main-button" onClick={() => setCurrent(index => index + 1)}>
                    다음 편지 <ArrowRight size={15} aria-hidden />
                  </button>
                )}
                {!hasNext && (
                  <button type="button" className="wrl-main-button" onClick={restart}>
                    <RotateCcw size={15} aria-hidden /> 처음부터 다시 보기
                  </button>
                )}
              </>
            )}
          </div>
          <p className="wrl-privacy"><LockKeyhole size={13} aria-hidden />
            작성자 이름, 투표 시각, 득표수는 편지에 표시되지 않습니다.
          </p>
        </>
      ) : (
        <div className="wrl-empty">
          <MailOpen size={25} strokeWidth={1.3} aria-hidden />
          <p>이번 투표에는 전달할 선정 이유가 남아 있지 않아요.</p>
        </div>
      )}
    </section>
  );
}
