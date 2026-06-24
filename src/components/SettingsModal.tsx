import { useState, useRef } from 'react';
import { getSettings, saveSettings, exportData, importData, exportCSV, importCSV } from '../storage';
import { Settings, SubsidyCondition, Tag } from '../types';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const settings = getSettings();
  const [hourlyRate, setHourlyRate] = useState(settings.hourlyRate.toString());
  const [currency, setCurrency] = useState(settings.currency);
  const [subsidyConditions, setSubsidyConditions] = useState<SubsidyCondition[]>(
    settings.subsidyConditions || []
  );
  const [tags, setTags] = useState<Tag[]>(settings.tags || []);
  const [newTagName, setNewTagName] = useState('');
  const [newTagNoSubsidy, setNewTagNoSubsidy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addCondition = () => {
    setSubsidyConditions([...subsidyConditions, { minHours: 0, amount: 0 }]);
  };

  const updateCondition = (index: number, field: 'minHours' | 'amount', value: number) => {
    const newConditions = [...subsidyConditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setSubsidyConditions(newConditions);
  };

  const removeCondition = (index: number) => {
    setSubsidyConditions(subsidyConditions.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (!newTagName.trim()) return;
    if (tags.some(t => t.name === newTagName.trim())) {
      alert('标签已存在');
      return;
    }
    setTags([...tags, { name: newTagName.trim(), noSubsidy: newTagNoSubsidy }]);
    setNewTagName('');
    setNewTagNoSubsidy(false);
  };

  const removeTag = (name: string) => {
    setTags(tags.filter(t => t.name !== name));
  };

  const toggleTagNoSubsidy = (name: string) => {
    setTags(tags.map(t => t.name === name ? { ...t, noSubsidy: !t.noSubsidy } : t));
  };
  
  const handleSave = () => {
    const rate = parseFloat(hourlyRate);
    if (rate > 0) {
      const newSettings: Settings = { 
        hourlyRate: rate, 
        currency,
        subsidyConditions,
        tags
      };
      saveSettings(newSettings);
      onClose();
    }
  };

  const handleExportJSON = () => {
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

  const handleExportCSV = () => {
    const csv = exportCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hourly-wage-data-${new Date().toISOString().split('T')[0]}.csv`;
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
        const content = event.target?.result as string;
        
        if (file.name.endsWith('.csv')) {
          importCSV(content);
          alert('CSV数据导入成功！');
        } else {
          const data = JSON.parse(content);
          importData(data);
          alert('JSON数据导入成功！');
        }
        
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
              <label>条件补助</label>
              <small style={{ color: '#999', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                工时达到条件时自动发放补助，按条件顺序匹配
              </small>
              {subsidyConditions.map((condition, index) => (
                <div key={index} className="condition-row">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="≥工时"
                    value={condition.minHours}
                    onChange={e => updateCondition(index, 'minHours', parseFloat(e.target.value) || 0)}
                    style={{ width: '70px' }}
                  />
                  <span>小时</span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="补助"
                    value={condition.amount}
                    onChange={e => updateCondition(index, 'amount', parseFloat(e.target.value) || 0)}
                    style={{ width: '70px' }}
                  />
                  <span>{currency}</span>
                  <button className="remove-btn" onClick={() => removeCondition(index)}>×</button>
                </div>
              ))}
              <button className="add-btn-small" onClick={addCondition}>添加条件</button>
            </div>
            <div className="form-group">
              <label>标签管理</label>
              <small style={{ color: '#999', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                设置标签，用于标记工时记录。无补助标签的记录不计入条件补助
              </small>
              <div className="tag-list">
                {tags.map(tag => (
                  <div key={tag.name} className={`tag-item ${tag.noSubsidy ? 'no-subsidy' : ''}`}>
                    <span className="tag-name">{tag.name}</span>
                    <span className="tag-no-subsidy" onClick={() => toggleTagNoSubsidy(tag.name)}>
                      {tag.noSubsidy ? '❌无补助' : '✓有补助'}
                    </span>
                    <button className="remove-btn" onClick={() => removeTag(tag.name)}>×</button>
                  </div>
                ))}
              </div>
              <div className="tag-add-row">
                <input
                  type="text"
                  placeholder="新标签名称"
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && addTag()}
                  style={{ flex: 1 }}
                />
                <label className="tag-checkbox">
                  <input
                    type="checkbox"
                    checked={newTagNoSubsidy}
                    onChange={e => setNewTagNoSubsidy(e.target.checked)}
                  />
                  无补助
                </label>
                <button className="add-btn-small" onClick={addTag}>添加</button>
              </div>
            </div>
            <button className="submit-btn" onClick={handleSave}>保存设置</button>
          </div>

          <div className="import-export-section">
            <h3>数据导入导出</h3>
            <div className="import-export-btns">
              <button className="export-btn" onClick={handleExportJSON}>导出 JSON</button>
              <button className="export-btn" onClick={handleExportCSV}>导出 CSV</button>
              <button className="import-btn" onClick={handleImportClick}>导入数据</button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                style={{ display: 'none' }}
                onChange={handleImport}
              />
            </div>
            <div className="import-warning">
              ⚠️ 导入数据会追加到当前记录，请谨慎操作
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}