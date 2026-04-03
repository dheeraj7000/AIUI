# AIUI CI/CD Design Validation

AIUI design validation checks your source code against the design tokens defined in your AIUI project. It catches unauthorized colors, fonts, and other design violations before they reach production.

## How It Works

The AIUI CLI (`@aiui/cli`) scans your source files for hard-coded design values (hex colors, font families, spacing, etc.) and compares them against the approved tokens in your AIUI style pack. Any value that does not match an approved token is reported as a violation.

You can run validation locally, in CI/CD pipelines, or via the remote API.

---

## Setup Option A: Local Tokens

Commit your design tokens file to the repository so the CLI can validate offline.

1. Export tokens from your AIUI project dashboard (or use the CLI):
   ```bash
   npx @aiui/cli pull --project my-project --output .aiui/tokens.json
   ```
2. Commit `.aiui/tokens.json` to your repo.
3. Run validation:
   ```bash
   npx @aiui/cli validate --files "src/**/*.{tsx,jsx,ts,js,css,html}"
   ```

The CLI automatically detects `.aiui/tokens.json` in the current working directory.

## Setup Option B: Remote API

If you prefer not to commit tokens, use an API key to fetch them at validation time.

1. Create an API key in the AIUI dashboard (Settings > API Keys).
2. Store the key as a CI secret (e.g., `AIUI_API_KEY`).
3. Run validation with the key:
   ```bash
   npx @aiui/cli validate \
     --api-key "$AIUI_API_KEY" \
     --project my-project \
     --files "src/**/*.{tsx,jsx,ts,js,css,html}"
   ```

The CLI calls the AIUI validation API to resolve tokens from your project's active style pack.

---

## GitHub Actions

### Using the Reusable Action

Add this to your workflow (e.g., `.github/workflows/design-validation.yml`):

```yaml
name: Design Validation
on:
  pull_request:
    paths: ['src/**']

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/validate-design
        with:
          strict: 'true'
          format: 'github'
```

### With an API Key (No Local Tokens)

```yaml
name: Design Validation
on:
  pull_request:
    paths: ['src/**']

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/validate-design
        with:
          api-key: ${{ secrets.AIUI_API_KEY }}
          project: 'my-project'
          strict: 'true'
          format: 'github'
```

### Action Inputs

| Input     | Required | Default                             | Description                                |
| --------- | -------- | ----------------------------------- | ------------------------------------------ |
| `api-key` | No       |                                     | AIUI API key (alternative to local tokens) |
| `project` | No       |                                     | AIUI project slug (used with `api-key`)    |
| `files`   | No       | `src/**/*.{tsx,jsx,ts,js,css,html}` | Glob pattern for files to scan             |
| `strict`  | No       | `true`                              | Fail the step on any violation             |
| `format`  | No       | `github`                            | Output format: `text`, `json`, or `github` |

When `format` is set to `github`, violations appear as inline annotations on pull request diffs.

---

## GitLab CI

### Include the Template

In your `.gitlab-ci.yml`:

```yaml
include:
  - project: 'dkumar70/AIUI'
    ref: main
    file: 'ci/validate-design.yml'

design-validation:
  extends: .aiui-validate
```

### Override Variables

```yaml
design-validation:
  extends: .aiui-validate
  variables:
    AIUI_FILES: 'components/**/*.{tsx,jsx}'
    AIUI_STRICT: 'true'
    AIUI_FORMAT: 'text'
    AIUI_API_KEY: $AIUI_API_KEY
    AIUI_PROJECT: 'my-project'
```

### Template Variables

| Variable       | Default                             | Description                              |
| -------------- | ----------------------------------- | ---------------------------------------- |
| `AIUI_FILES`   | `src/**/*.{tsx,jsx,ts,js,css,html}` | Glob pattern for files to scan           |
| `AIUI_STRICT`  | `true`                              | Enable strict mode (non-empty = on)      |
| `AIUI_FORMAT`  | `text`                              | Output format: `text` or `json`          |
| `AIUI_API_KEY` |                                     | AIUI API key for remote token resolution |
| `AIUI_PROJECT` |                                     | AIUI project slug                        |

---

## CLI Usage

```bash
npx @aiui/cli validate [options]
```

### Flags

| Flag               | Description                                    |
| ------------------ | ---------------------------------------------- |
| `--files <glob>`   | Glob pattern for files to validate             |
| `--format <fmt>`   | Output format: `text`, `json`, or `github`     |
| `--strict`         | Exit with non-zero code on any violation       |
| `--api-key <key>`  | AIUI API key for remote validation             |
| `--project <slug>` | Project slug (required when using `--api-key`) |

### Examples

```bash
# Validate with local tokens
npx @aiui/cli validate --files "src/**/*.tsx" --strict

# Validate with remote API
npx @aiui/cli validate --api-key "aiui_k_..." --project "my-app" --files "src/**/*.tsx"

# Output as JSON for further processing
npx @aiui/cli validate --files "src/**/*.tsx" --format json
```

---

## Example Output

### Text Format

```
AIUI Design Validation
=======================

src/components/Button.tsx
  Line 12: WARNING - Unauthorized color "#ff6347" (suggestion: Replace with an approved color token value)
  Line 28: WARNING - Unauthorized font "Comic Sans MS" (suggestion: Replace with an approved font from the design tokens)

src/styles/globals.css
  Line 5: WARNING - Unauthorized color "#123abc"

Score: 85/100
Violations: 3 (0 errors, 3 warnings)
Result: FAIL (strict mode)
```

### GitHub Format

When using `--format github`, violations appear as workflow annotations:

```
::warning file=src/components/Button.tsx,line=12::Unauthorized color "#ff6347" — Replace with an approved color token value
::warning file=src/components/Button.tsx,line=28::Unauthorized font "Comic Sans MS" — Replace with an approved font from the design tokens
::warning file=src/styles/globals.css,line=5::Unauthorized color "#123abc"
```

These annotations appear inline on pull request file diffs in the GitHub UI.

---

## Validation API

For programmatic use, the AIUI platform exposes validation endpoints.

### POST /api/validate

Validate a single code snippet.

```bash
curl -X POST https://app.aiui.dev/api/validate \
  -H "Authorization: Bearer aiui_k_..." \
  -H "Content-Type: application/json" \
  -d '{
    "code": "const color = \"#ff6347\";",
    "projectSlug": "my-project"
  }'
```

**Response:**

```json
{
  "compliant": false,
  "score": 95,
  "violations": [
    {
      "type": "color",
      "severity": "warning",
      "message": "Unauthorized color \"#ff6347\" at line 1",
      "line": 1,
      "value": "#ff6347",
      "suggestion": "Replace with an approved color token value"
    }
  ],
  "tokenCount": 42,
  "checkedAt": "2026-04-02T12:00:00.000Z"
}
```

### POST /api/validate/batch

Validate multiple files in one request.

```bash
curl -X POST https://app.aiui.dev/api/validate/batch \
  -H "Authorization: Bearer aiui_k_..." \
  -H "Content-Type: application/json" \
  -d '{
    "files": [
      { "path": "src/Button.tsx", "code": "const bg = \"#ff6347\";" },
      { "path": "src/Card.tsx", "code": "const bg = \"#ffffff\";" }
    ],
    "projectSlug": "my-project"
  }'
```

**Response:**

```json
{
  "compliant": false,
  "score": 97.5,
  "results": [
    {
      "path": "src/Button.tsx",
      "compliant": false,
      "score": 95,
      "violations": [{ "type": "color", "severity": "warning", "message": "..." }]
    },
    {
      "path": "src/Card.tsx",
      "compliant": true,
      "score": 100,
      "violations": []
    }
  ],
  "summary": {
    "totalFiles": 2,
    "totalViolations": 1,
    "errorCount": 0,
    "warningCount": 1
  }
}
```

---

## Troubleshooting

### "No tokens found" / "Project has no active style pack"

- Ensure your AIUI project has a style pack assigned. Go to your project settings and assign an active style pack.
- If using local tokens, verify that `.aiui/tokens.json` exists and is not empty.

### "Unauthorized" (401)

- If using `x-user-id` header: ensure your auth proxy is forwarding the header correctly.
- If using an API key: verify the key has not been revoked and has not expired. Generate a new key in the dashboard if needed.

### "Project not found" (404)

- Check that the `--project` flag value matches your project slug exactly (case-sensitive, lowercase with hyphens).
- If using `projectId` in the API body, ensure it is a valid UUID.

### High Violation Count on Existing Code

- Start with `--strict false` to get a baseline score without failing the pipeline.
- Address violations incrementally. Focus on errors first (20-point penalty each), then warnings (5-point penalty each).

### Slow CI Runs

- Narrow the `--files` glob to only the directories that contain UI code.
- Use the batch API endpoint instead of validating files one at a time when integrating programmatically.

### Missing Colors or Fonts Not Detected

- The validator currently scans for hex color codes (`#rgb`, `#rrggbb`, `#rrggbbaa`) and `font-family` declarations. RGB/HSL function syntax and CSS custom properties are not checked by the current version.
- Ensure your tokens include the exact hex values used in code (e.g., `#fff` vs `#ffffff`).
