import { BookOpen, ChevronRight, RotateCcw, Search } from "lucide-react";
import type { SearchHit } from "../features/search/search";
import type { Locale } from "../types/content";

interface SearchViewProps {
  query: string;
  locale: Locale;
  hits: SearchHit[];
  scopeActive: boolean;
  onOpen: (id: string) => void;
  onClearQuery: () => void;
  onClearScope: () => void;
}

export function SearchView({ query, locale, hits, scopeActive, onOpen, onClearQuery, onClearScope }: SearchViewProps) {
  const title = query.trim() ? `“${query}”` : locale === "zh-CN" ? "浏览知识库" : "Browse the knowledge base";
  return (
    <section className="search-results" aria-live="polite">
      <div className="search-results-header">
        <div>
          <span className="eyebrow">{locale === "zh-CN" ? "双语检索" : "Bilingual search"}</span>
          <h1>{title}</h1>
          <p>{hits.length} {locale === "zh-CN" ? "个匹配结果" : "matching results"}</p>
        </div>
        {query.trim() && (
          <button type="button" onClick={onClearQuery}><RotateCcw size={16} /> {locale === "zh-CN" ? "清除搜索" : "Clear query"}</button>
        )}
      </div>
      {hits.length > 0 ? (
        <div className="result-list">
          {hits.map(({ point, snippet }) => (
            <button className="result-card" type="button" key={point.meta.id} onClick={() => onOpen(point.meta.id)}>
              <span className="result-icon"><BookOpen size={19} /></span>
              <span>
                <small>{point.meta.section} · {point.meta.level.toUpperCase()}</small>
                <strong>{point.content[locale].title}</strong>
                <p>{snippet}</p>
              </span>
              <ChevronRight size={18} />
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-result">
          <Search size={30} />
          <p>{locale === "zh-CN" ? "当前筛选和考试范围没有匹配项。" : "Nothing matches the current filters and exam scope."}</p>
          {scopeActive ? (
            <button type="button" onClick={onClearScope}>{locale === "zh-CN" ? "清除考试范围" : "Clear exam scope"}</button>
          ) : (
            <button type="button" onClick={onClearQuery}>{locale === "zh-CN" ? "清除搜索" : "Clear query"}</button>
          )}
        </div>
      )}
    </section>
  );
}
