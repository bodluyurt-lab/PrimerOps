# Tasarım ve Arayüz Spesifikasyonu (DESIGN.md)
## SE Primer — Kişiselleştirilmiş Sağlık Bilişimi Kriz Simülasyonu
**Tasarım Çerçevesi:** Google Stitch Mobile Design System & Responsive Web  
**Hedef Ekran Boyutu:** 390 x 844 px (iPhone 13/14/15/16 Viewport — Mobil Öncelikli)  
**Tasarım Dili:** Clinical High-Stakes Dark Theme (Sağlık Bilişimi Kriz Teması)

---

## 1. Tasarım Felsefesi ve Tasarım Dili

Simülasyon, kullanıcının sabah saat 08:00'de patlak veren bir sağlık altyapı krizini tek başına yönettiği yüksek stresli bir "on-call" senaryosudur. Arayüz dili, kullanıcının bilişsel yükünü optimize etmek, acil operasyonel telemetry (telemetri) verilerini hızla taratabilmek ve Sokratik AI Tutor ile kesintisiz bir mentörlük diyaloğu kurabilmek amacıyla **Google Stitch Mobile UI** tasarım prensiplerine uygun olarak kurgulanmıştır.

### 1.1. Renk Paleti (Klinik ve Kriz Temalı Token Sistemi)

| Tasarım Tokenı | Hex Kodu | Kullanım Alanı ve Anlamsal Karşılığı |
| :--- | :--- | :--- |
| `--color-bg-base` | `#0B0F19` | Ana zemin (Gece nöbeti ve derin konsantrasyon arka planı) |
| `--color-surface-card` | `#161F30` | Kartlar, log pencereleri, AI Tutor paneli arka planı |
| `--color-surface-border` | `#2A374D` | Kart ve buton kenarlıkları, hafif hiyerarşik ayırıcılar |
| `--color-emergency-red` | `#EF4444` | Kriz durumu, 504 Hataları, geri sayım kritik seviyesi (<15sn) |
| `--color-warning-amber` | `#F59E0B` | Süre uyarısı (15-30sn), dikkat çeken teknik riskler, uyarı logları |
| `--color-clinical-mint` | `#10B981` | Başarı, sistem kararlılığı (%99.2 SLA), KVKK Uyum Rozeti |
| `--color-tutor-indigo` | `#6366F1` | AI Tutor Sokratik asistan vurguları, yapay zekâ yanıt balonu |
| `--color-telemetry-cyan` | `#06B6D4` | Metrikler, aktif soket sayıları, mimari akış verileri |
| `--color-text-primary` | `#F8FAFC` | Birincil başlıklar ve yüksek kontrastlı buton metinleri |
| `--color-text-muted` | `#94A3B8` | Açıklama metinleri, alt etiketler, zaman damgaları |

### 1.2. Tipografi ve İkonografi
* **Arayüz Fontu:** `Inter`, `-apple-system`, `system-ui` (Modern, yüksek okunabilirlik, optik boyutlandırma).
* **Teknik Veri & Log Fontu:** `JetBrains Mono`, `ui-monospace`, `Courier New` (Canlı sunucu logları, JSON payload'ları, HTTP durum kodları).
* **İkonografi:** Modern SVG çizimler (Kalkan: KVKK, Şimşek: Hızlı Yük, Nabız: Sistem Sağlığı, Beyin: Sokratik Mentör, Sayaç: Zaman Baskısı).

### 1.3. Erişilebilirlik ve Mobil Uyumluluk (WCAG 2.1 AAA)
* **Dokunma Hedefleri (Touch Targets):** Mobil ekranlarda tüm butonlar ve seçim kartları minimum **48 x 48 px** tıklanabilir alanına sahiptir.
* **Kontrast Oranı:** Kritik metinlerde zemin ile kontrast oranı minimum 7:1 (AAA standart) seviyesindedir.
* **Haptik & Görsel İpuçları:** Yalnızca renkle değil; ikonlar, sesli simülasyon uyarıları ve animasyonlu kenar titreşimleriyle durum bildirilir.

---

## 2. Üç Temel Ekranın Detaylı UI/UX Tanımı

```
+-------------------------------------------------------------+
|                     EKRAN AKIŞ MİMARİSİ                     |
|                                                             |
|   +-------------------+     +---------------------------+   |
|   | 1. GİRİŞ EKRANI   | --> | 2. SAHNE / KARAR EKRANI   |   |
|   | (3 Soru & Profil) |     | (Log, Tutor, Sayaç, Buton)|   |
|   +-------------------+     +---------------------------+   |
|                                           |                 |
|                                           v                 |
|                             +---------------------------+   |
|                             | 3. SONUÇ EKRANI           |   |
|                             | (Son A vs Son B / Karne)  |   |
|                             +---------------------------+   |
+-------------------------------------------------------------+
```

---

### Ekran 1: Onboarding ve Giriş Ekranı (Seviye, Rol, Hedef Seçimi)

Bu ekran, nöbet öncesi mühendisin kimlik ve deneyim seviyesini belirler. Yapılan seçim simülasyonun zorluk motorunu (Zaman Baskısı vs. Bilişsel İskele) anında yapılandırır.

#### Arayüz Bileşen Hiyerarşisi:
1. **Header Bölümü:**
   - Hastane Logosu ve Kriz Başlığı: "Acil Durum Müdahale Masası (SE Primer)"
   - Saat Damgası Rozeti: "07:59:45 AM — Nöbet Değişimi"
2. **Soru 1: Deneyim Seviyesi (Segmented Toggle / Radio Card):**
   - *Seçenek A:* **"Yeni Başladım (Junior)"** -> Açıklama: "Her adımda kıdemli mimar ipuçları ve kavram sözlüğü eşliğinde ilerle. Sayaç baskısı yok." (Badge: 💡 Bilişsel Destek)
   - *Seçenek B:* **"Deneyimliyim (Senior)"** -> Açıklama: "Gerçek kriz deneyimi! Her karar için 60 saniyelik geri sayım sayacı ve yüksek stres telemetrisi." (Badge: ⏱️ 60sn Kriz Sayacı)
3. **Soru 2: Mühendislik Rolün (Dropdown / Chip Selector):**
   - Backend Mühendisi (Önerilen) | Frontend Mühendisi | DevOps / SRE | Fullstack
4. **Soru 3: Öğrenme Hedefin (Single Choice Chips):**
   - "Kriz Anında Mimari Kararlar" | "Üretim Test Güvenliği" | "KVKK & Sağlık Mevzuatı"
5. **CTA Butonu:**
   - "Nöbeti Devral ve Krize Başla (08:00)" (Göz alıcı acil durum kırmızısı/akıcı gradyan, 56px yükseklik).

#### Mobil ASCII Wireframe:
```text
+--------------------------------------------------+
| [⚡ MRS Kriz Merkezi]               07:59:58 AM  |
+--------------------------------------------------+
| POLİKLİNİK SİSTEMİ ÇÖKMEK ÜZERE!                 |
| Nöbetçi Mühendis Profilini Oluştur               |
|                                                  |
| 1. Deneyim Seviyen Nedir?                        |
| +----------------------------------------------+ |
| | (•) Yeni Başladım                            | |
| |     💡 Adım adım yönlendirici ipuçları       | |
| +----------------------------------------------+ |
| | ( ) Deneyimliyim                             | |
| |     ⏱️ Karar başına 60 sn süre baskısı       | |
| +----------------------------------------------+ |
|                                                  |
| 2. Rolün: [ Backend Mühendisi            ▼ ]   |
|                                                  |
| 3. Birincil Hedefin:                             |
| [ Kriz Mimarisi ]  [ Canlı Testi ]  [ KVKK ]     |
|                                                  |
| +----------------------------------------------+ |
| |   [🚨 NÖBETİ DEVRAL VE KRİZE BAŞLA (08:00)]   | |
| +----------------------------------------------+ |
+--------------------------------------------------+
```

---

### Ekran 2: Sahne / Karar Ekranı (Senaryo, Canlı Log, Sokratik AI Tutor ve Karar Butonları)

Bu ekran simülasyonun çekirdeğidir. Ekran dikeyde 4 odak bölgesine ayrılmıştır:

#### Arayüz Bileşen Hiyerarşisi:
1. **Canlı Telemetri Barı (Fixed Top):**
   - Adım Sayacı: "Adım 1/3: Mimari Dayanıklılık"
   - Sistem Sağlığı İlerleme Çubuğu: (Örn: `%18 - Kritik Durum`)
   - Kişiselleştirme Rozeti:
     - *Senior Mod:* Kırmızı uyarı sayaç kutucuğu (`⏱️ 00:48`) — Kalan süre 15 saniyenin altına indiğinde titreme animasyonu tetiklenir.
     - *Junior Mod:* Sarı ampul rozeti (`💡 İpucu Açık`).
2. **Kriz Senaryo Kartı & Canlı Log Terminali:**
   - Canlı terminal görünümünde HTTP 504 / Connection pool exhaustion logları:
     ```text
     [08:00:12 ERR] appointment-db-pool: timeout 30000ms reached
     [08:00:14 CRT] active_connections: 500/500 (QUEUE_OVERFLOW)
     [08:00:15 WRN] 1,420 pending requests waiting for slot
     ```
3. **Kişiselleştirilmiş İpucu Kartı (Yalnızca "Yeni Başladım" Seçildiğinde):**
   - Açılır-kapanır akordeon: *"💡 Kıdemli Mimar İpucu: Veritabanını aniden yeniden başlatmak, biriken 15.000 isteğin aynı anda veritabanına hücum etmesine (thundering herd) neden olabilir."*
4. **Sokratik AI Tutor İnteraktif Paneli:**
   - Katlanabilir / mesajlaşma modalı. Kullanıcı "Hangi seçeneği seçmeliyim?" veya "Circuit breaker burada ne işe yarar?" diye yazar.
   - AI Tutor, asla doğrudan "A'yı seç" demez; Sokratik pedagojiyle *"Trafik dalgasını bir baraj gibi düşün; suyu tamamen kesmek mi yoksa kontrollü bir yan kanala tahliye etmek mi türbinleri korur?"* şeklinde rehberlik eder.
5. **Karar Butonları (Action Grid - Bottom Sheet):**
   - Karar 1 için 2 alternatif seçenek:
     - **Seçenek A (Doğru):** `[Devre Kesici (Circuit Breaker) Aç & Gelen İstekleri Kafka Kuyruğuna Tamponla]`
     - **Seçenek B (Hatalı):** `[Bağlantı Havuzunu 10 Katına Çıkar & Primary DB'ye Anında Restart At]`

#### Mobil ASCII Wireframe:
```text
+--------------------------------------------------+
| ADIM 1/3: MİMARİ KARAR           ⏱️ 00:42 [KRİTİK]|
+--------------------------------------------------+
| Sistem Sağlığı: [██░░░░░░░░░░] %20 - Çöküş Eşiği |
+--------------------------------------------------+
| 📟 CANLI LOG AKIŞI (MRS-CORE-POD-3)              |
| [08:00:12] ERROR: DB pool exhausted (500/500)    |
| [08:00:14] WARN : 1,450 requests queued          |
+--------------------------------------------------+
| 💡 KIDEMLİ MİMAR İPUCU (Junior Mod):             |
| DB'ye restart atmak kuyruktaki isteklerin aynı    |
| anda hücum etmesine (thundering herd) yol açar.  |
+--------------------------------------------------+
| 🤖 Sokratik AI Tutor                             |
| Öğrenci: "DB havuzunu büyüteyim mi?"             |
| Tutor  : "Bellek ve CPU sınırlarını düşündüğünde |
|           havuzu büyütmek kilitlenmeyi çözer mi  |
|           yoksa daha derin bir darboğaza mı iter?|
| [AI Tutor'a Soru Sor...                      ][>]|
+--------------------------------------------------+
| KRİTİK SEÇİMİNİ YAP:                             |
| +----------------------------------------------+ |
| | [A] Circuit Breaker Aç & Kuyrukta Tamponla   | |
| +----------------------------------------------+ |
| | [B] DB Pool'u 10x Yap & Primary DB Restart   | |
| +----------------------------------------------+ |
+--------------------------------------------------+
```

---

### Ekran 3: Sonuç ve Post-Mortem Ekranı (Son A vs. Son B)

Simülasyonun 3 karar adımı bittiğinde, kullanıcının kararlarının bileşke puanı hesaplanır ve iki zıt son ekrana yansıtılır.

#### 1. Durum: Son A — Kriz Başarıyla Yönetildi (İyi Son)
* **Kriter:** Kullanıcının en az 2 doğru karar alması ve KVKK kapısında hasta verilerini maskelemesi.
* **Görsel Tema:** Zümrüt Yeşili (`#10B981`) vurgulu başarı rozetleri ve konfeti mikro-etkileşimi.
* **Metrikler:**
  - Sistem Erişilebilirliği: `%99.4`
  - Veri Kaybı: `0 Kayıt`
  - KVKK Denetim Sonucu: `Tam Uyumlu (Audit Trail Onaylı)`
  - Çözüm Süresi: `12 Dakika`
* **Kıdemli Başmimar Post-Mortem Raporu:**
  - *"Tebrikler Nöbetçi! Kuyruğu Kafka ile tamponlayarak veritabanının çökmesini engelledin. Canary testi sayesinde olası regresyonları üretim trafiğinden izole ettin ve hasta T.C. kimlik numaralarını maskeleyerek hastaneyi milyonlarca liralık KVKK cezasından kurtardın."*

#### 2. Durum: Son B — Katastrofik Çöküş ve Hukuki Soruşturma (Kötü Son)
* **Kriter:** Kullanıcının 2 veya daha fazla hatalı karar alması veya KVKK kapısında hasta verilerini açık loglaması.
* **Görsel Tema:** Yanıp sönen Acil Kırmızı (`#EF4444`) sınır çizgileri ve "Kritik Başarısızlık" mührü.
* **Metrikler:**
  - Sistem Erişilebilirliği: `%14.2` (Kesinti Devam Ediyor)
  - Kayıp / Başarısız Randevu: `18.450 Randevu`
  - KVKK İhlal Bildirimi: `Açık Log Sızıntısı (Kişisel Verileri Koruma Kurulu Soruşturması)`
  - Hastane Finansal / İtibar Kaybı: `Ağır Risk`
* **Kıdemli Başmimar Post-Mortem Raporu:**
  - *"Maalesef felaket yaşandı. Veritabanını aniden yeniden başlatman kaskad kilitlenmeye (deadlock cascade) yol açtı. Testleri atlayıp tüm ortama yama geçmen hatayı yaydı ve en kötüsü hasta sağlık verilerini açık loglara dökmen sebebiyle Kişisel Verileri Koruma Kurulu hastaneye soruşturma açtı."*

#### Aksiyonlar:
- **"Nöbeti Yeniden Başlat (Ders Çıkararak Tekrar Oyna)"**
- **"Post-Mortem Raporunu Kopyala (Markdown Formatı)"**

#### Mobil ASCII Wireframe (Sonuç Ekranı):
```text
+--------------------------------------------------+
| 📋 RESMİ OLAY RAPORU (POST-MORTEM)              |
+--------------------------------------------------+
|                                                  |
|       ✅ KRİZ BAŞARIYLA YÖNETİLDİ (SON A)        |
|          "Sistem Kurtarıldı, SLA Korundu"        |
|                                                  |
| METRİK KARNESİ:                                  |
| • Erişilebilirlik : [%99.4]  (Hedef: >%99.0)    |
| • Veri Kaybı      : 0 Hasta Randevusu            |
| • KVKK Uyumu      : 🛡️ Tam Uyumlu               |
| • Mühendislik Skoru: 95/100                      |
|                                                  |
| 📝 KIDEMLİ BAŞMİMAR NOTU:                        |
| Kuyruğu izole etmen ve logları maskelemen        |
| hastane operasyonunun can damarını kurtardı.     |
|                                                  |
| +----------------------------------------------+ |
| |       [🔄 NÖBETİ YENİDEN BAŞLAT]             | |
| +----------------------------------------------+ |
| |       [📋 POST-MORTEM RAPORUNU KOPYALA]      | |
| +----------------------------------------------+ |
+--------------------------------------------------+
```

---

## 3. Durumlar ve Mikro-Etkileşimler (State & Motion)

1. **Timer Darboğazı:** Kalan süre 10 saniyenin altına indiğinde sayaç arka planı `rgba(239, 68, 68, 0.2)` ile pulsatif kırmızı yanıp söner.
2. **Karar Onayı:** Butona tıklandığında buton yüzeyinde 250ms'lik bir yükleme animasyonu gösterilir ("Kritik yama uygulanıyor...") ve ardından canlı log terminaline kararın etkisi yazdırılır.
3. **AI Tutor Yanıt Akışı:** LLM yanıtı arayüzde daktilo efekti (streaming text) ve düşünme balonu simülasyonu ile yumuşak bir biçimde render edilir.

