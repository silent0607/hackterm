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

### 2. Configure Environment Variable (.env)
Edit the `.env` file to set your preferred port and the secret VNC path.
```env
HACKTERM_PORT=3001
DESKTOP_PATH=/desktop  # Your dynamic noVNC URL slug for security
```

### 3. Start with Docker
The entire system functions within an isolated Docker container with zero dependency bloat on your host system.
```bash
docker-compose up --build -d
```
Access the dashboard at `http://your-server-ip:3001`.

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

⭐ Don't forget to star the repo if you like it! [GitHub - silent0607/hackterm](https://github.com/silent0607/hackterm)
