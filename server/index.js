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
const { exec, spawn, execSync } = require('child_process');

const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'password';
const SESSION_SECRET = process.env.SESSION_SECRET || 'hackterm-secret-key';
const SHORTCUTS_FILE = path.join(process.env.TOOLS_DIR || '/app/.tools', 'shortcuts.json');

const sessionMiddleware = session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, 
    maxAge: 24 * 60 * 60 * 1000 
  }
});

app.use(express.json());
app.use(cookieParser());
app.use(sessionMiddleware);

// Middleware to protect API
const authMiddleware = (req, res, next) => {
  if (req.session && req.session.authenticated) return next();
  res.status(401).json({ error: 'Unauthorized' });
};

// Login/Logout routes
app.post('/api/login', (req, res) => {
  const { user, pass } = req.body;
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    req.session.authenticated = true;
    req.session.user = user;
    return res.json({ success: true, user });
  }
  res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/me', (req, res) => {
  if (req.session && req.session.authenticated) {
    return res.json({ authenticated: true, user: req.session.user });
  }
  res.json({ authenticated: false });
});

// Protect all other API routes
app.use('/api', (req, res, next) => {
  if (req.path === '/login' || req.path === '/logout' || req.path === '/me') return next();
  authMiddleware(req, res, next);
});

// Protect static files
app.use((req, res, next) => {
  if (req.session && req.session.authenticated) return next();
  if (req.path === '/' || req.path.startsWith('/assets/')) return next();
  res.redirect('/');
});

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

// Notes Endpoints
const NOTES_FILE = path.join(TOOLS_DIR, 'notes.json');
app.get('/api/notes', (req, res) => {
  try {
    if (fs.existsSync(NOTES_FILE)) {
      res.json(JSON.parse(fs.readFileSync(NOTES_FILE)));
    } else {
      res.json([]);
    }
  } catch (e) {
    res.json([]);
  }
});
app.post('/api/notes', (req, res) => {
  fs.writeFileSync(NOTES_FILE, JSON.stringify(req.body.notes || []));
  res.json({ success: true });
});

// Packages & Firefox Endpoints
app.post('/api/packages/install', (req, res) => {
  const { action, pkg } = req.body;
  let cmd = '';
  if (action === 'update') cmd = 'apt-get update';
  else if (action === 'upgrade') cmd = 'apt-get update && apt-get upgrade -y';
  else if (action === 'install' && pkg) cmd = `apt-get update && apt-get install -y ${pkg}`;
  else return res.status(400).json({ error: 'Geçersiz parametre' });

  const proc = spawn('sh', ['-c', cmd], { env: { ...process.env, DEBIAN_FRONTEND: 'noninteractive' }});
  
  proc.stdout.on('data', data => io.emit('package:log', data.toString()));
  proc.stderr.on('data', data => io.emit('package:log', data.toString()));
  proc.on('close', code => io.emit('package:done', code));
  
  res.json({ message: 'İşlem başlatıldı...' });
});

app.post('/api/firefox/launch', (req, res) => {
  const { termId } = req.body;
  const proc = spawn('sh', ['-c', 'firefox --no-sandbox --disable-gpu'], {
    env: { ...process.env, DISPLAY: ':2' }
  });

  if (termId) {
    proc.stdout.on('data', data => io.emit(`terminal:data:${termId}`, `[Firefox STDOUT] ${data.toString()}`));
    proc.stderr.on('data', data => io.emit(`terminal:data:${termId}`, `[Firefox STDERR] ${data.toString()}`));
    proc.on('close', code => {
      io.emit(`terminal:data:${termId}`, `\n>>> Firefox durduruldu (kod: ${code}) <<<\n`);
    });
  }

  res.json({ message: 'Firefox başlatıldı (Display :2)' });
});

// Burp Endpoints
app.get('/api/burp/status', (req, res) => {
  const installed = fs.existsSync(path.join(TOOLS_DIR, 'burp', 'BurpSuiteCommunity'));
  res.json({ installed });
});

app.post('/api/burp/install', (req, res) => {
  const { file, termId } = req.body;
  const filePath = path.join(TOOLS_DIR, file);
  const installPath = path.join(TOOLS_DIR, 'burp');
  
  if (!fs.existsSync(installPath)) fs.mkdirSync(installPath, { recursive: true });
  
  const env = { ...process.env };
  delete env.DISPLAY;
  
  const proc = spawn('bash', [filePath, '-q', '-dir', installPath], {
    env,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  if (termId) {
    proc.stdout.on('data', data => io.emit(`terminal:data:${termId}`, data.toString()));
    proc.stderr.on('data', data => io.emit(`terminal:data:${termId}`, data.toString()));
    proc.on('close', code => {
      io.emit(`terminal:data:${termId}`, `\n>>> Burp Suite kurulum tamamlandı (kod: ${code}) <<<\n`);
      io.emit('package:done', code);
    });
  } else {
    proc.stdout.on('data', data => io.emit('package:log', data.toString()));
    proc.on('close', code => io.emit('package:done', code));
  }
  
  res.json({ message: 'Burp Suite kurulumu başlatıldı... Logları terminalden takip edebilirsiniz.' });
});

app.post('/api/burp/run', (req, res) => {
  const { termId } = req.body;
  const burpPath = path.join(TOOLS_DIR, 'burp', 'BurpSuiteCommunity');
  if (!fs.existsSync(burpPath)) {
    return res.status(404).json({ error: 'Burp Suite bulunamadı. Lütfen önce kurulum yapın.' });
  }

  const proc = spawn('sh', [burpPath], {
    env: { ...process.env, DISPLAY: ':1' }
  });

  if (termId) {
    proc.stdout.on('data', data => io.emit(`terminal:data:${termId}`, `[Burp STDOUT] ${data.toString()}`));
    proc.stderr.on('data', data => io.emit(`terminal:data:${termId}`, `[Burp STDERR] ${data.toString()}`));
    proc.on('close', code => {
      io.emit(`terminal:data:${termId}`, `\n>>> Burp Suite durduruldu (kod: ${code}) <<<\n`);
    });
  }

  res.json({ message: 'Burp Suite başlatıldı. Logları takip edebilirsiniz.' });
});

// FTP/Downloads watcher
const ftpWatcher = chokidar.watch(FTP_DIR, {
  ignored: /(^|[/\\])\../,
  persistent: true,
  ignoreInitial: false
});

app.get('/api/ftp/tree', (req, res) => {
  res.json({ tree: buildFileTree(FTP_DIR) });
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
    desktopPath: process.env.DESKTOP_PATH || '/desktop'
  });
});

// Desktop Management
app.get('/api/desktop/status', (req, res) => {
  const xfceInstalled = fs.existsSync('/usr/bin/startxfce4');
  const gnomeInstalled = fs.existsSync('/usr/bin/gnome-session');
  res.json({ xfce: xfceInstalled, gnome: gnomeInstalled });
});

app.post('/api/desktop/install', (req, res) => {
  const { type, termId } = req.body;
  let cmd = '';
  if (type === 'xfce') cmd = 'apt-get update && apt-get install -y xfce4 xfce4-goodies';
  else if (type === 'gnome') cmd = 'apt-get update && apt-get install -y gnome-session-flashback gnome-terminal nautilus';
  
  if (!cmd) return res.status(400).json({ error: 'Geçersiz masaüstü ortamı' });

  const proc = spawn('sh', ['-c', cmd], { env: { ...process.env, DEBIAN_FRONTEND: 'noninteractive' }});
  
  if (termId) {
    proc.stdout.on('data', (data) => io.emit(`terminal:data:${termId}`, data.toString()));
    proc.stderr.on('data', (data) => io.emit(`terminal:data:${termId}`, data.toString()));
    proc.on('close', (code) => {
      io.emit(`terminal:data:${termId}`, `\n>>> Kurulum tamamlandı (kod: ${code}) <<<\n`);
    });
  }

  res.json({ message: 'Kurulum başlatıldı. Terminalden takip edebilirsiniz.' });
});

// Hacking Tools Market (Paket Market)
const toolsConfig = {
  nc: { check: () => { try { execSync('which nc'); return true; } catch{ return false; } }, cmd: 'apt-get update && apt-get install -y netcat-traditional' },
  mysql: { check: () => { try { execSync('which mysql'); return true; } catch{ return false; } }, cmd: 'apt-get update && apt-get install -y default-mysql-client' },
  john: { check: () => { try { execSync('which john'); return true; } catch{ return false; } }, cmd: 'apt-get update && apt-get install -y john' },
  hashcat: { check: () => { try { execSync('which hashcat'); return true; } catch{ return false; } }, cmd: 'apt-get update && apt-get install -y hashcat' },
  awscli: { check: () => { try { execSync('which aws'); return true; } catch{ return false; } }, cmd: 'apt-get update && apt-get install -y awscli' },
  impacket: { check: () => fs.existsSync('/app/.venv/bin/impacket-psexec'), cmd: '/app/.venv/bin/pip install impacket' },
  evilwinrm: { check: () => { try { execSync('which evil-winrm'); return true; } catch{ return false; } }, cmd: 'apt-get update && apt-get install -y ruby ruby-dev && gem install evil-winrm' },
  smbclient: { check: () => { try { execSync('which smbclient'); return true; } catch{ return false; } }, cmd: 'apt-get update && apt-get install -y smbclient' },
  responder: { check: () => fs.existsSync('/app/.tools/Responder/Responder.py'), cmd: 'git clone https://github.com/lgandx/Responder.git /app/.tools/Responder || (cd /app/.tools/Responder && git pull)' }
};

app.get('/api/market/status', (req, res) => {
  const status = {};
  for (const [tool, config] of Object.entries(toolsConfig)) {
    status[tool] = config.check();
  }
  res.json(status);
});

app.post('/api/market/install', (req, res) => {
  const { tool, termId } = req.body;
  if (!toolsConfig[tool]) return res.status(400).json({ error: 'Bilinmeyen araç' });

  const cmd = toolsConfig[tool].cmd;
  const proc = spawn('sh', ['-c', cmd], { env: { ...process.env, DEBIAN_FRONTEND: 'noninteractive' }});
  
  if (termId) {
    proc.stdout.on('data', (data) => io.emit(`terminal:data:${termId}`, data.toString()));
    proc.stderr.on('data', (data) => io.emit(`terminal:data:${termId}`, data.toString()));
    proc.on('close', (code) => {
      io.emit(`terminal:data:${termId}`, `\n>>> [${tool}] Kurulumu tamamlandı (kod: ${code}) <<<\n`);
    });
  }

  res.json({ message: 'Kurulum başlatıldı. Terminalden takip edebilirsiniz.' });
});

// Shortcut Management
app.get('/api/shortcuts', (req, res) => {
  if (fs.existsSync(SHORTCUTS_FILE)) {
    try {
      const data = fs.readFileSync(SHORTCUTS_FILE, 'utf8');
      return res.json(JSON.parse(data));
    } catch (e) {
      return res.json({});
    }
  }
  res.json({});
});

app.post('/api/shortcuts', (req, res) => {
  const shortcuts = req.body;
  try {
    fs.writeFileSync(SHORTCUTS_FILE, JSON.stringify(shortcuts, null, 2));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Kaydedilirken hata oluştu' });
  }
});

// Active terminal sessions & output buffers
const terminals = {};
const terminalBuffers = {}; // id -> string buffer
const sshSessions = {};
const MAX_BUFFER_SIZE = 10000;

function addToBuffer(id, data) {
  if (!terminalBuffers[id]) terminalBuffers[id] = '';
  terminalBuffers[id] += data;
  if (terminalBuffers[id].length > MAX_BUFFER_SIZE) {
    terminalBuffers[id] = terminalBuffers[id].slice(-MAX_BUFFER_SIZE);
  }
}

// Share session with socket.io
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

io.on('connection', (socket) => {
  const session = socket.request.session;
  if (!session || !session.authenticated) {
    console.log('[!] Yetkisiz socket bağlantısı:', socket.id);
    socket.disconnect();
    return;
  }
  console.log('[+] Client bağlandı:', socket.id, 'User:', session.user);

  // --- Local PTY Terminal ---
  socket.on('terminal:create', ({ id, shell, venv }) => {
    // If terminal already exists, just re-attach
    if (terminals[id]) {
      console.log(`[PTY] Re-attaching to existing terminal: ${id}`);
      // Send history if exists
      if (terminalBuffers[id]) {
        socket.emit(`terminal:data:${id}`, terminalBuffers[id]);
      }
      socket.emit(`terminal:ready:${id}`);
      return;
    }

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
        cwd: '/app',
        env
      });

      terminals[id] = term;

      term.onData((data) => {
        addToBuffer(id, data);
        io.emit(`terminal:data:${id}`, data);
      });

      term.onExit(() => {
        io.emit(`terminal:exit:${id}`);
        delete terminals[id];
        delete terminalBuffers[id];
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
      delete terminalBuffers[id];
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
