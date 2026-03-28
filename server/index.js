require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');
const { Client: SSHClient } = require('ssh2');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');

const multer = require('multer');
const { exec, spawn } = require('child_process');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

const PORT = process.env.PORT || 3001;
const FTP_DIR = process.env.FTP_DIR || path.join(__dirname, '..', 'downloads');
const VENV_DIR = process.env.VENV_DIR || path.join(__dirname, '..', '.venv');
const OVPN_DIR = process.env.OVPN_DIR || path.join(__dirname, '..', '.ovpn');
const TOOLS_DIR = process.env.TOOLS_DIR || path.join(__dirname, '..', '.tools');

// Ensure directories exist
[FTP_DIR, OVPN_DIR, TOOLS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Multer config for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.ovpn') cb(null, OVPN_DIR);
    else if (ext === '.sh') cb(null, TOOLS_DIR);
    else cb(null, FTP_DIR);
  },
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// VPN Status
let vpnProcess = null;

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Dosya seçilmedi' });
  res.json({ message: 'Dosya başarıyla yüklendi', filename: req.file.filename });
});

// VPN Endpoints
app.get('/api/vpn/status', (req, res) => {
  exec('ip addr show tun0', (err, stdout) => {
    res.json({ active: !err, info: stdout || 'Bağlantı yok' });
  });
});

app.post('/api/vpn/connect', (req, res) => {
  const { config } = req.body;
  if (!config) return res.status(400).json({ error: 'Config dosyası seçilmedi' });
  
  const configPath = path.join(OVPN_DIR, config);
  if (vpnProcess) vpnProcess.kill();

  vpnProcess = spawn('openvpn', ['--config', configPath], { detached: true });
  vpnProcess.unref();

  res.json({ message: 'VPN bağlantısı başlatıldı' });
});

app.post('/api/vpn/disconnect', (req, res) => {
  exec('pkill openvpn', () => {
    vpnProcess = null;
    res.json({ message: 'VPN bağlantısı kesildi' });
  });
});

// Burp Endpoints
app.get('/api/burp/status', (req, res) => {
  const installed = fs.existsSync(path.join(TOOLS_DIR, 'burp', 'BurpSuiteCommunity'));
  res.json({ installed });
});

app.post('/api/burp/install', (req, res) => {
  const { file } = req.body;
  const filePath = path.join(TOOLS_DIR, file);
  const installPath = path.join(TOOLS_DIR, 'burp');
  
  if (!fs.existsSync(installPath)) fs.mkdirSync(installPath);
  
  const proc = spawn('bash', [filePath, '--prefix', installPath, '--mode', 'unattended']);
  proc.on('close', () => res.json({ message: 'Kurulum tamamlandı' }));
});

app.post('/api/burp/run', (req, res) => {
  spawn('sh', [path.join(TOOLS_DIR, 'burp', 'BurpSuiteCommunity')], {
    env: { ...process.env, DISPLAY: ':1' },
    detached: true
  }).unref();
  res.json({ message: 'Burp Suite başlatıldı' });
});

// FTP/Downloads watcher
const ftpWatcher = chokidar.watch(FTP_DIR, {
  ignored: /(^|[/\\])\../,
  persistent: true,
  ignoreInitial: false
});

function buildFileTree(dir) {
  const result = [];
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        result.push({ name: item, type: 'dir', path: fullPath, children: buildFileTree(fullPath) });
      } else {
        result.push({ name: item, type: 'file', path: fullPath, size: stat.size, modified: stat.mtime });
      }
    }
  } catch (e) {}
  return result;
}

ftpWatcher.on('all', (event, filePath) => {
  const tree = buildFileTree(FTP_DIR);
  io.emit('ftp:update', { tree, event, path: filePath });
});

// File list for specific types (ovpn, sh)
app.get('/api/files/:type', (req, res) => {
  const { type } = req.params;
  const dir = type === 'ovpn' ? OVPN_DIR : type === 'sh' ? TOOLS_DIR : FTP_DIR;
  try {
    const files = fs.readdirSync(dir).filter(f => f.endsWith(`.${type}`));
    res.json({ files });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Environment info
app.get('/api/env', (req, res) => {
  res.json({
    venvDir: VENV_DIR,
    ftpDir: FTP_DIR,
    ovpnDir: OVPN_DIR,
    toolsDir: TOOLS_DIR,
    venvExists: fs.existsSync(VENV_DIR),
    platform: process.platform,
    responderPath: process.env.RESPONDER_PATH || '',
    johnPath: process.env.JOHN_PATH || '',
    novncPort: process.env.NOVNC_PORT || '6080',
    desktopEnv: process.env.DESKTOP_ENV || 'xfce'
  });
});

// Active terminal sessions
const terminals = {};
const sshSessions = {};

io.on('connection', (socket) => {
  console.log('[+] Client bağlandı:', socket.id);

  // --- Local PTY Terminal ---
  socket.on('terminal:create', ({ id, shell, venv }) => {
    let shellCmd = shell || process.env.SHELL || '/bin/bash';
    let env = { ...process.env, TERM: 'xterm-256color' };

    if (venv && fs.existsSync(path.join(VENV_DIR, 'bin', 'activate'))) {
      shellCmd = '/bin/bash';
      env.PATH = path.join(VENV_DIR, 'bin') + ':' + env.PATH;
      env.VIRTUAL_ENV = VENV_DIR;
    }

    try {
      const term = pty.spawn(shellCmd, [], {
        name: 'xterm-256color',
        cols: 80,
        rows: 24,
        cwd: process.env.HOME || '/root',
        env
      });

      terminals[id] = term;

      term.onData((data) => {
        socket.emit(`terminal:data:${id}`, data);
      });

      term.onExit(() => {
        socket.emit(`terminal:exit:${id}`);
        delete terminals[id];
      });

      socket.emit(`terminal:ready:${id}`);
    } catch (e) {
      socket.emit(`terminal:error:${id}`, e.message);
    }
  });

  socket.on('terminal:write', ({ id, data }) => {
    if (terminals[id]) terminals[id].write(data);
  });

  socket.on('terminal:resize', ({ id, cols, rows }) => {
    if (terminals[id]) terminals[id].resize(cols, rows);
  });

  socket.on('terminal:close', ({ id }) => {
    if (terminals[id]) {
      terminals[id].kill();
      delete terminals[id];
    }
  });

  // --- SSH Terminal ---
  socket.on('ssh:connect', ({ id, host, port, username, password, privateKey }) => {
    const conn = new SSHClient();
    sshSessions[id] = conn;

    conn.on('ready', () => {
      socket.emit(`ssh:ready:${id}`);
      conn.shell({ term: 'xterm-256color', cols: 80, rows: 24 }, (err, stream) => {
        if (err) {
          socket.emit(`ssh:error:${id}`, err.message);
          return;
        }
        stream.on('data', (data) => {
          socket.emit(`terminal:data:${id}`, data.toString());
        });
        stream.on('close', () => {
          socket.emit(`terminal:exit:${id}`);
          conn.end();
          delete sshSessions[id];
        });
        socket.on(`terminal:write`, ({ id: writeId, data }) => {
          if (writeId === id && stream.writable) stream.write(data);
        });
        socket.on(`terminal:resize`, ({ id: resizeId, cols, rows }) => {
          if (resizeId === id) stream.setWindow(rows, cols, 0, 0);
        });
      });
    });

    conn.on('error', (err) => {
      socket.emit(`ssh:error:${id}`, err.message);
      delete sshSessions[id];
    });

    const connectConfig = { host, port: port || 22, username, readyTimeout: 10000 };
    if (privateKey) connectConfig.privateKey = privateKey;
    else connectConfig.password = password;

    conn.connect(connectConfig);
  });

  socket.on('disconnect', () => {
    console.log('[-] Client ayrıldı:', socket.id);
    // cleanup handled per terminal
  });
});

server.listen(PORT, () => {
  console.log(`╔════════════════════════════════════╗`);
  console.log(`║  HackTool Basic Server - :${PORT}     ║`);
  console.log(`╚════════════════════════════════════╝`);
  console.log(`FTP Dizini: ${FTP_DIR}`);
});
