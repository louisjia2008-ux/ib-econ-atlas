import { useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  ChevronRight,
  Circle,
  Clock3,
  Database,
  GraduationCap,
  Languages,
  Layers3,
  Menu,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Wifi,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { knowledgePoints, manifestEntries } from "./generated/content";
import type { Locale } from "./types/content";

type DirectoryMode = "syllabus" | "coursebook";

const interfaceCopy = {
  "zh-CN": {
    skip: "跳到正文",
    globalSearch: "搜索概念、术语或考纲代码",
    searchHint: "试试 opportunity cost、稀缺性或 1.1",
    offlineReady: "可离线使用",
    syllabus: "考纲目录",
    coursebook: "教材目录",
    courseLevel: "课程层级",
    core: "SL + HL 核心",
    hl: "包含 HL",
    examScope: "本次考试范围",
    scopeHelp: "范围只在本次浏览器会话中保留。",
    unit: "Unit 1 · 经济学导论",
    complete: "1 / 43 已发布",
    sectionTitle: "1.1 什么是经济学？",
    sectionSubtitle: "经济学的本质",
    matches: "个匹配结果",
    noMatches: "当前搜索没有匹配项。",
    clear: "清除搜索",
    learningPath: "学习路径",
    keyConclusion: "一句话核心结论",
    definition: "定义与概念边界",
    mechanism: "原理与因果链",
    explanation: "深入理解",
    application: "现实世界应用",
    misconception: "常见误区",
    exam: "考试应用",
    summary: "复习总结",
    mastery: "你的掌握度",
    newState: "未开始",
    masteryHelp: "完成练习后，系统会根据正确率与自评安排下次复习。",
    startReview: "开始 2 道练习",
    related: "相关知识点",
    sources: "目录与来源索引",
    syllabusCode: "官方考纲",
    textbook: "Cambridge 教材",
    pages: "页",
    aiTitle: "Atlas AI",
    aiStatus: "尚未配置",
    aiHelp: "接入后仅根据站内原创知识库回答；当前所有学习和搜索功能不受影响。",
    settings: "前往设置",
    previous: "上一知识点",
    next: "下一知识点",
    study: "学习",
    search: "搜索",
    review: "复习",
    progress: "进度",
    preferences: "设置",
    panel: "打开目录",
    knowledgePoint: "知识点",
    sourceDate: "资料日期",
  },
  en: {
    skip: "Skip to article",
    globalSearch: "Search concepts, terms, or syllabus codes",
    searchHint: "Try opportunity cost, 稀缺性, or 1.1",
    offlineReady: "Offline ready",
    syllabus: "Syllabus",
    coursebook: "Coursebook",
    courseLevel: "Course level",
    core: "SL + HL core",
    hl: "Include HL",
    examScope: "Current exam scope",
    scopeHelp: "Scope stays in this browser session only.",
    unit: "Unit 1 · Introduction to economics",
    complete: "1 / 43 published",
    sectionTitle: "1.1 What is economics?",
    sectionSubtitle: "The nature of economics",
    matches: "matching results",
    noMatches: "No result matches this search.",
    clear: "Clear search",
    learningPath: "Learning path",
    keyConclusion: "Core takeaway",
    definition: "Definition and boundaries",
    mechanism: "Mechanism and causal chain",
    explanation: "Build understanding",
    application: "Real-world application",
    misconception: "Common misconceptions",
    exam: "Exam application",
    summary: "Review summary",
    mastery: "Your mastery",
    newState: "Not started",
    masteryHelp: "After practice, accuracy and self-rating determine your next review.",
    startReview: "Start 2 practice items",
    related: "Related knowledge",
    sources: "Curriculum and source index",
    syllabusCode: "Official syllabus",
    textbook: "Cambridge coursebook",
    pages: "pages",
    aiTitle: "Atlas AI",
    aiStatus: "Not configured",
    aiHelp: "When enabled, it will answer only from the original Atlas knowledge base. Study and search work without it.",
    settings: "Open settings",
    previous: "Previous point",
    next: "Next point",
    study: "Study",
    search: "Search",
    review: "Review",
    progress: "Progress",
    preferences: "Settings",
    panel: "Open directory",
    knowledgePoint: "Knowledge point",
    sourceDate: "Source date",
  },
} as const;

const sectionLabels: Record<string, Record<Locale, string>> = {
  "1.1": { "zh-CN": "经济学的本质", en: "The nature of economics" },
  "1.2": { "zh-CN": "基本经济问题与经济制度", en: "Basic questions and systems" },
  "1.3": { "zh-CN": "模型与 PPC", en: "Models and the PPC" },
  "1.4": { "zh-CN": "经济学方法", en: "Methods in economics" },
  "1.5": { "zh-CN": "经济思想史", en: "History of economic thought" },
};

function App() {
  const [locale, setLocale] = useState<Locale>("zh-CN");
  const [directoryMode, setDirectoryMode] = useState<DirectoryMode>("syllabus");
  const [query, setQuery] = useState("");
  const [scopeOnly, setScopeOnly] = useState(false);
  const copy = interfaceCopy[locale];
  const point = knowledgePoints[0];

  const searchResults = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return [];
    return manifestEntries
      .filter((entry) => {
        const haystack = [
          entry.title["zh-CN"],
          entry.title.en,
          entry.section,
          entry.id,
        ]
          .join(" ")
          .toLocaleLowerCase();
        return haystack.includes(normalized);
      })
      .slice(0, 7);
  }, [query]);

  const sectionCounts = useMemo(
    () =>
      manifestEntries.reduce<Record<string, number>>((counts, item) => {
        counts[item.section] = (counts[item.section] ?? 0) + 1;
        return counts;
      }, {}),
    [],
  );

  if (!point) {
    return <main className="fatal-state">The knowledge bundle is unavailable.</main>;
  }

  const content = point.content[locale];
  const relatedEntries = point.meta.related
    .map((id) => manifestEntries.find((entry) => entry.id === id))
    .filter((entry) => entry !== undefined);
  const textbookRef = point.meta.textbookRefs[0];

  return (
    <div className="app-shell">
      <a className="skip-link" href="#knowledge-article">
        {copy.skip}
      </a>

      <header className="topbar">
        <div className="brand-lockup" aria-label="IB Econ Atlas">
          <span className="brand-mark" aria-hidden="true">
            <Layers3 size={20} strokeWidth={2.2} />
          </span>
          <span>
            <strong>IB Econ Atlas</strong>
            <small>Bilingual learning workspace</small>
          </span>
        </div>

        <label className="global-search">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">{copy.globalSearch}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.searchHint}
            aria-label={copy.globalSearch}
          />
          <kbd>⌘ K</kbd>
        </label>

        <div className="topbar-actions">
          <span className="offline-pill">
            <Wifi size={15} aria-hidden="true" />
            <span>{copy.offlineReady}</span>
          </span>
          <button
            className="language-toggle"
            type="button"
            onClick={() => setLocale((current) => (current === "zh-CN" ? "en" : "zh-CN"))}
            aria-label={locale === "zh-CN" ? "Switch to English" : "切换到中文"}
          >
            <Languages size={17} aria-hidden="true" />
            {locale === "zh-CN" ? "EN" : "中文"}
          </button>
          <button className="avatar" type="button" aria-label={copy.preferences}>
            LA
          </button>
        </div>
      </header>

      <div className="workspace-grid">
        <aside className="left-rail" aria-label={copy.learningPath}>
          <div className="directory-tabs" role="tablist" aria-label={copy.learningPath}>
            <button
              role="tab"
              aria-selected={directoryMode === "syllabus"}
              className={directoryMode === "syllabus" ? "active" : ""}
              onClick={() => setDirectoryMode("syllabus")}
              type="button"
            >
              {copy.syllabus}
            </button>
            <button
              role="tab"
              aria-selected={directoryMode === "coursebook"}
              className={directoryMode === "coursebook" ? "active" : ""}
              onClick={() => setDirectoryMode("coursebook")}
              type="button"
            >
              {copy.coursebook}
            </button>
          </div>

          <section className="rail-section compact-filter" aria-labelledby="course-level-title">
            <div className="rail-heading">
              <p id="course-level-title">{copy.courseLevel}</p>
              <SlidersHorizontal size={15} aria-hidden="true" />
            </div>
            <div className="filter-pills">
              <button className="selected" type="button">
                <Check size={14} /> {copy.core}
              </button>
              <button type="button">{copy.hl}</button>
            </div>
          </section>

          <section className="rail-section scope-card" aria-labelledby="scope-title">
            <div className="scope-row">
              <div>
                <p id="scope-title">{copy.examScope}</p>
                <span>{scopeOnly ? "1.1" : locale === "zh-CN" ? "全部内容" : "All content"}</span>
              </div>
              <button
                type="button"
                className={`switch ${scopeOnly ? "on" : ""}`}
                onClick={() => setScopeOnly((current) => !current)}
                aria-pressed={scopeOnly}
                aria-label={copy.examScope}
              >
                <span />
              </button>
            </div>
            <small>{copy.scopeHelp}</small>
          </section>

          <nav className="course-tree" aria-label={directoryMode === "syllabus" ? copy.syllabus : copy.coursebook}>
            <div className="unit-heading">
              <span>{directoryMode === "syllabus" ? copy.unit : "Coursebook · Unit 1"}</span>
              <small>{copy.complete}</small>
            </div>
            {Object.entries(sectionLabels).map(([section, labels]) => {
              const isCurrent = section === "1.1";
              return (
                <div className={`tree-section ${isCurrent ? "expanded" : ""}`} key={section}>
                  <button type="button" className="tree-section-button" aria-expanded={isCurrent}>
                    <span>
                      <small>{directoryMode === "syllabus" ? section : `Ch. ${section.split(".")[1]}`}</small>
                      {labels[locale]}
                    </span>
                    <span className="count-badge">{sectionCounts[section] ?? 0}</span>
                  </button>
                  {isCurrent && (
                    <div className="tree-items">
                      {manifestEntries
                        .filter((entry) => entry.section === "1.1")
                        .map((entry) => (
                          <button
                            type="button"
                            key={entry.id}
                            className={entry.id === point.meta.id ? "current" : ""}
                          >
                            {entry.id === point.meta.id ? (
                              <span className="item-status active" aria-hidden="true" />
                            ) : (
                              <span className="item-status" aria-hidden="true" />
                            )}
                            <span>{entry.title[locale]}</span>
                            {entry.id === point.meta.id && <ChevronRight size={15} aria-hidden="true" />}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="rail-progress">
            <div>
              <span>{locale === "zh-CN" ? "Unit 1 完成度" : "Unit 1 progress"}</span>
              <strong>0%</strong>
            </div>
            <div className="progress-track" aria-label="0%">
              <span style={{ width: "2%" }} />
            </div>
          </div>
        </aside>

        <main className="reading-canvas" id="knowledge-article">
          {query.trim() ? (
            <section className="search-results" aria-live="polite">
              <div className="search-results-header">
                <div>
                  <span className="eyebrow">{copy.search}</span>
                  <h1>“{query}”</h1>
                  <p>{searchResults.length} {copy.matches}</p>
                </div>
                <button type="button" onClick={() => setQuery("")}>
                  <RotateCcw size={16} /> {copy.clear}
                </button>
              </div>
              {searchResults.length > 0 ? (
                <div className="result-list">
                  {searchResults.map((entry) => (
                    <button className="result-card" type="button" key={entry.id}>
                      <span className="result-icon"><BookOpen size={19} /></span>
                      <span>
                        <small>{entry.section} · {entry.level.toUpperCase()}</small>
                        <strong>{entry.title[locale]}</strong>
                        <p>{entry.title[locale === "zh-CN" ? "en" : "zh-CN"]}</p>
                      </span>
                      <ChevronRight size={18} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty-result">
                  <Search size={30} />
                  <p>{copy.noMatches}</p>
                  <button type="button" onClick={() => setQuery("")}>{copy.clear}</button>
                </div>
              )}
            </section>
          ) : (
            <article className="knowledge-article">
              <nav className="breadcrumbs" aria-label="Breadcrumb">
                <span>Unit 1</span>
                <ChevronRight size={13} />
                <span>{copy.sectionSubtitle}</span>
                <ChevronRight size={13} />
                <strong>{content.title}</strong>
              </nav>

              <header className="article-header">
                <div className="article-kicker">
                  <span className="level-badge">CORE · SL / HL</span>
                  <span>{copy.knowledgePoint} 04</span>
                </div>
                <h1>{content.title}</h1>
                <p className="english-term">{locale === "zh-CN" ? point.content.en.title : point.content["zh-CN"].title}</p>
              </header>

              <section className="takeaway-card" aria-labelledby="takeaway-title">
                <span className="takeaway-icon" aria-hidden="true"><Sparkles size={19} /></span>
                <div>
                  <h2 id="takeaway-title">{copy.keyConclusion}</h2>
                  <p>{content.takeaway}</p>
                </div>
              </section>

              <section className="article-section" aria-labelledby="definition-title">
                <p className="section-number">01</p>
                <div>
                  <h2 id="definition-title">{copy.definition}</h2>
                  <p className="lead-definition">{content.definition}</p>
                </div>
              </section>

              <section className="article-section" aria-labelledby="mechanism-title">
                <p className="section-number">02</p>
                <div>
                  <h2 id="mechanism-title">{copy.mechanism}</h2>
                  <ol className="causal-chain">
                    {content.causalChain.map((step, index) => (
                      <li key={step}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <p>{step}</p>
                        {index < content.causalChain.length - 1 && <ChevronRight size={16} aria-hidden="true" />}
                      </li>
                    ))}
                  </ol>
                </div>
              </section>

              <section className="article-section prose-section" aria-labelledby="explanation-title">
                <p className="section-number">03</p>
                <div>
                  <h2 id="explanation-title">{copy.explanation}</h2>
                  <ReactMarkdown>{content.explanation}</ReactMarkdown>
                </div>
              </section>

              {content.realWorldExample && (
                <section className="article-section" aria-labelledby="application-title">
                  <p className="section-number">04</p>
                  <div>
                    <h2 id="application-title">{copy.application}</h2>
                    <div className="case-card">
                      <div className="case-meta">
                        <span>CASE NOTE</span>
                        <time>{content.realWorldExample.observedAt}</time>
                      </div>
                      <h3>{content.realWorldExample.title}</h3>
                      <p>{content.realWorldExample.explanation}</p>
                      <a href={content.realWorldExample.sourceUrl} target="_blank" rel="noreferrer">
                        {locale === "zh-CN" ? "查看外部资料来源" : "Open external source"} <ChevronRight size={14} />
                      </a>
                    </div>
                  </div>
                </section>
              )}

              <div className="two-up-sections">
                <section className="study-note misconception-note">
                  <span className="note-label">{copy.misconception}</span>
                  <ul>
                    {content.misconceptions.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </section>
                <section className="study-note exam-note">
                  <span className="note-label">{copy.exam}</span>
                  <ul>
                    {content.examApplication.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </section>
              </div>

              <section className="summary-card" aria-labelledby="summary-title">
                <div>
                  <span className="summary-mark"><GraduationCap size={20} /></span>
                  <h2 id="summary-title">{copy.summary}</h2>
                </div>
                <ul>
                  {content.summary.map((item) => (
                    <li key={item}><Check size={15} /> <span>{item}</span></li>
                  ))}
                </ul>
              </section>

              <nav className="article-pagination" aria-label="Knowledge navigation">
                <button type="button"><span>←</span><small>{copy.previous}</small></button>
                <button type="button"><small>{copy.next}</small><span>→</span></button>
              </nav>
            </article>
          )}
        </main>

        <aside className="right-rail" aria-label={copy.mastery}>
          <section className="side-card mastery-card">
            <div className="side-card-heading">
              <h2>{copy.mastery}</h2>
              <span className="state-badge"><Circle size={10} fill="currentColor" /> {copy.newState}</span>
            </div>
            <div className="mastery-visual" aria-label="0%">
              <span>0</span><small>%</small>
            </div>
            <p>{copy.masteryHelp}</p>
            <button className="primary-action" type="button">
              <Clock3 size={17} /> {copy.startReview}
            </button>
          </section>

          <section className="side-card">
            <div className="side-card-heading">
              <h2>{copy.related}</h2>
              <span>{relatedEntries.length}</span>
            </div>
            <div className="related-list">
              {relatedEntries.map((entry) => (
                <button type="button" key={entry.id}>
                  <span><BookOpen size={16} /></span>
                  <span><small>{entry.section}</small>{entry.title[locale]}</span>
                  <ChevronRight size={15} />
                </button>
              ))}
            </div>
          </section>

          <section className="side-card source-card">
            <h2>{copy.sources}</h2>
            <dl>
              <div>
                <dt>{copy.syllabusCode}</dt>
                <dd>{point.meta.syllabusRefs.join(", ")}</dd>
              </div>
              <div>
                <dt>{copy.textbook}</dt>
                <dd>{textbookRef ? `${textbookRef.chapter} · ${textbookRef.section}` : "—"}</dd>
              </div>
              <div>
                <dt>{copy.pages}</dt>
                <dd>{textbookRef?.pages.join(", ") ?? "—"}</dd>
              </div>
            </dl>
            <p>{locale === "zh-CN" ? "仅作章节与页码索引，不提供教材文件。" : "Index only; no coursebook file is distributed."}</p>
          </section>

          <section className="side-card ai-card">
            <div className="ai-heading">
              <span><Sparkles size={17} /></span>
              <div><h2>{copy.aiTitle}</h2><small>{copy.aiStatus}</small></div>
            </div>
            <p>{copy.aiHelp}</p>
            <button type="button">{copy.settings} <ChevronRight size={15} /></button>
          </section>
        </aside>
      </div>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <button type="button"><Menu size={20} /><span>{copy.panel}</span></button>
        <button className="active" type="button"><BookOpen size={20} /><span>{copy.study}</span></button>
        <button type="button"><Search size={20} /><span>{copy.search}</span></button>
        <button type="button"><Clock3 size={20} /><span>{copy.review}</span></button>
        <button type="button"><Database size={20} /><span>{copy.progress}</span></button>
      </nav>
    </div>
  );
}

export default App;
