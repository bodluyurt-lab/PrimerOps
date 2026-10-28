/**
 * @file tutor_service.js
 * @description Google AI Studio / Gemini API Entegrasyon Servisi.
 * SE Primer Sağlık Bilişimi Kriz Simülasyonu için Sokratik Mentörlük modülü.
 */

// Sistem Talimatları (System Instructions) - Google AI Studio konfigürasyonu
const SYSTEM_INSTRUCTIONS_BASE = `
Sen; 20+ yıllık deneyime sahip, yüksek hacimli sağlık bilişimi sistemleri (Merkezi Randevu Sistemleri) yönetmiş "Kıdemli Sağlık Bilişimi Baş Mimarı ve Sokratik AI Eğitmenisin".
Görevin; 08:00'de randevu sistemi çöken hastane altyapısında nöbet tutan yazılım mühendisine (öğrenciye) mentörlük yapmaktır.

KATI SOKRATİK METOD İLKELERİ:
1. ASLA DOĞRUDAN CEVAP VERME: Öğrenciye asla "A şıkkını seç", "B yanlıştır", "Devre kesici açmalısın" deme.
2. SORUYLA DÜŞÜNDÜR: Öğrenciyi neden-sonuç ilişkisi kurmaya zorla (CAP teoremi, Thundering Herd, Cascade Failure, KVKK).
3. HASTA VERİSİ VE KVKK: 6698 sayılı kanunu ve hasta mahremiyetini kriz anında bile korumayı hatırlat.
4. KISA VE NET OL: Kriz ortamındasın, yanıtların en fazla 2 paragraf olmalıdır.
`;

class SocraticTutorService {
  /**
   * @param {Object} config
   * @param {string} [config.apiKey] - Google AI Studio Gemini API Key
   * @param {string} [config.model] - 'gemini-1.5-flash', 'gemini-2.5-flash' vb.
   * @param {string} [config.userLevel] - 'junior' | 'senior'
   * @param {string} [config.userRole] - 'backend' | 'frontend' | 'devops' | 'fullstack'
   * @param {string} [config.userGoal] - 'incident_management' | 'architecture' | 'kvkk'
   */
  constructor(config = {}) {
    this.apiKey = config.apiKey || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '') || '';
    this.model = config.model || 'gemini-1.5-flash';
    this.userLevel = config.userLevel || 'junior';
    this.userRole = config.userRole || 'backend';
    this.userGoal = config.userGoal || 'incident_management';
    this.history = [];
    this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models';
  }

  /**
   * Kullanıcı seviyesine ve o anki adıma göre sistem promptunu özelleştirir.
   */
  buildSystemInstruction(currentStep) {
    let levelDirectives = '';
    if (this.userLevel === 'junior') {
      levelDirectives = `
KULLANICI SEVİYESİ: JUNIOR (Yeni Başladım).
Pedagojik Ton: Destekleyici, motive edici, analojilerle açıklayan (örn: acil servis triyajı, vana benzetmesi).
Jargonu basitleştir ama mühendislik mantığını koru.`;
    } else {
      levelDirectives = `
KULLANICI SEVİYESİ: SENIOR (Deneyimliyim).
Pedagojik Ton: Sert, profesyonel, zaman baskısını hissettiren.
Terimler: P99 Latency, Cascading Failure, Thundering Herd, Connection Pool Saturation, Blast Radius, Audit Trail.`;
    }

    const stepContexts = {
      1: "ŞU ANKİ AŞAMA: Adım 1 - Mimari Dayanıklılık. 08:00 randevu patlaması, 500/500 connection pool tükenmesi, 504 Gateway Timeout. Seçenekler: (A) Circuit Breaker + Kafka Buffer vs (B) DB Pool 10x artırımı + Primary DB Restart.",
      2: "ŞU ANKİ AŞAMA: Adım 2 - Test Güvenliği. Canlıya hotfix çıkışı. Seçenekler: (A) Canary %5 Dağıtımı + Otomatik Smoke Test & Rollback vs (B) Testleri atlayıp tüm ortama doğrudan dağıtım.",
      3: "ŞU ANKİ AŞAMA: Adım 3 - KVKK & Log İnceleme. 504 veren hasta isteklerinin analizi. Seçenekler: (A) T.C. Kimlik & Tanı kodlarını dinamik maskeleme + Audit Trail vs (B) Ham istek gövdesini genel log sunucusuna basma."
    };

    return `${SYSTEM_INSTRUCTIONS_BASE}\n${levelDirectives}\n${stepContexts[currentStep] || ''}`;
  }

  /**
   * Google Gemini API'ye istek atar veya çevrimdışı Sokratik simülasyon motorunu çalıştırır.
   * @param {string} userMessage - Öğrencinin sorusu / ifadesi
   * @param {number} currentStep - 1, 2 veya 3
   * @returns {Promise<string>} Sokratik eğitmen yanıtı
   */
  async askTutor(userMessage, currentStep = 1) {
    const trimmed = (userMessage || '').trim();
    if (!trimmed) {
      return "Nöbetçi, şu an kritik bir krizin ortasındayız. Aklına takılan mimari veya operasyonel ikilemi söyle, birlikte sorgulayalım.";
    }

    // Google AI Studio API Anahtarı mevcutsa gerçek Gemini API'ye bağlan
    if (this.apiKey) {
      try {
        return await this.callGeminiAPI(trimmed, currentStep);
      } catch (err) {
        console.warn("[SocraticTutorService] Gemini API çağrısı başarısız oldu, yerel Sokratik motora geçiliyor:", err.message);
        return this.generateOfflineSocraticResponse(trimmed, currentStep);
      }
    }

    // API anahtarı yoksa deterministik yerel Sokratik kural motoru devreye girer
    return this.generateOfflineSocraticResponse(trimmed, currentStep);
  }

  /**
   * Gemini REST API çağrısı
   */
  async callGeminiAPI(userMessage, currentStep) {
    const systemPrompt = this.buildSystemInstruction(currentStep);
    const url = `${this.apiEndpoint}/${this.model}:generateContent?key=${this.apiKey}`;

    const requestBody = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        ...this.history,
        {
          role: "user",
          parts: [{ text: userMessage }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 350,
        topP: 0.8
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error("Boş Gemini yanıtı döndü.");
    }

    // Sohbet geçmişini güncelle
    this.history.push({ role: "user", parts: [{ text: userMessage }] });
    this.history.push({ role: "model", parts: [{ text: candidateText }] });

    return candidateText;
  }

  /**
   * Yerel / Çevrimdışı Sokratik Kural Motoru (Offline Socratic Rule Engine)
   * Asla cevabı doğrudan ifşa etmez; anahtar kelimelere ve pedagojik hedeflere göre yönlendirir.
   */
  generateOfflineSocraticResponse(userMessage, currentStep) {
    const lower = userMessage.toLowerCase();
    const isJunior = this.userLevel === 'junior';

    // 1. Doğrudan cevap koparma teşebbüsü ("Hangi buton?", "A mı B mi?", "Doğruyu söyle")
    if (lower.includes('hangi buton') || lower.includes('a mı') || lower.includes('b mi') || lower.includes('doğru cevap') || lower.includes('hangisini seç') || lower.includes('cevabı söyle')) {
      if (isJunior) {
        return "Nöbetçi, kararları senin yerine alırsam bu simülasyondan bir mühendislik refleksi kazanamazsın. Şöyle düşün: Acil servisin kapısında yığılma varken içerideki doktorların sayısını kontrolsüzce artırmak mı kilitlenmeyi çözer, yoksa kapıda düzenli bir hasta kabul sırası (kuyruk) oluşturmak mı?";
      } else {
        return "Nöbetçi mühendis sensin; kriz anında başmimardan doğrudan buton seçmesini bekleyemezsin. Connection pool ve bellek sınırlarını düşün: Sistemi anında fail-fast moduna alıp yükü tamponlamak ile doğrudan DB'yi yeniden başlatmak arasındaki blast radius (hasar yarıçapı) farkı nedir?";
      }
    }

    // Adım 1: Mimari Soruları
    if (currentStep === 1) {
      if (lower.includes('restart') || lower.includes('yeniden başlat') || lower.includes('pool') || lower.includes('havuz')) {
        return isJunior
          ? "Veritabanını tam şu an yeniden başlatırsan, sistem kapandığı anda dışarıda bekleyen 15.000 hastanın gönderdiği istekler ne olacak? Yeniden açıldığında bu istekler aynı anda hücum ederse ne yaşanır?"
          : "Primary DB'ye restart atmak TCP bağlantılarının sıfırlanmasına ve 'thundering herd' fırtınasına yol açmaz mı? Connection pool'u 10 katına çıkaracak RAM kapasiten ve DB IOPS bütçen var mı?";
      }
      if (lower.includes('circuit breaker') || lower.includes('devre kesici') || lower.includes('kuyruk') || lower.includes('kafka')) {
        return isJunior
          ? "Devre kesici sence elektriğin sigortası gibi olabilir mi? Sigorta atınca evin tesisatı yanmaktan kurtulur mu? Gelen randevu isteklerini bir kuyrukta bekletmek veritabanına nasıl bir nefes aldırır?"
          : "Circuit breaker açarak fast-failure döndüğünde P99 gecikmesini nasıl stabilize edersin? Kuyruğa alınan isteklerin idempotency (çift yazmama) garantisini nasıl sağlarsın?";
      }
    }

    // Adım 2: Test Soruları
    if (currentStep === 2) {
      if (lower.includes('test') || lower.includes('canary') || lower.includes('rollback') || lower.includes('hotfix')) {
        return isJunior
          ? "Evine yeni bir su borusu takarken ana vanayı sonuna kadar açıp evi su basma riskini mi alırsın, yoksa önce azıcık su verip sızdırma var mı diye bakar mısın? Canary dağıtımı sence neden %5 ile başlar?"
          : "Hotfix'i doğrudan tüm production podlarına geçmek ile %5'lik bir Canary grubuna yönlendirip otomatik rollback metriği izlemek arasındaki blast radius farkı nedir?";
      }
    }

    // Adım 3: KVKK Soruları
    if (currentStep === 3) {
      if (lower.includes('log') || lower.includes('tc') || lower.includes('kvkk') || lower.includes('hasta') || lower.includes('veri')) {
        return isJunior
          ? "Hata ayıklarken kolaylık olsun diye bir hastanın T.C. kimlik numarasını ve teşhisini açık loglara yazarsan, bu loglara erişebilecek herkes bu mahrem veriyi görmüş olmaz mı? 6698 sayılı KVKK sence neden bu konuda çok katı?"
          : "Kriz telaşı mühendisi yasal yükümlülüklerden muaf tutar mı? Audit trail (denetim izi) tutmadan açık PII/PHI loglaması yapmanın hastane yönetimine hukuki ve mali yaptırımı ne olur?";
      }
    }

    // Genel Sokratik Yanıt
    return isJunior
      ? "Kararını vermeden önce sistemin bir sonraki saniyede nasıl tepki vereceğini zihninde canlandır. Yaptığın hamle sistemi sakinleştirecek mi yoksa yangına körükle mi gidecek?"
      : "Mühendislik daima trade-off (ödünleşim) yönetimidir. Şu an hız mı arıyorsun, yoksa sistem kararlılığı ve veri bütünlüğü mü? Göz önünde bulundurduğun risk nedir?";
  }
}

// Ortam desteği: Node.js (CommonJS/ES) ve Tarayıcı (Window)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SocraticTutorService, SYSTEM_INSTRUCTIONS_BASE };
} else if (typeof window !== 'undefined') {
  window.SocraticTutorService = SocraticTutorService;
  window.SYSTEM_INSTRUCTIONS_BASE = SYSTEM_INSTRUCTIONS_BASE;
}

