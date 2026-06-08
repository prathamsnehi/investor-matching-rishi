FROM python:3.13-slim

RUN pip install --no-cache-dir uv

WORKDIR /app

COPY pyproject.toml ./
COPY uv.lock ./

RUN uv sync 

ENV PATH="/app/.venv/bin:$PATH"

COPY . .

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "backend.src.main:app", "--host", "0.0.0.0", "--port", "8000"]