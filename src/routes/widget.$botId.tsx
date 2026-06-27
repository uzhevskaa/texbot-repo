import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Copy, Check, Sparkles, MessageCircle, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmbedWidget } from "@/components/EmbedWidget";
import { getBot, type Bot } from "@/lib/bots";
import { toast } from "sonner";

export const Route = createFileRoute("/widget/$botId")({
  head: () => ({ meta: [{ title: "Embed widget — Botforge" }] }),
  component: WidgetPage,
});

function WidgetPage() {
  const { botId } = Route.useParams();
  const navigate = useNavigate();
  const [bot, setBot] = useState<Bot | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const b = getBot(botId);
    if (!b) {
      toast.error("Chatbot not found");
      navigate({ to: "/" });
      return;
    }
    setBot(b);
  }, [botId, navigate]);

  if (!bot) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const payload = btoa(
    unescape(
      encodeURIComponent(
        JSON.stringify({
          id: bot.id,
          name: bot.name,
          company: bot.company,
          documentName: bot.documentName,
          documentText: bot.documentText,
          createdAt: bot.createdAt,
          status: bot.status,
        }),
      ),
    ),
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const embedUrl = `${origin}/embed/${bot.id}?d=${payload}`;

  const scriptSnippet = `<!-- Botforge widget for ${bot.name} -->
<script src="${origin}/widget.js"></script>
<script>initWidget({ botId: "${bot.id}", embedUrl: "${embedUrl}" })</script>`;

  const iframeSnippet = `<!-- Botforge iframe embed for ${bot.name} -->
<iframe
  src="${embedUrl}"
  title="${bot.name} chat"
  style="width: 380px; height: 560px; max-width: 100%; border: 0; border-radius: 16px; box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);"
  allow="clipboard-write"
></iframe>`;

  async function copy() {
    await navigator.clipboard.writeText(scriptSnippet);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-6 py-4">
          <Link to="/" className="text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-semibold">Embed widget</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Embed {bot.name} on your site</h1>
          <p className="mt-2 text-muted-foreground">
            Copy the snippet below and paste it before{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">&lt;/body&gt;</code> on any
            page.
          </p>
        </div>

        <Card className="overflow-hidden shadow-soft">
          <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-chart-4/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-chart-2/70" />
              <span className="ml-2">embed-snippet.html</span>
            </div>
            <Button size="sm" variant="ghost" onClick={copy}>
              {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <pre className="overflow-x-auto bg-card p-5 text-xs leading-relaxed text-foreground">
            <code>{scriptSnippet}</code>
          </pre>
        </Card>

        <Card className="mt-6 overflow-hidden shadow-soft">
          <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Code2 className="h-4 w-4" />
              <span>iframe-fallback.html</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                await navigator.clipboard.writeText(iframeSnippet);
                toast.success("Iframe code copied");
              }}
            >
              <Copy className="mr-1 h-4 w-4" />
              Copy iframe
            </Button>
          </div>
          <pre className="overflow-x-auto bg-card p-5 text-xs leading-relaxed text-foreground">
            <code>{iframeSnippet}</code>
          </pre>
        </Card>

        <Card className="mt-8 flex items-start gap-4 border-dashed p-5 shadow-soft">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div className="text-sm">
            <div className="font-medium">Live preview</div>
            <p className="mt-0.5 text-muted-foreground">
              The floating chat button in the bottom-right corner is the live widget. Click it to
              try {bot.name}.
            </p>
          </div>
        </Card>
      </main>

      <EmbedWidget botId={bot.id} />
    </div>
  );
}
