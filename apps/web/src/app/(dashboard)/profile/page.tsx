'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { LogOut, Trash2, Palette, LayoutGrid, Key } from 'lucide-react';

export default function ProfilePage() {
  const { user, signOut } = useAuth();

  const userEmail = user?.email ?? '';
  const userId = user?.id ?? '';
  const userInitial = userEmail ? userEmail[0].toUpperCase() : '?';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');

    if (newPassword !== confirmPassword) {
      setPasswordMessage('Passwords do not match.');
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
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
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleDeleteAccount = () => {
    setDeleteMessage('Coming soon');
  };

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
            href="/style-packs"
            className="flex items-center gap-3 rounded-lg border border-zinc-800 px-4 py-3 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            <Palette size={18} className="text-blue-400" />
            <div>
              <div className="font-medium text-white">Browse Style Packs</div>
              <div className="text-xs text-zinc-500">
                Choose a design token set for your project
              </div>
            </div>
          </Link>
          <Link
            href="/components"
            className="flex items-center gap-3 rounded-lg border border-zinc-800 px-4 py-3 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            <LayoutGrid size={18} className="text-violet-400" />
            <div>
              <div className="font-medium text-white">Explore Components</div>
              <div className="text-xs text-zinc-500">
                Browse 50+ component recipes with code templates
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

      {/* Change Password */}
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
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
          >
            Update Password
          </button>
        </form>
      </div>

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
            onClick={handleDeleteAccount}
            className="flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:border-red-500 hover:bg-red-500/10"
          >
            <Trash2 size={16} />
            Delete Account
          </button>
        </div>
        {deleteMessage && <p className="mt-3 text-sm text-zinc-500">{deleteMessage}</p>}
      </div>
    </div>
  );
}
