import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { 
  isLeapYear, 
  getMaxDaysInMonth, 
  getSeason,
  calculateElement, 
  calculateCompatibilityScore, 
  getPersonalityAnalysis,
  getCompatibilityMessage,
  getDetailedMessage
} from '../utils/dateUtils'
import ResultDisplay from '../components/ResultDisplay'
import styled, { keyframes } from 'styled-components'

// Define keyframes for styled-components
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0.3;
    transform: translate(-150px, 40px);
  }
  to {
    opacity: 1;
    transform: translate(0, 0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0.3;
    transform: translate(150px, 40px);
  }
  to {
    opacity: 1;
    transform: translate(0, 0);
  }
`;

const drawBorder = keyframes`
  0% {
    stroke-dashoffset: 3000;
  }
  100% {
    stroke-dashoffset: 0;
  }
`;

const lineGrow = keyframes`
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
`;

// Styled components
const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 20px 15px;
  opacity: 0;
  transform: translateY(20px);
  animation: ${fadeIn} 1.5s ease-in-out 0.5s forwards;
  position: relative;
  z-index: 2;
`;

const SubmitButton = styled.button`
  margin-top: 0.5rem;
  padding: 0.8rem 2.2rem;
  font-size: 1.2rem;
  background-color: transparent;
  color: #c3142d;
  border: 1px solid #c3142d;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(20px);
  animation: ${fadeIn} 1s ease-in-out 2s forwards;
  
  &:hover {
    background-color: #c3142d;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(195, 20, 45, 0.2);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(195, 20, 45, 0.2);
  }
`;

const BorderContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 780px;
  margin: 0 auto;
  box-sizing: border-box;
  min-height: 610px;
  padding: 5px;
`;

const PersonBlock = styled.div`
  padding: 20px;
  margin-bottom: 15px;
  flex: 1;
  position: relative;
  z-index: 2;
  min-width: 280px;
  border: 1.5px solid #c3142d;
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(195, 20, 45, 0.1);
`;

const PersonBlockLeft = styled(PersonBlock)`
  opacity: 0;
  animation: ${slideInLeft} 1.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s forwards;
`;

const PersonBlockRight = styled(PersonBlock)`
  opacity: 0;
  animation: ${slideInRight} 1.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s forwards;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 400px;
  max-width: 1000px;
  margin: 2rem auto;
`;

export default function Home() {
  const [activeSection, setActiveSection] = useState('form');
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const [detailedMessage, setDetailedMessage] = useState('');
  const [nameA, setNameA] = useState('');
  const [nameB, setNameB] = useState('');
  const [dayA, setDayA] = useState('');
  const [dayB, setDayB] = useState('');
  const [elementA, setElementA] = useState('');
  const [elementB, setElementB] = useState('');
  const [personalityA, setPersonalityA] = useState('');
  const [personalityB, setPersonalityB] = useState('');
  const [yearA, setYearA] = useState('');
  const [monthA, setMonthA] = useState('');
  const [hourA, setHourA] = useState('');
  const [yearB, setYearB] = useState('');
  const [monthB, setMonthB] = useState('');
  const [hourB, setHourB] = useState('');
  const [minuteA, setMinuteA] = useState('');
  const [minuteB, setMinuteB] = useState('');
  const [noTimeA, setNoTimeA] = useState(false);
  const [noTimeB, setNoTimeB] = useState(false);
  const [meridianA, setMeridianA] = useState('AM');
  const [meridianB, setMeridianB] = useState('AM');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Client-side only code
    if (typeof window !== 'undefined') {
      const style = document.createElement('style');
      style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&display=swap');
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    // p5.js 로드 및 초기화
    if (typeof window !== 'undefined' && activeSection === 'loading') {
      // p5.js가 이미 로드되어 있는지 확인
      if (!window.p5) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/p5@1.4.0/lib/p5.js';
        script.async = true;
        script.onload = () => {
          const sketchScript = document.createElement('script');
          sketchScript.src = '/mySketch.js';
          sketchScript.async = true;
          document.body.appendChild(sketchScript);
        };
        document.body.appendChild(script);
      } else {
        // p5.js가 이미 로드되어 있다면 스케치만 로드
        const sketchScript = document.createElement('script');
        sketchScript.src = '/mySketch.js';
        sketchScript.async = true;
        document.body.appendChild(sketchScript);
      }
      
      return () => {
        // Clean up p5 instance when unmounting
        document.querySelectorAll('script[src="/mySketch.js"]')
          .forEach(el => el.remove());
        document.querySelectorAll('canvas')
          .forEach(el => el.remove());
      };
    }
  }, [activeSection]);

  function calculate() {
    // 이름 값은 DOM에서 직접 가져옴
    const nameAInput = document.getElementById('nameA');
    const nameBInput = document.getElementById('nameB');
    
    // 이름 값이 있으면 상태 업데이트
    if (nameAInput && nameAInput.value) setNameA(nameAInput.value);
    if (nameBInput && nameBInput.value) setNameB(nameBInput.value);

    // 각 사람의 날짜 정보 - state에서 직접 가져옴
    const personA = {
      year: yearA ? parseInt(yearA, 10) : 0,
      month: monthA ? parseInt(monthA, 10) : 0,
      day: dayA ? parseInt(dayA, 10) : 0,
      hour: hourA ? parseInt(hourA, 10) : 0,
      minute: minuteA ? parseInt(minuteA, 10) : 0,
      meridian: meridianA
    };

    const personB = {
      year: yearB ? parseInt(yearB, 10) : 0,
      month: monthB ? parseInt(monthB, 10) : 0,
      day: dayB ? parseInt(dayB, 10) : 0,
      hour: hourB ? parseInt(hourB, 10) : 0,
      minute: minuteB ? parseInt(minuteB, 10) : 0,
      meridian: meridianB
    };

    // 값 유효성 검사
    const isValid = personA.year && personA.month && personA.day && 
                    personB.year && personB.month && personB.day;
    
    if (!isValid) {
      alert('필수 정보(년, 월, 일)를 모두 입력해주세요.');
      return;
    }

    // 로딩 상태 활성화
    setActiveSection('loading');
    setIsLoading(true);

    // 5초 후에 결과 표시
    setTimeout(() => {
      // 궁합 점수 계산
      const compatibilityScore = calculateCompatibilityScore(personA, personB);
      setScore(compatibilityScore);

      // 각 사람의 오행 계산
      const elemA = calculateElement(personA.year, personA.month, personA.day, personA.hour);
      const elemB = calculateElement(personB.year, personB.month, personB.day, personB.hour);
      setElementA(elemA);
      setElementB(elemB);

      // 각 사람의 성격 분석
      const personalityA = getPersonalityAnalysis(elemA);
      const personalityB = getPersonalityAnalysis(elemB);
      setPersonalityA(personalityA);
      setPersonalityB(personalityB);
      
      // 궁합 메시지 생성
      const baseMessage = getCompatibilityMessage(compatibilityScore);
      setMessage(baseMessage);

      // 상세 메시지 생성
      const detailed = getDetailedMessage(compatibilityScore, elemA, elemB);
      setDetailedMessage(detailed);

      // 로딩 상태 비활성화
      setIsLoading(false);
      // 결과 화면으로 전환
      setActiveSection('result');
    }, 5000);
  }

  function goBack() {
    setActiveSection('form');
  }

  // 유효 범위 검사 함수
  const validateNumberInput = (value, min, max) => {
    if (value === '') return true;
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return false;
    return numValue >= min && numValue <= max;
  };

  // 키 입력 이벤트 핸들러들
  const handleYearAKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!validateNumberInput(e.target.value, 1920, 2025)) {
        e.target.value = '';
        setYearA('');
      }
    }
  };

  const handleYearBKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!validateNumberInput(e.target.value, 1920, 2025)) {
        e.target.value = '';
        setYearB('');
      }
    }
  };

  const handleMonthAKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!validateNumberInput(e.target.value, 1, 12)) {
        e.target.value = '';
        setMonthA('');
      } else {
        // 일수 유효성 검사
        if (e.target.value && yearA) {
          const maxDays = getMaxDaysInMonth(parseInt(e.target.value, 10), parseInt(yearA, 10));
          if (parseInt(dayA, 10) > maxDays) {
            setDayA('');
            document.getElementById('dayA').value = '';
          }
        }
      }
    }
  };

  const handleMonthBKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!validateNumberInput(e.target.value, 1, 12)) {
        e.target.value = '';
        setMonthB('');
      } else {
        // 일수 유효성 검사
        if (e.target.value && yearB) {
          const maxDays = getMaxDaysInMonth(parseInt(e.target.value, 10), parseInt(yearB, 10));
          if (parseInt(dayB, 10) > maxDays) {
            setDayB('');
            document.getElementById('dayB').value = '';
          }
        }
      }
    }
  };

  const handleDayAKeyDown = (e) => {
    if (e.key === 'Enter') {
      let max = 31;
      if (monthA && yearA) {
        max = getMaxDaysInMonth(parseInt(monthA, 10), parseInt(yearA, 10));
      }
      if (!validateNumberInput(e.target.value, 1, max)) {
        e.target.value = '';
        setDayA('');
      }
    }
  };

  const handleDayBKeyDown = (e) => {
    if (e.key === 'Enter') {
      let max = 31;
      if (monthB && yearB) {
        max = getMaxDaysInMonth(parseInt(monthB, 10), parseInt(yearB, 10));
      }
      if (!validateNumberInput(e.target.value, 1, max)) {
        e.target.value = '';
        setDayB('');
      }
    }
  };

  const handleHourAKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!validateNumberInput(e.target.value, 0, 23)) {
        e.target.value = '';
        setHourA('');
      }
    }
  };

  const handleHourBKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!validateNumberInput(e.target.value, 0, 23)) {
        e.target.value = '';
        setHourB('');
      }
    }
  };

  const handleMinuteAKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!validateNumberInput(e.target.value, 0, 59)) {
        e.target.value = '';
        setMinuteA('');
      }
    }
  };

  const handleMinuteBKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!validateNumberInput(e.target.value, 0, 59)) {
        e.target.value = '';
        setMinuteB('');
      }
    }
  };

  // 포커스 아웃 이벤트 핸들러들
  const handleYearABlur = (e) => {
    if (!validateNumberInput(e.target.value, 1920, 2025)) {
      e.target.value = '';
      setYearA('');
    }
  };

  const handleYearBBlur = (e) => {
    if (!validateNumberInput(e.target.value, 1920, 2025)) {
      e.target.value = '';
      setYearB('');
    }
  };

  const handleMonthABlur = (e) => {
    if (!validateNumberInput(e.target.value, 1, 12)) {
      e.target.value = '';
      setMonthA('');
    } else {
      // 일수 유효성 검사
      if (e.target.value && yearA) {
        const maxDays = getMaxDaysInMonth(parseInt(e.target.value, 10), parseInt(yearA, 10));
        if (parseInt(dayA, 10) > maxDays) {
          setDayA('');
          document.getElementById('dayA').value = '';
        }
      }
    }
  };

  const handleMonthBBlur = (e) => {
    if (!validateNumberInput(e.target.value, 1, 12)) {
      e.target.value = '';
      setMonthB('');
    } else {
      // 일수 유효성 검사
      if (e.target.value && yearB) {
        const maxDays = getMaxDaysInMonth(parseInt(e.target.value, 10), parseInt(yearB, 10));
        if (parseInt(dayB, 10) > maxDays) {
          setDayB('');
          document.getElementById('dayB').value = '';
        }
      }
    }
  };

  const handleDayABlur = (e) => {
    let max = 31;
    if (monthA && yearA) {
      max = getMaxDaysInMonth(parseInt(monthA, 10), parseInt(yearA, 10));
    }
    if (!validateNumberInput(e.target.value, 1, max)) {
      e.target.value = '';
      setDayA('');
    }
  };

  const handleDayBBlur = (e) => {
    let max = 31;
    if (monthB && yearB) {
      max = getMaxDaysInMonth(parseInt(monthB, 10), parseInt(yearB, 10));
    }
    if (!validateNumberInput(e.target.value, 1, max)) {
      e.target.value = '';
      setDayB('');
    }
  };

  const handleHourABlur = (e) => {
    if (!validateNumberInput(e.target.value, 0, 23)) {
      e.target.value = '';
      setHourA('');
    }
  };

  const handleHourBBlur = (e) => {
    if (!validateNumberInput(e.target.value, 0, 23)) {
      e.target.value = '';
      setHourB('');
    }
  };

  const handleMinuteABlur = (e) => {
    if (!validateNumberInput(e.target.value, 0, 59)) {
      e.target.value = '';
      setMinuteA('');
    }
  };

  const handleMinuteBBlur = (e) => {
    if (!validateNumberInput(e.target.value, 0, 59)) {
      e.target.value = '';
      setMinuteB('');
    }
  };

  // 일반 값 변경 핸들러
  const handleChange = (e, setter) => {
    setter(e.target.value);
  };

  // "태어난 시 모름" 체크박스 핸들러
  const handleNoTimeAChange = (e) => {
    setNoTimeA(e.target.checked);
    if (e.target.checked) {
      setHourA('');
      setMinuteA('');
    }
  };

  const handleNoTimeBChange = (e) => {
    setNoTimeB(e.target.checked);
    if (e.target.checked) {
      setHourB('');
      setMinuteB('');
    }
  };

  return (
    <div className="container">
      <Head>
        <title>홍연</title>
        <meta name="description" content="사주 궁합 계산기" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* 입력 화면 */}
      <div id="formSection" className={`form-section ${activeSection === 'form' ? 'active' : ''}`}>
        <BorderContainer>
          <FormWrapper>
            <div className="form-row">
              <PersonBlockLeft>
                <div className="input-group">
                  <label htmlFor="nameA">이름</label>
                  <input 
                    id="nameA" 
                    type="text" 
                    value={nameA}
                    onChange={(e) => setNameA(e.target.value)}
                    placeholder="이름을 입력하세요"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="yearA">년도</label>
                  <input 
                    id="yearA" 
                    type="number" 
                    value={yearA}
                    onChange={(e) => setYearA(e.target.value)}
                    onBlur={(e) => validateNumberInput(e.target.value, 1920, 2025) ? null : setYearA('')}
                    onKeyDown={handleYearAKeyDown}
                    placeholder="1920-2025"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="monthA">월</label>
                  <input 
                    id="monthA" 
                    type="number" 
                    value={monthA}
                    onChange={(e) => setMonthA(e.target.value)}
                    onBlur={(e) => validateNumberInput(e.target.value, 1, 12) ? null : setMonthA('')}
                    onKeyDown={handleMonthAKeyDown}
                    placeholder="1-12"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="dayA">일</label>
                  <input 
                    id="dayA" 
                    type="number" 
                    value={dayA}
                    onChange={(e) => setDayA(e.target.value)}
                    onBlur={(e) => validateNumberInput(e.target.value, 1, 31) ? null : setDayA('')}
                    onKeyDown={handleDayAKeyDown}
                    placeholder="1-31"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="hourA">시</label>
                  <input 
                    id="hourA" 
                    type="number" 
                    value={hourA}
                    onChange={(e) => setHourA(e.target.value)}
                    onBlur={(e) => validateNumberInput(e.target.value, 0, 23) ? null : setHourA('')}
                    onKeyDown={handleHourAKeyDown}
                    placeholder="0-23"
                    disabled={noTimeA}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="minuteA">분</label>
                  <input 
                    id="minuteA" 
                    type="number" 
                    value={minuteA}
                    onChange={(e) => setMinuteA(e.target.value)}
                    onBlur={(e) => validateNumberInput(e.target.value, 0, 59) ? null : setMinuteA('')}
                    onKeyDown={handleMinuteAKeyDown}
                    placeholder="0-59"
                    disabled={noTimeA}
                  />
                </div>
                <div className="input-group checkbox-group">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={noTimeA}
                      onChange={handleNoTimeAChange}
                    />
                    태어난 시간 모름
                  </label>
                </div>
              </PersonBlockLeft>

              <PersonBlockRight>
                <div className="input-group">
                  <label htmlFor="nameB">이름</label>
                  <input 
                    id="nameB" 
                    type="text" 
                    value={nameB}
                    onChange={(e) => setNameB(e.target.value)}
                    placeholder="이름을 입력하세요"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="yearB">년도</label>
                  <input 
                    id="yearB" 
                    type="number" 
                    value={yearB}
                    onChange={(e) => setYearB(e.target.value)}
                    onBlur={(e) => validateNumberInput(e.target.value, 1920, 2025) ? null : setYearB('')}
                    onKeyDown={handleYearBKeyDown}
                    placeholder="1920-2025"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="monthB">월</label>
                  <input 
                    id="monthB" 
                    type="number" 
                    value={monthB}
                    onChange={(e) => setMonthB(e.target.value)}
                    onBlur={(e) => validateNumberInput(e.target.value, 1, 12) ? null : setMonthB('')}
                    onKeyDown={handleMonthBKeyDown}
                    placeholder="1-12"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="dayB">일</label>
                  <input 
                    id="dayB" 
                    type="number" 
                    value={dayB}
                    onChange={(e) => setDayB(e.target.value)}
                    onBlur={(e) => validateNumberInput(e.target.value, 1, 31) ? null : setDayB('')}
                    onKeyDown={handleDayBKeyDown}
                    placeholder="1-31"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="hourB">시</label>
                  <input 
                    id="hourB" 
                    type="number" 
                    value={hourB}
                    onChange={(e) => setHourB(e.target.value)}
                    onBlur={(e) => validateNumberInput(e.target.value, 0, 23) ? null : setHourB('')}
                    onKeyDown={handleHourBKeyDown}
                    placeholder="0-23"
                    disabled={noTimeB}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="minuteB">분</label>
                  <input 
                    id="minuteB" 
                    type="number" 
                    value={minuteB}
                    onChange={(e) => setMinuteB(e.target.value)}
                    onBlur={(e) => validateNumberInput(e.target.value, 0, 59) ? null : setMinuteB('')}
                    onKeyDown={handleMinuteBKeyDown}
                    placeholder="0-59"
                    disabled={noTimeB}
                  />
                </div>
                <div className="input-group checkbox-group">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={noTimeB}
                      onChange={handleNoTimeBChange}
                    />
                    태어난 시간 모름
                  </label>
                </div>
              </PersonBlockRight>
            </div>

            <SubmitButton onClick={calculate}>궁합 보기</SubmitButton>
          </FormWrapper>
        </BorderContainer>
      </div>

      {/* 로딩 화면 */}
      <div id="loadingSection" className={`loading-section ${activeSection === 'loading' ? 'active' : ''}`}>
        <LoadingContainer>
          <div id="p5Canvas" style={{ width: '100%', height: '400px' }}></div>
        </LoadingContainer>
      </div>

      {/* 결과 화면 */}
      <ResultDisplay 
        isVisible={activeSection === 'result'}
        score={score}
        nameA={nameA}
        nameB={nameB}
        message={message}
        detailedMessage={detailedMessage}
        personalityA={personalityA}
        personalityB={personalityB}
        elementA={elementA}
        elementB={elementB}
        onBack={goBack}
      />

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&display=swap');
        
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem 1rem;
          margin: 0;
          font-family: 'Noto Serif KR', serif;
          background-color: #fffdfa;
          color: #3b2b2b;
          min-height: 100vh;
          overflow-x: hidden;
        }
        
        .form-section,
        .loading-section {
          display: none;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 1000px;
        }
        
        .form-section.active,
        .loading-section.active {
          display: flex;
        }
        
        @keyframes drawBorder {
          0% {
            stroke-dashoffset: 3000;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        
        .border-svg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 3;
          pointer-events: none;
        }
        
        .border-rect {
          stroke-dasharray: 3000;
          stroke-dashoffset: 3000;
          animation: drawBorder 2.5s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }
        
        .form-row {
          display: flex;
          flex-direction: row;
          justify-content: space-around;
          align-items: flex-start;
          width: 100%;
          flex-wrap: wrap;
          margin: 0 -5px;
          gap: 10px;
        }
        
        @media (max-width: 768px) {
          .form-row {
            flex-direction: column;
            align-items: center;
            gap: 5px;
          }
          
          .border-svg {
            height: 100%;
            width: 100%;
          }
        }
        
        .input-group {
          margin-bottom: 0.8rem;
          display: flex;
          flex-direction: column;
        }
        
        .input-group label {
          margin-bottom: 0.4rem;
          font-weight: bold;
        }
        
        .input-group input, .input-group select {
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 1rem;
        }
        
        .input-group input:focus, .input-group select:focus {
          outline: none;
          border-color: #c3142d;
          box-shadow: 0 0 0 2px rgba(195, 20, 45, 0.2);
        }
        
        .checkbox-group {
          margin-top: 0.5rem;
        }
        
        .checkbox-group label {
          display: flex;
          align-items: center;
          cursor: pointer;
          font-size: 0.9rem;
        }
        
        .checkbox-group input[type="checkbox"] {
          margin-right: 6px;
          accent-color: #c3142d;
        }
        
        @media (max-width: 700px) {
          .title {
            font-size: 2rem;
          }
          
          .description {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
} 