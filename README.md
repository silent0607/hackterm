# 🛡️ HackTerm (HackTool Basic) - Advanced Security Terminal

**HackTerm** is a professional penetration testing platform designed to automate security workflows, manage security tools from a centralized web dashboard, and run GUI-based hacking tools directly through your browser. 

Read this in [Turkish (Türkçe)](README-TR.md)

---

## ⚠️ Legal Disclaimer

> [!IMPORTANT]
> **IMPORTANT:** This tool is developed strictly for **ethical hacking**, security research, and legal penetration testing on systems you own or have explicit permission to test.
> *   Any use of this tool against unauthorized systems is strictly **illegal**.
> *   The developers and maintainers of this repository **cannot be held responsible** for any misuse, damage, or illegal activities conducted using this tool.

---

## 🔥 Key Features

*   **🌍 Bilingual Interface**: Full dynamic language support switching seamlessly between English and Turkish.
*   **🌐 Flexible Deployment**: Whether on your **own local computer** or hosted remotely on a **Cloud Server (VPS)**, you can effortlessly install it anywhere and securely conduct your penetration tests globally.
*   **🖥️ On-Demand Desktop Environment**: Starts incredibly fast with a minimal `Openbox` setup. You optionally install heavier environments like **Xfce** or **GNOME** dynamically *only when you need them* via the Settings menu.
*   **🐝 Web-Based GUI Tools (Burp Suite & Firefox)**: Easily launch and manage tools like Burp Suite and a pre-configured, proxy-ready Firefox directly in the browser through noVNC.
*   **🛡️ OpenVPN Integration**: Upload your `.ovpn` files directly from the UI to seamlessly encrypt and route all container traffic through your VPN tunnel (great for TryHackMe, HackTheBox, etc.).
*   **🐚 Interactive Terminal Manager**: Manage multiple `PTY` powered terminal tabs simultaneously with history and background process support.
*   **📁 Active Recon & Exploitation Modules**: Includes localized tooling interfaces for Nmap scans, FTP monitoring, Directory Busting (Gobuster), PHP Web Shell & Reverse Shell generation, Netcat listeners, and Responder.

---

## 🚀 Installation & Deployment

### 1. Clone the Repository
```bash
git clone https://github.com/silent0607/hackterm.git
cd hackterm
```

### 2. Configure Environment Variables (.env)
Edit the `.env` file to set your preferred port, administrator credentials, and session security key.
```env
PORT=3001
ADMIN_USER=admin
ADMIN_PASS=password  # CHANGE THIS!
SESSION_SECRET=54njn54jkn54j5n54jnt45kn_secure_v5_prod
DESKTOP_PATH=/desktop  # Your dynamic noVNC URL slug for security
```

> [!WARNING]
> **IMPORTANT SECURITY:** Change the default `admin/password` credentials before deploying to any public server. All ports (3001, 6080-6082) are protected by this password.
> 
> **FIREWALL NOTE:** If deploying on a Cloud Server (VPS), you must open the following ports in your firewall:
> *   `3001` (Web UI)
> *   `6080` (Desktop GUI)
> *   `6081` (Firefox GUI)
> *   `6082` (Wireshark GUI)

### 3. Start with Docker
The entire system functions within an isolated Docker container with zero dependency bloat on your host system.
```bash
docker-compose up --build -d
```
Access the dashboard at `http://your-server-ip:3001`. You will be prompted to log in.

---

## 📟 Launching the Local GUI (Optional)
If you're running this strictly on your local machine and want an immediate web wrapper, simply use the provided Python launcher:
```bash
python3 launcher.py
```

---

## 🛠️ Technology Stack
*   **Frontend**: React (Vite), Tailwind Style Utilities, Context-based I18n.
*   **Backend**: Node.js (Express), Socket.io, Node-pty.
*   **Docker Container**: Ubuntu 22.04 Privileged, Xvfb, noVNC, Openbox.
*   **Integrated Security Tools**: Burp Suite, OpenVPN, Nmap, Gobuster, Netcat, Responder.

---

## 🛠️ Professional Deployment (Nginx & SSL)

For production environments (VPS/Cloud) using a reverse proxy and Cloudflare, here is the **Master Nginx Config**:

```nginx
# 1. Global HTTPS Redirect
server {
    listen 80;
    server_name yourdomain.com hackterm.yourdomain.com;
    return 301 https://$host$request_uri;
}

# 2. Main Site (e.g. Django/PHP)
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8000; # Your main app port
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 3. HackTerm (Subdomain) - RECOMMENDED
server {
    listen 443 ssl;
    server_name hackterm.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        
        # BEYAZ EKRAN & TERMİNAL FİX / KARARLI ARAYÜZ (CSP v5.7)
        proxy_hide_header Content-Security-Policy;
        add_header Content-Security-Policy "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; frame-ancestors 'self';";
        
        # LARGE FILE UPLOAD FIX (OVERRIDE 1MB LIMIT & ENABLE PROGRESS)
        client_max_body_size 0;
        proxy_request_buffering off;
        
        proxy_read_timeout 86400s;
    }

    # Cloudflare-Friendly VNC Tunnels (GUI Access)
    location /vnc6080/ { proxy_pass http://127.0.0.1:6080/; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; }
    location /vnc6081/ { proxy_pass http://127.0.0.1:6081/; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; }
    location /vnc6082/ { proxy_pass http://127.0.0.1:6082/; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; }
}
```

### ☁️ Cloudflare Settings
1. **DNS**: Add an `A` record for `hackterm` pointing to your server IP.
2. **Proxy Status**: You can use **Orange Cloud (Proxied) 🟠** because the Nginx config above tunnels everything via port 443.
3. **SSL/TLS**: Set mode to **Full (Strict)**.

⭐ Don't forget to star the repo if you like it! [GitHub - silent0607/hackterm](https://github.com/silent0607/hackterm)

---

## 🛠️ Profesyonel Dağıtım (Nginx & SSL)

Uygulamayı bir sunucu üzerinde (Django vb. ile birlikte) çalıştırmak için önerilen **Nginx Master Config** örneği:

```nginx
# 1. HTTP -> HTTPS Yönlendirme
server {
    listen 80;
    server_name jafarovabdul.cloud hackterm.jafarovabdul.cloud;
    return 301 https://$host$request_uri;
}

# 2. Ana Site (Django)
server {
    listen 443 ssl;
    server_name jafarovabdul.cloud;

    ssl_certificate /etc/letsencrypt/live/jafarovabdul.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jafarovabdul.cloud/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 3. HackTerm (Subdomain) - ÖNERİLEN!
server {
    listen 443 ssl;
    server_name hackterm.jafarovabdul.cloud;

    ssl_certificate /etc/letsencrypt/live/jafarovabdul.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jafarovabdul.cloud/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400s;
    }
}
```

> [!TIP]
> **CLOUDFLARE NOTU:** Cloudflare kullanıyorsanız, `hackterm` subdomainini **DNS Only (Gri Bulut 🔘)** moduna getirin. Cloudflare Proxy (Turuncu Bulut) 3001 portunu engellemektedir.

⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın! [GitHub - silent0607/hackterm](https://github.com/silent0607/hackterm)
