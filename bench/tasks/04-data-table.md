# Task 04 — Data table

Build a single React component that renders a **paginated, sortable users
table** for an admin dashboard.

Columns: Name (with avatar), Email, Role (badge), Status (active / invited /
suspended — colored badge), Last seen (relative time), Actions (3-dot menu).

Constraints:

- TypeScript + React + Tailwind CSS
- 8-12 sample rows hardcoded
- Sortable column headers (click to toggle asc/desc, arrow indicator)
- Pagination controls underneath (Prev / page numbers / Next)
- Hover state on rows
- Status badges use color: active=green-ish, invited=yellow-ish, suspended=red-ish
- One file, one default export
- Accessible: `<table>` with `<thead>`/`<tbody>`, `scope="col"`, `aria-sort`
