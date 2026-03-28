import tkinter as tk
from tkinter import messagebox
import subprocess
import webbrowser
import os
import platform
import time

class HackTermLauncher:
    def __init__(self, root):
        self.root = root
        self.root.title("HackTerm Manager")
        self.root.geometry("400x350")
        self.root.configure(bg="#0a0a0f")
        
        # Style
        self.btn_font = ("Inter", 10, "bold")
        self.bg_color = "#0a0a0f"
        self.fg_color = "#e0e0ff"
        self.accent_green = "#00ff88"
        self.accent_red = "#ff3b5c"
        self.accent_cyan = "#00d4ff"

        tk.Label(root, text="🛡️ HackTerm Dashboard", font=("Inter", 16, "bold"), bg=self.bg_color, fg=self.accent_green, pady=20).pack()

        self.create_button("🚀 Bağlan & Başlat", self.accent_green, self.connect)
        self.create_button("📟 Docker Terminaline Bağlan", self.accent_cyan, self.open_terminal)
        self.create_button("🗑️ Tüm Bağımlılıkları Kaldır (Temizle)", self.accent_red, self.reset_all)
        
        tk.Label(root, text="v1.1 - Gelişmiş GUI & VPN Destekli", font=("Inter", 8), bg=self.bg_color, fg="#555", pady=10).pack(side="bottom")

    def create_button(self, text, color, command):
        btn = tk.Button(self.root, text=text, font=self.btn_font, bg="#1a1a24", fg=color, 
                        activebackground=color, activeforeground="#000", bd=0, padx=20, pady=10, 
                        width=30, cursor="hand2", command=command)
        btn.pack(pady=10)

    def connect(self):
        try:
            print("[*] Docker konteynerleri başlatılıyor...")
            subprocess.run(["docker-compose", "up", "-d", "--build"], check=True)
            messagebox.showinfo("HackTerm", "Uygulama başlatılıyor... Tarayıcı açılıyor.")
            time.sleep(3)
            webbrowser.open("http://localhost:3001")
        except Exception as e:
            messagebox.showerror("Hata", f"Başlatma hatası: {e}")

    def open_terminal(self):
        try:
            system = platform.system()
            cmd = "docker exec -it hacktoolbasic-app /bin/bash"
            
            if system == "Linux":
                # Try common terminal emulators
                for term in ["x-terminal-emulator", "gnome-terminal", "konsole", "xfce4-terminal", "xterm"]:
                    if subprocess.run(["which", term], capture_output=True).returncode == 0:
                        if term == "gnome-terminal":
                            subprocess.Popen(["gnome-terminal", "--", "bash", "-c", cmd])
                        else:
                            subprocess.Popen([term, "-e", cmd])
                        return
                messagebox.showwarning("Uyarı", "Uygun terminal emülatörü bulunamadı. Lütfen manuel bağlanın: " + cmd)
            elif system == "Windows":
                subprocess.Popen(["start", "cmd", "/k", cmd], shell=True)
            else:
                messagebox.showerror("Hata", "Bu işletim sistemi terminal açma için desteklenmiyor.")
        except Exception as e:
            messagebox.showerror("Hata", f"Terminal hatası: {e}")

    def reset_all(self):
        confirm = messagebox.askyesno("DİKKAT", "Tüm konteynerler durdurulacak, volume'lar (yüklenen araçlar, vpn dosyaları vb.) SİLİNECEK.\n\nEmin misiniz?")
        if confirm:
            try:
                subprocess.run(["docker-compose", "down", "-v"], check=True)
                messagebox.showinfo("Başarılı", "Tüm bağımlılıklar ve veriler temizlendi.")
            except Exception as e:
                messagebox.showerror("Hata", f"Sıfırlama hatası: {e}")

if __name__ == "__main__":
    root = tk.Tk()
    app = HackTermLauncher(root)
    root.mainloop()
