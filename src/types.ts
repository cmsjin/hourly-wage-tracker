export interface TimeRecord {
  id: string;
  date: string;
  hours: number;
  rate: number;
  note: string;
  tag?: string;  // 标签
  startTime?: string;  // 开始时间 HH:mm
  endTime?: string;    // 结束时间 HH:mm
  noonBreak?: number;  // 中午休息时间（小时）
  eveningBreak?: number;  // 晚上休息时间（小时）
  noSubsidy?: boolean; // 是否无日补助
}

export interface MonthlyAdjustment {
  id: string;
  month: string; // format: YYYY-MM
  type: 'subsidy' | 'deduction';
  amount: number;
  note: string;
}

export interface SubsidyCondition {
  minHours: number;  // 最小工时条件
  amount: number;     // 补助金额
}

export interface Tag {
  name: string;           // 标签名称
  noSubsidy: boolean;      // 是否无日补助
}

export type RecordMode = 'simple' | 'advanced';

export interface LastInputData {
  hours?: string;
  startTime?: string;
  endTime?: string;
  noonBreak?: string;
  eveningBreak?: string;
  tag?: string;
  noSubsidy?: boolean;
}

export interface SmartTemplate {
  id: string;
  name: string;
  conditions: {
    noonBreak?: 'gt' | 'gte' | 'eq' | 'lt' | 'lte' | 'ne';
    noonBreakValue?: number;
    eveningBreak?: 'gt' | 'gte' | 'eq' | 'lt' | 'lte' | 'ne';
    eveningBreakValue?: number;
  };
  template: string;
}

export interface Settings {
  hourlyRate: number;
  currency: string;
  subsidyConditions: SubsidyCondition[];  // 条件补助列表
  tags: Tag[];  // 标签列表
  noteTemplate: string;  // 备注模板（保留旧的单一模板）
  smartTemplates: SmartTemplate[];  // 智能模板列表
  noonBreak: number;  // 默认中午休息时间（小时）
  eveningBreak: number;  // 默认晚上休息时间（小时）
  recordMode: RecordMode;  // 记录模式
  lastInput?: LastInputData;  // 上次录入内容
}

export const DEFAULT_SETTINGS: Settings = {
  hourlyRate: 20,
  currency: '元',
  subsidyConditions: [],
  tags: [],
  noteTemplate: '',
  smartTemplates: [],
  noonBreak: 1,
  eveningBreak: 0,
  recordMode: 'simple',
  lastInput: undefined
};
