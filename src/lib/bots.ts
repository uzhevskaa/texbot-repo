import { botThemeStyles } from "@/lib/visual-styles";

export type Message = { id: string; role: "user" | "assistant"; content: string; ts: number };

export type BotStatus = "active" | "inactive";
export type BotTone = "friendly" | "professional";
export type BotThemeColor = "violet" | "blue" | "emerald" | "amber" | "rose";

export const BOT_TONE_OPTIONS = [
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
] satisfies Array<{ value: BotTone; label: string }>;

export const BOT_THEME_OPTIONS = [
  {
    value: "violet",
    label: "Indigo",
    ...botThemeStyles.violet,
  },
  {
    value: "blue",
    label: "Cyan",
    ...botThemeStyles.blue,
  },
  {
    value: "emerald",
    label: "Slate",
    ...botThemeStyles.emerald,
  },
  {
    value: "amber",
    label: "Orchid",
    ...botThemeStyles.amber,
  },
  {
    value: "rose",
    label: "Ink",
    ...botThemeStyles.rose,
  },
] satisfies Array<{
  value: BotThemeColor;
  label: string;
  swatchClass: string;
  botAccentClass: string;
  buttonClass: string;
}>;

export const DEFAULT_BOT_TONE: BotTone = "friendly";
export const DEFAULT_BOT_THEME: BotThemeColor = "violet";

export function getBotThemeOption(themeColor: string | undefined) {
  return BOT_THEME_OPTIONS.find((option) => option.value === themeColor) ?? BOT_THEME_OPTIONS[0];
}

export type Bot = {
  id: string;
  name: string;
  company: string;
  documentName: string;
  documentText: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  status: BotStatus;
  tone: BotTone;
  themeColor: BotThemeColor;
};

const KEY = "chatbot-builder:bots";

export function loadBots(): Bot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const bots = raw ? (JSON.parse(raw) as Bot[]) : [];
    return bots.map((b) => ({
      ...b,
      updatedAt: b.updatedAt ?? b.createdAt,
      status: b.status ?? "active",
    }));
  } catch {
    return [];
  }
}

export function saveBots(bots: Bot[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(bots));
}

export function getBot(id: string): Bot | undefined {
  return loadBots().find((b) => b.id === id);
}

export function upsertBot(bot: Bot) {
  const bots = loadBots();
  const idx = bots.findIndex((b) => b.id === bot.id);
  if (idx >= 0) bots[idx] = bot;
  else bots.unshift(bot);
  saveBots(bots);
}

export function deleteBot(id: string) {
  saveBots(loadBots().filter((b) => b.id !== id));
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function getKnowledgeBaseQuestions(bot: Bot): string[] {
  const topics = extractKnowledgeTopics(bot.documentText);

  if (!topics.length) {
    return [
      `What should I know about ${bot.company}?`,
      `What can you help me with?`,
      `Summarize the knowledge base.`,
    ];
  }

  const questions = [
    `What does the knowledge base say about ${topics[0]}?`,
    topics[1] ? `Can you explain ${topics[1]}?` : `Summarize the key points.`,
    topics[2] ? `What are the important details about ${topics[2]}?` : `What should I know first?`,
  ];

  return questions.slice(0, 3);
}

function extractKnowledgeTopics(text: string): string[] {
  const stop = new Set([
    "about",
    "after",
    "also",
    "and",
    "are",
    "can",
    "company",
    "for",
    "from",
    "has",
    "have",
    "how",
    "into",
    "our",
    "that",
    "the",
    "their",
    "this",
    "with",
    "your",
  ]);
  const words = text
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 3 && !stop.has(word.toLowerCase()));

  const seen = new Set<string>();
  return words
    .filter((word) => {
      const key = word.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 3);
}

/** Naive simulated AI: search document for sentences containing query keywords. */
export function simulateAnswer(bot: Bot, question: string): string {
  if (bot.status === "inactive") {
    return "This bot isn't accepting messages right now.";
  }

  const q = question.toLowerCase();
  const isProfessional = bot.tone === "professional";
  const stop = new Set([
    "the",
    "a",
    "an",
    "is",
    "are",
    "what",
    "who",
    "how",
    "why",
    "when",
    "where",
    "do",
    "does",
    "of",
    "to",
    "in",
    "on",
    "for",
    "and",
    "or",
    "with",
    "i",
    "you",
    "me",
    "my",
    "your",
    "can",
    "please",
    "tell",
    "about",
  ]);
  const keywords = q
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stop.has(w));
  const sentences = bot.documentText
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (!sentences.length) {
    return isProfessional
      ? `Hello. I'm ${bot.name}, the assistant for ${bot.company}. No knowledge base has been added yet.`
      : `Hi! I'm ${bot.name}, the assistant for ${bot.company}. I don't have any knowledge documents yet.`;
  }

  const scored = sentences.map((s) => {
    const lower = s.toLowerCase();
    const score = keywords.reduce((acc, k) => acc + (lower.includes(k) ? 1 : 0), 0);
    return { s, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const top = scored
    .filter((x) => x.score > 0)
    .slice(0, 3)
    .map((x) => x.s);

  const greetings = ["hi", "hello", "hey", "yo", "greetings"];
  if (keywords.length === 0 || greetings.some((g) => q.trim().startsWith(g))) {
    return isProfessional
      ? `Hello. I'm ${bot.name}, ${bot.company}'s assistant. Ask me anything about ${bot.company}.`
      : `Hi there! I'm ${bot.name}, ${bot.company}'s assistant. Ask me anything about ${bot.company}.`;
  }

  if (!top.length) {
    return isProfessional
      ? `I couldn't find that in ${bot.company}'s knowledge base. Please rephrase or ask something more specific.`
      : `I couldn't find that in ${bot.company}'s knowledge base. Could you rephrase, or ask something more specific?`;
  }
  return top.join(" ");
}
