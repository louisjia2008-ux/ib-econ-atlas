import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { Locale, StudyWorkshop as WorkshopContent, WorkshopCriterion } from "../../types/content";
import { workshopStorageKey } from "./storage";
import { MicroDiagram } from "../diagrams/MicroDiagram";

type Point = { x: number; y: number };
type Tool = "line" | "label" | "area";
type Shape = { tool: Tool; points: Point[]; label: string; color: string };
type Check = "met" | "revise";
interface Draft {
  version: 1;
  shapes: Shape[];
  description: string;
  answers: Record<string, string>;
  revealed: Record<string, boolean>;
  reviews: Record<string, Record<string, Check>>;
  activeTask: string;
}
const blankDraft = (): Draft => ({ version: 1, shapes: [], description: "", answers: {}, revealed: {}, reviews: {}, activeTask: "explain" });
const colors = ["#17233b", "#2454d8", "#148064", "#b45309", "#7c3aed"];
const labels = ["Price", "Domestic quantity", "D", "S", "Pw", "Pw+t", "Qs0", "Qs1", "Qd1", "Qd0", "a", "b", "c", "d"];
function readDraft(key: string): Draft {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
    if (!value || typeof value !== "object") return blankDraft();
    const draft = value as Draft;
    const record = (v: unknown): v is Record<string, unknown> => Boolean(v && typeof v === "object" && !Array.isArray(v));
    if (draft.version !== 1 || !Array.isArray(draft.shapes) || draft.shapes.length > 200 || !draft.shapes.every(shape =>
      ["line", "label", "area"].includes(shape.tool) && colors.includes(shape.color) && typeof shape.label === "string" && shape.label.length < 40 && Array.isArray(shape.points) && shape.points.length <= 12 && shape.points.every(p => Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 0 && p.x <= 760 && p.y >= 0 && p.y <= 480))) return blankDraft();
    if (typeof draft.description !== "string" || typeof draft.activeTask !== "string" || !record(draft.answers) || !Object.values(draft.answers).every(v => typeof v === "string") || !record(draft.revealed) || !Object.values(draft.revealed).every(v => typeof v === "boolean") || !record(draft.reviews) || !Object.values(draft.reviews).every(v => record(v) && Object.values(v).every(check => check === "met" || check === "revise"))) return blankDraft();
    return draft;
  } catch { return blankDraft(); }
}

function ReviewChecklist({ criteria, locale, values, onChange }: {
  criteria: WorkshopCriterion[]; locale: Locale; values: Record<string, Check>;
  onChange: (id: string, value: Check) => void;
}) {
  const remaining = criteria.filter(c => !values[c.id]);
  const revise = criteria.filter(c => values[c.id] === "revise");
  return <div className="workshop-checklist">
    <p className="workshop-feedback" role="status">{locale === "zh-CN"
      ? `已核对 ${criteria.length - remaining.length}/${criteria.length} 项；需修改 ${revise.length} 项。此处记录你的自查，不是系统评分。`
      : `Checked ${criteria.length - remaining.length}/${criteria.length}; ${revise.length} need revision. This records your review, not a system mark.`}</p>
    {criteria.map(c => <fieldset key={c.id}>
      <legend>{c.title[locale]}</legend>
      <p>{c.guidance[locale]}</p>
      <div className="workshop-actions">{(["met", "revise"] as const).map(value => <button key={value} type="button" aria-pressed={values[c.id] === value} onClick={() => onChange(c.id, value)}>{locale === "zh-CN" ? (value === "met" ? "符合" : "需修改") : (value === "met" ? "Met" : "Needs revision")}</button>)}</div>
      {values[c.id] === "revise" && <p className="workshop-revision">{c.feedback[locale]}</p>}
    </fieldset>)}
    {remaining.length > 0 && <p>{locale === "zh-CN" ? "尚未核对：" : "Still to check: "}{remaining.map(c => c.title[locale]).join(" · ")}</p>}
  </div>;
}

export function StudyWorkshop({ pointId, content, locale, showHl }: { pointId: string; content: WorkshopContent; locale: Locale; showHl: boolean }) {
  const zh = locale === "zh-CN";
  const storageKey = workshopStorageKey(pointId);
  const [draft, setDraft] = useState<Draft>(() => readDraft(storageKey));
  const [storageFailed, setStorageFailed] = useState(false);
  const [tool, setTool] = useState<Tool>("line");
  const [color, setColor] = useState(colors[0] as string);
  const [label, setLabel] = useState("D");
  const [pending, setPending] = useState<Point[]>([]);
  const [cursor, setCursor] = useState<Point>({ x: 80, y: 400 });
  const [focused, setFocused] = useState(false);
  const [history, setHistory] = useState<Shape[][]>([]);
  const pointerStart = useRef<Point | undefined>(undefined);
  const [showModel, setShowModel] = useState(false);
  const save = (next: Draft) => {
    setDraft(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setStorageFailed(false); }
    catch { setStorageFailed(true); }
  };
  const commit = (shapes: Shape[]) => {
    setHistory(previous => [...previous.slice(-29), draft.shapes]);
    save({ ...draft, shapes, reviews: { ...draft.reviews, diagram: {} } });
    setPending([]);
  };
  const addShape = (points: Point[]) => { if (draft.shapes.length < 200) commit([...draft.shapes, { tool, points, label: tool === "label" ? label : "", color }]); };
  const place = (point: Point) => {
    setCursor(point);
    if (tool === "label") addShape([point]);
    else if (tool === "line" && pending[0]) addShape([pending[0], point]);
    else setPending(points => [...points, point].slice(0, 12));
  };
  const pointer = (event: PointerEvent<SVGSVGElement>) => {
    const start = pointerStart.current;
    pointerStart.current = undefined;
    if (!start || Math.hypot(start.x - event.clientX, start.y - event.clientY) > 8) return;
    const box = event.currentTarget.getBoundingClientRect();
    const point = { x: Math.round(Math.max(0, Math.min(760, (event.clientX - box.left) / box.width * 760))), y: Math.round(Math.max(0, Math.min(480, (event.clientY - box.top) / box.height * 480))) };
    event.currentTarget.focus();
    place(point);
  };
  const undo = () => {
    if (pending.length) { setPending([]); return; }
    const previous = history.at(-1);
    if (previous) { setHistory(history.slice(0, -1)); save({ ...draft, shapes: previous, reviews: { ...draft.reviews, diagram: {} } }); }
  };
  const keyboard = (event: KeyboardEvent<SVGSVGElement>) => {
    const step = event.shiftKey ? 20 : 5;
    const movement: Record<string, Point> = { ArrowLeft: { x: -step, y: 0 }, ArrowRight: { x: step, y: 0 }, ArrowUp: { x: 0, y: -step }, ArrowDown: { x: 0, y: step } };
    const delta = movement[event.key];
    if (delta) { event.preventDefault(); setCursor(p => ({ x: Math.max(0, Math.min(760, p.x + delta.x)), y: Math.max(0, Math.min(480, p.y + delta.y)) })); }
    else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); place(cursor); }
    else if (event.key === "Escape") { event.preventDefault(); setPending([]); }
  };
  const review = (section: string, id: string, value: Check) => save({ ...draft, reviews: { ...draft.reviews, [section]: { ...draft.reviews[section], [id]: value } } });
  const tasks = content.tasks.filter(task => showHl || task.level !== "hl");
  const task = tasks.find(item => item.id === draft.activeTask) ?? tasks[0];
  const revealed = task && draft.revealed[task.id];
  const path = (points: Point[]) => points.map((p, index) => `${index ? "L" : "M"}${p.x} ${p.y}`).join(" ");
  return <section className="study-workshop" id="study-workshop" aria-labelledby="workshop-title">
    <header><span className="eyebrow">{zh ? "从理解到输出" : "From understanding to output"}</span><h2 id="workshop-title">{content.title[locale]}</h2><p>{content.introduction[locale]}</p></header>
    <p className="workshop-assumptions">{content.assumptions[locale]}</p>
    <nav className="workshop-jumps" aria-label={zh ? "工坊步骤" : "Workshop steps"}><button type="button" onClick={() => document.getElementById("tariff-drawing")?.scrollIntoView({ behavior: "smooth" })}>{zh ? "1. 独立画图" : "1. Draw independently"}</button><button type="button" onClick={() => document.getElementById("tariff-exam")?.scrollIntoView({ behavior: "smooth" })}>{zh ? "2. 考试练习与反馈" : "2. Exam practice and feedback"}</button></nav>
    <section id="tariff-drawing" className="workshop-panel">
      <h3>{zh ? "先独立画图，再核对" : "Draw first, then check"}</h3><p>{content.diagram.prompt[locale]}</p>
      <div className="workshop-actions" role="group" aria-label={zh ? "作图工具" : "Drawing tools"}>
        {(["line", "label", "area"] as const).map((value, index) => <button key={value} type="button" aria-pressed={tool === value} onClick={() => { setTool(value); setPending([]); }}>{(zh ? ["线段", "标注", "福利区域"] : ["Line", "Label", "Welfare area"])[index]}</button>)}
        <label>{zh ? "颜色" : "Colour"}<select value={color} onChange={event => setColor(event.target.value)}>{colors.map((value, index) => <option key={value} value={value}>{(zh ? ["墨蓝", "蓝", "绿", "橙", "紫"] : ["Ink", "Blue", "Green", "Orange", "Purple"])[index]}</option>)}</select></label>
        {tool === "label" && <label>{zh ? "图示标注" : "Diagram label"}<select value={label} onChange={event => setLabel(event.target.value)}>{labels.map(value => <option key={value}>{value}</option>)}</select></label>}
      </div>
      <p id="drawing-help" className="workshop-help">{zh ? "线段：点起点与终点。标注：选标签后点位置。区域：依次点顶点，再完成区域。键盘：方向键移动光标，Shift 加速，Enter 放点；Esc 取消待画部分。小屏可在画布内横向滚动。" : "Line: choose two endpoints. Label: select a label and place it. Area: place vertices, then finish. Keyboard: arrows move the cursor, Shift moves faster, Enter places a point, Escape cancels pending points. Scroll inside the canvas on small screens."}</p>
      <div className="drawing-scroll"><svg className="tariff-drawing" viewBox="0 0 760 480" role="application" aria-label={zh ? "关税作图画布" : "Tariff drawing canvas"} aria-describedby="drawing-help" tabIndex={0} onPointerDown={event => { pointerStart.current = { x: event.clientX, y: event.clientY }; }} onPointerCancel={() => { pointerStart.current = undefined; }} onPointerUp={pointer} onKeyDown={keyboard} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
        <defs><pattern id="drawing-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#dce3ed" strokeWidth="0.7" /></pattern></defs>
        <rect width="760" height="480" fill="white" /><rect width="760" height="480" fill="url(#drawing-grid)" />
        <g pointerEvents="none">{draft.shapes.map((shape, index) => shape.tool === "label" ? <text key={index} x={shape.points[0]?.x} y={shape.points[0]?.y} fill={shape.color} fontSize="16">{shape.label}</text> : <path key={index} d={`${path(shape.points)}${shape.tool === "area" ? " Z" : ""}`} fill={shape.tool === "area" ? shape.color : "none"} fillOpacity="0.22" stroke={shape.color} strokeWidth="2.5" />)}
          {pending.length > 0 && <path d={path(pending)} fill="none" stroke={color} strokeWidth="2" strokeDasharray="5 4" />}
          {pending.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="4" fill={color} />)}
          {focused && <circle cx={cursor.x} cy={cursor.y} r="7" fill="none" stroke="#d02650" strokeWidth="2" />}
        </g>
      </svg></div>
      <p role="status" className="workshop-help">{zh ? `已画 ${draft.shapes.length} 个元素；待放点 ${pending.length}；光标 ${cursor.x}, ${cursor.y}` : `${draft.shapes.length} elements; ${pending.length} pending points; cursor ${cursor.x}, ${cursor.y}`}</p>
      <div className="workshop-actions">
        {tool === "area" && <button type="button" disabled={pending.length < 3} onClick={() => addShape(pending)}>{zh ? "完成区域" : "Finish area"}</button>}
        <button type="button" disabled={!history.length && !pending.length} onClick={undo}>{zh ? "撤销" : "Undo"}</button>
        <button type="button" disabled={!draft.shapes.length && !pending.length} onClick={() => commit([])}>{zh ? "清空画布" : "Clear canvas"}</button>
        <button type="button" aria-expanded={showModel} onClick={() => setShowModel(!showModel)}>{zh ? (showModel ? "隐藏参考图" : "对照参考图") : (showModel ? "Hide reference diagram" : "Compare reference diagram")}</button>
      </div>
      <label className="workshop-answer-label">{zh ? "文字构图或纸上作图说明" : "Text description or notes on your paper diagram"}<textarea value={draft.description} onChange={event => save({ ...draft, description: event.target.value, reviews: { ...draft.reviews, diagram: {} } })} placeholder={zh ? "说明坐标轴、曲线、价格、数量和福利区域的关系……" : "Describe axes, curves, prices, quantities and welfare areas…"} /></label>
      {showModel && <div className="tariff-reference-scroll"><MicroDiagram id="global-tariff" locale={locale} /></div>}
      <ReviewChecklist criteria={content.diagram.criteria} locale={locale} values={draft.reviews.diagram ?? {}} onChange={(id, value) => review("diagram", id, value)} />
    </section>
    <section id="tariff-exam" className="workshop-panel">
      <h3>{zh ? "考试风格练习" : "Exam-style practice"}</h3>
      <div className="workshop-actions" role="group" aria-label={zh ? "选择考试练习" : "Choose exam practice"}>{tasks.map(item => <button key={item.id} type="button" aria-pressed={item.id === task?.id} onClick={() => save({ ...draft, activeTask: item.id })}>{item.title[locale]}</button>)}</div>
      {task && <article className="workshop-exam-task">
        <p className="workshop-help">{zh ? `原创练习 · ${task.marks} 分规模 · 建议 ${task.minutes} 分钟${task.level === "hl" ? " · HL" : " · SL/HL"}` : `Original practice · ${task.marks}-mark scope · Suggested ${task.minutes} minutes${task.level === "hl" ? " · HL" : " · SL/HL"}`}</p>
        <h4>{task.prompt[locale]}</h4>
        <label className="workshop-answer-label">{zh ? "你的考试答案" : "Your exam answer"}<textarea readOnly={Boolean(revealed)} value={draft.answers[task.id] ?? ""} onChange={event => save({ ...draft, answers: { ...draft.answers, [task.id]: event.target.value }, revealed: { ...draft.revealed, [task.id]: false }, reviews: { ...draft.reviews, [task.id]: {} } })} placeholder={zh ? "先独立作答，引用图上标记，并交代条件……" : "Answer independently, refer to diagram labels and state conditions…"} /></label>
        {!revealed ? <button type="button" className="workshop-primary" disabled={!draft.answers[task.id]?.trim()} onClick={() => save({ ...draft, revealed: { ...draft.revealed, [task.id]: true } })}>{zh ? "提交并对照答案" : "Submit and compare answers"}</button> : <>
          <p className="workshop-feedback">{zh ? "答案已展开，尚未评分。按下列要求检查自己的回答；系统不会把关键词或勾选数量换算成 IB 分数，也不会据此更改掌握度。" : "The answer is revealed, not marked. Review the criteria below. Words or checklist totals are not converted to IB marks or used to update mastery."}</p>
          <details open className="workshop-model"><summary>{zh ? "参考答案与推导" : "Model answer and reasoning"}</summary>{task.modelAnswer[locale].split("\n\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)}</details>
          <details className="workshop-model"><summary>{zh ? "常见失分答案与诊断" : "Weak answer and diagnosis"}</summary><blockquote>{task.weakAnswer[locale]}</blockquote><p>{task.diagnosis[locale]}</p></details>
          <ReviewChecklist criteria={task.criteria} locale={locale} values={draft.reviews[task.id] ?? {}} onChange={(id, value) => review(task.id, id, value)} />
          <button type="button" onClick={() => save({ ...draft, revealed: { ...draft.revealed, [task.id]: false }, reviews: { ...draft.reviews, [task.id]: {} } })}>{zh ? "修改并重新作答" : "Revise and answer again"}</button>
        </>}
      </article>}
    </section>
    <footer className="workshop-footnote"><p>{storageFailed ? (zh ? "本机草稿保存失败；请复制答案后再离开页面。" : "Draft could not be saved. Copy your answer before leaving.") : (zh ? "画图、答案和自查草稿保存在当前浏览器，可离线继续；这些工坊草稿暂不包含在进度 JSON 备份中。" : "Drawing, answers and review drafts stay in this browser for offline use. Workshop drafts are not included in the progress JSON backup.")}</p><ul>{content.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ul></footer>
  </section>;
}
