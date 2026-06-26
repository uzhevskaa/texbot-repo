import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Settings, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "@/components/ChatPanel";
import { getBot, type Bot } from "@/lib/bots";
import { toast } from "sonner";

export const Route = createFileRoute("/chat/$botId")({
  head: () => ({ meta: [{ title: "Chat — Botforge" }] }),
  component: ChatPage,
});

function ChatPage() {
  const { botId } = Route.useParams();
  const navigate = useNavigate();
  const [bot, setBot] = useState<Bot | null>(null);

  useEffect(() => {
    const b = getBot(botId);
    if (!b) {
      toast.error("Chatbot not found on this device");
      return;
    }
    setBot(b);
  }, [botId, navigate]);

  if (!bot) return null;

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="border-b bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="text-sm font-semibold">{bot.name}</div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/builder/$botId" params={{ botId: bot.id }}>
              <Button variant="ghost" size="sm">
                <Settings className="mr-1 h-4 w-4" /> Edit
              </Button>
            </Link>
            <Link to="/widget/$botId" params={{ botId: bot.id }}>
              <Button variant="outline" size="sm">
                <Code2 className="mr-1 h-4 w-4" /> Widget
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1 overflow-hidden px-0 sm:px-6 sm:py-6">
        <div className="flex-1 overflow-hidden border bg-card sm:rounded-2xl sm:shadow-elegant">
          <ChatPanel bot={bot} />
        </div>
      </div>
    </div>
  );
}
