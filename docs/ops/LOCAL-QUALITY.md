# Local quality gate — portfolio_homlab

GitHub Actions is disabled for this repository (zero CI cost policy). Run the former CI steps locally.

```bash
npm ci
npm run typecheck
npm run lint
npm test
node --test scripts/perf-evidence.test.mjs
npm run build
# E2E (was a separate job): npx playwright install --with-deps chromium  + your playwright run
```

## Evidence required
For each gate, record: command, exit code, test counts, timestamp, commit SHA.

## Policy
GitHub Actions is DISABLED (zero CI cost). Do not add .github/workflows. Run gates locally.