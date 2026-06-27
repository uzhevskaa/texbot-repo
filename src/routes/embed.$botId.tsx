import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";
import { getBot, type Bot } from "@/lib/bots";

type EmbedSearch = { d?: string };

export const Route = createFileRoute("/embed/$botId")({
  head: () => ({ meta: [{ title: "Embedded chat" }] }),
  validateSearch: (s: Record<string, unknown>): EmbedSearch => ({
    d: typeof s.d === "string" ? s.d : undefined,
  }),
  component: EmbedPage,
});

function decodeBotParam(d: string | undefined): Bot | null {
  if (!d) return null;
  try {
    const json = decodeURIComponent(escape(atob(d.replace(/-/g, "+").replace(/_/g, "/"))));
    const parsed = JSON.parse(json) as Partial<Bot>;
    if (!parsed.id || !parsed.name) return null;
    return {
      id: parsed.id,
      name: parsed.name,
      company: parsed.company ?? "",
      documentName: parsed.documentName ?? "",
      documentText: parsed.documentText ?? "",
      createdAt: parsed.createdAt ?? Date.now(),
      updatedAt: parsed.updatedAt ?? parsed.createdAt ?? Date.now(),
      messages: [],
      status: parsed.status ?? "active",
    };
  } catch {
    return null;
  }
}

function EmbedPage() {
  const { botId } = Route.useParams();
  const { d } = Route.useSearch();
  const [bot, setBot] = useState<Bot | null>(null);
  const [ready, setReady] = useState(false);

  const fromUrl = useMemo(() => decodeBotParam(d), [d]);

  useEffect(() => {
    const local = getBot(botId);
    setBot(local ?? fromUrl ?? null);
    setReady(true);
  }, [botId, fromUrl]);

  if (!ready) return null;

  if (!bot) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background p-6">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground">
            <MessageCircle className="h-6 w-6" />
          </div>
          <h1 className="text-base font-semibold">Chatbot not available</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            This chatbot could not be loaded on this domain. Re-copy the embed snippet from your
            dashboard so it includes the bot data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-background">
      <ChatPanel bot={bot} persist={false} className="h-full" />
    </div>
  );
}
