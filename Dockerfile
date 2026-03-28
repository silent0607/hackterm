# Stage 1: Build the React frontend
FROM node:20-slim AS builder

WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Runtime environment with Ubuntu
FROM ubuntu:22.04

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Install Node.js, Python, and Hacking Tools
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    build-essential \
    python3 \
    python3-pip \
    python3-venv \
    nmap \
    john \
    git \
    netcat-traditional \
    iputils-ping \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Setup directories
RUN mkdir -p downloads .tools

# Copy server files
COPY package*.json ./
RUN npm install --production

# Copy built client
COPY --from=builder /app/client/dist ./client/dist
COPY server/ ./server/

# Setup Python environment
RUN python3 -m venv /app/.venv \
    && /app/.venv/bin/pip install --upgrade pip \
    && /app/.venv/bin/pip install impacket

# Create .env for the container environment
RUN echo "VENV_DIR=/app/.venv\n\
FTP_DIR=/app/downloads\n\
TOOLS_DIR=/app/.tools\n\
RESPONDER_PATH=/app/.tools/Responder\n\
JOHN_PATH=/usr/bin/john\n\
PORT=3001" > /app/server/.env

EXPOSE 3001

CMD ["node", "server/index.js"]
