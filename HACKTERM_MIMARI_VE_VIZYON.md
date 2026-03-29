# 💻 HACKTERM PRO v4.x - SİSTEM MİMARİSİ VE TEKNİK DOKÜMANTASYON

Bu doküman, **HackTerm Pro** projesinin en ince ayrıntısına kadar nasıl çalıştığını, arka planda hangi modern teknolojilerin kullanıldığını, sistemin neleri içerdiğini ve gelecekte bu sisteme eklenebilecek muazzam siber güvenlik özelliklerini listelemek amacıyla hazırlanmıştır.

---

## 🛠️ 1. KULLANILAN TEKNOLOJİLER VE ALTYAPI

HackTerm Pro, üç ana katmandan oluşan tam donanımlı bir **Cyber Security Web-Based IDE / C2 Server (Komuta Kontrol Sunucusu)** mimarisine sahiptir:

### A. Frontend (Kullanıcı Arayüzü Katmanı)
Kullanıcının etkileşime girdiği, muazzam akıcılığa sahip modern arayüz katmanı.
- **React.js (Vite)**: Uygulamanın temel iskeleti. İnanılmaz hızlı derlenme ve bileşen bazlı mimarisi için kullanıldı.
- **Glassmorphism & Vanilla CSS**: TailwindCSS yerine tamamen özel kodlanmış, modern siber güvenlik filmlerinden fırlamış gibi görünen yarı saydam, bulanık (blur) cam efektli karanlık tema.
- **Xterm.js**: Tarayıcı içerisinde gerçek bir Linux terminali çalışıyormuş hissi veren altyapı. Nitelikli komut çalıştırma, ANSI renk kodları ve `Ctrl+Shift+C/V` kopyala/yapıştır desteği ile güçlendirilmiştir.
- **Socket.io-client**: Sunucu ile arayüz arasında gecikmesiz (real-time) çift yönlü veri akışını sağlar. Terminallerden host sunucuya her tuş vuruşu `WebSocket` ile milisaniyeler içinde iletilir.
- **noVNC**: VNC protokolünü HTML5 Canvas üzerine renderlayan eklenti. Arka plandaki sanal masaüstlerini (Burp ve Firefox) herhangi bir program indirmeden browser üzerinden yönetmenizi sağlar.

### B. Backend (Sunucu ve İşletim Katmanı)
Linux terminalini tarayıcıya bağlayan ana beyin.
- **Node.js & Express.js**: REST API (Market kurulumları, dosya okuma/yazma) rotalarını yöneten belkemiği sunucu altyapısı.
- **Node-PTY**: En kritik kütüphanelerden biri. Komutların sıradan bir çıktı olarak değil, "Pseudo-Terminal (Sahte Terminal)" ortamında sanki gerçek klavye kullanılıyormuş gibi çalışmasını sağlar. Nmap veya SQLMap'in interaktif sorular sormasına olanak tanır.
- **Chokidar**: FTP (Downloads) klasörünü anlık izleyip, indirilen veya yüklenen dosyaları anında arayüze (Frontend'e) yansıtan dosya sistemi bekçisi.
- **Child_Process (`exec`, `spawn`)**: "Paket Market" modülünde `apt-get`, `gem`, `pip` gibi Linux komutlarını tetikleyip çalışan süreci canlı canlı WebSocket üstünden arayüze aktarmak için kullanılır.

### C. Altyapı ve Konteyner Mimari (Docker)
İzolasyon ve kolay kurulum için kullanılan çekirdek sistem.
- **Docker & Docker Compose**: Sistemin sadece tek bir tıkla `docker-compose up -d --build` denilerek kurulmasını sağlar. Sizin ana makinenize (Kali) zarar vermeden izole bir "Laboratuvar" oluşturur.
- **Xvfb (X Virtual Framebuffer)**: Ekranı olmayan (headless) sunucularda sanal bir ekran kartı ve monitör varmış gibi davranarak arayüzlü (GUI) uygulamaların çalışmasını sağlar (:1 ve :2 ekranları).
- **Fluxbox & lxterminal**: En hafif pencere yöneticisi ve modern VNC içi terminali. (Java Swing kullanan Burp Suite'in tıklama çökmelerini engellemek için Openbox yerine tercih edilmiştir).
- **x11vnc & Websockify**: Sanal monitördeki görüntüyü VNC formatına çevirip (websockify ile) WebSocket üzerinden web arayüzüne paslar.
- **Autocutsel**: VNC penceresi ile sizin kendi Windows/Kali ana bilgisayarınız arasındaki Kopyala/Yapıştır (Clipboard) trafiğini senkronize eder.

---

## 🗡️ 2. İÇİNDE NELER VAR? (MEVCUT MODÜLLER)

HackTerm Pro tek bir sekmede onlarca aracı yönettiğiniz bir merkezdir. Hali hazırda projenizde bulunan ve çalışan sistemler şunlardır:

1. **Dashboard (Ana Hub)**: Sistem kaynaklarını, anlık aktif işleri (Job Management) görebileceğiniz ana üs.
2. **Keşif (Nmap)**: Hedef ağları tarama, açık portları bulma terminali.
3. **Web Enum (Gobuster / Dirb)**: Hedef web sitelerindeki gizli dizinleri ve klasörleri kaba kuvvetle bulma.
4. **Veritabanı Analizi 1 (SQLMap)**: SQL Injection açıklarını sömürme ve veritabanı boşaltma otomasyonu.
5. **Veritabanı Analizi 2 (Redis)**: Ön bellek (Redis/Memcached) sunucularını ele geçirme arabirimi.
6. **Dosya Transfer (FTP & SMB)**: Hedef sunuculardaki SMB paylaşımlarına (SMBClient) sızma ve FTP sunucularındaki dosyaları lokal konteynere indirme/listeleme. (Anlık dosya güncellemeleri dahil).
7. **Parola Kırma (John & Hashcat)**: Ele geçirilen password hash'lerini kaba kuvvetle kırma terminalleri.
8. **Windows Hedef (Evil-WinRMvb.)**: Windows Active Directory ağlarındaki bilgisayarlara komut gönderme ve Responder (LLMNR zehirlenmesi) istismarları için ayrılmış bölüm.
9. **Görsel Web Analiz (Burp Suite & Firefox)**: VNC üzerinden 6080 portunda Firefox tarayıcısı, 6081 portunda tamamen Web Trafik Analizi için ayrılmış Java tabanlı Proxied Burp Suite makinesi.
10. **Paket Market (Sistem Ayarları)**: İçerisinde *Netcat, MySQL Client, John, Hashcat, AWS CLI, Impacket, Evil-WinRM, SMBclient, Responder* gibi programların anlık durumlarını kontrol edip, eksik olanları **Tek Tıkla** kurabileceğiniz App Store benzeri sistem altyapısı.

---

## 🚀 3. BAŞKA NELER EKLENEBİLİR? (GELECEK VİZYONU)

Projenin altyapısı React ve WebSocket üzerine kurulu olduğu için genişletilme potansiyeli **limitsizdir**. Sisteme seviye atlatacak potansiyel eklentiler şunlardır:

### 1. Reverse Shell Catcher (Dinleyici ve C2 Paneli)
Dünyanın en çok aranan siber güvenlik ihtiyacı!
- **Nedir**: Arka planda 7/24 dinlemede kalacak (`nc -lvnp 4444` gibi) dinamik bir port listesi sayfası eklenebilir. 
- **İşlevi**: Kurban bir bilgisayara sızdığınızda ve bağlantı geri HackTerm'e düştüğünde sistem size bir pop-up ("Yeni bir bilgisayar ele geçirildi!") çıkarır ve ele geçirilen bilgisayarları bir liste halinde gösterip içlerine tek tıkla yeni bir xterm.js penceresi açtırarak bağlanmanızı sağlar.

### 2. Payload Generator (GUI msfvenom)
İkinci bir market gibi, zararlı yazılım oluşturma sayfası.
- **İşlevi**: Kullanıcı hedef sistemi (Windows, Linux, Android) ve payload türünü (Reverse_TCP, Bind_TCP vb.) açılır menüden seçer. İstenen zararlı yazılım (Trojan.exe veya .apk) arka planda otomatik üretilip sizin "Downloads" klasörünüze düşer.

### 3. Otomatik Tarama / Zaafiyet Avcısı (Nuclei & OpenVAS Entegrasyonu)
- Nmap iyidir ancak eski usüldür. En modern tarama aracı olan **Nuclei** sisteme entegre edilebilir. 
- Hedef domain adı girilir, Nuclei arka planda hedefi binlerce güncel CVE açığına karşı tarar ve sonuçları şık bir JSON tablosunda (Kritik, Yüksek, Orta seviye gibi renkli grafiklerle) sunar.

### 4. Metasploit Framework (MSF RPC Modülü)
- Sadece `msfconsole` ekranını xterm.js ile sunmak değil; Metasploit'in harici API'sini (RPC) sunucuya bağlayıp modüllerin (exploit/windows/smb/ms17_010_eternalblue vb.) arayüz üzerinden butonlarla, parametre kutucuklarıyla (`RHOSTS` gibi) tıklanarak çalıştırılması sağlanabilir.

### 5. AI (Yapay Zeka) Destekli Terminal Asistanı (Local LLM or API)
- Özellikle bir hacking terminalinde alınan hatayı veya karmaşık SQLMap logunu anlamak zor olabilir.
- Terminallerin kenarına eklenecek bir **"AI Asistan'a Sor"** butonu, terminalin o anki ekran çıktısını bir yapay zekaya (ChatGPT API veya yerel çalıştırılan Ollama modellerine) göndererek *"Bu Nmap çıktısına göre hedefin neresinden sızmalıyım?"* gibi analiz senaryoları sunabilir.

### 6. Ağ Geçidi ve Tünelleme (Ngrok / Cloudflared)
- Hedef bilgisayarlardan gelen Reverse Shell'leri evdeki kapalı Docker sistemine düşürebilmek imkansızdır.
- HackTerm arayüzündeki ayarlar sayfasına **Cloudflared (Argo Tunnel)** veya **Ngrok** entegrasyonu eklenerek, arayüzdeki "Tünel Başlat" butonuna bastığınız zaman HackTerm C2 sunucunuz otomatik olarak geçici bir internet domaini (örn: `acme-project.ngrok.io`) açarak dünyanın her yerinden kurban trafiklerini karşılayabilecek bir profesyonel altyapıya kavuşabilir.

### 7. Wireshark/Tshark Analiz Modülü (Sızma Ağı İzleme)
- Sistemin ağ kartına (veya Docker interface'ine) takılan bir sniffer ile geçen parolalar ve HTTP istekleri grafiksel olarak loglanabilir.

---
*HackTerm Pro, sadece bir web uygulaması değildir; modern pentesting operasyonlarının hepsini bulut tabanlı, ekip çalışmasına (multiplayer pentest) uygun hale getirebilecek askeri standartlarda bir prototiptir.*
