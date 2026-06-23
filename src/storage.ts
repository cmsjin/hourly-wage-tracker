import { TimeRecord, Settings, DEFAULT_SETTINGS } from './types';

const RECORDS_KEY = 'hourly_wage_records';
const SETTINGS_KEY = 'hourly_wage_settings';

export function getRecords(): TimeRecord[] {
  try {
    const data = localStorage.getItem(RECORDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveRecords(records: TimeRecord[]): void {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export function addRecord(record: Omit<TimeRecord, 'id'>): TimeRecord {
  const records = getRecords();
  const newRecord: TimeRecord = {
    ...record,
    id: Date.now().toString()
  };
  records.push(newRecord);
  saveRecords(records);
  return newRecord;
}

export function updateRecord(id: string, updates: Partial<TimeRecord>): void {
  const records = getRecords();
  const index = records.findIndex(r => r.id === id);
  if (index !== -1) {
    records[index] = { ...records[index], ...updates };
    saveRecords(records);
  }
}

export function deleteRecord(id: string): void {
  const records = getRecords();
  const filtered = records.filter(r => r.id !== id);
  saveRecords(filtered);
}

export function getRecordsByDate(date: string): TimeRecord[] {
  const records = getRecords();
  return records.filter(r => r.date === date);
}

export function getTotalHoursByDate(date: string): number {
  const records = getRecordsByDate(date);
  return records.reduce((sum, r) => sum + r.hours, 0);
}

export function getTotalEarningsByDate(date: string): number {
  const records = getRecordsByDate(date);
  return records.reduce((sum, r) => sum + r.hours * r.rate, 0);
}

export function getSettings(): Settings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
