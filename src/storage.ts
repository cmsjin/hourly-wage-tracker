import { TimeRecord, Settings, DEFAULT_SETTINGS, MonthlyAdjustment } from './types';

const RECORDS_KEY = 'hourly_wage_records';
const SETTINGS_KEY = 'hourly_wage_settings';
const ADJUSTMENTS_KEY = 'hourly_wage_adjustments';

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

// Monthly statistics functions
export function getRecordsByMonth(month: string): TimeRecord[] {
  const records = getRecords();
  return records.filter(r => r.date.startsWith(month));
}

export function getTotalHoursByMonth(month: string): number {
  const records = getRecordsByMonth(month);
  return records.reduce((sum, r) => sum + r.hours, 0);
}

export function getTotalEarningsByMonth(month: string): number {
  const records = getRecordsByMonth(month);
  return records.reduce((sum, r) => sum + r.hours * r.rate, 0);
}

export function getWorkDaysByMonth(month: string): number {
  const records = getRecordsByMonth(month);
  const uniqueDates = new Set(records.map(r => r.date));
  return uniqueDates.size;
}

// Monthly adjustments functions
export function getAdjustments(): MonthlyAdjustment[] {
  try {
    const data = localStorage.getItem(ADJUSTMENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveAdjustments(adjustments: MonthlyAdjustment[]): void {
  localStorage.setItem(ADJUSTMENTS_KEY, JSON.stringify(adjustments));
}

export function getAdjustmentsByMonth(month: string): MonthlyAdjustment[] {
  const adjustments = getAdjustments();
  return adjustments.filter(a => a.month === month);
}

export function addAdjustment(adjustment: Omit<MonthlyAdjustment, 'id'>): MonthlyAdjustment {
  const adjustments = getAdjustments();
  const newAdjustment: MonthlyAdjustment = {
    ...adjustment,
    id: Date.now().toString()
  };
  adjustments.push(newAdjustment);
  saveAdjustments(adjustments);
  return newAdjustment;
}

export function updateAdjustment(id: string, updates: Partial<MonthlyAdjustment>): void {
  const adjustments = getAdjustments();
  const index = adjustments.findIndex(a => a.id === id);
  if (index !== -1) {
    adjustments[index] = { ...adjustments[index], ...updates };
    saveAdjustments(adjustments);
  }
}

export function deleteAdjustment(id: string): void {
  const adjustments = getAdjustments();
  const filtered = adjustments.filter(a => a.id !== id);
  saveAdjustments(filtered);
}

export function getTotalSubsidiesByMonth(month: string): number {
  const adjustments = getAdjustmentsByMonth(month);
  return adjustments.filter(a => a.type === 'subsidy').reduce((sum, a) => sum + a.amount, 0);
}

export function getTotalDeductionsByMonth(month: string): number {
  const adjustments = getAdjustmentsByMonth(month);
  return adjustments.filter(a => a.type === 'deduction').reduce((sum, a) => sum + a.amount, 0);
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

// Import/Export functions
export interface ExportData {
  records: TimeRecord[];
  adjustments: MonthlyAdjustment[];
  settings: Settings;
  exportDate: string;
}

export function exportData(): ExportData {
  return {
    records: getRecords(),
    adjustments: getAdjustments(),
    settings: getSettings(),
    exportDate: new Date().toISOString()
  };
}

export function importData(data: ExportData): void {
  if (data.records) {
    saveRecords(data.records);
  }
  if (data.adjustments) {
    saveAdjustments(data.adjustments);
  }
  if (data.settings) {
    saveSettings(data.settings);
  }
}
