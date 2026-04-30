# Task 09 — Toast / alert system

Build a **toast notification stack** that supports four variants:
**success**, **info**, **warning**, **error**.

- A `<ToastContainer />` that renders an absolute-positioned stack at the
  bottom-right of the viewport
- A `Toast` for each variant: distinct icon (✓, ℹ, !, ✕), color-coded left
  border + tinted background, title + body + dismiss "X" button
- 3-4 sample toasts hardcoded in state to demonstrate the variants
- Auto-dismiss timer (5 seconds, with a thin progress bar at the bottom)
- Animation when toast appears (slide-up + fade-in) — keep it simple, use
  Tailwind transitions

Constraints:

- TypeScript + React + Tailwind CSS
- Local state via `useState` + `useEffect` for the dismiss timer
- One file, one default export
- Accessible: each toast has `role="alert"` (errors) or `role="status"` (info)
