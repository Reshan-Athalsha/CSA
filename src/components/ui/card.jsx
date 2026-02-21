import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * @typedef {Object} CardProps
 * @property {string} [className]
 */

/** @type {React.ForwardRefRenderFunction<HTMLDivElement, CardProps & React.HTMLAttributes<HTMLDivElement>>} */
const CardComponent = ({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}
    {...props} />
)
const Card = React.forwardRef(CardComponent)
Card.displayName = "Card"

/** @type {React.ForwardRefRenderFunction<HTMLDivElement, CardProps & React.HTMLAttributes<HTMLDivElement>>} */
const CardHeaderComponent = ({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props} />
)
const CardHeader = React.forwardRef(CardHeaderComponent)
CardHeader.displayName = "CardHeader"

/** @type {React.ForwardRefRenderFunction<HTMLDivElement, CardProps & React.HTMLAttributes<HTMLDivElement>>} */
const CardTitleComponent = ({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props} />
)
const CardTitle = React.forwardRef(CardTitleComponent)
CardTitle.displayName = "CardTitle"

/** @type {React.ForwardRefRenderFunction<HTMLDivElement, CardProps & React.HTMLAttributes<HTMLDivElement>>} */
const CardDescriptionComponent = ({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props} />
)
const CardDescription = React.forwardRef(CardDescriptionComponent)
CardDescription.displayName = "CardDescription"

/** @type {React.ForwardRefRenderFunction<HTMLDivElement, CardProps & React.HTMLAttributes<HTMLDivElement>>} */
const CardContentComponent = ({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
)
const CardContent = React.forwardRef(CardContentComponent)
CardContent.displayName = "CardContent"

/** @type {React.ForwardRefRenderFunction<HTMLDivElement, CardProps & React.HTMLAttributes<HTMLDivElement>>} */
const CardFooterComponent = ({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props} />
)
const CardFooter = React.forwardRef(CardFooterComponent)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
