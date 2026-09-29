import { useEffect, useMemo, useState } from "react";
import { BookOpen, Clock3, Database, Languages, Layers3, Menu, Search, Wifi } from "lucide-react";
import { useLocation, useMatch, useNavigate } from "react-router-dom";
import { ContextRail } from "./components/ContextRail";
import { DirectoryRail, type DirectoryMode } from "./components/DirectoryRail";
import { KnowledgeArticle } from "./components/KnowledgeArticle";
import { SearchView } from "./components/SearchView";
import { loadScope, saveScope } from "./features/navigation/scope";
import { KnowledgeSearchIndex, levelMatches, type LevelFilter } from "./features/search/search";
import { knowledgePoints } from "./generated/content";
import type { Locale } from "./types/content";

const copy = {
  "zh-CN": {
    skip: "跳到正文",
    globalSearch: "搜索概念、术语或考纲代码",
    searchHint: "试试 opportunity cost、稀缺性或 1.1",
    offlineReady: "可离线使用",
    keyConclusion: "一句话核心结论",
    definition: "定义与概念边界",
    mechanism: "原理与因果链",
    explanation: "深入理解",
    application: "现实世界应用",
    misconception: "常见误区",
    exam: "考试应用",
    summary: "复习总结",
    previous: "上一知识点",
    next: "下一知识点",
    knowledgePoint: "知识点",
    study: "学习",
    search: "搜索",
    review: "复习",
    progress: "进度",
    panel: "目录",
    comingReview: "复习中心将在下一阶段接入答题与调度。",
    comingProgress: "进度中心将在下一阶段接入设备本地记录。",
    comingSettings: "设置与数据管理将在下一阶段接入。",
  },
  en: {
    skip: "Skip to article",
    globalSearch: "Search concepts, terms, or syllabus codes",
    searchHint: "Try opportunity cost, 稀缺性, or 1.1",
    offlineReady: "Offline ready",
    keyConclusion: "Core takeaway",
    definition: "Definition and boundaries",
    mechanism: "Mechanism and causal chain",
    explanation: "Build understanding",
    application: "Real-world application",
    misconception: "Common misconceptions",
    exam: "Exam application",
    summary: "Review summary",
    previous: "Previous point",
    next: "Next point",
    knowledgePoint: "Knowledge point",
    study: "Study",
    search: "Search",
    review: "Review",
    progress: "Progress",
    panel: "Directory",
    comingReview: "Answering and scheduling will be connected to the review centre in the next phase.",
    comingProgress: "Device-local records will be connected to the progress centre in the next phase.",
    comingSettings: "Settings and data management will be connected in the next phase.",
  },
} as const;

function PlaceholderView({ title, message }: { title: string; message: string }) {
  return (
    <section className="placeholder-view">
      <span className="eyebrow">IB ECON ATLAS</span>
      <h1>{title}</h1>
      <p>{message}</p>
    </section>
  );
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const studyMatch = useMatch("/study/:knowledgePointId");
  const [locale, setLocale] = useState<Locale>("zh-CN");
  const [directoryMode, setDirectoryMode] = useState<DirectoryMode>("syllabus");
  const [level, setLevel] = useState<LevelFilter>("all");
  const [query, setQuery] = useState("");
  const [scopeIds, setScopeIds] = useState<Set<string>>(() => loadScope());
  const labels = copy[locale];
  const searchIndex = useMemo(() => new KnowledgeSearchIndex(knowledgePoints), []);

  useEffect(() => {
    if (location.pathname === "/") navigate("/study/u1-04-scarcity", { replace: true });
  }, [location.pathname, navigate]);

  useEffect(() => {
    saveScope(scopeIds);
  }, [scopeIds]);

  const currentPoint = useMemo(() => {
    const requestedId = studyMatch?.params.knowledgePointId;
    return knowledgePoints.find((point) => point.meta.id === requestedId)
      ?? knowledgePoints.find((point) => point.meta.id === "u1-04-scarcity")
      ?? knowledgePoints[0];
  }, [studyMatch?.params.knowledgePointId]);

  const visibleSequence = useMemo(
    () => knowledgePoints.filter((point) => levelMatches(point.meta.level, level) && (scopeIds.size === 0 || scopeIds.has(point.meta.id))),
    [level, scopeIds],
  );
  const currentIndex = currentPoint ? visibleSequence.findIndex((point) => point.meta.id === currentPoint.meta.id) : -1;
  const hits = useMemo(
    () => searchIndex.search(query, locale, { level, scopeIds }),
    [level, locale, query, scopeIds, searchIndex],
  );

  if (!currentPoint) return <main className="fatal-state">The knowledge bundle is unavailable.</main>;

  const openPoint = (id: string) => {
    navigate(`/study/${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateQuery = (value: string) => {
    setQuery(value);
    if (value.trim() && location.pathname !== "/search") navigate("/search");
  };

  const isSearch = location.pathname === "/search";
  const isReview = location.pathname === "/review";
  const isProgress = location.pathname === "/progress";
  const isSettings = location.pathname === "/settings";
  const showContext = !isSearch && !isReview && !isProgress && !isSettings;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#knowledge-article">{labels.skip}</a>
      <header className="topbar">
        <button className="brand-lockup brand-button" type="button" onClick={() => openPoint(currentPoint.meta.id)} aria-label="IB Econ Atlas">
          <span className="brand-mark" aria-hidden="true"><Layers3 size={20} strokeWidth={2.2} /></span>
          <span><strong>IB Econ Atlas</strong><small>Bilingual learning workspace</small></span>
        </button>

        <label className="global-search">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">{labels.globalSearch}</span>
          <input
            type="search"
            value={query}
            onFocus={() => navigate("/search")}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder={labels.searchHint}
            aria-label={labels.globalSearch}
          />
          <kbd>⌘ K</kbd>
        </label>

        <div className="topbar-actions">
          <span className="offline-pill"><Wifi size={15} /><span>{labels.offlineReady}</span></span>
          <button className="language-toggle" type="button" onClick={() => setLocale((value) => value === "zh-CN" ? "en" : "zh-CN")} aria-label={locale === "zh-CN" ? "Switch to English" : "切换到中文"}>
            <Languages size={17} /> {locale === "zh-CN" ? "EN" : "中文"}
          </button>
          <button className="avatar" type="button" onClick={() => navigate("/settings")} aria-label={locale === "zh-CN" ? "设置" : "Settings"}>LA</button>
        </div>
      </header>

      <div className={`workspace-grid ${showContext ? "" : "without-context"}`}>
        <DirectoryRail
          points={knowledgePoints}
          locale={locale}
          mode={directoryMode}
          level={level}
          scopeIds={scopeIds}
          currentId={currentPoint.meta.id}
          onModeChange={setDirectoryMode}
          onLevelChange={setLevel}
          onScopeChange={setScopeIds}
          onOpen={openPoint}
        />

        <main className="reading-canvas" id="knowledge-article">
          {isSearch ? (
            <SearchView query={query} locale={locale} hits={hits} scopeActive={scopeIds.size > 0} onOpen={openPoint} onClearQuery={() => setQuery("")} onClearScope={() => setScopeIds(new Set())} />
          ) : isReview ? (
            <PlaceholderView title={labels.review} message={labels.comingReview} />
          ) : isProgress ? (
            <PlaceholderView title={labels.progress} message={labels.comingProgress} />
          ) : isSettings ? (
            <PlaceholderView title={locale === "zh-CN" ? "设置" : "Settings"} message={labels.comingSettings} />
          ) : (
            <KnowledgeArticle
              point={currentPoint}
              locale={locale}
              labels={labels}
              onPrevious={currentIndex > 0 ? () => openPoint(visibleSequence[currentIndex - 1]?.meta.id ?? currentPoint.meta.id) : undefined}
              onNext={currentIndex >= 0 && currentIndex < visibleSequence.length - 1 ? () => openPoint(visibleSequence[currentIndex + 1]?.meta.id ?? currentPoint.meta.id) : undefined}
            />
          )}
        </main>

        {showContext && (
          <ContextRail point={currentPoint} points={knowledgePoints} locale={locale} onOpen={openPoint} onReview={() => navigate("/review")} onSettings={() => navigate("/settings")} />
        )}
      </div>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <button type="button"><Menu size={20} /><span>{labels.panel}</span></button>
        <button className={!isSearch && !isReview && !isProgress && !isSettings ? "active" : ""} type="button" onClick={() => openPoint(currentPoint.meta.id)}><BookOpen size={20} /><span>{labels.study}</span></button>
        <button className={isSearch ? "active" : ""} type="button" onClick={() => navigate("/search")}><Search size={20} /><span>{labels.search}</span></button>
        <button className={isReview ? "active" : ""} type="button" onClick={() => navigate("/review")}><Clock3 size={20} /><span>{labels.review}</span></button>
        <button className={isProgress ? "active" : ""} type="button" onClick={() => navigate("/progress")}><Database size={20} /><span>{labels.progress}</span></button>
      </nav>
    </div>
  );
}

export default App;
