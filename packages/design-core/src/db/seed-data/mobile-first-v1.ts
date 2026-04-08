export const mobileFirstV1 = {
  pack: {
    name: 'Mobile-First',
    slug: 'mobile-first-v1',
    category: 'mobile',
    description:
      'iOS/Android-inspired mobile-first design system with touch-friendly sizing, rounded surfaces, and clean native aesthetics',
    version: '1.0.0',
    isPublic: true,
  },
  tokens: [
    { tokenKey: 'color.primary', tokenType: 'color' as const, tokenValue: '#6366F1' },
    { tokenKey: 'color.primary-hover', tokenType: 'color' as const, tokenValue: '#4F46E5' },
    { tokenKey: 'color.secondary', tokenType: 'color' as const, tokenValue: '#8B5CF6' },
    { tokenKey: 'color.accent', tokenType: 'color' as const, tokenValue: '#F97316' },
    { tokenKey: 'color.background', tokenType: 'color' as const, tokenValue: '#FFFFFF' },
    { tokenKey: 'color.surface', tokenType: 'color' as const, tokenValue: '#F3F4F6' },
    { tokenKey: 'color.text-primary', tokenType: 'color' as const, tokenValue: '#111827' },
    { tokenKey: 'color.text-secondary', tokenType: 'color' as const, tokenValue: '#6B7280' },
    { tokenKey: 'color.border', tokenType: 'color' as const, tokenValue: '#E5E7EB' },
    { tokenKey: 'color.error', tokenType: 'color' as const, tokenValue: '#EF4444' },
    { tokenKey: 'color.success', tokenType: 'color' as const, tokenValue: '#10B981' },
    { tokenKey: 'color.warning', tokenType: 'color' as const, tokenValue: '#F59E0B' },
    { tokenKey: 'radius.sm', tokenType: 'radius' as const, tokenValue: '8px' },
    { tokenKey: 'radius.md', tokenType: 'radius' as const, tokenValue: '12px' },
    { tokenKey: 'radius.lg', tokenType: 'radius' as const, tokenValue: '16px' },
    { tokenKey: 'radius.full', tokenType: 'radius' as const, tokenValue: '9999px' },
    {
      tokenKey: 'font.heading',
      tokenType: 'font' as const,
      tokenValue: 'SF Pro Display, system-ui, sans-serif',
    },
    {
      tokenKey: 'font.body',
      tokenType: 'font' as const,
      tokenValue: 'SF Pro Text, system-ui, sans-serif',
    },
    {
      tokenKey: 'font.mono',
      tokenType: 'font' as const,
      tokenValue: 'SF Mono, monospace',
    },
    { tokenKey: 'spacing.xs', tokenType: 'spacing' as const, tokenValue: '8px' },
    { tokenKey: 'spacing.sm', tokenType: 'spacing' as const, tokenValue: '12px' },
    { tokenKey: 'spacing.md', tokenType: 'spacing' as const, tokenValue: '16px' },
    { tokenKey: 'spacing.lg', tokenType: 'spacing' as const, tokenValue: '24px' },
    { tokenKey: 'spacing.xl', tokenType: 'spacing' as const, tokenValue: '32px' },
    { tokenKey: 'spacing.xxl', tokenType: 'spacing' as const, tokenValue: '48px' },
    {
      tokenKey: 'shadow.sm',
      tokenType: 'shadow' as const,
      tokenValue: '0 1px 3px 0 rgb(0 0 0 / 0.08)',
    },
    {
      tokenKey: 'shadow.md',
      tokenType: 'shadow' as const,
      tokenValue: '0 4px 12px -2px rgb(0 0 0 / 0.12)',
    },
    {
      tokenKey: 'shadow.lg',
      tokenType: 'shadow' as const,
      tokenValue: '0 12px 24px -4px rgb(0 0 0 / 0.15)',
    },
  ],
  recipes: [
    {
      name: 'Bottom Tab Bar',
      type: 'navigation' as const,
      codeTemplate: `interface TabItem {
  label: string
  icon: React.ReactNode
  href: string
  active?: boolean
}

interface BottomTabBarProps {
  items: TabItem[]
}

export function BottomTabBar({ items }: BottomTabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-center justify-around px-4">
        {items.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={\`flex min-h-[48px] min-w-[48px] flex-col items-center justify-center gap-0.5 px-3 py-2 transition-colors \${item.active ? "text-indigo-500" : "text-gray-400 active:text-gray-600"}\`}
          >
            <span className="flex h-6 w-6 items-center justify-center">{item.icon}</span>
            <span className={\`text-[10px] font-medium \${item.active ? "text-indigo-500" : "text-gray-400"}\`}>{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                icon: { type: 'string' },
                href: { type: 'string' },
                active: { type: 'boolean' },
              },
            },
          },
        },
      },
      aiUsageRules:
        'Use BottomTabBar as the primary navigation for mobile apps. Always provide exactly 5 tab items. Active tab uses indigo color. Includes safe-area padding for notched devices. Each tap target is at least 48px. Place at the bottom of the layout and add pb-20 to main content.',
    },
    {
      name: 'Swipeable Card',
      type: 'card' as const,
      codeTemplate: `interface SwipeableCardProps {
  title: string
  description: string
  image?: string
  onArchive?: () => void
  onDelete?: () => void
}

export function SwipeableCard({ title, description, image, onArchive, onDelete }: SwipeableCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.08)]">
      <div className="absolute inset-y-0 left-0 flex w-20 items-center justify-center bg-indigo-500 text-white opacity-0 transition-opacity group-hover:opacity-100">
        <button onClick={onArchive} className="flex h-11 w-11 items-center justify-center" aria-label="Archive">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100">
        <button onClick={onDelete} className="flex h-11 w-11 items-center justify-center" aria-label="Delete">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
      <div className="relative z-10 flex items-start gap-4 bg-white p-4 transition-transform">
        {image && <img src={image} alt="" className="h-16 w-16 flex-shrink-0 rounded-xl object-cover" />}
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-gray-900 truncate">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-gray-500 line-clamp-2">{description}</p>
        </div>
      </div>
    </div>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          image: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use SwipeableCard for list items that support swipe actions such as archive (left reveal) and delete (right reveal). On touch devices, implement swipe gesture handling. On desktop, actions are revealed on hover. Keep title to one line and description to two lines max.',
    },
    {
      name: 'Pull-to-Refresh Header',
      type: 'header' as const,
      codeTemplate: `interface PullToRefreshHeaderProps {
  title: string
  isRefreshing?: boolean
  lastUpdated?: string
}

export function PullToRefreshHeader({ title, isRefreshing = false, lastUpdated }: PullToRefreshHeaderProps) {
  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg">
      <div className="flex flex-col items-center overflow-hidden transition-all duration-300" style={{ maxHeight: isRefreshing ? '48px' : '0px' }}>
        <div className="flex items-center gap-2 py-3">
          <svg className={\`h-5 w-5 text-indigo-500 \${isRefreshing ? "animate-spin" : ""}\`} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-medium text-indigo-500">{isRefreshing ? "Updating..." : "Pull to refresh"}</span>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
        {lastUpdated && (
          <span className="text-xs text-gray-400">Updated {lastUpdated}</span>
        )}
      </div>
    </div>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          isRefreshing: { type: 'boolean' },
          lastUpdated: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use PullToRefreshHeader at the top of scrollable feed views. The refresh indicator is hidden by default and expands when isRefreshing is true. Pair with a pull-to-refresh gesture handler. Title uses large bold text following iOS navigation bar conventions.',
    },
    {
      name: 'Action Sheet',
      type: 'modal' as const,
      codeTemplate: `interface ActionSheetOption {
  label: string
  icon?: React.ReactNode
  destructive?: boolean
  onPress: () => void
}

interface ActionSheetProps {
  title?: string
  message?: string
  options: ActionSheetOption[]
  onCancel: () => void
  isOpen: boolean
}

export function ActionSheet({ title, message, options, onCancel, isOpen }: ActionSheetProps) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-lg px-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
        <div className="overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl">
          {(title || message) && (
            <div className="border-b border-gray-200/60 px-4 py-3 text-center">
              {title && <p className="text-sm font-semibold text-gray-900">{title}</p>}
              {message && <p className="mt-0.5 text-xs text-gray-500">{message}</p>}
            </div>
          )}
          <div className="divide-y divide-gray-200/60">
            {options.map((option) => (
              <button
                key={option.label}
                onClick={option.onPress}
                className={\`flex min-h-[56px] w-full items-center justify-center gap-2 px-4 text-center text-lg transition-colors active:bg-gray-100 \${option.destructive ? "font-normal text-red-500" : "font-normal text-indigo-500"}\`}
              >
                {option.icon && <span className="flex h-5 w-5 items-center justify-center">{option.icon}</span>}
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={onCancel}
          className="mt-2 flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-white text-lg font-semibold text-indigo-500 transition-colors active:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          message: { type: 'string' },
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                destructive: { type: 'boolean' },
              },
            },
          },
          isOpen: { type: 'boolean' },
        },
      },
      aiUsageRules:
        'Use ActionSheet for contextual actions triggered by long-press or menu buttons. Follows iOS action sheet conventions with grouped options and a separate cancel button. Mark destructive options (delete, remove) with destructive=true for red text. Each option tap target is at least 56px tall.',
    },
    {
      name: 'Floating Action Button',
      type: 'button' as const,
      codeTemplate: `interface SpeedDialOption {
  label: string
  icon: React.ReactNode
  onPress: () => void
}

interface FloatingActionButtonProps {
  icon: React.ReactNode
  onPress: () => void
  speedDial?: SpeedDialOption[]
  isExpanded?: boolean
  onToggle?: () => void
}

export function FloatingActionButton({ icon, onPress, speedDial, isExpanded = false, onToggle }: FloatingActionButtonProps) {
  const handlePress = speedDial ? onToggle : onPress
  return (
    <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-3 pb-[env(safe-area-inset-bottom)]">
      {speedDial && isExpanded && (
        <div className="flex flex-col-reverse items-end gap-2">
          {speedDial.map((option) => (
            <div key={option.label} className="flex items-center gap-3">
              <span className="rounded-lg bg-gray-900/80 px-3 py-1.5 text-sm font-medium text-white shadow-lg backdrop-blur-sm">{option.label}</span>
              <button
                onClick={option.onPress}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-indigo-500 shadow-[0_4px_12px_-2px_rgb(0_0_0/0.12)] transition-transform active:scale-90"
              >
                {option.icon}
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={handlePress}
        className={\`flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500 text-white shadow-[0_4px_12px_-2px_rgb(99_102_241/0.5)] transition-all active:scale-90 \${isExpanded ? "rotate-45" : ""}\`}
      >
        {icon}
      </button>
    </div>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          icon: { type: 'string' },
          speedDial: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                icon: { type: 'string' },
              },
            },
          },
          isExpanded: { type: 'boolean' },
        },
      },
      aiUsageRules:
        'Use FloatingActionButton for the primary creation action (new message, new post, add item). Position above the bottom tab bar with bottom-24. Optional speed dial expands upward with labeled mini-FABs. The main FAB rotates 45 degrees when expanded. Use a plus icon as default.',
    },
    {
      name: 'Story Circles',
      type: 'navigation' as const,
      codeTemplate: `interface StoryItem {
  id: string
  label: string
  avatarUrl: string
  hasNew?: boolean
  isOwn?: boolean
}

interface StoryCirclesProps {
  stories: StoryItem[]
  onPress?: (id: string) => void
}

export function StoryCircles({ stories, onPress }: StoryCirclesProps) {
  return (
    <div className="border-b border-gray-100 bg-white py-3">
      <div className="flex gap-4 overflow-x-auto px-4 scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
        {stories.map((story) => (
          <button
            key={story.id}
            onClick={() => onPress?.(story.id)}
            className="flex min-w-[64px] flex-shrink-0 flex-col items-center gap-1"
          >
            <div className={\`relative flex h-16 w-16 items-center justify-center rounded-full \${story.hasNew ? "bg-gradient-to-br from-orange-400 via-pink-500 to-indigo-500 p-[2px]" : "bg-gray-200 p-[2px]"}\`}>
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white p-[2px]">
                <img src={story.avatarUrl} alt={story.label} className="h-full w-full rounded-full object-cover" />
              </div>
              {story.isOwn && (
                <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-indigo-500 text-white">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                </div>
              )}
            </div>
            <span className="max-w-[64px] truncate text-[11px] text-gray-600">{story.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          stories: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                label: { type: 'string' },
                avatarUrl: { type: 'string' },
                hasNew: { type: 'boolean' },
                isOwn: { type: 'boolean' },
              },
            },
          },
        },
      },
      aiUsageRules:
        'Use StoryCircles for horizontal scrolling story/status indicators at the top of feeds. Unseen stories show a gradient ring (orange to indigo). The first item should be the current user with isOwn=true showing a plus badge. Labels truncate to fit 64px width. Enable horizontal scroll with touch momentum.',
    },
    {
      name: 'Notification Card',
      type: 'card' as const,
      codeTemplate: `interface NotificationCardProps {
  icon: React.ReactNode
  iconColor?: string
  title: string
  body: string
  timestamp: string
  unread?: boolean
  onPress?: () => void
}

export function NotificationCard({ icon, iconColor = "bg-indigo-100 text-indigo-500", title, body, timestamp, unread = false, onPress }: NotificationCardProps) {
  return (
    <button
      onClick={onPress}
      className={\`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors active:bg-gray-50 \${unread ? "bg-indigo-50/50" : "bg-white"}\`}
    >
      <div className={\`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full \${iconColor}\`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className={\`text-sm truncate \${unread ? "font-semibold text-gray-900" : "font-medium text-gray-700"}\`}>{title}</h4>
          <div className="flex flex-shrink-0 items-center gap-1.5">
            <span className="text-xs text-gray-400 whitespace-nowrap">{timestamp}</span>
            {unread && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500" />}
          </div>
        </div>
        <p className="mt-0.5 text-sm leading-relaxed text-gray-500 line-clamp-2">{body}</p>
      </div>
    </button>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          icon: { type: 'string' },
          iconColor: { type: 'string' },
          title: { type: 'string' },
          body: { type: 'string' },
          timestamp: { type: 'string' },
          unread: { type: 'boolean' },
        },
      },
      aiUsageRules:
        'Use NotificationCard in notification center lists. Unread notifications have a subtle indigo background tint and a dot indicator. Each card is a full-width tappable row with a minimum height for comfortable touch targets. Group notifications by date (Today, Yesterday, Earlier). Timestamps should be relative (2m, 1h, 3d).',
    },
    {
      name: 'Search Bar',
      type: 'input' as const,
      codeTemplate: `interface SearchBarProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onCancel?: () => void
  isFocused?: boolean
  recentSearches?: string[]
  onSelectRecent?: (term: string) => void
}

export function SearchBar({ placeholder = "Search", value = "", onChange, onFocus, onCancel, isFocused = false, recentSearches, onSelectRecent }: SearchBarProps) {
  return (
    <div className="bg-white px-4 py-2">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onFocus={onFocus}
            placeholder={placeholder}
            className="h-10 w-full rounded-xl bg-gray-100 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:bg-gray-50 focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        {isFocused && (
          <button onClick={onCancel} className="flex-shrink-0 text-sm font-medium text-indigo-500 active:text-indigo-600">
            Cancel
          </button>
        )}
      </div>
      {isFocused && recentSearches && recentSearches.length > 0 && (
        <div className="mt-2 rounded-xl bg-white">
          <p className="px-1 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Recent</p>
          <div className="space-y-0.5">
            {recentSearches.map((term) => (
              <button
                key={term}
                onClick={() => onSelectRecent?.(term)}
                className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-2 text-left transition-colors active:bg-gray-50"
              >
                <svg className="h-4 w-4 flex-shrink-0 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-sm text-gray-600">{term}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          placeholder: { type: 'string' },
          value: { type: 'string' },
          isFocused: { type: 'boolean' },
          recentSearches: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
      aiUsageRules:
        'Use SearchBar at the top of list/feed screens. The rounded input field with a leading search icon follows iOS search bar conventions. A cancel button appears when focused. Recent searches display below when focused and available. All tappable elements meet the 44px minimum touch target.',
    },
    {
      name: 'Onboarding Slide',
      type: 'page-template' as const,
      codeTemplate: `interface OnboardingSlideProps {
  illustration: React.ReactNode
  title: string
  description: string
  currentStep: number
  totalSteps: number
  onNext: () => void
  onSkip?: () => void
  nextLabel?: string
}

export function OnboardingSlide({ illustration, title, description, currentStep, totalSteps, onNext, onSkip, nextLabel = "Next" }: OnboardingSlideProps) {
  const isLast = currentStep === totalSteps - 1
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex items-center justify-end px-4 pt-[env(safe-area-inset-top)]">
        {!isLast && onSkip && (
          <button onClick={onSkip} className="min-h-[44px] px-4 text-sm font-medium text-gray-400 active:text-gray-600">
            Skip
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-8">
        <div className="flex h-64 w-full items-center justify-center">{illustration}</div>
        <h2 className="mt-8 text-center text-2xl font-bold tracking-tight text-gray-900">{title}</h2>
        <p className="mt-3 max-w-sm text-center text-base leading-relaxed text-gray-500">{description}</p>
      </div>
      <div className="flex flex-col items-center gap-6 px-8 pb-12 pb-[calc(48px+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={\`h-2 rounded-full transition-all duration-300 \${i === currentStep ? "w-6 bg-indigo-500" : "w-2 bg-gray-200"}\`}
            />
          ))}
        </div>
        <button
          onClick={onNext}
          className="h-12 w-full max-w-sm rounded-2xl bg-indigo-500 text-base font-semibold text-white shadow-[0_4px_12px_-2px_rgb(99_102_241/0.4)] transition-all active:scale-[0.98] active:bg-indigo-600"
        >
          {isLast ? "Get Started" : nextLabel}
        </button>
      </div>
    </div>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          illustration: { type: 'string' },
          currentStep: { type: 'number' },
          totalSteps: { type: 'number' },
          nextLabel: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use OnboardingSlide for first-run app onboarding flows. Typically 3-4 slides. The illustration area is 256px tall for images or Lottie animations. The active dot indicator stretches wider than inactive dots. The last slide button text changes to "Get Started". Includes safe-area padding for notched devices.',
    },
    {
      name: 'Settings Row',
      type: 'card' as const,
      codeTemplate: `interface SettingsItem {
  icon?: React.ReactNode
  iconColor?: string
  label: string
  value?: string
  hasToggle?: boolean
  toggleValue?: boolean
  onToggle?: (value: boolean) => void
  onPress?: () => void
  destructive?: boolean
}

interface SettingsRowProps {
  title?: string
  items: SettingsItem[]
}

export function SettingsRow({ title, items }: SettingsRowProps) {
  return (
    <div className="mb-6">
      {title && (
        <h3 className="mb-1 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</h3>
      )}
      <div className="mx-4 overflow-hidden rounded-xl bg-white">
        {items.map((item, index) => (
          <button
            key={item.label}
            onClick={item.hasToggle ? undefined : item.onPress}
            className={\`flex min-h-[48px] w-full items-center gap-3 px-4 text-left transition-colors \${!item.hasToggle ? "active:bg-gray-50" : ""} \${index > 0 ? "border-t border-gray-100" : ""}\`}
          >
            {item.icon && (
              <div className={\`flex h-7 w-7 items-center justify-center rounded-md \${item.iconColor ?? "bg-gray-100 text-gray-500"}\`}>
                {item.icon}
              </div>
            )}
            <span className={\`flex-1 text-[15px] \${item.destructive ? "text-red-500" : "text-gray-900"}\`}>{item.label}</span>
            {item.value && !item.hasToggle && (
              <span className="text-sm text-gray-400">{item.value}</span>
            )}
            {item.hasToggle && (
              <button
                onClick={() => item.onToggle?.(!item.toggleValue)}
                className={\`relative h-[31px] w-[51px] flex-shrink-0 rounded-full transition-colors duration-200 \${item.toggleValue ? "bg-indigo-500" : "bg-gray-200"}\`}
                role="switch"
                aria-checked={item.toggleValue}
              >
                <span className={\`absolute top-[2px] left-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-sm transition-transform duration-200 \${item.toggleValue ? "translate-x-5" : ""}\`} />
              </button>
            )}
            {!item.hasToggle && !item.destructive && (
              <svg className="h-4 w-4 flex-shrink-0 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                value: { type: 'string' },
                icon: { type: 'string' },
                iconColor: { type: 'string' },
                hasToggle: { type: 'boolean' },
                toggleValue: { type: 'boolean' },
                destructive: { type: 'boolean' },
              },
            },
          },
        },
      },
      aiUsageRules:
        'Use SettingsRow for grouped settings sections following iOS Settings.app conventions. Each section has an optional uppercase title and a rounded white container. Items can display a value (right-aligned gray text), a toggle switch, or a chevron for drill-down navigation. Mark sign-out or delete actions with destructive=true. Group related settings together (Account, Notifications, Appearance, etc.).',
    },
  ],
};
