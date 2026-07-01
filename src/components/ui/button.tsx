import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// shadcn/ui-style Button, tuned to the "Ledger" tokens (flat, hairline, no
// shadows). Radii from the design system: buttons ~10–13px (rounded-btn).
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-btn text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive/40 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-olive text-canvas hover:bg-olive/90",
        approve: "bg-approve text-white hover:bg-approve/90",
        reject: "bg-reject text-white hover:bg-reject/90",
        outline:
          "border border-hairline bg-card text-body hover:bg-hairline-row",
        ghost: "text-body hover:bg-hairline-row",
        link: "text-olive underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-6",
        pill: "h-10 px-5 rounded-pill",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
