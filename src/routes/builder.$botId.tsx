import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Upload, FileText, Sparkles, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [discardOpen, setDiscardOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const hasUnsavedChanges = isNew
    ? Boolean(name.trim() || company.trim() || docName || docText || status !== "active")
    : Boolean(
        existing &&
        (name !== existing.name ||
          company !== existing.company ||
          docName !== existing.documentName ||
          docText !== existing.documentText ||
          status !== (existing.status ?? "active")),
      );
  const canSave = isNew || hasUnsavedChanges;

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

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  function leaveBuilder() {
    navigate({ to: "/" });
  }

  function requestLeave() {
    if (hasUnsavedChanges) {
      setDiscardOpen(true);
      return;
    }
    leaveBuilder();
  }

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
      updatedAt: Date.now(),
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
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={requestLeave}
            className="-ml-2 text-muted-foreground hover:text-foreground"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
            Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-semibold">{isNew ? "New chatbot" : "Edit chatbot"}</span>
          </div>
          <div className="hidden min-w-[7rem] justify-end sm:flex">
            {!isNew && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                  hasUnsavedChanges
                    ? "bg-amber-500/10 text-amber-600"
                    : "bg-emerald-500/10 text-emerald-600"
                }`}
              >
                {hasUnsavedChanges ? (
                  <AlertCircle className="h-3.5 w-3.5" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                {hasUnsavedChanges ? "Unsaved changes" : "Saved"}
              </span>
            )}
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
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFile(file);
                }}
                onClick={() => fileRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all ${
                  dragging
                    ? "border-primary bg-accent"
                    : "border-border hover:border-primary hover:bg-accent/40"
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setDocName("");
                      setDocText("");
                    }}
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
                <span className="text-xs text-muted-foreground">
                  Inactive bots won't show as live in the dashboard.
                </span>
              </div>
              <Switch
                id="status"
                checked={status === "active"}
                onCheckedChange={(checked) => setStatus(checked ? "active" : "inactive")}
              />
            </div>

            <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-muted-foreground">
                {!isNew && (
                  <span
                    className={`inline-flex items-center gap-1.5 ${
                      hasUnsavedChanges ? "text-amber-600" : "text-emerald-600"
                    }`}
                  >
                    {hasUnsavedChanges ? (
                      <AlertCircle className="h-3.5 w-3.5" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    {hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" onClick={requestLeave}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  disabled={!canSave}
                  className="bg-gradient-brand text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]"
                >
                  {isNew ? "Create chatbot" : "Save changes"}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </main>

      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your edits to this chatbot have not been saved. If you leave now, those changes will
              be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={leaveBuilder}
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
