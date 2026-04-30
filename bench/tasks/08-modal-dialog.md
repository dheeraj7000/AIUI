# Task 08 — Modal dialog

Build a **confirmation modal** that asks the user to confirm a destructive
action ("Delete project").

- Backdrop overlay (semi-transparent dark)
- Centered card
- Warning icon at the top (red-ish)
- Headline: "Delete this project?"
- Body: explains what will be deleted and that it can't be undone
- A typed-confirmation input ("Type the project name to confirm")
- Two buttons: "Cancel" and a destructive "Delete project" (disabled until
  the typed name matches)
- Closes on Escape key or backdrop click

Constraints:

- TypeScript + React + Tailwind CSS
- Local state via `useState`
- One file, one default export
- Accessible: `role="dialog"`, `aria-modal`, `aria-labelledby`, focus management
  (cursor jumps into the input when opened)
- Use `useRef` + `useEffect` for the focus jump and Escape handler
