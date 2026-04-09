// Utility
export { cn } from './lib/utils';

// Design-system primitives (dark theme)
export { Button as DsButton } from './button';
export type { ButtonProps as DsButtonProps } from './button';

export { Card, CardHeader, CardContent, Label } from './card';
export type { CardProps, CardHeaderProps, CardContentProps } from './card';

// Layout Components
export { AppShell } from './components/app-shell';
export type { AppShellProps } from './components/app-shell';

export { Sidebar } from './components/sidebar';
export type { SidebarItem, SidebarProps } from './components/sidebar';

export { Header } from './components/header';
export type { Breadcrumb, HeaderProps } from './components/header';

export { PageContainer } from './components/page-container';
export type { PageContainerProps } from './components/page-container';

// Atoms
export { Button, buttonVariants } from './components/atoms/button';
export type { ButtonProps } from './components/atoms/button';

export { Badge, badgeVariants } from './components/atoms/badge';
export type { BadgeProps } from './components/atoms/badge';

export { Input } from './components/atoms/input';
export type { InputProps } from './components/atoms/input';

export { Avatar } from './components/atoms/avatar';
export type { AvatarProps } from './components/atoms/avatar';

export { CodeBlock } from './components/atoms/code-block';
export type { CodeBlockProps } from './components/atoms/code-block';

export { IconBadge } from './components/atoms/icon-badge';
export type { IconBadgeProps } from './components/atoms/icon-badge';

export { Separator } from './components/atoms/separator';
export type { SeparatorProps } from './components/atoms/separator';

// Molecules
export { StatCard } from './components/molecules/stat-card';
export type { StatCardProps } from './components/molecules/stat-card';

export { FeatureCard } from './components/molecules/feature-card';
export type { FeatureCardProps } from './components/molecules/feature-card';

export { StepIndicator } from './components/molecules/step-indicator';
export type { Step, StepStatus, StepIndicatorProps } from './components/molecules/step-indicator';

export { EmptyState } from './components/molecules/empty-state';
export type { EmptyStateProps } from './components/molecules/empty-state';

export { CopyButton } from './components/molecules/copy-button';
export type { CopyButtonProps } from './components/molecules/copy-button';
