import { useState, useRef } from 'react';
import { getSettings, saveSettings, exportData, importData, exportCSV, importCSV } from '../storage';
import { Settings, SubsidyCondition, Tag, SmartTemplate } from '../types';

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
  const [smartTemplates, setSmartTemplates] = useState<SmartTemplate[]>(settings.smartTemplates || []);
  const [noonBreak, setNoonBreak] = useState(settings.noonBreak?.toString() || '1');
  const [eveningBreak, setEveningBreak] = useState(settings.eveningBreak?.toString() || '0');
  const [newTagName, setNewTagName] = useState('');
  const [newTagNoSubsidy, setNewTagNoSubsidy] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SmartTemplate | null>(null);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [importOverwrite, setImportOverwrite] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const operators = [
    { value: 'gt', label: '>' },
    { value: 'gte', label: '≥' },
    { value: 'eq', label: '=' },
    { value: 'lt', label: '<' },
    { value: 'lte', label: '≤' },
    { value: 'ne', label: '≠' },
  ];

  const addSmartTemplate = () => {
    const newTemplate: SmartTemplate = {
      id: Date.now().toString(),
      name: '',
      conditions: {
        noonBreak: 'gt',
        noonBreakValue: 0,
      },
      template: '',
    };
    setEditingTemplate(newTemplate);
    setShowTemplateForm(true);
  };

  const editSmartTemplate = (template: SmartTemplate) => {
    setEditingTemplate(template);
    setShowTemplateForm(true);
  };

  const saveSmartTemplate = () => {
    if (!editingTemplate || !editingTemplate.name.trim() || !editingTemplate.template.trim()) {
      alert('请填写模板名称和模板内容');
      return;
    }
    if (!editingTemplate.conditions.noonBreak && !editingTemplate.conditions.eveningBreak) {
      alert('请至少设置一个条件');
      return;
    }
    if (editingTemplate.id) {
      setSmartTemplates(smartTemplates.map(t => t.id === editingTemplate.id ? editingTemplate : t));
    } else {
      setSmartTemplates([...smartTemplates, editingTemplate]);
    }
    setEditingTemplate(null);
    setShowTemplateForm(false);
  };

  const deleteSmartTemplate = (id: string) => {
    if (confirm('确定删除该模板吗？')) {
      setSmartTemplates(smartTemplates.filter(t => t.id !== id));
    }
  };

  const updateTemplateField = (field: keyof SmartTemplate, value: string | number) => {
    if (editingTemplate) {
      setEditingTemplate({ ...editingTemplate, [field]: value });
    }
  };

  const updateCondition = (field: keyof SmartTemplate['conditions'], value: any) => {
    if (editingTemplate) {
      setEditingTemplate({
        ...editingTemplate,
        conditions: { ...editingTemplate.conditions, [field]: value }
      });
    }
  };

  const addCondition = () => {
    setSubsidyConditions([...subsidyConditions, { minHours: 0, amount: 0 }]);
  };

  const updateSubsidyCondition = (index: number, field: 'minHours' | 'amount', value: number) => {
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
        tags,
        noteTemplate: settings.noteTemplate,
        smartTemplates,
        noonBreak: parseFloat(noonBreak) || 0,
        eveningBreak: parseFloat(eveningBreak) || 0,
        recordMode: settings.recordMode || 'simple',
        lastInput: settings.lastInput
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
          importCSV(content, importOverwrite);
          alert('CSV数据导入成功！');
        } else {
          const data = JSON.parse(content);
          importData(data, importOverwrite);
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
              <label>默认休息时间（小时）</label>
              <div className="break-time-row">
                <div className="break-item">
                  <span className="break-label">中午休息</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={noonBreak}
                    onChange={e => setNoonBreak(e.target.value)}
                    className="break-input"
                  />
                </div>
                <div className="break-item">
                  <span className="break-label">晚上休息</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={eveningBreak}
                    onChange={e => setEveningBreak(e.target.value)}
                    className="break-input"
                  />
                </div>
              </div>
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
                    onChange={e => updateSubsidyCondition(index, 'minHours', parseFloat(e.target.value) || 0)}
                    style={{ width: '70px' }}
                  />
                  <span>小时</span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="补助"
                    value={condition.amount}
                    onChange={e => updateSubsidyCondition(index, 'amount', parseFloat(e.target.value) || 0)}
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
            <div className="form-group">
              <label>智能模板</label>
              <small style={{ color: '#999', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                根据休息时间条件自动选择模板生成备注。可用变量：{'{date}'}（日期）、{'{timeRange}'}（时间段）、{'{hours}'}（工时）、{'{tag}'}（标签）、{'{noonBreak}'}（中午休息）、{'{eveningBreak}'}（晚上休息）、{'{totalBreak}'}（总休息）
              </small>
              {smartTemplates.map(template => (
                <div key={template.id} className="template-item">
                  <div className="template-header">
                    <span className="template-name">{template.name}</span>
                    <div className="template-actions">
                      <button className="edit-btn" onClick={() => editSmartTemplate(template)}>编辑</button>
                      <button className="remove-btn" onClick={() => deleteSmartTemplate(template.id)}>删除</button>
                    </div>
                  </div>
                  <div className="template-condition">
                    <span>条件：</span>
                    {template.conditions.noonBreak && (
                      <span>中午休息 {operators.find(o => o.value === template.conditions.noonBreak)?.label} {template.conditions.noonBreakValue}</span>
                    )}
                    {template.conditions.noonBreak && template.conditions.eveningBreak && <span>且</span>}
                    {template.conditions.eveningBreak && (
                      <span>晚上休息 {operators.find(o => o.value === template.conditions.eveningBreak)?.label} {template.conditions.eveningBreakValue}</span>
                    )}
                  </div>
                  <div className="template-content">
                    {template.template}
                  </div>
                </div>
              ))}
              {smartTemplates.length === 0 && (
                <div className="empty-template">暂无智能模板</div>
              )}
              <button className="add-btn-small" onClick={addSmartTemplate}>添加模板</button>
              
              {showTemplateForm && editingTemplate && (
                <div className="template-form">
                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label>模板名称</label>
                    <input
                      type="text"
                      value={editingTemplate.name}
                      onChange={e => updateTemplateField('name', e.target.value)}
                      placeholder="如：中午休息"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label>条件设置</label>
                    <div className="condition-row">
                      <span>中午休息</span>
                      <select
                        value={editingTemplate.conditions.noonBreak || ''}
                        onChange={e => updateCondition('noonBreak', e.target.value || undefined)}
                      >
                        <option value="">无条件</option>
                        {operators.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      {editingTemplate.conditions.noonBreak && (
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={editingTemplate.conditions.noonBreakValue || 0}
                          onChange={e => updateCondition('noonBreakValue', parseFloat(e.target.value) || 0)}
                          style={{ width: '60px' }}
                        />
                      )}
                    </div>
                    <div className="condition-row">
                      <span>晚上休息</span>
                      <select
                        value={editingTemplate.conditions.eveningBreak || ''}
                        onChange={e => updateCondition('eveningBreak', e.target.value || undefined)}
                      >
                        <option value="">无条件</option>
                        {operators.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      {editingTemplate.conditions.eveningBreak && (
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={editingTemplate.conditions.eveningBreakValue || 0}
                          onChange={e => updateCondition('eveningBreakValue', parseFloat(e.target.value) || 0)}
                          style={{ width: '60px' }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label>模板内容</label>
                    <textarea
                      value={editingTemplate.template}
                      onChange={e => updateTemplateField('template', e.target.value)}
                      placeholder="例如：{'{date}'} {'{timeRange}'} 工作{'{hours}'}小时"
                      rows={3}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical' }}
                    />
                  </div>
                  <div className="form-actions">
                    <button className="add-btn-small" onClick={saveSmartTemplate}>保存模板</button>
                    <button className="remove-btn" onClick={() => { setShowTemplateForm(false); setEditingTemplate(null); }}>取消</button>
                  </div>
                </div>
              )}
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
              ⚠️ 导入数据会覆盖/追加到当前记录，请谨慎操作
            </div>
            <div className="form-group checkbox-group" style={{ marginTop: '12px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={importOverwrite}
                  onChange={e => setImportOverwrite(e.target.checked)}
                />
                覆盖导入（同名日期的记录将被导入数据替换）
              </label>
            </div>
          </div>

          <div className="about-section">
            <h3>关于</h3>
            <div className="about-content">
              <div className="about-item">
                <span className="about-label">应用名称</span>
                <span className="about-value">昜·记工时</span>
              </div>
              <div className="about-item">
                <span className="about-label">版本</span>
                <span className="about-value">1.0.6</span>
              </div>
              <div className="about-item">
                <span className="about-label">联系作者</span>
                <span className="about-value">
                  <a href="mailto:ytz@yangtz.win">ytz@yangtz.win</a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}