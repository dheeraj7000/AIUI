'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { LogOut, Trash2, FolderOpen, Download, Key, AlertTriangle, X } from 'lucide-react';

const DELETE_CONFIRM_PHRASE = 'DELETE my account';

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const userEmail = user?.email ?? '';
  const userId = user?.id ?? '';
  const userInitial = userEmail ? userEmail[0].toUpperCase() : '?';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletePhrase, setDeletePhrase] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);

  // Detect if the user has a password (vs Google-only) by asking the server
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) setHasPassword(data.user.hasPassword ?? true);
      })
      .catch(() => setHasPassword(true));
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');

    if (newPassword !== confirmPassword) {
      setPasswordMessage('Passwords do not match.');
      return;
    }

    setPasswordSubmitting(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        setPasswordMessage('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await res.json().catch(() => ({}));
        setPasswordMessage(data.error || 'Failed to update password.');
      }
    } catch {
      setPasswordMessage('Failed to update password.');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const openDeleteModal = () => {
    setDeletePassword('');
    setDeletePhrase('');
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setDeleting(true);
    try {
      const body = hasPassword ? { password: deletePassword } : { confirmPhrase: deletePhrase };

      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        // Account deleted — clear local state and redirect
        setShowDeleteModal(false);
        await signOut().catch(() => {});
        router.push('/sign-in?deleted=1');
      } else {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error || 'Failed to delete account.');
      }
    } catch {
      setDeleteError('Failed to delete account.');
    } finally {
      setDeleting(false);
    }
  };

  const canConfirmDelete = hasPassword
    ? deletePassword.length > 0
    : deletePhrase === DELETE_CONFIRM_PHRASE;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold text-white">Profile</h1>

      {/* User Info Card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-2xl font-bold text-white">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold text-white">{userEmail || 'No email'}</p>
            {userId && <p className="mt-1 truncate text-xs text-zinc-500">ID: {userId}</p>}
          </div>
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-3 text-lg font-semibold text-white">Next Steps</h2>
        <p className="mb-4 text-sm text-zinc-500">
          Set up your design system and start building with AI-powered design control.
        </p>
        <div className="space-y-3">
          <Link
            href="/projects"
            className="flex items-center gap-3 rounded-lg border border-zinc-800 px-4 py-3 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            <FolderOpen size={18} className="text-emerald-400" />
            <div>
              <div className="font-medium text-white">Open Projects</div>
              <div className="text-xs text-zinc-500">Manage projects and their design tokens</div>
            </div>
          </Link>
          <Link
            href="/import"
            className="flex items-center gap-3 rounded-lg border border-zinc-800 px-4 py-3 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            <Download size={18} className="text-teal-400" />
            <div>
              <div className="font-medium text-white">Import Tokens</div>
              <div className="text-xs text-zinc-500">
                Bring tokens from CSS, Tokens Studio, or Tailwind into a project
              </div>
            </div>
          </Link>
          <Link
            href="/api-keys"
            className="flex items-center gap-3 rounded-lg border border-zinc-800 px-4 py-3 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            <Key size={18} className="text-indigo-400" />
            <div>
              <div className="font-medium text-white">Generate API Key</div>
              <div className="text-xs text-zinc-500">Connect Claude Code or your AI assistant</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Change Password — hidden for Google-only accounts */}
      {hasPassword !== false && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="current-password" className="mb-1 block text-sm text-zinc-400">
                Current Password
              </label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Enter current password"
                aria-invalid={!!passwordMessage && !passwordMessage.includes('successfully')}
                aria-describedby={passwordMessage ? 'password-message' : undefined}
              />
            </div>
            <div>
              <label htmlFor="new-password" className="mb-1 block text-sm text-zinc-400">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Enter new password"
                aria-invalid={!!passwordMessage && !passwordMessage.includes('successfully')}
                aria-describedby={passwordMessage ? 'password-message' : undefined}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-1 block text-sm text-zinc-400">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Confirm new password"
                aria-invalid={!!passwordMessage && !passwordMessage.includes('successfully')}
                aria-describedby={passwordMessage ? 'password-message' : undefined}
              />
            </div>

            {passwordMessage && (
              <p
                id="password-message"
                className={`text-sm ${passwordMessage.includes('successfully') ? 'text-indigo-400' : 'text-red-400'}`}
              >
                {passwordMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={passwordSubmitting}
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passwordSubmitting ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-500/20 bg-zinc-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-red-400">Danger Zone</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
          >
            <LogOut size={16} />
            Sign Out
          </button>
          <button
            onClick={openDeleteModal}
            className="flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:border-red-500 hover:bg-red-500/10"
          >
            <Trash2 size={16} />
            Delete Account
          </button>
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          Permanently delete your account, your sole-owner workspaces, and all associated projects,
          tokens, and API keys. This cannot be undone.
        </p>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-zinc-950 p-6 shadow-2xl shadow-red-500/10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15 border border-red-500/30">
                  <AlertTriangle size={18} className="text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Delete account?</h3>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg p-1 text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mb-5 text-sm text-zinc-400">
              This will permanently delete{' '}
              <span className="text-white font-medium">{userEmail}</span>, every workspace where you
              are the sole owner, and all of their data.{' '}
              <span className="text-red-400">There is no undo.</span>
            </p>

            {hasPassword === null ? (
              <p className="text-sm text-zinc-500">Loading…</p>
            ) : hasPassword ? (
              <div>
                <label htmlFor="delete-password" className="mb-1 block text-sm text-zinc-400">
                  Confirm with your password
                </label>
                <input
                  id="delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  placeholder="Current password"
                  autoFocus
                />
              </div>
            ) : (
              <div>
                <label htmlFor="delete-phrase" className="mb-1 block text-sm text-zinc-400">
                  Type <span className="font-mono text-red-400">{DELETE_CONFIRM_PHRASE}</span> to
                  confirm
                </label>
                <input
                  id="delete-phrase"
                  type="text"
                  value={deletePhrase}
                  onChange={(e) => setDeletePhrase(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  placeholder={DELETE_CONFIRM_PHRASE}
                  autoFocus
                />
              </div>
            )}

            {deleteError && <p className="mt-3 text-sm text-red-400">{deleteError}</p>}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={!canConfirmDelete || deleting}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting…' : 'Permanently delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
