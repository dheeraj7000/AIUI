/**
 * UIverse Effects -- Animated UI elements inspired by UIverse.io
 * Source: https://uiverse.io
 * License: MIT (free for commercial use)
 */
export const uiverseEffectsV1 = {
  pack: {
    name: 'UIverse Effects',
    slug: 'uiverse-effects-v1',
    category: 'animations',
    description:
      'Animated UI elements -- loaders, spinners, hover effects, and creative micro-interactions. Inspired by UIverse.io, MIT licensed.',
    version: '1.0.0',
    isPublic: true,
  },
  tokens: [
    // Colors (10)
    { tokenKey: 'color.primary', tokenType: 'color' as const, tokenValue: '#8B5CF6' },
    { tokenKey: 'color.primary-hover', tokenType: 'color' as const, tokenValue: '#7C3AED' },
    { tokenKey: 'color.accent', tokenType: 'color' as const, tokenValue: '#06B6D4' },
    { tokenKey: 'color.accent-hover', tokenType: 'color' as const, tokenValue: '#0891B2' },
    { tokenKey: 'color.background', tokenType: 'color' as const, tokenValue: '#0F172A' },
    { tokenKey: 'color.surface', tokenType: 'color' as const, tokenValue: '#1E293B' },
    { tokenKey: 'color.text-primary', tokenType: 'color' as const, tokenValue: '#F1F5F9' },
    { tokenKey: 'color.text-secondary', tokenType: 'color' as const, tokenValue: '#94A3B8' },
    { tokenKey: 'color.border', tokenType: 'color' as const, tokenValue: '#334155' },
    { tokenKey: 'color.glow', tokenType: 'color' as const, tokenValue: '#A78BFA' },
    // Radius (4)
    { tokenKey: 'radius.sm', tokenType: 'radius' as const, tokenValue: '6px' },
    { tokenKey: 'radius.md', tokenType: 'radius' as const, tokenValue: '10px' },
    { tokenKey: 'radius.lg', tokenType: 'radius' as const, tokenValue: '16px' },
    { tokenKey: 'radius.full', tokenType: 'radius' as const, tokenValue: '9999px' },
    // Fonts (3)
    {
      tokenKey: 'font.heading',
      tokenType: 'font' as const,
      tokenValue: 'Space Grotesk, sans-serif',
    },
    { tokenKey: 'font.body', tokenType: 'font' as const, tokenValue: 'Inter, sans-serif' },
    { tokenKey: 'font.mono', tokenType: 'font' as const, tokenValue: 'JetBrains Mono, monospace' },
    // Spacing (3)
    { tokenKey: 'spacing.sm', tokenType: 'spacing' as const, tokenValue: '8px' },
    { tokenKey: 'spacing.md', tokenType: 'spacing' as const, tokenValue: '16px' },
    { tokenKey: 'spacing.lg', tokenType: 'spacing' as const, tokenValue: '32px' },
  ],
  recipes: [
    {
      name: 'Spinner Dots',
      type: 'loader' as const,
      codeTemplate: `"use client";
import React from "react";

interface SpinnerDotsProps {
  color?: string;
  size?: number;
}

export function SpinnerDots({ color = "#8B5CF6", size = 12 }: SpinnerDotsProps) {
  return (
    <>
      <style>{\`
        @keyframes uv-bounce-dot {
          0%, 80%, 100% {
            transform: scale(0.6) translateY(0);
            opacity: 0.4;
          }
          40% {
            transform: scale(1) translateY(-12px);
            opacity: 1;
          }
        }
      \`}</style>
      <div className="inline-flex items-center gap-2" role="status" aria-label="Loading">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: size,
              height: size,
              borderRadius: "9999px",
              backgroundColor: color,
              animation: \`uv-bounce-dot 1.4s ease-in-out \${i * 0.16}s infinite both\`,
            }}
          />
        ))}
      </div>
    </>
  );
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          color: { type: 'string', description: 'Dot color as CSS value' },
          size: { type: 'number', description: 'Dot diameter in pixels' },
        },
      },
      aiUsageRules:
        'Use SpinnerDots for inline loading indicators next to buttons or within content areas. Keep size small (8-16px). Best on dark backgrounds where the violet dots pop. Use alongside loading state text for accessibility.',
    },
    {
      name: 'Pulse Ring Loader',
      type: 'loader' as const,
      codeTemplate: `"use client";
import React from "react";

interface PulseRingLoaderProps {
  color?: string;
  size?: number;
  ringCount?: number;
}

export function PulseRingLoader({ color = "#8B5CF6", size = 64, ringCount = 3 }: PulseRingLoaderProps) {
  return (
    <>
      <style>{\`
        @keyframes uv-pulse-ring {
          0% {
            transform: scale(0.3);
            opacity: 1;
          }
          80%, 100% {
            transform: scale(1);
            opacity: 0;
          }
        }
      \`}</style>
      <div
        className="relative inline-flex items-center justify-center"
        style={{ width: size, height: size }}
        role="status"
        aria-label="Loading"
      >
        {Array.from({ length: ringCount }).map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full"
            style={{
              border: \`2px solid \${color}\`,
              animation: \`uv-pulse-ring 1.8s cubic-bezier(0.21, 0.61, 0.35, 1) \${i * 0.4}s infinite\`,
            }}
          />
        ))}
        <div
          className="rounded-full"
          style={{ width: size * 0.2, height: size * 0.2, backgroundColor: color }}
        />
      </div>
    </>
  );
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          color: { type: 'string', description: 'Ring color as CSS value' },
          size: { type: 'number', description: 'Container size in pixels' },
          ringCount: { type: 'number', description: 'Number of concentric rings (2-5)' },
        },
      },
      aiUsageRules:
        'Use PulseRingLoader for page-level or section-level loading states. Center it in the loading container. Works well on both light and dark backgrounds. Increase ringCount for a more dramatic effect. Pair with a loading message below.',
    },
    {
      name: 'Skeleton Loader',
      type: 'skeleton' as const,
      codeTemplate: `"use client";
import React from "react";

interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  lines?: number;
}

export function SkeletonLoader({ width = "100%", height = "16px", borderRadius = "6px", lines = 1 }: SkeletonLoaderProps) {
  return (
    <>
      <style>{\`
        @keyframes uv-shimmer {
          0% {
            background-position: -400px 0;
          }
          100% {
            background-position: 400px 0;
          }
        }
      \`}</style>
      <div className="flex flex-col gap-3" role="status" aria-label="Loading content">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === lines - 1 && lines > 1 ? "60%" : width,
              height,
              borderRadius,
              background: "linear-gradient(90deg, #1E293B 25%, #334155 50%, #1E293B 75%)",
              backgroundSize: "800px 100%",
              animation: "uv-shimmer 1.5s ease-in-out infinite",
            }}
          />
        ))}
      </div>
    </>
  );
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          width: { type: 'string', description: 'Width of each skeleton bar (CSS value)' },
          height: { type: 'string', description: 'Height of each skeleton bar (CSS value)' },
          borderRadius: { type: 'string', description: 'Border radius (CSS value)' },
          lines: { type: 'number', description: 'Number of skeleton lines to display' },
        },
      },
      aiUsageRules:
        'Use SkeletonLoader as a placeholder while content loads. Match the skeleton dimensions to the expected content. Use multiple lines for text blocks. The last line is automatically shorter for a natural text appearance. Always include aria-label for accessibility.',
    },
    {
      name: 'Orbit Loader',
      type: 'loader' as const,
      codeTemplate: `"use client";
import React from "react";

interface OrbitLoaderProps {
  color?: string;
  size?: number;
  dotSize?: number;
  dotCount?: number;
}

export function OrbitLoader({ color = "#8B5CF6", size = 48, dotSize = 8, dotCount = 4 }: OrbitLoaderProps) {
  return (
    <>
      <style>{\`
        @keyframes uv-orbit {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes uv-orbit-dot-pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.7);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
      \`}</style>
      <div
        className="relative inline-flex items-center justify-center"
        style={{ width: size, height: size }}
        role="status"
        aria-label="Loading"
      >
        <div
          className="absolute inset-0"
          style={{ animation: "uv-orbit 2s linear infinite" }}
        >
          {Array.from({ length: dotCount }).map((_, i) => {
            const angle = (360 / dotCount) * i;
            const rad = (angle * Math.PI) / 180;
            const radius = (size - dotSize) / 2;
            const x = radius * Math.cos(rad) + size / 2 - dotSize / 2;
            const y = radius * Math.sin(rad) + size / 2 - dotSize / 2;
            return (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: dotSize,
                  height: dotSize,
                  backgroundColor: color,
                  left: x,
                  top: y,
                  animation: \`uv-orbit-dot-pulse 1.6s ease-in-out \${i * (1.6 / dotCount)}s infinite\`,
                }}
              />
            );
          })}
        </div>
        <div
          className="rounded-full"
          style={{
            width: dotSize * 1.5,
            height: dotSize * 1.5,
            backgroundColor: color,
            opacity: 0.6,
          }}
        />
      </div>
    </>
  );
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          color: { type: 'string', description: 'Dot color as CSS value' },
          size: { type: 'number', description: 'Container size in pixels' },
          dotSize: { type: 'number', description: 'Orbiting dot diameter in pixels' },
          dotCount: { type: 'number', description: 'Number of orbiting dots (3-8)' },
        },
      },
      aiUsageRules:
        'Use OrbitLoader for processing or computation-heavy loading states. Works well in modals or centered in empty states. The orbit animation conveys ongoing work. Keep dotCount between 3 and 6 for best visual balance.',
    },
    {
      name: 'Typewriter Text',
      type: 'card' as const,
      codeTemplate: `"use client";
import React, { useState, useEffect, useRef } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  cursorColor?: string;
  className?: string;
  onComplete?: () => void;
}

export function TypewriterText({ text, speed = 60, cursorColor = "#8B5CF6", className = "", onComplete }: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed("");
    indexRef.current = 0;
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current += 1;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  useEffect(() => {
    const blink = setInterval(() => setShowCursor((v) => !v), 530);
    return () => clearInterval(blink);
  }, []);

  return (
    <>
      <style>{\`
        @keyframes uv-cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      \`}</style>
      <span className={className}>
        <span className="text-[#F1F5F9]">{displayed}</span>
        <span
          className="inline-block w-[2px] h-[1.1em] align-middle ml-0.5"
          style={{
            backgroundColor: cursorColor,
            opacity: showCursor ? 1 : 0,
            transition: "opacity 0.1s",
          }}
          aria-hidden="true"
        />
      </span>
    </>
  );
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'The text to type out letter by letter' },
          speed: { type: 'number', description: 'Typing speed in ms per character' },
          cursorColor: { type: 'string', description: 'Blinking cursor color' },
          className: { type: 'string', description: 'Additional CSS classes' },
        },
        required: ['text'],
      },
      aiUsageRules:
        'Use TypewriterText for hero headlines, AI response previews, or terminal-style displays. Keep text under 120 characters for impact. Speed of 40-80ms feels natural. Pair with a mono font for a developer aesthetic. Use onComplete to chain animations.',
    },
    {
      name: 'Hover Glow Card',
      type: 'card' as const,
      codeTemplate: `"use client";
import React, { useRef, useCallback, useState } from "react";

interface HoverGlowCardProps {
  children: React.ReactNode;
  glowColor?: string;
  glowSize?: number;
  className?: string;
}

export function HoverGlowCard({ children, glowColor = "rgba(139, 92, 246, 0.25)", glowSize = 300, className = "" }: HoverGlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setGlowPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <>
      <style>{\`
        @keyframes uv-glow-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      \`}</style>
      <div
        ref={cardRef}
        className={\`relative overflow-hidden rounded-2xl border border-[#334155] bg-[#1E293B] p-6 transition-shadow duration-300 \${isHovered ? "shadow-[0_0_40px_rgba(139,92,246,0.15)]" : ""} \${className}\`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: \`radial-gradient(\${glowSize}px circle at \${glowPos.x}px \${glowPos.y}px, \${glowColor}, transparent 60%)\`,
          }}
        />
        <div className="relative z-10">{children}</div>
      </div>
    </>
  );
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          glowColor: { type: 'string', description: 'Glow color as rgba CSS value' },
          glowSize: { type: 'number', description: 'Glow radius in pixels' },
          className: { type: 'string', description: 'Additional CSS classes' },
          children: { type: 'string', description: 'Card body content' },
        },
      },
      aiUsageRules:
        'Use HoverGlowCard for feature cards, pricing tiers, or interactive content blocks. The glow follows the mouse for a dynamic feel. Best on dark backgrounds where the glow is visible. Limit to 3-4 per row to avoid visual overload.',
    },
    {
      name: 'Flip Card',
      type: 'card' as const,
      codeTemplate: `"use client";
import React, { useState } from "react";

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  width?: string;
  height?: string;
  className?: string;
}

export function FlipCard({ front, back, width = "280px", height = "360px", className = "" }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <>
      <style>{\`
        .uv-flip-card-inner {
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }
        .uv-flip-card-inner.uv-flipped {
          transform: rotateY(180deg);
        }
        .uv-flip-face {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .uv-flip-back {
          transform: rotateY(180deg);
        }
      \`}</style>
      <div
        className={\`group cursor-pointer \${className}\`}
        style={{ width, height, perspective: "1000px" }}
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
      >
        <div className={\`uv-flip-card-inner relative w-full h-full \${flipped ? "uv-flipped" : ""}\`}>
          <div className="uv-flip-face absolute inset-0 rounded-2xl border border-[#334155] bg-[#1E293B] p-6 flex flex-col items-center justify-center">
            {front}
          </div>
          <div className="uv-flip-face uv-flip-back absolute inset-0 rounded-2xl border border-[#8B5CF6]/40 bg-[#1E293B] p-6 flex flex-col items-center justify-center">
            {back}
          </div>
        </div>
      </div>
    </>
  );
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          front: { type: 'string', description: 'Content for the front face of the card' },
          back: { type: 'string', description: 'Content for the back face of the card' },
          width: { type: 'string', description: 'Card width as CSS value' },
          height: { type: 'string', description: 'Card height as CSS value' },
          className: { type: 'string', description: 'Additional CSS classes' },
        },
        required: ['front', 'back'],
      },
      aiUsageRules:
        'Use FlipCard for team member profiles, feature reveals, or before/after comparisons. Front should have a concise summary; back has details. Keep content balanced on both sides. Set fixed width and height so the flip looks clean. Avoid nesting interactive elements inside.',
    },
    {
      name: 'Animated Counter',
      type: 'card' as const,
      codeTemplate: `"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export function AnimatedCounter({ target, duration = 2000, prefix = "", suffix = "", className = "", decimals = 0 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  const animate = useCallback(() => {
    if (hasAnimated) return;
    setHasAnimated(true);
    const startTime = performance.now();
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [target, duration, hasAnimated]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animate]);

  return (
    <>
      <style>{\`
        @keyframes uv-counter-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      \`}</style>
      <span
        ref={ref}
        className={\`inline-block font-bold tabular-nums text-[#F1F5F9] \${className}\`}
        style={hasAnimated && count >= target ? { animation: "uv-counter-pop 0.3s ease-out" } : undefined}
      >
        {prefix}{count.toFixed(decimals).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",")}{suffix}
      </span>
    </>
  );
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          target: { type: 'number', description: 'The target number to count up to' },
          duration: { type: 'number', description: 'Animation duration in ms' },
          prefix: { type: 'string', description: 'Text before the number, e.g. "$"' },
          suffix: { type: 'string', description: 'Text after the number, e.g. "+" or "%"' },
          decimals: { type: 'number', description: 'Number of decimal places' },
          className: { type: 'string', description: 'Additional CSS classes' },
        },
        required: ['target'],
      },
      aiUsageRules:
        'Use AnimatedCounter for stats, metrics, or social proof numbers. Triggers on scroll into view via IntersectionObserver. Use prefix for currency symbols and suffix for units. Keep duration between 1500-3000ms for a satisfying feel. Use decimals for percentages.',
    },
    {
      name: 'Tooltip Animated',
      type: 'tooltip' as const,
      codeTemplate: `"use client";
import React, { useState } from "react";

interface TooltipAnimatedProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function TooltipAnimated({ content, children, position = "top" }: TooltipAnimatedProps) {
  const [visible, setVisible] = useState(false);

  const positionClasses: Record<string, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses: Record<string, string> = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-[#1E293B]",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-[#1E293B]",
    left: "left-full top-1/2 -translate-y-1/2 border-l-[#1E293B]",
    right: "right-full top-1/2 -translate-y-1/2 border-r-[#1E293B]",
  };

  return (
    <>
      <style>{\`
        @keyframes uv-tooltip-spring {
          0% {
            opacity: 0;
            transform: translateX(var(--uv-tt-tx, -50%)) translateY(var(--uv-tt-ty, 4px)) scale(0.9);
          }
          60% {
            transform: translateX(var(--uv-tt-tx, -50%)) translateY(var(--uv-tt-ty-end, -1px)) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateX(var(--uv-tt-tx, -50%)) translateY(var(--uv-tt-ty-end, 0px)) scale(1);
          }
        }
      \`}</style>
      <div
        className="relative inline-block"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      >
        {children}
        {visible && (
          <div
            className={\`absolute z-50 whitespace-nowrap rounded-lg bg-[#1E293B] border border-[#334155] px-3 py-1.5 text-sm text-[#F1F5F9] shadow-lg \${positionClasses[position]}\`}
            style={{
              animation: "uv-tooltip-spring 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            }}
            role="tooltip"
          >
            {content}
            <div
              className={\`absolute w-0 h-0 border-4 border-transparent \${arrowClasses[position]}\`}
            />
          </div>
        )}
      </div>
    </>
  );
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          content: { type: 'string', description: 'Tooltip text content' },
          position: {
            type: 'string',
            enum: ['top', 'bottom', 'left', 'right'],
            description: 'Tooltip position relative to trigger',
          },
          children: { type: 'string', description: 'The trigger element' },
        },
        required: ['content'],
      },
      aiUsageRules:
        'Use TooltipAnimated for icon buttons, truncated text, or supplementary info. The spring animation makes it feel lively. Keep content short (under 60 characters). Default to top position. Ensure focus/blur handlers are present for keyboard accessibility.',
    },
    {
      name: 'Toast Notification',
      type: 'toast' as const,
      codeTemplate: `"use client";
import React, { useState, useEffect, useCallback } from "react";

interface ToastNotificationProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
  onDismiss?: () => void;
}

const typeStyles: Record<string, { bg: string; accent: string; icon: string }> = {
  success: { bg: "bg-emerald-500/10 border-emerald-500/30", accent: "bg-emerald-500", icon: "M5 13l4 4L19 7" },
  error: { bg: "bg-red-500/10 border-red-500/30", accent: "bg-red-500", icon: "M6 18L18 6M6 6l12 12" },
  info: { bg: "bg-[#8B5CF6]/10 border-[#8B5CF6]/30", accent: "bg-[#8B5CF6]", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  warning: { bg: "bg-amber-500/10 border-amber-500/30", accent: "bg-amber-500", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" },
};

export function ToastNotification({ message, type = "info", duration = 4000, onDismiss }: ToastNotificationProps) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const styles = typeStyles[type];

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => onDismiss?.(), 300);
  }, [onDismiss]);

  useEffect(() => {
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(tick);
        dismiss();
      }
    }, 50);
    return () => clearInterval(tick);
  }, [duration, dismiss]);

  return (
    <>
      <style>{\`
        @keyframes uv-toast-slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes uv-toast-slide-out {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      \`}</style>
      <div
        className={\`relative overflow-hidden rounded-lg border \${styles.bg} bg-[#1E293B] p-4 shadow-xl max-w-sm w-full\`}
        style={{
          animation: visible
            ? "uv-toast-slide-in 0.4s cubic-bezier(0.21, 1.02, 0.73, 1) forwards"
            : "uv-toast-slide-out 0.3s ease-in forwards",
        }}
        role="alert"
      >
        <div className="flex items-start gap-3">
          <div className={\`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full \${styles.accent} flex items-center justify-center\`}>
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={styles.icon} />
            </svg>
          </div>
          <p className="flex-1 text-sm text-[#F1F5F9]">{message}</p>
          <button
            onClick={dismiss}
            className="flex-shrink-0 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
            aria-label="Dismiss notification"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-black/20">
          <div
            className={\`h-full \${styles.accent} transition-none\`}
            style={{ width: \`\${progress}%\` }}
          />
        </div>
      </div>
    </>
  );
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'Notification message text' },
          type: {
            type: 'string',
            enum: ['success', 'error', 'info', 'warning'],
            description: 'Toast style variant',
          },
          duration: { type: 'number', description: 'Auto-dismiss duration in ms' },
        },
        required: ['message'],
      },
      aiUsageRules:
        'Use ToastNotification for transient feedback after user actions (save, delete, error). Position in top-right or bottom-right of the viewport using a fixed container. Duration of 3000-5000ms is ideal. Always provide a dismiss button for accessibility. Stack multiple toasts with vertical gap.',
    },
    {
      name: 'Ripple Button',
      type: 'button' as const,
      codeTemplate: `"use client";
import React, { useState, useCallback } from "react";

interface RippleButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  rippleColor?: string;
  variant?: "primary" | "secondary" | "outline";
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

export function RippleButton({ children, onClick, className = "", rippleColor = "rgba(255,255,255,0.35)", variant = "primary" }: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const variantClasses: Record<string, string> = {
    primary: "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]",
    secondary: "bg-[#1E293B] text-[#F1F5F9] hover:bg-[#334155] border border-[#334155]",
    outline: "bg-transparent text-[#8B5CF6] border border-[#8B5CF6] hover:bg-[#8B5CF6]/10",
  };

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      const id = Date.now();
      setRipples((prev) => [...prev, { id, x, y, size }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
      onClick?.(e);
    },
    [onClick]
  );

  return (
    <>
      <style>{\`
        @keyframes uv-ripple-expand {
          from {
            transform: scale(0);
            opacity: 0.6;
          }
          to {
            transform: scale(1);
            opacity: 0;
          }
        }
      \`}</style>
      <button
        className={\`relative overflow-hidden rounded-lg px-6 py-2.5 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A] \${variantClasses[variant]} \${className}\`}
        onClick={handleClick}
      >
        <span className="relative z-10">{children}</span>
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              backgroundColor: rippleColor,
              animation: "uv-ripple-expand 0.6s ease-out forwards",
            }}
          />
        ))}
      </button>
    </>
  );
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          children: { type: 'string', description: 'Button label text' },
          rippleColor: { type: 'string', description: 'Ripple overlay color as rgba' },
          variant: {
            type: 'string',
            enum: ['primary', 'secondary', 'outline'],
            description: 'Visual style variant',
          },
          className: { type: 'string', description: 'Additional CSS classes' },
        },
      },
      aiUsageRules:
        'Use RippleButton for primary actions where tactile feedback matters. The ripple originates from the exact click point for a material-design feel. Use primary variant for CTAs, secondary for less prominent actions, outline for tertiary. Avoid combining with other click animations.',
    },
    {
      name: 'Confetti Burst',
      type: 'button' as const,
      codeTemplate: `"use client";
import React, { useState, useCallback, useRef } from "react";

interface ConfettiBurstProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  particleCount?: number;
  colors?: string[];
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  velocity: number;
  size: number;
}

export function ConfettiBurst({
  children,
  onClick,
  className = "",
  particleCount = 24,
  colors = ["#8B5CF6", "#06B6D4", "#F59E0B", "#EF4444", "#22C55E", "#EC4899"],
}: ConfettiBurstProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const newParticles: Particle[] = Array.from({ length: particleCount }).map((_, i) => ({
        id: Date.now() + i,
        x: centerX,
        y: centerY,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: (360 / particleCount) * i + (Math.random() * 20 - 10),
        velocity: 60 + Math.random() * 60,
        size: 4 + Math.random() * 4,
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 800);
      onClick?.(e);
    },
    [onClick, particleCount, colors]
  );

  return (
    <>
      <style>{\`
        @keyframes uv-confetti-burst {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--uv-cx), var(--uv-cy)) rotate(var(--uv-cr)) scale(0);
            opacity: 0;
          }
        }
      \`}</style>
      <button
        ref={btnRef}
        className={\`relative overflow-visible rounded-lg bg-[#8B5CF6] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#7C3AED] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A] \${className}\`}
        onClick={handleClick}
      >
        <span className="relative z-10">{children}</span>
        {particles.map((p) => {
          const rad = (p.angle * Math.PI) / 180;
          const tx = Math.cos(rad) * p.velocity;
          const ty = Math.sin(rad) * p.velocity - 20;
          const rotation = Math.random() * 720 - 360;
          return (
            <span
              key={p.id}
              className="absolute pointer-events-none rounded-sm"
              style={{
                left: p.x,
                top: p.y,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                ["--uv-cx" as string]: \`\${tx}px\`,
                ["--uv-cy" as string]: \`\${ty}px\`,
                ["--uv-cr" as string]: \`\${rotation}deg\`,
                animation: "uv-confetti-burst 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
              }}
            />
          );
        })}
      </button>
    </>
  );
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          children: { type: 'string', description: 'Button label text' },
          particleCount: { type: 'number', description: 'Number of confetti particles (12-40)' },
          colors: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of particle color hex codes',
          },
          className: { type: 'string', description: 'Additional CSS classes' },
        },
      },
      aiUsageRules:
        'Use ConfettiBurst for celebratory actions: completing a form, achieving a goal, successful payment. Use sparingly for maximum impact. The button must have overflow-visible so particles render outside bounds. Keep particleCount between 16-32 for performance. Customize colors to match brand.',
    },
  ],
};
