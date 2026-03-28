# 🛡️ HackTerm (HackTool Basic) - Gelişmiş Güvenlik Terminali

**HackTerm**, sızma testi (penetration testing) süreçlerini otomatize etmek, yaygın kullanılan güvenlik araçlarını merkezi bir web arayüzünden yönetmek ve normalde GUI gerektiren güvenlik araçlarını (Burp Suite vb.) doğrudan tarayıcı içerisinde kullanabilmeniz için tasarlanmış profesyonel bir sızma testi platformudur.

Read this in [English](README.md)

---

## ⚠️ Yasal Uyarı

> [!IMPORTANT]
> **ÖNEMLİ:** Bu araç sadece **etik hacking**, güvenlik araştırmaları ve kendisine ait veya yasal izinleri alınmış sistemlerde yasal sızma testi süreçleri için geliştirilmiştir. 
> *   Bu aracın izinsiz ve yetkisiz sistemlere karşı kullanılması kesinlikle **yasa dışıdır**.
> *   Geliştiriciler, bu aracın yanlış, kötü amaçlı veya yasa dışı kullanımından hiçbir şekilde **sorumlu tutulamaz**.

---

## 🔥 Temel Özellikler

*   **🌍 Çift Dil (Bilingual) Arayüz**: Arayüz üzerinden Türkçe ve İngilizce tam dil desteği (Tek tıklamayla anında geçiş).
*   **🌐 Esnek Kurulum Seçenekleri**: İster **kendi bilgisayarınızda (localhost)** çalıştırın, isterseniz de **uzak bir bulut sunucusunda (VPS)** kurup web üzerinden sızma testlerinizi 7/24 güvenle gerçekleştirin.
*   **🖥️ İsteğe Bağlı (On-Demand) Masaüstü**: İlk açılışta Docker sunucusunu yormamak ve hızlıca ayağa kalkmak için sistem sadece hafif bir *Openbox* ile açılır. Eğer arayüz içindeyken (Burp Suite vb. testler için) ekstradan Xfce veya GNOME masaüstü ortamlarına ihtiyacınız olursa, testinizi yaparken **Ayarlar menüsü** üzerinden tek tıklamayla bu ortamı kurup başlatabilirsiniz. İlk açılışta zorunlu bir masaüstü (DE) bağımlılığı bulunmaz!
*   **🐝 Tıklamayla Burp Suite & Firefox**: Tek tıkla Burp Suite çalıştırın, proxy ve CA sertifika ayarları tamamen yapılandırılmış gizli Firefox oturumuna noVNC ile doğrudan sekmeden ulaşın.
*   **🛡️ OpenVPN Entegrasyonu**: Kendi `.ovpn` dosyalarınızı uygulamaya yükleyerek konteyner trafiğini anında (TryHackMe, HackTheBox vb. platformlar için) VPN tüneline bağlama desteği.
*   **🐚 Etkileşimli Terminal**: Aynı sayfada çoklu PTY (gerçek terminal) sekmeleri oluşturun; SSH sekmeleri, arka plan komutları. 
*   **📁 Zafiyet & Post-Exploitation Modülleri**: Nmap taramaları, FTP dosya izleme, SQL Injection asistanı, Dizin Taraması (Gobuster), PHP Reverse/Web Shell jeneratörleri, Netcat ve Responder dinleme arayüzleri tek bir menüde!

---

## 🚀 Kurulum ve Başlatma

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/silent0607/hackterm.git
cd hackterm
```

### 2. Yapılandırma (.env)
Kendi özel portunuzu ve VNC (Uzak Masaüstü) erişim dizininizi ayarlayın. Bu .env dosyasındaki ortam değişkenleri sayesinde Burp/Firefox arayüzlerini açarken hangi "slug" (gizli uzantı) ile girileceğini belirleyebilirsiniz.
```env
HACKTERM_PORT=3001
DESKTOP_PATH=/desktop  # Güvenliğiniz için dinamik URL (Örnek: /gizli-masaustu)
```

### 3. Docker ile Başlat
Sistem host makineyi kirletmeden tamamen bağımsız izole bir Docker kapsülünde ayağa kalkar.
```bash
docker-compose up --build -d
```
Ek hiçbir kurulum gerektirmeden `http://sunucu-ip-adresiniz:3001` adresine giderek erişim sağlayın.

---

## 📟 Yerel Masaüstü Yöneticisi (Opsiyonel)
Bu projeyi kendi ana işletim sisteminizde kuruyorsanız ve web tarayıcı yerine bir uygulama penceresi ile açılmasını istiyorsanız hazırladığımız Python tetikleyicisini çalıştırabilirsiniz:
```bash
python3 launcher.py
```

---

## 🛠️ Teknoloji Yığını

*   **Frontend (Arayüz)**: React, Vite, Modern CSS, Lucide Icons, Çoklu-Dil (i18n) Context Mimarisi.
*   **Backend (Sunucu)**: Node.js (Express), Socket.io (gerçek zamanlı veri izleme), Node-pty (Etkileşimli terminal).
*   **Konteyner ve Sanallaştırma**: Docker (Ubuntu 22.04 Privileged Mod), Xvfb, noVNC, Bash.

⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın! [GitHub - silent0607/hackterm](https://github.com/silent0607/hackterm)
