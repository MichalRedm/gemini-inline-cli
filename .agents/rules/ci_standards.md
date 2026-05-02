# CI Standards

## Quality Checks
- Use `npm run build` to verify TypeScript compilation.
- Ensure all source files pass basic linting (if configured).

## Automated Pipeline
- The `.github/workflows/ci.yml` runs on every push to `main` and pull requests.
- It performs `npm ci` and `npm run build`.
