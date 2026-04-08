export const dashboardDarkV1 = {
  pack: {
    name: 'Dashboard Dark',
    slug: 'dashboard-dark-v1',
    category: 'dashboard',
    description:
      'Dark theme design system optimized for data-dense dashboard UIs with high contrast and readability',
    version: '1.0.0',
    isPublic: true,
  },
  tokens: [
    { tokenKey: 'color.primary', tokenType: 'color' as const, tokenValue: '#3B82F6' },
    { tokenKey: 'color.primary-hover', tokenType: 'color' as const, tokenValue: '#2563EB' },
    { tokenKey: 'color.secondary', tokenType: 'color' as const, tokenValue: '#64748B' },
    { tokenKey: 'color.accent', tokenType: 'color' as const, tokenValue: '#22D3EE' },
    { tokenKey: 'color.background', tokenType: 'color' as const, tokenValue: '#0F172A' },
    { tokenKey: 'color.surface', tokenType: 'color' as const, tokenValue: '#1E293B' },
    { tokenKey: 'color.text-primary', tokenType: 'color' as const, tokenValue: '#F8FAFC' },
    { tokenKey: 'color.text-secondary', tokenType: 'color' as const, tokenValue: '#94A3B8' },
    { tokenKey: 'color.border', tokenType: 'color' as const, tokenValue: '#334155' },
    { tokenKey: 'color.success', tokenType: 'color' as const, tokenValue: '#22C55E' },
    { tokenKey: 'color.error', tokenType: 'color' as const, tokenValue: '#EF4444' },
    { tokenKey: 'color.warning', tokenType: 'color' as const, tokenValue: '#F59E0B' },
    { tokenKey: 'radius.sm', tokenType: 'radius' as const, tokenValue: '4px' },
    { tokenKey: 'radius.md', tokenType: 'radius' as const, tokenValue: '8px' },
    { tokenKey: 'radius.lg', tokenType: 'radius' as const, tokenValue: '12px' },
    { tokenKey: 'radius.full', tokenType: 'radius' as const, tokenValue: '9999px' },
    { tokenKey: 'font.heading', tokenType: 'font' as const, tokenValue: 'Inter' },
    { tokenKey: 'font.body', tokenType: 'font' as const, tokenValue: 'Inter' },
    { tokenKey: 'font.mono', tokenType: 'font' as const, tokenValue: 'Fira Code' },
    { tokenKey: 'spacing.xs', tokenType: 'spacing' as const, tokenValue: '4px' },
    { tokenKey: 'spacing.sm', tokenType: 'spacing' as const, tokenValue: '8px' },
    { tokenKey: 'spacing.md', tokenType: 'spacing' as const, tokenValue: '16px' },
    { tokenKey: 'spacing.lg', tokenType: 'spacing' as const, tokenValue: '24px' },
    { tokenKey: 'spacing.xl', tokenType: 'spacing' as const, tokenValue: '32px' },
    { tokenKey: 'spacing.xxl', tokenType: 'spacing' as const, tokenValue: '48px' },
    {
      tokenKey: 'shadow.sm',
      tokenType: 'shadow' as const,
      tokenValue: '0 1px 3px 0 rgb(0 0 0 / 0.3)',
    },
    {
      tokenKey: 'shadow.md',
      tokenType: 'shadow' as const,
      tokenValue: '0 4px 8px -1px rgb(0 0 0 / 0.4)',
    },
    {
      tokenKey: 'shadow.lg',
      tokenType: 'shadow' as const,
      tokenValue: '0 10px 20px -3px rgb(0 0 0 / 0.5)',
    },
  ],
  recipes: [
    {
      name: 'Stat Card',
      type: 'card' as const,
      codeTemplate: `<div className="rounded-lg bg-[#1E293B] border border-[#334155] p-6">
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-[#94A3B8]">{label}</span>
    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#3B82F6]/10 text-[#3B82F6]">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    </span>
  </div>
  <div className="mt-3 text-3xl font-bold tracking-tight text-[#F8FAFC]">{metricValue}</div>
  <div className="mt-2 flex items-center gap-1.5 text-sm">
    <span className="inline-flex items-center gap-0.5 {trendDirection === 'up' ? 'text-[#22C55E]' : 'text-[#EF4444]'}">
      {trendDirection === 'up' ? (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
        </svg>
      )}
      {percentageChange}
    </span>
    <span className="text-[#94A3B8]">vs last period</span>
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          label: { type: 'string', description: 'Metric label displayed above the value' },
          metricValue: { type: 'string', description: 'Primary metric value, e.g. "$12,345"' },
          percentageChange: { type: 'string', description: 'Change percentage, e.g. "+12.5%"' },
          trendDirection: {
            type: 'string',
            enum: ['up', 'down'],
            description: 'Trend arrow direction',
          },
        },
        required: ['label', 'metricValue', 'percentageChange', 'trendDirection'],
      },
      aiUsageRules:
        'Use for individual KPI metrics. Green arrow and text for positive trends, red for negative. Keep the label short (2-3 words). Format metricValue with appropriate units and separators.',
    },
    {
      name: 'Data Table',
      type: 'table' as const,
      codeTemplate: `<div className="rounded-lg bg-[#1E293B] border border-[#334155] overflow-hidden">
  <div className="px-6 py-4 border-b border-[#334155] flex items-center justify-between">
    <h3 className="text-base font-semibold text-[#F8FAFC]">{title}</h3>
    <span className="text-sm text-[#94A3B8]">{resultCount} results</span>
  </div>
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-[#334155]">
          {columns.map((col) => (
            <th key={col.key} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
              <button className="inline-flex items-center gap-1.5 hover:text-[#F8FAFC]">
                {col.label}
                <svg className="h-3 w-3 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                </svg>
              </button>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-[#334155]/50">
        {rows.map((row, idx) => (
          <tr key={idx} className="hover:bg-[#334155]/30 transition-colors">
            {columns.map((col) => (
              <td key={col.key} className="px-6 py-3.5 text-sm text-[#F8FAFC] whitespace-nowrap">
                {row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  <div className="px-6 py-3 border-t border-[#334155] flex items-center justify-between">
    <span className="text-sm text-[#94A3B8]">Page {currentPage} of {totalPages}</span>
    <div className="flex gap-2">
      <button className="rounded-md bg-[#334155] px-3 py-1.5 text-sm font-medium text-[#F8FAFC] hover:bg-[#475569] disabled:opacity-40" disabled={currentPage <= 1}>Previous</button>
      <button className="rounded-md bg-[#334155] px-3 py-1.5 text-sm font-medium text-[#F8FAFC] hover:bg-[#475569] disabled:opacity-40" disabled={currentPage >= totalPages}>Next</button>
    </div>
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Table heading' },
          resultCount: { type: 'number', description: 'Total number of results' },
          columns: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                key: { type: 'string' },
                label: { type: 'string' },
              },
            },
            description: 'Column definitions with key and display label',
          },
          rows: { type: 'array', description: 'Array of row data objects' },
          currentPage: { type: 'number', description: 'Current page number' },
          totalPages: { type: 'number', description: 'Total page count' },
        },
        required: ['title', 'columns', 'rows'],
      },
      aiUsageRules:
        'Use for tabular data displays. Keep columns to 4-7 for readability. Include sort icons on all sortable columns. Hover state on rows provides visual feedback. Pagination is required for datasets with more than 10 rows.',
    },
    {
      name: 'Chart Card',
      type: 'card' as const,
      codeTemplate: `<div className="rounded-lg bg-[#1E293B] border border-[#334155] p-6">
  <div className="flex items-center justify-between">
    <div>
      <h3 className="text-base font-semibold text-[#F8FAFC]">{title}</h3>
      <p className="mt-0.5 text-sm text-[#94A3B8]">{subtitle}</p>
    </div>
    <div className="flex gap-1 rounded-md bg-[#0F172A] p-1">
      {timeRanges.map((range) => (
        <button
          key={range.value}
          className={
            range.value === activeRange
              ? 'rounded-md bg-[#334155] px-3 py-1 text-xs font-medium text-[#F8FAFC]'
              : 'rounded-md px-3 py-1 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC]'
          }
        >
          {range.label}
        </button>
      ))}
    </div>
  </div>
  <div className="mt-6 h-64 flex items-center justify-center rounded-md border border-dashed border-[#334155]">
    <span className="text-sm text-[#64748B]">{chartPlaceholder}</span>
  </div>
  <div className="mt-4 flex items-center gap-4">
    {legendItems.map((item) => (
      <div key={item.label} className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
        <span className="text-xs text-[#94A3B8]">{item.label}</span>
      </div>
    ))}
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Chart title' },
          subtitle: { type: 'string', description: 'Short description or summary stat' },
          timeRanges: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                value: { type: 'string' },
              },
            },
            description: 'Time range options, e.g. 7D, 30D, 90D',
          },
          activeRange: { type: 'string', description: 'Currently selected time range value' },
          chartPlaceholder: { type: 'string', description: 'Placeholder text for the chart area' },
          legendItems: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                color: { type: 'string' },
              },
            },
            description: 'Legend entries with label and color',
          },
        },
        required: ['title', 'timeRanges', 'activeRange'],
      },
      aiUsageRules:
        'Use as a container for any chart type (line, bar, area, pie). The chart area is a placeholder -- integrate your preferred charting library. Always include a time range selector and a legend if there are multiple data series.',
    },
    {
      name: 'Sidebar Navigation',
      type: 'sidebar' as const,
      codeTemplate: `<aside className="flex h-screen w-64 flex-col bg-[#0F172A] border-r border-[#334155]">
  <div className="flex h-16 items-center gap-2 px-6 border-b border-[#334155]">
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3B82F6] text-sm font-bold text-white">{logoInitial}</span>
    <span className="text-base font-semibold text-[#F8FAFC]">{appName}</span>
  </div>
  <nav className="flex-1 overflow-y-auto px-3 py-4">
    {navGroups.map((group) => (
      <div key={group.label} className="mb-4">
        <button className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#64748B]">
          {group.label}
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        <ul className="mt-1 space-y-0.5">
          {group.items.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className={
                  item.active
                    ? 'flex items-center gap-3 rounded-md bg-[#3B82F6]/10 px-3 py-2 text-sm font-medium text-[#3B82F6]'
                    : 'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]'
                }
              >
                <span className="h-5 w-5">{item.icon}</span>
                {item.label}
                {item.badge && (
                  <span className="ml-auto rounded-full bg-[#3B82F6] px-2 py-0.5 text-xs font-medium text-white">{item.badge}</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </nav>
  <div className="border-t border-[#334155] px-4 py-3">
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#334155] text-sm font-medium text-[#F8FAFC]">{userInitial}</div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-[#F8FAFC]">{userName}</p>
        <p className="truncate text-xs text-[#64748B]">{userRole}</p>
      </div>
    </div>
  </div>
</aside>`,
      jsonSchema: {
        type: 'object',
        properties: {
          logoInitial: { type: 'string', description: 'Single character for the logo icon' },
          appName: { type: 'string', description: 'Application name in the sidebar header' },
          navGroups: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      label: { type: 'string' },
                      href: { type: 'string' },
                      icon: { type: 'string' },
                      active: { type: 'boolean' },
                      badge: { type: 'string' },
                    },
                  },
                },
              },
            },
            description: 'Collapsible navigation groups with items',
          },
          userInitial: { type: 'string', description: 'Single character for user avatar' },
          userName: { type: 'string', description: 'Display name of the logged-in user' },
          userRole: { type: 'string', description: 'User role or email' },
        },
        required: ['appName', 'navGroups', 'userName'],
      },
      aiUsageRules:
        'Use as the primary left sidebar for dashboard layouts. Group nav items into logical sections (e.g. Main, Analytics, Settings). Highlight the active item with primary color background tint. Include user info at the bottom. Badges indicate notifications or counts.',
    },
    {
      name: 'Top Bar',
      type: 'header' as const,
      codeTemplate: `<header className="flex h-16 items-center justify-between border-b border-[#334155] bg-[#1E293B] px-6">
  <div className="flex items-center gap-4 flex-1">
    <div className="relative w-full max-w-md">
      <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <input
        type="text"
        placeholder="{searchPlaceholder}"
        className="w-full rounded-md border border-[#334155] bg-[#0F172A] py-2 pl-10 pr-4 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
      />
    </div>
  </div>
  <div className="flex items-center gap-3">
    <button className="relative rounded-md p-2 text-[#94A3B8] hover:bg-[#334155] hover:text-[#F8FAFC]">
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
      {notificationCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white">{notificationCount}</span>
      )}
    </button>
    <div className="h-6 w-px bg-[#334155]" />
    <button className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-[#334155]">
      <img src="{avatarUrl}" alt="{userName}" className="h-8 w-8 rounded-full border border-[#334155] object-cover" />
      <div className="text-left">
        <p className="text-sm font-medium text-[#F8FAFC]">{userName}</p>
        <p className="text-xs text-[#64748B]">{userRole}</p>
      </div>
      <svg className="h-4 w-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    </button>
  </div>
</header>`,
      jsonSchema: {
        type: 'object',
        properties: {
          searchPlaceholder: {
            type: 'string',
            description: 'Placeholder text for the search input',
          },
          notificationCount: { type: 'number', description: 'Number of unread notifications' },
          avatarUrl: { type: 'string', description: 'URL for the user avatar image' },
          userName: { type: 'string', description: 'Displayed user name' },
          userRole: { type: 'string', description: 'User role or email shown under the name' },
        },
        required: ['userName'],
      },
      aiUsageRules:
        'Use as the top navigation bar paired with Sidebar Navigation. Search input is full-width on the left. Notification bell shows a red badge with count. User dropdown opens a menu for profile, settings, and sign-out.',
    },
    {
      name: 'Activity Feed',
      type: 'card' as const,
      codeTemplate: `<div className="rounded-lg bg-[#1E293B] border border-[#334155]">
  <div className="px-6 py-4 border-b border-[#334155]">
    <h3 className="text-base font-semibold text-[#F8FAFC]">{title}</h3>
  </div>
  <div className="px-6 py-4">
    <ul className="space-y-6">
      {events.map((event, idx) => (
        <li key={idx} className="relative flex gap-4">
          {idx < events.length - 1 && (
            <span className="absolute left-[15px] top-8 bottom-0 w-px bg-[#334155]" />
          )}
          <span className={"flex h-8 w-8 shrink-0 items-center justify-center rounded-full " + event.iconBg}>
            {event.icon}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#F8FAFC]">
              <span className="font-medium">{event.actor}</span>{' '}
              <span className="text-[#94A3B8]">{event.action}</span>{' '}
              <span className="font-medium">{event.target}</span>
            </p>
            <p className="mt-0.5 text-xs text-[#64748B]">{event.timestamp}</p>
          </div>
        </li>
      ))}
    </ul>
  </div>
  <div className="px-6 py-3 border-t border-[#334155]">
    <button className="text-sm font-medium text-[#3B82F6] hover:text-[#2563EB]">{viewAllLabel}</button>
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Feed heading, e.g. "Recent Activity"' },
          events: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                icon: { type: 'string', description: 'Icon element for the event type' },
                iconBg: {
                  type: 'string',
                  description: 'Tailwind background class for icon circle',
                },
                actor: { type: 'string', description: 'Who performed the action' },
                action: { type: 'string', description: 'What action was performed' },
                target: { type: 'string', description: 'The target of the action' },
                timestamp: { type: 'string', description: 'Relative or absolute time' },
              },
            },
            description: 'Timeline events in reverse chronological order',
          },
          viewAllLabel: { type: 'string', description: 'Label for the view-all link' },
        },
        required: ['title', 'events'],
      },
      aiUsageRules:
        'Use for recent activity or audit logs. Show a vertical timeline with a connecting line between events. Each event has a colored icon circle, actor name, action verb, target, and timestamp. Limit visible events to 5-8 and include a view-all link.',
    },
    {
      name: 'KPI Row',
      type: 'layout' as const,
      codeTemplate: `<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {kpis.map((kpi) => (
    <div key={kpi.label} className="rounded-lg bg-[#1E293B] border border-[#334155] p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#94A3B8]">{kpi.label}</span>
        <span className={"flex h-7 w-7 items-center justify-center rounded-md " + kpi.iconBg}>
          {kpi.icon}
        </span>
      </div>
      <div className="mt-2 text-2xl font-bold text-[#F8FAFC]">{kpi.value}</div>
      <div className="mt-1.5 flex items-center gap-1.5 text-sm">
        <span className={kpi.trend === 'up' ? 'text-[#22C55E]' : 'text-[#EF4444]'}>
          {kpi.trend === 'up' ? '+' : ''}{kpi.change}
        </span>
        <span className="text-[#64748B]">{kpi.period}</span>
      </div>
    </div>
  ))}
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          kpis: {
            type: 'array',
            minItems: 4,
            maxItems: 4,
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                value: { type: 'string' },
                change: { type: 'string' },
                trend: { type: 'string', enum: ['up', 'down'] },
                period: { type: 'string' },
                icon: { type: 'string' },
                iconBg: { type: 'string' },
              },
            },
            description: 'Exactly 4 KPI items for the row',
          },
        },
        required: ['kpis'],
      },
      aiUsageRules:
        'Use at the top of a dashboard page as a summary strip. Always render exactly 4 KPI cards in a single row. Each card shows label, value, change percentage, and a small icon. Cards are responsive -- stack to 2 columns on tablet and 1 on mobile.',
    },
    {
      name: 'Filter Bar',
      type: 'toolbar' as const,
      codeTemplate: `<div className="flex flex-wrap items-center gap-3 rounded-lg bg-[#1E293B] border border-[#334155] px-4 py-3">
  <div className="flex items-center gap-2">
    <label className="text-xs font-medium uppercase tracking-wider text-[#64748B]">Date</label>
    <div className="flex rounded-md border border-[#334155] bg-[#0F172A]">
      <input
        type="date"
        defaultValue="{dateFrom}"
        className="rounded-l-md bg-transparent px-3 py-1.5 text-sm text-[#F8FAFC] focus:outline-none"
      />
      <span className="flex items-center px-2 text-xs text-[#64748B]">to</span>
      <input
        type="date"
        defaultValue="{dateTo}"
        className="rounded-r-md bg-transparent px-3 py-1.5 text-sm text-[#F8FAFC] focus:outline-none"
      />
    </div>
  </div>
  {filters.map((filter) => (
    <div key={filter.name} className="flex items-center gap-2">
      <label className="text-xs font-medium uppercase tracking-wider text-[#64748B]">{filter.label}</label>
      <select className="rounded-md border border-[#334155] bg-[#0F172A] px-3 py-1.5 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]">
        {filter.options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  ))}
  <div className="relative flex-1 min-w-[200px]">
    <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
    <input
      type="text"
      placeholder="{searchPlaceholder}"
      className="w-full rounded-md border border-[#334155] bg-[#0F172A] py-1.5 pl-10 pr-4 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
    />
  </div>
  <button
    onClick={onReset}
    className="rounded-md border border-[#334155] px-3 py-1.5 text-sm font-medium text-[#94A3B8] hover:bg-[#334155] hover:text-[#F8FAFC]"
  >
    Reset
  </button>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          dateFrom: { type: 'string', description: 'Start date in YYYY-MM-DD format' },
          dateTo: { type: 'string', description: 'End date in YYYY-MM-DD format' },
          filters: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                label: { type: 'string' },
                options: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      label: { type: 'string' },
                      value: { type: 'string' },
                    },
                  },
                },
              },
            },
            description: 'Dropdown filter definitions',
          },
          searchPlaceholder: { type: 'string', description: 'Search input placeholder text' },
          onReset: { type: 'string', description: 'Callback function to reset all filters' },
        },
        required: ['filters'],
      },
      aiUsageRules:
        'Place above Data Table or any filterable content. Include a date range picker on the left, dropdown filters in the middle, a search input, and a reset button on the right. Limit to 2-3 dropdown filters to avoid clutter. All controls share consistent dark styling.',
    },
    {
      name: 'Progress Card',
      type: 'progress' as const,
      codeTemplate: `<div className="rounded-lg bg-[#1E293B] border border-[#334155] p-6">
  <div className="flex items-center justify-between">
    <h3 className="text-sm font-medium text-[#94A3B8]">{label}</h3>
    <span className="text-2xl font-bold text-[#F8FAFC]">{percentage}%</span>
  </div>
  <div className="mt-4">
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#0F172A]">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: '{percentage}%', backgroundColor: '{barColor}' }}
      />
    </div>
  </div>
  <div className="mt-3 flex items-center justify-between text-xs text-[#64748B]">
    <span>{completedLabel}: {completedValue}</span>
    <span>{remainingLabel}: {remainingValue}</span>
  </div>
  <p className="mt-3 text-sm text-[#94A3B8]">{description}</p>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          label: { type: 'string', description: 'Progress metric name' },
          percentage: { type: 'number', description: 'Completion percentage (0-100)' },
          barColor: { type: 'string', description: 'Color for the progress bar, e.g. "#3B82F6"' },
          completedLabel: { type: 'string', description: 'Label for completed count' },
          completedValue: { type: 'string', description: 'Completed count or value' },
          remainingLabel: { type: 'string', description: 'Label for remaining count' },
          remainingValue: { type: 'string', description: 'Remaining count or value' },
          description: { type: 'string', description: 'Short description of the progress metric' },
        },
        required: ['label', 'percentage', 'barColor'],
      },
      aiUsageRules:
        'Use for progress tracking of goals, quotas, or tasks. The bar color should reflect status: primary blue for normal, green for near-complete, amber for at-risk. Show completed vs remaining below the bar. Keep the description concise.',
    },
    {
      name: 'Alert Banner',
      type: 'alert' as const,
      codeTemplate: `<div className="flex items-center gap-3 rounded-lg border px-4 py-3 {variant === 'info' ? 'border-[#3B82F6]/30 bg-[#3B82F6]/10' : variant === 'warning' ? 'border-[#F59E0B]/30 bg-[#F59E0B]/10' : variant === 'error' ? 'border-[#EF4444]/30 bg-[#EF4444]/10' : 'border-[#22C55E]/30 bg-[#22C55E]/10'}">
  <span className={"flex h-8 w-8 shrink-0 items-center justify-center rounded-full " + (variant === 'info' ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : variant === 'warning' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : variant === 'error' ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#22C55E]/20 text-[#22C55E]')}>
    {icon}
  </span>
  <div className="flex-1 min-w-0">
    <p className="text-sm font-medium text-[#F8FAFC]">{title}</p>
    <p className="mt-0.5 text-sm text-[#94A3B8]">{message}</p>
  </div>
  {actionLabel && (
    <button className={"shrink-0 rounded-md px-3 py-1.5 text-sm font-medium " + (variant === 'info' ? 'bg-[#3B82F6] text-white hover:bg-[#2563EB]' : variant === 'warning' ? 'bg-[#F59E0B] text-[#0F172A] hover:bg-[#D97706]' : variant === 'error' ? 'bg-[#EF4444] text-white hover:bg-[#DC2626]' : 'bg-[#22C55E] text-white hover:bg-[#16A34A]')}>
      {actionLabel}
    </button>
  )}
  <button onClick={onDismiss} className="shrink-0 rounded-md p-1 text-[#64748B] hover:bg-[#334155] hover:text-[#F8FAFC]">
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          variant: {
            type: 'string',
            enum: ['info', 'warning', 'error', 'success'],
            description: 'Alert severity level',
          },
          icon: { type: 'string', description: 'Icon element for the alert type' },
          title: { type: 'string', description: 'Bold title text' },
          message: { type: 'string', description: 'Detailed alert message' },
          actionLabel: { type: 'string', description: 'Optional action button text' },
          onDismiss: { type: 'string', description: 'Callback function to dismiss the banner' },
        },
        required: ['variant', 'title', 'message'],
      },
      aiUsageRules:
        'Use for system notifications, warnings, and status messages. Place at the top of the content area. Choose variant based on severity: info for general messages, warning for caution, error for failures, success for confirmations. Always include a dismiss button. Action button is optional.',
    },
    {
      name: 'User Profile Card',
      type: 'card' as const,
      codeTemplate: `<div className="rounded-lg bg-[#1E293B] border border-[#334155] p-6">
  <div className="flex items-start gap-4">
    <img src="{avatarUrl}" alt="{name}" className="h-14 w-14 rounded-full border-2 border-[#334155] object-cover" />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold text-[#F8FAFC]">{name}</h3>
        <span className={"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " + (status === 'online' ? 'bg-[#22C55E]/10 text-[#22C55E]' : status === 'away' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-[#64748B]/10 text-[#64748B]')}>
          <span className={"mr-1.5 h-1.5 w-1.5 rounded-full " + (status === 'online' ? 'bg-[#22C55E]' : status === 'away' ? 'bg-[#F59E0B]' : 'bg-[#64748B]')} />
          {status}
        </span>
      </div>
      <p className="mt-0.5 text-sm text-[#94A3B8]">{role}</p>
      <p className="mt-0.5 text-xs text-[#64748B]">{email}</p>
    </div>
  </div>
  <div className="mt-4 flex gap-2">
    {actions.map((action) => (
      <button
        key={action.label}
        className={
          action.primary
            ? 'flex-1 rounded-md bg-[#3B82F6] px-3 py-2 text-sm font-medium text-white hover:bg-[#2563EB]'
            : 'flex-1 rounded-md border border-[#334155] px-3 py-2 text-sm font-medium text-[#94A3B8] hover:bg-[#334155] hover:text-[#F8FAFC]'
        }
      >
        {action.label}
      </button>
    ))}
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          avatarUrl: { type: 'string', description: 'User avatar image URL' },
          name: { type: 'string', description: 'Full display name' },
          role: { type: 'string', description: 'Job title or role' },
          email: { type: 'string', description: 'Email address' },
          status: {
            type: 'string',
            enum: ['online', 'away', 'offline'],
            description: 'Current user status',
          },
          actions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                primary: { type: 'boolean' },
              },
            },
            description: 'Quick action buttons, e.g. Message, View Profile',
          },
        },
        required: ['name', 'role', 'status'],
      },
      aiUsageRules:
        'Use in team dashboards, admin panels, or contact lists. Status badge color indicates availability: green for online, amber for away, gray for offline. Provide 1-2 quick action buttons. Primary action uses filled blue style, secondary uses outlined style.',
    },
    {
      name: 'Empty State',
      type: 'card' as const,
      codeTemplate: `<div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#334155] bg-[#1E293B]/50 px-6 py-16">
  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#334155]">
    <svg className="h-8 w-8 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      {illustrationIcon}
    </svg>
  </div>
  <h3 className="mt-4 text-base font-semibold text-[#F8FAFC]">{title}</h3>
  <p className="mt-1.5 max-w-sm text-center text-sm text-[#94A3B8]">{message}</p>
  <button className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white hover:bg-[#2563EB]">
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
    {actionLabel}
  </button>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          illustrationIcon: {
            type: 'string',
            description: 'SVG path element for the placeholder icon',
          },
          title: { type: 'string', description: 'Short heading, e.g. "No data yet"' },
          message: {
            type: 'string',
            description: 'Helpful description explaining the empty state',
          },
          actionLabel: { type: 'string', description: 'Call-to-action button text' },
        },
        required: ['title', 'message', 'actionLabel'],
      },
      aiUsageRules:
        'Use when a section or page has no data to display. Center the content vertically and horizontally. The icon should relate to the content type (e.g. document icon for no reports, chart icon for no analytics). Message should guide the user on what to do next. Always include a primary action button.',
    },
  ],
};
