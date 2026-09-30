export type CourseLevel = "core" | "hl" | "extension";
export type Locale = "zh-CN" | "en";

export interface TextbookReference {
  chapter: string;
  section: string;
  pages: number[];
}

export interface KnowledgePointMeta {
  id: string;
  slug: string;
  section: string;
  level: CourseLevel;
  syllabusRefs: string[];
  textbookRefs: TextbookReference[];
  prerequisites: string[];
  related: string[];
  terms: string[];
  synonyms: Record<Locale, string[]>;
  diagramIds: string[];
  quizIds: string[];
}

export interface RealWorldExample {
  title: string;
  sourceUrl: string;
  observedAt: string;
  explanation: string;
}

export interface LocalizedKnowledgePoint {
  id: string;
  locale: Locale;
  title: string;
  takeaway: string;
  definition: string;
  explanation: string;
  causalChain: string[];
  realWorldExample?: RealWorldExample;
  misconceptions: string[];
  examApplication: string[];
  summary: string[];
}

export interface LocalizedText {
  "zh-CN": string;
  en: string;
}

interface PracticeBase {
  id: string;
  knowledgePointId: string;
  prompt: LocalizedText;
  explanation: LocalizedText;
}

export interface FlashcardItem extends PracticeBase {
  type: "flashcard";
  answer: LocalizedText;
}

export interface MultipleChoiceItem extends PracticeBase {
  type: "mcq";
  options: Array<LocalizedText & { id: string }>;
  correctOptionId: string;
}

export interface KeywordGroup {
  id: string;
  label: LocalizedText;
  alternatives: Record<Locale, string[]>;
}

export interface ShortAnswerItem extends PracticeBase {
  type: "short-answer";
  modelAnswer: LocalizedText;
  keywordGroups: KeywordGroup[];
}

export type PracticeItem = FlashcardItem | MultipleChoiceItem | ShortAnswerItem;

export interface KnowledgePoint {
  meta: KnowledgePointMeta;
  content: Record<Locale, LocalizedKnowledgePoint>;
  practice: PracticeItem[];
}

export interface ManifestEntry {
  id: string;
  section: string;
  level: CourseLevel;
  title: LocalizedText;
  pages: number[];
}

