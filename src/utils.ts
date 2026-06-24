export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function getWeekDays(): string[] {
  return ['日', '一', '二', '三', '四', '五', '六'];
}

export function getMonthName(month: number): string {
  const names = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  return names[month];
}

export function getMonthYearString(date: Date): string {
  return `${date.getFullYear()}年${getMonthName(date.getMonth())}`;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function isFutureDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h${m}m`;
}

export function applyTemplate(template: string, date: string, startTime?: string, endTime?: string, hours?: number, tag?: string): string {
  if (!template) return '';
  
  let result = template;
  
  // Replace {date}
  result = result.replace(/{date}/g, date);
  
  // Replace {timeRange}
  if (startTime && endTime) {
    result = result.replace(/{timeRange}/g, `${startTime}-${endTime}`);
  } else {
    result = result.replace(/{timeRange}/g, '');
  }
  
  // Replace {hours}
  if (hours !== undefined) {
    result = result.replace(/{hours}/g, hours.toString());
  } else {
    result = result.replace(/{hours}/g, '');
  }
  
  // Replace {tag}
  if (tag) {
    result = result.replace(/{tag}/g, tag);
  } else {
    result = result.replace(/{tag}/g, '');
  }
  
  return result;
}
