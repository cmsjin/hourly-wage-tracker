import { useState, useRef } from 'react';
import { getSettings, saveSettings, exportData, importData } from '../storage';
import { Settings } from '../types';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const settings = getSettings();
  const [hourlyRate, setHourlyRate] = useState(settings.hourlyRate.toString());
  const [currency, setCurrency] = useState(settings.currency);
  const [dailySubsidy, setDailySubsidy] = useState(settings.dailySubsidy.toString());
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSave = () => {
    const rate = parseFloat(hourlyRate);
    const subsidy = parseFloat(dailySubsidy) || 0;
    if (rate > 0) {
      const newSettings: Settings = { 
        hourlyRate: rate, 
        currency,
        dailySubsidy: subsidy
      };
      saveSettings(newSettings);
      onClose();
    }
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hourly-wage-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        importData(data);
        alert('数据导入成功！');
        onClose();
      } catch {
        alert('导入失败：文件格式不正确');
      }
    };
    reader.readAsText(file);
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
            <div className="form-group">
              <label>日补助（{currency}/天）</label>
              <input
                type="number"
                step="1"
                min="0"
                value={dailySubsidy}
                onChange={e => setDailySubsidy(e.target.value)}
                placeholder="输入每日补助金额"
              />
              <small style={{ color: '#999', fontSize: '12px' }}>
                设置后，月统计会自动计算工作天数的补助总额
              </small>
            </div>
            <button className="submit-btn" onClick={handleSave}>保存设置</button>
          </div>

          <div className="import-export-section">
            <h3>数据导入导出</h3>
            <div className="import-export-btns">
              <button className="export-btn" onClick={handleExport}>导出数据</button>
              <button className="import-btn" onClick={handleImportClick}>导入数据</button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleImport}
              />
            </div>
            <div className="import-warning">
              ⚠️ 导入数据会覆盖当前所有记录，请谨慎操作
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}