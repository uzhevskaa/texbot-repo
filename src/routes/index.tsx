import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Plus,
  MessageSquare,
  Code2,
  Trash2,
  Power,
  MoreHorizontal,
  FileText,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SubscriptionBadge } from "@/components/SubscriptionBadge";
import { TexbotLogoMark } from "@/components/TexbotLogoMark";
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
  DropdownMenu,
  DropdownMenuSeparator,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteBot, getBotThemeOption, loadBots, upsertBot, type Bot } from "@/lib/bots";
import { cn } from "@/lib/utils";
import {
  brandStyles,
  interactionStyles,
  statusStyles,
  surfaceStyles,
  typographyStyles,
} from "@/lib/visual-styles";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Texbot — Build AI chatbots in minutes" },
      {
        name: "description",
        content:
          "No-code chatbot builder. Upload a knowledge file, get an embeddable AI assistant for your site.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [bots, setBots] = useState<Bot[]>([]);

  useEffect(() => {
    setBots(loadBots());
  }, []);

  function handleDelete(bot: Bot) {
    deleteBot(bot.id);
    setBots(loadBots());
    toast(`Deleted "${bot.name}"`, {
      className:
        "border-slate-300 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
      action: {
        label: "Undo",
        onClick: () => {
          upsertBot(bot);
          setBots(loadBots());
          toast.success(`Restored "${bot.name}"`);
        },
      },
    });
  }

  function handleToggleStatus(bot: Bot) {
    const nextStatus = bot.status === "active" ? "inactive" : "active";
    upsertBot({ ...bot, status: nextStatus, updatedAt: Date.now() });
    setBots(loadBots());
    if (nextStatus === "inactive") {
      toast(`"${bot.name}" is now inactive`, {
        className:
          "border-slate-300 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
      });
      return;
    }
    toast.success(`"${bot.name}" is now active`);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-4">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${brandStyles.icon}`}
            >
              <TexbotLogoMark className="h-4.5 w-4.5" />
            </div>
            <span className={cn("hidden truncate sm:inline", typographyStyles.brand)}>Texbot</span>
          </Link>
          <div className="flex min-w-0 shrink items-center justify-end gap-3">
            <SubscriptionBadge showUntil className="max-w-[42vw] px-3 font-medium sm:max-w-none" />
            <Link to="/builder" className="shrink-0">
              <Button className={brandStyles.button}>
                <Plus className="h-4 w-4 sm:mr-1" />
                <span className="sm:hidden">New</span>
                <span className="hidden sm:inline">Create new chatbot</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className={typographyStyles.pageTitle}>Your chatbots</h1>
          <p className={typographyStyles.bodyMuted}>
            Build, train, and embed AI assistants powered by your own knowledge base.
          </p>
        </div>

        {bots.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[repeat(3,minmax(0,1fr))]">
            {bots.map((bot) => (
              <BotCard
                key={bot.id}
                bot={bot}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <Card
      className={`flex flex-col items-center justify-center border-dashed bg-card px-6 py-16 text-center ${surfaceStyles.card}`}
    >
      <div
        className={`mb-5 flex h-16 w-16 items-center justify-center rounded-full ${brandStyles.emptyIcon}`}
      >
        <TexbotLogoMark className="h-7 w-7" />
      </div>
      <h2 className={typographyStyles.sectionTitle}>No chatbots yet</h2>
      <p className={cn("mt-2 max-w-sm", typographyStyles.bodyMuted)}>
        Create your first AI assistant. Upload a .txt knowledge file, give it a name, and you're
        ready in seconds.
      </p>
      <Link to="/builder" className="mt-6">
        <Button size="lg" className={brandStyles.button}>
          <Plus className="mr-1 h-4 w-4" /> Create new chatbot
        </Button>
      </Link>
    </Card>
  );
}

function BotCard({
  bot,
  onDelete,
  onToggleStatus,
}: {
  bot: Bot;
  onDelete: (bot: Bot) => void;
  onToggleStatus: (bot: Bot) => void;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const updatedDate = formatDateTime(bot.updatedAt);
  const messageCount = bot.messages?.length ?? 0;
  const isActive = bot.status === "active";
  const theme = getBotThemeOption(bot.themeColor);
  return (
    <Card
      className={`flex min-w-0 flex-col gap-5 border bg-card p-5 ${surfaceStyles.card} transition-all hover:-translate-y-0.5 hover:shadow-elegant`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${surfaceStyles.card} ${theme.botAccentClass}`}
          >
            <TexbotLogoMark className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className={cn("truncate", typographyStyles.cardTitle)}>{bot.name}</h3>
            <p className={cn("truncate", typographyStyles.meta)}>{bot.company}</p>
          </div>
        </div>
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 shrink-0", interactionStyles.iconButton)}
                aria-label="Open chatbot actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/widget/$botId" params={{ botId: bot.id }} search={{ from: "dashboard" }}>
                  <Code2 className="h-4 w-4" />
                  Widget code
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onToggleStatus(bot)}>
                <Power className="h-4 w-4" />
                {isActive ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                onSelect={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                onClick={() => {
                  onDelete(bot);
                  setDeleteOpen(false);
                }}
              >
                Delete chatbot
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className={cn("flex flex-col gap-2", typographyStyles.meta)}>
        <div className="flex min-w-0 items-center justify-between gap-3">
          <span className="inline-flex min-w-0 items-center gap-2">
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{bot.documentName}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5">
            <MessageCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{messageCount}</span>
          </span>
        </div>
      </div>

      <div className={cn("flex items-center justify-between gap-3", typographyStyles.meta)}>
        <span>Updated {updatedDate}</span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 ${typographyStyles.metaStrong} ${
            isActive ? statusStyles.active.badge : statusStyles.inactive.badge
          }`}
        >
          <Power className="h-3 w-3" />
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="mt-auto flex gap-2">
        <Link to="/bot/$botId" params={{ botId: bot.id }} className="flex-1">
          <Button variant="default" className={`w-full ${brandStyles.button}`}>
            Manage
          </Button>
        </Link>
        <Link
          to="/chat/$botId"
          params={{ botId: bot.id }}
          search={{ from: "dashboard" }}
          className="flex-1"
        >
          <Button variant="outline" className="w-full">
            <MessageSquare className="mr-1 h-4 w-4" /> Test chat
          </Button>
        </Link>
      </div>
    </Card>
  );
}

function formatDateTime(value: number) {
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
