import { Check, ChevronRight, GraduationCap, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { PPCExplorer } from "../features/diagrams/PPCExplorer";
import type { KnowledgePoint, Locale } from "../types/content";

interface KnowledgeArticleProps {
  point: KnowledgePoint;
  locale: Locale;
  labels: {
    keyConclusion: string;
    definition: string;
    mechanism: string;
    explanation: string;
    application: string;
    misconception: string;
    exam: string;
    summary: string;
    previous: string;
    next: string;
    knowledgePoint: string;
  };
  onPrevious: (() => void) | undefined;
  onNext: (() => void) | undefined;
}

const sectionTitles: Record<string, Record<Locale, string>> = {
  "1.1": { "zh-CN": "经济学的本质", en: "The nature of economics" },
  "1.2": { "zh-CN": "基本经济问题与制度", en: "Basic questions and systems" },
  "1.3": { "zh-CN": "模型与 PPC", en: "Models and the PPC" },
  "1.4": { "zh-CN": "经济学方法", en: "Methods in economics" },
  "1.5": { "zh-CN": "经济思想史", en: "History of economic thought" },
};

const levelLabels = {
  core: "CORE · SL / HL",
  hl: "HL",
  extension: "EXTENSION",
};

export function KnowledgeArticle({ point, locale, labels, onPrevious, onNext }: KnowledgeArticleProps) {
  const content = point.content[locale];
  const otherLocale: Locale = locale === "zh-CN" ? "en" : "zh-CN";
  const numericId = point.meta.id.match(/^u1-(\d+)/)?.[1] ?? "—";

  return (
    <article className="knowledge-article">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <span>Unit 1</span>
        <ChevronRight size={13} />
        <span>{sectionTitles[point.meta.section]?.[locale] ?? point.meta.section}</span>
        <ChevronRight size={13} />
        <strong>{content.title}</strong>
      </nav>

      <header className="article-header">
        <div className="article-kicker">
          <span className={`level-badge level-${point.meta.level}`}>{levelLabels[point.meta.level]}</span>
          <span>{labels.knowledgePoint} {numericId}</span>
        </div>
        <h1>{content.title}</h1>
        <p className="english-term">{point.content[otherLocale].title}</p>
      </header>

      <section className="takeaway-card" aria-labelledby="takeaway-title">
        <span className="takeaway-icon" aria-hidden="true"><Sparkles size={19} /></span>
        <div>
          <h2 id="takeaway-title">{labels.keyConclusion}</h2>
          <p>{content.takeaway}</p>
        </div>
      </section>

      <section className="article-section" aria-labelledby="definition-title">
        <p className="section-number">01</p>
        <div>
          <h2 id="definition-title">{labels.definition}</h2>
          <p className="lead-definition">{content.definition}</p>
        </div>
      </section>

      <section className="article-section" aria-labelledby="mechanism-title">
        <p className="section-number">02</p>
        <div>
          <h2 id="mechanism-title">{labels.mechanism}</h2>
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
          <h2 id="explanation-title">{labels.explanation}</h2>
          <ReactMarkdown>{content.explanation}</ReactMarkdown>
        </div>
      </section>

      {point.meta.diagramIds.includes("ppc-core") && <PPCExplorer locale={locale} />}

      {content.realWorldExample && (
        <section className="article-section" aria-labelledby="application-title">
          <p className="section-number">04</p>
          <div>
            <h2 id="application-title">{labels.application}</h2>
            <div className="case-card">
              <div className="case-meta"><span>CASE NOTE</span><time>{content.realWorldExample.observedAt}</time></div>
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
          <span className="note-label">{labels.misconception}</span>
          <ul>{content.misconceptions.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
        <section className="study-note exam-note">
          <span className="note-label">{labels.exam}</span>
          <ul>{content.examApplication.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      </div>

      <section className="summary-card" aria-labelledby="summary-title">
        <div>
          <span className="summary-mark"><GraduationCap size={20} /></span>
          <h2 id="summary-title">{labels.summary}</h2>
        </div>
        <ul>
          {content.summary.map((item) => <li key={item}><Check size={15} /><span>{item}</span></li>)}
        </ul>
      </section>

      <nav className="article-pagination" aria-label="Knowledge navigation">
        <button type="button" onClick={onPrevious} disabled={!onPrevious}><span>←</span><small>{labels.previous}</small></button>
        <button type="button" onClick={onNext} disabled={!onNext}><small>{labels.next}</small><span>→</span></button>
      </nav>
    </article>
  );
}
