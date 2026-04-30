# Task 10 — Search with filter sidebar

Build a **search results page with a filter sidebar** for a job board.

- Top: search input + "search" button
- Left sidebar (~280px wide): filter sections — Location (text input),
  Salary range (min/max inputs), Job type (4 checkboxes: Full-time,
  Part-time, Contract, Internship), Remote (toggle switch)
- Right: results list — 5-6 sample job cards with title, company, location,
  salary range, posted date, "Apply" button
- "Showing X of Y" + sort dropdown (Relevance / Newest / Salary high-low)
  above the results
- Empty state if filters return no matches

Constraints:

- TypeScript + React + Tailwind CSS
- Local state via `useState` for all filter inputs
- One file, one default export
- Accessible: sidebar uses `<aside>`, filters wrapped in a `<form>` with
  proper labels, results use a list semantic
- Responsive: sidebar collapses to a dropdown on mobile
