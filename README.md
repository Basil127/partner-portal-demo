# Partner Portal Demo

A Demo of a B2B Partner portal for booking management

## 🏗️ Architecture

This is a fullstack TypeScript application with:

- **Backend**: Fastify with Hexagonal Architecture (Modular Monolith)
- **Frontend**: Next.js with React
- **Database**: PostgreSQL / SQLite support
- **API**: RESTful with OpenAPI specification

## 📁 Project Structure

```
partner-portal-demo/
├── app/
│   ├── backend/              # Fastify backend
│   │   ├── src/
│   │   │   ├── domain/       # Domain models and interfaces
│   │   │   ├── application/  # Application services (business logic)
│   │   │   └── infrastructure/
│   │   │       ├── adapters/     # Database, HTTP, Logger adapters
│   │   │       ├── controllers/  # HTTP controllers
│   │   │       ├── repositories/ # Repository implementations
│   │   │       └── config/       # Configuration
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend/             # Next.js frontend
│       ├── src/
│       │   ├── app/          # Next.js app directory
│       │   ├── components/   # React components
│       │   └── lib/          # API client and utilities
│       ├── package.json
│       └── tsconfig.json
├── openapi/
│   └── openapi.yaml          # OpenAPI 3.0 specification
├── tests/
│   ├── unit/                 # Unit tests
│   ├── functional/           # Functional tests
│   └── e2e/                  # End-to-end tests
├── development.env           # Development environment variables
├── test.env                  # Test environment variables
├── package.json              # Root package with workspaces
├── tsconfig.json             # Shared TypeScript config
├── .eslintrc.json            # ESLint configuration
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

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
npm run test:unit        # Unit tests
npm run test:functional  # Functional tests
npm run test:e2e         # End-to-end tests
```

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

## 📚 API Documentation

The API follows RESTful conventions and is documented using OpenAPI 3.0.

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

The backend follows hexagonal (ports and adapters) architecture:

- **Domain Layer**: Core business logic and domain models
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
