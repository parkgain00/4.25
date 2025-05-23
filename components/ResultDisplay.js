import React from 'react';

const ResultDisplay = ({ 
  isVisible, 
  score, 
  nameA, 
  nameB, 
  message, 
  detailedMessage, 
  personalityA, 
  personalityB,
  elementA,
  elementB,
  onBack 
}) => {
  return (
    <div id="resultSection" className={`result-section ${isVisible ? 'active' : ''}`}>
      <div className="result-bg"></div>
      <div className="names-display">{nameA} ♥ {nameB}</div>

      <div className="score-container">
        <div className="score-label">궁합 점수</div>
        <div className="score-number">{score}</div>
      </div>

      <div className="message-title">{nameA}님과 {nameB}님의 궁합 결과</div>
      <div className="message" id="messageText">{message}</div>

      {/* 성향 분석 */}
      <div className="personality-section">
        <div className="personality-title">개인별 성향 분석</div>
        <div className="personality-box">
          <h3>{nameA} ({elementA})</h3>
          <p>{personalityA}</p>
        </div>
        <div className="personality-box">
          <h3>{nameB} ({elementB})</h3>
          <p>{personalityB}</p>
        </div>
      </div>

      {/* 상세한 성향 분석 */}
      <div className="detailed-message" dangerouslySetInnerHTML={{ __html: detailedMessage }}></div>

      <button className="back-button" onClick={onBack}>이전으로</button>

      <style jsx>{`
        .result-section {
          display: none;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 800px;
          padding: 2rem;
        }
        
        .result-section.active {
          display: flex;
        }
        
        .names-display {
          font-size: 2.8rem;
          font-weight: bold;
          color: #c3142d;
          margin: 1rem 0;
          border-bottom: 2px solid #c3142d;
          padding-bottom: 1rem;
          animation: fadeIn 1.5s ease-in-out;
        }
        
        .score-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 2rem 0;
          animation: fadeIn 2s ease-in-out;
        }
        
        .score-label {
          font-size: 1.5rem;
          color: #c3142d;
          margin-bottom: 0.5rem;
        }
        
        .score-number {
          font-size: 7rem;
          font-weight: bold;
          color: #c3142d;
          line-height: 1;
        }
        
        .message-title {
          font-size: 1.6rem;
          font-weight: bold;
          margin-top: 1.5rem;
          color: #c3142d;
        }
        
        .message {
          font-size: 1.4rem;
          text-align: center;
          margin-top: 1rem;
          max-width: 700px;
          line-height: 1.7;
        }
        
        .personality-section {
          margin-top: 2rem;
          width: 100%;
          max-width: 700px;
          animation: fadeIn 2.2s ease-in-out;
        }
        
        .personality-title {
          font-size: 1.4rem;
          font-weight: bold;
          color: #c3142d;
          margin-bottom: 1rem;
          text-align: center;
        }
        
        .personality-box {
          background-color: rgba(255, 245, 245, 0.5);
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        
        .personality-box h3 {
          color: #c3142d;
          margin-top: 0;
          margin-bottom: 0.5rem;
          font-size: 1.2rem;
        }
        
        .personality-box p {
          margin: 0;
          line-height: 1.5;
        }
        
        .detailed-message {
          margin-top: 2rem;
          font-size: 1.2rem;
          color: #3b2b2b;
          max-width: 700px;
          text-align: center;
          line-height: 1.6;
          background-color: rgba(255, 245, 245, 0.5);
          padding: 1.5rem;
          border-radius: 10px;
          animation: fadeIn 2.5s ease-in-out;
        }
        
        .detailed-message strong {
          color: #c3142d;
          font-weight: bold;
        }
        
        .back-button {
          margin-top: 3rem;
          font-size: 1rem;
          padding: 0.6rem 1.5rem;
          border: 1px solid #c3142d;
          color: #c3142d;
          background: transparent;
          cursor: pointer;
          transition: 0.3s;
        }
        
        .back-button:hover {
          background-color: #c3142d;
          color: #fff;
        }
        
        .result-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.05;
          z-index: -1;
          background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23c3142d' fill-opacity='0.4' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E");
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 768px) {
          .names-display {
            font-size: 2rem;
          }
          
          .score-number {
            font-size: 5rem;
          }
          
          .detailed-message {
            padding: 1rem;
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ResultDisplay; 