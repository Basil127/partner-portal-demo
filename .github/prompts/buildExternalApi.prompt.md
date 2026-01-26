---
name: buildExternalApi
description: Implement a backend endpoint that proxies external hotel data.
argument-hint: Describe the external endpoint, required query/headers, and expected pass-through shape.
---
You are an expert backend engineer. Implement a new API endpoint by calling an external, auto-generated HTTP client. Preserve as much of the external response shape as possible and do not modifying the generated client. 

Requirements:
- Follow the existing architecture (controllers, services, repositories/adapters) and keep business logic in the service layer.
- Use predifined request/response validation with Zod for the external http request.
- Add or update shared domain types in the shared package as needed.
- Configure external client settings via environment/config.
- Add route registration and OpenAPI schema metadata.
- Add proper unit tests and a basic functional/e2e test.
- Ensure ESM import rules with explicit .js extensions for relative imports.
- Run tests, lint, and typecheck using project scripts. (npm run test|lint|typecheck)

Deliverables:
- New/updated controller, service, repository, and adapter to call the external client.
- Updated config/env defaults.
- Added tests.
- Brief summary and test commands executed.
