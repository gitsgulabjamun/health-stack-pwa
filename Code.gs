var SHEET_NAME = 'TrackerLog';
var HEADERS = ['id','date','weight','waist','restingHR','bpSys','bpDia','glucose','hba1c','ldl','triglycerides','hdl','notes','savedAt'];

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.getRange(1,1,1,HEADERS.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || 'list';
    if (action === 'schedule') { return json_({ ok: true, schedule: readSchedule_() }); }
    if (action === 'guardrails') { return json_({ ok: true, guardrails: readGuardrails_() }); }
    var sh = getSheet_();
    var values = sh.getDataRange().getValues();
    var rows = [];
    for (var i = 1; i < values.length; i++) {
      var r = values[i];
      if (!r[0] && !r[1]) continue;
      var obj = {};
      for (var c = 0; c < HEADERS.length; c++) obj[HEADERS[c]] = r[c];
      rows.push(obj);
    }
    return json_({ ok: true, rows: rows });
  } catch (err) { return json_({ ok: false, error: String(err) }); }
}

function readSchedule_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var keyMap = {'time':'time','item':'item','dosage':'dosage','dose':'dosage','purpose':'purpose','status':'status','advisor notes':'note','notes':'note','note':'note'};
  for (var s = 0; s < sheets.length; s++) {
    if (sheets[s].getName() === SHEET_NAME) continue;
    var vals = sheets[s].getDataRange().getValues();
    var hRow = -1, cols = {};
    for (var r = 0; r < Math.min(vals.length, 8); r++) {
      var low = vals[r].map(function(x){ return String(x).trim().toLowerCase(); });
      if (low.indexOf('time') >= 0 && low.indexOf('item') >= 0) {
        hRow = r;
        for (var c = 0; c < low.length; c++) if (keyMap[low[c]]) cols[keyMap[low[c]]] = c;
        break;
      }
    }
    if (hRow < 0) continue;
    var out = [];
    for (var i = hRow + 1; i < vals.length; i++) {
      var row = vals[i];
      var item = cols.item != null ? String(row[cols.item]).trim() : '';
      if (!item) continue;
      out.push({ time: cols.time != null ? String(row[cols.time]).trim() : '', item: item, dosage: cols.dosage != null ? String(row[cols.dosage]).trim() : '', purpose: cols.purpose != null ? String(row[cols.purpose]).trim() : '', status: cols.status != null ? String(row[cols.status]).trim() : 'Keep', note: cols.note != null ? String(row[cols.note]).trim() : '' });
    }
    return out;
  }
  return [];
}

function readGuardrails_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var keyMap = {'drug':'drug','medication':'drug','common side effect':'se','side effect':'se','side effects':'se','helps':'helps','helps (low risk)':'helps','avoid':'avoid','avoid (adds risk)':'avoid'};
  for (var s = 0; s < sheets.length; s++) {
    if (sheets[s].getName() === SHEET_NAME) continue;
    var vals = sheets[s].getDataRange().getValues();
    var hRow = -1, cols = {};
    for (var r = 0; r < Math.min(vals.length, 8); r++) {
      var low = vals[r].map(function(x){ return String(x).trim().toLowerCase(); });
      if (low.indexOf('drug') >= 0 && low.indexOf('avoid') >= 0) {
        hRow = r;
        for (var c = 0; c < low.length; c++) if (keyMap[low[c]]) cols[keyMap[low[c]]] = c;
        break;
      }
    }
    if (hRow < 0) continue;
    var out = [];
    for (var i = hRow + 1; i < vals.length; i++) {
      var row = vals[i];
      var drug = cols.drug != null ? String(row[cols.drug]).trim() : '';
      if (!drug) continue;
      out.push({ drug: drug, se: cols.se != null ? String(row[cols.se]).trim() : '', helps: cols.helps != null ? String(row[cols.helps]).trim() : '', avoid: cols.avoid != null ? String(row[cols.avoid]).trim() : '' });
    }
    return out;
  }
  return [];
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || '{}');
    var sh = getSheet_();
    var entries = body.entries || (body.entry ? [body.entry] : []);
    if (!entries.length) return json_({ ok: false, error: 'no entries' });
    var existing = {};
    var idCol = sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 0), 1).getValues();
    for (var i = 0; i < idCol.length; i++) if (idCol[i][0]) existing[idCol[i][0]] = true;
    var written = 0;
    entries.forEach(function(en) {
      if (en.id && existing[en.id]) return;
      var row = HEADERS.map(function(h) { if (h === 'savedAt') return new Date(); return (en[h] === undefined || en[h] === null) ? '' : en[h]; });
      sh.appendRow(row);
      if (en.id) existing[en.id] = true;
      written++;
    });
    return json_({ ok: true, written: written });
  } catch (err) { return json_({ ok: false, error: String(err) }); }
}
