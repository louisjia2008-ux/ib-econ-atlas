import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Search, Sparkles } from "lucide-react";
import type { KnowledgePoint, Locale } from "../../types/content";
import type { AskResponse } from "../../types/ai";
import { getPreferences } from "../progress/db";
import { KnowledgeSearchIndex } from "../search/search";
import { askAtlas, AiRequestError } from "./client";
import { loadOwnerAccessToken } from "./credentials";

const failureText = {
  "zh-CN": {
    unconfigured: "AI 尚未配置。请在设置中填写自己的 Worker endpoint 和访问码。",
    offline: "当前离线；AI 不可用，但本地检索和学习仍然可用。",
    unauthorized: "访问码被 Worker 拒绝，请检查本机设置。",
    limited: "今天的 AI 调用额度已用完。",
    timeout: "AI 请求超时，请稍后重试。",
    model: "Worker 或模型暂时出错。本地结果仍然保留。",
    "invalid-response": "Worker 返回了无法验证的响应。",
  },
  en: {
    unconfigured: "AI is not configured. Add your own Worker endpoint and access token in Settings.",
    offline: "You are offline. AI is unavailable, while local search and study continue to work.",
    unauthorized: "The Worker rejected the access token. Check this device's settings.",
    limited: "The daily AI limit has been reached.",
    timeout: "The AI request timed out. Try again later.",
    model: "The Worker or model failed. Local results remain available.",
    "invalid-response": "The Worker returned a response that could not be validated.",
  },
} as const;

export function AiAssistant({ point, points, locale, onOpen, onSettings }: { point: KnowledgePoint; points: KnowledgePoint[]; locale: Locale; onOpen: (id: string) => void; onSettings: () => void }) {
  const [configured, setConfigured] = useState(false);
  const [endpoint, setEndpoint] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AskResponse | undefined>();
  const [error, setError] = useState("");
  const searchIndex = useMemo(() => new KnowledgeSearchIndex(points), [points]);

  useEffect(() => {
    void getPreferences().then((preferences) => {
      const token = loadOwnerAccessToken();
      setEndpoint(preferences.aiEndpoint ?? "");
      setConfigured(preferences.aiEnabled && Boolean(preferences.aiEndpoint) && Boolean(token));
    });
  }, []);

  const ask = async () => {
    if (!question.trim()) return;
    const token = loadOwnerAccessToken();
    const localHits = searchIndex.search(question, locale, { level: "all", scopeIds: new Set() });
    const ids = [point.meta.id, ...localHits.slice(0, 8).map((hit) => hit.point.meta.id)];
    setLoading(true);
    setError("");
    setResponse(undefined);
    try {
      setResponse(await askAtlas(endpoint, token, { question: question.trim(), locale, knowledgePointIds: [...new Set(ids)].slice(0, 12) }));
    } catch (caught) {
      const kind = caught instanceof AiRequestError ? caught.kind : "model";
      setError(failureText[locale][kind]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="side-card ai-card ai-assistant">
      <div className="ai-heading"><span><Sparkles size={17} /></span><div><h2>Atlas AI</h2><small>{configured ? (locale === "zh-CN" ? "仅限站内知识" : "Atlas knowledge only") : (locale === "zh-CN" ? "尚未配置" : "Not configured")}</small></div></div>
      {!configured ? (
        <>
          <p>{locale === "zh-CN" ? "可选功能。配置后仅根据站内原创知识库回答；本地学习和搜索不受影响。" : "Optional. Once configured, answers use only Atlas content; local study and search are unaffected."}</p>
          <button type="button" onClick={onSettings}>{locale === "zh-CN" ? "前往设置" : "Open settings"} <ChevronRight size={15} /></button>
        </>
      ) : (
        <>
          <label className="ai-question"><Search size={14} /><input value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void ask(); }} placeholder={locale === "zh-CN" ? "围绕本页提问……" : "Ask about this topic…"} /></label>
          <button className="ai-ask" type="button" disabled={loading || !question.trim()} onClick={() => void ask()}>{loading ? (locale === "zh-CN" ? "正在生成……" : "Generating…") : (locale === "zh-CN" ? "基于知识库回答" : "Answer from Atlas")}</button>
          {error && <p className="ai-error" role="alert">{error}</p>}
          {response && <div className="ai-response"><p>{response.answer}</p><div>{response.citations.map((citation) => <button type="button" key={citation.knowledgePointId} onClick={() => onOpen(citation.knowledgePointId)}>{citation.title} <ChevronRight size={12} /></button>)}</div></div>}
        </>
      )}
    </section>
  );
}
