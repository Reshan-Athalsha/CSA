import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

/**
 * @typedef {Object} LabelProps
 * @property {string} [className]
 */

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

/** @type {React.ForwardRefRenderFunction<HTMLLabelElement, LabelProps & React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>>} */
const LabelComponent = ({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
)
const Label = React.forwardRef(LabelComponent)
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
