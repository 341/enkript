import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import Papa from 'papaparse';

import type { PasswordCategory, PasswordEntry } from '@/lib/types';

export type ImportPreviewRow = {
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  category?: PasswordCategory;
};

function normalizeCategory(raw?: string): PasswordCategory | undefined {
  const c = raw?.trim().toLowerCase();
  if (!c) return undefined;
  if (['social', 'work', 'finance', 'shopping', 'other'].includes(c)) {
    return c as PasswordCategory;
  }
  return 'other';
}

export function detectImportFormat(text: string): 'generic' | 'onepassword' | 'bitwarden' | 'unknown' {
  const head = text.slice(0, 400).trimStart();
  if (head.startsWith('{') || head.startsWith('[')) {
    try {
      const j = JSON.parse(text) as { encrypted?: unknown };
      if ('encrypted' in j && j.encrypted === false) return 'bitwarden';
    } catch {
      /**/
    }
  }
  const firstLine = head.split(/\r?\n/).find(Boolean) ?? '';
  if (/^Title,+Username,+Password,+URL/i.test(firstLine)) return 'onepassword';
  if (/title.+username.+password/i.test(firstLine.replace(/\"/g, ''))) return 'generic';
  return 'unknown';
}

function parseCsv(text: string): Record<string, string>[] {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) =>
      String(h ?? '')
        .trim()
        .toLowerCase()
        .replace(/^"+|"+$/g, ''),
  });
  if (result.errors.length) throw new Error(result.errors.map((e) => e.message).join(';'));
  return result.data;
}

export function parseBitwardenExport(text: string): ImportPreviewRow[] {
  const root = JSON.parse(text) as { items?: Record<string, unknown>[] };
  const items = Array.isArray(root.items) ? root.items : [];
  const rows: ImportPreviewRow[] = [];
  for (const item of items) {
    const type = Number(item?.type ?? 0);
    if (type !== 1) continue;
    const login = item.login as Record<string, unknown> | undefined;
    const username =
      typeof login?.username === 'string' ? login.username : (item.username as string) ?? '';
    const pwd = typeof login?.password === 'string' ? login.password : '';
    rows.push({
      title: typeof item?.name === 'string' ? item.name : '',
      username,
      password: pwd,
      url:
        typeof login?.uris === 'object' && Array.isArray(login.uris)
          ? String(((login.uris as { uri?: string }[])[0]?.uri ?? '') || '')
          : '',
      notes: typeof item?.notes === 'string' ? item.notes : '',
      category: normalizeCategory(undefined),
    });
  }
  return rows.filter((r) => r.title);
}

export function parseImportCsv(text: string, formatHint: ReturnType<typeof detectImportFormat>) {
  if (formatHint === 'unknown') formatHint = detectImportFormat(text);
  if (formatHint === 'bitwarden') return parseBitwardenExport(text);
  const rows = parseCsv(text);
  return rows.map((r): ImportPreviewRow => {
    const title = String(r.title ?? r.name ?? r.login ?? '').trim();
    const username = String(r.username ?? r.login ?? '').trim();
    const password = String(r.password ?? '').trim();
    const url = String(r.url ?? '').trim();
    const notes = String(r.notes ?? r.note ?? '').trim();
    return {
      title,
      username,
      password,
      url,
      notes,
      category: normalizeCategory(String(r.category ?? '')),
    };
  }).filter((r) => r.title);
}

export function exportToCsv(entries: PasswordEntry[]): string {
  const lines = [['title', 'username', 'password', 'url', 'notes', 'category']];
  lines.push(...entries.map((e) => [e.title, e.username, e.password, e.url, e.notes, e.category]));
  return Papa.unparse(lines);
}

export function exportTo1PasswordCsv(entries: PasswordEntry[]): string {
  const header = `"Title","Username","Password","URL","Notes","Type"` + '\r\n';
  const body =
    entries
      .map(
        (e) =>
          `"${csvEscape(e.title)}","${csvEscape(e.username)}","${csvEscape(e.password)}","${csvEscape(e.url)}","${csvEscape(e.notes)}","Login"`,
      )
      .join('\r\n') + '\r\n';
  return header + body;
}

function csvEscape(s: string): string {
  return s.replace(/"/g, '""');
}

export async function shareTextFile(contents: string, filename: string, mime?: string): Promise<void> {
  const path = `.export-${filename}-${Date.now()}.txt`;
  const fp = `${FileSystem.documentDirectory}${path}`;
  await FileSystem.writeAsStringAsync(fp, contents, {
    encoding: 'utf8',
  });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fp, { mimeType: mime ?? 'text/csv', UTI: 'public.comma-separated-values-text' });
  }
}
