import type { Locale } from "./content";

export interface AskRequest {
  question: string;
  locale: Locale;
  knowledgePointIds: string[];
}

export interface AskCitation {
  knowledgePointId: string;
  title: string;
  route: string;
}

export interface AskResponse {
  answer: string;
  citations: AskCitation[];
  unsupported: boolean;
}

