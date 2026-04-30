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
    if (s === 'active') return 'bg-success-soft text-success';
    if (s === 'invited') return 'bg-warning-soft text-warning';
    return 'bg-destructive-soft text-destructive';
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-xl font-bold text-foreground mb-4">Team members</h2>
      <div className="border border-border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
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
                const isSorted = key === sortKey;
                return (
                  <th
                    key={key}
                    scope="col"
                    aria-sort={isSorted ? (sortAsc ? 'ascending' : 'descending') : 'none'}
                    className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider"
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(key as SortKey)}
                        className="inline-flex items-center gap-1 hover:text-foreground"
                      >
                        {label}
                        {isSorted && <span className="text-xs">{sortAsc ? '▲' : '▼'}</span>}
                      </button>
                    ) : (
                      label
                    )}
                  </th>
                );
              })}
              <th
                scope="col"
                className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase"
              >
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((u) => (
              <tr key={u.id} className="border-t border-border hover:bg-muted">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      aria-hidden
                      className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-primary"
                    >
                      {u.initials}
                    </div>
                    <span className="font-medium text-foreground">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-1 rounded-sm text-xs font-medium bg-muted text-foreground">
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-1 rounded-sm text-xs font-medium capitalize ${statusStyles(u.status)}`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{u.lastSeen}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    aria-label={`Actions for ${u.name}`}
                    className="px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm"
                  >
                    ⋯
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-muted-foreground">
          Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sorted.length)} of{' '}
          {sorted.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-2 text-sm border border-border rounded-md disabled:opacity-50 hover:bg-muted"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i + 1)}
              className={[
                'w-8 h-8 text-sm rounded-md',
                page === i + 1
                  ? 'bg-foreground text-background'
                  : 'border border-border text-muted-foreground hover:bg-muted',
              ].join(' ')}
            >
              {i + 1}
            </button>
          ))}
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-2 text-sm border border-border rounded-md disabled:opacity-50 hover:bg-muted"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
