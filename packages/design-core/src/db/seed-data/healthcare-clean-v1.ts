export const healthcareCleanV1 = {
  pack: {
    name: 'Healthcare Clean',
    slug: 'healthcare-clean-v1',
    category: 'healthcare',
    description:
      'Calming, accessible healthcare design system with trust-focused teal palette and WCAG AA compliance',
    version: '1.0.0',
    isPublic: true,
  },
  tokens: [
    { tokenKey: 'color.primary', tokenType: 'color' as const, tokenValue: '#0D9488' },
    { tokenKey: 'color.primary-hover', tokenType: 'color' as const, tokenValue: '#0F766E' },
    { tokenKey: 'color.secondary', tokenType: 'color' as const, tokenValue: '#64748B' },
    { tokenKey: 'color.accent', tokenType: 'color' as const, tokenValue: '#38BDF8' },
    { tokenKey: 'color.background', tokenType: 'color' as const, tokenValue: '#FAFAF9' },
    { tokenKey: 'color.surface', tokenType: 'color' as const, tokenValue: '#F5F5F4' },
    { tokenKey: 'color.text-primary', tokenType: 'color' as const, tokenValue: '#1C1917' },
    { tokenKey: 'color.text-secondary', tokenType: 'color' as const, tokenValue: '#57534E' },
    { tokenKey: 'color.success', tokenType: 'color' as const, tokenValue: '#16A34A' },
    { tokenKey: 'color.error', tokenType: 'color' as const, tokenValue: '#DC2626' },
    { tokenKey: 'color.warning', tokenType: 'color' as const, tokenValue: '#D97706' },
    { tokenKey: 'color.border', tokenType: 'color' as const, tokenValue: '#E7E5E4' },
    { tokenKey: 'radius.sm', tokenType: 'radius' as const, tokenValue: '8px' },
    { tokenKey: 'radius.md', tokenType: 'radius' as const, tokenValue: '12px' },
    { tokenKey: 'radius.lg', tokenType: 'radius' as const, tokenValue: '16px' },
    { tokenKey: 'radius.full', tokenType: 'radius' as const, tokenValue: '9999px' },
    { tokenKey: 'font.heading', tokenType: 'font' as const, tokenValue: 'Plus Jakarta Sans' },
    { tokenKey: 'font.body', tokenType: 'font' as const, tokenValue: 'Inter' },
    { tokenKey: 'font.mono', tokenType: 'font' as const, tokenValue: 'JetBrains Mono' },
    { tokenKey: 'spacing.xs', tokenType: 'spacing' as const, tokenValue: '6px' },
    { tokenKey: 'spacing.sm', tokenType: 'spacing' as const, tokenValue: '12px' },
    { tokenKey: 'spacing.md', tokenType: 'spacing' as const, tokenValue: '18px' },
    { tokenKey: 'spacing.lg', tokenType: 'spacing' as const, tokenValue: '28px' },
    { tokenKey: 'spacing.xl', tokenType: 'spacing' as const, tokenValue: '40px' },
    { tokenKey: 'spacing.xxl', tokenType: 'spacing' as const, tokenValue: '56px' },
    {
      tokenKey: 'shadow.sm',
      tokenType: 'shadow' as const,
      tokenValue: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
    },
    {
      tokenKey: 'shadow.md',
      tokenType: 'shadow' as const,
      tokenValue: '0 2px 6px -1px rgb(0 0 0 / 0.06)',
    },
    {
      tokenKey: 'shadow.lg',
      tokenType: 'shadow' as const,
      tokenValue: '0 4px 12px -2px rgb(0 0 0 / 0.08)',
    },
  ],
  recipes: [
    {
      name: 'Appointment Card',
      type: 'card' as const,
      codeTemplate: `<div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
  <div className="flex items-start justify-between">
    <div>
      <h3 className="text-lg font-semibold text-stone-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{doctorName}</h3>
      <p className="mt-1 text-sm text-stone-500">{specialty}</p>
    </div>
    <span className={\`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium \${
      {statusVariant} === 'confirmed'
        ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-600/20'
        : {statusVariant} === 'pending'
        ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
        : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'
    }\`}>{status}</span>
  </div>
  <div className="mt-4 flex items-center gap-4 text-sm text-stone-600">
    <div className="flex items-center gap-1.5">
      <svg className="h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
      <span>{appointmentDate}</span>
    </div>
    <div className="flex items-center gap-1.5">
      <svg className="h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span>{appointmentTime}</span>
    </div>
  </div>
  <div className="mt-5 flex items-center gap-3">
    <button className="flex-1 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors">Confirm</button>
    <button className="flex-1 rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors">Cancel</button>
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          doctorName: { type: 'string' },
          specialty: { type: 'string' },
          appointmentDate: { type: 'string' },
          appointmentTime: { type: 'string' },
          status: { type: 'string' },
          statusVariant: { type: 'string', enum: ['confirmed', 'pending', 'cancelled'] },
        },
      },
      aiUsageRules:
        'Use for displaying upcoming appointments. Status badge should reflect confirmed (teal), pending (amber), or cancelled (red). Always show both confirm and cancel actions.',
    },
    {
      name: 'Patient Info Banner',
      type: 'header' as const,
      codeTemplate: `<div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div className="flex items-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-700 text-lg font-bold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{patientInitials}</div>
      <div>
        <h2 className="text-xl font-bold text-stone-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{patientName}</h2>
        <div className="mt-1 flex items-center gap-3 text-sm text-stone-500">
          <span>Age: {patientAge}</span>
          <span className="text-stone-300">|</span>
          <span>ID: <span className="font-mono text-stone-600">{patientId}</span></span>
        </div>
      </div>
    </div>
    <div className="flex flex-col items-start sm:items-end gap-2">
      <div className="flex flex-wrap gap-1.5">
        {allergies}
      </div>
      <p className="text-sm text-stone-500">Emergency: <span className="font-semibold text-stone-700">{emergencyContact}</span> <a href="tel:{emergencyPhone}" className="text-teal-600 hover:text-teal-700 font-medium">{emergencyPhone}</a></p>
    </div>
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          patientName: { type: 'string' },
          patientInitials: { type: 'string' },
          patientAge: { type: 'number' },
          patientId: { type: 'string' },
          allergies: {
            type: 'array',
            items: { type: 'string' },
          },
          emergencyContact: { type: 'string' },
          emergencyPhone: { type: 'string' },
        },
      },
      aiUsageRules:
        'Display at the top of patient detail views. Allergy badges should use red/rose tones for visibility. Always include emergency contact. Keep patient ID in monospace.',
    },
    {
      name: 'Medication List',
      type: 'table' as const,
      codeTemplate: `<div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
  <div className="px-6 py-4 border-b border-stone-200">
    <h3 className="text-lg font-semibold text-stone-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Current Medications</h3>
  </div>
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-stone-100 bg-stone-50/50">
          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Medication</th>
          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Dosage</th>
          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Frequency</th>
          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Status</th>
          <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-stone-500">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-stone-100">
        <tr className="hover:bg-stone-50/50 transition-colors">
          <td className="px-6 py-4 text-sm font-medium text-stone-900">{drugName}</td>
          <td className="px-6 py-4 text-sm text-stone-600 font-mono">{dosage}</td>
          <td className="px-6 py-4 text-sm text-stone-600">{frequency}</td>
          <td className="px-6 py-4">
            <span className={\`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium \${
              {medicationStatus} === 'active'
                ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                : 'bg-stone-100 text-stone-600 ring-1 ring-stone-300/40'
            }\`}>{medicationStatusLabel}</span>
          </td>
          <td className="px-6 py-4 text-right">
            <button className="rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition-colors">Refill</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          drugName: { type: 'string' },
          dosage: { type: 'string' },
          frequency: { type: 'string' },
          medicationStatus: { type: 'string', enum: ['active', 'discontinued'] },
          medicationStatusLabel: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use for listing patient medications. Dosage should display in monospace for readability. Active medications use green badge, discontinued use neutral. Refill button uses teal accent.',
    },
    {
      name: 'Health Metric Card',
      type: 'card' as const,
      codeTemplate: `<div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-stone-500">{metricLabel}</span>
    <span className={\`inline-flex items-center gap-1 text-xs font-medium \${
      {trend} === 'up' ? 'text-green-600' : {trend} === 'down' ? 'text-red-600' : 'text-stone-400'
    }\`}>
      {trend === 'up' && <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>}
      {trend === 'down' && <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" /></svg>}
      {trendLabel}
    </span>
  </div>
  <div className="mt-3">
    <span className="text-3xl font-bold text-stone-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{metricValue}</span>
    <span className="ml-2 text-sm text-stone-500">{metricUnit}</span>
  </div>
  <div className="mt-3 flex items-center gap-2">
    <div className="h-1.5 flex-1 rounded-full bg-stone-100">
      <div className={\`h-1.5 rounded-full \${
        {rangeStatus} === 'normal' ? 'bg-teal-500' : {rangeStatus} === 'elevated' ? 'bg-amber-500' : 'bg-red-500'
      }\`} style={{ width: '{rangePercent}%' }} />
    </div>
    <span className="text-xs text-stone-400">{normalRange}</span>
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          metricLabel: { type: 'string' },
          metricValue: { type: 'string' },
          metricUnit: { type: 'string' },
          trend: { type: 'string', enum: ['up', 'down', 'stable'] },
          trendLabel: { type: 'string' },
          normalRange: { type: 'string' },
          rangeStatus: { type: 'string', enum: ['normal', 'elevated', 'critical'] },
          rangePercent: { type: 'number' },
        },
      },
      aiUsageRules:
        'Use for vital signs like heart rate, blood pressure, temperature, SpO2. Range bar shows where value falls: teal for normal, amber for elevated, red for critical. Trend arrow indicates change from last reading.',
    },
    {
      name: 'Doctor Profile Card',
      type: 'card' as const,
      codeTemplate: `<div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 text-center">
  <img src="{doctorPhoto}" alt="{doctorName}" className="mx-auto h-20 w-20 rounded-full object-cover ring-2 ring-stone-100" />
  <h3 className="mt-4 text-lg font-semibold text-stone-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{doctorName}</h3>
  <p className="mt-1 text-sm text-stone-500">{specialty}</p>
  <div className="mt-3 flex items-center justify-center gap-1">
    <div className="flex">
      {ratingStars}
    </div>
    <span className="ml-1.5 text-sm font-medium text-stone-700">{rating}</span>
    <span className="text-sm text-stone-400">({reviewCount})</span>
  </div>
  <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20">
    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
    {availability}
  </div>
  <button className="mt-5 w-full rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors">Book Appointment</button>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          doctorPhoto: { type: 'string' },
          doctorName: { type: 'string' },
          specialty: { type: 'string' },
          rating: { type: 'number' },
          reviewCount: { type: 'number' },
          ratingStars: { type: 'string' },
          availability: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use for doctor listings and search results. Show availability status with a green dot when available. Rating uses filled star icons. Book button uses primary teal color.',
    },
    {
      name: 'Symptom Checker',
      type: 'input' as const,
      codeTemplate: `<div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
  <h3 className="text-lg font-semibold text-stone-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Symptom Checker</h3>
  <p className="mt-1 text-sm text-stone-500">Search and select your symptoms below</p>
  <div className="mt-4 relative">
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
    <input type="text" placeholder="{searchPlaceholder}" className="w-full rounded-xl border border-stone-300 bg-stone-50 py-2.5 pl-10 pr-4 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-colors" />
  </div>
  <div className="mt-4 flex flex-wrap gap-2">
    {selectedSymptoms}
  </div>
  <div className="mt-3 border-t border-stone-100 pt-3">
    <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">Suggestions</p>
    <div className="flex flex-wrap gap-2">
      {suggestedSymptoms}
    </div>
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          searchPlaceholder: { type: 'string' },
          selectedSymptoms: {
            type: 'array',
            items: { type: 'string' },
          },
          suggestedSymptoms: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
      aiUsageRules:
        'Selected symptoms render as teal tags with remove button. Suggested symptoms render as outlined stone tags. Search input filters suggestions. Always include a search icon in the input field.',
    },
    {
      name: 'Insurance Card',
      type: 'card' as const,
      codeTemplate: `<div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl shadow-md p-6 text-white">
  <div className="flex items-center justify-between">
    <span className="text-xs font-medium uppercase tracking-wider text-teal-200">Health Insurance</span>
    <svg className="h-8 w-8 text-teal-300/50" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
  </div>
  <h3 className="mt-4 text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{planName}</h3>
  <div className="mt-4 grid grid-cols-2 gap-4">
    <div>
      <p className="text-xs text-teal-200">Member ID</p>
      <p className="mt-0.5 text-sm font-mono font-medium">{memberId}</p>
    </div>
    <div>
      <p className="text-xs text-teal-200">Group Number</p>
      <p className="mt-0.5 text-sm font-mono font-medium">{groupNumber}</p>
    </div>
  </div>
  <div className="mt-4 border-t border-teal-500/40 pt-4">
    <div className="grid grid-cols-3 gap-3 text-center">
      <div>
        <p className="text-xs text-teal-200">Copay</p>
        <p className="mt-0.5 text-sm font-bold">{copay}</p>
      </div>
      <div>
        <p className="text-xs text-teal-200">Deductible</p>
        <p className="mt-0.5 text-sm font-bold">{deductible}</p>
      </div>
      <div>
        <p className="text-xs text-teal-200">Out-of-Pocket Max</p>
        <p className="mt-0.5 text-sm font-bold">{outOfPocketMax}</p>
      </div>
    </div>
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          planName: { type: 'string' },
          memberId: { type: 'string' },
          groupNumber: { type: 'string' },
          copay: { type: 'string' },
          deductible: { type: 'string' },
          outOfPocketMax: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use a teal gradient background to differentiate from standard cards. Member ID and group number in monospace. Coverage details in a 3-column grid. Resembles a physical insurance card.',
    },
    {
      name: 'Consent Form',
      type: 'modal' as const,
      codeTemplate: `<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
  <div className="mx-4 w-full max-w-lg rounded-2xl bg-white shadow-xl">
    <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
      <h2 className="text-lg font-bold text-stone-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{formTitle}</h2>
      <button className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
    <div className="max-h-80 overflow-y-auto px-6 py-4">
      <div className="prose prose-sm prose-stone">
        {consentContent}
      </div>
    </div>
    <div className="border-t border-stone-200 px-6 py-4">
      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-500" />
        <span className="text-sm text-stone-700">{agreementLabel}</span>
      </label>
      <button className="mt-4 w-full rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{signButtonLabel}</button>
    </div>
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          formTitle: { type: 'string' },
          consentContent: { type: 'string' },
          agreementLabel: { type: 'string' },
          signButtonLabel: { type: 'string' },
        },
      },
      aiUsageRules:
        'Modal with scrollable content area for legal text. Checkbox must be checked before sign button is enabled. Use backdrop blur for overlay. Close button in header. Content area has a max height for scrolling.',
    },
    {
      name: 'Care Timeline',
      type: 'card' as const,
      codeTemplate: `<div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
  <h3 className="text-lg font-semibold text-stone-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Care Timeline</h3>
  <div className="mt-6 relative">
    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-stone-200" />
    <div className="space-y-6">
      <div className="relative flex gap-4">
        <div className={\`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white \${
          {eventType} === 'appointment' ? 'bg-teal-100 text-teal-600'
          : {eventType} === 'prescription' ? 'bg-sky-100 text-sky-600'
          : 'bg-violet-100 text-violet-600'
        }\`}>
          {eventType === 'appointment' && <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
          {eventType === 'prescription' && <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a3.187 3.187 0 01-4.508.16L5 14.5" /></svg>}
          {eventType === 'labResult' && <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5" /></svg>}
        </div>
        <div className="flex-1 pb-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-stone-900">{eventTitle}</p>
            <time className="text-xs text-stone-400">{eventDate}</time>
          </div>
          <p className="mt-1 text-sm text-stone-500">{eventDescription}</p>
        </div>
      </div>
    </div>
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          eventType: { type: 'string', enum: ['appointment', 'prescription', 'labResult'] },
          eventTitle: { type: 'string' },
          eventDate: { type: 'string' },
          eventDescription: { type: 'string' },
        },
      },
      aiUsageRules:
        'Vertical timeline with color-coded event types: teal for appointments, sky blue for prescriptions, violet for lab results. Each event has a circular icon on the timeline rail. Show most recent events first.',
    },
    {
      name: 'Emergency CTA',
      type: 'cta' as const,
      codeTemplate: `<div className="rounded-2xl bg-red-50 border-2 border-red-200 p-6">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
      </div>
      <div>
        <h3 className="text-lg font-bold text-red-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{emergencyTitle}</h3>
        <p className="mt-0.5 text-sm text-red-700">{emergencyDescription}</p>
      </div>
    </div>
    <a href="tel:{emergencyPhone}" className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white hover:bg-red-700 shadow-sm transition-colors">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
      {emergencyPhone}
    </a>
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          emergencyTitle: { type: 'string' },
          emergencyDescription: { type: 'string' },
          emergencyPhone: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use for prominent emergency contact sections. Red color scheme for urgency. Phone number is both displayed and clickable via tel: link. Always visible, never hidden behind interactions. Include phone icon in the CTA button.',
    },
  ],
};
