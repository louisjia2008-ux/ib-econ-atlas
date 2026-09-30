import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, Layers3, Sparkles } from "lucide-react";
import { knowledgePoints } from "../../generated/content";
import type { Locale } from "../../types/content";
import type { ProgressRecord } from "../../types/progress";
import { levelMatches, type LevelFilter } from "../search/search";
import { getAllProgress } from "./db";

export function ProgressView({ locale, level, scopeIds, onOpen }: { locale: Locale; level: LevelFilter; scopeIds: ReadonlySet<string>; onOpen: (id: string) => void }) {
  const [snapshot, setSnapshot] = useState<{ records: ProgressRecord[]; observedAt: number }>({ records: [], observedAt: 0 });
  useEffect(() => {
    let active = true;
    void getAllProgress().then((records) => {
      if (active) setSnapshot({ records, observedAt: Date.now() });
    });
    return () => { active = false; };
  }, []);
  const { records, observedAt } = snapshot;
  const activePoints = knowledgePoints.filter((point) => levelMatches(point.meta.level, level) && (scopeIds.size === 0 || scopeIds.has(point.meta.id)));
  const activeIds = new Set(activePoints.map((point) => point.meta.id));
  const activeRecords = records.filter((record) => activeIds.has(record.knowledgePointId));
  const byId = new Map(activeRecords.map((record) => [record.knowledgePointId, record]));
  const counts = {
    new: activePoints.filter((point) => !byId.has(point.meta.id) || byId.get(point.meta.id)?.state === "new").length,
    learning: activeRecords.filter((record) => record.state === "learning").length,
    review: activeRecords.filter((record) => record.state === "review").length,
    mastered: activeRecords.filter((record) => record.state === "mastered").length,
  };
  const due = activeRecords.filter((record) => record.dueAt && Date.parse(record.dueAt) <= observedAt);
  return (
    <section className="dashboard-view">
      <span className="eyebrow">{locale === "zh-CN" ? "设备本地数据" : "On-device data"}</span>
      <h1>{locale === "zh-CN" ? "学习进度" : "Learning progress"}</h1>
      <p className="dashboard-lead">{locale === "zh-CN" ? `所有掌握度和练习记录只保存在这台设备。${scopeIds.size > 0 ? `当前仅统计考试范围内的 ${activePoints.length} 个知识点。` : ""}` : `Mastery and practice records remain on this device.${scopeIds.size > 0 ? ` Showing the ${activePoints.length} points in the current exam scope.` : ""}`}</p>
      <div className="stat-grid">
        <article><Layers3 /><span>{locale === "zh-CN" ? "未学" : "New"}</span><strong>{counts.new}</strong></article>
        <article><Sparkles /><span>{locale === "zh-CN" ? "学习中" : "Learning"}</span><strong>{counts.learning}</strong></article>
        <article><Clock3 /><span>{locale === "zh-CN" ? "复习" : "Review"}</span><strong>{counts.review}</strong></article>
        <article><CheckCircle2 /><span>{locale === "zh-CN" ? "已掌握" : "Mastered"}</span><strong>{counts.mastered}</strong></article>
      </div>
      <section className="dashboard-panel">
        <div><h2>{locale === "zh-CN" ? "当前到期" : "Due now"}</h2><span>{due.length}</span></div>
        {due.length === 0 ? <p>{locale === "zh-CN" ? "目前没有到期知识点。完成练习后，这里会出现复习安排。" : "Nothing is due yet. Review dates appear after practice."}</p> : due.map((record) => {
          const point = knowledgePoints.find((candidate) => candidate.meta.id === record.knowledgePointId);
          return point ? <button type="button" key={record.knowledgePointId} onClick={() => onOpen(record.knowledgePointId)}>{point.content[locale].title}</button> : null;
        })}
      </section>
    </section>
  );
}
