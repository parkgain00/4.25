import Head from 'next/head'
import { useState } from 'react'
import Footer from '../components/Footer'

export default function Compatibility() {
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState({
    compatibility: '',
    personality: {
      person1: '',
      person2: ''
    }
  });
  const [names, setNames] = useState({ name1: '', name2: '' });

  // 천간과 지지 배열 (사주 계산을 위한 기본 자료)
  const 천간 = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
  const 지지 = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];

  // 오행: 목, 화, 토, 금, 수
  const 오행 = ["목", "화", "토", "금", "수"];

  // 생년월일을 기반으로 천간, 지지를 계산하는 함수
  function calculateHeavenlyStemsAndEarthlyBranches(year) {
    const 천간Index = (year - 4) % 10; // 천간 계산 (음력 기준 4년부터 시작)
    const 지지Index = (year - 4) % 12; // 지지 계산 (12지지 순환)

    return {
      천간: 천간[천간Index], // 천간
      지지: 지지[지지Index], // 지지
      오행: 오행[천간Index % 5] // 오행 계산 (천간 인덱스를 기준으로 오행 매칭)
    };
  }

  // 성격 분석: 천간, 지지, 오행에 따른 성격 특성 (단순화된 예시)
  function analyzePersonality(천간, 지지, 오행) {
    let personality = "";

    // 오행에 따른 성격 분석
    switch (오행) {
      case "목":
        personality += "적극적이고 창의적인 성향을 가집니다. ";
        break;
      case "화":
        personality += "열정적이고 활동적인 성향을 가집니다. ";
        break;
      case "토":
        personality += "실용적이고 안정적인 성향을 가집니다. ";
        break;
      case "금":
        personality += "냉철하고 분석적인 성향을 가집니다. ";
        break;
      case "수":
        personality += "침착하고 신중한 성향을 가집니다. ";
        break;
    }

    return personality;
  }

  // 사주 분석을 바탕으로 궁합을 계산하는 함수
  function getCompatibilityResult(name1, birth1, name2, birth2) {
    const [year1] = birth1.split("-"); // 년도만 추출
    const [year2] = birth2.split("-"); // 년도만 추출

    const person1 = calculateHeavenlyStemsAndEarthlyBranches(parseInt(year1));
    const person2 = calculateHeavenlyStemsAndEarthlyBranches(parseInt(year2));

    const compatibilityScore = Math.floor(Math.random() * 100); // 랜덤 궁합 점수 (여기서는 예시로 랜덤 값)

    return {
      compatibility: compatibilityScore + "%",
      personality: {
        person1: analyzePersonality(person1.천간, person1.지지, person1.오행),
        person2: analyzePersonality(person2.천간, person2.지지, person2.오행)
      }
    };
  }

  // 폼 제출 처리
  const handleSubmit = (event) => {
    event.preventDefault();
    
    const name1 = event.target.name1.value;
    const birth1 = event.target.birth1.value;
    const name2 = event.target.name2.value;
    const birth2 = event.target.birth2.value;

    setNames({ name1, name2 });
    const compatibilityResult = getCompatibilityResult(name1, birth1, name2, birth2);
    setResult(compatibilityResult);
    setShowResult(true);
  };

  return (
    <div className="container">
      <Head>
        <title>사주 궁합 분석</title>
        <meta name="description" content="간단한 사주 궁합 분석" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="title">사주 궁합 분석</h1>

      {/* 사주 입력 부분 */}
      <form id="compatibilityForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name1">사람 1 이름:</label>
          <input type="text" id="name1" name="name1" required />
        </div>
        
        <div className="form-group">
          <label htmlFor="birth1">사람 1 생년월일시 (예: 1990-05-10 12:30):</label>
          <input type="text" id="birth1" name="birth1" required />
        </div>
        
        <div className="form-group">
          <label htmlFor="name2">사람 2 이름:</label>
          <input type="text" id="name2" name="name2" required />
        </div>
        
        <div className="form-group">
          <label htmlFor="birth2">사람 2 생년월일시 (예: 1992-08-15 14:00):</label>
          <input type="text" id="birth2" name="birth2" required />
        </div>
        
        <button type="submit" className="analyze-button">궁합 분석하기</button>
      </form>

      {/* 결과 출력 부분 */}
      {showResult && (
        <div id="result" className="result-container">
          <h2>궁합 분석 결과</h2>
          <p id="compatibilityResult">
            {names.name1}님과 {names.name2}님의 궁합은 <span className="highlight">{result.compatibility}</span>입니다.
          </p>
          <p id="personalityDifferences">
            {names.name1}님은 {result.personality.person1}
            {names.name2}님은 {result.personality.person2}
          </p>
          <p id="harmony">
            {names.name1}님과 {names.name2}님은 서로 성격 차이가 있지만,
            서로를 배려하는 성향 덕분에 조화를 이룰 수 있습니다. 서로의 차이를 이해하고 존중한다면 좋은 관계를 유지할 수 있습니다.
          </p>
        </div>
      )}

      {/* 푸터 컴포넌트 */}
      <Footer />

      <style jsx>{`
        .container {
          font-family: 'Noto Serif KR', serif;
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .title {
          color: #c3142d;
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }
        
        input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .analyze-button {
          background-color: transparent;
          color: #c3142d;
          border: 1px solid #c3142d;
          padding: 0.7rem 1.5rem;
          font-size: 1rem;
          cursor: pointer;
          display: block;
          margin: 2rem auto;
          transition: all 0.3s;
        }
        
        .analyze-button:hover {
          background-color: #c3142d;
          color: white;
        }
        
        .result-container {
          margin-top: 2rem;
          padding: 1.5rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: rgba(255, 245, 245, 0.5);
          animation: fadeIn 0.5s ease-in;
        }
        
        .result-container h2 {
          margin-top: 0;
          color: #c3142d;
          font-weight: bold;
          text-align: center;
          margin-bottom: 1.5rem;
        }
        
        .result-container p {
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        
        .highlight {
          font-weight: bold;
          color: #c3142d;
          font-size: 1.2rem;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
} 