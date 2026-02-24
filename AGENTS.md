## Repository Structure
This is a monorepo containing a fullstack application with:
- A React Next.js frontend `app/frontend`
- A Node.js backend using Fastify `app/backend`
- A Python FastAPI mock API (called by Fastify) `app/mock-api`
- A PostgreSQL database

Application is dockerized using docker-compose, with separate services for the frontend, backend, mock API, and database.

OpenAPI 3 contracts are generated from the FastAPI mock API, and from the Fastify backend, and used to generate TypeScript types for the frontend and backend, ensuring type safety across the entire stack. 
Never override these generated code (`app/frontend/src/lib/api-client/*` and `app/backend/src/infrastructure/adapters/http/external-api/*`), as they will be overwritten on the next generation. 
Instead, use these generated types in your code to ensure type safety when calling the APIs.

Never import files between applications (e.g. from frontend to backend or vice versa). Each application should be self-contained and only communicate through the defined API contracts. 
This ensures a clear separation of concerns and makes it easier to maintain and scale the applications independently.

## Purpose of application
This is a demo application for a hotel management system. 
This will be used by booking agents partnered with the hotel to manage their bookings, inventory, and other hotel operations.
The application includes a dashboard for agents to view key metrics, manage their bookings, and interact with an AI assistant to help with various tasks.

## Running Application
Use npm run dev from the root of the repository to start the application in development mode. This will start all services (frontend, backend, mock API) (database should already be running on users pc).
After making changes to backend or mock API you need to regenerate the OpenAPI contracts and types by running `npm run openapi:generate` from the root of the repository.