
/**
 * BI 360° Camaquã - Backend (MVP)
 * Instruções:
 * 1. Cole este código no Apps Script da sua planilha (Extensões > Apps Script)
 * 2. Substitua os nomes das abas conforme necessário.
 * 3. Clique em 'Implantar' > 'Nova Implantação' > 'App da Web'
 */

function doGet(e) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  const data = {
    secretarias: getSheetData(spreadsheet, "secretarias"),
    indicadores: getSheetData(spreadsheet, "indicadores"),
    prioridades: getSheetData(spreadsheet, "prioridades_semanais"),
    entregas: getSheetData(spreadsheet, "entregas"),
    escuta: getSheetData(spreadsheet, "escuta_cidada")
  };
  
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  
  return rows.map(row => {
    let obj = {};
    headers.forEach((header, i) => {
      // Formata datas se necessário
      let val = row[i];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, "GMT-3", "yyyy-MM-dd");
      }
      obj[header] = val;
    });
    return obj;
  });
}

/**
 * Exemplo de função para registrar entrada via Form
 */
function onFormSubmit(e) {
  // Lógica para processar dados de formulários Google
  // e disparar alertas ou atualizações no BI
}
