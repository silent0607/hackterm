import tkinter as tk
from tkinter import ttk, messagebox
import subprocess
import threading
import webbrowser
import os
import time

DIR_PATH = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(DIR_PATH, ".env")

def get_env_port():
    """Çalışma dizinindeki .env dosyasından HACKTERM_PORT değerini okur."""
    port = "3001"
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, "r") as f:
            for line in f:
                if line.startswith("HACKTERM_PORT="):
                    port = line.split("=")[1].strip()
    return port

def is_docker_running():
    """Konteynerin çalışıp çalışmadığını kontrol eder."""
    try:
        output = subprocess.check_output(
            ["docker", "inspect", "-f", "{{.State.Running}}", "hacktoolbasic-app"],
            stderr=subprocess.DEVNULL
        ).decode("utf-8").strip()
        return output == "true"
    except subprocess.CalledProcessError:
        return False

class HackTermApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("HackTerm [Core Manager]")
        self.geometry("400x520")
        self.resizable(False, False)
        self.configure(bg="#0B1120") # Dark Hacker Theme Background
        self.port = get_env_port()

        # Custom Styles
        style = ttk.Style(self)
        style.theme_use("clam")
        style.configure("TFrame", background="#0B1120")
        style.configure("TLabel", background="#0B1120", foreground="#9CA3AF", font=("Consolas", 10))
        style.configure("Title.TLabel", foreground="#10B981", font=("Consolas", 18, "bold"))
        style.configure("Status.TLabel", foreground="#FCD34D", font=("Consolas", 11, "bold"))

        self.setup_ui()
        self.refresh_timer()

    def setup_ui(self):
        main_frame = ttk.Frame(self, padding=20)
        main_frame.pack(fill=tk.BOTH, expand=True)

        # Header
        ttk.Label(main_frame, text="🛡️ HackTerm Basic", style="Title.TLabel").pack(pady=(10, 5))
        ttk.Label(main_frame, text="Security & Testing Environment").pack(pady=(0, 20))

        # Status Panel
        status_frame = tk.Frame(main_frame, bg="#1F2937", bd=1, relief="solid")
        status_frame.pack(fill=tk.X, pady=10, ipady=10)

        self.lbl_status = ttk.Label(status_frame, text="🔄 Kontrol ediliyor...", anchor="center", style="Status.TLabel", background="#1F2937")
        self.lbl_status.pack(fill=tk.X)
        self.lbl_port = ttk.Label(status_frame, text=f"Hedef Port: {self.port}", anchor="center", background="#1F2937")
        self.lbl_port.pack(fill=tk.X)

        # Loading / Progress Indication
        self.lbl_logs = ttk.Label(main_frame, text="Hazır.", foreground="#34D399")
        self.lbl_logs.pack(pady=10)

        # Buttons
        self.btn_open = tk.Button(main_frame, text="🌐 Arayüzü Aç (Tarayıcı)", font=("Consolas", 11, "bold"), bg="#10B981", fg="#000000", activebackground="#059669", bd=0, command=self.open_browser, height=2)
        self.btn_open.pack(fill=tk.X, pady=5)

        self.btn_start = tk.Button(main_frame, text="🚀 Makineyi Başlat (Up)", font=("Consolas", 10), bg="#3B82F6", fg="#FFFFFF", activebackground="#2563EB", bd=0, command=lambda: self.run_docker_cmd(["docker-compose", "up", "-d"]), height=2)
        self.btn_start.pack(fill=tk.X, pady=5)

        self.btn_stop = tk.Button(main_frame, text="🛑 Sadece Durdur (Stop)", font=("Consolas", 10), bg="#6B7280", fg="#FFFFFF", activebackground="#4B5563", bd=0, command=lambda: self.run_docker_cmd(["docker-compose", "stop"]), height=2)
        self.btn_stop.pack(fill=tk.X, pady=5)

        # Danger Zone
        ttk.Label(main_frame, text="--- Tehlikeli Alan ---", foreground="#EF4444").pack(pady=(20, 5))
        
        self.btn_destroy = tk.Button(main_frame, text="💀 Komple Sil (Veriler & Makine)", font=("Consolas", 10, "bold"), bg="#DC2626", fg="#FFFFFF", activebackground="#991B1B", bd=0, command=self.prompt_destroy, height=2)
        self.btn_destroy.pack(fill=tk.X)

        self.update_ui_state()

    def update_ui_state(self):
        running = is_docker_running()
        if running:
            self.lbl_status.config(text="✅ Durum: ÇALIŞIYOR", foreground="#10B981")
            self.btn_open.config(state=tk.NORMAL, bg="#10B981")
            self.btn_start.config(state=tk.DISABLED, bg="#1F2937", fg="#4B5563")
            self.btn_stop.config(state=tk.NORMAL, bg="#6B7280")
        else:
            self.lbl_status.config(text="❌ Durum: KAPALI", foreground="#F87171")
            self.btn_open.config(state=tk.DISABLED, bg="#1F2937")
            self.btn_start.config(state=tk.NORMAL, bg="#3B82F6", fg="#FFFFFF")
            self.btn_stop.config(state=tk.DISABLED, bg="#1F2937", fg="#4B5563")

    def refresh_timer(self):
        """Her 5 saniyede bir docker durumunu günceller."""
        self.update_ui_state()
        self.after(5000, self.refresh_timer)

    def open_browser(self):
        url = f"http://localhost:{self.port}"
        webbrowser.open(url)

    def prompt_destroy(self):
        res1 = messagebox.askyesno("Kritik Uyarı!", "Makineyi tamamen silmek üzeresiniz. Bu işlem Docker imajını ve yüklü verileri kaldırır. Devam edilsin mi?")
        if res1:
            res2 = messagebox.askyesno("Son Onay!", "LÜTFEN DİKKAT!\nİndirilen dosyalar, araçlar ve VPN (.ovpn) kayıtları da diskten silinecektir. Bundan emin misiniz?", icon='warning')
            if res2:
                cmd = "docker-compose down -v --rmi local && rm -rf downloads .tools .ovpn"
                self.run_raw_cmd(cmd, "Makine temizleniyor (SİLİNİYOR)...")

    def run_docker_cmd(self, cmd_list):
        self.lbl_logs.config(text=f"İşleniyor: {' '.join(cmd_list)}", foreground="#FCD34D")
        self.toggle_buttons(False)

        def task():
            try:
                subprocess.run(cmd_list, cwd=DIR_PATH, check=True)
                self.after(0, lambda: self.lbl_logs.config(text="✅ İşlem Tamamlandı.", foreground="#10B981"))
            except Exception as e:
                self.after(0, lambda: self.lbl_logs.config(text="❌ Hata Oluştu!", foreground="#EF4444"))
                self.after(0, lambda: messagebox.showerror("Hata", str(e)))
            finally:
                self.after(0, self.post_cmd_update)

        threading.Thread(target=task, daemon=True).start()

    def run_raw_cmd(self, raw_cmd, msg):
        self.lbl_logs.config(text=msg, foreground="#FCD34D")
        self.toggle_buttons(False)

        def task():
            try:
                subprocess.run(raw_cmd, shell=True, cwd=DIR_PATH, check=True)
                self.after(0, lambda: self.lbl_logs.config(text="✅ Makine ve Veriler Silindi.", foreground="#10B981"))
            except Exception as e:
                self.after(0, lambda: self.lbl_logs.config(text="❌ Hata Oluştu!", foreground="#EF4444"))
                self.after(0, lambda: messagebox.showerror("Hata", str(e)))
            finally:
                self.after(0, self.post_cmd_update)

        threading.Thread(target=task, daemon=True).start()

    def post_cmd_update(self):
        self.toggle_buttons(True)
        self.update_ui_state()

    def toggle_buttons(self, state):
        s = tk.NORMAL if state else tk.DISABLED
        self.btn_open.config(state=s)
        self.btn_start.config(state=s)
        self.btn_stop.config(state=s)
        self.btn_destroy.config(state=s)


if __name__ == "__main__":
    app = HackTermApp()
    app.mainloop()
