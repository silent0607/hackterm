import os
import sys
import platform
import stat

DIR_PATH = os.path.dirname(os.path.abspath(__file__))
GUI_SCRIPT = os.path.join(DIR_PATH, "HackTermGUI.py")

def create_linux_shortcut():
    desktop_file = f"""[Desktop Entry]
Version=1.0
Type=Application
Name=HackTerm
Comment=Güvenlik ve Sızma Testi Arayüzü
Exec=python3 "{GUI_SCRIPT}"
Icon={os.path.join(DIR_PATH, "logo.png")}
Terminal=false
Categories=Utility;Security;
"""
    # 1. Menüye ekle
    app_dir = os.path.expanduser("~/.local/share/applications")
    os.makedirs(app_dir, exist_ok=True)
    with open(os.path.join(app_dir, "HackTerm.desktop"), "w", encoding="utf-8") as f:
        f.write(desktop_file)
    
    # 2. Masaüstüne ekle
    desktop_dir = os.path.expanduser("~/Masaüstü")
    if not os.path.exists(desktop_dir):
        desktop_dir = os.path.expanduser("~/Desktop")
    
    if os.path.exists(desktop_dir):
        desktop_path = os.path.join(desktop_dir, "HackTerm.desktop")
        with open(desktop_path, "w", encoding="utf-8") as f:
            f.write(desktop_file)
        
        # Çalıştırılabilir yap (chmod +x)
        st = os.stat(desktop_path)
        os.chmod(desktop_path, st.st_mode | stat.S_IEXEC)
        print(f"✅ Linux masaüstü kısayolu oluşturuldu: {desktop_path}")
    else:
        print("Masaüstü dizini bulunamadı ancak uygulama menüsüne eklendi.")

def create_windows_shortcut():
    desktop = os.path.expanduser("~/Desktop")
    path = os.path.join(desktop, "HackTerm.lnk")
    
    # Windows'ta paket bağımlılığı olmamak için yerel VBScript kullanılıyor
    vbs_script = f"""
Set ws = WScript.CreateObject("WScript.Shell")
Set link = ws.CreateShortcut("{path}")
link.TargetPath = "python"
link.Arguments = "{GUI_SCRIPT}"
link.WorkingDirectory = "{DIR_PATH}"
link.IconLocation = "{os.path.join(DIR_PATH, 'logo.ico')}"
link.Description = "HackTerm Security Environment"
link.Save
"""
    vbs_path = os.path.join(DIR_PATH, "mk_shortcut.vbs")
    with open(vbs_path, "w", encoding="utf-8") as f:
        f.write(vbs_script)
    
    os.system(f'cscript //Nologo "{vbs_path}"')
    os.remove(vbs_path)
    print(f"✅ Windows masaüstü kısayolu oluşturuldu: {path}")

if __name__ == "__main__":
    print("🚀 HackTerm Masaüstü Entegrasyonu Başlatılıyor...")
    
    if not os.path.exists(GUI_SCRIPT):
        print("HATA: HackTermGUI.py bulunamadı! Lütfen repoyu düzgün çektiğinizden emin olun.")
        sys.exit(1)

    if platform.system() == "Windows":
        create_windows_shortcut()
    else:
        create_linux_shortcut()
        
    print("--------------------------------------------------")
    print("Kurulum Tamamlandı! Artık masaüstünüzdeki 'HackTerm' ikonuna ")
    print("çift tıklayarak sistemi başlatabilir veya silebilirsiniz.")
