import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Upload, FileText, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { getBot, upsertBot, uid, type Bot, type BotStatus } from "@/lib/bots";
import { toast } from "sonner";

export const Route = createFileRoute("/builder/$botId")({
  head: () => ({ meta: [{ title: "Bot builder — Botforge" }] }),
  component: Builder,
});

function Builder() {
  const { botId } = Route.useParams();
  const navigate = useNavigate();
  const isNew = botId === "new";

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [docName, setDocName] = useState("");
  const [docText, setDocText] = useState("");
  const [status, setStatus] = useState<BotStatus>("active");
  const [dragging, setDragging] = useState(false);
  const [existing, setExisting] = useState<Bot | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNew) return;
    const bot = getBot(botId);
    if (!bot) {
      toast.error("Chatbot not found");
      navigate({ to: "/" });
      return;
    }
    setExisting(bot);
    setName(bot.name);
    setCompany(bot.company);
    setDocName(bot.documentName);
    setDocText(bot.documentText);
    setStatus(bot.status ?? "active");
  }, [botId, isNew, navigate]);

  async function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".txt")) {
      toast.error("Please upload a .txt file");
      return;
    }
    if (file.size > 2_000_000) {
      toast.error("File too large (max 2MB)");
      return;
    }
    const text = await file.text();
    setDocName(file.name);
    setDocText(text);
    toast.success(`Loaded ${file.name}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !company.trim()) {
      toast.error("Name and company description are required");
      return;
    }
    if (!docText.trim()) {
      toast.error("Please upload a knowledge .txt file");
      return;
    }
    const bot: Bot = {
      id: existing?.id ?? uid(),
      name: name.trim(),
      company: company.trim(),
      documentName: docName,
      documentText: docText,
      createdAt: existing?.createdAt ?? Date.now(),
      messages: existing?.messages ?? [],
      status,
    };
    upsertBot(bot);
    toast.success(isNew ? "Chatbot created!" : "Chatbot updated");
    navigate({ to: "/chat/$botId", params: { botId: bot.id } });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-4">
          <Link to="/" className="text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-semibold">{isNew ? "New chatbot" : "Edit chatbot"}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            {isNew ? "Build your chatbot" : "Edit your chatbot"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Give it a personality and feed it knowledge. It'll start answering in seconds.
          </p>
        </div>

        <Card className="p-6 shadow-soft sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Chatbot name</Label>
              <Input
                id="name"
                placeholder="e.g. Ada, Support Bot"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="company">Company description</Label>
              <Textarea
                id="company"
                placeholder="A friendly description of your company, product, and tone of voice."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Knowledge base (.txt)</Label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFile(file);
                }}
                onClick={() => fileRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all ${
                  dragging ? "border-primary bg-accent" : "border-border hover:border-primary hover:bg-accent/40"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-soft">
                  <Upload className="h-5 w-5" />
                </div>
                <div className="text-sm font-medium">
                  {docName ? "Replace file" : "Click or drag a .txt file"}
                </div>
                <div className="text-xs text-muted-foreground">Max 2MB</div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".txt,text/plain"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </div>

              {docName && (
                <div className="mt-2 flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate">{docName}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      ({docText.length.toLocaleString()} chars)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setDocName(""); setDocText(""); }}
                    className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">Active on dashboard</span>
                <span className="text-xs text-muted-foreground">Inactive bots won't show as live in the dashboard.</span>
              </div>
              <Switch
                id="status"
                checked={status === "active"}
                onCheckedChange={(checked) => setStatus(checked ? "active" : "inactive")}
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-6">
              <Link to="/">
                <Button type="button" variant="ghost">Cancel</Button>
              </Link>
              <Button
                type="submit"
                size="lg"
                className="bg-gradient-brand text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]"
              >
                {isNew ? "Create chatbot" : "Save changes"}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
