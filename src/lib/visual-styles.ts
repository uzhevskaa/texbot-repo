export const brandStyles = {
  icon: "bg-gradient-brand text-primary-foreground shadow-soft",
  button:
    "bg-gradient-brand text-primary-foreground shadow-soft transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-px hover:brightness-105 hover:shadow-interactive active:translate-y-0 active:brightness-100 disabled:bg-none disabled:bg-[var(--color-disabled)] disabled:text-[var(--color-disabled-foreground)] disabled:opacity-100",
  ctaButton:
    "bg-gradient-brand text-primary-foreground shadow-soft transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-px hover:brightness-105 hover:shadow-elegant active:translate-y-0 active:brightness-100 disabled:bg-none disabled:bg-[var(--color-disabled)] disabled:text-[var(--color-disabled-foreground)] disabled:opacity-100",
  emptyIcon: "bg-gradient-brand text-primary-foreground shadow-elegant",
};

export const botThemeStyles = {
  violet: {
    swatchClass: "bg-gradient-to-br from-indigo-500 to-blue-600",
    botAccentClass: "bg-gradient-to-br from-indigo-500 to-blue-600 text-white",
    buttonClass:
      "bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-soft transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-px hover:brightness-105 hover:shadow-interactive active:translate-y-0 active:brightness-100 disabled:bg-none disabled:bg-[var(--color-disabled)] disabled:text-[var(--color-disabled-foreground)] disabled:opacity-100",
  },
  blue: {
    swatchClass: "bg-gradient-to-br from-cyan-500 to-sky-600",
    botAccentClass: "bg-gradient-to-br from-cyan-500 to-sky-600 text-white",
    buttonClass:
      "bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-soft transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-px hover:brightness-105 hover:shadow-interactive active:translate-y-0 active:brightness-100 disabled:bg-none disabled:bg-[var(--color-disabled)] disabled:text-[var(--color-disabled-foreground)] disabled:opacity-100",
  },
  emerald: {
    swatchClass: "bg-gradient-to-br from-slate-500 to-slate-700",
    botAccentClass: "bg-gradient-to-br from-slate-500 to-slate-700 text-white",
    buttonClass:
      "bg-gradient-to-br from-slate-500 to-slate-700 text-white shadow-soft transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-px hover:brightness-105 hover:shadow-interactive active:translate-y-0 active:brightness-100 disabled:bg-none disabled:bg-[var(--color-disabled)] disabled:text-[var(--color-disabled-foreground)] disabled:opacity-100",
  },
  amber: {
    swatchClass: "bg-gradient-to-br from-fuchsia-500 to-violet-600",
    botAccentClass: "bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white",
    buttonClass:
      "bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white shadow-soft transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-px hover:brightness-105 hover:shadow-interactive active:translate-y-0 active:brightness-100 disabled:bg-none disabled:bg-[var(--color-disabled)] disabled:text-[var(--color-disabled-foreground)] disabled:opacity-100",
  },
  rose: {
    swatchClass: "bg-gradient-to-br from-zinc-600 to-slate-800",
    botAccentClass: "bg-gradient-to-br from-zinc-600 to-slate-800 text-white",
    buttonClass:
      "bg-gradient-to-br from-zinc-600 to-slate-800 text-white shadow-soft transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-px hover:brightness-105 hover:shadow-interactive active:translate-y-0 active:brightness-100 disabled:bg-none disabled:bg-[var(--color-disabled)] disabled:text-[var(--color-disabled-foreground)] disabled:opacity-100",
  },
};

export const surfaceStyles = {
  card: "shadow-soft",
  elevatedCard: "shadow-elegant",
  softPanel: "rounded-lg border bg-muted/40",
  fileRow: "rounded-lg border bg-muted/40 px-3 py-2",
  metricPanel: "rounded-lg border bg-muted/40 p-4",
  codeHeader: "border-b bg-muted/40 px-4 py-2.5",
  dashedDropzone: "rounded-xl border border-dashed px-6 py-10 text-center transition-all",
  widgetShell: "rounded-2xl border bg-card shadow-elegant",
};

export const statusStyles = {
  active: {
    label: "Active",
    badge: "bg-success-soft text-success",
    panel: "border-success/20 bg-success-soft",
    switch: "data-[state=checked]:bg-success",
    text: "text-success",
  },
  inactive: {
    label: "Inactive",
    badge: "bg-warning-soft text-warning",
    panel: "border-warning/20 bg-warning-soft",
    switch: "data-[state=unchecked]:bg-warning",
    text: "text-warning",
  },
};

export const codePreviewStyles = {
  trafficDotMuted: "bg-muted-foreground/30",
  trafficDotAccent: "bg-accent-foreground/25",
};

export const controlStyles = {
  pill: "rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground",
  previewPanel: "rounded-lg border bg-background px-4 py-3 text-sm text-muted-foreground",
  swatchButton:
    "relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background shadow-soft transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-px hover:border-foreground/15 hover:shadow-interactive active:translate-y-0",
  swatch: "h-7 w-7 rounded-full",
  iconTile:
    "flex h-10 w-10 items-center justify-center rounded-lg border bg-muted/70 text-muted-foreground shadow-soft",
};

export const interactionStyles = {
  quietButton:
    "text-muted-foreground hover:bg-transparent hover:text-foreground focus-visible:bg-transparent",
  iconButton: "text-muted-foreground hover:bg-accent/80 hover:text-foreground",
  destructiveIconButton:
    "text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:ring-destructive/30",
  floatingButton:
    "shadow-floating transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-elegant active:translate-y-0 active:scale-[0.98]",
};

export const typographyStyles = {
  brand: "text-lg font-semibold tracking-tight",
  navTitle: "text-sm font-semibold",
  pageTitle: "text-3xl font-bold tracking-tight",
  sectionTitle: "text-lg font-semibold",
  cardTitle: "text-base font-semibold",
  panelTitle: "text-sm font-medium",
  body: "text-sm text-foreground",
  bodyMuted: "text-sm text-muted-foreground",
  meta: "text-xs text-muted-foreground",
  metaStrong: "text-xs font-medium",
  statLabel: "text-sm text-muted-foreground",
  statValue: "text-lg font-semibold",
  code: "text-xs leading-relaxed text-foreground",
};
