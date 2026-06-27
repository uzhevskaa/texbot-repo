import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Upload,
  FileText,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  Power,
} from "lucide-react";
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
import {
  BOT_THEME_OPTIONS,
  BOT_TONE_OPTIONS,
  DEFAULT_BOT_THEME,
  DEFAULT_BOT_TONE,
  getBot,
  getBotThemeOption,
  upsertBot,
  uid,
  type Bot,
  type BotStatus,
  type BotThemeColor,
  type BotTone,
} from "@/lib/bots";
import { cn } from "@/lib/utils";
import {
  brandStyles,
  controlStyles,
  interactionStyles,
  statusStyles,
  surfaceStyles,
  typographyStyles,
} from "@/lib/visual-styles";
import { toast } from "sonner";

export const Route = createFileRoute("/builder/$botId")({
  head: () => ({ meta: [{ title: "Bot builder — Texbot" }] }),
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
  const [tone, setTone] = useState<BotTone>(DEFAULT_BOT_TONE);
  const [themeColor, setThemeColor] = useState<BotThemeColor>(DEFAULT_BOT_THEME);
  const [dragging, setDragging] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const hasUnsavedChanges =
    isNew &&
    Boolean(
      name.trim() ||
      company.trim() ||
      docName ||
      docText ||
      status !== "active" ||
      tone !== DEFAULT_BOT_TONE ||
      themeColor !== DEFAULT_BOT_THEME,
    );
  const canSave = isNew || hasUnsavedChanges;
  const theme = getBotThemeOption(themeColor);

  useEffect(() => {
    if (isNew) return;
    const bot = getBot(botId);
    if (!bot) {
      toast.error("Chatbot not found");
      navigate({ to: "/" });
      return;
    }
    navigate({ to: "/bot/$botId", params: { botId: bot.id } });
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
    if (isNew) {
      navigate({ to: "/" });
      return;
    }
    navigate({ to: "/bot/$botId", params: { botId } });
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
      toast.error("Chatbot name and company name are required");
      return;
    }
    if (!docText.trim()) {
      toast.error("Please upload a knowledge .txt file");
      return;
    }
    const bot: Bot = {
      id: uid(),
      name: name.trim(),
      company: company.trim(),
      documentName: docName,
      documentText: docText,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      status,
      tone,
      themeColor,
    };
    upsertBot(bot);
    toast.success(isNew ? "Chatbot created!" : "Chatbot updated");
    navigate({ to: "/bot/$botId", params: { botId: bot.id } });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={requestLeave}
            className={cn("-ml-2 h-auto shrink-0 px-2 py-1", interactionStyles.quietButton)}
            aria-label={isNew ? "Back to dashboard" : "Back to bot overview"}
          >
            <ArrowLeft className="h-5 w-5" />
            {isNew ? "Dashboard" : "Bot overview"}
          </Button>
          <div className="flex min-w-0 items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${brandStyles.icon}`}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <span className={cn("truncate", typographyStyles.navTitle)}>New chatbot</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <h1 className={typographyStyles.pageTitle}>Build your chatbot</h1>
          <p className={cn("mt-2", typographyStyles.bodyMuted)}>
            Give it a name and connect the knowledge it needs to answer.
          </p>
        </div>

        <Card className={`p-6 ${surfaceStyles.card} sm:p-8`}>
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
              <Label htmlFor="company">Company name</Label>
              <Textarea
                id="company"
                placeholder="e.g. Acme Studio"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                rows={2}
              />
              <p className={typographyStyles.meta}>
                Used in the chat intro: “Trained on Acme Studio's knowledge.”
              </p>
            </div>

            <div className={`${surfaceStyles.softPanel} px-4 py-4`}>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <div className={typographyStyles.panelTitle}>Customization</div>
                  <p className={cn("mt-1", typographyStyles.meta)}>Included in Bots' friend</p>
                </div>
                <span className={controlStyles.pill}>Bots' friend</span>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Tone of voice</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {BOT_TONE_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={tone === option.value ? "default" : "outline"}
                        className={cn("justify-center", tone === option.value && "shadow-soft")}
                        onClick={() => setTone(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {BOT_THEME_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        aria-label={option.label}
                        onClick={() => setThemeColor(option.value)}
                        className={cn(
                          controlStyles.swatchButton,
                          themeColor === option.value &&
                            "ring-2 ring-foreground ring-offset-2 ring-offset-background",
                        )}
                      >
                        <span className={cn(controlStyles.swatch, option.swatchClass)} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className={controlStyles.previewPanel}>
                  <span className="font-medium text-foreground">Preview:</span> {theme.label} theme
                  with a {tone} tone of voice.
                </div>
              </div>
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
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 ${surfaceStyles.dashedDropzone} ${
                  dragging
                    ? "border-primary bg-accent"
                    : "border-border hover:border-primary hover:bg-accent/40"
                }`}
              >
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl shadow-soft",
                    theme.botAccentClass,
                  )}
                >
                  <Upload className="h-5 w-5" />
                </div>
                <div className={typographyStyles.panelTitle}>
                  {docName ? "Replace file" : "Click or drag a .txt file"}
                </div>
                <div className={typographyStyles.meta}>Max 2MB</div>
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
                <div
                  className={`mt-2 flex items-center justify-between text-sm ${surfaceStyles.fileRow}`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate">{docName}</span>
                    <span className={cn("shrink-0", typographyStyles.meta)}>
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
                    className={cn("rounded p-1", interactionStyles.destructiveIconButton)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className={`${surfaceStyles.softPanel} px-4 py-3`}>
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className={typographyStyles.panelTitle}>Status</span>
                  <span className={typographyStyles.meta}>
                    Control whether this bot accepts messages.
                  </span>
                </div>
                <Switch
                  id="status"
                  checked={status === "active"}
                  onCheckedChange={(checked) => setStatus(checked ? "active" : "inactive")}
                  className={`${statusStyles.active.switch} ${statusStyles.inactive.switch}`}
                />
              </div>

              <div
                className={`rounded-lg border px-4 py-3 text-sm ${
                  status === "active" ? statusStyles.active.panel : statusStyles.inactive.panel
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium">
                  <Power className="h-3.5 w-3.5" />
                  {status === "active" ? "Active" : "Inactive"}
                </div>
                <p className={cn("mt-1", typographyStyles.meta)}>
                  {status === "active"
                    ? "This bot can answer messages in test chat and embedded widget."
                    : "This bot will be saved, but won't accept messages until you activate it."}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className={typographyStyles.meta}>
                {!isNew && (
                  <span
                    className={`inline-flex items-center gap-1.5 ${
                      hasUnsavedChanges ? statusStyles.inactive.text : statusStyles.active.text
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
                  className={brandStyles.ctaButton}
                >
                  Create chatbot
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
