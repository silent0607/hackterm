#!/bin/bash
# HackTool Basic - Kurulum Scripti
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/.venv"
TOOLS_DIR="$SCRIPT_DIR/.tools"
FTP_DIR="$SCRIPT_DIR/downloads"

echo "╔════════════════════════════════════╗"
echo "║     HackTool Basic - Kurulum       ║"
echo "╚════════════════════════════════════╝"

# FTP/Downloads dizini oluştur
mkdir -p "$FTP_DIR"
echo "[✓] FTP/Downloads dizini: $FTP_DIR"

# Python venv oluştur
if [ ! -d "$VENV_DIR" ]; then
  echo "[*] Python sanal ortamı oluşturuluyor..."
  python3 -m venv "$VENV_DIR"
  echo "[✓] Sanal ortam oluşturuldu: $VENV_DIR"
else
  echo "[✓] Sanal ortam zaten mevcut: $VENV_DIR"
fi

# pip güncelle
"$VENV_DIR/bin/pip" install --upgrade pip -q
echo "[✓] pip güncellendi"

# Impacket kur
if ! "$VENV_DIR/bin/python3" -c "import impacket" 2>/dev/null; then
  echo "[*] Impacket kuruluyor..."
  "$VENV_DIR/bin/pip" install impacket -q
  echo "[✓] Impacket kuruldu"
else
  echo "[✓] Impacket zaten kurulu"
fi

# Araç yolları (tools dizini)
mkdir -p "$TOOLS_DIR"

# Responder kontrolü
if [ -d "/opt/Responder" ]; then
  RESPONDER_PATH="/opt/Responder"
elif [ -d "$HOME/Responder" ]; then
  RESPONDER_PATH="$HOME/Responder"
else
  RESPONDER_PATH=""
fi

# John kontrolü
JOHN_PATH=$(which john 2>/dev/null || echo "")

# env dosyası oluştur
cat > "$SCRIPT_DIR/server/.env" << EOF
VENV_DIR=$VENV_DIR
FTP_DIR=$FTP_DIR
TOOLS_DIR=$TOOLS_DIR
RESPONDER_PATH=$RESPONDER_PATH
JOHN_PATH=$JOHN_PATH
PORT=3001
EOF

echo "[✓] Ortam değişkenleri: $SCRIPT_DIR/server/.env"
echo ""
echo "╔════════════════════════════════════╗"
echo "║         Kurulum Tamamlandı!        ║"
echo "╚════════════════════════════════════╝"
echo "Başlatmak için: npm run dev"
