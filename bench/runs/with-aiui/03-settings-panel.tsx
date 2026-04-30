import * as React from 'react';
import { useState, useRef } from 'react';

type TabId = 'profile' | 'billing' | 'notifications';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'profile', label: 'Profile' },
  { id: 'billing', label: 'Billing' },
  { id: 'notifications', label: 'Notifications' },
];

export default function SettingsPanel() {
  const [active, setActive] = useState<TabId>('profile');
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({
    profile: null,
    billing: null,
    notifications: null,
  });

  function handleKey(e: React.KeyboardEvent<HTMLButtonElement>, idx: number) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = TABS[(idx + 1) % TABS.length];
      setActive(next.id);
      tabRefs.current[next.id]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = TABS[(idx - 1 + TABS.length) % TABS.length];
      setActive(next.id);
      tabRefs.current[next.id]?.focus();
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
      <p className="text-base text-muted-foreground mb-8">
        Manage your account, billing, and how you hear from us.
      </p>

      <div
        role="tablist"
        aria-label="Settings sections"
        className="flex gap-1 border-b border-border mb-6"
      >
        {TABS.map((tab, idx) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[tab.id] = el;
            }}
            role="tab"
            aria-selected={active === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={active === tab.id ? 0 : -1}
            onClick={() => setActive(tab.id)}
            onKeyDown={(e) => handleKey(e, idx)}
            className={[
              'px-4 py-3 text-sm font-medium transition-colors relative',
              active === tab.id
                ? 'text-primary after:absolute after:left-0 after:right-0 after:bottom-0 after:h-0.5 after:bg-primary'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${active}`} aria-labelledby={`tab-${active}`} tabIndex={0}>
        {active === 'profile' && <ProfilePanel />}
        {active === 'billing' && <BillingPanel />}
        {active === 'notifications' && <NotificationsPanel />}
      </div>
    </div>
  );
}

function ProfilePanel() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-xl font-bold text-primary"
          aria-hidden
        >
          DK
        </div>
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-primary border border-border rounded-md hover:bg-muted"
        >
          Change avatar
        </button>
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
          Name
        </label>
        <input
          id="name"
          type="text"
          defaultValue="Dheeraj Kumar"
          className="w-full px-3 py-2 text-sm border border-border rounded-md focus:border-primary outline-none"
        />
      </div>
      <div>
        <label htmlFor="profile-email" className="block text-sm font-medium text-foreground mb-2">
          Email
        </label>
        <input
          id="profile-email"
          type="email"
          defaultValue="dheeraj@spoqpaper.com"
          className="w-full px-3 py-2 text-sm border border-border rounded-md focus:border-primary outline-none"
        />
      </div>
      <button
        type="button"
        className="px-4 py-2 bg-primary text-background rounded-md text-sm font-medium hover:opacity-90"
      >
        Save changes
      </button>
    </div>
  );
}

function BillingPanel() {
  return (
    <div className="space-y-4">
      <div className="bg-muted border border-border rounded-md p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Current plan
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">Pro · $24/mo</span>
          <button type="button" className="text-sm font-medium text-primary hover:opacity-80">
            Manage plan
          </button>
        </div>
      </div>
      <div className="border border-border rounded-md p-4 flex items-center gap-4">
        <div className="w-12 h-8 bg-foreground rounded-sm flex items-center justify-center text-background text-xs font-bold">
          VISA
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">•••• 4242</p>
          <p className="text-xs text-muted-foreground">Expires 09/27</p>
        </div>
        <button type="button" className="text-sm font-medium text-primary hover:opacity-80">
          Update
        </button>
      </div>
    </div>
  );
}

function NotificationsPanel() {
  const [prefs, setPrefs] = useState({
    product: true,
    weekly: true,
    security: true,
    marketing: false,
  });

  const items: Array<[keyof typeof prefs, string, string]> = [
    ['product', 'Product updates', 'New features and improvements.'],
    ['weekly', 'Weekly digest', 'Summary of your activity each Monday.'],
    ['security', 'Security alerts', 'Account access and security notifications.'],
    ['marketing', 'Marketing emails', 'Tips, offers, and promotions.'],
  ];

  return (
    <div className="space-y-2">
      {items.map(([key, label, desc]) => (
        <label
          key={key}
          className="flex items-start gap-4 p-4 border border-border rounded-md cursor-pointer hover:bg-muted"
        >
          <button
            type="button"
            role="switch"
            aria-checked={prefs[key]}
            onClick={() => setPrefs({ ...prefs, [key]: !prefs[key] })}
            className={[
              'w-10 h-6 rounded-full relative transition-colors flex-shrink-0',
              prefs[key] ? 'bg-primary' : 'bg-muted-foreground',
            ].join(' ')}
          >
            <span
              className={[
                'absolute top-1 w-4 h-4 bg-background rounded-full transition-transform',
                prefs[key] ? 'translate-x-5' : 'translate-x-1',
              ].join(' ')}
            />
          </button>
          <div>
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
        </label>
      ))}
    </div>
  );
}
