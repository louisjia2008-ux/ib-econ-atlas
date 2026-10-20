import { useRef, useState } from "react";
import { Check, CheckCircle2, ChevronRight, RotateCcw, X } from "lucide-react";
import { knowledgePoints } from "../../generated/content";
import type { Locale } from "../../types/content";
import type { PracticeAttempt, PracticeResult } from "../../types/progress";
import { getAllProgress, getProgress, saveReviewResult } from "../progress/db";
import { levelMatches, type LevelFilter } from "../search/search";
import {
  overrideShortAnswer,
  ratingForFlashcard,
  ratingForResult,
  scoreMultipleChoice,
  scoreShortAnswer,
  type SelfRating,
  type ShortAnswerScore,
} from "./scoring";
import { scheduleReview } from "./scheduler";
import { createReviewQueue, type QueuedPractice, type ReviewMode, type ReviewStatusFilter } from "./session";

type ReviewStage = "configure" | "answering" | "complete";

const selfRatings: Array<{ id: SelfRating; zh: string; en: string }> = [
  { id: "forgot", zh: "忘记", en: "Forgot" },
  { id: "difficult", zh: "困难", en: "Difficult" },
  { id: "okay", zh: "一般", en: "Okay" },
  { id: "mastered", zh: "熟练", en: "Confident" },
];

function attemptId(): string {
  return typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `attempt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ReviewView({ locale, level, scopeIds, pointId, onFreeReview, onOpenPoint }: {
  locale: Locale; level: LevelFilter; scopeIds: ReadonlySet<string>;
  pointId?: string | undefined; onFreeReview?: () => void; onOpenPoint?: (id: string) => void;
}) {
  const target = pointId ? knowledgePoints.find((point) => point.meta.id === pointId) : undefined;
  const targetAvailable = target && levelMatches(target.meta.level, level);
  const initialQueue = () => targetAvailable ? createReviewQueue([target], [], {
    mode: "mixed", count: target.practice.length, level, scopeIds: new Set(), useScope: false, status: "any", now: new Date(),
  }) : [];
  const [stage, setStage] = useState<ReviewStage>(() => initialQueue().length > 0 ? "answering" : "configure");
  const [mode, setMode] = useState<ReviewMode>("mixed");
  const [statusFilter, setStatusFilter] = useState<ReviewStatusFilter>("any");
  const [count, setCount] = useState(10);
  const [useScope, setUseScope] = useState(scopeIds.size > 0);
  const [queue, setQueue] = useState<QueuedPractice[]>(initialQueue);
  const [position, setPosition] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [automaticResult, setAutomaticResult] = useState<PracticeResult | undefined>();
  const [reviewChecks, setReviewChecks] = useState<Set<number>>(new Set());
  const [shortScore, setShortScore] = useState<ShortAnswerScore | undefined>();
  const [sessionResults, setSessionResults] = useState<PracticeResult[]>([]);
  const [emptyMessage, setEmptyMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const savingRef = useRef(false);

  const current = queue[position];

  const resetAnswer = () => {
    setRevealed(false);
    setAnswer("");
    setSelectedOption("");
    setAutomaticResult(undefined);
    setShortScore(undefined);
    setReviewChecks(new Set());
  };

  const start = async () => {
    const progress = await getAllProgress();
    const nextQueue = createReviewQueue(pointId ? (targetAvailable ? [target] : []) : knowledgePoints, progress, {
      mode,
      count: target ? target.practice.length : count,
      level,
      scopeIds,
      useScope: pointId ? false : useScope,
      status: pointId ? "any" : statusFilter,
      now: new Date(),
    });
    if (nextQueue.length === 0) {
      setEmptyMessage(locale === "zh-CN" ? "当前条件没有可用题目，请扩大范围或更换状态筛选。" : "No items match these options. Broaden the scope or status filter.");
      return;
    }
    setEmptyMessage("");
    setQueue(nextQueue);
    setPosition(0);
    setSessionResults([]);
    setSaveFailed(false);
    resetAnswer();
    setStage("answering");
  };

  const submitObjectiveAnswer = () => {
    if (!current) return;
    if (current.item.type === "mcq") {
      if (!selectedOption) return;
      setAutomaticResult(scoreMultipleChoice(current.item, selectedOption));
      setRevealed(true);
    } else if (current.item.type === "short-answer") {
      if (!answer.trim()) return;
      setShortScore(scoreShortAnswer(current.item, answer, locale));
      setRevealed(true);
    }
  };

  const finishItem = async (selfRating: SelfRating) => {
    // Lock synchronously: multiple click/tap events can arrive before React rerenders.
    if (!current || !revealed || savingRef.current) return;
    if (current.item.type === "short-answer" && (!shortScore?.result || reviewChecks.size !== 3)) return;
    savingRef.current = true;
    setIsSaving(true);
    setSaveFailed(false);
    try {
      let result: PracticeResult;
      let rating;
      let manualOverride = false;
      if (current.item.type === "flashcard") {
        result = selfRating === "forgot" ? "incorrect" : selfRating === "difficult" ? "partial" : "correct";
        rating = ratingForFlashcard(selfRating);
      } else if (current.item.type === "mcq") {
        result = automaticResult ?? "incorrect";
        rating = ratingForResult(result, selfRating);
      } else {
        result = shortScore?.result ?? "incorrect";
        manualOverride = shortScore?.manualOverride ?? false;
        rating = ratingForResult(result, selfRating);
      }

      const now = new Date();
      const existing = await getProgress(current.point.meta.id);
      const updated = scheduleReview(current.point.meta.id, existing, rating, now);
      const attempt: PracticeAttempt = {
        id: attemptId(),
        knowledgePointId: current.point.meta.id,
        practiceItemId: current.item.id,
        mode: current.item.type,
        result,
        score: result === "correct" ? 1 : result === "partial" ? 0.65 : 0,
        rating,
        manualOverride,
        createdAt: now.toISOString(),
      };
      await saveReviewResult(updated, attempt);
      setSessionResults((values) => [...values, result]);
      if (position >= queue.length - 1) {
        setStage("complete");
      } else {
        setPosition((value) => value + 1);
        resetAnswer();
      }
    } catch {
      setSaveFailed(true);
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  if (stage === "configure") {
    return (
      <section className="dashboard-view review-config">
        <span className="eyebrow">{pointId ? (locale === "zh-CN" ? "当前知识点练习" : "Current-point practice") : (locale === "zh-CN" ? "自由复习" : "Free review")}</span>
        <h1>{target ? target.content[locale].title : (locale === "zh-CN" ? "开始一次复习" : "Start a review")}</h1>
        {pointId && <p>{locale === "zh-CN" ? "仅练习当前知识点，按课程层级筛选；不受临时考试范围影响。" : "Practice only this knowledge point at the current course level, independently of the temporary exam scope."}</p>}
        {pointId && !targetAvailable && <p role="alert">{locale === "zh-CN" ? "该知识点不存在或不属于当前课程层级。请返回学习页调整层级。" : "This point is unavailable at the current course level. Return to study and check the level."}</p>}
        {pointId && onFreeReview && <button type="button" onClick={onFreeReview}>{locale === "zh-CN" ? "改为自由复习" : "Switch to free review"}</button>}
        <p className="dashboard-lead">{locale === "zh-CN" ? "选择题型、范围和知识状态；答题后由 FSRS 安排下一次复习。" : "Choose a mode, scope, and knowledge state. FSRS schedules the next review after each answer."}</p>
        <div className="review-options">
          <fieldset>
            <legend>{locale === "zh-CN" ? "题型" : "Mode"}</legend>
            <div className="segmented-options">
              {(["flashcard", "mcq", "short-answer", "mixed"] as const).map((value) => <button type="button" key={value} aria-pressed={mode === value} className={mode === value ? "selected" : ""} onClick={() => setMode(value)}>{value === "flashcard" ? (locale === "zh-CN" ? "闪卡" : "Flashcards") : value === "mcq" ? (locale === "zh-CN" ? "选择题" : "MCQ") : value === "short-answer" ? (locale === "zh-CN" ? "简答题" : "Short answer") : (locale === "zh-CN" ? "混合" : "Mixed")}</button>)}
            </div>
          </fieldset>
          {!pointId && <><fieldset>
            <legend>{locale === "zh-CN" ? "知识状态" : "Knowledge status"}</legend>
            <div className="segmented-options">
              {(["new", "weak", "due", "any"] as const).map((value) => <button type="button" key={value} aria-pressed={statusFilter === value} className={statusFilter === value ? "selected" : ""} onClick={() => setStatusFilter(value)}>{value === "new" ? (locale === "zh-CN" ? "未学" : "New") : value === "weak" ? (locale === "zh-CN" ? "薄弱" : "Weak") : value === "due" ? (locale === "zh-CN" ? "到期" : "Due") : (locale === "zh-CN" ? "任意" : "Any")}</button>)}
            </div>
          </fieldset>
          <fieldset>
            <legend>{locale === "zh-CN" ? "题目数量" : "Number of items"}</legend>
            <div className="segmented-options small">{[5, 10, 20].map((value) => <button type="button" key={value} aria-pressed={count === value} className={count === value ? "selected" : ""} onClick={() => setCount(value)}>{value}</button>)}</div>
          </fieldset>
          <label className="scope-choice"><input type="checkbox" checked={useScope} disabled={scopeIds.size === 0} onChange={(event) => setUseScope(event.target.checked)} /><span>{locale === "zh-CN" ? `使用当前考试范围（${scopeIds.size || "未设置"}）` : `Use current exam scope (${scopeIds.size || "not set"})`}</span></label></>}
        </div>
        {emptyMessage && <p className="review-alert" role="alert">{emptyMessage}</p>}
        <button className="review-start" type="button" disabled={Boolean(pointId && !targetAvailable)} onClick={() => void start()}>{locale === "zh-CN" ? "生成复习题组" : "Build review session"} <ChevronRight size={18} /></button>
      </section>
    );
  }

  if (stage === "complete") {
    const correct = sessionResults.filter((result) => result === "correct").length;
    const partial = sessionResults.filter((result) => result === "partial").length;
    return (
      <section className="dashboard-view review-complete">
        <span className="complete-icon"><CheckCircle2 size={30} /></span>
        <h1>{locale === "zh-CN" ? "本轮完成" : "Review complete"}</h1>
        <p>{locale === "zh-CN" ? `正确 ${correct}，部分正确 ${partial}，错误 ${sessionResults.length - correct - partial}。所有结果已保存在这台设备。` : `${correct} correct, ${partial} partial, and ${sessionResults.length - correct - partial} incorrect. Results are saved on this device.`}</p>
        <button className="review-start" type="button" onClick={() => setStage("configure")}><RotateCcw size={17} /> {locale === "zh-CN" ? "再复习一组" : "Review another set"}</button>
      </section>
    );
  }

  if (!current) return null;
  const item = current.item;
  return (
    <section className="review-session" aria-busy={isSaving}>
      <div className="session-topline">
        <button type="button" disabled={isSaving} onClick={() => setStage("configure")}>← {locale === "zh-CN" ? "退出" : "Exit"}</button>
        <span>{position + 1} / {queue.length}</span>
        {target && onOpenPoint && <button type="button" disabled={isSaving} onClick={() => onOpenPoint(target.meta.id)}>{locale === "zh-CN" ? "返回知识点" : "Back to knowledge point"}</button>}
      </div>
      <div className="session-progress"><span style={{ width: `${((position + 1) / queue.length) * 100}%` }} /></div>
      <article className="question-card">
        <div className="question-meta"><span>{item.type.toUpperCase()}{(item.level ?? current.point.meta.level) === "hl" ? " · HL" : ""}</span><small>{current.point.meta.section} · {current.point.content[locale].title}</small></div>
        <h1>{item.prompt[locale]}</h1>

        {item.type === "flashcard" && (
          <div className="flashcard-answer">
            {!revealed ? <button type="button" onClick={() => setRevealed(true)}>{locale === "zh-CN" ? "显示答案" : "Show answer"}</button> : <div><span>{locale === "zh-CN" ? "参考答案" : "Reference answer"}</span><p>{item.answer[locale]}</p></div>}
          </div>
        )}

        {item.type === "mcq" && (
          <div className="mcq-options">
            {item.options.map((option) => {
              const chosen = selectedOption === option.id;
              const correct = revealed && option.id === item.correctOptionId;
              const wrong = revealed && chosen && option.id !== item.correctOptionId;
              return <button type="button" disabled={revealed} key={option.id} className={`${chosen ? "chosen" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`} onClick={() => setSelectedOption(option.id)}><span>{option.id.toUpperCase()}</span>{option[locale]}{correct && <Check size={17} />}{wrong && <X size={17} />}</button>;
            })}
          </div>
        )}

        {item.type === "short-answer" && (
          <div className="short-answer-area">
            <textarea disabled={revealed} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={locale === "zh-CN" ? "用自己的话作答……" : "Answer in your own words…"} />
            {shortScore && (
              <div className="score-breakdown">
                <div><strong>{Math.round(shortScore.coverage * 100)}%</strong><span>{locale === "zh-CN" ? "关键词覆盖率" : "keyword coverage"}</span></div>
                <ul>{shortScore.groups.map((group) => <li key={group.id} className={group.matched ? "hit" : "miss"}>{group.matched ? <Check size={14} /> : <X size={14} />}<span>{group.label}</span><small>{group.matchedAlternative ?? (locale === "zh-CN" ? "未命中" : "missing")}</small></li>)}</ul>
                <details open className="answer-explanation"><summary>{locale === "zh-CN" ? "参考答案：先对照，再核对" : "Model answer: compare before checking"}</summary><p>{item.modelAnswer[locale]}</p></details>
                <p className="review-alert" role="status">{locale === "zh-CN" ? "待你核对：关键词命中不表示答案正确。请先对照参考答案，再明确自评。" : "Awaiting your review: matching words do not establish correctness. Compare the model answer, then choose a result."}</p>
                <fieldset className="answer-review-checks"><legend>{locale === "zh-CN" ? "对照参考答案逐项核对" : "Check against the model answer"}</legend>
                  {(locale === "zh-CN" ? ["我已核对概念与适用条件", "我已核对因果方向与解释", "我已核对题目要求的例子或情境"] : ["I checked concepts and assumptions", "I checked causal direction and explanation", "I checked the required example or context"]).map((label, index) => <label key={index}><input type="checkbox" disabled={isSaving} checked={reviewChecks.has(index)} onChange={(event) => {
                    setReviewChecks((checks) => { const next = new Set(checks); if (event.target.checked) next.add(index); else next.delete(index); return next; });
                    setShortScore((score) => score ? { ...score, result: undefined, manualOverride: false } : score);
                  }} />{label}</label>)}
                </fieldset>
                <div className="manual-override"><span>{locale === "zh-CN" ? "核对后自评" : "Choose a result after checking"}</span>{(["incorrect", "partial", "correct"] as const).map((result) => <button type="button" disabled={isSaving || reviewChecks.size !== 3} aria-pressed={shortScore.result === result} key={result} className={shortScore.result === result ? "selected" : ""} onClick={() => setShortScore(overrideShortAnswer(shortScore, result))}>{result === "incorrect" ? (locale === "zh-CN" ? "错误" : "Incorrect") : result === "partial" ? (locale === "zh-CN" ? "部分正确" : "Partial") : (locale === "zh-CN" ? "正确" : "Correct")}</button>)}</div>
              </div>
            )}
          </div>
        )}

        {revealed && item.type === "mcq" && <div className="answer-explanation"><strong>{locale === "zh-CN" ? "解析" : "Explanation"}</strong><p>{item.explanation[locale]}</p></div>}

        {!revealed && item.type !== "flashcard" && <button className="answer-submit" type="button" disabled={item.type === "mcq" ? !selectedOption : !answer.trim()} onClick={submitObjectiveAnswer}>{locale === "zh-CN" ? "提交答案" : "Submit answer"}</button>}

        {revealed && (
          <div className="self-rating"><span>{locale === "zh-CN" ? "这次回忆感觉如何？" : "How did recall feel?"}</span><div>{selfRatings.map((rating) => <button type="button" disabled={isSaving || (item.type === "short-answer" && (!shortScore?.result || reviewChecks.size !== 3))} key={rating.id} onClick={() => void finishItem(rating.id)}>{locale === "zh-CN" ? rating.zh : rating.en}</button>)}</div></div>
        )}
        {isSaving && <p role="status">{locale === "zh-CN" ? "正在保存……" : "Saving…"}</p>}
        {saveFailed && <p className="review-alert" role="alert">{locale === "zh-CN" ? "保存失败，进度未更改。请重试。" : "Could not save. Your progress is unchanged. Please try again."}</p>}
      </article>
    </section>
  );
}
