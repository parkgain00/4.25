import { useRef, useState, useEffect } from 'react';
import PersonInput from '../../../components/PersonInput';
import {
  calculateCompatibilityScore,
  calculateElement,
  getPersonalityAnalysis,
  getCompatibilityMessage,
  getDetailedMessage
} from '../../../utils/dateUtils';
import Head from 'next/head';

const NUM_PAPERS = 3;

export default function FlipBook() {
  // 첫번째 입력창 state
  const [name1, setName1] = useState('');
  const [year1, setYear1] = useState('');
  const [month1, setMonth1] = useState('');
  const [day1, setDay1] = useState('');
  const [hour1, setHour1] = useState('');
  const [minute1, setMinute1] = useState('');
  // 두번째 입력창 state
  const [name2, setName2] = useState('');
  const [year2, setYear2] = useState('');
  const [month2, setMonth2] = useState('');
  const [day2, setDay2] = useState('');
  const [hour2, setHour2] = useState('');
  const [minute2, setMinute2] = useState('');

  const [currentLocation, setCurrentLocation] = useState(1); // 1~4
  const [flipped, setFlipped] = useState([false, false, false]);
  const [zIndices, setZIndices] = useState([3, 2, 1]);
  const [bookTransform, setBookTransform] = useState('translateX(0%)');
  const [hasCentered, setHasCentered] = useState(false);
  const [hoverPrev, setHoverPrev] = useState(false);
  const [hoverNext, setHoverNext] = useState(false);
  const [isBookVisible, setIsBookVisible] = useState(false);
  const [isVideoClear, setIsVideoClear] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);

  const [compatResult, setCompatResult] = useState(null);

  const zIndexTable = [
    [3,2,1], // currentLocation === 1
    [1,3,2], // currentLocation === 2
    [2,1,3], // currentLocation === 3
    [3,2,1], // currentLocation === 4 (마지막)
  ];

  const videoRef = useRef(null);
  const p5ContainerRef = useRef(null);

  useEffect(() => {
    if (!hasCentered && currentLocation >= 2) {
      setBookTransform('translateX(50%)');  // 오른쪽으로 이동
      setHasCentered(true);
    } else if (currentLocation === 1) {
      setBookTransform('translateX(0%)');  // 표지로 돌아갈 때 원래 위치로
    }
  }, [currentLocation, hasCentered]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBookVisible(true);
      setTimeout(() => {
        if (videoRef.current) {
          const slowDownInterval = setInterval(() => {
            if (videoRef.current.playbackRate > 0.1) {
              videoRef.current.playbackRate -= 0.05;
            } else {
              videoRef.current.playbackRate = 0;
              clearInterval(slowDownInterval);
              videoRef.current.pause();
            }
          }, 100);
        }
        setIsVideoClear(false);
        // setShowTitle(false);
        // setShowSubtitle(false);
      }, 2000);
    }, 7000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVideoClear(true);
      setShowTitle(true);
      setTimeout(() => {
        setShowSubtitle(true);
      }, 1000);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let p5Instance;
    let isMounted = true;
    function createP5() {
      if (!isMounted) return;
      if (window.p5 && showTitle) {
        p5Instance = new window.p5((p) => {
          const numPoints = 80;
          let t = 0;
          let baseY = p.windowHeight * 0.6;
          let fade = 255;
          p.setup = function() {
            p.createCanvas(window.innerWidth, window.innerHeight).parent(p5ContainerRef.current);
          };
          p.draw = function() {
            p.clear();
            t += 0.012;
            fade -= 0.25;
            if (fade < 0) fade = 0;

            // 하나의 큰 흐름을 공유하는 y값 배열 생성
            let mainY = [];
            for (let i = 0; i < numPoints; i++) {
              let x = (i / (numPoints - 1)) * p.width + t * 220 - p.width * 0.2;
              let y = baseY
                + p.noise(i * 0.15, t * 0.7) * 120 - 60
                + Math.sin(i * 0.2 + t * 1.2) * 18;
              mainY.push({ x, y });
            }

            // 여러 겹의 곡선을 동일한 흐름으로 그린다
            for (let layer = 0; layer < 8; layer++) {
              let colorR = 255 - layer * 10;
              let colorG = 120 + layer * 10;
              let colorB = 80 + layer * 10;
              p.noFill();

              p.beginShape();
              for (let i = 0; i < numPoints; i++) {
                // 곡선의 중간은 두껍고, 양 끝은 얇게 (가우시안/사인/노이즈 등)
                let centerRatio = Math.abs((i - numPoints / 2) / (numPoints / 2));
                let thickness = 2.5 - 2 * Math.pow(centerRatio, 1.5) + p.noise(i * 0.2 + t + layer * 10, t * 0.8 + layer) * 1.2;

                // 끝부분은 더 얇고, 더 투명하게
                let edgeFade = 1 - Math.pow(centerRatio, 1.5); // 중앙 1, 양끝 0
                let alpha = fade * (0.13 + 0.07 * layer) * edgeFade;

                // 흔들림도 두께에 따라 다르게, 끝부분은 더 퍼지게
                let spread = 1 + 2 * (1 - edgeFade); // 끝부분 spread up
                let x = mainY[i].x
                  + Math.sin(t + layer) * layer * 2
                  + Math.sin(i * 0.13 + t * 1.5 + layer) * thickness * 2 * spread
                  + (Math.random() - 0.5) * (1 - edgeFade) * 8; // 끝부분 랜덤
                let y = mainY[i].y
                  + Math.cos(t + layer) * layer * 2
                  + Math.cos(i * 0.11 + t * 1.2 + layer) * thickness * 2 * spread
                  + (Math.random() - 0.5) * (1 - edgeFade) * 8; // 끝부분 랜덤

                p.strokeWeight(thickness);
                p.stroke(colorR, colorG, colorB, alpha);
                p.curveVertex(x, y);
              }
              p.endShape();
            }
          };
          p.windowResized = function() {
            p.resizeCanvas(window.innerWidth, window.innerHeight);
          };
        }, p5ContainerRef.current);
      }
    }
    if (showTitle && typeof window !== 'undefined') {
      if (window.p5) {
        createP5();
      } else {
        const check = setInterval(() => {
          if (window.p5) {
            clearInterval(check);
            createP5();
          }
        }, 50);
      }
    }
    return () => {
      isMounted = false;
      if (p5Instance) p5Instance.remove();
      if (p5ContainerRef.current) {
        p5ContainerRef.current.innerHTML = '';
      }
    };
  }, [showTitle]);

  const goNextPage = () => {
    if (currentLocation < NUM_PAPERS + 1) {
      if (currentLocation === 2) {
        // 궁합 결과 계산
        const personA = {
          year: Number(year1),
          month: Number(month1),
          day: Number(day1),
          hour: Number(hour1)
        };
        const personB = {
          year: Number(year2),
          month: Number(month2),
          day: Number(day2),
          hour: Number(hour2)
        };
        const score = calculateCompatibilityScore(personA, personB);
        const elementA = calculateElement(personA.year, personA.month, personA.day, personA.hour);
        const elementB = calculateElement(personB.year, personB.month, personB.day, personB.hour);
        setCompatResult({
          score,
          elementA,
          elementB,
          nameA: name1,
          nameB: name2,
          message: getCompatibilityMessage(score),
          detail: getDetailedMessage(score, elementA, elementB),
          personalityA: getPersonalityAnalysis(elementA),
          personalityB: getPersonalityAnalysis(elementB)
        });
      }
      if (currentLocation === 1) {
        setFlipped(f => [true, f[1], f[2]]);
        setZIndices([1, 2, 3]);
      } else if (currentLocation === 2) {
        setFlipped(f => [f[0], true, f[2]]);
        setZIndices([1, 2, 3]);
      } else if (currentLocation === 3) {
        setFlipped(f => [f[0], f[1], true]);
        setZIndices([1, 2, 3]);
      }
      setCurrentLocation(loc => loc + 1);
    }
  };

  const goPrevPage = () => {
    if (currentLocation > 1) {
      if (currentLocation === 2) {
        setFlipped(f => [false, f[1], f[2]]);
        setZIndices([3, 2, 1]);
      } else if (currentLocation === 3) {
        setFlipped(f => [f[0], false, f[2]]);
        setZIndices([1, 2, 3]);
      } else if (currentLocation === 4) {
        setFlipped(f => [f[0], f[1], false]);
        setZIndices([1, 2, 3]);
      }
      setCurrentLocation(loc => loc - 1);
    }
  };

  useEffect(() => {
    setZIndices(zIndexTable[currentLocation - 1]);
  }, [currentLocation]);

  // 오버레이 닫기 함수
  const closeResult = () => setCompatResult(null);

  return (
    <>
      <Head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.min.js" />
      </Head>
      {/* 배경 영상 */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, overflow: 'hidden' }}>
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 0,
            filter: isVideoClear ? 'blur(0)' : 'blur(16px)',
            transition: 'filter 2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <source src="/bgvideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            textAlign: 'center',
            zIndex: 3
          }}
        >
          <div
            style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              opacity: showTitle ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              marginBottom: '0.5rem'
            }}
          >
            <div style={{ marginBottom: '1rem' }}>연담</div>
            <div style={{ fontSize: '1.5rem' }}>緣談</div>
          </div>
          <div
            style={{
              fontSize: '1.2rem',
              opacity: showSubtitle ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              marginTop: '1rem'
            }}
          >
            인연에 대해 이야기하다
          </div>
        </div>
      </div>
      <div>
        <div
          id="book"
          className="book"
          style={{
            zIndex: 1,
            transform: `${bookTransform} translateY(${isBookVisible ? '0' : '100vh'})`,
            transition: 'transform 2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {[0, 1, 2].map(i => {
            // 오른쪽(활성) 페이지: i === currentLocation - 1
            const isRightActive = i === currentLocation - 1;
            // 왼쪽(바로 이전) 페이지: i === currentLocation - 2
            const isLeftActive = i === currentLocation - 2;
            return (
              <div
                key={i}
                id={`p${i + 1}`}
                className={`paper${flipped[i] ? ' flipped' : ''}`}
                style={{ zIndex: zIndices[i] }}
              >
                <div
                  className="front"
                  style={
                    i === 1 && currentLocation === 2
                      ? {
                          backgroundImage: "url('/oldpaper.jpg')",
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          backgroundColor: 'rgba(0,0,0,0)'
                        }
                      : {}
                  }
                >
                  {isLeftActive && currentLocation > 1 && (
                    <div
                      className={`corner-fold prev-corner${hoverPrev ? ' hovered' : ''}`}
                      onMouseEnter={() => setHoverPrev(true)}
                      onMouseLeave={() => setHoverPrev(false)}
                      onClick={goPrevPage}
                      style={{ zIndex: 999 }}
                    />
                  )}
                  <div className="front-content">
                    {i === 1 && currentLocation === 2 ? (
                      <PersonInput
                        label="두번째"
                        name={name2}
                        setName={setName2}
                        year={year2}
                        setYear={setYear2}
                        month={month2}
                        setMonth={setMonth2}
                        day={day2}
                        setDay={setDay2}
                        hour={hour2}
                        setHour={setHour2}
                        minute={minute2}
                        setMinute={setMinute2}
                        isSimple={false}
                      />
                    ) : i === 2 && currentLocation === 2 ? (
                      <PersonInput
                        label="두번째"
                        name={name2}
                        setName={setName2}
                        year={year2}
                        setYear={setYear2}
                        month={month2}
                        setMonth={setMonth2}
                        day={day2}
                        setDay={setDay2}
                        hour={hour2}
                        setHour={setHour2}
                        minute={minute2}
                        setMinute={setMinute2}
                        isSimple={false}
                      />
                    ) : i === 2 && currentLocation === 3 && compatResult ? (
                      <div className="compat-result">
                        <div className="personality-section">
                          <div className="personality-title">개인별 성향 분석</div>
                          <div className="personality-box">
                            <h3>{compatResult.nameA} ({compatResult.elementA})</h3>
                            <p>{compatResult.personalityA}</p>
                          </div>
                          <div className="personality-box">
                            <h3>{compatResult.nameB} ({compatResult.elementB})</h3>
                            <p>{compatResult.personalityB}</p>
                          </div>
                        </div>
                        <div className="detailed-message" dangerouslySetInnerHTML={{ __html: compatResult.detail }}></div>
                      </div>
                    ) : (
                      <h1>{`Front ${i + 1}`}</h1>
                    )}
                  </div>
                  {isRightActive && currentLocation < NUM_PAPERS + 1 && (
                    <div
                      className={`corner-fold next-corner${hoverNext ? ' hovered' : ''}`}
                      onMouseEnter={() => setHoverNext(true)}
                      onMouseLeave={() => setHoverNext(false)}
                      onClick={goNextPage}
                      style={{ zIndex: 999 }}
                    />
                  )}
                </div>
                <div className={`back${i === 0 && currentLocation === 2 ? ' hanji-bg' : ''}${i === 1 && currentLocation === 2 ? ' oldpaper-bg' : ''}`}>
                  <div className="back-content">
                    {i === 0 && currentLocation >= 3 && compatResult ? (
                      <div className="compat-result">
                        <div className="score-container">
                          <div className="score-label">궁합 점수</div>
                          <div className="score-number">{compatResult.score}</div>
                        </div>
                        <div className="message-title">{compatResult.nameA}님과 {compatResult.nameB}님의 궁합 결과</div>
                        <div className="message">{compatResult.message}</div>
                      </div>
                    ) : (
                      i === 0 && currentLocation === 2 ? (
                        <PersonInput
                          label="첫번째"
                          name={name1}
                          setName={setName1}
                          year={year1}
                          setYear={setYear1}
                          month={month1}
                          setMonth={setMonth1}
                          day={day1}
                          setDay={setDay1}
                          hour={hour1}
                          setHour={setHour1}
                          minute={minute1}
                          setMinute={setMinute1}
                          isSimple={false}
                        />
                      ) : (
                        <h1>{`Back ${i + 1}`}</h1>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style jsx global>{`
        html, body, #__next {
          background: transparent !important;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          height: 100vh;
          width: 100vw;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: 'Noto Sans KR', sans-serif;
          background-color: black;
          overflow: hidden;
          position: fixed;
        }
        #book {
          position: relative;
          width: 400px;
          height: 650px;
          transition: transform 0.5s;
          transform-origin: center center;
          margin: auto;
          cursor: default;
        }
        #book::before,
        #book::after {
          pointer-events: none;
        }
        #book::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0 100% 0 0;
          cursor: pointer;
          z-index: 10;
        }
        #book::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: 0;
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 100% 0 0 0;
          cursor: pointer;
          z-index: 10;
        }
        .paper, .front, .back {
          height: 100%;
          min-height: 100%;
        }
        .paper {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          perspective: 1500px;
        }
        .front,
        .back {
          background-color: #fffdfa;  /* 연한 노란빛 베이지 색상 */
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          overflow: hidden;
          transform-origin: left;
          transition: transform 0.5s;
        }
        .front {
          display: flex;
          justify-content: center;
          align-items: center;
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          overflow: hidden;
          z-index: 1;
          backface-visibility: hidden;
          border-left: 3px solid black;
        }
        .back {
          z-index: 0;
        }
        .front-content,
        .back-content {
          width: 100%;
          height: 100%;
          min-height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        .front-content {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        .back-content {
          transform: rotateY(180deg)
        }
        .flipped .front,
        .flipped .back {
          transform: rotateY(-180deg);
        }
        .book {
          cursor: pointer;
        }
        button {
          display: none;
        }
        i {
          font-size: 50px;
          color: gray;
        }
        #p1 {
          z-index: 3;
        }
        #p2 {
          z-index: 2;
        }
        #p3 {
          z-index: 1;
        }

        /* PersonInput modern 스타일 */
        .person-input {
          width: 90%;
          max-width: 320px;
          background: transparent;
          padding: 1.2rem 1.5rem 1.2rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-top: 0 !important;
          margin-bottom: 0 !important;
        }
        .person-input h3 {
          font-size: 1.3rem;
          font-weight: bold;
          color: #c3142d;
          margin-bottom: 1.1rem;
          margin-top: 0;
          text-align: center;
        }
        .input-group {
          margin-bottom: 0.8rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }
        .input-group label {
          margin-bottom: 0.4rem;
          font-weight: bold;
          color: #3b2b2b;
          text-align: center;
          width: 100%;
        }
        .input-group input, .input-group select {
          padding: 0.5rem 0;
          border: none;
          border-bottom: 1px solid #ccc;
          border-radius: 0;
          font-size: 1rem;
          background: transparent;
          transition: border-color 0.2s;
          text-align: center;
          width: 100%;
          outline: none;
        }
        .input-group input:focus, .input-group select:focus {
          border-bottom-color: #c3142d;
        }
        .input-group select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 0.5rem center;
          background-size: 1em;
          padding-right: 2.5rem;
        }
        .checkbox-group {
          margin-top: 0.5rem;
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .checkbox-group label {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 0.95rem;
          text-align: center;
        }
        .checkbox-group input[type="checkbox"] {
          margin-right: 6px;
          accent-color: #c3142d;
        }
        .hanji-bg {
          background-image: url('/hanji.jpeg');
          background-position: center;
          background-repeat: no-repeat;
          background-color: transparent !important;
        }
        .oldpaper-bg {
          background-image: url('/oldpaper.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-color: transparent !important;
        }
        body, * {
          font-family: 'Gowun Batang', serif !important;
        }
        .front.oldpaper-no-bg {
          background-color: transparent !important;
        }
        .oldpaper-no-bg {
          background-color: transparent !important;
        }
        .corner-fold {
          position: absolute;
          z-index: 999;
          pointer-events: auto;
          width: 36px;
          height: 36px;
          bottom: 0;
        }
        .corner-fold.next-corner {
          right: 0;
          left: auto;
        }
        .corner-fold.prev-corner {
          left: 0;
          right: auto;
          transform: scaleX(-1);
        }
        .corner-fold.hovered {
          transform: translateY(10px) scale(1.18) rotate(-8deg);
          box-shadow: -1px 1px 4px rgba(0,0,0,0.10);
        }
        .flipped .back {
          z-index: 999; /* 클릭 가능한 면 앞으로 */
          pointer-events: auto;
        }
        .names-display {
          font-size: 2.1rem;
          font-weight: bold;
          color: #c3142d;
          margin: 0.5rem 0 1.2rem 0;
          border-bottom: 2px solid #c3142d;
          padding-bottom: 0.7rem;
          animation: fadeIn 1.5s ease-in-out;
        }
        .score-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 1.2rem 0 1.5rem 0;
          animation: fadeIn 2s ease-in-out;
        }
        .score-label {
          font-size: 1.2rem;
          color: #c3142d;
          margin-bottom: 0.3rem;
        }
        .score-number {
          font-size: 3.2rem;
          font-weight: bold;
          color: #c3142d;
          line-height: 1;
        }
        .message-title {
          font-size: 1.1rem;
          font-weight: bold;
          margin-top: 1.1rem;
          color: #c3142d;
        }
        .message {
          font-size: 1.1rem;
          text-align: center;
          margin-top: 0.7rem;
          max-width: 700px;
          line-height: 1.7;
        }
        .personality-section {
          margin-top: 1.2rem;
          width: 100%;
          max-width: 700px;
          animation: fadeIn 2.2s ease-in-out;
        }
        .personality-title {
          font-size: 1.1rem;
          font-weight: bold;
          color: #c3142d;
          margin-bottom: 0.7rem;
          text-align: center;
        }
        .personality-box {
          background-color: rgba(255, 245, 245, 0.5);
          padding: 0.7rem;
          border-radius: 8px;
          margin-bottom: 0.7rem;
        }
        .personality-box h3 {
          color: #c3142d;
          margin-top: 0;
          margin-bottom: 0.3rem;
          font-size: 1rem;
        }
        .personality-box p {
          margin: 0;
          line-height: 1.5;
        }
        .detailed-message {
          margin-top: 1.2rem;
          font-size: 1rem;
          color: #3b2b2b;
          max-width: 700px;
          text-align: center;
          line-height: 1.6;
          background-color: rgba(255, 245, 245, 0.5);
          padding: 1rem;
          border-radius: 10px;
          animation: fadeIn 2.5s ease-in-out;
        }
        .detailed-message strong {
          color: #c3142d;
          font-weight: bold;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .compat-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.45);
          z-index: 2000;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .compat-result {
          background: #fffdfa;
          border-radius: 18px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          padding: 2.5rem 2.2rem 2.2rem 2.2rem;
          max-width: 480px;
          width: 90vw;
          text-align: center;
          position: relative;
          animation: fadeIn 0.7s cubic-bezier(.77,.2,.2,1);
        }
        .close-btn {
          position: absolute;
          top: 18px;
          right: 18px;
          background: none;
          border: none;
          font-size: 2.2rem;
          color: #c3142d;
          cursor: pointer;
          z-index: 10;
        }
      `}</style>
      {/* FontAwesome CDN for icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />
      {/* Google Fonts - Noto Sans KR */}
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet" />
      {showTitle && (
        <div
          ref={p5ContainerRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 2,
            pointerEvents: 'none',
            opacity: showTitle ? 1 : 0,
            transition: 'opacity 1s'
          }}
        />
      )}
    </>
  );
}
