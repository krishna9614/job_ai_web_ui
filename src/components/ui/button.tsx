import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight, LoaderCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** shadcn/ui button mapped onto the JobAI design-system button classes. */
const buttonVariants = cva("btn", {
  variants: {
    variant: {
      primary: "btn-primary",
      outline: "btn-outline",
      ghost: "btn-ghost",
    },
    size: {
      md: "",
      sm: "btn-sm",
      xs: "btn-xs",
    },
    block: { true: "btn-block", false: "" },
  },
  defaultVariants: { variant: "primary", size: "md", block: false },
});

type ButtonProps = ComponentProps<typeof ButtonPrimitive> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    /** Show the design's circular trailing arrow (primary buttons). */
    arrow?: boolean | ReactNode;
  };

export function Button({
  className,
  variant,
  size,
  block,
  loading = false,
  arrow = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const trailing = arrow === true ? <ArrowRight className="ic ic-sm" /> : arrow || null;
  return (
    <ButtonPrimitive
      className={cn(buttonVariants({ variant, size, block }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      suppressHydrationWarning
      {...props}
    >
      {children}
      {loading ? (
        <span className="arrow">
          <LoaderCircle className="ic ic-sm spin" />
        </span>
      ) : trailing ? (
        <span className="arrow">{trailing}</span>
      ) : null}
    </ButtonPrimitive>
  );
}

export { buttonVariants };
