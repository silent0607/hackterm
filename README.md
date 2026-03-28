# 🛡️ HackTerm (HackTool Basic)

**HackTerm**, sızma testi süreçlerini hızlandırmak ve yaygın kullanılan güvenlik araçlarını tek bir yerden yönetmek için tasarlanmış, modern ve etkileşimli bir web terminal arayüzüdür.

![HackTerm Logo](https://raw.githubusercontent.com/silent0607/hackterm/main/client/public/logo.png) *<!-- Opsiyonel logo -->*

## ✨ Özellikler

HackTerm, aşağıdaki modülleri içeren kapsamlı bir araç setidir:

*   **🐚 Etkileşimli Terminal**: xterm.js tabanlı, çoklu oturum destekli yerel ve uzak terminal.
*   **📡 Nmap**: Ağ tarama ve servis keşfi için hazır komutlar ve sonuç analizi.
*   **🗄️ Redis Explorer**: Redis veritabanlarına bağlanma, veri çekme ve istismar teknikleri.
*   **🔥 PHP Reverse Shell**: Tek tıkla reverse shell oluşturma, stabilize etme ve iyileştirme.
*   **📁 FTP İzleyici**: `downloads` dizinine düşen dosyaları gerçek zamanlı (chokidar) takip etme.
*   **🗝️ John the Ripper**: Parola kırma süreçlerini web üzerinden yönetme.
*   **🌐 Gobuster**: Dizin ve dosya kaba kuvvet saldırıları için optimize edilmiş arayüz.
*   **🗃️ SQL Tools**: Veritabanı sızma teknikleri ve otomatize komutlar.
*   **☁️ Cloud Security (AWS)**: AWS servislerine yönelik güvenlik kontrolleri.
*   **💻 Windows Exploitation**: Windows sistemlere özel yetki yükseltme ve sızma araçları.

## 🚀 Kurulum ve Çalıştırma

### 🐳 Docker ile (Önerilen)

En hızlı ve sorunsuz kurulum için Docker kullanabilirsiniz. Ubuntu tabanlı imajımız tüm bağımlılıkları (Node.js, Python, Nmap vb.) hazır içermektedir.

```bash
git clone https://github.com/silent0607/hackterm.git
cd hackterm
docker-compose up --build
```
Uygulamaya `http://localhost:3001` adresinden erişebilirsiniz.

### 🛠️ Manuel Kurulum (Linux/Kali)

1.  **Bağımlılıkları Yükleyin**:
    ```bash
    bash setup.sh
    ```
    *Bu script Python venv oluşturur ve gerekli kütüphaneleri (Impacket vb.) kurar.*

2.  **Node.js Paketlerini Kurun**:
    ```bash
    npm install
    cd client && npm install
    ```

3.  **Başlatın**:
    ```bash
    # Kök dizinde (root)
    npm run dev
    ```

## 🏗️ Teknoloji Yığını

*   **Frontend**: React, Vite, Socket.io-client, Lucide-React, xterm.js.
*   **Backend**: Node.js, Express, Socket.io, node-pty (Pseudu-terminal), Chokidar (File system watch).
*   **Environment**: Docker, Python venv.

## ⚠️ Yasal Uyarı

Bu araç sadece **etik hacking** ve sızma testi eğitimleri/profesyonel süreçleri için geliştirilmiştir. Yetkisiz sistemlere yönelik kullanımı yasal sonuçlar doğurabilir. Kullanıcı, yaptığı işlemlerden kendisi sorumludur.

---
⭐ Gelişime katkıda bulunmak için repoyu yıldızlayabilir veya bir PR gönderebilirsiniz!
[GitHub - silent0607/hackterm](https://github.com/silent0607/hackterm)
