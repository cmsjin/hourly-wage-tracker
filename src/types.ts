export interface TimeRecord {
  id: string;
  date: string;
  hours: number;
  rate: number;
  note: string;
  tag?: string;  // 标签
  startTime?: string;  // 开始时间 HH:mm
  endTime?: string;    // 结束时间 HH:mm
  breakTime?: number;  // 休息时间（小时）
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

export interface Settings {
  hourlyRate: number;
  currency: string;
  subsidyConditions: SubsidyCondition[];  // 条件补助列表
  tags: Tag[];  // 标签列表
  noteTemplate: string;  // 备注模板
}

export const DEFAULT_SETTINGS: Settings = {
  hourlyRate: 20,
  currency: '元',
  subsidyConditions: [],
  tags: [],
  noteTemplate: ''
};
