import { useState } from 'react';
import { getDaysInMonth, getFirstDayOfMonth, getWeekDays, getMonthYearString, formatDate, isToday, isFutureDate } from '../utils';
import { getTotalHoursByDate, getTotalEarningsByDate } from '../storage';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function Calendar({ selectedDate, onDateSelect }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const weekDays = getWeekDays();
  
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const goToday = () => {
    setCurrentDate(new Date());
    onDateSelect(new Date());
  };
  
  const renderDays = () => {
    const days: JSX.Element[] = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty" />);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDate(date);
      const hours = getTotalHoursByDate(dateStr);
      const earnings = getTotalEarningsByDate(dateStr);
      const isSelected = selectedDate && 
        selectedDate.getFullYear() === year && 
        selectedDate.getMonth() === month && 
        selectedDate.getDate() === day;
      const isTodayDate = isToday(date);
      const isFuture = isFutureDate(date);
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${isSelected ? 'selected' : ''} ${isTodayDate ? 'today' : ''} ${isFuture ? 'future' : ''}`}
          onClick={() => !isFuture && onDateSelect(date)}
        >
          <span className="day-number">{day}</span>
          {hours > 0 && (
            <div className="day-summary">
              <span className="hours">{hours}h</span>
              <span className="earnings">{earnings}元</span>
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div className="calendar">
      <div className="calendar-header">
        <button className="nav-btn" onClick={prevMonth}>‹</button>
        <span className="month-year">{getMonthYearString(currentDate)}</span>
        <button className="nav-btn" onClick={nextMonth}>›</button>
      </div>
      <button className="today-btn" onClick={goToday}>今天</button>
      <div className="calendar-weekdays">
        {weekDays.map((day: string) => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>
      <div className="calendar-days">
        {renderDays()}
      </div>
    </div>
  );
}
