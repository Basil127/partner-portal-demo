# Partner Portal Demo

A Demo of a B2B Partner portal for booking management

## 🏗️ Architecture

This is a fullstack TypeScript application with a modern ESM-first approach:

- **Backend**: Fastify with Hexagonal Architecture (Modular Monolith)
- **Frontend**: Next.js with React (App Router)
- **Shared Package**: `@partner-portal/shared` for central domain types and utilities
- **Database**: PostgreSQL / SQLite support via adapters
- **API**: OpenAPI 3.1.0 specification with automated generation and merging logic

## 📁 Project Structure

```
partner-portal-demo/
├── app/
│   ├── backend/              # Fastify backend (ESM)
│   │   ├── src/
│   │   │   ├── domain/       # Domain models and interfaces
│   │   │   ├── application/  # Application services (business logic)
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/     # Database, HTTP, Logger adapters
│   │   │   │   ├── controllers/  # HTTP controllers
│   │   │   │   ├── repositories/ # Repository implementations
│   │   │   │   └── config/       # Configuration
│   │   │   └── scripts/      # Automation scripts (OpenAPI generation)
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend/             # Next.js frontend (ESM)
│       ├── src/
│       │   ├── app/          # Next.js app directory (App Router)
│       │   ├── components/   # React components
│       │   └── lib/          # API client and utilities
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── shared/               # Shared TypeScript types and utilities
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── openapi/
│   ├── openapi.yaml          # Final merged OpenAPI 3.0 specification
│   └── openapi-additional.yaml # Manual OpenAPI overrides/details
├── tests/
│   ├── unit/                 # Unit tests (ESM compatible)
│   ├── functional/           # Functional tests
│   └── e2e/                  # End-to-end tests
├── development.env           # Development environment variables
├── test.env                  # Test environment variables
├── package.json              # Root package with workspaces (ESM)
├── tsconfig.json             # Root TypeScript config (ES2024, nodenext)
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 22.0.0
- npm >= 10.0.0

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Basil127/partner-portal-demo.git
cd partner-portal-demo
```

2. Install dependencies:
```bash
npm install
```

This will install dependencies for the root project and all workspaces (backend and frontend).

### Running the Application

#### Development Mode

Run both frontend and backend concurrently:
```bash
npm run dev
```

Or run them separately:

Backend only:
```bash
npm run dev:backend
```

Frontend only:
```bash
npm run dev:frontend
```

#### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/docs
- **Health Check**: http://localhost:3001/health

### Building for Production

Build all workspaces:
```bash
npm run build
```

Or build individually:
```bash
npm run build:backend
npm run build:frontend
```

## 🧪 Testing

Run all tests:
```bash
npm test
```

Run specific test suites:
```bash
npm run test:unit        # Run backend unit tests
```

Note: The tests are organized in the `tests/` directory but are run through the backend workspace's Jest configuration. Functional and E2E test placeholders are provided for future implementation.

## 🔧 Configuration

### Environment Variables

The application uses two environment files:

- `development.env` - Used in development mode
- `test.env` - Used when running tests

Key configuration options:

#### Backend
- `NODE_ENV` - Environment (development, test, production)
- `PORT` - Backend server port (default: 3001)
- `HOST` - Backend server host (default: localhost)
- `DB_TYPE` - Database type (sqlite or postgres)
- `DB_PATH` - SQLite database path
- `LOG_LEVEL` - Logging level (debug, info, warn, error)

#### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL

### Database Configuration

The application supports both SQLite and PostgreSQL:

**SQLite (Default)**:
```env
DB_TYPE=sqlite
DB_PATH=./data/dev.db
```

**PostgreSQL**:
```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=partner_portal_dev
DB_USER=postgres
DB_PASSWORD=password
```

## 🤖 MCP Server

The backend exposes its hotel tools (content / reservations / shop lookups, plus `get_time`) over the **Model Context Protocol** using the Streamable HTTP transport at the `/mcp` endpoint. This lets MCP clients such as Claude Desktop call the same tools the in-app AI assistant uses.

### Access token

The `/mcp` endpoint is guarded by a simple shared secret (POC-grade, not real auth). Pass it as `Authorization: Bearer <token>` or an `x-mcp-token` header.

- **Default token:** `ohm-demo-mcp-poc-token`
- Override per deployment with the `MCP_AUTH_TOKEN` backend env var.

### Connecting Claude Desktop

The frontend only proxies `/api/*`, so `/mcp` is routed to the backend by Caddy directly (see `caddy/Caddyfile`). Add the server to `claude_desktop_config.json` (`%APPDATA%\Claude\claude_desktop_config.json` on Windows) using the `mcp-remote` bridge, then fully restart Claude Desktop:

```json
{
  "mcpServers": {
    "ohm-demo": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://hotel-b2b.zirora.com/mcp",
        "--header",
        "Authorization: Bearer ohm-demo-mcp-poc-token"
      ]
    }
  }
}
```

For local development point it at `http://localhost:3001/mcp` instead (requires the backend, mock-api, and database to be running).

## 📚 API Documentation

The API follows RESTful conventions and is documented using OpenAPI 3.0.

### OpenAPI Workflow

The documentation is managed as a "Source of Truth" from the backend code, enriched with additional manual metadata.

1.  **Backend Source**: Routes and schemas are automatically detected from the Fastify code.
2.  **Manual Overrides**: Additional details (security schemes, support info, tags) are defined in `openapi/openapi-additional.yaml`.
3.  **Merge & Generate**: Run the generation script to create the final `openapi/openapi.yaml`.

```bash
# From the backend directory
npm run generate:openapi
```

- OpenAPI Spec: `/openapi/openapi.yaml`
- Interactive Documentation: http://localhost:3001/docs

### Example API Endpoints

- `GET /health` - Health check
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get a booking by ID
- `POST /api/bookings` - Create a new booking
- `PUT /api/bookings/:id` - Update a booking
- `DELETE /api/bookings/:id` - Delete a booking

## 🏛️ Hexagonal Architecture

The backend follows hexagonal (ports and adapters) architecture, strictly typing the boundaries:

- **Domain Layer**: Core business logic and domain models (extending from `@partner-portal/shared`)
- **Application Layer**: Use cases and application services
- **Infrastructure Layer**: External concerns (database, HTTP, logging)

This architecture provides:
- Clear separation of concerns
- Easy testing through dependency injection
- Flexibility to swap implementations
- Protection of business logic from external changes

## 🛠️ Development Tools

### Linting

```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Fix linting errors
```

### Type Checking

```bash
npm run typecheck     # Run TypeScript type checking
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
