import type { Locale, MultipleChoiceItem, ShortAnswerItem } from "../../types/content";
import type { PracticeResult, ReviewRating } from "../../types/progress";

export type SelfRating = "forgot" | "difficult" | "okay" | "mastered";

export interface KeywordMatch {
  id: string;
  label: string;
  matched: boolean;
  matchedAlternative?: string;
}

export interface ShortAnswerScore {
  coverage: number;
  result: PracticeResult;
  groups: KeywordMatch[];
  manualOverride: boolean;
}

const englishStopWords = new Set(["a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in", "is", "it", "of", "on", "or", "that", "the", "to", "with"]);

export function normalizeAnswer(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^\p{Letter}\p{Number}\p{Script=Han}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function englishTokens(value: string): string[] {
  return normalizeAnswer(value).split(" ").filter((token) => token.length > 2 && !englishStopWords.has(token));
}

function phraseMatches(answer: string, alternative: string, locale: Locale): boolean {
  const normalizedAnswer = normalizeAnswer(answer);
  const normalizedAlternative = normalizeAnswer(alternative);
  if (!normalizedAlternative) return false;
  if (normalizedAnswer.includes(normalizedAlternative)) return true;

  if (locale === "en") {
    const tokens = englishTokens(normalizedAlternative);
    if (tokens.length === 0) return false;
    const answerTokens = new Set(englishTokens(normalizedAnswer));
    const covered = tokens.filter((token) => answerTokens.has(token)).length / tokens.length;
    return covered >= 0.67;
  }

  const alternativeChars = [...new Set(normalizedAlternative.replace(/\s/g, ""))];
  const answerChars = new Set(normalizedAnswer.replace(/\s/g, ""));
  const covered = alternativeChars.filter((character) => answerChars.has(character)).length / Math.max(1, alternativeChars.length);
  return alternativeChars.length >= 4 && covered >= 0.72;
}

export function classifyCoverage(coverage: number): PracticeResult {
  if (coverage >= 0.8) return "correct";
  if (coverage >= 0.5) return "partial";
  return "incorrect";
}

export function scoreShortAnswer(item: ShortAnswerItem, answer: string, locale: Locale): ShortAnswerScore {
  const groups = item.keywordGroups.map<KeywordMatch>((group) => {
    const alternative = group.alternatives[locale].find((candidate) => phraseMatches(answer, candidate, locale));
    return {
      id: group.id,
      label: group.label[locale],
      matched: alternative !== undefined,
      ...(alternative ? { matchedAlternative: alternative } : {}),
    };
  });
  const coverage = groups.filter((group) => group.matched).length / Math.max(1, groups.length);
  return { coverage, result: classifyCoverage(coverage), groups, manualOverride: false };
}

export function overrideShortAnswer(score: ShortAnswerScore, result: PracticeResult): ShortAnswerScore {
  return { ...score, result, manualOverride: true };
}

export function scoreMultipleChoice(item: MultipleChoiceItem, optionId: string): PracticeResult {
  return optionId === item.correctOptionId ? "correct" : "incorrect";
}

export function ratingForResult(result: PracticeResult, selfRating: SelfRating = "okay"): ReviewRating {
  if (result === "incorrect") return "again";
  if (result === "partial") return "hard";
  if (selfRating === "mastered") return "easy";
  if (selfRating === "okay") return "good";
  return "hard";
}

export function ratingForFlashcard(selfRating: SelfRating): ReviewRating {
  if (selfRating === "forgot") return "again";
  if (selfRating === "difficult") return "hard";
  if (selfRating === "mastered") return "easy";
  return "good";
}
