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
  getConditionalSubsidiesByMonth
} from '../storage';

interface MonthlyStatsProps {
  onClose: () => void;
}

export function MonthlyStats({ onClose }: MonthlyStatsProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
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
  }, [currentMonth]);

  const loadAdjustments = () => {
    setAdjustments(getAdjustmentsByMonth(currentMonth));
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

  const totalHours = getTotalHoursByMonth(currentMonth);
  const totalEarnings = getTotalEarningsByMonth(currentMonth);
  const workDays = getWorkDaysByMonth(currentMonth);
  const conditionalSubsidyTotal = getConditionalSubsidiesByMonth(currentMonth);
  const totalSubsidies = adjustments.filter(a => a.type === 'subsidy').reduce((sum, a) => sum + a.amount, 0) + conditionalSubsidyTotal;
  const totalDeductions = adjustments.filter(a => a.type === 'deduction').reduce((sum, a) => sum + a.amount, 0);
  const finalTotal = totalEarnings + totalSubsidies - totalDeductions;

  const handleAddAdjustment = () => {
    if (newAdjustment.amount <= 0) return;
    addAdjustment({
      month: currentMonth,
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

  const getMonthDisplay = () => {
    const [year, month] = currentMonth.split('-');
    return `${year}年${month}月`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>月度统计</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="month-selector">
            <button className="nav-btn" onClick={prevMonth}>‹</button>
            <span className="month-display">{getMonthDisplay()}</span>
            <button className="nav-btn" onClick={nextMonth}>›</button>
          </div>

          <div className="stats-summary">
            <div className="stats-row">
              <div className="stats-item">
                <span className="stats-label">工作天数</span>
                <span className="stats-value">{workDays}天</span>
              </div>
              <div className="stats-item">
                <span className="stats-label">总工时</span>
                <span className="stats-value">{totalHours}小时</span>
              </div>
            </div>
            <div className="stats-row">
              <div className="stats-item">
                <span className="stats-label">工时收入</span>
                <span className="stats-value earnings">{totalEarnings}{settings.currency}</span>
              </div>
            </div>
            {settings.subsidyConditions && settings.subsidyConditions.length > 0 && (
              <div className="stats-row subsidy-row">
                <div className="stats-item">
                  <span className="stats-label">条件补助</span>
                  <span className="stats-value">{conditionalSubsidyTotal}{settings.currency}</span>
                </div>
              </div>
            )}
          </div>

          <div className="adjustments-section">
            <div className="section-header">
              <h3>补助与扣款</h3>
              <button className="add-btn-small" onClick={() => setShowAddForm(true)}>添加</button>
            </div>

            {showAddForm && (
              <div className="add-form">
                <div className="form-row">
                  <select
                    value={newAdjustment.type}
                    onChange={e => setNewAdjustment({...newAdjustment, type: e.target.value as 'subsidy' | 'deduction'})}
                  >
                    <option value="subsidy">补助</option>
                    <option value="deduction">扣款</option>
                  </select>
                  <input
                    type="number"
                    placeholder="金额"
                    value={newAdjustment.amount}
                    onChange={e => setNewAdjustment({...newAdjustment, amount: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <input
                  type="text"
                  placeholder="备注"
                  value={newAdjustment.note}
                  onChange={e => setNewAdjustment({...newAdjustment, note: e.target.value})}
                />
                <div className="form-actions">
                  <button className="cancel-btn" onClick={() => setShowAddForm(false)}>取消</button>
                  <button className="submit-btn-small" onClick={handleAddAdjustment}>确认</button>
                </div>
              </div>
            )}

            <div className="adjustments-list">
              {adjustments.map(adjustment => (
                <div key={adjustment.id} className={`adjustment-item ${adjustment.type}`}>
                  <div className="adjustment-info">
                    <span className="adjustment-type">{adjustment.type === 'subsidy' ? '补助' : '扣款'}</span>
                    <span className="adjustment-note">{adjustment.note || '无备注'}</span>
                  </div>
                  <div className="adjustment-right">
                    <span className="adjustment-amount">
                      {adjustment.type === 'subsidy' ? '+' : '-'}{adjustment.amount}{settings.currency}
                    </span>
                    <button className="delete-btn-small" onClick={() => handleDeleteAdjustment(adjustment.id)}>删除</button>
                  </div>
                </div>
              ))}
              {adjustments.length === 0 && !showAddForm && (
                <div className="empty-message">暂无补助或扣款记录</div>
              )}
            </div>

            <div className="adjustments-summary">
              <div className="summary-row">
                <span>补助合计</span>
                <span className="subsidy-total">+{totalSubsidies}{settings.currency}</span>
              </div>
              <div className="summary-row">
                <span>扣款合计</span>
                <span className="deduction-total">-{totalDeductions}{settings.currency}</span>
              </div>
            </div>
          </div>

          <div className="final-total">
            <span className="final-label">本月总收入</span>
            <span className="final-value">{finalTotal}{settings.currency}</span>
          </div>
        </div>
      </div>
    </div>
  );
}