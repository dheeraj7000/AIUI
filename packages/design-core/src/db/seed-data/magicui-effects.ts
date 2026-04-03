/**
 * MagicUI Effects — Animated components from https://magicui.design/
 * Source: https://github.com/magicuidesign/magicui
 * License: MIT
 */
export const magicuiEffects = {
  pack: {
    name: 'MagicUI Effects',
    slug: 'magicui-effects-v1',
    category: 'animations',
    description:
      'Animated UI effects from MagicUI — marquees, shimmer buttons, border beams, text animations, and dynamic backgrounds for visually stunning interfaces.',
    version: '1.0.0',
    isPublic: true,
  },
  tokens: [
    { tokenKey: 'color.primary', tokenType: 'color' as const, tokenValue: '#7C3AED' },
    { tokenKey: 'color.primary-hover', tokenType: 'color' as const, tokenValue: '#6D28D9' },
    { tokenKey: 'color.secondary', tokenType: 'color' as const, tokenValue: '#EC4899' },
    { tokenKey: 'color.accent', tokenType: 'color' as const, tokenValue: '#3B82F6' },
    { tokenKey: 'color.background', tokenType: 'color' as const, tokenValue: '#09090B' },
    { tokenKey: 'color.surface', tokenType: 'color' as const, tokenValue: '#18181B' },
    { tokenKey: 'color.text-primary', tokenType: 'color' as const, tokenValue: '#FAFAFA' },
    { tokenKey: 'color.text-secondary', tokenType: 'color' as const, tokenValue: '#A1A1AA' },
    { tokenKey: 'color.border', tokenType: 'color' as const, tokenValue: '#27272A' },
    { tokenKey: 'color.shimmer', tokenType: 'color' as const, tokenValue: '#A855F7' },
    { tokenKey: 'color.beam', tokenType: 'color' as const, tokenValue: '#22D3EE' },
    { tokenKey: 'color.gradient-start', tokenType: 'color' as const, tokenValue: '#7C3AED' },
    { tokenKey: 'color.gradient-end', tokenType: 'color' as const, tokenValue: '#EC4899' },
    { tokenKey: 'radius.sm', tokenType: 'radius' as const, tokenValue: '6px' },
    { tokenKey: 'radius.md', tokenType: 'radius' as const, tokenValue: '8px' },
    { tokenKey: 'radius.lg', tokenType: 'radius' as const, tokenValue: '12px' },
    { tokenKey: 'radius.xl', tokenType: 'radius' as const, tokenValue: '16px' },
    { tokenKey: 'radius.full', tokenType: 'radius' as const, tokenValue: '9999px' },
    {
      tokenKey: 'font.heading',
      tokenType: 'font' as const,
      tokenValue: 'Cal Sans, Inter, sans-serif',
    },
    { tokenKey: 'font.body', tokenType: 'font' as const, tokenValue: 'Inter, sans-serif' },
    { tokenKey: 'font.mono', tokenType: 'font' as const, tokenValue: 'Fira Code, monospace' },
    { tokenKey: 'spacing.xs', tokenType: 'spacing' as const, tokenValue: '4px' },
    { tokenKey: 'spacing.sm', tokenType: 'spacing' as const, tokenValue: '8px' },
    { tokenKey: 'spacing.md', tokenType: 'spacing' as const, tokenValue: '16px' },
    { tokenKey: 'spacing.lg', tokenType: 'spacing' as const, tokenValue: '32px' },
    { tokenKey: 'spacing.xl', tokenType: 'spacing' as const, tokenValue: '48px' },
    {
      tokenKey: 'shadow.glow-sm',
      tokenType: 'shadow' as const,
      tokenValue: '0 0 15px rgb(124 58 237 / 0.3)',
    },
    {
      tokenKey: 'shadow.glow-md',
      tokenType: 'shadow' as const,
      tokenValue: '0 0 30px rgb(124 58 237 / 0.4)',
    },
    {
      tokenKey: 'shadow.glow-lg',
      tokenType: 'shadow' as const,
      tokenValue: '0 0 60px rgb(124 58 237 / 0.5)',
    },
    {
      tokenKey: 'elevation.low',
      tokenType: 'elevation' as const,
      tokenValue: '0 1px 3px rgb(0 0 0 / 0.3)',
    },
    {
      tokenKey: 'elevation.mid',
      tokenType: 'elevation' as const,
      tokenValue: '0 4px 12px rgb(0 0 0 / 0.4)',
    },
    {
      tokenKey: 'elevation.high',
      tokenType: 'elevation' as const,
      tokenValue: '0 8px 30px rgb(0 0 0 / 0.5)',
    },
  ],
  recipes: [
    {
      name: 'Marquee',
      type: 'feature' as const,
      codeTemplate: `import { type ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  className?: string
  reverse?: boolean
  pauseOnHover?: boolean
  children: React.ReactNode
  vertical?: boolean
  repeat?: number
}

export function Marquee({ className, reverse = false, pauseOnHover = false, children, vertical = false, repeat = 4, ...props }: MarqueeProps) {
  return (
    <div {...props} className={cn("group flex gap-(--gap) overflow-hidden p-2 [--duration:40s] [--gap:1rem]", { "flex-row": !vertical, "flex-col": vertical }, className)}>
      {Array(repeat).fill(0).map((_, i) => (
        <div key={i} className={cn("flex shrink-0 justify-around gap-(--gap)", {
          "animate-marquee flex-row": !vertical,
          "animate-marquee-vertical flex-col": vertical,
          "group-hover:[animation-play-state:paused]": pauseOnHover,
          "[animation-direction:reverse]": reverse,
        })}>
          {children}
        </div>
      ))}
    </div>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          reverse: { type: 'boolean' },
          pauseOnHover: { type: 'boolean' },
          vertical: { type: 'boolean' },
          repeat: { type: 'number' },
        },
      },
      aiUsageRules:
        'Use Marquee for auto-scrolling content like logo clouds, testimonials, or social proof. Requires CSS keyframes for animate-marquee and animate-marquee-vertical. Use pauseOnHover for interactive content. Set --duration and --gap via CSS custom properties.',
    },
    {
      name: 'Shimmer Button',
      type: 'cta' as const,
      codeTemplate: `import React, { type CSSProperties } from "react"
import { cn } from "@/lib/utils"

interface ShimmerButtonProps extends React.ComponentProps<"button"> {
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
  className?: string
  children?: React.ReactNode
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(({
  shimmerColor = "#ffffff",
  shimmerSize = "0.05em",
  shimmerDuration = "3s",
  borderRadius = "100px",
  background = "rgba(0, 0, 0, 1)",
  className,
  children,
  ...props
}, ref) => {
  return (
    <button ref={ref} className={cn("group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)] transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px", className)}
      style={{ "--spread": "90deg", "--shimmer-color": shimmerColor, "--radius": borderRadius, "--speed": shimmerDuration, "--cut": shimmerSize, "--bg": background } as CSSProperties} {...props}>
      <div className={cn("absolute inset-0 overflow-visible [container-type:size]")}>
        <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
          <div className="absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
        </div>
      </div>
      <span className="z-0 whitespace-nowrap text-sm font-medium">{children}</span>
      <div className={cn("absolute inset-[var(--cut)] rounded-[var(--radius)] [background:var(--bg)] group-hover:opacity-90")} />
      <span className="z-10 whitespace-nowrap text-sm font-medium">{children}</span>
    </button>
  )
})

ShimmerButton.displayName = "ShimmerButton"`,
      jsonSchema: {
        type: 'object',
        properties: {
          shimmerColor: { type: 'string' },
          shimmerDuration: { type: 'string' },
          background: { type: 'string' },
          children: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use ShimmerButton for high-impact CTAs. Requires animate-shimmer-slide keyframe. Best on dark backgrounds. Limit to 1-2 per page to maintain impact.',
    },
    {
      name: 'Border Beam',
      type: 'feature' as const,
      codeTemplate: `import { cn } from "@/lib/utils"

interface BorderBeamProps extends React.ComponentProps<"div"> {
  size?: number
  duration?: number
  anchor?: number
  borderWidth?: number
  colorFrom?: string
  colorTo?: string
  delay?: number
}

export function BorderBeam({ className, size = 200, duration = 15, anchor = 90, borderWidth = 1.5, colorFrom = "#ffaa40", colorTo = "#9c40ff", delay = 0 }: BorderBeamProps) {
  return (
    <div
      style={{
        "--size": size,
        "--duration": duration,
        "--anchor": anchor,
        "--border-width": borderWidth,
        "--color-from": colorFrom,
        "--color-to": colorTo,
        "--delay": \`-\${delay}s\`,
      } as React.CSSProperties}
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent]",
        "![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),conic-gradient(from_calc((var(--anchor)-var(--size)*0.5)*1deg),transparent_0,var(--color-from)_calc(var(--size)*1deg),var(--color-to)_calc(var(--size)*2deg),transparent_0)]",
        "animate-border-beam [animation-delay:var(--delay)]",
        className
      )}
    />
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          size: { type: 'number' },
          duration: { type: 'number' },
          colorFrom: { type: 'string' },
          colorTo: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use BorderBeam inside a positioned container (relative) to add animated gradient borders. Requires animate-border-beam keyframe. Great for highlighting cards or sections. The beam travels around the border continuously.',
    },
    {
      name: 'Magic Card',
      type: 'card' as const,
      codeTemplate: `"use client"
import { useCallback, useRef, type CSSProperties } from "react"
import { cn } from "@/lib/utils"

interface MagicCardProps extends React.ComponentProps<"div"> {
  gradientSize?: number
  gradientColor?: string
  gradientOpacity?: number
  gradientFrom?: string
  gradientTo?: string
}

export function MagicCard({ children, className, gradientSize = 200, gradientColor = "#262626", ...props }: MagicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const { left, top } = cardRef.current.getBoundingClientRect()
    const x = e.clientX - left
    const y = e.clientY - top
    cardRef.current.style.setProperty("--mouse-x", \`\${x}px\`)
    cardRef.current.style.setProperty("--mouse-y", \`\${y}px\`)
  }, [])

  return (
    <div ref={cardRef} onMouseMove={handleMouseMove}
      className={cn("group relative flex rounded-xl border bg-neutral-950 text-white overflow-hidden", className)}
      style={{ "--gradient-size": \`\${gradientSize}px\`, "--gradient-color": gradientColor } as CSSProperties}
      {...props}>
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(var(--gradient-size) circle at var(--mouse-x) var(--mouse-y), var(--gradient-color), transparent 40%)" }} />
      <div className="relative z-10">{children}</div>
    </div>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          gradientSize: { type: 'number' },
          gradientColor: { type: 'string' },
          children: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use MagicCard for cards with a mouse-following spotlight effect. Best for feature showcases or pricing cards. The gradient follows the cursor, creating an interactive feel. Works best on dark backgrounds.',
    },
    {
      name: 'Text Animate',
      type: 'hero' as const,
      codeTemplate: `"use client"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion, type Variants } from "motion/react"
import { useMemo } from "react"

type AnimationType = "fadeIn" | "blurIn" | "slideUp" | "slideDown" | "slideLeft" | "slideRight" | "scaleUp" | "scaleDown"
type ByType = "character" | "word" | "line"

interface TextAnimateProps extends React.ComponentProps<"span"> {
  children: string
  type?: AnimationType
  by?: ByType
  delay?: number
  duration?: number
  startOnView?: boolean
}

const staggerTimings: Record<ByType, number> = { character: 0.03, word: 0.05, line: 0.1 }

const defaultContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: (delay: number) => ({ opacity: 1, transition: { staggerChildren: delay } }),
  exit: { opacity: 0, transition: { staggerChildren: 0.01, staggerDirection: -1 } },
}

const defaultItemVariants: Record<AnimationType, Variants> = {
  fadeIn: { hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } },
  blurIn: { hidden: { opacity: 0, filter: "blur(10px)" }, show: { opacity: 1, filter: "blur(0px)" }, exit: { opacity: 0, filter: "blur(10px)" } },
  slideUp: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 20 } },
  slideDown: { hidden: { opacity: 0, y: -20 }, show: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } },
  slideLeft: { hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 } },
  slideRight: { hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 } },
  scaleUp: { hidden: { opacity: 0, scale: 0.5 }, show: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.5 } },
  scaleDown: { hidden: { opacity: 0, scale: 1.5 }, show: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1.5 } },
}

export function TextAnimate({ children, type = "fadeIn", by = "word", delay = 0, duration, startOnView = true, className, ...props }: TextAnimateProps) {
  const stagger = staggerTimings[by]
  const segments = useMemo(() => {
    if (by === "line") return children.split("\\n")
    if (by === "word") return children.split(/( )/)
    return [...children]
  }, [children, by])

  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        variants={defaultContainerVariants}
        initial="hidden"
        animate="show"
        exit="exit"
        custom={stagger}
        className={cn("inline-flex flex-wrap", className)}
        {...(startOnView ? { whileInView: "show", viewport: { once: true } } : {})}
        {...props}
      >
        {segments.map((segment, i) => (
          <motion.span key={i} variants={{ ...defaultItemVariants[type], show: { ...defaultItemVariants[type].show, transition: { duration: duration ?? 0.3 } } }} className={cn(by === "line" && "block", by === "character" && segment === " " && "w-[0.25em]")}>
            {segment}
          </motion.span>
        ))}
      </motion.span>
    </AnimatePresence>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          children: { type: 'string' },
          type: {
            type: 'string',
            enum: [
              'fadeIn',
              'blurIn',
              'slideUp',
              'slideDown',
              'slideLeft',
              'slideRight',
              'scaleUp',
              'scaleDown',
            ],
          },
          by: { type: 'string', enum: ['character', 'word', 'line'] },
          delay: { type: 'number' },
        },
      },
      aiUsageRules:
        'Use TextAnimate for hero headlines and key text. Requires motion/react (Framer Motion). Choose animation type based on context: blurIn for dramatic reveals, slideUp for clean entrances, scaleUp for impact. Use by="word" for headlines, by="character" for short labels.',
    },
    {
      name: 'Number Ticker',
      type: 'feature' as const,
      codeTemplate: `"use client"
import { useEffect, useRef } from "react"
import { useInView, useMotionValue, useSpring } from "motion/react"
import { cn } from "@/lib/utils"

interface NumberTickerProps extends React.ComponentProps<"span"> {
  value: number
  direction?: "up" | "down"
  delay?: number
  decimalPlaces?: number
}

export function NumberTicker({ value, direction = "up", delay = 0, decimalPlaces = 0, className, ...props }: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(direction === "down" ? value : 0)
  const springValue = useSpring(motionValue, { damping: 60, stiffness: 100 })
  const isInView = useInView(ref, { once: true, margin: "0px" })

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        motionValue.set(direction === "down" ? 0 : value)
      }, delay * 1000)
      return () => clearTimeout(timer)
    }
  }, [motionValue, isInView, delay, value, direction])

  useEffect(() => springValue.on("change", (latest) => {
    if (ref.current) ref.current.textContent = Intl.NumberFormat("en-US", { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces }).format(Number(latest.toFixed(decimalPlaces)))
  }), [springValue, decimalPlaces])

  return <span ref={ref} className={cn("inline-block tabular-nums tracking-wider", className)} {...props}>
    {Intl.NumberFormat("en-US", { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces }).format(direction === "down" ? value : 0)}
  </span>
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          value: { type: 'number' },
          direction: { type: 'string', enum: ['up', 'down'] },
          delay: { type: 'number' },
          decimalPlaces: { type: 'number' },
        },
      },
      aiUsageRules:
        'Use NumberTicker for animated statistics and metrics. Requires motion/react. Animates from 0 to value (or reverse with direction="down"). Use delay to stagger multiple tickers. Best for dashboards, landing page stats.',
    },
    {
      name: 'Animated List',
      type: 'feature' as const,
      codeTemplate: `"use client"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedListProps extends React.ComponentProps<"div"> {
  children: React.ReactNode
  delay?: number
}

export function AnimatedList({ children, className, delay = 1000, ...props }: AnimatedListProps) {
  const [index, setIndex] = useState(0)
  const childrenArray = useMemo(() => React.Children.toArray(children), [children])

  useEffect(() => {
    if (index < childrenArray.length - 1) {
      const timer = setTimeout(() => setIndex((prev) => prev + 1), delay)
      return () => clearTimeout(timer)
    }
  }, [index, childrenArray.length, delay])

  const itemsToShow = useMemo(() => childrenArray.slice(0, index + 1).reverse(), [index, childrenArray])

  return (
    <div className={cn("flex flex-col items-center gap-4", className)} {...props}>
      <AnimatePresence>
        {itemsToShow.map((item) => (
          <AnimatedListItem key={(item as React.ReactElement).key}>
            {item}
          </AnimatedListItem>
        ))}
      </AnimatePresence>
    </div>
  )
}

function AnimatedListItem({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, originY: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 350, damping: 40 }}
      layout
      className="mx-auto w-full"
    >
      {children}
    </motion.div>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          delay: { type: 'number' },
          children: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use AnimatedList for notification feeds, activity logs, or real-time updates. Requires motion/react. Items appear one by one with spring animation. Set delay (ms) between items.',
    },
    {
      name: 'Retro Grid',
      type: 'feature' as const,
      codeTemplate: `import { cn } from "@/lib/utils"

interface RetroGridProps extends React.ComponentProps<"div"> {
  angle?: number
}

export function RetroGrid({ className, angle = 65, ...props }: RetroGridProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden [perspective:200px]", className)} style={{ "--grid-angle": \`\${angle}deg\` } as React.CSSProperties} {...props}>
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div className="animate-grid [background-repeat:repeat] [background-size:60px_60px] [height:300vh] [inset:0%_0px] [margin-left:-50%] [transform-origin:100%_0_0] [width:600vw]"
          style={{ backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.3) 1px, transparent 0), linear-gradient(to bottom, rgba(0,0,0,0.3) 1px, transparent 0)" }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent to-90% dark:from-black" />
    </div>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          angle: { type: 'number' },
        },
      },
      aiUsageRules:
        'Use RetroGrid as a background element for hero sections or landing pages. Place inside a relative container. The grid creates a 3D perspective effect. Requires animate-grid keyframe. Pairs well with dark themes.',
    },
    {
      name: 'Dot Pattern',
      type: 'feature' as const,
      codeTemplate: `import { useId } from "react"
import { cn } from "@/lib/utils"

interface DotPatternProps extends React.ComponentProps<"svg"> {
  width?: number
  height?: number
  x?: number
  y?: number
  cx?: number
  cy?: number
  cr?: number
}

export function DotPattern({ width = 16, height = 16, x = 0, y = 0, cx = 1, cy = 1, cr = 1, className, ...props }: DotPatternProps) {
  const id = useId()
  return (
    <svg aria-hidden="true" className={cn("pointer-events-none absolute inset-0 h-full w-full fill-neutral-400/80", className)} {...props}>
      <defs>
        <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse" x={x} y={y}>
          <circle id="pattern-circle" cx={cx} cy={cy} r={cr} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={\`url(#\${id})\`} />
    </svg>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          width: { type: 'number' },
          height: { type: 'number' },
          cr: { type: 'number' },
        },
      },
      aiUsageRules:
        'Use DotPattern as a subtle background texture. Place inside a relative container. Adjust width/height for dot spacing, cr for dot size. Use with a gradient mask for fade effects.',
    },
    {
      name: 'Shine Border',
      type: 'card' as const,
      codeTemplate: `import { cn } from "@/lib/utils"

interface ShineBorderProps extends React.ComponentProps<"div"> {
  borderRadius?: number
  borderWidth?: number
  duration?: number
  color?: string | string[]
}

export function ShineBorder({ borderRadius = 8, borderWidth = 1, duration = 14, color = "#fff", className, children, ...props }: ShineBorderProps) {
  return (
    <div
      style={{
        "--border-radius": \`\${borderRadius}px\`,
        "--border-width": \`\${borderWidth}px\`,
        "--duration": \`\${duration}s\`,
        "--mask-linear-gradient": \`linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)\`,
        "--background-radial-gradient": \`radial-gradient(transparent, transparent, \${Array.isArray(color) ? color.join(",") : color}, transparent, transparent)\`,
      } as React.CSSProperties}
      className={cn(
        "relative grid place-items-center rounded-[var(--border-radius)] bg-white p-3 text-black dark:bg-black dark:text-white",
        "before:pointer-events-none before:absolute before:inset-0 before:size-full before:rounded-[var(--border-radius)] before:p-[var(--border-width)] before:[background-image:var(--background-radial-gradient)] before:[background-size:300%_300%] before:animate-shine before:[mask-composite:exclude] before:[mask:var(--mask-linear-gradient)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          borderRadius: { type: 'number' },
          borderWidth: { type: 'number' },
          duration: { type: 'number' },
          color: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use ShineBorder to add an animated gradient border that rotates around a container. Requires animate-shine keyframe. Great for highlighting featured cards or premium content. Use color array for multi-color gradients.',
    },
    {
      name: 'Animated Shiny Text',
      type: 'hero' as const,
      codeTemplate: `import { type CSSProperties } from "react"
import { cn } from "@/lib/utils"

interface AnimatedShinyTextProps extends React.ComponentProps<"span"> {
  shimmerWidth?: number
}

export function AnimatedShinyText({ children, className, shimmerWidth = 100, ...props }: AnimatedShinyTextProps) {
  return (
    <span
      style={{ "--shimmer-width": \`\${shimmerWidth}px\` } as CSSProperties}
      className={cn(
        "mx-auto max-w-md text-neutral-600/70 dark:text-neutral-400/70",
        "animate-shiny-text bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--shimmer-width)_100%] [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]",
        "bg-gradient-to-r from-transparent via-black/80 via-50% to-transparent dark:via-white/80",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          shimmerWidth: { type: 'number' },
          children: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use AnimatedShinyText for announcement banners or subtle text highlights. Requires animate-shiny-text keyframe. The shimmer effect draws attention without being distracting. Best for short text (1-2 lines).',
    },
    {
      name: 'Bento Grid',
      type: 'feature' as const,
      codeTemplate: `import { cn } from "@/lib/utils"

interface BentoGridProps extends React.ComponentProps<"div"> {}

export function BentoGrid({ children, className, ...props }: BentoGridProps) {
  return (
    <div className={cn("grid w-full auto-rows-[22rem] grid-cols-3 gap-4", className)} {...props}>
      {children}
    </div>
  )
}

interface BentoCardProps extends React.ComponentProps<"div"> {
  name: string
  description: string
  Icon: React.ElementType
  href?: string
  cta?: string
}

export function BentoCard({ name, className, description, Icon, href, cta, ...props }: BentoCardProps) {
  return (
    <div className={cn("group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] transform-gpu dark:bg-black dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] lg:col-span-1", className)} {...props}>
      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-10">
        <Icon className="h-12 w-12 origin-left transform-gpu text-neutral-700 transition-all duration-300 ease-in-out group-hover:scale-75" />
        <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">{name}</h3>
        <p className="max-w-lg text-neutral-400">{description}</p>
      </div>
      <div className="pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        {href && <a href={href} className="pointer-events-auto inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium">{cta} →</a>}
      </div>
      <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10" />
    </div>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          cards: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                icon: { type: 'string' },
                href: { type: 'string' },
                cta: { type: 'string' },
              },
            },
          },
        },
      },
      aiUsageRules:
        'Use BentoGrid for feature showcases with asymmetric card layouts. Each BentoCard can span multiple columns using className="lg:col-span-2". Include an icon, name, description, and optional CTA link. Great for product feature pages.',
    },
    {
      name: 'Ripple Button',
      type: 'cta' as const,
      codeTemplate: `"use client"
import React, { useState, type MouseEvent } from "react"
import { cn } from "@/lib/utils"

interface RippleButtonProps extends React.ComponentProps<"button"> {
  rippleColor?: string
  duration?: string
}

export function RippleButton({ className, children, rippleColor = "#fff", duration = "600ms", onClick, ...props }: RippleButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; size: number; key: number }>>([])

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    setRipples((prev) => [...prev, { x: e.clientX - rect.left - size / 2, y: e.clientY - rect.top - size / 2, size, key: Date.now() }])
    onClick?.(e)
  }

  return (
    <button className={cn("relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border bg-primary px-4 py-2 text-center text-primary-foreground", className)} onClick={handleClick} {...props}>
      <span className="relative z-10">{children}</span>
      {ripples.map((ripple) => (
        <span key={ripple.key} className="absolute animate-ripple rounded-full bg-white/25"
          style={{ width: ripple.size, height: ripple.size, top: ripple.y, left: ripple.x, animationDuration: duration, backgroundColor: rippleColor }}
          onAnimationEnd={() => setRipples((prev) => prev.filter((r) => r.key !== ripple.key))} />
      ))}
    </button>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          rippleColor: { type: 'string' },
          duration: { type: 'string' },
          children: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use RippleButton for material-design-style click feedback. Requires animate-ripple keyframe. The ripple expands from the click point. Use for interactive buttons where tactile feedback matters.',
    },
  ],
};
