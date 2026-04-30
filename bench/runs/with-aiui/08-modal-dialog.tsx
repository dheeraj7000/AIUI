import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

const PROJECT_NAME = 'aiui-website';

export default function ModalDialog() {
  const [open, setOpen] = useState(true);
  const [confirmText, setConfirmText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const headingId = 'delete-modal-heading';

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setConfirmText('');
          setOpen(true);
        }}
        className="m-10 px-4 py-2 bg-destructive text-background text-sm font-semibold rounded-md hover:opacity-90"
      >
        Open delete modal
      </button>
    );
  }

  const canDelete = confirmText.trim() === PROJECT_NAME;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10 bg-foreground/60"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-background rounded-md p-6"
      >
        <div
          aria-hidden
          className="w-11 h-11 rounded-full bg-destructive-soft flex items-center justify-center mb-4"
        >
          <span className="text-xl text-destructive">⚠</span>
        </div>

        <h2 id={headingId} className="text-lg font-bold text-foreground mb-2">
          Delete this project?
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
          You&apos;re about to permanently delete <strong>{PROJECT_NAME}</strong>, including all of
          its tokens, design memory, and history. This can&apos;t be undone.
        </p>

        <label htmlFor="confirm-name" className="block text-sm font-medium text-foreground mb-2">
          Type <span className="font-mono">{PROJECT_NAME}</span> to confirm
        </label>
        <input
          ref={inputRef}
          id="confirm-name"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-border rounded-md focus:border-destructive outline-none mb-5"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-md hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canDelete}
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm font-semibold rounded-md text-background bg-destructive hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete project
          </button>
        </div>
      </div>
    </div>
  );
}
