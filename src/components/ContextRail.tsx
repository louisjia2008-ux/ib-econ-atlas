import { BookOpen, ChevronRight, Circle, Clock3 } from "lucide-react";
import { AiAssistant } from "../features/ai/AiAssistant";
import type { KnowledgePoint, Locale } from "../types/content";
import type { ProgressRecord } from "../types/progress";

interface ContextRailProps {
  point: KnowledgePoint;
  points: KnowledgePoint[];
  progress: ProgressRecord | undefined;
  locale: Locale;
  onOpen: (id: string) => void;
  onReview: () => void;
  onSettings: () => void;
}

export function ContextRail({ point, points, progress, locale, onOpen, onReview, onSettings }: ContextRailProps) {
  const byId = new Map(points.map((candidate) => [candidate.meta.id, candidate]));
  const related = point.meta.related.map((id) => byId.get(id)).filter((candidate) => candidate !== undefined);
  const textbookRef = point.meta.textbookRefs[0];
  const stateCopy = {
    new: { "zh-CN": "未开始", en: "Not started", percent: 0 },
    learning: { "zh-CN": "学习中", en: "Learning", percent: 35 },
    review: { "zh-CN": "复习中", en: "Review", percent: 70 },
    mastered: { "zh-CN": "已掌握", en: "Mastered", percent: 100 },
  } as const;
  const mastery = stateCopy[progress?.state ?? "new"];
  const dueText = progress?.dueAt
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(progress.dueAt))
    : undefined;
  return (
    <aside className="right-rail" aria-label={locale === "zh-CN" ? "学习状态" : "Study status"}>
      <section className="side-card mastery-card">
        <div className="side-card-heading">
          <h2>{locale === "zh-CN" ? "你的掌握度" : "Your mastery"}</h2>
          <span className="state-badge"><Circle size={10} fill="currentColor" /> {mastery[locale]}</span>
        </div>
        <div className="mastery-visual" aria-label={`${mastery.percent}%`} style={{ background: `radial-gradient(circle at center, white 56%, transparent 57%), conic-gradient(var(--cobalt) 0 ${mastery.percent}%, #dce3ed ${mastery.percent}% 100%)` }}><span>{mastery.percent}</span><small>%</small></div>
        <p>{dueText ? (locale === "zh-CN" ? `下次复习：${dueText}` : `Next review: ${dueText}`) : (locale === "zh-CN" ? "完成练习后，正确率和自评会安排下次复习。" : "Practice accuracy and self-rating will schedule the next review.")}</p>
        <button className="primary-action" type="button" onClick={onReview}><Clock3 size={17} /> {locale === "zh-CN" ? `开始 ${point.practice.length} 道练习` : `Start ${point.practice.length} practice items`}</button>
      </section>

      <section className="side-card">
        <div className="side-card-heading"><h2>{locale === "zh-CN" ? "相关知识点" : "Related knowledge"}</h2><span>{related.length}</span></div>
        <div className="related-list">
          {related.map((candidate) => (
            <button type="button" key={candidate.meta.id} onClick={() => onOpen(candidate.meta.id)}>
              <span><BookOpen size={16} /></span>
              <span><small>{candidate.meta.section}</small>{candidate.content[locale].title}</span>
              <ChevronRight size={15} />
            </button>
          ))}
        </div>
      </section>

      <section className="side-card source-card">
        <h2>{locale === "zh-CN" ? "目录与来源索引" : "Curriculum and source index"}</h2>
        <dl>
          <div><dt>{locale === "zh-CN" ? "官方考纲" : "Official syllabus"}</dt><dd>{point.meta.syllabusRefs.join(", ")}</dd></div>
          <div><dt>{locale === "zh-CN" ? "Cambridge 教材" : "Cambridge coursebook"}</dt><dd>{textbookRef ? `Chapter ${textbookRef.chapter} · ${textbookRef.section}` : "—"}</dd></div>
          <div><dt>{locale === "zh-CN" ? "页码" : "Pages"}</dt><dd>{textbookRef?.pages.join(", ") ?? "—"}</dd></div>
        </dl>
        <p>{locale === "zh-CN" ? "仅作章节和页码索引，不提供教材文件。" : "Index only; no coursebook file is distributed."}</p>
      </section>

      <AiAssistant point={point} points={points} locale={locale} onOpen={onOpen} onSettings={onSettings} />
    </aside>
  );
}
