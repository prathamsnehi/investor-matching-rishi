FROM python:3.13-slim

RUN apt-get update && apt-get install -y libatomic1 && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir uv

WORKDIR /app

COPY pyproject.toml ./
COPY uv.lock ./

RUN uv sync 

ENV PATH="/app/.venv/bin:$PATH"

COPY . .

RUN uv run prisma generate --schema=prisma_db/schema.prisma

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "src_api.main:app", "--host", "0.0.0.0", "--port", "8000"]