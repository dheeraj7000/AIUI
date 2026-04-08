export const aiStudioV1 = {
  pack: {
    name: 'AI/ML Studio',
    slug: 'ai-studio-v1',
    category: 'ai',
    description:
      'Dark, futuristic design system for AI/ML platforms with neon accents, optimized for chat interfaces, model playgrounds, and pipeline builders',
    version: '1.0.0',
    isPublic: true,
  },
  tokens: [
    // Colors (12)
    { tokenKey: 'color.primary', tokenType: 'color' as const, tokenValue: '#A855F7' },
    { tokenKey: 'color.primary-hover', tokenType: 'color' as const, tokenValue: '#9333EA' },
    { tokenKey: 'color.accent', tokenType: 'color' as const, tokenValue: '#22D3EE' },
    { tokenKey: 'color.accent-hover', tokenType: 'color' as const, tokenValue: '#06B6D4' },
    { tokenKey: 'color.background', tokenType: 'color' as const, tokenValue: '#09090B' },
    { tokenKey: 'color.surface', tokenType: 'color' as const, tokenValue: '#18181B' },
    { tokenKey: 'color.text-primary', tokenType: 'color' as const, tokenValue: '#FAFAFA' },
    { tokenKey: 'color.text-secondary', tokenType: 'color' as const, tokenValue: '#A1A1AA' },
    { tokenKey: 'color.border', tokenType: 'color' as const, tokenValue: '#27272A' },
    { tokenKey: 'color.success', tokenType: 'color' as const, tokenValue: '#4ADE80' },
    { tokenKey: 'color.error', tokenType: 'color' as const, tokenValue: '#F87171' },
    { tokenKey: 'color.warning', tokenType: 'color' as const, tokenValue: '#FBBF24' },
    // Radius (4)
    { tokenKey: 'radius.sm', tokenType: 'radius' as const, tokenValue: '6px' },
    { tokenKey: 'radius.md', tokenType: 'radius' as const, tokenValue: '8px' },
    { tokenKey: 'radius.lg', tokenType: 'radius' as const, tokenValue: '12px' },
    { tokenKey: 'radius.full', tokenType: 'radius' as const, tokenValue: '9999px' },
    // Fonts (3)
    { tokenKey: 'font.heading', tokenType: 'font' as const, tokenValue: 'Space Grotesk' },
    { tokenKey: 'font.body', tokenType: 'font' as const, tokenValue: 'Inter' },
    { tokenKey: 'font.mono', tokenType: 'font' as const, tokenValue: 'Fira Code' },
    // Spacing (6)
    { tokenKey: 'spacing.xs', tokenType: 'spacing' as const, tokenValue: '4px' },
    { tokenKey: 'spacing.sm', tokenType: 'spacing' as const, tokenValue: '8px' },
    { tokenKey: 'spacing.md', tokenType: 'spacing' as const, tokenValue: '16px' },
    { tokenKey: 'spacing.lg', tokenType: 'spacing' as const, tokenValue: '24px' },
    { tokenKey: 'spacing.xl', tokenType: 'spacing' as const, tokenValue: '32px' },
    { tokenKey: 'spacing.xxl', tokenType: 'spacing' as const, tokenValue: '48px' },
    // Shadows (3) with glow effects
    {
      tokenKey: 'shadow.glow-sm',
      tokenType: 'shadow' as const,
      tokenValue: '0 0 10px rgb(168 85 247 / 0.2)',
    },
    {
      tokenKey: 'shadow.glow-md',
      tokenType: 'shadow' as const,
      tokenValue: '0 0 20px rgb(168 85 247 / 0.3)',
    },
    {
      tokenKey: 'shadow.glow-lg',
      tokenType: 'shadow' as const,
      tokenValue: '0 0 40px rgb(34 211 238 / 0.25)',
    },
  ],
  recipes: [
    {
      name: 'Chat Message',
      type: 'card' as const,
      codeTemplate: `<div className="flex gap-3 px-4 py-3 {isAI ? 'bg-zinc-900/50' : 'bg-transparent'}">
  <div className="flex-shrink-0 w-8 h-8 rounded-full {isAI ? 'bg-purple-500/20 ring-1 ring-purple-500/40' : 'bg-zinc-700'} flex items-center justify-center">
    <span className="text-xs font-medium {isAI ? 'text-purple-400' : 'text-zinc-300'}">{avatarLabel}</span>
  </div>
  <div className="flex-1 min-w-0">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-sm font-medium text-zinc-200">{senderName}</span>
      <span className="text-xs text-zinc-500">{timestamp}</span>
    </div>
    <div className="text-sm text-zinc-300 leading-relaxed prose prose-invert prose-sm max-w-none">
      {messageContent}
    </div>
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          isAI: { type: 'boolean' },
          avatarLabel: { type: 'string' },
          senderName: { type: 'string' },
          timestamp: { type: 'string' },
          messageContent: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use a subtle purple-tinted background for AI messages, transparent for user messages. Render messageContent as markdown. Keep avatar compact with a two-letter label.',
    },
    {
      name: 'Prompt Input',
      type: 'textarea' as const,
      codeTemplate: `<div className="relative border border-zinc-700 rounded-lg bg-zinc-900 focus-within:border-purple-500/50 focus-within:shadow-[0_0_12px_rgb(168_85_247/0.15)]">
  <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800">
    <select className="bg-transparent text-xs text-zinc-400 border border-zinc-700 rounded px-2 py-1 focus:outline-none focus:border-purple-500">
      <option>{modelName}</option>
    </select>
    <span className="ml-auto text-xs text-zinc-500">{charCount} / {charLimit}</span>
  </div>
  <textarea className="w-full bg-transparent text-sm text-zinc-200 placeholder-zinc-600 px-3 py-3 resize-none focus:outline-none font-[Fira_Code]" rows={4} placeholder="{placeholder}">{promptText}</textarea>
  <div className="flex items-center justify-end px-3 py-2 border-t border-zinc-800">
    <button className="flex items-center gap-2 rounded-md bg-purple-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-purple-500 transition-colors">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
      Send
    </button>
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          modelName: { type: 'string' },
          charCount: { type: 'number' },
          charLimit: { type: 'number' },
          placeholder: { type: 'string' },
          promptText: { type: 'string' },
        },
      },
      aiUsageRules:
        'Include the model selector dropdown at the top. Show character count approaching the limit in yellow, over the limit in red. Use mono font for the textarea.',
    },
    {
      name: 'Model Card',
      type: 'card' as const,
      codeTemplate: `<div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 hover:border-purple-500/40 hover:shadow-[0_0_20px_rgb(168_85_247/0.1)] transition-all">
  <div className="flex items-start justify-between">
    <div>
      <h3 className="text-base font-semibold text-zinc-100">{modelName}</h3>
      <span className="inline-flex items-center mt-1 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-medium text-cyan-400 ring-1 ring-inset ring-cyan-500/20">{provider}</span>
    </div>
    <div className="flex items-center gap-1 text-xs text-zinc-500">
      <span className="inline-block w-2 h-2 rounded-full {isOnline ? 'bg-green-400' : 'bg-zinc-600'}" />
      {status}
    </div>
  </div>
  <div className="mt-4 flex flex-wrap gap-1.5">
    {capabilities}
  </div>
  <div className="mt-4 grid grid-cols-2 gap-3 pt-4 border-t border-zinc-800">
    <div>
      <span className="text-xs text-zinc-500">Latency</span>
      <p className="text-sm font-medium text-zinc-200 font-[Fira_Code]">{latency}</p>
    </div>
    <div>
      <span className="text-xs text-zinc-500">Cost / 1K tokens</span>
      <p className="text-sm font-medium text-zinc-200 font-[Fira_Code]">{costPerToken}</p>
    </div>
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          modelName: { type: 'string' },
          provider: { type: 'string' },
          isOnline: { type: 'boolean' },
          status: { type: 'string' },
          capabilities: {
            type: 'array',
            items: { type: 'string' },
          },
          latency: { type: 'string' },
          costPerToken: { type: 'string' },
        },
      },
      aiUsageRules:
        'Render each capability as a small pill badge with zinc-800 background and zinc-400 text. Show the online status dot as green when available, gray when offline. Use mono font for latency and cost values.',
    },
    {
      name: 'Token Usage Meter',
      type: 'progress' as const,
      codeTemplate: `<div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm font-medium text-zinc-300">Token Usage</span>
    <span className="text-xs text-zinc-500">{usedTokens} / {totalTokens}</span>
  </div>
  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
    <div className="h-full rounded-full transition-all duration-500 {percentage > 90 ? 'bg-red-500 shadow-[0_0_8px_rgb(239_68_68/0.4)]' : percentage > 70 ? 'bg-yellow-500' : 'bg-purple-500 shadow-[0_0_8px_rgb(168_85_247/0.3)]'}" style={{ width: '{percentage}%' }} />
  </div>
  <div className="flex items-center justify-between mt-2">
    <span className="text-xs text-zinc-500">{remainingTokens} remaining</span>
    <span className="text-xs font-medium text-zinc-400 font-[Fira_Code]">~$\{costEstimate}</span>
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          usedTokens: { type: 'string' },
          totalTokens: { type: 'string' },
          remainingTokens: { type: 'string' },
          percentage: { type: 'number' },
          costEstimate: { type: 'string' },
        },
      },
      aiUsageRules:
        'Color the progress bar purple under 70%, yellow at 70-90%, red with a glow above 90%. Always show the cost estimate in mono font. Format token numbers with commas.',
    },
    {
      name: 'API Key Input',
      type: 'input' as const,
      codeTemplate: `<div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
  <label className="block text-sm font-medium text-zinc-300 mb-2">{label}</label>
  <div className="relative flex items-center gap-2">
    <div className="flex-1 flex items-center rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 focus-within:border-purple-500/50">
      <input type="{isVisible ? 'text' : 'password'}" value="{apiKey}" className="flex-1 bg-transparent text-sm text-zinc-200 font-[Fira_Code] focus:outline-none placeholder-zinc-600" placeholder="sk-..." readOnly />
      <button className="ml-2 text-zinc-500 hover:text-zinc-300 transition-colors" title="{isVisible ? 'Hide' : 'Show'}">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="{isVisible ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18' : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'}" /></svg>
      </button>
    </div>
    <button className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors" title="Copy">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
    </button>
    <button className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-colors" title="Regenerate">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
    </button>
  </div>
  <p className="mt-2 text-xs text-zinc-600">Last used: {lastUsed}</p>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          apiKey: { type: 'string' },
          isVisible: { type: 'boolean' },
          lastUsed: { type: 'string' },
        },
      },
      aiUsageRules:
        'Always mask the key by default. Show only the first 4 and last 4 characters when masked. Use mono font for the key value. Regenerate button should trigger a confirmation dialog.',
    },
    {
      name: 'Response Stream',
      type: 'card' as const,
      codeTemplate: `<div className="rounded-lg border border-zinc-800 bg-zinc-900">
  <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-zinc-300">Response</span>
      {isStreaming && <span className="flex items-center gap-1 text-xs text-cyan-400"><span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />Streaming</span>}
    </div>
    <div className="flex items-center gap-2">
      {isStreaming && <button className="rounded px-2 py-1 text-xs text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors">Stop</button>}
      <button className="rounded px-2 py-1 text-xs text-zinc-400 border border-zinc-700 hover:text-zinc-200 hover:border-zinc-600 transition-colors">Copy</button>
    </div>
  </div>
  <div className="p-4 text-sm text-zinc-300 leading-relaxed font-[Fira_Code] whitespace-pre-wrap">
    {responseContent}
    {isStreaming && <span className="inline-block w-2 h-4 bg-purple-400 animate-pulse ml-0.5" />}
  </div>
  <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800 text-xs text-zinc-500">
    <span>{tokenCount} tokens</span>
    <span>{latency}</span>
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          isStreaming: { type: 'boolean' },
          responseContent: { type: 'string' },
          tokenCount: { type: 'string' },
          latency: { type: 'string' },
        },
      },
      aiUsageRules:
        'Show a pulsing cyan dot while streaming. Render a blinking purple cursor at the end of streaming text. Display the stop button only during active streaming. Use mono font for response content.',
    },
    {
      name: 'System Prompt Editor',
      type: 'textarea' as const,
      codeTemplate: `<div className="rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden">
  <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-purple-400">System Prompt</span>
      <span className="text-xs text-zinc-600">|</span>
      <span className="text-xs text-zinc-500">{charCount} chars</span>
    </div>
    <div className="flex items-center gap-2">
      <button className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Reset</button>
      <button className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Templates</button>
    </div>
  </div>
  <div className="relative">
    <div className="absolute left-0 top-0 bottom-0 w-10 bg-zinc-900/50 border-r border-zinc-800 flex flex-col items-center pt-3 text-xs text-zinc-600 leading-6 select-none">
      {lineNumbers}
    </div>
    <textarea className="w-full bg-transparent text-sm text-cyan-300 font-[Fira_Code] leading-6 pl-12 pr-4 py-3 resize-none focus:outline-none min-h-[200px] placeholder-zinc-700" placeholder="You are a helpful assistant...">{systemPrompt}</textarea>
  </div>
  <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-900">
    <p className="text-xs text-zinc-600">Hint: Use specific instructions, define the persona, and set output format constraints.</p>
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          systemPrompt: { type: 'string' },
          charCount: { type: 'number' },
          lineNumbers: { type: 'string' },
        },
      },
      aiUsageRules:
        'Style as a code editor with line numbers on the left gutter. Use cyan text on dark background for the prompt content. Show syntax hints in the footer bar. Provide a templates dropdown with common system prompts.',
    },
    {
      name: 'Playground Layout',
      type: 'layout' as const,
      codeTemplate: `<div className="flex flex-col h-screen bg-[#09090B] text-zinc-200">
  <header className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900">
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-purple-400">{title}</span>
      <span className="text-xs text-zinc-600">|</span>
      <select className="bg-zinc-800 text-xs text-zinc-300 border border-zinc-700 rounded px-2 py-1">{modelOptions}</select>
    </div>
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <label>Temperature</label>
        <input type="range" min="0" max="2" step="0.1" value="{temperature}" className="w-20 accent-purple-500" />
        <span className="font-[Fira_Code] text-zinc-400 w-8">{temperature}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <label>Max Tokens</label>
        <input type="number" value="{maxTokens}" className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-300 font-[Fira_Code]" />
      </div>
    </div>
  </header>
  <div className="flex flex-1 overflow-hidden">
    <div className="flex-1 flex flex-col border-r border-zinc-800">
      <div className="px-3 py-2 bg-zinc-900/50 border-b border-zinc-800 text-xs font-medium text-zinc-400">Prompt</div>
      <div className="flex-1 overflow-auto p-4">{promptPanel}</div>
    </div>
    <div className="flex-1 flex flex-col">
      <div className="px-3 py-2 bg-zinc-900/50 border-b border-zinc-800 text-xs font-medium text-zinc-400">Response</div>
      <div className="flex-1 overflow-auto p-4">{responsePanel}</div>
    </div>
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          modelOptions: { type: 'string' },
          temperature: { type: 'number' },
          maxTokens: { type: 'number' },
          promptPanel: { type: 'string' },
          responsePanel: { type: 'string' },
        },
      },
      aiUsageRules:
        'Full-height layout with a config bar at the top. Split the main area 50/50 for prompt and response. Use the config bar for model selection, temperature slider, and max tokens. Keep panels scrollable independently.',
    },
    {
      name: 'Evaluation Card',
      type: 'card' as const,
      codeTemplate: `<div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
  <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-zinc-200">{testName}</span>
      <span className="text-xs text-zinc-500">#{testId}</span>
    </div>
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {passed ? 'bg-green-400/10 text-green-400 ring-1 ring-inset ring-green-400/20' : 'bg-red-400/10 text-red-400 ring-1 ring-inset ring-red-400/20'}">{passed ? 'Pass' : 'Fail'}</span>
  </div>
  <div className="p-4 space-y-3">
    <div>
      <span className="block text-xs font-medium text-zinc-500 mb-1">Expected</span>
      <div className="rounded bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-green-400 font-[Fira_Code] whitespace-pre-wrap">{expectedOutput}</div>
    </div>
    <div>
      <span className="block text-xs font-medium text-zinc-500 mb-1">Actual</span>
      <div className="rounded bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-cyan-400 font-[Fira_Code] whitespace-pre-wrap">{actualOutput}</div>
    </div>
    {!passed && <div>
      <span className="block text-xs font-medium text-zinc-500 mb-1">Diff</span>
      <div className="rounded bg-zinc-950 border border-red-500/20 px-3 py-2 text-sm font-[Fira_Code] whitespace-pre-wrap"><span className="text-red-400">{diffContent}</span></div>
    </div>}
  </div>
  <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800 text-xs text-zinc-500">
    <span>Similarity: {similarityScore}</span>
    <span>{executionTime}</span>
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          testName: { type: 'string' },
          testId: { type: 'string' },
          passed: { type: 'boolean' },
          expectedOutput: { type: 'string' },
          actualOutput: { type: 'string' },
          diffContent: { type: 'string' },
          similarityScore: { type: 'string' },
          executionTime: { type: 'string' },
        },
      },
      aiUsageRules:
        'Show pass/fail badge prominently. Use green text for expected output, cyan for actual output. Only show the diff section when the test fails. Use mono font for all code content. Display similarity score and execution time in the footer.',
    },
    {
      name: 'Pipeline Node',
      type: 'card' as const,
      codeTemplate: `<div className="relative group rounded-lg border border-zinc-800 bg-zinc-900 w-64 hover:border-purple-500/40 hover:shadow-[0_0_20px_rgb(168_85_247/0.1)] transition-all">
  <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-zinc-700 bg-zinc-900 group-hover:border-cyan-500 transition-colors" title="Input" />
  <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-zinc-700 bg-zinc-900 group-hover:border-purple-500 transition-colors" title="Output" />
  <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800">
    <span className="inline-block w-2 h-2 rounded-full {status === 'running' ? 'bg-cyan-400 animate-pulse' : status === 'complete' ? 'bg-green-400' : status === 'error' ? 'bg-red-400' : 'bg-zinc-600'}" />
    <span className="text-sm font-medium text-zinc-200 truncate">{nodeName}</span>
    <span className="ml-auto text-xs text-zinc-600">{nodeType}</span>
  </div>
  <div className="px-3 py-2">
    <p className="text-xs text-zinc-500 line-clamp-2">{description}</p>
  </div>
  <div className="flex items-center justify-between px-3 py-2 border-t border-zinc-800">
    <span className="text-xs text-zinc-600">{inputCount} in / {outputCount} out</span>
    <button className="text-xs text-zinc-500 hover:text-purple-400 transition-colors">Configure</button>
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          nodeName: { type: 'string' },
          nodeType: { type: 'string' },
          status: { type: 'string', enum: ['idle', 'running', 'complete', 'error'] },
          description: { type: 'string' },
          inputCount: { type: 'number' },
          outputCount: { type: 'number' },
        },
      },
      aiUsageRules:
        'Show input port on the left edge and output port on the right edge as circles. Use animated cyan pulse for running status, green for complete, red for error, gray for idle. Highlight ports on hover with matching neon colors.',
    },
    {
      name: 'Cost Calculator',
      type: 'table' as const,
      codeTemplate: `<div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
  <div className="px-4 py-3 border-b border-zinc-800">
    <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
  </div>
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-zinc-800 bg-zinc-950/50">
          <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500">Model</th>
          <th className="px-4 py-2 text-right text-xs font-medium text-zinc-500">Input / 1M tokens</th>
          <th className="px-4 py-2 text-right text-xs font-medium text-zinc-500">Output / 1M tokens</th>
          <th className="px-4 py-2 text-right text-xs font-medium text-zinc-500">Context Window</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-800">
        {rows}
      </tbody>
    </table>
  </div>
  <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-950/30">
    <div className="flex items-center justify-between">
      <span className="text-xs text-zinc-500">Estimated monthly cost:</span>
      <span className="text-sm font-semibold text-purple-400 font-[Fira_Code]">$\{estimatedCost}</span>
    </div>
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          rows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                modelName: { type: 'string' },
                inputCost: { type: 'string' },
                outputCost: { type: 'string' },
                contextWindow: { type: 'string' },
              },
            },
          },
          estimatedCost: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use mono font for all numeric values. Right-align cost and context columns. Highlight the selected row with a subtle purple border. Show estimated monthly cost in the footer based on projected usage.',
    },
    {
      name: 'Deployment Badge',
      type: 'badge' as const,
      codeTemplate: `<div className="inline-flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5">
  <span className="inline-flex items-center gap-1.5">
    <span className="inline-block w-2 h-2 rounded-full {status === 'live' ? 'bg-green-400 shadow-[0_0_6px_rgb(74_222_128/0.5)]' : status === 'staging' ? 'bg-yellow-400 shadow-[0_0_6px_rgb(250_204_21/0.4)]' : 'bg-zinc-500'}" />
    <span className="text-xs font-semibold uppercase tracking-wider {status === 'live' ? 'text-green-400' : status === 'staging' ? 'text-yellow-400' : 'text-zinc-500'}">{status}</span>
  </span>
  <span className="text-xs text-zinc-600">|</span>
  <span className="text-xs text-zinc-400 font-[Fira_Code] truncate max-w-[200px]">{endpointUrl}</span>
  <span className="text-xs text-zinc-600">|</span>
  <span className="text-xs text-zinc-500">v{version}</span>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['live', 'staging', 'draft'] },
          endpointUrl: { type: 'string' },
          version: { type: 'string' },
        },
      },
      aiUsageRules:
        'Use green with glow for live status, yellow with glow for staging, muted gray for draft. Display the endpoint URL in mono font, truncated with ellipsis if too long. Always show the version number.',
    },
  ],
};
