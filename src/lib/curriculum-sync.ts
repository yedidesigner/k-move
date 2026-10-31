import { getSupabase } from "./supabase";

export type CurriculumSyncState = "synced" | "pending" | "conflict" | "error" | "needs_baseline";
export type CurriculumSyncError = "target_missing" | "duplicate_session" | "formula_present" | "permission_denied" | "transport_error" | "write_verification_failed" | "invalid_sheet" | "invalid_curriculum" | "sheet_changed" | "baseline_required";
export interface CurriculumSyncRow {
  session_key: string;
  session_number: number;
  source_version: number;
  last_synced_version: number;
  status: CurriculumSyncState;
  error_code: CurriculumSyncError | null;
  updated_at: string;
  last_synced_at: string | null;
  lease_expires_at: string | null;
  attempts: number;
  conflict: { baseline_cells: string[]; observed_cells: string[]; desired_cells: string[] } | null;
}
export interface CurriculumSyncStatus {
  spreadsheet_id: string;
  sheet_id: number;
  configured: boolean;
  connected: boolean;
  last_seen_at: string | null;
  paired_at: string | null;
  pairing_expires_at: string | null;
  rows: CurriculumSyncRow[];
}
export interface CurriculumPairingCode {
  pairing_code: string;
  expires_at: string;
  spreadsheet_id: string;
  sheet_id: number;
}
async function call<T>(name: string, params: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await getSupabase().rpc(name, params);
  if (error) throw new Error(error.message);
  return data as T;
}
export const getCurriculumSyncStatus = () => call<CurriculumSyncStatus>("kmove_sheet_status");
/** Display this short-lived pairing code once. Do not persist it in browser storage. */
export const issueCurriculumPairingCode = () => call<CurriculumPairingCode>("kmove_sheet_setup");
export async function revokeCurriculumSync(): Promise<void> { await call("kmove_sheet_revoke"); }
/** overwriteConflict must follow an explicit instructor confirmation in the UI. */
export async function retryCurriculumSync(sessionKey: string, overwriteConflict = false, expectedConflict?: { source_version: number; observed_cells: string[] }): Promise<void> {
  await call("kmove_sheet_retry", { p_session_key: sessionKey, p_overwrite_conflict: overwriteConflict, p_expected_source_version: expectedConflict?.source_version ?? null, p_expected_observed_cells: expectedConflict?.observed_cells ?? null });
}
