import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PRICING_PLANS } from "@/lib/subscription";
import { cn } from "@/lib/utils";
import { brandStyles, surfaceStyles, typographyStyles } from "@/lib/visual-styles";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PricingPlansDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto border-0 bg-transparent p-4 shadow-none [&>button]:hidden sm:p-6">
        <div className="rounded-[28px] border bg-background/96 p-6 shadow-elegant backdrop-blur sm:p-8">
          <DialogHeader className="items-start text-left">
            <div className="flex w-full items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  choose your champion
                </p>
                <DialogTitle className="mt-2 text-3xl font-semibold tracking-tight">
                  Pricing plans
                </DialogTitle>
              </div>
              <DialogClose asChild>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-soft transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label="Close pricing popup"
                >
                  <X className="h-4 w-4" />
                </button>
              </DialogClose>
            </div>
            <DialogDescription className="max-w-2xl text-sm leading-6">
              Pick the setup that fits your team today. All buttons here simply close this popup.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {PRICING_PLANS.map((plan) => (
              <section
                key={plan.id}
                className={cn(
                  "relative flex h-full flex-col rounded-3xl border p-5 sm:p-6",
                  surfaceStyles.card,
                  plan.featured
                    ? "border-primary/20 bg-gradient-to-b from-accent/60 via-background to-background"
                    : "bg-card",
                )}
              >
                <div className="mb-6 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {plan.eyebrow}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                      {plan.name}
                    </h3>
                  </div>
                  {plan.featured && (
                    <span className="rounded-full border border-primary/15 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                      Popular
                    </span>
                  )}
                </div>

                <p className={cn("min-h-12", typographyStyles.bodyMuted)}>{plan.description}</p>

                <div className="mt-6">
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                    {plan.price}
                  </p>
                </div>

                <div className="mt-6 flex-1">
                  <p className="text-sm font-medium text-foreground">What&apos;s included:</p>
                  <ul className="mt-3 grid gap-0">
                    {plan.included.map((item) => (
                      <li
                        key={item}
                        className="flex min-h-6 items-center gap-2.5 text-xs leading-4 text-foreground"
                      >
                        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  type="button"
                  variant={plan.featured ? "default" : "outline"}
                  className={cn("mt-8 w-full", plan.featured && brandStyles.button)}
                  onClick={() => onOpenChange(false)}
                >
                  {plan.cta}
                </Button>
              </section>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
