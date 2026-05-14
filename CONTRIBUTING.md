# Contributing

Thanks for taking the time to improve Parse Server Schema Manager.

## Local Setup

```shell
bun install
bun run type-check
bun test
bun run build
```

The integration tests start a local Parse Server test environment through `test/hooks.js`. Keep tests isolated and avoid depending on external services.

## Pull Requests

1. Fork the repository.
2. Create a focused branch.
3. Add or update tests for behavior changes.
4. Run `bun run ci` before opening the pull request.
5. Describe the user-facing behavior change and any migration notes.

## Code Style

- Follow the existing TypeScript style and exported API shape.
- Keep public behavior backward compatible unless the change is intentionally breaking.
- Prefer small, readable changes over broad refactors.
- Do not commit generated coverage, logs, package tarballs, or local environment files.

## License

By contributing, you agree that your contributions will be licensed under the project's ISC License.
