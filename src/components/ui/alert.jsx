import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

/**
 * @typedef {Object} AlertProps
 * @property {string} [className]
 * @property {'default' | 'destructive'} [variant]
 */

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/** @type {React.ForwardRefRenderFunction<HTMLDivElement, AlertProps & React.HTMLAttributes<HTMLDivElement>>} */
const AlertComponent = ({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props} />
)
const Alert = React.forwardRef(AlertComponent)
Alert.displayName = "Alert"

/** @type {React.ForwardRefRenderFunction<HTMLHeadingElement, AlertProps & React.HTMLAttributes<HTMLHeadingElement>>} */
const AlertTitleComponent = ({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props} />
)
const AlertTitle = React.forwardRef(AlertTitleComponent)
AlertTitle.displayName = "AlertTitle"

/** @type {React.ForwardRefRenderFunction<HTMLDivElement, AlertProps & React.HTMLAttributes<HTMLDivElement>>} */
const AlertDescriptionComponent = ({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props} />
)
const AlertDescription = React.forwardRef(AlertDescriptionComponent)
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
