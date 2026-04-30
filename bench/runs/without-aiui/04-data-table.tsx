import * as React from 'react';
import { useState } from 'react';

interface User {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: 'Admin' | 'Member' | 'Viewer';
  status: 'active' | 'invited' | 'suspended';
  lastSeen: string;
}

const USERS: User[] = [
  {
    id: '1',
    name: 'Ava Chen',
    initials: 'AC',
    email: 'ava@acme.com',
    role: 'Admin',
    status: 'active',
    lastSeen: '2h ago',
  },
  {
    id: '2',
    name: 'Ben Patel',
    initials: 'BP',
    email: 'ben@acme.com',
    role: 'Member',
    status: 'active',
    lastSeen: '5h ago',
  },
  {
    id: '3',
    name: 'Chloe Kim',
    initials: 'CK',
    email: 'chloe@acme.com',
    role: 'Member',
    status: 'invited',
    lastSeen: 'Never',
  },
  {
    id: '4',
    name: 'Diego Rojas',
    initials: 'DR',
    email: 'diego@acme.com',
    role: 'Viewer',
    status: 'active',
    lastSeen: '1d ago',
  },
  {
    id: '5',
    name: 'Eva Lindgren',
    initials: 'EL',
    email: 'eva@acme.com',
    role: 'Member',
    status: 'suspended',
    lastSeen: '14d ago',
  },
  {
    id: '6',
    name: 'Felix Wong',
    initials: 'FW',
    email: 'felix@acme.com',
    role: 'Member',
    status: 'active',
    lastSeen: '12m ago',
  },
  {
    id: '7',
    name: 'Greta Hofmann',
    initials: 'GH',
    email: 'greta@acme.com',
    role: 'Admin',
    status: 'active',
    lastSeen: '3d ago',
  },
  {
    id: '8',
    name: 'Hugo Carlsson',
    initials: 'HC',
    email: 'hugo@acme.com',
    role: 'Viewer',
    status: 'invited',
    lastSeen: 'Never',
  },
];

type SortKey = 'name' | 'role' | 'status' | 'lastSeen';

export default function DataTable() {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const sorted = [...USERS].sort((a, b) => {
    const av = String(a[sortKey]);
    const bv = String(b[sortKey]);
    return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
  });
  const totalPages = Math.ceil(sorted.length / pageSize);
  const visible = sorted.slice((page - 1) * pageSize, page * pageSize);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  function statusStyles(s: User['status']) {
    if (s === 'active') return 'bg-[#DCFCE7] text-[#15803D]';
    if (s === 'invited') return 'bg-[#FEF3C7] text-[#A16207]';
    return 'bg-[#FEE2E2] text-[#B91C1C]';
  }

  return (
    <div className="max-w-[1080px] mx-auto p-[28px]">
      <h2 className="text-[22px] font-bold text-[#0F172A] mb-[18px]">Team members</h2>
      <div className="border border-[#E2E8F0] rounded-[10px] overflow-hidden">
        <table className="w-full text-[14px]">
          <thead className="bg-[#F8FAFC]">
            <tr>
              {(
                [
                  ['name', 'Name'],
                  ['email', 'Email'],
                  ['role', 'Role'],
                  ['status', 'Status'],
                  ['lastSeen', 'Last seen'],
                ] as Array<[SortKey | 'email', string]>
              ).map(([key, label]) => {
                const sortable = key !== 'email';
                const sorted = key === sortKey;
                return (
                  <th
                    key={key}
                    scope="col"
                    aria-sort={sorted ? (sortAsc ? 'ascending' : 'descending') : 'none'}
                    className="text-left px-[16px] py-[11px] font-semibold text-[#475569] text-[12.5px] uppercase tracking-[0.04em]"
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(key as SortKey)}
                        className="inline-flex items-center gap-[5px] hover:text-[#0F172A]"
                      >
                        {label}
                        {sorted && <span className="text-[10px]">{sortAsc ? '▲' : '▼'}</span>}
                      </button>
                    ) : (
                      label
                    )}
                  </th>
                );
              })}
              <th
                scope="col"
                className="text-right px-[16px] py-[11px] font-semibold text-[#475569] text-[12.5px] uppercase"
              >
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((u) => (
              <tr key={u.id} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]">
                <td className="px-[16px] py-[12px]">
                  <div className="flex items-center gap-[12px]">
                    <div
                      aria-hidden
                      className="w-[34px] h-[34px] rounded-full bg-[#E0E7FF] flex items-center justify-center text-[12px] font-bold text-[#4338CA]"
                    >
                      {u.initials}
                    </div>
                    <span className="font-medium text-[#0F172A]">{u.name}</span>
                  </div>
                </td>
                <td className="px-[16px] py-[12px] text-[#64748B]">{u.email}</td>
                <td className="px-[16px] py-[12px]">
                  <span className="inline-block px-[8px] py-[3px] rounded-[5px] text-[12px] font-medium bg-[#F1F5F9] text-[#334155]">
                    {u.role}
                  </span>
                </td>
                <td className="px-[16px] py-[12px]">
                  <span
                    className={`inline-block px-[8px] py-[3px] rounded-[5px] text-[12px] font-medium capitalize ${statusStyles(u.status)}`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-[16px] py-[12px] text-[13px] text-[#64748B]">{u.lastSeen}</td>
                <td className="px-[16px] py-[12px] text-right">
                  <button
                    type="button"
                    aria-label={`Actions for ${u.name}`}
                    className="px-[8px] py-[4px] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-[5px]"
                  >
                    ⋯
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-[18px]">
        <span className="text-[13px] text-[#64748B]">
          Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sorted.length)} of{' '}
          {sorted.length}
        </span>
        <div className="flex items-center gap-[6px]">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-[12px] py-[6px] text-[13px] border border-[#E2E8F0] rounded-[6px] disabled:opacity-50 hover:bg-[#F8FAFC]"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i + 1)}
              className={[
                'w-[32px] h-[32px] text-[13px] rounded-[6px]',
                page === i + 1
                  ? 'bg-[#0F172A] text-white'
                  : 'border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]',
              ].join(' ')}
            >
              {i + 1}
            </button>
          ))}
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-[12px] py-[6px] text-[13px] border border-[#E2E8F0] rounded-[6px] disabled:opacity-50 hover:bg-[#F8FAFC]"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
