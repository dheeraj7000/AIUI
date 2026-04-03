/**
 * shadcn/ui Essentials — Core UI primitives from https://ui.shadcn.com/
 * Source: https://github.com/shadcn-ui/ui (v4, new-york style)
 * License: MIT
 */
export const shadcnEssentials = {
  pack: {
    name: 'shadcn/ui Essentials',
    slug: 'shadcn-essentials-v4',
    category: 'ui-library',
    description:
      'Production-ready UI components from shadcn/ui — built on Radix UI and Tailwind CSS. Clean, accessible, and composable primitives for any React project.',
    version: '4.0.0',
    isPublic: true,
  },
  tokens: [
    { tokenKey: 'color.background', tokenType: 'color' as const, tokenValue: 'hsl(0 0% 100%)' },
    { tokenKey: 'color.foreground', tokenType: 'color' as const, tokenValue: 'hsl(240 10% 3.9%)' },
    { tokenKey: 'color.card', tokenType: 'color' as const, tokenValue: 'hsl(0 0% 100%)' },
    {
      tokenKey: 'color.card-foreground',
      tokenType: 'color' as const,
      tokenValue: 'hsl(240 10% 3.9%)',
    },
    { tokenKey: 'color.primary', tokenType: 'color' as const, tokenValue: 'hsl(240 5.9% 10%)' },
    {
      tokenKey: 'color.primary-foreground',
      tokenType: 'color' as const,
      tokenValue: 'hsl(0 0% 98%)',
    },
    { tokenKey: 'color.secondary', tokenType: 'color' as const, tokenValue: 'hsl(240 4.8% 95.9%)' },
    {
      tokenKey: 'color.secondary-foreground',
      tokenType: 'color' as const,
      tokenValue: 'hsl(240 5.9% 10%)',
    },
    { tokenKey: 'color.muted', tokenType: 'color' as const, tokenValue: 'hsl(240 4.8% 95.9%)' },
    {
      tokenKey: 'color.muted-foreground',
      tokenType: 'color' as const,
      tokenValue: 'hsl(240 3.8% 46.1%)',
    },
    { tokenKey: 'color.accent', tokenType: 'color' as const, tokenValue: 'hsl(240 4.8% 95.9%)' },
    {
      tokenKey: 'color.destructive',
      tokenType: 'color' as const,
      tokenValue: 'hsl(0 84.2% 60.2%)',
    },
    { tokenKey: 'color.border', tokenType: 'color' as const, tokenValue: 'hsl(240 5.9% 90%)' },
    { tokenKey: 'color.input', tokenType: 'color' as const, tokenValue: 'hsl(240 5.9% 90%)' },
    { tokenKey: 'color.ring', tokenType: 'color' as const, tokenValue: 'hsl(240 5.9% 10%)' },
    { tokenKey: 'radius.sm', tokenType: 'radius' as const, tokenValue: 'calc(0.5rem - 2px)' },
    { tokenKey: 'radius.md', tokenType: 'radius' as const, tokenValue: 'calc(0.5rem)' },
    { tokenKey: 'radius.lg', tokenType: 'radius' as const, tokenValue: '0.5rem' },
    { tokenKey: 'radius.xl', tokenType: 'radius' as const, tokenValue: '0.75rem' },
    {
      tokenKey: 'font.heading',
      tokenType: 'font' as const,
      tokenValue: 'Inter, system-ui, sans-serif',
    },
    {
      tokenKey: 'font.body',
      tokenType: 'font' as const,
      tokenValue: 'Inter, system-ui, sans-serif',
    },
    { tokenKey: 'font.mono', tokenType: 'font' as const, tokenValue: 'JetBrains Mono, monospace' },
    { tokenKey: 'spacing.xs', tokenType: 'spacing' as const, tokenValue: '0.25rem' },
    { tokenKey: 'spacing.sm', tokenType: 'spacing' as const, tokenValue: '0.5rem' },
    { tokenKey: 'spacing.md', tokenType: 'spacing' as const, tokenValue: '1rem' },
    { tokenKey: 'spacing.lg', tokenType: 'spacing' as const, tokenValue: '1.5rem' },
    { tokenKey: 'spacing.xl', tokenType: 'spacing' as const, tokenValue: '2rem' },
    {
      tokenKey: 'shadow.xs',
      tokenType: 'shadow' as const,
      tokenValue: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    },
    {
      tokenKey: 'shadow.sm',
      tokenType: 'shadow' as const,
      tokenValue: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    },
    {
      tokenKey: 'shadow.md',
      tokenType: 'shadow' as const,
      tokenValue: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    },
    {
      tokenKey: 'elevation.low',
      tokenType: 'elevation' as const,
      tokenValue: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    },
    {
      tokenKey: 'elevation.mid',
      tokenType: 'elevation' as const,
      tokenValue: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    },
    {
      tokenKey: 'elevation.high',
      tokenType: 'elevation' as const,
      tokenValue: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    },
  ],
  recipes: [
    {
      name: 'Button',
      type: 'cta' as const,
      codeTemplate: `import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs",
        sm: "h-8 gap-1.5 rounded-md px-3",
        lg: "h-10 rounded-md px-6",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

function Button({ className, variant, size, asChild = false, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }`,
      jsonSchema: {
        type: 'object',
        properties: {
          variant: {
            type: 'string',
            enum: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
          },
          size: { type: 'string', enum: ['default', 'xs', 'sm', 'lg', 'icon'] },
          children: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use the Button component for all clickable actions. Choose variant based on importance: default for primary actions, outline for secondary, ghost for tertiary. Use the asChild prop to render as a link with <a> tag.',
    },
    {
      name: 'Card',
      type: 'card' as const,
      codeTemplate: `import * as React from "react"
import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card" className={cn("flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm", className)} {...props} />
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-header" className={cn("grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6", className)} {...props} />
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-title" className={cn("leading-none font-semibold", className)} {...props} />
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-description" className={cn("text-sm text-muted-foreground", className)} {...props} />
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-6", className)} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-footer" className={cn("flex items-center px-6", className)} {...props} />
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          children: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use Card as the primary container for grouped content. Compose with CardHeader, CardTitle, CardDescription, CardContent, and CardFooter. Avoid nesting cards.',
    },
    {
      name: 'Input',
      type: 'contact' as const,
      codeTemplate: `import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }`,
      jsonSchema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
          },
          placeholder: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use Input for single-line text entry. Always pair with a label element. Use aria-invalid for error states.',
    },
    {
      name: 'Badge',
      type: 'card' as const,
      codeTemplate: `import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-white",
        outline: "border-border text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Badge({ className, variant, asChild = false, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }`,
      jsonSchema: {
        type: 'object',
        properties: {
          variant: { type: 'string', enum: ['default', 'secondary', 'destructive', 'outline'] },
          children: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use Badge to display status, counts, or labels. Default for primary info, secondary for neutral, destructive for errors/warnings, outline for subtle indicators.',
    },
    {
      name: 'Accordion',
      type: 'faq' as const,
      codeTemplate: `"use client"
import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Accordion as AccordionPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

function Accordion({ ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={cn("border-b last:border-b-0", className)} {...props} />
}

function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger data-slot="accordion-trigger" className={cn("flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180", className)} {...props}>
        {children}
        <ChevronDownIcon className="size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content data-slot="accordion-content" className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down" {...props}>
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }`,
      jsonSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['single', 'multiple'] },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: { trigger: { type: 'string' }, content: { type: 'string' } },
            },
          },
        },
      },
      aiUsageRules:
        'Use Accordion for FAQ sections and collapsible content groups. Use type="single" for mutually exclusive panels, type="multiple" for independent panels. Always provide meaningful trigger text.',
    },
    {
      name: 'Tabs',
      type: 'feature' as const,
      codeTemplate: `"use client"
import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex gap-2 flex-col", className)} {...props} />
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List data-slot="tabs-list" className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground", className)} {...props} />
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return <TabsPrimitive.Trigger data-slot="tabs-trigger" className={cn("inline-flex items-center justify-center rounded-md px-2 py-1 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm", className)} {...props} />
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn("flex-1 outline-none", className)} {...props} />
}

export { Tabs, TabsList, TabsTrigger, TabsContent }`,
      jsonSchema: {
        type: 'object',
        properties: {
          defaultValue: { type: 'string' },
          tabs: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                value: { type: 'string' },
                label: { type: 'string' },
                content: { type: 'string' },
              },
            },
          },
        },
      },
      aiUsageRules:
        'Use Tabs to organize content into switchable panels. Keep tab labels short (1-2 words). The defaultValue should match one of the tab values.',
    },
    {
      name: 'Dialog',
      type: 'card' as const,
      codeTemplate: `"use client"
import * as React from "react"
import { XIcon } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return <DialogPrimitive.Overlay data-slot="dialog-overlay" className={cn("fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0", className)} {...props} />
}

function DialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content data-slot="dialog-content" className={cn("fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95", className)} {...props}>
        {children}
        <DialogPrimitive.Close className="absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-header" className={cn("flex flex-col gap-2 text-center sm:text-left", className)} {...props} />
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-footer" className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn("text-lg font-semibold", className)} {...props} />
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description data-slot="dialog-description" className={cn("text-sm text-muted-foreground", className)} {...props} />
}

export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogTitle, DialogTrigger }`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          children: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use Dialog for modals that require user attention. Always include a DialogTitle for accessibility. Use DialogTrigger as the open button. Keep content focused on a single action.',
    },
    {
      name: 'Alert',
      type: 'card' as const,
      codeTemplate: `import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive: "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Alert({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-title" className={cn("col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight", className)} {...props} />
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-description" className={cn("col-start-2 grid justify-items-start gap-1 text-sm text-muted-foreground [&_p]:leading-relaxed", className)} {...props} />
}

export { Alert, AlertTitle, AlertDescription }`,
      jsonSchema: {
        type: 'object',
        properties: {
          variant: { type: 'string', enum: ['default', 'destructive'] },
          title: { type: 'string' },
          description: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use Alert for important messages that need attention. Default variant for informational, destructive for errors. Include an icon before the title for better visual hierarchy.',
    },
    {
      name: 'Avatar',
      type: 'card' as const,
      codeTemplate: `"use client"
import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return <AvatarPrimitive.Root data-slot="avatar" className={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)} {...props} />
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return <AvatarPrimitive.Image data-slot="avatar-image" className={cn("aspect-square size-full", className)} {...props} />
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return <AvatarPrimitive.Fallback data-slot="avatar-fallback" className={cn("flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground", className)} {...props} />
}

export { Avatar, AvatarImage, AvatarFallback }`,
      jsonSchema: {
        type: 'object',
        properties: {
          src: { type: 'string' },
          alt: { type: 'string' },
          fallback: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use Avatar for user profile images. Always include AvatarFallback with initials. Use AvatarImage for the actual image with a descriptive alt text.',
    },
    {
      name: 'Select',
      type: 'contact' as const,
      codeTemplate: `"use client"
import * as React from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { Select as SelectPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger data-slot="select-trigger" className={cn("flex h-9 w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground [&_svg]:size-4", className)} {...props}>
      {children}
      <SelectPrimitive.Icon asChild><ChevronDownIcon className="size-4 opacity-50" /></SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({ className, children, position = "item-aligned", ...props }: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content data-slot="select-content" className={cn("relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95", className)} position={position} {...props}>
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item data-slot="select-item" className={cn("relative flex w-full cursor-default items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}>
      <span className="absolute right-2 flex size-3.5 items-center justify-center"><SelectPrimitive.ItemIndicator><CheckIcon className="size-4" /></SelectPrimitive.ItemIndicator></span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }`,
      jsonSchema: {
        type: 'object',
        properties: {
          placeholder: { type: 'string' },
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: { value: { type: 'string' }, label: { type: 'string' } },
            },
          },
        },
      },
      aiUsageRules:
        'Use Select for choosing from a list of options. Always include a placeholder via SelectValue. Group related options with SelectGroup and SelectLabel.',
    },
    {
      name: 'Textarea',
      type: 'contact' as const,
      codeTemplate: `import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }`,
      jsonSchema: {
        type: 'object',
        properties: {
          placeholder: { type: 'string' },
          rows: { type: 'number' },
        },
      },
      aiUsageRules:
        'Use Textarea for multi-line text input. Pair with a label. The field-sizing-content class auto-sizes to content.',
    },
    {
      name: 'Skeleton',
      type: 'card' as const,
      codeTemplate: `import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" className={cn("animate-pulse rounded-md bg-accent", className)} {...props} />
}

export { Skeleton }`,
      jsonSchema: {
        type: 'object',
        properties: {
          className: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use Skeleton as a loading placeholder that matches the shape of the content it replaces. Set width and height via className.',
    },
    {
      name: 'Separator',
      type: 'feature' as const,
      codeTemplate: `"use client"
import * as React from "react"
import { Separator as SeparatorPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

function Separator({ className, orientation = "horizontal", decorative = true, ...props }: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn("shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px", className)}
      {...props}
    />
  )
}

export { Separator }`,
      jsonSchema: {
        type: 'object',
        properties: {
          orientation: { type: 'string', enum: ['horizontal', 'vertical'] },
        },
      },
      aiUsageRules:
        'Use Separator to visually divide content sections. Default is horizontal. Use orientation="vertical" between inline elements.',
    },
    {
      name: 'Tooltip',
      type: 'feature' as const,
      codeTemplate: `"use client"
import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

function TooltipProvider({ delayDuration = 0, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root {...props} />
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger {...props} />
}

function TooltipContent({ className, sideOffset = 0, children, ...props }: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content sideOffset={sideOffset} className={cn("z-50 rounded-md bg-foreground px-3 py-1.5 text-xs text-background animate-in fade-in-0 zoom-in-95", className)} {...props}>
        {children}
        <TooltipPrimitive.Arrow className="size-2.5 fill-foreground" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }`,
      jsonSchema: {
        type: 'object',
        properties: {
          content: { type: 'string' },
          side: { type: 'string', enum: ['top', 'right', 'bottom', 'left'] },
        },
      },
      aiUsageRules:
        'Wrap the app in TooltipProvider. Use Tooltip for supplementary info on hover. Keep content short (1 sentence max). Never put critical info in tooltips alone.',
    },
  ],
};
