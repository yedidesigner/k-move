/**
 * K-Move curriculum bridge. Install only in the original curriculum spreadsheet.
 * @OnlyCurrentDoc
 *
 * No Google token, instructor password, or Supabase secret belongs in this file.
 * The apikey below is the public gateway key; it grants no instructor access.
 */
const KMOVE_CONFIG = Object.freeze({
  spreadsheetId: '1Hv7dvSg_R98DM8_VlCCg7ckYRoopmSFlAQ8z_g5Cds0',
  sheetId: 2001,
  apiUrl: 'https://wymhiilvllyfcmzfqlwr.supabase.co/rest/v1/rpc/',
  publishableKey: 'sb_publishable_OGAUS6MWonHM48eTvYll_w_BG9Sa6Pe',
  maxJobs: 4,
  maxRunMs: 45000,
  workerProperty: 'KMOVE_WORKER_KEY',
});

// Pure validation/decision helpers are also exercised by the repository tests.
const KMoveSyncPure = Object.freeze({
  cells: function (values) {
    if (!Array.isArray(values) || values.length !== 9 || values.some(function (v) {
      return typeof v !== 'string' || v.length > 40000;
    }) || values.join('').length > 360000) throw new Error('invalid_schema');
    return values.slice();
  },
  same: function (left, right) {
    return left.length === right.length && left.every(function (v, i) { return v === right[i]; });
  },
  rows: function (labels, rowOffset) {
    const rows = {};
    const duplicates = {};
    labels.forEach(function (label, index) {
      const match = typeof label === 'string' && label.trim().match(/^(\d{1,2})\s*(?:회차|주차)$/);
      if (!match) return;
      const number = Number(match[1]);
      if (number < 1 || number > 24) return;
      const key = 'S' + String(number).padStart(2, '0');
      if (rows[key]) duplicates[key] = true;
      else rows[key] = index + 1 + (rowOffset || 0);
    });
    return { rows: rows, duplicates: duplicates };
  },
  tableRows: function (rows) {
    const candidates = [];
    const strongCandidates = [];
    rows.forEach(function (row, index) {
      if (!Array.isArray(row) || typeof row[0] !== 'string' || !/^(?:회차|주차)$/.test(row[0].trim())) return;
      candidates.push(index);
      const second = typeof row[1] === 'string' ? row[1].replace(/\s/g, '').replace(/（/g, '(').replace(/）/g, ')') : '';
      if (second === '구분(사이클)') strongCandidates.push(index);
    });
    const headers = strongCandidates.length ? strongCandidates : candidates;
    if (headers.length !== 1) throw new Error('invalid_sheet');
    const headerIndex = headers[0];
    // Overview rows above this header can also say '1회차'. They are not lessons.
    return KMoveSyncPure.rows(rows.slice(headerIndex + 1).map(function (row) { return row[0]; }), headerIndex + 1);
  },
  envelope: function (data) {
    if (!data || data.spreadsheet_id !== KMOVE_CONFIG.spreadsheetId ||
      data.sheet_id !== KMOVE_CONFIG.sheetId || !Array.isArray(data.jobs) || data.jobs.length > 24) {
      throw new Error('invalid_schema');
    }
    const seen = {};
    data.jobs.forEach(function (job) {
      if (!job || !/^S(?:0[1-9]|1\d|2[0-4])$/.test(job.session_key) ||
        job.session_number !== Number(job.session_key.slice(1)) || seen[job.session_key] ||
        !Number.isSafeInteger(job.source_version) || job.source_version < 1 ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(job.lease_id) ||
        typeof job.lease_expires_at !== 'string' || !Number.isFinite(Date.parse(job.lease_expires_at))) {
        throw new Error('invalid_schema');
      }
      seen[job.session_key] = true;
      KMoveSyncPure.cells(job.baseline_cells);
      KMoveSyncPure.cells(job.desired_cells);
    });
    return data.jobs;
  },
  decision: function (current, formulas, job) {
    if (!Array.isArray(formulas) || formulas.length !== 9 || formulas.some(function (f) { return f !== ''; })) {
      return 'formula_present';
    }
    KMoveSyncPure.cells(current);
    if (KMoveSyncPure.same(current, job.desired_cells)) return 'already_applied';
    if (KMoveSyncPure.same(current, job.baseline_cells)) return 'write';
    return 'conflict';
  },
});

function kmoveOpenMenu() {
  SpreadsheetApp.getUi().createMenu('K-Move 연결')
    .addItem('설치 / 연결', 'kmoveInstall')
    .addItem('지금 반영하기', 'kmoveSyncNow')
    .addItem('연결 상태', 'kmoveShowStatus')
    .addSeparator()
    .addItem('이 계정의 자동 연결 해제', 'kmoveUninstall')
    .addToUi();
}

function kmoveInstall() {
  const ui = SpreadsheetApp.getUi();
  try {
    kmoveSheet_();
    const properties = PropertiesService.getUserProperties();
    if (!properties.getProperty(KMOVE_CONFIG.workerProperty)) {
      const answer = ui.prompt('K-Move Google Sheet 연결',
        'LMS 강사 설정에서 발급한 일회용 연결 코드를 붙여 넣으세요. 로그인 비밀번호는 입력하지 않습니다.',
        ui.ButtonSet.OK_CANCEL);
      if (answer.getSelectedButton() !== ui.Button.OK) return;
      const code = answer.getResponseText().trim();
      if (!/^[0-9a-f]{64}$/i.test(code)) throw new Error('invalid_pairing_code');
      const key = [Utilities.getUuid(), Utilities.getUuid(), Utilities.getUuid()].join('').replace(/-/g, '').toLowerCase();
      if (!/^[0-9a-f]{96}$/.test(key)) throw new Error('invalid_schema');
      const paired = kmoveRpc_('kmove_sheet_pair', {
        p_pairing_code: code,
        p_worker_key: key,
        p_spreadsheet_id: KMOVE_CONFIG.spreadsheetId,
        p_sheet_id: KMOVE_CONFIG.sheetId,
      });
      if (!paired || paired.paired !== true || paired.spreadsheet_id !== KMOVE_CONFIG.spreadsheetId ||
        paired.sheet_id !== KMOVE_CONFIG.sheetId) throw new Error('invalid_schema');
      properties.setProperty(KMOVE_CONFIG.workerProperty, key);
    }
    const triggers = ScriptApp.getProjectTriggers().filter(function (t) { return t.getHandlerFunction() === 'kmovePoll'; });
    if (!triggers.length) ScriptApp.newTrigger('kmovePoll').timeBased().everyMinutes(1).create();
    triggers.slice(1).forEach(function (t) { ScriptApp.deleteTrigger(t); });
    const menuTriggers = ScriptApp.getProjectTriggers().filter(function (t) { return t.getHandlerFunction() === 'kmoveOpenMenu'; });
    if (!menuTriggers.length) ScriptApp.newTrigger('kmoveOpenMenu').forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet()).onOpen().create();
    menuTriggers.slice(1).forEach(function (t) { ScriptApp.deleteTrigger(t); });
    kmoveOpenMenu();
    kmoveRun_(true);
    ui.alert('K-Move 연결', '자동 확인을 설치했습니다. 약 1분 간격으로 변경을 확인합니다.\n' + kmoveStatusText_(), ui.ButtonSet.OK);
  } catch (error) {
    ui.alert('연결을 완료하지 못했습니다', kmoveMessage_(kmoveErrorCode_(error)), ui.ButtonSet.OK);
  }
}

function kmovePoll() { kmoveRun_(false); }

function kmoveSyncNow() {
  kmoveRun_(true);
  kmoveShowStatus();
}

function kmoveShowStatus() {
  SpreadsheetApp.getUi().alert('K-Move 연결 상태', kmoveStatusText_(), SpreadsheetApp.getUi().ButtonSet.OK);
}

function kmoveUninstall() {
  const ui = SpreadsheetApp.getUi();
  const answer = ui.alert('자동 연결 해제',
    '이 Google 계정의 자동 실행과 저장된 연결 키를 삭제합니다. LMS 강사 설정에서도 연결을 해제하면 서버 권한까지 폐기됩니다.',
    ui.ButtonSet.YES_NO);
  if (answer !== ui.Button.YES) return;
  ScriptApp.getProjectTriggers().filter(function (t) { return ['kmovePoll', 'kmoveOpenMenu'].indexOf(t.getHandlerFunction()) !== -1; })
    .forEach(function (t) { ScriptApp.deleteTrigger(t); });
  const properties = PropertiesService.getUserProperties();
  Object.keys(properties.getProperties()).filter(function (key) { return key.indexOf('KMOVE_') === 0; })
    .forEach(function (key) { properties.deleteProperty(key); });
  ui.alert('이 계정의 자동 연결을 해제했습니다.');
}

function kmoveRun_(manual) {
  const properties = PropertiesService.getUserProperties();
  if (!manual && Number(properties.getProperty('KMOVE_NEXT_RUN') || 0) > Date.now()) return;
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    const key = properties.getProperty(KMOVE_CONFIG.workerProperty);
    if (!key || !/^[0-9a-f]{96}$/.test(key)) throw new Error('not_connected');
    const sheet = kmoveSheet_();
    const data = kmoveRpc_('kmove_sheet_pull', { p_worker_key: key });
    const jobs = KMoveSyncPure.envelope(data);
    const started = Date.now();
    let synced = 0;
    let problems = 0;
    let lastProblem = '';
    for (let i = 0; i < Math.min(jobs.length, KMOVE_CONFIG.maxJobs); i++) {
      if (Date.now() - started > KMOVE_CONFIG.maxRunMs) break;
      const result = kmoveProcessJob_(sheet, jobs[i], key);
      if (result === 'synced') synced++;
      else if (result !== 'lease_expired') { problems++; lastProblem = result; }
    }
    properties.setProperties({
      KMOVE_FAILURES: '0', KMOVE_NEXT_RUN: '0', KMOVE_LAST_POLL: new Date().toISOString(),
      KMOVE_STATUS: problems ? lastProblem : (synced ? 'synced' : 'waiting'),
    });
    if (synced) properties.setProperty('KMOVE_LAST_SYNC', new Date().toISOString());
  } catch (error) {
    const failures = Math.min(Number(properties.getProperty('KMOVE_FAILURES') || 0) + 1, 6);
    properties.setProperties({
      KMOVE_FAILURES: String(failures),
      KMOVE_NEXT_RUN: String(Date.now() + Math.min(Math.pow(2, failures - 1), 30) * 60000),
      KMOVE_STATUS: kmoveErrorCode_(error), KMOVE_LAST_POLL: new Date().toISOString(),
    });
  } finally { lock.releaseLock(); }
}

function kmoveProcessJob_(sheet, job, key) {
  if (Date.parse(job.lease_expires_at) - Date.now() < 5000) return 'lease_expired';
  const index = kmoveIndex_(sheet);
  if (index.duplicates[job.session_key]) return kmoveAck_(job, key, 'error', null, 'duplicate_session');
  if (!index.rows[job.session_key]) return kmoveAck_(job, key, 'error', null, 'target_missing');
  const range = sheet.getRange(index.rows[job.session_key], 2, 1, 9);
  const first = kmoveRead_(range);
  let decision = KMoveSyncPure.decision(first.cells, first.formulas, job);
  if (decision === 'formula_present') return kmoveAck_(job, key, 'error', null, decision);
  if (decision === 'conflict') return kmoveAck_(job, key, 'conflict', first.cells, null);
  const validLease = kmoveRpc_('kmove_sheet_check_lease', {
    p_worker_key: key, p_session_key: job.session_key, p_lease_id: job.lease_id, p_source_version: job.source_version,
  });
  if (validLease !== true) {
    if (validLease !== false) throw new Error('invalid_schema');
    return 'lease_expired';
  }
  // Re-resolve the stable row and re-read just before writing. A human edit is not
  // covered by LockService; this is conflict detection, not a Sheets transaction.
  const latestIndex = kmoveIndex_(sheet);
  if (latestIndex.duplicates[job.session_key]) return kmoveAck_(job, key, 'error', null, 'duplicate_session');
  if (latestIndex.rows[job.session_key] !== index.rows[job.session_key]) return kmoveAck_(job, key, 'error', null, 'target_missing');
  const before = kmoveRead_(range);
  decision = KMoveSyncPure.decision(before.cells, before.formulas, job);
  if (decision === 'formula_present') return kmoveAck_(job, key, 'error', null, decision);
  if (decision === 'conflict') return kmoveAck_(job, key, 'conflict', before.cells, null);
  if (decision === 'write') {
    // Rich text writes literal strings, including leading '='. setValues() would
    // interpret '=' as a formula. Existing cell formatting is not cleared.
    range.setRichTextValues([job.desired_cells.map(function (text) {
      return SpreadsheetApp.newRichTextValue().setText(text).build();
    })]);
    SpreadsheetApp.flush();
  }
  const after = kmoveRead_(range);
  if (after.formulas.some(function (formula) { return formula !== ''; }) || !KMoveSyncPure.same(after.cells, job.desired_cells)) {
    return kmoveAck_(job, key, 'error', null, 'write_verification_failed');
  }
  return kmoveAck_(job, key, 'synced', after.cells, null);
}

function kmoveRead_(range) {
  // Check formulas before validating value types: a formula may yield a number.
  return { cells: range.getValues()[0], formulas: range.getFormulas()[0] };
}

function kmoveIndex_(sheet) {
  return KMoveSyncPure.tableRows(sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), 2).getValues());
}

function kmoveAck_(job, key, result, observed, errorCode) {
  const reply = kmoveRpc_('kmove_sheet_ack', {
    p_worker_key: key, p_session_key: job.session_key, p_lease_id: job.lease_id,
    p_source_version: job.source_version, p_result: result, p_observed_cells: observed, p_error_code: errorCode,
  });
  if (!reply || typeof reply.accepted !== 'boolean') throw new Error('invalid_schema');
  if (!reply.accepted) return 'lease_expired';
  return result === 'error' ? errorCode : result;
}

function kmoveSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet || spreadsheet.getId() !== KMOVE_CONFIG.spreadsheetId) throw new Error('invalid_sheet');
  const sheet = spreadsheet.getSheets().filter(function (s) { return s.getSheetId() === KMOVE_CONFIG.sheetId; })[0];
  if (!sheet) throw new Error('invalid_sheet');
  return sheet;
}

function kmoveRpc_(name, payload) {
  if (['kmove_sheet_pair', 'kmove_sheet_pull', 'kmove_sheet_check_lease', 'kmove_sheet_ack'].indexOf(name) === -1) {
    throw new Error('invalid_schema');
  }
  let response;
  try {
    response = UrlFetchApp.fetch(KMOVE_CONFIG.apiUrl + name, {
      method: 'post', contentType: 'application/json',
      headers: { apikey: KMOVE_CONFIG.publishableKey }, payload: JSON.stringify(payload),
      muteHttpExceptions: true, followRedirects: false, validateHttpsCertificates: true,
    });
  } catch (_) { throw new Error('transport_error'); }
  const status = response.getResponseCode();
  if (status === 401 || status === 403) throw new Error('permission_denied');
  if (status < 200 || status >= 300) throw new Error(status >= 500 || status === 429 ? 'transport_error' : 'request_rejected');
  const body = response.getContentText();
  if (body.length > 2000000) throw new Error('invalid_schema');
  try { return JSON.parse(body); } catch (_) { throw new Error('invalid_schema'); }
}

function kmoveErrorCode_(error) {
  const known = ['not_connected', 'invalid_pairing_code', 'invalid_schema', 'invalid_sheet', 'transport_error',
    'permission_denied', 'request_rejected', 'target_missing', 'duplicate_session', 'formula_present', 'write_verification_failed'];
  return error && known.indexOf(error.message) !== -1 ? error.message : 'operation_failed';
}

function kmoveMessage_(code) {
  const messages = {
    not_connected: '먼저 LMS에서 일회용 연결 코드를 발급한 뒤 설치 / 연결을 실행하세요.',
    invalid_pairing_code: '연결 코드 형식이 다릅니다. LMS에서 발급한 64자리 코드를 그대로 붙여 넣으세요.',
    invalid_schema: '예상과 다른 데이터 형식을 확인하여 반영을 중단했습니다. LMS 연결 상태를 확인하세요.',
    invalid_sheet: '원본 커리큘럼 문서의 시트2(gid 2001)에서만 연결할 수 있습니다.',
    transport_error: '연결이 지연되고 있습니다. 자동으로 간격을 늘려 재시도합니다.',
    permission_denied: '연결 권한을 확인하지 못했습니다. LMS 연결 상태와 이 Google 계정의 문서 편집 권한을 확인하세요.',
    request_rejected: '요청을 처리하지 못했습니다. 만료·사용된 연결 코드라면 LMS에서 새 코드를 발급하세요.',
    target_missing: '수업 행을 찾지 못했거나 행이 이동했습니다. A열의 회차 표시를 확인하세요.',
    duplicate_session: 'A열에 같은 회차가 두 번 있습니다. 중복을 해결해야 해당 수업을 반영할 수 있습니다.',
    formula_present: '반영할 셀에 수식이 있어 덮어쓰지 않았습니다. LMS 연결 상태를 확인하세요.',
    write_verification_failed: '저장 결과가 예상과 달라 완료 처리하지 않았습니다. LMS 연결 상태를 확인하세요.',
    operation_failed: '작업을 완료하지 못했습니다. 문서 편집 권한과 Google 실행 할당량을 확인하세요.',
    conflict: 'Sheet에서 직접 바뀐 내용이 있어 덮어쓰지 않았습니다. LMS에서 충돌 내용을 확인하세요.',
    synced: '변경을 Sheet에 반영하고 다시 읽어 확인했습니다.',
    waiting: '서버 연결을 확인했습니다. 반영할 변경을 기다리고 있습니다.',
  };
  return messages[code] || messages.operation_failed;
}

function kmoveStatusText_() {
  const properties = PropertiesService.getUserProperties();
  const installed = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'kmovePoll'; });
  const status = properties.getProperty('KMOVE_STATUS') || 'not_connected';
  const last = properties.getProperty('KMOVE_LAST_SYNC');
  return '자동 실행: ' + (installed ? '설치됨 (약 1분 간격)' : '설치되지 않음') + '\n' + kmoveMessage_(status) +
    (last ? '\n마지막 반영: ' + Utilities.formatDate(new Date(last), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss') + ' (한국 시간)' : '');
}
