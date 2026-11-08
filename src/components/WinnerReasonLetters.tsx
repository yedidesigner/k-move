import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { AlignCenter, AlignLeft, AlignRight, ArrowLeft, ArrowRight, Download, LockKeyhole, MailOpen, RotateCcw, Type } from "lucide-react";
import { WINNER_LETTER_FONTS, randomLetterFontSequence } from "@/lib/winner-letter-fonts";
import { fitWinnerLetterText } from "@/lib/fit-winner-letter";
import "./winner-reason-letters.css";
import "./winner-letter-fit.css";

const CLOSED_IMAGE = "/images/envelope-yd-closed-hq-v2.avif";
const OPEN_IMAGE = "/images/envelope-yd-open-hq-v2.avif";

const ENVELOPE_COLORS = [
  { id:"pink", label:"연한 핑크", swatch:"#f5c9d3", filter:"hue-rotate(140deg) saturate(.68) brightness(1.04)" },
  { id:"orange", label:"파스텔 주황", swatch:"#f5d0aa", filter:"hue-rotate(180deg) saturate(.66) brightness(1.05)" },
  { id:"yellow", label:"파스텔 노랑", swatch:"#f4e7a8", filter:"hue-rotate(202deg) saturate(.63) brightness(1.08)" },
  { id:"green", label:"파스텔 초록", swatch:"#cfe5bf", filter:"hue-rotate(265deg) saturate(.58) brightness(1.02)" },
  { id:"blue", label:"파스텔 파랑", swatch:"#b7cce7", filter:"none" },
  { id:"indigo", label:"파스텔 남색", swatch:"#b9c5e7", filter:"hue-rotate(35deg) saturate(.72) brightness(.97)" },
  { id:"violet", label:"파스텔 보라", swatch:"#d5c3e9", filter:"hue-rotate(72deg) saturate(.66) brightness(1.01)" },
] as const;

type EnvelopeColorId = (typeof ENVELOPE_COLORS)[number]["id"];

function seoulLetterDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone:"Asia/Seoul", year:"2-digit", month:"2-digit", day:"2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? "";
  const year = value("year");
  const month = value("month");
  const day = value("day");
  return {
    label: year + "년 " + month + "월 " + day + "일",
    compact: year + month + day,
  };
}

function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  for (const character of Array.from(text)) {
    const next = line + character;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line.trimEnd());
      line = character.trimStart();
    } else {
      line = next;
    }
  }
  if (line) lines.push(line.trimEnd());
  return lines;
}


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
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left");
  const [pointSize, setPointSize] = useState(16);
  const [envelopeColor, setEnvelopeColor] = useState<EnvelopeColorId>("blue");
  const [savingImage, setSavingImage] = useState(false);
  const letterRef = useRef<HTMLElement | null>(null);
  const letterContentSignature = recipient + "\u241f" + readable.join("\u241e");
  const letterFontOrder = useMemo(() => randomLetterFontSequence(readable.length), [letterContentSignature]);
  const selectedFont = letterFontOrder[current] ?? WINNER_LETTER_FONTS[0];
  const hasPrevious = opened && current > 0;
  const hasNext = opened && current < readable.length - 1;
  const displayedReason = (readable[current] ?? "").replace(/\s+/g, " ").trim();
  const letterDate = useMemo(() => seoulLetterDate(), []);
  const selectedEnvelopeColor = ENVELOPE_COLORS.find(color => color.id === envelopeColor) ?? ENVELOPE_COLORS[4];

  useLayoutEffect(() => {
    if (!opened) return;
    const sheet = letterRef.current;
    if (!sheet) return;
    const scene = sheet.closest<HTMLElement>(".wrl-open-scene");
    const image = scene?.querySelector<HTMLImageElement>(".wrl-envelope-open");
    const messageMaximum = pointSize * (96 / 72);
    const regions = [
      ["message", messageMaximum],
      ["date", 10],
      ["signature", Math.min(messageMaximum * 0.62, 14)],
    ] as const;
    const targets = regions.flatMap(([name, maximum]) => {
      const box = sheet.querySelector<HTMLElement>(`.wrl-letter-${name}-box`);
      const text = sheet.querySelector<HTMLElement>(`.wrl-letter-${name}`);
      return box && text ? [{ box, text, maximum }] : [];
    });
    let active = true;
    let frame = 0;
    const fit = () => {
      if (!active || !sheet.isConnected) return;
      targets.forEach(({ box, text, maximum }) => fitWinnerLetterText(box, text, maximum));
    };
    const schedule = () => {
      if (!active) return;
      if (typeof window.requestAnimationFrame === "function") {
        if (frame) window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(fit);
      } else fit();
    };
    // Fit full natural text before first paint. Never measure a clipped flex child.
    fit();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    targets.forEach(({ box }) => observer?.observe(box));
    if (scene) observer?.observe(scene);
    image?.addEventListener("load", schedule);
    window.addEventListener("resize", schedule);
    const fonts = document.fonts;
    if (fonts) {
      void fonts.load('30px "' + selectedFont.family + '"', displayedReason).then(schedule, schedule);
      void fonts.ready.then(schedule, schedule);
      fonts.addEventListener("loadingdone", schedule);
    }
    return () => {
      active = false;
      if (frame && typeof window.cancelAnimationFrame === "function") window.cancelAnimationFrame(frame);
      observer?.disconnect();
      image?.removeEventListener("load", schedule);
      window.removeEventListener("resize", schedule);
      fonts?.removeEventListener("loadingdone", schedule);
    };
  }, [opened, current, displayedReason, selectedFont.family, pointSize, textAlign]);

  async function saveForever() {
    if (!opened || savingImage) return;
    const scene = letterRef.current?.closest<HTMLElement>(".wrl-open-scene");
    const image = scene?.querySelector<HTMLImageElement>(".wrl-envelope-open");
    const messageElement = letterRef.current?.querySelector<HTMLElement>(".wrl-letter-message");
    if (!image || !messageElement || !scene) return;
    setSavingImage(true);
    try {
      if (!image.complete) await new Promise<void>((resolve,reject) => {
        image.addEventListener("load", () => resolve(), { once:true });
        image.addEventListener("error", () => reject(new Error("편지 이미지를 불러오지 못했습니다.")), { once:true });
      });
      await document.fonts?.ready;
      await document.fonts?.load(
        getComputedStyle(messageElement).fontSize + ' "' + selectedFont.family + '"',
        displayedReason,
      );

      const width = image.naturalWidth || 1100;
      const height = image.naturalHeight || Math.round(width * 1143 / 985);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("이미지 저장 기능을 사용할 수 없습니다.");
      context.fillStyle = "#ffffff";
      context.fillRect(0,0,width,height);
      context.save();
      context.filter = selectedEnvelopeColor.filter === "none" ? "none" : selectedEnvelopeColor.filter;
      context.drawImage(image,0,0,width,height);
      context.restore();

      const sceneRect = scene.getBoundingClientRect();
      const imageRect = image.getBoundingClientRect();
      const scaleX = width / Math.max(1,imageRect.width);
      const scaleY = height / Math.max(1,imageRect.height);

      const drawInBox = (
        selector: string,
        text: string,
        align: "left" | "center" | "right",
        color: string,
        family: string,
      ) => {
        const box = letterRef.current?.querySelector<HTMLElement>(selector + "-box");
        const source = letterRef.current?.querySelector<HTMLElement>(selector);
        if (!box || !source) return;
        const boxRect = box.getBoundingClientRect();
        const sourceStyle = getComputedStyle(source);
        const fontSizePx = Number.parseFloat(sourceStyle.fontSize) * scaleY;
        const lineHeightRatio = Number.parseFloat(sourceStyle.lineHeight) /
          Math.max(1,Number.parseFloat(sourceStyle.fontSize));
        const lineHeight = fontSizePx * (Number.isFinite(lineHeightRatio) ? lineHeightRatio : 1.2);
        const x = (boxRect.left - imageRect.left) * scaleX;
        const y = (boxRect.top - imageRect.top) * scaleY;
        const boxWidth = boxRect.width * scaleX;
        const boxHeight = boxRect.height * scaleY;
        context.save();
        context.fillStyle = color;
        context.font = fontSizePx + 'px "' + family + '", sans-serif';
        context.textBaseline = "top";
        context.textAlign = align;
        const anchorX = align === "left" ? x : align === "center" ? x + boxWidth/2 : x + boxWidth;
        const lines = wrapCanvasText(context,text,boxWidth - 2*scaleX);
        const maxLines = Math.max(1,Math.floor(boxHeight/lineHeight));
        lines.slice(0,maxLines).forEach((line,index) => {
          context.fillText(line,anchorX,y + index*lineHeight,boxWidth);
        });
        context.restore();
      };

      drawInBox(".wrl-letter-message", displayedReason, textAlign, "#36373a", selectedFont.family);
      drawInBox(".wrl-letter-date", letterDate.label, "center", "#7d838c", "Arial");
      drawInBox(".wrl-letter-signature", "- 당신을 응원하는 누군가 -", textAlign, "#686f7c", selectedFont.family);

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve,"image/png"));
      if (!blob) throw new Error("이미지를 만들지 못했습니다.");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "K-MOVE-letter-" + letterDate.compact + "-" + String(current + 1).padStart(2,"0") + ".png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      window.alert(cause instanceof Error ? cause.message : "이미지를 저장하지 못했습니다.");
    } finally {
      setSavingImage(false);
    }
  }

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
              <img className="wrl-envelope-closed" src={CLOSED_IMAGE}
                alt="YEDI'S DESIGN CLASS가 새겨진 파스텔 봉투"
                style={{ filter: (selectedEnvelopeColor.filter === "none" ? "" : selectedEnvelopeColor.filter + " ") + "drop-shadow(0 14px 13px #18283d18)" }}
                aria-hidden={opened} loading="eager" decoding="async" />
              <div className="wrl-open-scene" aria-hidden={!opened}>
                <img className="wrl-envelope-open" src={OPEN_IMAGE} alt=""
                  style={{ filter: (selectedEnvelopeColor.filter === "none" ? "" : selectedEnvelopeColor.filter + " ") + "drop-shadow(0 14px 15px #18283d18)" }}
                  loading="eager" decoding="async" />
                {opened && (
                  <article ref={letterRef} className="wrl-letter"
                    key={String(current) + ":" + recipient} aria-live="polite"
                    data-letter-font={selectedFont.name}
                    data-letter-align={textAlign}
                    data-letter-point-size={pointSize}
                    style={{
                      fontFamily: '"' + selectedFont.family + '", "Apple SD Gothic Neo", sans-serif',
                      textAlign,
                    }}>
                    <div className="wrl-letter-message-box" data-text-fit="pending">
                      <p className="wrl-letter-message" style={{ textAlign }}>{displayedReason}</p>
                    </div>
                    <div className="wrl-letter-date-box" data-text-fit="pending">
                      <span className="wrl-letter-date">{letterDate.label}</span>
                    </div>
                    <div className="wrl-letter-signature-box" data-text-fit="pending">
                      <span className="wrl-letter-signature" style={{ textAlign }}>- 당신을 응원하는 누군가 -</span>
                    </div>
                  </article>
                )}
              </div>
            </div>
          </div>
          <div className="wrl-editor-controls" aria-label="편지 글자 설정">
            <div className="wrl-align-controls" role="group" aria-label="글자 정렬">
              <button type="button" className={"wrl-icon-button" + (textAlign === "left" ? " is-active" : "")}
                aria-label="왼쪽 정렬" aria-pressed={textAlign === "left"} onClick={() => setTextAlign("left")}>
                <AlignLeft size={17} aria-hidden />
              </button>
              <button type="button" className={"wrl-icon-button" + (textAlign === "center" ? " is-active" : "")}
                aria-label="가운데 정렬" aria-pressed={textAlign === "center"} onClick={() => setTextAlign("center")}>
                <AlignCenter size={17} aria-hidden />
              </button>
              <button type="button" className={"wrl-icon-button" + (textAlign === "right" ? " is-active" : "")}
                aria-label="오른쪽 정렬" aria-pressed={textAlign === "right"} onClick={() => setTextAlign("right")}>
                <AlignRight size={17} aria-hidden />
              </button>
            </div>
            <label className="wrl-size-control">
              <Type size={15} aria-hidden />
              <span className="wrl-sr-only">글자 크기</span>
              <select aria-label="글자 크기" value={pointSize}
                onChange={event => setPointSize(Number(event.target.value))}>
                {[10, 12, 14, 16, 18, 20].map(size => <option key={size} value={size}>{size} pt</option>)}
              </select>
            </label>
            <div className="wrl-color-controls" role="group" aria-label="봉투 색상">
              <span className="wrl-color-label">봉투 색상</span>
              {ENVELOPE_COLORS.map(color => <button key={color.id} type="button"
                className={"wrl-color-swatch" + (envelopeColor === color.id ? " is-active" : "")}
                aria-label={color.label}
                aria-pressed={envelopeColor === color.id}
                title={color.label}
                style={{ backgroundColor:color.swatch }}
                onClick={() => setEnvelopeColor(color.id)} />)}
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
            {opened && <button type="button" className="wrl-sub-button wrl-save-button"
              disabled={savingImage} onClick={() => void saveForever()}>
              <Download size={15} aria-hidden /> {savingImage ? "저장 중…" : "영원히 기억하기"}
            </button>}
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
