require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');
const { Client: SSHClient } = require('ssh2');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');

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

// Ensure downloads directory exists
if (!fs.existsSync(FTP_DIR)) fs.mkdirSync(FTP_DIR, { recursive: true });

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

// File read endpoint
app.get('/api/file', (req, res) => {
  const { path: filePath } = req.query;
  if (!filePath || !filePath.startsWith(FTP_DIR)) return res.status(403).json({ error: 'Erişim reddedildi' });
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    res.json({ content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// FTP tree endpoint
app.get('/api/ftp/tree', (req, res) => {
  res.json({ tree: buildFileTree(FTP_DIR) });
});

// Environment info
app.get('/api/env', (req, res) => {
  res.json({
    venvDir: VENV_DIR,
    ftpDir: FTP_DIR,
    venvExists: fs.existsSync(VENV_DIR),
    platform: process.platform,
    responderPath: process.env.RESPONDER_PATH || '',
    johnPath: process.env.JOHN_PATH || ''
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
