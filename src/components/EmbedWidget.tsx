import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";
import { getBot, type Bot } from "@/lib/bots";
import { cn } from "@/lib/utils";

export function EmbedWidget({ botId }: { botId: string }) {
  const [open, setOpen] = useState(false);
  const [bot, setBot] = useState<Bot | null>(null);

  useEffect(() => {
    const b = getBot(botId);
    if (b) setBot(b);
  }, [botId]);

  if (!bot) return null;

  return (
    <>
      <div
        className={cn(
          "pointer-events-auto fixed bottom-24 right-6 z-40 w-[min(380px,calc(100vw-2rem))] origin-bottom-right overflow-hidden rounded-2xl border bg-card shadow-elegant transition-all",
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        )}
        style={{ height: "min(560px, calc(100vh - 8rem))" }}
      >
        <ChatPanel bot={bot} persist={false} />
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground shadow-elegant transition-transform hover:scale-110 active:scale-95"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}
