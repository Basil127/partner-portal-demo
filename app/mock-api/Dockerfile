FROM ghcr.io/astral-sh/uv:0.9.12 AS uv

# -----------------------------------
# STAGE 1: prod stage
# Only install main dependencies
# -----------------------------------
FROM python:3.13-slim AS prod

# Runtime system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends libffi-dev && rm -rf /var/lib/apt/lists/*

ENV UV_COMPILE_BYTECODE=0
ENV UV_LINK_MODE=copy
ENV UV_PROJECT_ENVIRONMENT=/usr/local
ENV UV_PYTHON_DOWNLOADS=never
ENV UV_NO_MANAGED_PYTHON=1

WORKDIR /app/src

# Install dependencies: add build tools, sync, then remove build tools
RUN --mount=from=uv,source=/uv,target=/bin/uv \
    --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=app/mock-api/uv.lock,target=uv.lock \
    --mount=type=bind,source=app/mock-api/pyproject.toml,target=pyproject.toml \
    apt-get update && apt-get install -y --no-install-recommends build-essential && \
    uv sync --locked --no-install-project --no-dev && \
    apt-get purge -y --auto-remove build-essential && \
    rm -rf /var/lib/apt/lists/*

COPY app/mock-api .

RUN --mount=from=uv,source=/uv,target=/bin/uv \
    --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev

CMD ["python", "-m", "operaclone2"]

# -----------------------------------
# STAGE 3: development build
# Includes dev dependencies
# -----------------------------------
FROM prod AS dev

RUN --mount=from=uv,source=/uv,target=/bin/uv \
    --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --all-groups
