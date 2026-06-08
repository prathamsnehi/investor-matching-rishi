FROM python:3.11-slim

RUN pip install --no-cache-dir uv

WORKDIR /src_ml

COPY pyproject.toml ./
COPY uv.lock ./

ENV UV_PROJECT_ENVIRONMENT=/usr/local

RUN uv sync 

COPY . .

EXPOSE 8000

CMD ["uvicorn", "api_gateway:app", "--host", "0.0.0.0", "--port", "8000"]