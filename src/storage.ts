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

// Year statistics functions
export function getRecordsByYear(year: string): TimeRecord[] {
  const records = getRecords();
  return records.filter(r => r.date.startsWith(year));
}

export function getTotalHoursByYear(year: string): number {
  const records = getRecordsByYear(year);
  return records.reduce((sum, r) => sum + r.hours, 0);
}

export function getTotalEarningsByYear(year: string): number {
  const records = getRecordsByYear(year);
  return records.reduce((sum, r) => sum + r.hours * r.rate, 0);
}

export function getWorkDaysByYear(year: string): number {
  const records = getRecordsByYear(year);
  const uniqueDates = new Set(records.map(r => r.date));
  return uniqueDates.size;
}

export function getAdjustmentsByYear(year: string): MonthlyAdjustment[] {
  const adjustments = getAdjustments();
  return adjustments.filter(a => a.month.startsWith(year));
}

export function getConditionalSubsidiesByYear(year: string): number {
  let total = 0;
  for (let month = 1; month <= 12; month++) {
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    total += getConditionalSubsidiesByMonth(monthStr);
  }
  return total;
}

// Custom date range statistics functions
export function getRecordsByDateRange(startDate: string, endDate: string): TimeRecord[] {
  const records = getRecords();
  return records.filter(r => r.date >= startDate && r.date <= endDate);
}

export function getTotalHoursByDateRange(startDate: string, endDate: string): number {
  const records = getRecordsByDateRange(startDate, endDate);
  return records.reduce((sum, r) => sum + r.hours, 0);
}

export function getTotalEarningsByDateRange(startDate: string, endDate: string): number {
  const records = getRecordsByDateRange(startDate, endDate);
  return records.reduce((sum, r) => sum + r.hours * r.rate, 0);
}

export function getWorkDaysByDateRange(startDate: string, endDate: string): number {
  const records = getRecordsByDateRange(startDate, endDate);
  const uniqueDates = new Set(records.map(r => r.date));
  return uniqueDates.size;
}

export function getAdjustmentsByDateRange(startDate: string, endDate: string): MonthlyAdjustment[] {
  const adjustments = getAdjustments();
  return adjustments.filter(a => a.month >= startDate.substring(0, 7) && a.month <= endDate.substring(0, 7));
}

export function getConditionalSubsidiesByDateRange(startDate: string, endDate: string): number {
  let total = 0;
  
  // Iterate through each month in the range
  const startMonth = startDate.substring(0, 7);
  const endMonth = endDate.substring(0, 7);
  
  const [startYear, startMon] = startMonth.split('-').map(Number);
  const [endYear, endMon] = endMonth.split('-').map(Number);
  
  let currentYear = startYear;
  let currentMon = startMon;
  
  while (currentYear <= endYear && currentMon <= endMon) {
    const monthStr = `${currentYear}-${String(currentMon).padStart(2, '0')}`;
    total += getConditionalSubsidiesByMonth(monthStr);
    
    currentMon++;
    if (currentMon > 12) {
      currentMon = 1;
      currentYear++;
    }
    
    if (currentYear === endYear && currentMon > endMon) break;
  }
  
  return total;
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

// 根据条件补助规则计算单日补助金额
export function getDailySubsidy(hours: number): number {
  const settings = getSettings();
  const conditions = settings.subsidyConditions;
  
  if (!conditions || conditions.length === 0) return 0;
  
  // 按最小工时从大到小排序，取第一个满足条件的补助
  const sortedConditions = [...conditions].sort((a, b) => b.minHours - a.minHours);
  
  for (const condition of sortedConditions) {
    if (hours >= condition.minHours) {
      return condition.amount;
    }
  }
  
  return 0;
}

// 根据条件补助规则计算月总补助
export function getConditionalSubsidiesByMonth(month: string): number {
  const records = getRecordsByMonth(month);
  let totalSubsidy = 0;
  
  // 按日期分组
  const recordsByDate = new Map<string, TimeRecord[]>();
  records.forEach(record => {
    const existing = recordsByDate.get(record.date) || [];
    existing.push(record);
    recordsByDate.set(record.date, existing);
  });
  
  recordsByDate.forEach((dayRecords) => {
    // 过滤掉无补助的记录，只计算有补助的记录工时
    const subsidyRecords = dayRecords.filter(r => !r.noSubsidy);
    
    // 如果该天全部记录都是无补助，则跳过
    if (subsidyRecords.length === 0) {
      return;
    }
    
    // 计算有补助记录的工时总和
    const dayHours = subsidyRecords.reduce((sum, r) => sum + r.hours, 0);
    totalSubsidy += getDailySubsidy(dayHours);
  });
  
  return totalSubsidy;
}

// 获取标签列表
export function getTags(): import('./types').Tag[] {
  const settings = getSettings();
  return settings.tags || [];
}

// 保存标签列表
export function saveTags(tags: import('./types').Tag[]): void {
  const settings = getSettings();
  settings.tags = tags;
  saveSettings(settings);
}

// 添加标签
export function addTag(name: string, noSubsidy: boolean = false): import('./types').Tag {
  const tags = getTags();
  const newTag: import('./types').Tag = { name, noSubsidy };
  tags.push(newTag);
  saveTags(tags);
  return newTag;
}

// 删除标签
export function deleteTag(name: string): void {
  const tags = getTags();
  const filtered = tags.filter(t => t.name !== name);
  saveTags(filtered);
}

// 更新标签
export function updateTag(oldName: string, newName: string, noSubsidy: boolean): void {
  const tags = getTags();
  const index = tags.findIndex(t => t.name === oldName);
  if (index !== -1) {
    tags[index] = { name: newName, noSubsidy };
    saveTags(tags);
  }
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

// CSV functions
export function exportCSV(): string {
  const records = getRecords();
  const adjustments = getAdjustments();
  
  let csv = '\uFEFF';
  
  csv += '类型,日期/月份,小时数,时薪,金额,备注\n';
  
  records.forEach(record => {
    csv += `工时,${record.date},${record.hours},${record.rate},${record.hours * record.rate},"${record.note.replace(/"/g, '""')}"\n`;
  });
  
  adjustments.forEach(adjustment => {
    const type = adjustment.type === 'subsidy' ? '补助' : '扣款';
    csv += `${type},${adjustment.month},,,${adjustment.amount},"${adjustment.note.replace(/"/g, '""')}"\n`;
  });
  
  return csv;
}

export function importCSV(csv: string): void {
  const lines = csv.split('\n').filter(line => line.trim());
  if (lines.length < 2) return;
  
  const newRecords: TimeRecord[] = [];
  const newAdjustments: MonthlyAdjustment[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = parseCSVLine(line);
    
    if (parts.length < 2) continue;
    
    const type = parts[0].trim();
    
    if (type === '工时') {
      const date = parts[1]?.trim();
      const hours = parseFloat(parts[2]?.trim() || '0');
      const rate = parseFloat(parts[3]?.trim() || '0');
      const note = parts[5]?.trim() || '';
      
      if (date && hours > 0) {
        newRecords.push({
          id: Date.now().toString() + '_' + i,
          date,
          hours,
          rate: rate || getSettings().hourlyRate,
          note
        });
      }
    } else if (type === '补助' || type === '扣款') {
      const month = parts[1]?.trim();
      const amount = parseFloat(parts[4]?.trim() || '0');
      const note = parts[5]?.trim() || '';
      
      if (month && amount > 0) {
        newAdjustments.push({
          id: Date.now().toString() + '_' + i,
          month,
          type: type === '补助' ? 'subsidy' : 'deduction',
          amount,
          note
        });
      }
    }
  }
  
  if (newRecords.length > 0) {
    saveRecords([...getRecords(), ...newRecords]);
  }
  if (newAdjustments.length > 0) {
    saveAdjustments([...getAdjustments(), ...newAdjustments]);
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"' && !inQuotes) {
      inQuotes = true;
    } else if (char === '"' && inQuotes) {
      if (line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = false;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}
