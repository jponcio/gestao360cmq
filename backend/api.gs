
/**
 * BI 360° Camaquã - API v2.0 (Full Sync)
 * 
 * Este script transforma seu Google Sheets em uma API JSON.
 */

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const data = {
    kanban: getSheetData(ss, "kanban_data"),
    okrs: getSheetData(ss, "okr_data"),
    swot: getSheetData(ss, "swot_data"),
    escuta: getSheetData(ss, "escuta_cidada"),
    config: getSheetData(ss, "configuracoes")
  };
  
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Roteamento de gravação baseada no tipo de dados
    if (payload.type === "SAVE_KANBAN") {
      updateSheet(ss, "kanban_data", payload.data);
    } else if (payload.type === "SAVE_OKR") {
      updateSheet(ss, "okr_data", payload.data);
    } else if (payload.type === "SAVE_SWOT") {
      updateSheet(ss, "swot_data", payload.data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({status: "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheetData(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  return values.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function updateSheet(ss, name, dataArray) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) return;
  sheet.clearContents();
  
  if (dataArray.length === 0) return;
  
  const headers = Object.keys(dataArray[0]);
  sheet.appendRow(headers);
  
  const rows = dataArray.map(item => headers.map(h => {
    const val = item[h];
    return typeof val === 'object' ? JSON.stringify(val) : val;
  }));
  
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}
