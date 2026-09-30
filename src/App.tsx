import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Clock3, Database, Languages, Layers3, Menu, Search, Settings2, Wifi, WifiOff, X } from "lucide-react";
import { useLocation, useMatch, useNavigate } from "react-router-dom";
import { useRegisterSW } from "virtual:pwa-register/react";
import { ContextRail } from "./components/ContextRail";
import { DirectoryRail, type DirectoryMode } from "./components/DirectoryRail";
import { KnowledgeArticle } from "./components/KnowledgeArticle";
import { SearchView } from "./components/SearchView";
import { loadScope, saveScope } from "./features/navigation/scope";
import { ProgressView } from "./features/progress/ProgressView";
import { getAllProgress, getPreferences, savePreferences } from "./features/progress/db";
import { ReviewView } from "./features/review/ReviewView";
import { KnowledgeSearchIndex, levelMatches, type LevelFilter } from "./features/search/search";
import { SettingsView } from "./features/settings/SettingsView";
import { knowledgePoints } from "./generated/content";
import type { Locale } from "./types/content";
import type { ProgressRecord } from "./types/progress";

const copy = {
  "zh-CN": {
    skip: "跳到正文",
    globalSearch: "搜索概念、术语或考纲代码",
    searchHint: "试试 opportunity cost、稀缺性或 1.1",
    offlineReady: "可离线使用",
    offlineNow: "当前离线",
    updateAvailable: "新版本已经准备好。刷新后使用最新内容。",
    cacheReady: "应用与 Unit 1 内容已缓存，可以离线学习。",
    refresh: "立即刷新",
    later: "稍后",
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
    settings: "设置",
    panel: "目录",
  },
  en: {
    skip: "Skip to article",
    globalSearch: "Search concepts, terms, or syllabus codes",
    searchHint: "Try opportunity cost, 稀缺性, or 1.1",
    offlineReady: "Offline ready",
    offlineNow: "Offline now",
    updateAvailable: "A new version is ready. Refresh to use the latest content.",
    cacheReady: "The app and Unit 1 content are cached for offline study.",
    refresh: "Refresh now",
    later: "Later",
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
    settings: "Settings",
    panel: "Directory",
  },
} as const;

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const studyMatch = useMatch("/study/:knowledgePointId");
  const [locale, setLocale] = useState<Locale>("zh-CN");
  const [directoryMode, setDirectoryMode] = useState<DirectoryMode>("syllabus");
  const [level, setLevel] = useState<LevelFilter>("all");
  const [query, setQuery] = useState("");
  const [scopeIds, setScopeIds] = useState<Set<string>>(() => loadScope());
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({ immediate: true });
  const labels = copy[locale];
  const searchIndex = useMemo(() => new KnowledgeSearchIndex(knowledgePoints), []);

  useEffect(() => {
    if (location.pathname === "/") navigate("/study/u1-04-scarcity", { replace: true });
  }, [location.pathname, navigate]);

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key === "Escape" && directoryOpen) setDirectoryOpen(false);
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [directoryOpen]);

  useEffect(() => {
    if (!directoryOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [directoryOpen]);

  useEffect(() => {
    saveScope(scopeIds);
  }, [scopeIds]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    void getAllProgress().then(setProgressRecords);
  }, [location.pathname]);

  useEffect(() => {
    void getPreferences().then((preferences) => {
      setLocale(preferences.locale);
      setLevel(preferences.levelFilter);
      setPreferencesReady(true);
    });
  }, []);

  useEffect(() => {
    if (!preferencesReady) return;
    void getPreferences().then((preferences) => savePreferences({ ...preferences, locale, levelFilter: level }));
  }, [level, locale, preferencesReady]);

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
    setDirectoryOpen(false);
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
            ref={searchInputRef}
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
          <span className={`offline-pill ${isOnline ? "" : "is-offline"}`}>{isOnline ? <Wifi size={15} /> : <WifiOff size={15} />}<span>{isOnline ? labels.offlineReady : labels.offlineNow}</span></span>
          <button className="language-toggle" type="button" onClick={() => setLocale((value) => value === "zh-CN" ? "en" : "zh-CN")} aria-label={locale === "zh-CN" ? "Switch to English" : "切换到中文"}>
            <Languages size={17} /> {locale === "zh-CN" ? "EN" : "中文"}
          </button>
          <button className="avatar" type="button" onClick={() => navigate("/settings")} aria-label={locale === "zh-CN" ? "设置" : "Settings"}>LA</button>
          <button className="mobile-menu-button" type="button" onClick={() => setDirectoryOpen(true)} aria-expanded={directoryOpen} aria-controls="directory-drawer" aria-label={labels.panel}><Menu size={20} /></button>
        </div>
      </header>

      <div className={`workspace-grid ${showContext ? "" : "without-context"}`}>
        <DirectoryRail
          points={knowledgePoints}
          locale={locale}
          mode={directoryMode}
          level={level}
          scopeIds={scopeIds}
          progressRecords={progressRecords}
          currentId={currentPoint.meta.id}
          mobileOpen={directoryOpen}
          onModeChange={setDirectoryMode}
          onLevelChange={setLevel}
          onScopeChange={setScopeIds}
          onOpen={openPoint}
          onRequestClose={() => setDirectoryOpen(false)}
        />

        {directoryOpen && <button className="directory-overlay" type="button" onClick={() => setDirectoryOpen(false)} aria-label={locale === "zh-CN" ? "关闭目录" : "Close directory"} />}

        <main className="reading-canvas" id="knowledge-article">
          {isSearch ? (
            <SearchView query={query} locale={locale} hits={hits} progressRecords={progressRecords} scopeActive={scopeIds.size > 0} onOpen={openPoint} onClearQuery={() => setQuery("")} onClearScope={() => setScopeIds(new Set())} />
          ) : isReview ? (
            <ReviewView key={level} locale={locale} level={level} scopeIds={scopeIds} />
          ) : isProgress ? (
            <ProgressView locale={locale} level={level} scopeIds={scopeIds} onOpen={openPoint} />
          ) : isSettings ? (
            <SettingsView locale={locale} />
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
          <ContextRail point={currentPoint} points={knowledgePoints} progress={progressRecords.find((record) => record.knowledgePointId === currentPoint.meta.id)} locale={locale} onOpen={openPoint} onReview={() => navigate("/review")} onSettings={() => navigate("/settings")} />
        )}
      </div>

      {(needRefresh || offlineReady) && (
        <aside className="pwa-toast" role="status">
          <span>{needRefresh ? labels.updateAvailable : labels.cacheReady}</span>
          <div>
            {needRefresh && <button type="button" onClick={() => void updateServiceWorker(true)}>{labels.refresh}</button>}
            <button type="button" aria-label={labels.later} onClick={() => { setNeedRefresh(false); setOfflineReady(false); }}>{needRefresh ? labels.later : <X size={16} />}</button>
          </div>
        </aside>
      )}

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <button className={!isSearch && !isReview && !isProgress && !isSettings ? "active" : ""} type="button" onClick={() => openPoint(currentPoint.meta.id)}><BookOpen size={20} /><span>{labels.study}</span></button>
        <button className={isSearch ? "active" : ""} type="button" onClick={() => navigate("/search")}><Search size={20} /><span>{labels.search}</span></button>
        <button className={isReview ? "active" : ""} type="button" onClick={() => navigate("/review")}><Clock3 size={20} /><span>{labels.review}</span></button>
        <button className={isProgress ? "active" : ""} type="button" onClick={() => navigate("/progress")}><Database size={20} /><span>{labels.progress}</span></button>
        <button className={isSettings ? "active" : ""} type="button" onClick={() => navigate("/settings")}><Settings2 size={20} /><span>{labels.settings}</span></button>
      </nav>
    </div>
  );
}

export default App;
