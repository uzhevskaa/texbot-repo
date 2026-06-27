export type Message = { id: string; role: "user" | "assistant"; content: string; ts: number };

export type BotStatus = "active" | "inactive";

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

/** Naive simulated AI: search document for sentences containing query keywords. */
export function simulateAnswer(bot: Bot, question: string): string {
  const q = question.toLowerCase();
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
    return `Hi! I'm ${bot.name}, the assistant for ${bot.company}. I don't have any knowledge documents yet — try uploading one in the builder.`;
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
    return `Hi there! I'm ${bot.name}, ${bot.company}'s assistant. Ask me anything about our company.`;
  }

  if (!top.length) {
    return `Hmm, I couldn't find that in ${bot.company}'s knowledge base. Could you rephrase, or ask something more specific?`;
  }
  return top.join(" ");
}
