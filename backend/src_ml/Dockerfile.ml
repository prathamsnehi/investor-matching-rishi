FROM python:3.11-slim

RUN apt-get update && apt-get install -y libatomic1 && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir uv

WORKDIR /app

COPY src_ml/pyproject.toml ./pyproject.toml
COPY src_ml/uv.lock ./uv.lock

RUN uv sync 

ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONPATH=/app

COPY config/ /app/config/
COPY prisma_db/ /app/prisma_db/

RUN uv run prisma generate --schema=prisma_db/schema.prisma

COPY src_ml/ /app/src_ml/

EXPOSE 8000

CMD ["uvicorn", "src_ml.api_gateway:app", "--host", "0.0.0.0", "--port", "8000"]