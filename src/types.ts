export interface TimeRecord {
  id: string;
  date: string;
  hours: number;
  rate: number;
  note: string;
}

export interface Settings {
  hourlyRate: number;
  currency: string;
}

export const DEFAULT_SETTINGS: Settings = {
  hourlyRate: 20,
  currency: '元'
};
