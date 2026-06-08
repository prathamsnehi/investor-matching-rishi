FROM python:3.13-slim

RUN pip install --no-cache-dir uv

WORKDIR /src_ml

COPY pyproject.toml ./

ENV UV_PROJECT_ENVIRONMENT=/usr/local

RUN uv sync 

COPY . .

EXPOSE 8001