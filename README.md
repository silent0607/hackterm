# 🛡️ HackTerm (HackTool Basic) - Gelişmiş Güvenlik Terminali

**HackTerm**, sızma testi süreçlerini otomatize etmek, yaygın kullanılan güvenlik araçlarını merkezi bir web arayüzünden yönetmek ve grafik arayüzlü (GUI) araçları tarayıcı üzerinden kullanmak için tasarlanmış profesyonel bir sızma testi platformudur.

---

## ⚠️ Yasal Uyarı ve Sorumluluk Reddi (Legal Disclaimer)

**ÖNEMLİ:** Bu araç sadece **etik hacking**, güvenlik araştırmaları ve yasal sızma testi süreçleri için geliştirilmiştir. 
*   Bu aracın yetkisiz sistemlere karşı kullanılması **yasa dışıdır** ve ciddi hukuki sonuçlar doğurabilir.
*   Geliştiriciler, bu aracın yanlış kullanımından veya yol açabileceği zararlardan hiçbir şekilde **sorumlu tutulamaz**.
*   Bu yazılımı kullanarak, tüm sorumluluğun size ait olduğunu ve yerel/uluslararası yasalar çerçevesinde hareket edeceğinizi kabul etmiş sayılırsınız.

---

## 🔥 Temel Özellikler

*   **🖥️ Çift Masaüstü Desteği**: Konteyner içinde **Xfce** veya **GNOME** masaüstü ortamlarını noVNC üzerinden tarayıcıda çalıştırabilme.
*   **🐝 Burp Suite Entegrasyonu**: Tek tıkla Burp Suite kurulumu, Firefox ile tam uyumlu proxy ve sertifika yönetimi.
*   **🛡️ OpenVPN Yönetimi**: `.ovpn` yapılandırmalarını web arayüzünden yükleyip tüm konteyner trafiğini VPN üzerinden geçirme.
*   **🐚 Etkileşimli Terminaller**: PTY destekli yerel terminaller ve uzak SSH bağlantıları.
*   **🛠️ Entegre Güvenlik Araçları**: Nmap, John the Ripper, Impacket, Gobuster, SQL araçları ve daha fazlası.
*   **📁 FTP & Dosya Takibi**: `downloads` dizinine düşen dosyaları gerçek zamanlı izleme ve indirme.
*   **⚙️ Dinamik Yapılandırma**: Portları ve GUI ortamını `.env` dosyası üzerinden kolayca değiştirme.

---

## 🚀 Kurulum ve Başlatma

### 🔗 Uzak Sunucu (Server) veya Yerel Kurulum

HackTerm, hem yerel makinenizde hem de uzak bir VPS/Server üzerinde çalışacak şekilde optimize edilmiştir.

#### 1. Depoyu Klonlayın
```bash
git clone https://github.com/silent0607/hackterm.git
cd hackterm
```

#### 2. Yapılandırma (.env)
Kendi portlarınızı ve masaüstü tercihinizi belirlemek için `.env` dosyasını düzenleyin:
```env
HACKTERM_PORT=3001   # Ana web arayüzü
NOVNC_PORT=6080      # Masaüstü (noVNC) erişimi
DESKTOP_ENV=xfce     # xfce veya gnome
```

#### 3. Docker ile Çalıştırın
```bash
docker-compose up --build -d
```
Uygulamanıza `http://ip-adresiniz:3001` (veya belirlediğiniz port) üzerinden erişebilirsiniz.

---

## 📟 Masaüstü Yöneticisi (Launcher)

Yerel kullanımda kolaylık sağlaması için `launcher.py` scriptini kullanabilirsiniz:
*   **Bağlan/Başlat**: Sistemi otomatik açar ve tarayıcıya yönlendirir.
*   **Terminal**: Konteynere SSH atmadan doğrudan Ubuntu shell'ine yeni bir pencerede bağlanır.
*   **Temizle**: Tüm volume'ları ve yüklü araçları silerek sistemi sıfırlar.

```bash
python3 launcher.py
```

---

## 🛠️ Teknoloji Yığını

*   **Backend**: Node.js, Express, Socket.io, Multer, node-pty.
*   **Frontend**: React, Vite, Lucide-React, xterm.js.
*   **Virtualization**: Docker (Ubuntu 22.04 Tabanlı).
*   **Desktop**: Xvfb, x11vnc, noVNC, Xfce4/GNOME.

---
⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!
[GitHub - silent0607/hackterm](https://github.com/silent0607/hackterm)
