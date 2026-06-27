import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bot as BotIcon,
  CalendarDays,
  Code2,
  FileText,
  MessageCircle,
  Pencil,
  Power,
  Rocket,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  BOT_THEME_OPTIONS,
  BOT_TONE_OPTIONS,
  DEFAULT_BOT_THEME,
  DEFAULT_BOT_TONE,
  deleteBot,
  getBot,
  getBotThemeOption,
  upsertBot,
  type Bot,
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

export const Route = createFileRoute("/bot/$botId")({
  head: () => ({ meta: [{ title: "Bot overview — Texbot" }] }),
  component: BotOverview,
});

function BotOverview() {
  const { botId } = Route.useParams();
  const navigate = useNavigate();
  const [bot, setBot] = useState<Bot | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [baseOpen, setBaseOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftCompany, setDraftCompany] = useState("");
  const [draftTone, setDraftTone] = useState<BotTone>("friendly");
  const [draftThemeColor, setDraftThemeColor] = useState<BotThemeColor>("violet");
  const [draftDocName, setDraftDocName] = useState("");
  const [draftDocText, setDraftDocText] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const isActive = bot.status === "active";
  const messageCount = bot.messages?.length ?? 0;
  const createdDate = formatDate(bot.createdAt);
  const updatedDate = formatDate(bot.updatedAt);
  const knowledgeSize = bot.documentText.length.toLocaleString();
  const theme = getBotThemeOption(bot.themeColor);

  function persistBot(nextBot: Bot, message: string) {
    upsertBot(nextBot);
    setBot(nextBot);
    toast.success(message);
  }

  function openDetailsDialog() {
    setDraftName(bot.name);
    setDraftCompany(bot.company);
    setDraftTone(bot.tone ?? DEFAULT_BOT_TONE);
    setDraftThemeColor(bot.themeColor ?? DEFAULT_BOT_THEME);
    setDetailsOpen(true);
  }

  function saveDetails() {
    if (!draftName.trim() || !draftCompany.trim()) {
      toast.error("Chatbot name and company name are required");
      return;
    }
    persistBot(
      {
        ...bot,
        name: draftName.trim(),
        company: draftCompany.trim(),
        tone: draftTone,
        themeColor: draftThemeColor,
        updatedAt: Date.now(),
      },
      "Bot details updated",
    );
    setDetailsOpen(false);
  }

  async function handleBaseFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".txt")) {
      toast.error("Please upload a .txt file");
      return;
    }
    if (file.size > 2_000_000) {
      toast.error("File too large (max 2MB)");
      return;
    }
    const text = await file.text();
    setDraftDocName(file.name);
    setDraftDocText(text);
    toast.success(`Loaded ${file.name}`);
  }

  function openBaseDialog() {
    setDraftDocName("");
    setDraftDocText("");
    setDragging(false);
    setBaseOpen(true);
  }

  function saveBase() {
    if (!draftDocText.trim()) {
      toast.error("Please upload a knowledge .txt file");
      return;
    }
    persistBot(
      {
        ...bot,
        documentName: draftDocName,
        documentText: draftDocText,
        updatedAt: Date.now(),
      },
      "Knowledge base updated",
    );
    setBaseOpen(false);
  }

  function handleStatusChange(checked: boolean) {
    const nextBot: Bot = {
      ...bot,
      status: checked ? "active" : "inactive",
      updatedAt: Date.now(),
    };
    upsertBot(nextBot);
    setBot(nextBot);
    if (checked) {
      toast.success(`${nextBot.name} is now active`);
      return;
    }
    toast(`${nextBot.name} is now inactive`, {
      className:
        "border-slate-300 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
    });
  }

  function handleDelete() {
    const deletedBot = bot;
    deleteBot(deletedBot.id);
    toast(`Deleted "${deletedBot.name}"`, {
      className:
        "border-slate-300 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
      action: {
        label: "Undo",
        onClick: () => {
          upsertBot(deletedBot);
          toast.success(`Restored "${deletedBot.name}"`);
          navigate({ to: "/bot/$botId", params: { botId: deletedBot.id } });
        },
      },
    });
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-4">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
            Dashboard
          </Link>
          <div className="flex min-w-0 items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                theme.botAccentClass,
              )}
            >
              <BotIcon className="h-4 w-4" />
            </div>
            <span className={cn("truncate", typographyStyles.navTitle)}>Bot overview</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${typographyStyles.metaStrong} ${
                  isActive ? statusStyles.active.badge : statusStyles.inactive.badge
                }`}
              >
                <Power className="h-3.5 w-3.5" />
                {isActive ? "Active" : "Inactive"}
              </span>
              <span className={typographyStyles.meta}>Updated {updatedDate}</span>
            </div>

            <div className="flex min-w-0 items-center gap-2">
              <h1 className={cn("truncate", typographyStyles.pageTitle)}>{bot.name}</h1>
            </div>
            <div className="mt-2 flex max-w-2xl items-start gap-2">
              <p className={typographyStyles.bodyMuted}>{bot.company}</p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Link to="/chat/$botId" params={{ botId: bot.id }}>
              <Button className={theme.buttonClass}>
                <MessageCircle className="mr-1 h-4 w-4" />
                Test chat
              </Button>
            </Link>
            <Link to="/widget/$botId" params={{ botId: bot.id }}>
              <Button variant="outline">
                <Code2 className="mr-1 h-4 w-4" />
                Widget code
              </Button>
            </Link>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={interactionStyles.iconButton}
                    onClick={openDetailsDialog}
                    aria-label="Edit bot details"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit bot details</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={interactionStyles.destructiveIconButton}
                    onClick={() => setDeleteOpen(true)}
                    aria-label="Delete bot"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete bot</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <Card className={`min-w-0 p-6 ${surfaceStyles.card}`}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className={typographyStyles.sectionTitle}>Knowledge base</h2>
                <p className={cn("mt-1", typographyStyles.bodyMuted)}>
                  Source file and training content currently used by this chatbot.
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={openBaseDialog}>
                <Upload className="mr-1 h-4 w-4" />
                Update base
              </Button>
            </div>

            <div className="space-y-4">
              <InfoRow label="File" value={bot.documentName || "No file"} />
              <InfoRow label="Content size" value={`${knowledgeSize} characters`} />
              <InfoRow label="Last updated" value={updatedDate} />
            </div>
          </Card>

          <Card className={`min-w-0 self-start p-6 ${surfaceStyles.card}`}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className={typographyStyles.sectionTitle}>Status</h2>
                <p className={cn("mt-1", typographyStyles.bodyMuted)}>
                  Control whether this bot accepts messages.
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={handleStatusChange}
                className={`${statusStyles.active.switch} ${statusStyles.inactive.switch}`}
              />
            </div>

            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                isActive ? statusStyles.active.panel : statusStyles.inactive.panel
              }`}
            >
              <div className={typographyStyles.panelTitle}>{isActive ? "Active" : "Inactive"}</div>
              <p className={cn("mt-1", typographyStyles.meta)}>
                {isActive
                  ? "This bot is answering messages in test chat and embedded widget."
                  : "This bot is paused and won't accept messages until activated."}
              </p>
            </div>
          </Card>

          <Card className={`min-w-0 p-6 ${surfaceStyles.card} lg:col-span-2`}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className={typographyStyles.sectionTitle}>Activity</h2>
                <p className={cn("mt-1", typographyStyles.bodyMuted)}>
                  Basic usage and lifecycle details for this bot.
                </p>
              </div>
              <Rocket className="h-5 w-5 shrink-0 text-muted-foreground" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Metric
                icon={<MessageCircle className="h-4 w-4" />}
                label="Messages"
                value={messageCount.toLocaleString()}
              />
              <Metric
                icon={<CalendarDays className="h-4 w-4" />}
                label="Created"
                value={createdDate}
              />
              <Metric
                icon={<CalendarDays className="h-4 w-4" />}
                label="Updated"
                value={updatedDate}
              />
            </div>
          </Card>
        </section>
      </main>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit bot details</DialogTitle>
            <DialogDescription>
              Update the name and company shown in this bot's chat intro.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="bot-name">Chatbot name</Label>
              <Input
                id="bot-name"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bot-company">Company name</Label>
              <Textarea
                id="bot-company"
                value={draftCompany}
                onChange={(event) => setDraftCompany(event.target.value)}
                rows={2}
              />
              <p className={typographyStyles.meta}>
                Used in the chat intro: “Trained on {draftCompany || "Acme Studio"}'s knowledge.”
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
                        variant={draftTone === option.value ? "default" : "outline"}
                        className={cn(
                          "justify-center",
                          draftTone === option.value && "shadow-soft",
                        )}
                        onClick={() => setDraftTone(option.value)}
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
                        onClick={() => setDraftThemeColor(option.value)}
                        className={cn(
                          controlStyles.swatchButton,
                          draftThemeColor === option.value &&
                            "ring-2 ring-foreground ring-offset-2 ring-offset-background",
                        )}
                      >
                        <span className={cn(controlStyles.swatch, option.swatchClass)} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDetailsOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className={brandStyles.button} onClick={saveDetails}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={baseOpen} onOpenChange={setBaseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update knowledge base</DialogTitle>
            <DialogDescription>
              Upload a new .txt file. Existing chat history will be kept.
            </DialogDescription>
          </DialogHeader>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const file = event.dataTransfer.files?.[0];
              if (file) handleBaseFile(file);
            }}
            onClick={() => fileRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 ${surfaceStyles.dashedDropzone} ${
              dragging
                ? "border-primary bg-accent"
                : "border-border hover:border-primary hover:bg-accent/40"
            }`}
          >
            <div className={controlStyles.iconTile}>
              <Upload className="h-5 w-5" />
            </div>
            <div className={typographyStyles.panelTitle}>
              {draftDocName ? "Replace file" : "Click or drag a .txt file"}
            </div>
            <div className={typographyStyles.meta}>Max 2MB</div>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,text/plain"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleBaseFile(file);
              }}
            />
          </div>

          {draftDocName && (
            <div className={`flex items-center justify-between text-sm ${surfaceStyles.fileRow}`}>
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{draftDocName}</span>
                <span className={cn("shrink-0", typographyStyles.meta)}>
                  ({draftDocText.length.toLocaleString()} chars)
                </span>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setDraftDocName("");
                  setDraftDocText("");
                }}
                className={cn("rounded p-1", interactionStyles.destructiveIconButton)}
                aria-label="Remove selected file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setBaseOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!draftDocText.trim()}
              className={brandStyles.button}
              onClick={saveBase}
            >
              Update base
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {bot.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the chatbot, its knowledge file, and saved chat history from this
              device. You can undo it right after deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete chatbot
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">
      <span className={typographyStyles.statLabel}>{label}</span>
      <span className={cn("min-w-0 truncate text-right", typographyStyles.body, "font-medium")}>
        {value}
      </span>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className={surfaceStyles.metricPanel}>
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className={typographyStyles.statLabel}>{label}</div>
      <div className={cn("mt-1 truncate", typographyStyles.statValue)}>{value}</div>
    </div>
  );
}

function formatDate(value: number) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date(value))
    .replace(",", "");
}
