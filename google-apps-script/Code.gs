/**
 * @OnlyCurrentDoc
 *
 * IAHOF — Residência Facial e Corporal
 * Recebe os leads do formulário da landing page e grava na planilha
 * "Leads IAHOF - Residência Facial e Corporal" (aba "Página1").
 *
 * Este script precisa ser criado DENTRO da planilha (Extensões → Apps Script).
 * Ele só pede acesso à planilha atual (escopo spreadsheets.currentonly).
 * Como publicar: veja o README do projeto (seção "Leads na planilha").
 */
var SHEET_NAME = 'Página1';

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var d = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Anti-spam: campo invisível preenchido = robô
    if (d.website) return json_({ ok: true });

    var nome = clean_(d.nome, 120);
    var telefone = clean_(d.telefone, 30);
    if (!nome || telefone.replace(/\D/g, '').length < 10) {
      return json_({ ok: false, error: 'dados_invalidos' });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    sheet.appendRow([
      new Date(),
      nome,
      telefone,
      clean_(d.cta, 40),
      clean_(d.utm_source, 100),
      clean_(d.utm_medium, 100),
      clean_(d.utm_campaign, 150),
      clean_(d.utm_content, 150),
      clean_(d.utm_term, 150),
      clean_(d.pagina, 300)
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function doGet() {
  return json_({ ok: true, status: 'online' });
}

// Limita o tamanho e impede que o texto vire fórmula na planilha
function clean_(v, max) {
  var s = String(v == null ? '' : v).trim().slice(0, max || 200);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
