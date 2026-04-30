# Task 03 — Settings panel

Build a **tabbed settings page** with three tabs: **Profile**, **Billing**,
**Notifications**.

- Profile tab: avatar, name input, email input, "save changes" button
- Billing tab: current plan name, "manage plan" button, payment method card
- Notifications tab: 4 toggle switches for different notification categories
- Active tab is visually distinct
- Switching tabs swaps the panel content (no full re-render flash)

Constraints:

- TypeScript + React + Tailwind CSS
- One file, one default export
- Tabs implemented from scratch — no Radix / Headless UI / shadcn imports
- Accessible: tabs have `role="tab"`, panel has `role="tabpanel"`,
  arrow-key navigation between tabs
