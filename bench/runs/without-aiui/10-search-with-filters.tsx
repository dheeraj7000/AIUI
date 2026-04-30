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
    <div className="max-w-[1100px] mx-auto p-[24px]">
      <div className="flex gap-[10px] mb-[20px]">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Job title, keyword…"
          className="flex-1 px-[14px] py-[10px] text-[14px] border border-[#D1D5DB] rounded-[8px] focus:border-[#2563EB] outline-none"
        />
        <button
          type="button"
          className="px-[20px] py-[10px] bg-[#2563EB] text-white text-[14px] font-semibold rounded-[8px] hover:bg-[#1D4ED8]"
        >
          Search
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-[24px]">
        <aside>
          <form className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] p-[16px] space-y-[16px]">
            <div>
              <label className="block text-[12.5px] font-semibold text-[#374151] uppercase tracking-[0.04em] mb-[6px]">
                Location
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or country"
                className="w-full px-[10px] py-[7px] text-[13px] bg-white border border-[#E5E7EB] rounded-[6px] focus:border-[#2563EB] outline-none"
              />
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold text-[#374151] uppercase tracking-[0.04em] mb-[6px]">
                Salary
              </label>
              <div className="flex gap-[8px]">
                <input
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="Min"
                  className="w-1/2 px-[10px] py-[7px] text-[13px] bg-white border border-[#E5E7EB] rounded-[6px] outline-none"
                />
                <input
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="Max"
                  className="w-1/2 px-[10px] py-[7px] text-[13px] bg-white border border-[#E5E7EB] rounded-[6px] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold text-[#374151] uppercase tracking-[0.04em] mb-[8px]">
                Job type
              </label>
              <div className="space-y-[6px]">
                {(['Full-time', 'Part-time', 'Contract', 'Internship'] as Job['type'][]).map(
                  (t) => (
                    <label
                      key={t}
                      className="flex items-center gap-[8px] text-[13px] text-[#374151] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={types.has(t)}
                        onChange={() => toggleType(t)}
                        className="w-[15px] h-[15px] rounded-[3px]"
                      />
                      {t}
                    </label>
                  )
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center justify-between text-[13px] text-[#374151] cursor-pointer">
                Remote only
                <button
                  type="button"
                  role="switch"
                  aria-checked={remoteOnly}
                  onClick={() => setRemoteOnly((v) => !v)}
                  className={[
                    'w-[36px] h-[20px] rounded-full relative transition-colors',
                    remoteOnly ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'absolute top-[2px] w-[16px] h-[16px] bg-white rounded-full transition-transform',
                      remoteOnly ? 'translate-x-[18px]' : 'translate-x-[2px]',
                    ].join(' ')}
                  />
                </button>
              </label>
            </div>
          </form>
        </aside>

        <main>
          <div className="flex items-center justify-between mb-[14px]">
            <p className="text-[13px] text-[#6B7280]">
              Showing {filtered.length} of {JOBS.length}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              aria-label="Sort by"
              className="px-[10px] py-[6px] text-[13px] border border-[#D1D5DB] rounded-[6px] bg-white"
            >
              <option>Relevance</option>
              <option>Newest</option>
              <option>Salary</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <p className="text-[14px] text-[#6B7280] py-[40px] text-center">
              No jobs match these filters.
            </p>
          ) : (
            <ul className="space-y-[12px]">
              {filtered.map((j) => (
                <li
                  key={j.id}
                  className="border border-[#E5E7EB] rounded-[10px] p-[16px] hover:border-[#2563EB] transition-colors"
                >
                  <div className="flex items-start justify-between gap-[16px]">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15.5px] font-semibold text-[#0F172A] mb-[3px]">
                        {j.title}
                      </h3>
                      <p className="text-[13px] text-[#6B7280] mb-[6px]">
                        {j.company} · {j.location}
                        {j.remote && (
                          <span className="ml-[8px] inline-block px-[6px] py-[1px] text-[11px] font-medium bg-[#DCFCE7] text-[#15803D] rounded-[3px]">
                            Remote
                          </span>
                        )}
                      </p>
                      <p className="text-[13px] text-[#374151]">
                        {j.salary} · {j.posted}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="px-[14px] py-[7px] bg-[#0F172A] text-white text-[13px] font-medium rounded-[6px] hover:bg-[#1E293B]"
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
