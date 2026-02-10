**Technology Stack:**
- Python 3.13
- FastAPI
- SQLAlchemy
- Alembic
  - do not confuse with Alembic versions, we use latest Alembic version compatible with SQLAlchemy 2.x
  - for migrations run the alembic commands from README.md then update if needed which will be stored in operaclone2/db/migrations
- PostgreSQL
- Docker & Docker Compose
- Pydantic
- Uvicorn
- uv (Astral UV framework)
  - for package management and running the project
  - **Always Use `.\.venv\Scripts\activate`** to activate virtual environment
- Ruff: for linting and formating
  - **Always apply before handing back to user**
  - use `uv run ruff check --fix` to auto fix issues
  - use `uv run ruff format` to format code
- MyPy for type checking
  - use `mypy operaclone2` to check types

Keep domain logic separate from web handlers
- all domain logic should be in separate services called from web handlers

