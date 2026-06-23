import { useState } from 'react';
import { getSettings, saveSettings } from '../storage';
import { Settings } from '../types';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const settings = getSettings();
  const [hourlyRate, setHourlyRate] = useState(settings.hourlyRate.toString());
  const [currency, setCurrency] = useState(settings.currency);
  
  const handleSave = () => {
    const rate = parseFloat(hourlyRate);
    if (rate > 0) {
      const newSettings: Settings = { hourlyRate: rate, currency };
      saveSettings(newSettings);
      onClose();
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>设置</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="form">
            <div className="form-group">
              <label>默认时薪（{currency}/小时）</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={hourlyRate}
                onChange={e => setHourlyRate(e.target.value)}
                placeholder="输入默认时薪"
              />
            </div>
            <div className="form-group">
              <label>货币符号</label>
              <input
                type="text"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                placeholder="如：元、¥、$"
              />
            </div>
            <button className="submit-btn" onClick={handleSave}>保存设置</button>
          </div>
        </div>
      </div>
    </div>
  );
}
