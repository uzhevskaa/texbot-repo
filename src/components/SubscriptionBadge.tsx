import { useState } from "react";
import { PricingPlansDialog } from "@/components/PricingPlansDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BOTS_FRIEND_UNTIL, BOTS_FRIEND_TOOLTIP } from "@/lib/subscription";
import { controlStyles } from "@/lib/visual-styles";
import { cn } from "@/lib/utils";

type Props = {
  showUntil?: boolean;
  className?: string;
  interactive?: boolean;
};

export function SubscriptionBadge({ showUntil = false, className, interactive = true }: Props) {
  const [open, setOpen] = useState(false);

  const badgeLabel = `Bots' friend${showUntil ? ` until ${BOTS_FRIEND_UNTIL}` : ""}`;
  const badgeContent = showUntil ? (
    <>
      <span className="truncate sm:hidden">Bots&apos; friend</span>
      <span className="hidden truncate sm:inline">{badgeLabel}</span>
    </>
  ) : (
    <span className="truncate">{badgeLabel}</span>
  );

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {interactive ? (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className={cn(
                  controlStyles.pill,
                  "inline-flex min-w-0 max-w-full truncate transition-colors hover:border-primary/20 hover:bg-accent/60 hover:text-foreground",
                  className,
                )}
              >
                {badgeContent}
              </button>
            ) : (
              <span
                className={cn(
                  controlStyles.pill,
                  "inline-flex min-w-0 max-w-full truncate",
                  className,
                )}
              >
                {badgeContent}
              </span>
            )}
          </TooltipTrigger>
          <TooltipContent>
            <p>{BOTS_FRIEND_TOOLTIP}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {interactive && <PricingPlansDialog open={open} onOpenChange={setOpen} />}
    </>
  );
}
