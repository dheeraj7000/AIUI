# Task 02 — Login form

Build a single React component that renders a **sign-in form** with:

- Email input
- Password input (with show/hide toggle)
- "Remember me" checkbox
- Sign-in submit button
- "Forgot password?" link below the form
- Inline validation: red border + helper text when an email is malformed
- A loading state for the submit button

Constraints:

- TypeScript + React + Tailwind CSS
- Local state via `useState` — no form library
- One file, one default export
- Accessible: labels associated with inputs, button has a discernible name,
  errors are announced via `aria-describedby`
