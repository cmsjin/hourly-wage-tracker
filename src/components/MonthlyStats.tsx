import { useState, useEffect } from 'react';
import { MonthlyAdjustment } from '../types';
import {
  getTotalHoursByMonth,
  getTotalEarningsByMonth,
  getWorkDaysByMonth,
  getAdjustmentsByMonth,
  addAdjustment,
  deleteAdjustment,
  getSettings,
  getConditionalSubsidiesByMonth,
  getTotalHoursByYear,
  getTotalEarningsByYear,
  getWorkDaysByYear,
  getAdjustmentsByYear,
  getConditionalSubsidiesByYear,
  getTotalHoursByDateRange,
  getTotalEarningsByDateRange,
  getWorkDaysByDateRange,
  getAdjustmentsByDateRange,
  getConditionalSubsidiesByDateRange
} from '../storage';

interface MonthlyStatsProps {
  onClose: () => void;
}

type StatsMode = 'month' | 'year' | 'custom';

export function MonthlyStats({ onClose }: MonthlyStatsProps) {
  const [mode, setMode] = useState<StatsMode>('month');
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [currentYear, setCurrentYear] = useState(() => {
    const now = new Date();
    return now.getFullYear().toString();
  });
  const [customStartDate, setCustomStartDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [adjustments, setAdjustments] = useState<MonthlyAdjustment[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdjustment, setNewAdjustment] = useState({
    type: 'subsidy' as 'subsidy' | 'deduction',
    amount: 0,
    note: ''
  });
  const settings = getSettings();

  useEffect(() => {
    loadAdjustments();
  }, [mode, currentMonth, currentYear, customStartDate, customEndDate]);

  const loadAdjustments = () => {
    if (mode === 'month') {
      setAdjustments(getAdjustmentsByMonth(currentMonth));
    } else if (mode === 'year') {
      setAdjustments(getAdjustmentsByYear(currentYear));
    } else {
      setAdjustments(getAdjustmentsByDateRange(customStartDate, customEndDate));
    }
  };

  const prevMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const newMonth = month === 1 ? `${year - 1}-12` : `${year}-${String(month - 1).padStart(2, '0')}`;
    setCurrentMonth(newMonth);
  };

  const nextMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const newMonth = month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, '0')}`;
    setCurrentMonth(newMonth);
  };

  const prevYear = () => {
    setCurrentYear((parseInt(currentYear) - 1).toString());
  };

  const nextYear = () => {
    setCurrentYear((parseInt(currentYear) + 1).toString());
  };

  const getStats = () => {
    if (mode === 'month') {
      const totalHours = getTotalHoursByMonth(currentMonth);
      const totalEarnings = getTotalEarningsByMonth(currentMonth);
      const workDays = getWorkDaysByMonth(currentMonth);
      const conditionalSubsidyTotal = getConditionalSubsidiesByMonth(currentMonth);
      return { totalHours, totalEarnings, workDays, conditionalSubsidyTotal };
    } else if (mode === 'year') {
      const totalHours = getTotalHoursByYear(currentYear);
      const totalEarnings = getTotalEarningsByYear(currentYear);
      const workDays = getWorkDaysByYear(currentYear);
      const conditionalSubsidyTotal = getConditionalSubsidiesByYear(currentYear);
      return { totalHours, totalEarnings, workDays, conditionalSubsidyTotal };
    } else {
      const totalHours = getTotalHoursByDateRange(customStartDate, customEndDate);
      const totalEarnings = getTotalEarningsByDateRange(customStartDate, customEndDate);
      const workDays = getWorkDaysByDateRange(customStartDate, customEndDate);
      const conditionalSubsidyTotal = getConditionalSubsidiesByDateRange(customStartDate, customEndDate);
      return { totalHours, totalEarnings, workDays, conditionalSubsidyTotal };
    }
  };

  const stats = getStats();
  const totalSubsidies = adjustments.filter(a => a.type === 'subsidy').reduce((sum, a) => sum + a.amount, 0) + stats.conditionalSubsidyTotal;
  const totalDeductions = adjustments.filter(a => a.type === 'deduction').reduce((sum, a) => sum + a.amount, 0);
  const finalTotal = stats.totalEarnings + totalSubsidies - totalDeductions;

  const handleAddAdjustment = () => {
    if (newAdjustment.amount <= 0) return;
    let month = '';
    if (mode === 'month') {
      month = currentMonth;
    } else if (mode === 'year') {
      month = `${currentYear}-01`;
    } else {
      month = customStartDate.substring(0, 7);
    }
    addAdjustment({
      month,
      type: newAdjustment.type,
      amount: newAdjustment.amount,
      note: newAdjustment.note
    });
    loadAdjustments();
    setShowAddForm(false);
    setNewAdjustment({ type: 'subsidy', amount: 0, note: '' });
  };

  const handleDeleteAdjustment = (id: string) => {
    deleteAdjustment(id);
    loadAdjustments();
  };

  const getTitle = () => {
    if (mode === 'month') {
      const [year, month] = currentMonth.split('-');
      return `${year}年${month}月统计`;
    } else if (mode === 'year') {
      return `${currentYear}年统计`;
    } else {
      return `${customStartDate} 至 ${customEndDate} 统计`;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal stats-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{getTitle()}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="mode-tabs">
            <button 
              className={`mode-tab ${mode === 'month' ? 'active' : ''}`}
              onClick={() => setMode('month')}
            >
              月统计
            </button>
            <button 
              className={`mode-tab ${mode === 'year' ? 'active' : ''}`}
              onClick={() => setMode('year')}
            >
              年统计
            </button>
            <button 
              className={`mode-tab ${mode === 'custom' ? 'active' : ''}`}
              onClick={() => setMode('custom')}
            >
              自定义
            </button>
          </div>

          {mode === 'month' && (
            <div className="month-selector">
              <button className="nav-btn" onClick={prevMonth}>◀</button>
              <span className="month-display">{currentMonth.split('-')[0]}年{currentMonth.split('-')[1]}月</span>
              <button className="nav-btn" onClick={nextMonth}>▶</button>
            </div>
          )}

          {mode === 'year' && (
            <div className="year-selector">
              <button className="nav-btn" onClick={prevYear}>◀</button>
              <span className="year-display">{currentYear}年</span>
              <button className="nav-btn" onClick={nextYear}>▶</button>
            </div>
          )}

          {mode === 'custom' && (
            <div className="custom-range-selector">
              <div className="date-input-group">
                <label>开始日期</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={e => setCustomStartDate(e.target.value)}
                  className="date-input"
                />
              </div>
              <div className="date-input-group">
                <label>结束日期</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={e => setCustomEndDate(e.target.value)}
                  className="date-input"
                />
              </div>
            </div>
          )}

          <div className="stats-summary">
            <div className="stats-row">
              <div className="stats-item">
                <span className="stats-label">工作天数</span>
                <span className="stats-value">{stats.workDays}天</span>
              </div>
              <div className="stats-item">
                <span className="stats-label">总工时</span>
                <span className="stats-value">{stats.totalHours}小时</span>
              </div>
            </div>
            <div className="stats-row">
              <div className="stats-item">
                <span className="stats-label">工时收入</span>
                <span className="stats-value earnings">{stats.totalEarnings}{settings.currency}</span>
              </div>
            </div>
            {settings.subsidyConditions && settings.subsidyConditions.length > 0 && (
              <div className="stats-row subsidy-row">
                <div className="stats-item">
                  <span className="stats-label">条件补助</span>
                  <span className="stats-value">{stats.conditionalSubsidyTotal}{settings.currency}</span>
                </div>
              </div>
            )}
          </div>

          <div className="adjustments-section">
            <h3>补助与扣款</h3>
            {adjustments.length > 0 ? (
              <div className="adjustments-list">
                {adjustments.map(adj => (
                  <div key={adj.id} className={`adjustment-item ${adj.type}`}>
                    <div className="adjustment-info">
                      <span className="adjustment-type">{adj.type === 'subsidy' ? '补助' : '扣款'}</span>
                      <span className="adjustment-month">{adj.month}</span>
                      {adj.note && <span className="adjustment-note">{adj.note}</span>}
                    </div>
                    <div className="adjustment-actions">
                      <span className="adjustment-amount">
                        {adj.type === 'subsidy' ? '+' : '-'}{adj.amount}{settings.currency}
                      </span>
                      <button className="delete-btn" onClick={() => handleDeleteAdjustment(adj.id)}>删除</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">暂无补助或扣款记录</div>
            )}

            {!showAddForm ? (
              <button className="add-btn" onClick={() => setShowAddForm(true)}>添加补助/扣款</button>
            ) : (
              <div className="add-form">
                <div className="form-row">
                  <select
                    value={newAdjustment.type}
                    onChange={e => setNewAdjustment({ ...newAdjustment, type: e.target.value as 'subsidy' | 'deduction' })}
                    className="type-select"
                  >
                    <option value="subsidy">补助</option>
                    <option value="deduction">扣款</option>
                  </select>
                  <input
                    type="number"
                    placeholder="金额"
                    value={newAdjustment.amount}
                    onChange={e => setNewAdjustment({ ...newAdjustment, amount: parseFloat(e.target.value) || 0 })}
                    className="amount-input"
                  />
                </div>
                <input
                  type="text"
                  placeholder="备注（可选）"
                  value={newAdjustment.note}
                  onChange={e => setNewAdjustment({ ...newAdjustment, note: e.target.value })}
                  className="note-input"
                />
                <div className="form-actions">
                  <button className="cancel-btn" onClick={() => setShowAddForm(false)}>取消</button>
                  <button className="submit-btn" onClick={handleAddAdjustment}>添加</button>
                </div>
              </div>
            )}
          </div>

          <div className="final-total">
            <span className="total-label">总计</span>
            <span className="total-value">{finalTotal}{settings.currency}</span>
          </div>
        </div>
      </div>
    </div>
  );
}