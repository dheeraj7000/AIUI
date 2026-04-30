# Task 06 — Top navigation bar

Build a **top navigation bar** for a logged-in SaaS app.

- Brand logo on the left (use the text "Acme" — no image needed)
- Center: 4-5 nav links (Dashboard, Projects, Reports, Team, Settings)
- Right side: search input, notification bell (with unread dot), user avatar
  (with dropdown for Profile / Settings / Sign out)
- Sticky to the top with a subtle bottom border / shadow
- Mobile breakpoint: hamburger replaces the center links

Constraints:

- TypeScript + React + Tailwind CSS
- One file, one default export
- Accessible: `<nav>` element, `aria-label`s on the search input, bell, avatar
- Local state via `useState` for the dropdown
