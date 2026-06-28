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
                  "cursor-pointer transition-colors hover:border-primary/20 hover:bg-accent/60 hover:text-foreground",
                  className,
                )}
              >
                {badgeLabel}
              </button>
            ) : (
              <span className={cn(controlStyles.pill, "cursor-default", className)}>
                {badgeLabel}
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
