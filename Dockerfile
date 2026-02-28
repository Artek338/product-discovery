FROM python:3.12-slim

LABEL maintainer="Artek338" \
      description="Product Discovery — AI-powered product/service discovery toolkit"

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    && rm -rf /var/lib/apt/lists/*

# Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Project code
COPY . .
RUN pip install --no-cache-dir -e .

# Default entrypoint
ENTRYPOINT ["product-discovery"]
CMD ["--help"]
