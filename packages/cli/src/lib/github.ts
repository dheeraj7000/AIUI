/**
 * Tiny GitHub Actions helpers used by `aiui audit --ci` and
 * `aiui adopt --ci`. We only reach for the REST API to post / update a PR
 * comment — everything else (annotations, exit codes) is just stdout.
 *
 * Required env vars when --github-comment is set:
 *   GITHUB_TOKEN       — Actions-issued or PAT, must have pull-requests: write
 *   GITHUB_REPOSITORY  — "owner/repo"
 *   GITHUB_EVENT_PATH  — path to the event payload JSON (set by Actions)
 */

import * as fs from 'node:fs';

/** Marker we put at the top of our comment so we can find + update it next run. */
export const COMMENT_SENTINEL = '<!-- aiui-design-audit -->';

export interface GitHubContext {
  token: string;
  owner: string;
  repo: string;
  prNumber: number;
}

/**
 * Read the GitHub Actions context from environment + event payload.
 * Returns null if any required piece is missing (caller should print a
 * helpful message and skip the comment).
 */
export function readGitHubContext(): GitHubContext | null {
  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  const eventPath = process.env.GITHUB_EVENT_PATH;

  if (!token || !repository || !eventPath) return null;

  let event: unknown;
  try {
    event = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
  } catch {
    return null;
  }

  const e = event as {
    pull_request?: { number?: number };
    issue?: { number?: number; pull_request?: unknown };
    number?: number;
  };

  // pull_request event, issue_comment-on-PR event, or workflow_dispatch with PR number
  const prNumber =
    e.pull_request?.number ?? (e.issue?.pull_request ? e.issue?.number : undefined) ?? e.number;

  if (!prNumber) return null;

  const [owner, repo] = repository.split('/');
  if (!owner || !repo) return null;

  return { token, owner, repo, prNumber };
}

interface GitHubComment {
  id: number;
  body: string;
}

async function listComments(ctx: GitHubContext): Promise<GitHubComment[]> {
  const url = `https://api.github.com/repos/${ctx.owner}/${ctx.repo}/issues/${ctx.prNumber}/comments?per_page=100`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${ctx.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub list comments failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as GitHubComment[];
}

async function patchComment(ctx: GitHubContext, commentId: number, body: string): Promise<void> {
  const url = `https://api.github.com/repos/${ctx.owner}/${ctx.repo}/issues/comments/${commentId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${ctx.token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) {
    throw new Error(`GitHub update comment failed: ${res.status} ${res.statusText}`);
  }
}

async function postComment(ctx: GitHubContext, body: string): Promise<void> {
  const url = `https://api.github.com/repos/${ctx.owner}/${ctx.repo}/issues/${ctx.prNumber}/comments`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ctx.token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) {
    throw new Error(`GitHub post comment failed: ${res.status} ${res.statusText}`);
  }
}

/**
 * Post an audit comment on the current PR — or update the existing one if
 * a previous run already left a comment with our sentinel marker. The body
 * MUST start with COMMENT_SENTINEL so we can find it next time.
 */
export async function upsertPrComment(ctx: GitHubContext, body: string): Promise<void> {
  if (!body.startsWith(COMMENT_SENTINEL)) {
    body = `${COMMENT_SENTINEL}\n\n${body}`;
  }

  const comments = await listComments(ctx);
  const existing = comments.find((c) => c.body.includes(COMMENT_SENTINEL));

  if (existing) {
    await patchComment(ctx, existing.id, body);
  } else {
    await postComment(ctx, body);
  }
}

/**
 * Emit a GitHub Actions workflow command (e.g., to register a problem
 * matcher annotation). Stdout-only; safe to call when not running in CI.
 */
export function emitAnnotation(
  level: 'notice' | 'warning' | 'error',
  message: string,
  loc?: { file?: string; line?: number; col?: number; title?: string }
): void {
  const params: string[] = [];
  if (loc?.file) params.push(`file=${loc.file}`);
  if (loc?.line !== undefined) params.push(`line=${loc.line}`);
  if (loc?.col !== undefined) params.push(`col=${loc.col}`);
  if (loc?.title) params.push(`title=${loc.title}`);
  const head = `::${level}${params.length > 0 ? ' ' + params.join(',') : ''}::`;
  // Escape newlines per Actions spec
  const safe = message.replace(/\r/g, '%0D').replace(/\n/g, '%0A');
  process.stdout.write(`${head}${safe}\n`);
}
