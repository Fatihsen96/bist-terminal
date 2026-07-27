# Multi-stage Dockerfile for FinOS (Market Terminal)
# Stage 1: Build React Frontend & Node Gateway
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Python FastAPI + Node Express Environment
FROM python:3.11-slim
WORKDIR /app

# Install Node.js in Python container
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy python dependencies & install
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt || pip install --no-cache-dir fastapi uvicorn yfinance pandas numpy pydantic

# Copy build artifacts & application code
COPY --from=frontend-builder /app/dist ./dist
COPY --from=frontend-builder /app/node_modules ./node_modules
COPY package*.json ./
COPY server.ts ./
COPY main.py ./

EXPOSE 3000
EXPOSE 8000

# Start both FastAPI backend and Express Gateway via start script
CMD ["sh", "-c", "python main.py & node dist/server.cjs"]
