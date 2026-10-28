/**
 * @file primer_flow.cy.js
 * @description SE Primer — Sağlık Bilişimi Kriz Simülasyonu Uçtan Uca (E2E) Demo ve Test Paketi.
 * Mobil görünümde (iPhone X - 375x812) hem İYİ SON A hem de KÖTÜ SON B yollarını
 * baştan sona otomatik oynatarak ~45-55 saniyelik YouTube demo videosu üretir.
 */

describe('SE Primer: Kriz Simülasyonu Uçtan Uca Demo Akışı (İyi Son A & Kötü Son B)', () => {

  beforeEach(() => {
    // 1. Mobil Viewport Ayarı (iPhone X: 375x812)
    cy.viewport(375, 812);
  });

  it('Otomatik Kriz Yönetimi Demosu: Junior (Son A) ve Senior (Son B) Tam Akış', () => {
    // =========================================================================
    // BÖLÜM 1: JUNIOR AKIŞI -> İPUÇLARI -> 3 DOĞRU KARAR -> İYİ SON A (~25 Saniye)
    // =========================================================================

    // 1. Giriş ve Onboarding
    cy.visit('/');
    cy.wait(1500); // İzleyicinin başlığı ve nöbet çağrısını görmesi için

    cy.get('#screen-onboarding').should('be.visible');
    cy.get('#level-junior').should('be.checked');
    cy.get('#role-select').select('backend');
    cy.wait(1000);
    cy.get('#goal-select').select('incident_management');
    cy.wait(1500);

    // Kriz Başlatma
    cy.get('#btn-start-simulation').click();
    cy.wait(2000);

    // 2. Karar 1 (Mimari & Dayanıklılık)
    cy.get('#screen-crisis').should('be.visible');
    cy.get('#step-badge').should('contain', 'ADIM 1/3: MİMARİ DAYANIKLILIK');

    // Junior Bilişsel İskele / İpucu Kartı Kontrolü
    cy.get('#junior-hint-card').should('be.visible');
    cy.get('#hint-status-pill').should('be.visible');
    cy.get('#timer-badge').should('not.be.visible');
    cy.wait(2000);

    // Sokratik AI Tutor Etkileşimi
    cy.get('#tutor-input').type('Circuit breaker ve kuyruk kullanırsak DB rahatlar mı?', { delay: 45 });
    cy.wait(1000);
    cy.get('#tutor-send-btn').click();
    cy.wait(3000); // AI Tutor'un Sokratik cevabının okunabilmesi için bekleme

    // Karar 1: [A] Circuit Breaker & Kuyrukta Tamponlama (Doğru Karar)
    cy.get('#btn-option-a').click();
    cy.wait(2500); // Terminal logundaki iyileşmeyi izlemek için

    // 3. Karar 2 (Doğrulama & Test Güvenliği)
    cy.get('#step-badge').should('contain', 'ADIM 2/3: DOĞRULAMA & TEST GÜVENLİĞİ');
    cy.get('#junior-hint-card').should('be.visible').and('contain', 'blast radius');
    cy.wait(2000);

    // Karar 2: [A] Canary %5 Dağıtımı + Otomatik Smoke Test & Rollback (Doğru Karar)
    cy.get('#btn-option-a').click();
    cy.wait(2500);

    // 4. Karar 3 (KVKK & Sağlık Verisi Mevzuatı)
    cy.get('#step-badge').should('contain', 'ADIM 3/3: KVKK & SAĞLIK VERİSİ MEVZUATI');
    cy.get('#junior-hint-card').should('be.visible').and('contain', '6698 sayılı KVKK');
    cy.wait(2000);

    // Karar 3: [A] T.C. Kimlik ve Tanıları Maskele & Audit Trail Bırak (Doğru Karar)
    cy.get('#btn-option-a').click();
    cy.wait(2500);

    // 5. İYİ SON A Doğrulaması ve Post-Mortem İncelemesi
    cy.get('#screen-result').should('be.visible');
    cy.get('#result-badge').should('have.class', 'success')
      .and('contain', 'BAŞARILI: SİSTEM KURTARILDI');
    cy.get('#result-title').should('contain', 'Kriz Başarıyla Yönetildi!');
    cy.get('#metric-availability').should('contain', '%99.4');
    cy.get('#metric-data-loss').should('contain', '0 Hasta Randevusu');
    cy.get('#metric-kvkk-status').should('contain', 'Tam Uyumlu');
    cy.get('#metric-score').should('contain', '100/100');

    // Başmimar post-mortem raporunun video kaydında net okunması
    cy.wait(4000);

    // Raporu kopyalama butonuna tıklama
    cy.get('#btn-copy-report').click();
    cy.wait(1500);

    // Senior senaryosuna geçiş için sıfırlama
    cy.get('#btn-restart').click();
    cy.wait(2000);


    // =========================================================================
    // BÖLÜM 2: SENIOR AKIŞI -> 60sn SAYAÇ -> HATALI KARARLAR -> KÖTÜ SON B (~25 Saniye)
    // =========================================================================

    cy.get('#screen-onboarding').should('be.visible');
    // "Deneyimliyim" (Senior) modunu seç
    cy.get('#level-senior').check({ force: true });
    cy.wait(1000);
    cy.get('#role-select').select('devops');
    cy.wait(1000);
    cy.get('#goal-select').select('safe_deployment');
    cy.wait(1500);

    // Senior Krizini Başlat
    cy.get('#btn-start-simulation').click();
    cy.wait(2000);

    // 1. Karar (Mimari): 60sn Sayaç Baskısı Altında
    cy.get('#screen-crisis').should('be.visible');
    cy.get('#timer-badge').should('be.visible').and('contain', '⏱️ 00:');
    cy.get('#junior-hint-card').should('not.be.visible'); // Senior modunda ipucu gizlidir
    cy.wait(2000);

    // Sokratik AI Tutor'a Danışma
    cy.get('#tutor-input').type('DB hemen restart atsak düzelmez mi?', { delay: 45 });
    cy.wait(1000);
    cy.get('#tutor-send-btn').click();
    cy.wait(3000); // Sokratik uyarıyı görme süresi

    // Karar 1: [B] Havuzu 10 Katına Çıkar & Primary DB'ye Restart At (Riskli / Hatalı)
    cy.get('#btn-option-b').click();
    cy.wait(2500);

    // 2. Karar (Test): Canlıya Kontrolsüz Yama Dağıtımı
    cy.get('#step-badge').should('contain', 'ADIM 2/3: DOĞRULAMA & TEST GÜVENLİĞİ');
    cy.get('#timer-badge').should('be.visible');
    cy.wait(2000);

    // Karar 2: [B] Testleri Atla & Doğrudan Tüm Production Kümesine Dağıt (Hatalı)
    cy.get('#btn-option-b').click();
    cy.wait(2500);

    // 3. Karar (KVKK): Hasta Verilerini Açık Loglama
    cy.get('#step-badge').should('contain', 'ADIM 3/3: KVKK & SAĞLIK VERİSİ MEVZUATI');
    cy.get('#timer-badge').should('be.visible');
    cy.wait(2000);

    // Karar 3: [B] Ham İstek Gövdesini Genel Log Sunucusuna Yaz (Ağır İhlal)
    cy.get('#btn-option-b').click();
    cy.wait(2500);

    // 4. KÖTÜ SON B Doğrulaması ve İdari Yaptırım Uyarısı
    cy.get('#screen-result').should('be.visible');
    cy.get('#result-badge').should('have.class', 'failure')
      .and('contain', 'KRİTİK ÇÖKÜŞ & KVKK SORUŞTURMASI');
    cy.get('#result-title').should('contain', 'Sistem Çöktü ve KVKK İhlali Gerçekleşti!');
    cy.get('#metric-availability').should('contain', '%14.2');
    cy.get('#metric-data-loss').should('contain', '18.450');
    cy.get('#metric-kvkk-status').should('contain', 'Ağır İhlal');
    cy.get('#metric-score').should('contain', '0/100');

    // Post-mortem felaket raporunun video kaydında net okunması
    cy.wait(5000);
  });

});
