import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bot as BotIcon, Plus, MessageSquare, Code2, Trash2, Sparkles, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { loadBots, deleteBot, type Bot } from "@/lib/bots";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Botforge — Build AI chatbots in minutes" },
      { name: "description", content: "No-code chatbot builder. Upload a knowledge file, get an embeddable AI assistant for your site." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [bots, setBots] = useState<Bot[]>([]);

  useEffect(() => {
    setBots(loadBots());
  }, []);

  function handleDelete(id: string, name: string) {
    deleteBot(id);
    setBots(loadBots());
    toast.success(`Deleted "${name}"`);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-soft">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Botforge</span>
          </Link>
          <Link to="/builder">
            <Button className="bg-gradient-brand text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]">
              <Plus className="mr-1 h-4 w-4" /> Create chatbot
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Your chatbots</h1>
          <p className="text-muted-foreground">
            Build, train, and embed AI assistants powered by your own knowledge base.
          </p>
        </div>

        {bots.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {bots.map((bot) => (
              <BotCard key={bot.id} bot={bot} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="flex flex-col items-center justify-center border-dashed bg-card px-6 py-16 text-center shadow-soft">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-elegant">
        <BotIcon className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-semibold">No chatbots yet</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Create your first AI assistant. Upload a .txt knowledge file, give it a name, and you're live in seconds.
      </p>
      <Link to="/builder" className="mt-6">
        <Button size="lg" className="bg-gradient-brand text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]">
          <Plus className="mr-1 h-4 w-4" /> Create chatbot
        </Button>
      </Link>
    </Card>
  );
}

function BotCard({ bot, onDelete }: { bot: Bot; onDelete: (id: string, name: string) => void }) {
  const date = new Date(bot.createdAt).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
  });
  const isActive = bot.status === "active";
  return (
    <Card className="group flex flex-col gap-5 border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-soft">
            <BotIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{bot.name}</h3>
            <p className="truncate text-xs text-muted-foreground">{bot.company}</p>
          </div>
        </div>
        <button
          onClick={() => onDelete(bot.id, bot.name)}
          className="shrink-0 rounded-md p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
          aria-label="Delete chatbot"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>Created {date}</span>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-medium ${isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
          <Power className="h-3 w-3" />
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="mt-auto flex gap-2">
        <Link to="/chat/$botId" params={{ botId: bot.id }} className="flex-1">
          <Button variant="default" className="w-full bg-gradient-brand text-primary-foreground shadow-soft">
            <MessageSquare className="mr-1 h-4 w-4" /> Chat
          </Button>
        </Link>
        <Link to="/widget/$botId" params={{ botId: bot.id }} className="flex-1">
          <Button variant="outline" className="w-full">
            <Code2 className="mr-1 h-4 w-4" /> Get Widget Code
          </Button>
        </Link>
      </div>
    </Card>
  );
}
