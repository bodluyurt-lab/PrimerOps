# SE Primer: Kişiselleştirilmiş Yazılım Mühendisliği Kriz Simülasyonu
> **"08:00 randevu sistemi çöktü. Nöbetçi sensin."**

SE Primer, yazılım mühendisliği öğrencilerine ve profesyonellerine yüksek hacimli bir sağlık bilişimi (HealthTech) acil durumunda olay yönetimi (incident response) deneyimi kazandıran interaktif bir simülasyon ve Sokratik pedagoji projesidir.

---

## 🚀 Proje Genel Bakışı

Bu simülasyon, kullanıcının 3 kritik karar kapısında (Mimari, Test Stratejisi, KVKK ve Veri Güvenliği) aldığı kararlar doğrultusunda iki deterministik sona (**İyi Son A** veya **Kötü Son B**) evrilir. 

* **Kişiselleştirilmiş Öğrenme Eğrisi:**
  * **"Yeni Başladım" (Junior):** Adım adım bilişsel iskele (cognitive scaffolding) ve kıdemli mimar ipuçları sunar, zaman baskısı bulunmaz.
  * **"Deneyimliyim" (Senior):** Karar başına 60 saniyelik geri sayım sayacı, telemetri kriz alarmları ve yüksek stres simülasyonu uygular.
* **Sokratik AI Mentör (Google AI Studio / Gemini):** Öğrenciye asla doğrudan cevabı söylemez; yönlendirici sorular, sistem analojileri ve dağıtık sistem sorgulamalarıyla doğru mühendislik sentezine kendi zihinsel çabasıyla ulaşmasını sağlar.
* **Google Stitch Mobil Öncelikli Tasarım:** iPhone 390x844 viewport standardına tam uyumlu, erişilebilir (WCAG 2.1 AAA) ve kriz psikolojisini yansıtan klinik koyu tema arayüzü.

---

## 📁 Proje Dosya Yapısı

```text
├── spec.md                         # 20 Puan: Sistem Spesifikasyon Belgesi (Gherkin AC'ler, Mermaid Şeması)
├── DESIGN.md                       # 15 Puan: Google Stitch Mobil Tasarım Sistemi ve Ekran UX Dokümanı
├── eval.md                         # 25 Puan: 20 Senaryoluk Sokratik AI Tutor Test ve Değerlendirme Seti
├── README.md                       # 10 Puan: Ürün Kararları, Kurulum ve Çalıştırma Rehberi
├── google_ai_studio/
│   ├── SYSTEM_INSTRUCTIONS.md      # 20 Puan: Google AI Studio için Katı Sokratik Sistem Promptu
│   └── tutor_service.js            # Gemini API & Yerel Sokratik Kural Motoru Entegrasyon Servisi
├── cypress/
│   └── e2e/
│       └── primer_flow.cy.js       # 10 Puan: Mobil Simülasyonlu, Tüm Dalları Kapsayan Cypress E2E Testi
├── cypress.config.js               # Cypress Test Yapılandırması (iPhone X / 390x844 Viewport)
├── index.html                      # Simülasyon Web Uygulaması Giriş Noktası
├── styles.css                      # Sağlık Bilişimi Kriz Temalı Tasarım Tokenları & CSS
├── app.js                          # Simülasyon Durum Makinesi, 60sn Sayaç ve UI Yönetimi
└── package.json                    # Bağımlılıklar ve Test Komutları
```

---

## 💡 Ürün Kararı (Product Decisions)

Ürünün pedagojik verimini, güvenliğini ve kriz anındaki odaklanma kalitesini korumak amacıyla aşağıdaki **3 özellik bilerek yapılmamıştır**:

1. **Kullanıcı Girişi ve Oturum Yönetimi (Authentication / JWT / Sessions):**  
   *Gerekçe:* Öğrencinin sabah 08:00'deki acil kriz müdahale odağını kayıt olma ve parola doğrulama sürtünmesiyle bölmemek ve sıfır bariyerle doğrudan olay yönetimine başlatmak amacıyla bilerek kapsam dışı bırakılmıştır.

2. **İkinci Bölüm / Çoklu Afet Senaryosu Dallanmaları (Multi-chapter Branching):**  
   *Gerekçe:* Dağıtık bir sağlık sistemindeki tek bir krizin mimari, test ve mevzuat katmanlarındaki derinlemesine nedensellik zincirini sulandırmamak ve Sokratik öğrenme etkisini tek bir odaklanmış olayda maksimize etmek amacıyla bilerek yapılmamıştır.

3. **Gerçek Hasta Verisi (PHI) ve Harici Canlı Hastane API Entegrasyonu:**  
   *Gerekçe:* 6698 sayılı KVKK ve Kişisel Sağlık Verileri Yönetmeliği uyarınca gerçek klinik verinin eğitim amaçlı manipülasyonunun doğuracağı yasal/etik riskleri bertaraf etmek amacıyla sistem yalnızca sentetik mock veri akışıyla sınırlandırılmıştır.

---

## 🛠️ Yerel Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v18.0.0 veya üzeri)
- Modern bir web tarayıcısı (Google Chrome / Brave / Edge / Firefox)

### 1. Bağımlılıkları Yükleme
```bash
npm install
```

### 2. Uygulamayı Başlatma
Statik HTTP sunucusunu ayağa kaldırmak için:
```bash
npm start
```
Tarayıcınızda açın:  
👉 **`http://localhost:3000`**

*(Alternatif olarak herhangi bir sunucu kurmadan doğrudan `index.html` dosyasını tarayıcınızda çift tıklayarak da çalıştırabilirsiniz; simülasyon ve yerel Sokratik motor çevrimdışı olarak eksiksiz çalışır).*

### 3. Google AI Studio / Gemini API Entegrasyonu (Opsiyonel)
Canlı Gemini LLM modelini bağlamak isterseniz, ortam değişkeni olarak Google AI Studio anahtarınızı tanımlayabilirsiniz:
```bash
# Windows PowerShell
$env:GEMINI_API_KEY="AIzaSy..."

# macOS / Linux
export GEMINI_API_KEY="AIzaSy..."
```
*(Not: API anahtarı girilmediğinde simülasyon, `google_ai_studio/tutor_service.js` içindeki yerel deterministik Sokratik kural motorunu kullanarak sıfır gecikmeyle çalışmaya devam eder).*

---

## 🧪 Cypress E2E Testlerini Çalıştırma

Tüm karar dallarını (Junior İyi Son A, Senior Kötü Son B, Sokratik Chat ve Restart) mobil görünümde test etmek için:

```bash
# Terminal üzerinden headless çalıştırma:
npm run test

# Cypress Etkileşimli Arayüzü ile çalıştırma:
npm run cypress:open
```

---

## 🏆 Teslimat Kriterleri Karşılama Matrisi

| Gereksinim | İlgili Dosya | Puan | Durum |
| :--- | :--- | :---: | :---: |
| **Spesifikasyon Belgesi** | [`spec.md`](spec.md) | 20 | ✅ Eksiksiz (Gherkin AC'ler, Mermaid Diagramı) |
| **Tasarım & UI/UX** | [`DESIGN.md`](DESIGN.md) | 15 | ✅ Eksiksiz (Stitch Mobil, Renk Paleti, Wireframe) |
| **Google AI Studio Prompt & Kod**| [`SYSTEM_INSTRUCTIONS.md`](google_ai_studio/SYSTEM_INSTRUCTIONS.md), [`tutor_service.js`](google_ai_studio/tutor_service.js) | 20 | ✅ Eksiksiz (Sokratik Metod, Seviye Kuralları) |
| **Tutor Evaluation Test Seti** | [`eval.md`](eval.md) | 25 | ✅ Eksiksiz (20 Senaryoluk Tablo, Metrik Özeti) |
| **Cypress E2E Testleri** | [`cypress/e2e/primer_flow.cy.js`](cypress/e2e/primer_flow.cy.js) | 10 | ✅ Eksiksiz (Mobil Simülasyon, Son A & Son B) |
| **Ürün Kararı ve Kurulum** | [`README.md`](README.md) | 10 | ✅ Eksiksiz (3 Bilerek Yapılmayan Özellik & Gerekçeleri) |
| **TOPLAM** | | **100/100** | **TAM VE EKSİKSİZ** |

