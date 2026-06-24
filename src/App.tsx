import { useState, useEffect } from 'react';
import { Calendar } from './components/Calendar';
import { TimeRecordModal } from './components/TimeRecordModal';
import { SettingsModal } from './components/SettingsModal';
import { MonthlyStats } from './components/MonthlyStats';
import { getTotalHoursByDate, getTotalEarningsByDate, getSettings } from './storage';
import { formatDate, isToday } from './utils';
import './App.css';

function App() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  
  const dateStr = formatDate(selectedDate);
  const hours = getTotalHoursByDate(dateStr);
  const earnings = getTotalEarningsByDate(dateStr);
  const settings = getSettings();
  
  useEffect(() => {
    import('@capacitor/core').then(({ Capacitor }) => {
      if (Capacitor.isNativePlatform()) {
        import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
          StatusBar.setBackgroundColor({ color: '#667eea' });
          StatusBar.setStyle({ style: Style.Dark });
        });
      }
    });
  }, []);
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowRecordModal(true);
  };
  
  return (
    <div className="app">
      <header className="header">
        <h1>昜·记工时</h1>
        <div className="header-btns">
          <button className="stats-btn" onClick={() => setShowStatsModal(true)}>
            📊
          </button>
          <button className="settings-btn" onClick={() => setShowSettingsModal(true)}>
            ⚙️
          </button>
        </div>
      </header>
      
      <main className="main">
        <div className="selected-date-info">
          <div className="date-label">
            {isToday(selectedDate) ? '今天' : dateStr}
          </div>
          <div className="date-stats">
            <div className="stat">
              <span className="stat-value">{hours}</span>
              <span className="stat-label">小时</span>
            </div>
            <div className="stat earnings">
              <span className="stat-value">{earnings}</span>
              <span className="stat-label">{settings.currency}</span>
            </div>
          </div>
        </div>
        
        <Calendar selectedDate={selectedDate} onDateSelect={handleDateSelect} />
        
        <button className="add-btn" onClick={() => setShowRecordModal(true)}>
          + 记录工时
        </button>
      </main>
      
      {showRecordModal && (
        <TimeRecordModal date={selectedDate} onClose={() => setShowRecordModal(false)} />
      )}
      
      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
      
      {showStatsModal && (
        <MonthlyStats onClose={() => setShowStatsModal(false)} />
      )}
    </div>
  );
}

export default App;
