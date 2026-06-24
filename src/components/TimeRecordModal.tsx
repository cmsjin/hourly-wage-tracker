import { useState } from 'react';
import { formatDate } from '../utils';
import { addRecord, updateRecord, deleteRecord, getRecordsByDate, getSettings } from '../storage';
import { TimeRecord } from '../types';

interface TimeRecordModalProps {
  date: Date;
  onClose: () => void;
}

function parseTime(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + (minutes || 0) / 60;
}

function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h${m}m`;
}

export function TimeRecordModal({ date, onClose }: TimeRecordModalProps) {
  const dateStr = formatDate(date);
  const records = getRecordsByDate(dateStr);
  const settings = getSettings();
  const [hours, setHours] = useState('');
  const [rate, setRate] = useState(settings.hourlyRate.toString());
  const [note, setNote] = useState('');
  const [tag, setTag] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [breakTime, setBreakTime] = useState('0');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const calculatedHours = () => {
    if (!startTime || !endTime) return null;
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    const breakH = parseFloat(breakTime) || 0;
    let diff = end - start;
    if (diff < 0) diff += 24;
    return Math.max(0, diff - breakH);
  };
  
  const handleSubmit = () => {
    let hoursNum = parseFloat(hours);
    
    if (startTime && endTime) {
      const calc = calculatedHours();
      if (calc !== null && calc > 0) {
        hoursNum = calc;
      }
    }
    
    const rateNum = parseFloat(rate);
    
    if (!hoursNum || hoursNum <= 0) return;
    
    if (editingId) {
      updateRecord(editingId, { 
        hours: hoursNum, 
        rate: rateNum, 
        note, 
        tag: tag || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        breakTime: parseFloat(breakTime) || undefined
      });
      setEditingId(null);
    } else {
      addRecord({ 
        date: dateStr, 
        hours: hoursNum, 
        rate: rateNum, 
        note, 
        tag: tag || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        breakTime: parseFloat(breakTime) || undefined
      });
    }
    
    setHours('');
    setRate(settings.hourlyRate.toString());
    setNote('');
    setTag('');
    setStartTime('');
    setEndTime('');
    setBreakTime('0');
    onClose();
  };
  
  const handleEdit = (record: TimeRecord) => {
    setEditingId(record.id);
    setHours(record.hours.toString());
    setRate(record.rate.toString());
    setNote(record.note);
    setTag(record.tag || '');
    setStartTime(record.startTime || '');
    setEndTime(record.endTime || '');
    setBreakTime(record.breakTime ? record.breakTime.toString() : '0');
  };
  
  const handleDelete = (id: string) => {
    deleteRecord(id);
    onClose();
  };
  
  const totalHours = records.reduce((sum, r) => sum + r.hours, 0);
  const totalEarnings = records.reduce((sum, r) => sum + r.hours * r.rate, 0);
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{dateStr} 工时记录</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {records.length > 0 && (
            <div className="summary-card">
              <div className="summary-item">
                <span className="label">总工时</span>
                <span className="value">{totalHours} 小时</span>
              </div>
              <div className="summary-item">
                <span className="label">总收入</span>
                <span className="value earnings">{totalEarnings} {settings.currency}</span>
              </div>
            </div>
          )}
          
          <div className="record-list">
            {records.map(record => (
              <div key={record.id} className="record-item">
                <div className="record-info">
                  <span className="record-hours">{formatHours(record.hours)} × {record.rate}{settings.currency}</span>
                  {record.startTime && record.endTime && (
                    <span className="record-time">
                      {record.startTime} - {record.endTime}
                      {record.breakTime && record.breakTime > 0 && ` (休息${formatHours(record.breakTime)})`}
                    </span>
                  )}
                  {record.tag && <span className="record-tag">{record.tag}</span>}
                  {record.note && <span className="record-note">{record.note}</span>}
                </div>
                <div className="record-actions">
                  <span className="record-total">{(record.hours * record.rate).toFixed(2)} {settings.currency}</span>
                  <button className="action-btn edit" onClick={() => handleEdit(record)}>编辑</button>
                  <button className="action-btn delete" onClick={() => handleDelete(record.id)}>删除</button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="form">
            <div className="time-section">
              <div className="form-group">
                <label>开始时间</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="time-input"
                />
              </div>
              <div className="form-group">
                <label>结束时间</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="time-input"
                />
              </div>
              <div className="form-group">
                <label>休息时间（小时）</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={breakTime}
                  onChange={e => setBreakTime(e.target.value)}
                  className="break-input"
                />
              </div>
              {calculatedHours() !== null && (
                <div className="calculated-hours">
                  <span>计算工时：</span>
                  <span className="hours-value">{calculatedHours()!.toFixed(1)} 小时</span>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label>工时（小时）</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={hours}
                onChange={e => setHours(e.target.value)}
                placeholder="输入工时（或通过时间计算）"
              />
            </div>
            <div className="form-group">
              <label>时薪（{settings.currency}/小时）</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={rate}
                onChange={e => setRate(e.target.value)}
                placeholder="输入时薪"
              />
            </div>
            {settings.tags && settings.tags.length > 0 && (
              <div className="form-group">
                <label>标签（可选）</label>
                <select
                  value={tag}
                  onChange={e => setTag(e.target.value)}
                  className="tag-select"
                >
                  <option value="">无标签</option>
                  {settings.tags.map(t => (
                    <option key={t.name} value={t.name}>
                      {t.name}{t.noSubsidy ? ' (无补助)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-group">
              <label>备注（可选）</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="添加备注"
              />
            </div>
            <button className="submit-btn" onClick={handleSubmit}>
              {editingId ? '保存修改' : '添加记录'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
