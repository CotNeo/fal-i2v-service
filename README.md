# 🎬 fal-i2v-service

> Node.js + Express tabanlı **FAL AI Image-to-Video** entegrasyonu
> Kullanıcıdan prompt + resim alarak video üretir. Hem **senkron (blocking)** hem de **queue + webhook** (önerilen) yöntemlerini destekler.

---

## 🚀 Özellikler

* [x] Express REST API
* [x] `@fal-ai/client` ile FAL AI entegrasyonu
* [x] .env üzerinden API key yönetimi
* [x] Prompt + image URL ile senkron video üretimi
* [x] Queue + Webhook ile uzun süren işler
* [x] Dosya upload → FAL storage’a otomatik yükleme
* [x] Status & result endpointleri
* [x] Pino logger + error middleware
* [x] Zod ile input doğrulama

---

## 📦 Kurulum

### 1. Repo indir

```bash
git clone https://github.com/<your-username>/fal-i2v-service.git
cd fal-i2v-service
```

### 2. Bağımlılıkları yükle

```bash
npm install
```

### 3. Ortam değişkenlerini ayarla

Kök dizine `.env` dosyası oluştur:

```env
PORT=3000
FAL_KEY=YOUR_FAL_API_KEY
PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Çalıştır

```bash
npm run dev
```

Sağlık kontrolü:

```bash
curl http://localhost:3000/health
# {"ok":true}
```

---

## 📂 Dosya Yapısı

```
src/
 ├─ index.js            # Express uygulaması
 ├─ routes/
 │   ├─ i2v.js          # I2V API rotaları
 │   └─ webhooks.js     # Webhook listener
 ├─ lib/
 │   ├─ fal.js          # FAL client wrapper
 │   └─ validation.js   # Zod schema
 └─ utils/
     ├─ logger.js       # Pino logger
     └─ errors.js       # Error handler
```

---

## 🔑 API Endpointleri

### 1) Senkron Video Üretimi

İş bitene kadar bekler. Küçük işler için uygundur.

```http
POST /api/i2v/run-sync
Content-Type: application/json
```

Body:

```json
{
  "prompt": "An intimate close-up ...",
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/ovi_i2v_input.png",
  "num_inference_steps": 30,
  "resolution": "992x512"
}
```

---

### 2) Queue + Webhook (Önerilen)

Uzun süren işler için.

```http
POST /api/i2v/submit
```

Dönüş:

```json
{
  "requestId": "764c-....",
  "status": "SUBMITTED",
  "webhookUrl": "http://localhost:3000/webhooks/fal/i2v"
}
```

Webhook → `/webhooks/fal/i2v`
Status sorgulama:

```http
GET /api/i2v/status/:id
```

Result alma:

```http
GET /api/i2v/result/:id
```

---

### 3) Dosya Upload + Queue

Form-data ile resim dosyası gönder:

```http
POST /api/i2v/submit-upload
```

Body:

```
prompt = "Some prompt..."
image  = <dosya>
```

---

## 🛡️ Güvenlik Notları

* **FAL_KEY** sadece backend’de kullanılmalı. Client’a asla sızdırma.
* Webhook güvenliği için gizli token veya IP allowlist kullan.
* Kullanıcı promptları sanitize edilmeli (ör. uygunsuz içerik filtreleme).
* Dönen videoları kalıcı saklamak için kendi S3/GCS altyapına indir.

---

## 📌 Yol Haritası

* [ ] MongoDB entegrasyonu → job kayıtları
* [ ] Admin panel (React) → job listesi + video player
* [ ] JWT auth ile kullanıcı bazlı job yönetimi
* [ ] Dockerfile + CI/CD pipeline

---

# 🎬 fal-i2v-service

> Node.js + Express-based **FAL AI Image-to-Video** integration
> Generates video by receiving a user prompt and an image. Supports both **synchronous (blocking)** and **queue + webhook** (recommended) methods.

---

## 🚀 Features

* [x] Express REST API
* [x] FAL AI integration with `@fal-ai/client`
* [x] API key management via .env
* [x] Synchronous video generation with prompt + image URL
* [x] Queue + Webhook for long-running tasks
* [x] File upload → automatic upload to FAL storage
* [x] Status & result endpoints
* [x] Pino logger + error middleware
* [x] Input validation with Zod

---

## 📦 Installation

### 1. Download the repo

```bash
git clone https://github.com/<your-username>/fal-i2v-service.git
cd fal-i2v-service
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Set the variables

Create a `.env` file in the root directory:

```env
PORT=3000
FAL_KEY=YOUR_FAL_API_KEY
PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run

```bash
npm run dev
```

Health check:

```bash
curl http://localhost:3000/health
# {"ok":true}
```

---

## 📂 File Structure

```
src/
├─ index.js # Express application
├─ routes/
│ ├─ i2v.js # I2V API routes
│ └─ webhooks.js # Webhook listener
├─ lib/
│ ├─ fal.js # FAL client wrapper

│ └─ validation.js # Zod schema

└─ utils/

├─ logger.js # Pino logger

└─ errors.js # Error handler
```

---

## 🔑 API Endpoints

### 1) Synchronous Video Production

Waits until the job is completed. Suitable for small jobs.

```http
POST /api/i2v/run-sync
Content-Type: application/json
```

Body:

```json
{ 
"prompt": "An intimate close-up ...", 
"image_url": "https://storage.googleapis.com/falserverless/example_inputs/ovi_i2v_input.png", 
"num_inference_steps": 30, 
"resolution": "992x512"
}
```

---

### 2) Queue + Webhook (Recommended)

For long lasting jobs.

```http
POST /api/i2v/submit
```

Return:

```json
{
"requestId": "764c-....",
"status": "SUBMITTED",
"webhookUrl": "http://localhost:3000/webhooks/fal/i2v"
}
```

Webhook → `/webhooks/fal/i2v`
Status query:

```http
GET /api/i2v/status/:id
```

Result:

```http
GET /api/i2v/result/:id
```

---

### 3) File Upload + Queue

Send image file with form-data:

```http
POST /api/i2v/submit-upload
```

Body:

```
prompt = "Some prompt..."
image = <file>
```

---

## 🛡️ Security Notes

* **FAL_KEY** should only be used in the backend. Never leak it to the client.
* Use a secret token or IP allowlist for webhook security.
* User prompts should be sanitized (e.g., inappropriate content filtering).
* Download looped videos to your own S3/GCS infrastructure for persistent storage.

---

## 📌 Roadmap

* [ ] MongoDB integration → job records
* [ ] Admin panel (React) → job list + video player
* [ ] User-based job management with JWT auth
* [ ] Dockerfile + CI/CD pipeline

---

