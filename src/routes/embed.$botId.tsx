import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EmbedWidget } from "@/components/EmbedWidget";
import { getBot, type Bot } from "@/lib/bots";

export const Route = createFileRoute("/embed/$botId")({
  head: () => ({ meta: [{ title: "Embedded chat" }] }),
  component: EmbedPage,
});

function EmbedPage() {
  const { botId } = Route.useParams();
  const navigate = useNavigate();
  const [bot, setBot] = useState<Bot | null>(null);

  useEffect(() => {
    const b = getBot(botId);
    if (!b) {
      navigate({ to: "/" });
      return;
    }
    setBot(b);
  }, [botId, navigate]);

  if (!bot) return null;

  return (
    <div className="min-h-screen bg-transparent">
      <EmbedWidget botId={bot.id} />
    </div>
  );
}
