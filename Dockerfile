# Stage 1: Build the React frontend
FROM node:20-slim AS builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Runtime environment with GUI & Security Tools
FROM ubuntu:22.04

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive
ENV HOME=/root
ENV DISPLAY=:1
ENV VNC_PORT=5901
ENV NO_VNC_PORT=6080

# Install GUI Stack, Node.js, Python, and Hacking Tools
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    build-essential \
    python3 \
    python3-pip \
    python3-venv \
    # GUI Stacks
    xfce4 \
    xfce4-goodies \
    gnome-session \
    gnome-terminal \
    nautilus \
    xvfb \
    x11vnc \
    novnc \
    websockify \
    # Tools
    nmap \
    john \
    git \
    netcat-traditional \
    iputils-ping \
    openvpn \
    firefox \
    # Cleanup
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Setup directories
RUN mkdir -p downloads .tools .ovpn

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

# Startup script to handle Xvfb, VNC, and Node server
RUN echo '#!/bin/bash\n\
rm -f /tmp/.X1-lock\n\
Xvfb :1 -screen 0 1920x1080x24 &\n\
sleep 2\n\
if [ "$DESKTOP_ENV" = "gnome" ]; then\n\
    export XDG_CURRENT_DESKTOP=GNOME\n\
    gnome-session --session=gnome-flashback-metacity &\n\
else\n\
    startxfce4 &\n\
fi\n\
x11vnc -display :1 -nopw -forever -noxdamage -bg &\n\
/usr/share/novnc/utils/launch.sh --vnc localhost:5901 --listen 6080 &\n\
node server/index.js' > /app/entrypoint.sh \
    && chmod +x /app/entrypoint.sh

# Create .env for the container environment
RUN echo "VENV_DIR=/app/.venv\n\
FTP_DIR=/app/downloads\n\
TOOLS_DIR=/app/.tools\n\
OVPN_DIR=/app/.ovpn\n\
RESPONDER_PATH=/app/.tools/Responder\n\
JOHN_PATH=/usr/bin/john\n\
DESKTOP_ENV=\${DESKTOP_ENV:-xfce}\n\
PORT=3001" > /app/server/.env

EXPOSE 3001 6080

CMD ["/app/entrypoint.sh"]
