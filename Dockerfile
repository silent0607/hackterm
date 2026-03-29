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
ENV _JAVA_AWT_WM_NONREPARENTING=1
ENV LIBGL_ALWAYS_SOFTWARE=1
ENV MOZ_ACCELERATED_CANVAS=0

# Install GUI Stack, Node.js, Python, and Hacking Tools
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    build-essential \
    python3 \
    python3-pip \
    python3-venv \
    # Minimal GUI Stack (Openbox instead of Xfce/GNOME)
    openbox \
    xvfb \
    x11vnc \
    novnc \
    websockify \
    x11-utils \
    x11-xserver-utils \
    # Tools
    nmap \
    john \
    git \
    netcat-traditional \
    iputils-ping \
    openvpn \
    firefox \
    firefox \
    dirb \
    && curl -L https://github.com/OJ/gobuster/releases/download/v3.6.0/gobuster_Linux_x86_64.tar.gz -o gobuster.tar.gz \
    && tar -xzf gobuster.tar.gz \
    && mv gobuster /usr/bin/gobuster \
    && rm gobuster.tar.gz \
    && apt-get install -y sqlmap \
    # Pre-cache apt for fast on-demand DE install
    && apt-get clean \
    && apt-get update \
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
rm -f /tmp/.X1-lock /tmp/.X2-lock\n\
dbus-daemon --system --fork\n\
# Start Displays\n\
Xvfb :1 -screen 0 1920x1080x24 &\n\
Xvfb :2 -screen 0 1920x1080x24 &\n\
\n\
# Function to wait for display\n\
wait_for_display() {\n\
  local disp=$1\n\
  for i in {1..30}; do\n\
    if xdpyinfo -display ":$disp" >/dev/null 2>&1; then return 0; fi\n\
    echo "Waiting for display :$disp..."\n\
    sleep 0.5\n\
  done\n\
  return 1\n\
}\n\
\n\
wait_for_display 1\n\
wait_for_display 2\n\
\n\
# Handle VNC Password\n\
mkdir -p /root/.vnc\n\
x11vnc -storepasswd ${ADMIN_PASS:-password} /root/.vnc/passwd\n\
\n\
# Set backgrounds and start window managers\n\
DISPLAY=:1 xsetroot -solid "#020617"\n\
DISPLAY=:2 xsetroot -solid "#0f172a"\n\
DISPLAY=:1 openbox-session &\n\
DISPLAY=:2 openbox-session &\n\
\n\
# Start VNC/Websockify for DISPLAY :1 (Port 6080)\n\
x11vnc -display :1 -rfbauth /root/.vnc/passwd -forever -shared -rfbport 5901 -bg -quiet -pointer_mode 1 -noxrecord -noxfixes -noxdamage &\n\
/usr/bin/python3 /usr/bin/websockify --web /usr/share/novnc 6080 localhost:5901 &\n\
\n\
# Start VNC/Websockify for DISPLAY :2 (Port 6081)\n\
x11vnc -display :2 -rfbauth /root/.vnc/passwd -forever -shared -rfbport 5902 -bg -quiet -pointer_mode 1 -noxrecord -noxfixes -noxdamage &\n\
/usr/bin/python3 /usr/bin/websockify --web /usr/share/novnc 6081 localhost:5902 &\n\
\n\
node server/index.js' > /app/entrypoint.sh \
    && chmod +x /app/entrypoint.sh

# Create .env for the container environment
RUN echo "VENV_DIR=/app/.venv\n\
FTP_DIR=/app/downloads\n\
TOOLS_DIR=/app/.tools\n\
OVPN_DIR=/app/.ovpn\n\
RESPONDER_PATH=/app/.tools/Responder\n\
JOHN_PATH=/usr/bin/john\n\
DESKTOP_PATH=\${DESKTOP_PATH:-/desktop}\n\
ADMIN_USER=\${ADMIN_USER:-admin}\n\
ADMIN_PASS=\${ADMIN_PASS:-password}\n\
SESSION_SECRET=\${SESSION_SECRET:-hackterm-secret-key}\n\
PORT=3001" > /app/server/.env

EXPOSE 3001 6080 6081

CMD ["/app/entrypoint.sh"]
