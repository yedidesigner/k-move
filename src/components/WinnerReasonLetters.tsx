import { useState } from "react";
import { ArrowLeft, ArrowRight, Heart, LockKeyhole, MailOpen, RotateCcw } from "lucide-react";
import "./winner-reason-letters.css";

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
  const hasPrevious = opened && current > 0;
  const hasNext = opened && current < readable.length - 1;

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
            <div className="wrl-envelope" aria-hidden="true">
              <div className="wrl-envelope-back" />
              <div className="wrl-envelope-flap" />
              <div className="wrl-envelope-front" />
              <div className="wrl-envelope-seal"><Heart size={21} strokeWidth={1.5} /></div>
            </div>
            {opened && (
              <article className="wrl-letter" key={String(current) + ":" + recipient} aria-live="polite">
                <span className="wrl-letter-kicker">A NOTE FROM A CLASSMATE</span>
                <div className="wrl-letter-divider" aria-hidden="true" />
                <p className="wrl-letter-message">{readable[current]}</p>
                <span className="wrl-letter-signature">with warmth, ♡</span>
              </article>
            )}
            {!opened && (
              <div className="wrl-sealed-copy" aria-hidden="true">
                <span>당신에게 전해진 마음</span>
              </div>
            )}
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
