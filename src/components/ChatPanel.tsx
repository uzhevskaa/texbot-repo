import { useEffect, useRef, useState } from "react";
import { Send, Bot as BotIcon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getBotThemeOption,
  simulateAnswer,
  type Bot,
  type Message,
  uid,
  upsertBot,
} from "@/lib/bots";
import { cn } from "@/lib/utils";
import { typographyStyles } from "@/lib/visual-styles";

type Props = {
  bot: Bot;
  persist?: boolean;
  className?: string;
};

export function ChatPanel({ bot, persist = true, className }: Props) {
  const [messages, setMessages] = useState<Message[]>(bot.messages ?? []);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInactive = bot.status === "inactive";
  const theme = getBotThemeOption(bot.themeColor);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function send() {
    const text = input.trim();
    if (!text || typing || isInactive) return;
    const userMsg: Message = { id: uid(), role: "user", content: text, ts: Date.now() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setTyping(true);

    const delay = 600 + Math.random() * 900;
    setTimeout(() => {
      const reply: Message = {
        id: uid(),
        role: "assistant",
        content: simulateAnswer(bot, text),
        ts: Date.now(),
      };
      const finalMsgs = [...next, reply];
      setMessages(finalMsgs);
      setTyping(false);
      if (persist) upsertBot({ ...bot, messages: finalMsgs });
      requestAnimationFrame(() => inputRef.current?.focus());
    }, delay);
  }

  return (
    <div className={cn("flex h-full flex-col bg-card", className)}>
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full shadow-soft",
            theme.botAccentClass,
          )}
        >
          <BotIcon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className={cn("truncate", typographyStyles.navTitle)}>{bot.name}</div>
          <div className={cn("truncate", typographyStyles.meta)}>{bot.company}</div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        {isInactive && (
          <div className="mx-auto mb-6 flex max-w-md flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <BotIcon className="h-6 w-6" />
            </div>
            <h3 className={typographyStyles.cardTitle}>This bot is inactive</h3>
            <p className={cn("mt-1", typographyStyles.bodyMuted)}>
              This bot isn't accepting messages right now.
            </p>
          </div>
        )}

        {messages.length === 0 && !isInactive && (
          <div className="mx-auto flex max-w-md flex-col items-center text-center">
            <div
              className={cn(
                "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-elegant",
                theme.botAccentClass,
              )}
            >
              <BotIcon className="h-6 w-6" />
            </div>
            <h3 className={typographyStyles.cardTitle}>Chat with {bot.name}</h3>
            <p className={cn("mt-1", typographyStyles.bodyMuted)}>
              Trained on {bot.company}'s knowledge. Ask anything to get started.
            </p>
          </div>
        )}

        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} botAccentClass={theme.botAccentClass} />
          ))}
          {typing && (
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  theme.botAccentClass,
                )}
              >
                <BotIcon className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3">
                <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
                <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
                <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t bg-card px-4 py-3">
        <form
          className="mx-auto flex max-w-3xl items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isInactive ? "This bot is inactive" : `Message ${bot.name}…`}
            disabled={isInactive}
            className="h-11 rounded-full border-muted bg-background px-4 focus-visible:ring-primary"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || typing || isInactive}
            className={cn("h-11 w-11 shrink-0 rounded-full", theme.buttonClass)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({ message, botAccentClass }: { message: Message; botAccentClass: string }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-secondary text-secondary-foreground" : botAccentClass,
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <BotIcon className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
