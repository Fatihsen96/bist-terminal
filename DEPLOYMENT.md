# FinOS (Market Terminal) Bulut (Cloud) ve GoDaddy VPS Yayınlama Rehberi

Bu rehber, FinOS projenizi local ortamdan çıkarıp **GoDaddy VPS**, **DigitalOcean**, **AWS**, **Render** veya herhangi bir bulut sunucuda 5-10 arkadaşınıza ve piyasaya açmanız için adım adım hazırlanmıştır.

---

## 🚀 Seçenek 1: Docker Compose İle GoDaddy VPS / Linux Sunucuda Tek Tık Kurulum (ÖNERİLEN)

En kolay ve güvenilir yöntemdir. Python FastAPI (Analiz Motoru) ve Express/React UI aynı sunucuda izolasyonlu çalışır.

### Adım 1: Sunucunuza Bağlanın & Docker Kurun
SSH ile GoDaddy VPS sunucunuza bağlanın:
```bash
ssh root@SUNUCU_IP_ADRESINIZ
```

Docker ve Docker Compose'u yükleyin (Ubuntu/Debian):
```bash
sudo apt update && sudo apt install -y docker.io docker-compose git
```

### Adım 2: Kodları Sunucuya Çekin
```bash
git clone https://github.com/Fatihsen96/market-terminal.git
cd market-terminal
```

### Adım 3: Ortam Değişkenlerini Tanımlayın (`.env`)
```bash
nano .env
```
Dosya içine Gemini API Key'inizi yazın:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3000
```

### Adım 4: Docker İle Uygulamayı Başlatın
```bash
docker-compose up -d --build
```

Artık uygulamanız `http://SUNUCU_IP_ADRESINIZ:3000` adresinde canlıdadır!

---

## 🌐 Seçenek 2: Nginx + Domain Bağlama (örn. `finosapp.com`)

GoDaddy'den satın aldığınız alan adını (Domain) VPS IP adresinize yönlendirmek için:

1. **Nginx Yükleyin**:
```bash
sudo apt install nginx -y
```

2. **Nginx Ayar Dosyası Oluşturun**:
```bash
sudo nano /etc/nginx/sites-available/finos
```

Aşağıdaki konfigürasyonu yapıştırın:
```nginx
server {
    listen 80;
    server_name finosapp.com www.finosapp.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

3. **Aktifleştirin & SSL (HTTPS) Alın**:
```bash
sudo ln -s /etc/nginx/sites-available/finos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Ücretsiz SSL (Certbot)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d finosapp.com -d www.finosapp.com
```

---

## ⚙️ Yerel (Local) Geliştirme Komutları

Geliştirme yaparken local ortamda çalıştırmak için:

```bash
# Terminal 1 (Python Analiz Motoru):
python main.py

# Terminal 2 (React & Express UI):
npm run dev
```
