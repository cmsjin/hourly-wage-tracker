import { useState } from 'react';
import { formatDate } from '../utils';
import { addRecord, updateRecord, deleteRecord, getRecordsByDate, getSettings } from '../storage';
import { TimeRecord } from '../types';

interface TimeRecordModalProps {
  date: Date;
  onClose: () => void;
}

export function TimeRecordModal({ date, onClose }: TimeRecordModalProps) {
  const dateStr = formatDate(date);
  const records = getRecordsByDate(dateStr);
  const settings = getSettings();
  const [hours, setHours] = useState('');
  const [rate, setRate] = useState(settings.hourlyRate.toString());
  const [note, setNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const handleSubmit = () => {
    const hoursNum = parseFloat(hours);
    const rateNum = parseFloat(rate);
    
    if (!hoursNum || hoursNum <= 0) return;
    
    if (editingId) {
      updateRecord(editingId, { hours: hoursNum, rate: rateNum, note });
      setEditingId(null);
    } else {
      addRecord({ date: dateStr, hours: hoursNum, rate: rateNum, note });
    }
    
    setHours('');
    setRate(settings.hourlyRate.toString());
    setNote('');
    onClose();
  };
  
  const handleEdit = (record: TimeRecord) => {
    setEditingId(record.id);
    setHours(record.hours.toString());
    setRate(record.rate.toString());
    setNote(record.note);
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
                  <span className="record-hours">{record.hours}h × {record.rate}{settings.currency}</span>
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
            <div className="form-group">
              <label>工时（小时）</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={hours}
                onChange={e => setHours(e.target.value)}
                placeholder="输入工时"
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
