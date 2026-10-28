/**
 * @file app.js
 * @description SE Primer — Sağlık Bilişimi Kriz Simülasyonu İstemci Motoru.
 */

// Simülasyon Durum Değişkenleri
const SimulationState = {
  currentScreen: 'onboarding', // 'onboarding' | 'crisis' | 'result'
  currentStep: 1, // 1 (Mimari), 2 (Test), 3 (KVKK)
  userLevel: 'junior', // 'junior' | 'senior'
  userRole: 'backend',
  userGoal: 'incident_management',
  score: 0,
  decisions: [],
  timerInterval: null,
  remainingSeconds: 60,
  tutorService: null
};

// Adım Konfigürasyonları
const STEP_DATA = {
  1: {
    indicator: "ADIM 1/3: MİMARİ DAYANIKLILIK",
    title: "08:00 Randevu Patlaması & Connection Pool Tükenmesi",
    description: "08:00'de poliklinik randevuları açıldı! Olağan trafiğin 18 katı yük geldi. Randevu Servisi ile veritabanı arasındaki bağlantı havuzu (500/500) tamamen kilitlendi. Binlerce hasta '504 Gateway Timeout' alıyor.",
    healthPct: 20,
    healthLabel: "20% (Kritik Çöküş Eşiği)",
    logs: [
      { type: 'err', text: '[08:00:03 ERR] DB Connection Pool (500/500) SATURATED' },
      { type: 'wrn', text: '[08:00:05 WRN] P99 Latency: 48,200ms (> SLA 200ms)' },
      { type: 'crit', text: '[08:00:08 CRT] 504 Gateway Timeout Rate: %94.6' }
    ],
    hint: "Veritabanını ani yeniden başlatmak (restart), dışarıda bekleyen 15.000 isteğin sistem açıldığı an aynı anda yüklenmesine (thundering herd problemi) yol açar.",
    prompt: "Hangi Acil Mimari Müdahaleyi Yapacaksın?",
    optionA: {
      label: "Devre Kesici (Circuit Breaker) Aç & Kuyrukta Tamponla",
      sub: "Gelen trafiğe fast-fail dön; randevu taleplerini Kafka/RabbitMQ kuyruğunda asenkron tamponlayarak veritabanını koru.",
      score: 35,
      isCorrect: true
    },
    optionB: {
      label: "Havuzu 10 Katına Çıkar & Primary DB'ye Restart At",
      sub: "Bağlantı sınırını 5.000 yap ve kilitlenen soketleri temizlemek için canlı ana veritabanını hemen yeniden başlat.",
      score: 0,
      isCorrect: false
    }
  },
  2: {
    indicator: "ADIM 2/3: DOĞRULAMA & TEST GÜVENLİĞİ",
    title: "Canlıya Hotfix Yama Dağıtımı",
    description: "Yazılım ekibi sorgu optimizasyonu ve indeks düzeltmesi içeren acil bir yama (hotfix) hazırladı. Sistem hâlâ yüksek yük altında.",
    healthPct: 55,
    healthLabel: "55% (Yük İzolasyonu Sağlandı)",
    logs: [
      { type: 'ok', text: '[08:04:15 OK ] Hotfix container built: mrs-service:v2.4.1-hotfix' },
      { type: 'wrn', text: '[08:04:18 WRN] DB Connection Pool recovering, load steady at %65' },
      { type: 'wrn', text: '[08:04:22 WRN] Pending traffic: 8,400 queued requests' }
    ],
    hint: "Kriz anında bile tüm production ortamına körlemesine dağıtım yapmak, gizli bir bellek sızıntısında tüm hastaneyi ikinci kez düşürür. Riski izole etmek (blast radius) şarttır.",
    prompt: "Yamayı Canlıya Nasıl Dağıtacaksın?",
    optionA: {
      label: "Canary %5 Dağıtımı + Otomatik Smoke Test & Rollback",
      sub: "Trafiğin sadece %5'ini yeni sürüme aktar; hata oranı %1'i geçerse dağıtımı otomatik geriye al.",
      score: 35,
      isCorrect: true
    },
    optionB: {
      label: "Testleri Atla & Doğrudan Tüm Production Kümesine Dağıt",
      sub: "Zaman daralıyor! Test ve canary adımlarını baypas edip yamayı aynı anda tüm podlara bas.",
      score: 0,
      isCorrect: false
    }
  },
  3: {
    indicator: "ADIM 3/3: KVKK & SAĞLIK VERİSİ MEVZUATI",
    title: "Hata Logları ve Hasta Verisi İncelemesi",
    description: "Kriz anında 504 hatası alan hasta randevularının durumunu teyit etmek için log izleme sisteminde hata gövdelerinin (payload) incelenmesi talep ediliyor.",
    healthPct: 80,
    healthLabel: "80% (Kararlılık Sağlanıyor)",
    logs: [
      { type: 'wrn', text: '[08:07:30 WRN] 1,120 failed appointment records detected in dead-letter' },
      { type: 'err', text: '[08:07:34 ERR] Payload contains: T.C. Kimlik, Poliklinik Tanı Kodu (ICD-10)' },
      { type: 'crit', text: '[08:07:38 CRT] KVKK Denetim Alarmı: Sağlık verisi loglama riski' }
    ],
    hint: "6698 sayılı KVKK ve Kişisel Sağlık Verileri Yönetmeliği uyarınca; sistem arızası olsa dahi hastanın T.C. Kimlik ve tıbbi teşhis verileri açık/maskelenmemiş olarak loglanamaz.",
    prompt: "Hata Ayıklama Loglarını Nasıl Yöneteceksin?",
    optionA: {
      label: "T.C. Kimlik ve Tanıları Maskele & Erişim Denetim İzi (Audit Trail) Bırak",
      sub: "Hassas kimlikleri '123*****89' şeklinde maskele; loga erişen mühendisin kimliğini kriptografik audit trail ile kaydet.",
      score: 30,
      isCorrect: true
    },
    optionB: {
      label: "Hızlı Analiz İçin Ham İstek Gövdesini Genel Log Sunucusuna Yaz",
      sub: "Maskeleme ile vakit kaybetme; hastaların tüm T.C. ve şikayet verilerini üçüncü parti log sunucusuna bas.",
      score: 0,
      isCorrect: false
    }
  }
};

// DOM Elemanları
const screens = {
  onboarding: document.getElementById('screen-onboarding'),
  crisis: document.getElementById('screen-crisis'),
  result: document.getElementById('screen-result')
};

const formOnboarding = document.getElementById('form-onboarding');
const stepBadge = document.getElementById('step-badge');
const timerBadge = document.getElementById('timer-badge');
const hintStatusPill = document.getElementById('hint-status-pill');
const healthBarFill = document.getElementById('health-bar-fill');
const healthBarText = document.getElementById('health-bar-text');
const crisisTitle = document.getElementById('crisis-title');
const crisisDescription = document.getElementById('crisis-description');
const terminalLogs = document.getElementById('terminal-logs');
const juniorHintCard = document.getElementById('junior-hint-card');
const juniorHintText = document.getElementById('junior-hint-text');

const tutorMessages = document.getElementById('tutor-messages');
const tutorForm = document.getElementById('tutor-form');
const tutorInput = document.getElementById('tutor-input');

const decisionPrompt = document.getElementById('decision-prompt');
const btnOptionA = document.getElementById('btn-option-a');
const labelOptionA = document.getElementById('label-option-a');
const subOptionA = document.getElementById('sub-option-a');

const btnOptionB = document.getElementById('btn-option-b');
const labelOptionB = document.getElementById('label-option-b');
const subOptionB = document.getElementById('sub-option-b');

const resultBadgeContainer = document.getElementById('result-badge-container');
const resultTitle = document.getElementById('result-title');
const resultSubtitle = document.getElementById('result-subtitle');
const metricAvailability = document.getElementById('metric-availability');
const metricDataLoss = document.getElementById('metric-data-loss');
const metricKvkkStatus = document.getElementById('metric-kvkk-status');
const metricScore = document.getElementById('metric-score');
const postMortemText = document.getElementById('post-mortem-text');
const btnRestart = document.getElementById('btn-restart');
const btnCopyReport = document.getElementById('btn-copy-report');

// Ekran Değiştirme Fonksiyonu
function switchScreen(screenName) {
  Object.keys(screens).forEach(name => {
    screens[name].classList.toggle('active', name === screenName);
  });
  SimulationState.currentScreen = screenName;
}

// Onboarding Başlatma
formOnboarding.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(formOnboarding);
  SimulationState.userLevel = formData.get('userLevel') || 'junior';
  SimulationState.userRole = formData.get('userRole') || 'backend';
  SimulationState.userGoal = formData.get('userGoal') || 'incident_management';

  // Sokratik AI Eğitmen Servisini Başlat
  const SocraticClass = (typeof SocraticTutorService !== 'undefined') ? SocraticTutorService : window.SocraticTutorService;
  SimulationState.tutorService = new SocraticClass({
    userLevel: SimulationState.userLevel,
    userRole: SimulationState.userRole,
    userGoal: SimulationState.userGoal
  });

  // Kriz Ekranına Geç
  SimulationState.currentStep = 1;
  SimulationState.score = 0;
  SimulationState.decisions = [];
  loadStep(1);
  switchScreen('crisis');
});

// Adım Yükleme Fonksiyonu
function loadStep(stepNumber) {
  SimulationState.currentStep = stepNumber;
  const data = STEP_DATA[stepNumber];

  // Telemetri ve Başlıklar
  stepBadge.textContent = data.indicator;
  crisisTitle.textContent = data.title;
  crisisDescription.textContent = data.description;
  healthBarFill.style.width = `${data.healthPct}%`;
  healthBarText.textContent = data.healthLabel;

  // Terminal Logları
  terminalLogs.innerHTML = data.logs.map(log => `<div class="log-line ${log.type}">${log.text}</div>`).join('');

  // Buton Metinleri
  decisionPrompt.textContent = data.prompt;
  labelOptionA.textContent = data.optionA.label;
  subOptionA.textContent = data.optionA.sub;
  labelOptionB.textContent = data.optionB.label;
  subOptionB.textContent = data.optionB.sub;

  // Kişiselleştirme: Yeni Başladım vs. Deneyimliyim
  if (SimulationState.userLevel === 'junior') {
    // İpucu Kartı Göster, Sayaç Kapat
    juniorHintCard.classList.add('visible');
    juniorHintText.textContent = data.hint;
    hintStatusPill.classList.add('visible');
    timerBadge.classList.remove('visible');
    stopTimer();
  } else {
    // Senior: İpucu Gizle, 60sn Sayaç Başlat
    juniorHintCard.classList.remove('visible');
    hintStatusPill.classList.remove('visible');
    timerBadge.classList.add('visible');
    startTimer();
  }
}

// 60 Saniyelik Stres Sayacı (Senior Modu)
function startTimer() {
  stopTimer();
  SimulationState.remainingSeconds = 60;
  updateTimerUI();

  SimulationState.timerInterval = setInterval(() => {
    SimulationState.remainingSeconds--;
    updateTimerUI();

    if (SimulationState.remainingSeconds <= 0) {
      stopTimer();
      handleTimeout();
    }
  }, 1000);
}

function stopTimer() {
  if (SimulationState.timerInterval) {
    clearInterval(SimulationState.timerInterval);
    SimulationState.timerInterval = null;
  }
}

function updateTimerUI() {
  const secs = SimulationState.remainingSeconds;
  timerBadge.textContent = `⏱️ 00:${secs < 10 ? '0' : ''}${secs}`;

  if (secs <= 15) {
    timerBadge.classList.add('panic');
  } else {
    timerBadge.classList.remove('panic');
  }
}

// Süre Aşımı (Timeout) Davranışı
function handleTimeout() {
  alert("⏱️ SÜRE DOLDU! Yüksek trafik altında karar verilemediği için sistem varsayılan riskli yola sürüklendi.");
  // Süre dolduğunda riskli B seçeneği işletilir
  handleDecision('B');
}

// Karar Verme Fonksiyonu
function handleDecision(choice) {
  stopTimer();
  const currentData = STEP_DATA[SimulationState.currentStep];
  const chosenOption = choice === 'A' ? currentData.optionA : currentData.optionB;

  SimulationState.score += chosenOption.score;
  SimulationState.decisions.push({
    step: SimulationState.currentStep,
    choice: choice,
    isCorrect: chosenOption.isCorrect,
    earnedScore: chosenOption.score
  });

  // Terminale karar yansıması
  const logType = chosenOption.isCorrect ? 'ok' : 'crit';
  const logPrefix = chosenOption.isCorrect ? '[KARAR UYGULANDI - İYİLEŞME]' : '[KARAR UYGULANDI - RİSK TETİKLENDİ]';
  const newLog = document.createElement('div');
  newLog.className = `log-line ${logType}`;
  newLog.textContent = `${logPrefix} ${chosenOption.label}`;
  terminalLogs.appendChild(newLog);
  terminalLogs.scrollTop = terminalLogs.scrollHeight;

  // Sonraki Adıma Geç veya Sonucu Göster
  setTimeout(() => {
    if (SimulationState.currentStep < 3) {
      loadStep(SimulationState.currentStep + 1);
    } else {
      renderResultScreen();
      switchScreen('result');
    }
  }, 350);
}

btnOptionA.addEventListener('click', () => handleDecision('A'));
btnOptionB.addEventListener('click', () => handleDecision('B'));

// Sokratik AI Tutor Sohbet Olayı
tutorForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = tutorInput.value.trim();
  if (!query) return;

  // Kullanıcı Mesajını Ekle
  appendChatMessage(query, 'user');
  tutorInput.value = '';

  // Düşünüyor Balonu
  const thinkingId = appendChatMessage("Düşünüyor...", 'tutor');

  try {
    const response = await SimulationState.tutorService.askTutor(query, SimulationState.currentStep);
    updateChatMessage(thinkingId, response);
  } catch (err) {
    updateChatMessage(thinkingId, "Nöbetçi, şu an telemetri hatları yoğun. Ama unutma: Sisteme körlemesine müdahale etmek mi yoksa riski sınırlamak mı daha emniyetlidir?");
  }
});

function appendChatMessage(text, sender) {
  const msgEl = document.createElement('div');
  msgEl.className = `tutor-msg ${sender}`;
  msgEl.id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const p = document.createElement('p');
  p.textContent = text;
  msgEl.appendChild(p);
  tutorMessages.appendChild(msgEl);
  tutorMessages.scrollTop = tutorMessages.scrollHeight;
  return msgEl.id;
}

function updateChatMessage(id, newText) {
  const el = document.getElementById(id);
  if (el) {
    const p = el.querySelector('p');
    if (p) p.textContent = newText;
    tutorMessages.scrollTop = tutorMessages.scrollHeight;
  }
}

// Sonuç Ekranı Render Motoru (Son A vs Son B)
function renderResultScreen() {
  const totalScore = SimulationState.score;
  const correctCount = SimulationState.decisions.filter(d => d.isCorrect).length;
  const kvkkDecision = SimulationState.decisions.find(d => d.step === 3);
  const isKvkkSafe = kvkkDecision && kvkkDecision.isCorrect;

  // Başarı Kuralı: En az 2 doğru ve KVKK ihlali olmaması
  const isSuccess = correctCount >= 2 && isKvkkSafe;

  metricScore.textContent = `${totalScore}/100`;

  if (isSuccess) {
    // ==================== SON A: İYİ SON ====================
    resultBadgeContainer.innerHTML = `
      <div class="outcome-badge success" id="result-badge">
        <span>🛡️</span>
        <span>BAŞARILI: SİSTEM KURTARILDI</span>
      </div>
    `;
    resultTitle.textContent = "Kriz Başarıyla Yönetildi!";
    resultSubtitle.textContent = "Merkezi Randevu Sistemi ayakta tutuldu, hasta mağduriyeti ve KVKK cezası önlendi.";

    metricAvailability.textContent = "%99.4 (SLA Korundu)";
    metricAvailability.style.color = "var(--color-clinical-mint)";
    metricDataLoss.textContent = "0 Hasta Randevusu";
    metricKvkkStatus.textContent = "🛡️ Tam Uyumlu (Audit Trail Onaylı)";
    metricKvkkStatus.style.color = "var(--color-clinical-mint)";

    postMortemText.textContent = `
Kıdemli Başmimar Post-Mortem Notu:
"Harika bir mühendislik refleksine şahit olduk. 08:00'deki 18x ani yük dalgasında Circuit Breaker açarak veritabanının kaskad kilitlenmesini engelledin ve istekleri Kafka kuyruğunda tamponladın. Canlıya çıkışta Canary stratejisi (%5) kullanarak blast radius'u sıfıra indirdin. En önemlisi; 6698 sayılı KVKK ilkelerinden taviz vermeyerek hasta T.C. kimlik numaralarını ve sağlık tanılarını kriptografik denetim iziyle (audit trail) maskeledin. Tebrikler Nöbetçi, hastane altyapısını felaketten kurtardın!"
    `.trim();

  } else {
    // ==================== SON B: KÖTÜ SON ====================
    resultBadgeContainer.innerHTML = `
      <div class="outcome-badge failure" id="result-badge">
        <span>🚨</span>
        <span>KRİTİK ÇÖKÜŞ & KVKK SORUŞTURMASI</span>
      </div>
    `;
    resultTitle.textContent = "Sistem Çöktü ve KVKK İhlali Gerçekleşti!";
    resultSubtitle.textContent = "Veritabanı kilitlendi, poliklinik randevuları durdu ve kişisel sağlık verileri sızdırıldı.";

    metricAvailability.textContent = "%14.2 (Kesinti Devam Ediyor)";
    metricAvailability.style.color = "var(--color-emergency-red)";
    metricDataLoss.textContent = ">18.450 Başarısız Randevu";
    metricKvkkStatus.textContent = "⚠️ Ağır İhlal (Kurul Soruşturması)";
    metricKvkkStatus.style.color = "var(--color-emergency-red)";

    postMortemText.textContent = `
Kıdemli Başmimar Post-Mortem Notu:
"Maalesef operasyon katastrofik bir başarısızlıkla sonuçlandı. Canlı veritabanına doğrudan restart atmak veya testleri atlayarak tüm ortama kontrolsüz hotfix basmak thundering herd fırtınasını körükledi. Ancak en vahimi; kriz telaşıyla hasta T.C. kimlik ve tanı kodlarını maskesiz şekilde log sunucusuna basman oldu. Kişisel Verileri Koruma Kurulu (KVKK) hastane aleyhine resmi idari soruşturma başlattı. Bu simülasyondan çıkarılacak ders: Kriz anında mühendislik disiplini ve mevzuat uyumu asla terk edilemez."
    `.trim();
  }
}

// Yeniden Başlatma
btnRestart.addEventListener('click', () => {
  stopTimer();
  switchScreen('onboarding');
});

// Rapor Kopyalama
btnCopyReport.addEventListener('click', () => {
  const reportText = `SE Primer Kriz Raporu\nSkor: ${metricScore.textContent}\nErişilebilirlik: ${metricAvailability.textContent}\nKVKK: ${metricKvkkStatus.textContent}\n\n${postMortemText.textContent}`;
  navigator.clipboard.writeText(reportText).then(() => {
    alert("📋 Post-Mortem raporu panoya kopyalandı!");
  }).catch(() => {
    alert("Rapor panoya kopyalanamadı.");
  });
});

