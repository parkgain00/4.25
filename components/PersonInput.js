import React from 'react';
import { getMaxDaysInMonth } from './Utils';

const PersonInput = ({ 
  label, 
  name, 
  setName, 
  year, 
  setYear, 
  month, 
  setMonth, 
  day, 
  setDay, 
  hour, 
  setHour, 
  minute, 
  setMinute,
  isSimple,
  className,
  nameInputRef,
  onNameBlur,
  yearInputRef,
  onYearBlur,
  monthInputRef,
  onMonthBlur,
  dayInputRef,
  onDayBlur,
  hourInputRef,
  onHourBlur,
  minuteInputRef,
  onMinuteBlur
}) => {
  // 월이 변경되었을 때 일 값이 해당 월의 최대 일수를 초과하는지 체크
  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value, 10);
    setMonth(newMonth);
    const maxDays = getMaxDaysInMonth(newMonth, year);
    if (day > maxDays) {
      setDay(maxDays);
    }
  };

  // 년도가 변경되었을 때 윤년 체크 (2월일 경우)
  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value, 10);
    setYear(newYear);
    if (month === 2) {
      const maxDays = getMaxDaysInMonth(month, newYear);
      if (day > maxDays) {
        setDay(maxDays);
      }
    }
  };

  return (
    <div className={`person-input ${className || ''}`}>
      <h3>{label} 연인</h3>
      <div className="input-group">
        <label>이름</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          ref={nameInputRef}
          onBlur={onNameBlur}
        />
        <div className="underline" />
      </div>
      <div className="input-group">
        <label>생년</label>
        <input 
          type="number" 
          value={year} 
          onChange={handleYearChange} 
          min="1920" 
          max="2025" 
          ref={yearInputRef}
          onBlur={onYearBlur}
        />
        <div className="underline" />
      </div>
      <div className="input-group">
        <label>생월</label>
        <input 
          type="number" 
          value={month} 
          onChange={handleMonthChange} 
          min="1" 
          max="12" 
          ref={monthInputRef}
          onBlur={onMonthBlur}
        />
        <div className="underline" />
      </div>
      <div className="input-group">
        <label>생일</label>
        <input 
          type="number" 
          value={day} 
          onChange={(e) => setDay(parseInt(e.target.value, 10))} 
          min="1" 
          max={getMaxDaysInMonth(month, year)} 
          ref={dayInputRef}
          onBlur={onDayBlur}
        />
        <div className="underline" />
      </div>
      {!isSimple && (
        <>
          <div className="input-group">
            <label>태어난 시</label>
            <input 
              type="number" 
              value={hour} 
              onChange={(e) => setHour(parseInt(e.target.value, 10))} 
              min="0" 
              max="23" 
              ref={hourInputRef}
              onBlur={onHourBlur}
            />
            <div className="underline" />
          </div>
          <div className="input-group">
            <label>태어난 분</label>
            <input 
              type="number" 
              value={minute} 
              onChange={(e) => setMinute(parseInt(e.target.value, 10))} 
              min="0" 
              max="59" 
              ref={minuteInputRef}
              onBlur={onMinuteBlur}
            />
            <div className="underline" />
          </div>
        </>
      )}
      {/** 스타일 추가: number input의 스핀 버튼 숨기기 */}
      <style jsx>{`
        input[type='number']::-webkit-outer-spin-button,
        input[type='number']::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type='number'] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default PersonInput; 