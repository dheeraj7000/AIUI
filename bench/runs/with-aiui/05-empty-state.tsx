import * as React from 'react';

export default function EmptyState() {
  return (
    <div className="flex items-center justify-center min-h-[480px] px-6 bg-muted">
      <div className="text-center max-w-md">
        <div
          className="mx-auto mb-5 w-20 h-20 rounded-md bg-muted flex items-center justify-center text-4xl"
          aria-hidden
        >
          📂
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">No projects yet</h2>
        <p className="text-base text-muted-foreground leading-relaxed mb-6">
          A project is where your design tokens, components, and AI-generated UIs live together.
          Create one to give your AI editor a home.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <button
            type="button"
            className="px-5 py-3 bg-primary text-background rounded-md font-medium text-sm hover:opacity-90"
          >
            Create your first project
          </button>
          <button
            type="button"
            className="px-5 py-3 text-foreground border border-border rounded-md font-medium text-sm hover:bg-muted"
          >
            Read the docs
          </button>
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          Trusted by 3,200+ teams shipping AI-written UI
        </p>
      </div>
    </div>
  );
}
