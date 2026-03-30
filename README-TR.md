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
Kendi özel portunuzu, yönetici bilgilerinizi ve oturum güvenlik anahtarınızı ayarlayın.
```env
PORT=3001
ADMIN_USER=admin
ADMIN_PASS=password  # BURAYI DEĞİŞTİRİN!
SESSION_SECRET=hackterm-secret-key
DESKTOP_PATH=/desktop  # Güvenliğiniz için dinamik URL
```

> [!WARNING]
> **ÖNEMLİ GÜVENLİK UYARISI:** Sistemi halka açık bir sunucuya kurmadan önce varsayılan `admin/password` bilgilerini mutlaka değiştirin. Tüm portlar (3001, 6080-6082) bu şifre ile korunmaktadır.
> 
> **GÜVENLİK DUVARI (FIREWALL) NOTU:** Eğer bir Bulut Sunucu (VPS) üzerine kurulum yapıyorsanız, firewall üzerinden şu portları dışarıya açmanız (Allow) gerekir:
> *   `3001` (Web Arayüzü)
> *   `6080` (Masaüstü Görüntüsü)
> *   `6081` (Firefox Görüntüsü)
> *   `6082` (Wireshark Görüntüsü)

### 3. Docker ile Başlat
Sistem host makineyi kirletmeden tamamen bağımsız izole bir Docker kapsülünde ayağa kalkar.
```bash
docker-compose up --build -d
```
Ek hiçbir kurulum gerektirmeden `http://sunucu-ip-adresiniz:3001` adresine giderek erişim sağlayın. Giriş yapmanız istenecektir.

---

## 📟 Yerel Masaüstü Yöneticisi (Opsiyonel)
Bu projeyi kendi ana işletim sisteminizde kuruyorsanız ve web tarayıcı yerine bir uygulama penceresi ile açılmasını istiyorsanız hazırladığımız Python tetikleyicisini çalıştırabilirsiniz:
```bash
python3 launcher.py
```

---

## 💡 İpuçları & Sorun Giderme

*   **🦈 Wireshark Arayüzü**: Eğer Wireshark **Ekran :3 (6082)** üzerinde otomatik olarak başlamazsa, panel içerisindeki herhangi bir terminal/shell sekmesini açıp `wireshark` yazarak manuel olarak başlatabilirsiniz.

---

## 🛠️ Profesyonel Dağıtım (Nginx & SSL)

Uygulamayı bir sunucu üzerinde (Django, PHP vb. ile birlikte) ve Cloudflare arkasında çalıştırmak için önerilen **Master Nginx Config** örneği:

```nginx
# 1. HTTP -> HTTPS Yönlendirme
server {
    listen 80;
    server_name alanadiniz.com hackterm.alanadiniz.com;
    return 301 https://$host$request_uri;
}

# 2. Ana Site (Django/PHP vb.)
server {
    listen 443 ssl;
    server_name alanadiniz.com;

    ssl_certificate /etc/letsencrypt/live/alanadiniz.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/alanadiniz.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8000; # Ana uygulamanızın portu
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 3. HackTerm (Subdomain) - ÖNERİLEN!
server {
    listen 443 ssl;
    server_name hackterm.alanadiniz.com;

    ssl_certificate /etc/letsencrypt/live/alanadiniz.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/alanadiniz.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        
        # BEYAZ EKRAN & TERMİNAL FİX / KARARLI ARAYÜZ (CSP v5.7)
        proxy_hide_header Content-Security-Policy;
        add_header Content-Security-Policy "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; frame-ancestors 'self';";
        
        # DEV DOSYA YÜKLEME FİX (1MB LIMITINI KALDIR & İLERLEME ÇUBUĞUNU AKTİF ET)
        client_max_body_size 0;
        proxy_request_buffering off;
        
        proxy_read_timeout 86400s;
    }

    # Cloudflare Dostu VNC Tünelleri (GUI Erişimi İçin)
    location /vnc6080/ { proxy_pass http://127.0.0.1:6080/; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; }
    location /vnc6081/ { proxy_pass http://127.0.0.1:6081/; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; }
    location /vnc6082/ { proxy_pass http://127.0.0.1:6082/; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; }
}
```

### ☁️ Cloudflare Ayarları
1. **DNS**: `hackterm` adında bir `A` kaydı oluşturun ve sunucu IP'nizi girin.
2. **Proxy Durumu**: **Turuncu Bulut (Proxied) 🟠** kullanabilirsiniz. Yukarıdaki Nginx konfigürasyonu her şeyi 443 portu üzerinden tünellediği için Cloudflare engeline takılmazsınız.
3. **SSL/TLS**: Modu **Full (Strict)** (Tam - Sıkı) olarak ayarlayın.

⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın! [GitHub - silent0607/hackterm](https://github.com/silent0607/hackterm)
