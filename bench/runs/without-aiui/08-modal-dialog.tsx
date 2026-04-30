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
        className="m-[40px] px-[18px] py-[10px] bg-[#DC2626] text-white text-[14px] font-semibold rounded-[8px] hover:bg-[#B91C1C]"
      >
        Open delete modal
      </button>
    );
  }

  const canDelete = confirmText.trim() === PROJECT_NAME;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-[16px] py-[40px]"
      style={{ background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(2px)' }}
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] bg-white rounded-[14px] p-[26px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.30)]"
      >
        <div
          aria-hidden
          className="w-[44px] h-[44px] rounded-full bg-[#FEE2E2] flex items-center justify-center mb-[16px]"
        >
          <span className="text-[22px] text-[#B91C1C]">⚠</span>
        </div>

        <h2 id={headingId} className="text-[19px] font-bold text-[#0F172A] mb-[6px]">
          Delete this project?
        </h2>
        <p className="text-[14px] text-[#475569] leading-[1.5] mb-[20px]">
          You&apos;re about to permanently delete <strong>{PROJECT_NAME}</strong>, including all of
          its tokens, design memory, and history. This can&apos;t be undone.
        </p>

        <label
          htmlFor="confirm-name"
          className="block text-[12.5px] font-medium text-[#0F172A] mb-[6px]"
        >
          Type <span className="font-mono">{PROJECT_NAME}</span> to confirm
        </label>
        <input
          ref={inputRef}
          id="confirm-name"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-full px-[12px] py-[9px] text-[14px] border border-[#CBD5E1] rounded-[8px] focus:border-[#DC2626] outline-none mb-[20px]"
        />

        <div className="flex justify-end gap-[10px]">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-[16px] py-[9px] text-[14px] font-medium text-[#0F172A] border border-[#CBD5E1] rounded-[8px] hover:bg-[#F1F5F9]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canDelete}
            onClick={() => setOpen(false)}
            className={[
              'px-[16px] py-[9px] text-[14px] font-semibold rounded-[8px] text-white',
              canDelete ? 'bg-[#DC2626] hover:bg-[#B91C1C]' : 'bg-[#FCA5A5] cursor-not-allowed',
            ].join(' ')}
          >
            Delete project
          </button>
        </div>
      </div>
    </div>
  );
}
