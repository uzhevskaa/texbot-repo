import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-[transform,background-color,color,box-shadow,border-color,filter] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-soft hover:-translate-y-px hover:bg-primary/92 hover:shadow-interactive active:translate-y-0 active:shadow-soft disabled:bg-[var(--color-disabled)] disabled:text-[var(--color-disabled-foreground)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:-translate-y-px hover:bg-destructive/92 hover:shadow-interactive active:translate-y-0 active:shadow-soft disabled:bg-[var(--color-disabled)] disabled:text-[var(--color-disabled-foreground)]",
        outline:
          "border border-input bg-background shadow-soft hover:-translate-y-px hover:border-primary/20 hover:bg-accent/80 hover:text-accent-foreground hover:shadow-soft active:translate-y-0 disabled:border-[var(--color-disabled-border)] disabled:bg-[var(--color-disabled)] disabled:text-[var(--color-disabled-foreground)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-soft hover:-translate-y-px hover:bg-secondary/90 hover:shadow-soft active:translate-y-0 disabled:bg-[var(--color-disabled)] disabled:text-[var(--color-disabled-foreground)]",
        ghost:
          "hover:bg-accent/80 hover:text-accent-foreground disabled:bg-transparent disabled:text-[var(--color-disabled-foreground)]",
        link: "text-primary underline-offset-4 hover:text-primary/90 hover:underline disabled:text-[var(--color-disabled-foreground)] disabled:no-underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
