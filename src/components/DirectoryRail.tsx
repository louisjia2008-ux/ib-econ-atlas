import { Check, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { buildCoursebookDirectory, buildSyllabusDirectory } from "../features/navigation/directory";
import { isGroupSelected, toggleScopeGroup } from "../features/navigation/scope";
import { levelMatches, type LevelFilter } from "../features/search/search";
import type { KnowledgePoint, Locale } from "../types/content";
import type { ProgressRecord } from "../types/progress";

export type DirectoryMode = "syllabus" | "coursebook";

interface DirectoryRailProps {
  points: KnowledgePoint[];
  locale: Locale;
  mode: DirectoryMode;
  level: LevelFilter;
  scopeIds: ReadonlySet<string>;
  progressRecords: ProgressRecord[];
  currentId: string;
  mobileOpen: boolean;
  onModeChange: (mode: DirectoryMode) => void;
  onLevelChange: (level: LevelFilter) => void;
  onScopeChange: (scope: Set<string>) => void;
  onOpen: (id: string) => void;
  onRequestClose: () => void;
}

export function DirectoryRail({ points, locale, mode, level, scopeIds, progressRecords, currentId, mobileOpen, onModeChange, onLevelChange, onScopeChange, onOpen, onRequestClose }: DirectoryRailProps) {
  const currentPoint = points.find((point) => point.meta.id === currentId) ?? points[0];
  const [expanded, setExpanded] = useState(() => new Set([currentPoint?.meta.section ?? "1.1", "chapter-1"]));
  const pointById = useMemo(() => new Map(points.map((point) => [point.meta.id, point])), [points]);
  const groups = useMemo(() => mode === "syllabus" ? buildSyllabusDirectory(points) : buildCoursebookDirectory(points), [mode, points]);
  const progressById = useMemo(() => new Map(progressRecords.map((record) => [record.knowledgePointId, record])), [progressRecords]);
  const stateWeights: Record<ProgressRecord["state"], number> = { new: 0, learning: 35, review: 70, mastered: 100 };
  const progressPoints = scopeIds.size > 0 ? points.filter((point) => scopeIds.has(point.meta.id)) : points;
  const progressPercent = Math.round(progressPoints.reduce((total, point) => total + stateWeights[progressById.get(point.meta.id)?.state ?? "new"], 0) / Math.max(1, progressPoints.length));

  const toggleExpanded = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <aside id="directory-drawer" className={`left-rail ${mobileOpen ? "mobile-open" : ""}`} aria-label={locale === "zh-CN" ? "学习路径" : "Learning path"}>
      <div className="directory-mobile-head">
        <strong>{locale === "zh-CN" ? "学习目录" : "Learning directory"}</strong>
        <button type="button" onClick={onRequestClose} aria-label={locale === "zh-CN" ? "关闭目录" : "Close directory"}><X size={18} /></button>
      </div>
      <div className="directory-tabs" role="tablist">
        <button role="tab" aria-selected={mode === "syllabus"} className={mode === "syllabus" ? "active" : ""} onClick={() => onModeChange("syllabus")} type="button">
          {locale === "zh-CN" ? "考纲目录" : "Syllabus"}
        </button>
        <button role="tab" aria-selected={mode === "coursebook"} className={mode === "coursebook" ? "active" : ""} onClick={() => onModeChange("coursebook")} type="button">
          {locale === "zh-CN" ? "教材目录" : "Coursebook"}
        </button>
      </div>

      <section className="rail-section compact-filter">
        <div className="rail-heading"><p>{locale === "zh-CN" ? "课程层级" : "Course level"}</p><SlidersHorizontal size={15} /></div>
        <div className="filter-pills">
          {(["sl", "hl", "all"] as const).map((item) => (
            <button key={item} className={level === item ? "selected" : ""} type="button" onClick={() => onLevelChange(item)}>
              {level === item && <Check size={14} />}
              {item === "sl" ? "SL" : item === "hl" ? "HL" : locale === "zh-CN" ? "全部 + 扩展" : "All + extension"}
            </button>
          ))}
        </div>
      </section>

      <section className="rail-section scope-card">
        <div className="scope-row">
          <div>
            <p>{locale === "zh-CN" ? "本次考试范围" : "Current exam scope"}</p>
            <span>{scopeIds.size > 0 ? `${scopeIds.size} / 43` : locale === "zh-CN" ? "全部内容" : "All content"}</span>
          </div>
          {scopeIds.size > 0 && <button className="scope-clear" type="button" onClick={() => onScopeChange(new Set())} aria-label="Clear scope"><X size={15} /></button>}
        </div>
        <small>{locale === "zh-CN" ? "勾选目录章节；范围仅在本次浏览器会话保留。" : "Tick directory sections; the scope stays in this browser session only."}</small>
      </section>

      <nav className="course-tree">
        {groups.map((group) => (
          <div key={group.id}>
            <div className="unit-heading"><span>{group.title[locale]}</span><small>43 / 43 {locale === "zh-CN" ? "已发布" : "published"}</small></div>
            {group.sections.map((section) => {
              const visibleIds = section.pointIds.filter((id) => {
                const point = pointById.get(id);
                return point && levelMatches(point.meta.level, level) && (scopeIds.size === 0 || scopeIds.has(id));
              });
              const isExpanded = expanded.has(section.id) || section.pointIds.includes(currentId);
              const selected = isGroupSelected(scopeIds, section.pointIds);
              return (
                <div className={`tree-section ${isExpanded ? "expanded" : ""}`} key={section.id}>
                  <div className="tree-section-row">
                    <button type="button" className={`scope-check ${selected ? "selected" : ""}`} onClick={() => onScopeChange(toggleScopeGroup(scopeIds, section.pointIds))} aria-pressed={selected} aria-label={`${locale === "zh-CN" ? "选择范围" : "Select scope"}: ${section.title[locale]}`}>
                      {selected && <Check size={12} />}
                    </button>
                    <button type="button" className="tree-section-button" aria-expanded={isExpanded} onClick={() => toggleExpanded(section.id)}>
                      <span><small>{section.id.replace("chapter-", "Chapter ")}</small>{section.title[locale]}</span>
                      <span className="count-badge">{visibleIds.length}</span>
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="tree-items">
                      {visibleIds.map((id) => {
                        const point = pointById.get(id);
                        if (!point) return null;
                        return (
                          <button type="button" key={id} className={id === currentId ? "current" : ""} onClick={() => onOpen(id)}>
                            <span className={`item-status ${id === currentId || progressById.has(id) ? "active" : ""}`} aria-hidden="true" />
                            <span>{point.content[locale].title}</span>
                            {id === currentId && <ChevronRight size={15} />}
                          </button>
                        );
                      })}
                      {visibleIds.length === 0 && <p className="tree-empty">{locale === "zh-CN" ? "当前筛选无内容" : "No content in this filter"}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="rail-progress">
        <div><span>{scopeIds.size > 0 ? (locale === "zh-CN" ? "当前范围掌握进度" : "Scope mastery progress") : (locale === "zh-CN" ? "Unit 1 掌握进度" : "Unit 1 mastery progress")}</span><strong>{progressPercent}%</strong></div>
        <div className="progress-track" aria-label={`${progressPercent}%`}><span style={{ width: `${progressPercent}%` }} /></div>
      </div>
    </aside>
  );
}
