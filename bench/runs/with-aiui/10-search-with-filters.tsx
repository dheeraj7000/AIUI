import * as React from 'react';
import { useState } from 'react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  posted: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  remote: boolean;
}

const JOBS: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    company: 'Linear',
    location: 'San Francisco',
    salary: '$160k-$220k',
    posted: '2 days ago',
    type: 'Full-time',
    remote: true,
  },
  {
    id: '2',
    title: 'Design Engineer',
    company: 'Vercel',
    location: 'Remote',
    salary: '$140k-$190k',
    posted: '5 days ago',
    type: 'Full-time',
    remote: true,
  },
  {
    id: '3',
    title: 'Frontend Intern',
    company: 'Stripe',
    location: 'New York',
    salary: '$8k/mo',
    posted: '1 week ago',
    type: 'Internship',
    remote: false,
  },
  {
    id: '4',
    title: 'Frontend Contractor',
    company: 'Figma',
    location: 'Remote',
    salary: '$120/hr',
    posted: '3 days ago',
    type: 'Contract',
    remote: true,
  },
  {
    id: '5',
    title: 'UI Engineer',
    company: 'Cursor',
    location: 'Berlin',
    salary: '€90k-€130k',
    posted: '4 days ago',
    type: 'Full-time',
    remote: false,
  },
];

export default function SearchWithFilters() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [types, setTypes] = useState<Set<Job['type']>>(new Set());
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sort, setSort] = useState<'Relevance' | 'Newest' | 'Salary'>('Relevance');

  const filtered = JOBS.filter((j) => {
    if (query && !j.title.toLowerCase().includes(query.toLowerCase())) return false;
    if (location && !j.location.toLowerCase().includes(location.toLowerCase())) return false;
    if (types.size > 0 && !types.has(j.type)) return false;
    if (remoteOnly && !j.remote) return false;
    return true;
  });

  function toggleType(t: Job['type']) {
    setTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex gap-3 mb-5">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Job title, keyword…"
          className="flex-1 px-4 py-3 text-sm border border-border rounded-md focus:border-primary outline-none"
        />
        <button
          type="button"
          className="px-5 py-3 bg-primary text-background text-sm font-semibold rounded-md hover:opacity-90"
        >
          Search
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        <aside>
          <form className="bg-muted border border-border rounded-md p-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Location
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or country"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Salary
              </label>
              <div className="flex gap-2">
                <input
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="Min"
                  className="w-1/2 px-3 py-2 text-sm bg-background border border-border rounded-md outline-none"
                />
                <input
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="Max"
                  className="w-1/2 px-3 py-2 text-sm bg-background border border-border rounded-md outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Job type
              </label>
              <div className="space-y-2">
                {(['Full-time', 'Part-time', 'Contract', 'Internship'] as Job['type'][]).map(
                  (t) => (
                    <label
                      key={t}
                      className="flex items-center gap-2 text-sm text-foreground cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={types.has(t)}
                        onChange={() => toggleType(t)}
                        className="w-4 h-4 rounded-sm"
                      />
                      {t}
                    </label>
                  )
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center justify-between text-sm text-foreground cursor-pointer">
                Remote only
                <button
                  type="button"
                  role="switch"
                  aria-checked={remoteOnly}
                  onClick={() => setRemoteOnly((v) => !v)}
                  className={[
                    'w-9 h-5 rounded-full relative transition-colors',
                    remoteOnly ? 'bg-primary' : 'bg-muted-foreground',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'absolute top-0.5 w-4 h-4 bg-background rounded-full transition-transform',
                      remoteOnly ? 'translate-x-4' : 'translate-x-0.5',
                    ].join(' ')}
                  />
                </button>
              </label>
            </div>
          </form>
        </aside>

        <main>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {filtered.length} of {JOBS.length}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              aria-label="Sort by"
              className="px-3 py-2 text-sm border border-border rounded-md bg-background"
            >
              <option>Relevance</option>
              <option>Newest</option>
              <option>Salary</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">
              No jobs match these filters.
            </p>
          ) : (
            <ul className="space-y-3">
              {filtered.map((j) => (
                <li
                  key={j.id}
                  className="border border-border rounded-md p-4 hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-foreground mb-1">{j.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {j.company} · {j.location}
                        {j.remote && (
                          <span className="ml-2 inline-block px-2 py-0.5 text-xs font-medium bg-success-soft text-success rounded-sm">
                            Remote
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-foreground">
                        {j.salary} · {j.posted}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 bg-foreground text-background text-sm font-medium rounded-md hover:opacity-90"
                    >
                      Apply
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}
