export interface TimeRecord {
  id: string;
  date: string;
  hours: number;
  rate: number;
  note: string;
}

export interface MonthlyAdjustment {
  id: string;
  month: string; // format: YYYY-MM
  type: 'subsidy' | 'deduction';
  amount: number;
  note: string;
}

export interface Settings {
  hourlyRate: number;
  currency: string;
  dailySubsidy: number;
}

export const DEFAULT_SETTINGS: Settings = {
  hourlyRate: 20,
  currency: '元',
  dailySubsidy: 0
};
