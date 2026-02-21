import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * @typedef {Object} TableProps
 * @property {string} [className]
 */

/** @type {React.ForwardRefRenderFunction<HTMLTableElement, TableProps & React.HTMLAttributes<HTMLTableElement>>} */
const TableComponent = ({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props} />
  </div>
)
const Table = React.forwardRef(TableComponent)
Table.displayName = "Table"

/** @type {React.ForwardRefRenderFunction<HTMLTableSectionElement, TableProps & React.HTMLAttributes<HTMLTableSectionElement>>} */
const TableHeaderComponent = ({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
)
const TableHeader = React.forwardRef(TableHeaderComponent)
TableHeader.displayName = "TableHeader"

/** @type {React.ForwardRefRenderFunction<HTMLTableSectionElement, TableProps & React.HTMLAttributes<HTMLTableSectionElement>>} */
const TableBodyComponent = ({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props} />
)
const TableBody = React.forwardRef(TableBodyComponent)
TableBody.displayName = "TableBody"

/** @type {React.ForwardRefRenderFunction<HTMLTableSectionElement, TableProps & React.HTMLAttributes<HTMLTableSectionElement>>} */
const TableFooterComponent = ({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
    {...props} />
)
const TableFooter = React.forwardRef(TableFooterComponent)
TableFooter.displayName = "TableFooter"

/** @type {React.ForwardRefRenderFunction<HTMLTableRowElement, TableProps & React.HTMLAttributes<HTMLTableRowElement>>} */
const TableRowComponent = ({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props} />
)
const TableRow = React.forwardRef(TableRowComponent)
TableRow.displayName = "TableRow"

/** @type {React.ForwardRefRenderFunction<HTMLTableCellElement, TableProps & React.ThHTMLAttributes<HTMLTableCellElement>>} */
const TableHeadComponent = ({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props} />
)
const TableHead = React.forwardRef(TableHeadComponent)
TableHead.displayName = "TableHead"

/** @type {React.ForwardRefRenderFunction<HTMLTableCellElement, TableProps & React.TdHTMLAttributes<HTMLTableCellElement>>} */
const TableCellComponent = ({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props} />
)
const TableCell = React.forwardRef(TableCellComponent)
TableCell.displayName = "TableCell"

/** @type {React.ForwardRefRenderFunction<HTMLTableCaptionElement, TableProps & React.HTMLAttributes<HTMLTableCaptionElement>>} */
const TableCaptionComponent = ({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props} />
)
const TableCaption = React.forwardRef(TableCaptionComponent)
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
