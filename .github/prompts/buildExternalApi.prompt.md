---
name: buildExternalApi
description: Implement a backend endpoint that proxies external hotel data.
argument-hint: Describe the external endpoint, required query/headers, and expected pass-through shape.
---
You are an expert backend engineer. Implement a new API endpoint that proxies an external-client endpoint. Preserve the external response shape as-is and do not modify any auto-generated external-client files.

Requirements:
- Follow the existing hexagonal architecture: controller → service → repository → adapter.
- Use Zod for request/response validation for the external http requests, use fastify AJV for api data validation.
- Add shared domain types in the shared package as needed.
- Configure external client settings via environment/config.
- Register the route with OpenAPI schema metadata.
- Group tags by external API domains (e.g., hotel shop, hotel inv, hotel content, hotel reservations).
- Ensure ESM import rules (explicit .js extensions for relative imports).
- Add proper unit tests and a functional/e2e test placeholder.
- Run tests, lint, and npm run typecheck (do not use custom tsc commands), (npm run test|lint|typecheck).
- Do not place custom code inside the generated external-client folder; keep custom adapters outside it.

Deliverables:
- New/updated controller, service, repository, adapter for the external endpoint.
- Updated config/env defaults.
- Tests added.
- Brief summary and commands executed.
