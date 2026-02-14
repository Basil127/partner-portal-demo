This is a monorepo containing a fullstack application with:
- A React Next.js frontend
- A Node.js backend using Fastify
- A Python FastAPI external API (called by Fastify)
- A PostgreSQL database

Application is dockerized using docker-compose, with separate services for the frontend, backend, external API, and database.

OpenAPI 3 contracts are generated from the FastAPI external API, and from the Fastify backend, and used to generate TypeScript types for the frontend and backend, ensuring type safety across the entire stack. 
Never override these generated code (`app/frontend/src/lib/api-client/*` and `app/backend/src/infrastructure/adapters/http/external-api/*`), as they will be overwritten on the next generation. 
Instead, use these generated types in your code to ensure type safety when calling the APIs.

Never import files between applications (e.g. from frontend to backend or vice versa). Each application should be self-contained and only communicate through the defined API contracts. 
This ensures a clear separation of concerns and makes it easier to maintain and scale the applications independently.
