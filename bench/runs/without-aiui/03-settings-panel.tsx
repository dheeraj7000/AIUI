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
    <div className="max-w-[760px] mx-auto py-[44px] px-[28px]">
      <h1
        className="text-[30px] font-bold text-[#1A1F36] mb-[5px]"
        style={{ letterSpacing: '-0.02em' }}
      >
        Settings
      </h1>
      <p className="text-[14.5px] text-[#697386] mb-[32px]">
        Manage your account, billing, and how you hear from us.
      </p>

      <div
        role="tablist"
        aria-label="Settings sections"
        className="flex gap-[2px] border-b-[1.5px] border-[#E3E8EF] mb-[28px]"
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
              'px-[18px] py-[11px] text-[14px] font-medium transition-colors relative',
              active === tab.id
                ? 'text-[#5469D4] after:absolute after:left-0 after:right-0 after:bottom-[-1.5px] after:h-[2px] after:bg-[#5469D4]'
                : 'text-[#697386] hover:text-[#1A1F36]',
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
    <div className="space-y-[22px]">
      <div className="flex items-center gap-[16px]">
        <div
          className="w-[68px] h-[68px] rounded-full bg-[#E0E7FF] flex items-center justify-center text-[26px] font-bold text-[#5469D4]"
          aria-hidden
        >
          DK
        </div>
        <button
          type="button"
          className="px-[14px] py-[8px] text-[13px] font-medium text-[#5469D4] border border-[#D6DEE8] rounded-[6px] hover:bg-[#F7FAFC]"
        >
          Change avatar
        </button>
      </div>
      <div>
        <label htmlFor="name" className="block text-[13px] font-medium text-[#1A1F36] mb-[5px]">
          Name
        </label>
        <input
          id="name"
          type="text"
          defaultValue="Dheeraj Kumar"
          className="w-full px-[12px] py-[9px] text-[14px] border border-[#D6DEE8] rounded-[6px] focus:border-[#5469D4] outline-none"
        />
      </div>
      <div>
        <label
          htmlFor="profile-email"
          className="block text-[13px] font-medium text-[#1A1F36] mb-[5px]"
        >
          Email
        </label>
        <input
          id="profile-email"
          type="email"
          defaultValue="dheeraj@spoqpaper.com"
          className="w-full px-[12px] py-[9px] text-[14px] border border-[#D6DEE8] rounded-[6px] focus:border-[#5469D4] outline-none"
        />
      </div>
      <button
        type="button"
        className="px-[18px] py-[10px] bg-[#5469D4] text-white rounded-[6px] text-[14px] font-medium hover:bg-[#3F4DBA]"
      >
        Save changes
      </button>
    </div>
  );
}

function BillingPanel() {
  return (
    <div className="space-y-[20px]">
      <div className="bg-[#F7FAFC] border border-[#E3E8EF] rounded-[10px] p-[18px]">
        <p className="text-[12px] font-semibold text-[#697386] uppercase tracking-[0.06em] mb-[6px]">
          Current plan
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[18px] font-bold text-[#1A1F36]">Pro · $24/mo</span>
          <button type="button" className="text-[13px] font-medium text-[#5469D4] hover:underline">
            Manage plan
          </button>
        </div>
      </div>
      <div className="border border-[#E3E8EF] rounded-[10px] p-[18px] flex items-center gap-[14px]">
        <div className="w-[44px] h-[28px] bg-gradient-to-r from-[#1E1B4B] to-[#5B21B6] rounded-[4px] flex items-center justify-center text-white text-[10px] font-bold">
          VISA
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-medium text-[#1A1F36]">•••• 4242</p>
          <p className="text-[12px] text-[#697386]">Expires 09/27</p>
        </div>
        <button type="button" className="text-[13px] font-medium text-[#5469D4] hover:underline">
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
    <div className="space-y-[14px]">
      {items.map(([key, label, desc]) => (
        <label
          key={key}
          className="flex items-start gap-[14px] p-[14px] border border-[#E3E8EF] rounded-[10px] cursor-pointer hover:bg-[#F7FAFC]"
        >
          <button
            type="button"
            role="switch"
            aria-checked={prefs[key]}
            onClick={() => setPrefs({ ...prefs, [key]: !prefs[key] })}
            className={[
              'w-[40px] h-[22px] rounded-full relative transition-colors flex-shrink-0',
              prefs[key] ? 'bg-[#5469D4]' : 'bg-[#CBD5E1]',
            ].join(' ')}
          >
            <span
              className={[
                'absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full transition-transform',
                prefs[key] ? 'translate-x-[20px]' : 'translate-x-[2px]',
              ].join(' ')}
            />
          </button>
          <div>
            <p className="text-[14px] font-medium text-[#1A1F36]">{label}</p>
            <p className="text-[12.5px] text-[#697386]">{desc}</p>
          </div>
        </label>
      ))}
    </div>
  );
}
