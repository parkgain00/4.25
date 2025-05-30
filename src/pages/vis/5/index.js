import Head from 'next/head';
import { useState, useEffect } from 'react';

const PAGES = [
  '', // 0: 첫 왼쪽(빈)
  '📄 3페이지', // 2: 두번째 왼쪽
  '📄 4페이지', // 3: 두번째 오른쪽
  '📄 5페이지', // 4: 세번째 왼쪽
  '📄 6페이지', // 5: 세번째 오른쪽
  '📕 끝', // 6: 마지막 왼쪽
  '' // 7: 마지막 오른쪽
];

export default function Vis5() {
  const [spread, setSpread] = useState(1); // 항상 홀수: 왼쪽 페이지 인덱스(페이지3부터 시작)
  const [flipping, setFlipping] = useState(false);
  const [initialAnimation, setInitialAnimation] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 8초 후에 책이 보이기 시작
    const visibilityTimer = setTimeout(() => {
      setIsVisible(true);
    }, 8000);

    // 14.5초 후에 초기 애니메이션 클래스 제거 (9.5초 + 5초)
    const timer = setTimeout(() => {
      setInitialAnimation(false);
    }, 14500);

    return () => {
      clearTimeout(visibilityTimer);
      clearTimeout(timer);
    };
  }, []);

  function flip() {
    if (flipping) return;
    if (spread >= PAGES.length - 2) return;
    setFlipping(true);
    setTimeout(() => {
      setSpread(s => s + 2);
      setFlipping(false);
    }, 700);
  }

  return (
    <>
      <Head>
        <title>현실적인 책 넘김 애니메이션</title>
        <style>{`
          body {
            margin: 0;
            background: #e6e3dc;
            min-height: 100vh;
          }
          .bookflip-root {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100vw;
            height: 100vh;
            user-select: none;
          }
          .bookflip-book {
            position: relative;
            width: min(1000px, 90vw);
            height: min(750px, 90vw * 0.75, 90vh);
            perspective: 1800px;
            margin: 0;
            animation: slide-up 9.5s cubic-bezier(.77,.2,.2,1) forwards;
          }
          @keyframes slide-up {
            0% { transform: translateY(100vh); }
            84.2% { transform: translateY(100vh); } /* 8초 동안 화면 밖에 있음 */
            100% { transform: translateY(0); } /* 1.5초 동안 올라옴 */
          }
          .bookflip-page {
            position: absolute;
            width: 50%;
            height: 100%;
            top: 0;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            font-family: 'serif';
            transition: box-shadow 0.3s;
            z-index: 1;
            background: #fff;
            color: #000;
          }
          .bookflip-left {
            left: 0;
            background: #fff;
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;
            box-shadow: 4px 0 16px #0001 inset;
            border-right: 1px solid #e0d8c8;
          }
          .bookflip-right {
            right: 0;
            background: #fff;
            border-top-right-radius: 8px;
            border-bottom-right-radius: 8px;
            box-shadow: -4px 0 16px #0001 inset;
            border-left: 1px solid #e0d8c8;
            z-index: 2;
            cursor: pointer;
            transition: transform 0.7s cubic-bezier(.77,.2,.2,1), box-shadow 0.3s;
            transform-origin: left center;
            position: absolute;
          }
          .bookflip-right.flipping {
            animation: bookflip-turn 0.7s cubic-bezier(.77,.2,.2,1) forwards;
            z-index: 3;
          }
          .bookflip-right.initial-animation {
            animation: initial-scale 5s cubic-bezier(.77,.2,.2,1) forwards;
            animation-delay: 9.5s; /* slide-up 애니메이션 후에 시작 */
          }
          @keyframes bookflip-turn {
            0% { transform: rotateY(0deg) scaleX(1); box-shadow: -4px 0 16px #0001 inset; }
            40% { box-shadow: -40px 0 40px #0003 inset; }
            100% { transform: rotateY(-180deg) scaleX(1.02); box-shadow: 4px 0 32px #0002 inset; }
          }
          @keyframes initial-scale {
            0% { transform: scale(1); opacity: 1; }
            40% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.4); opacity: 1; }
            90% { transform: scale(1.4); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          .bookflip-corner-btn {
            position: absolute;
            right: 12px;
            bottom: 12px;
            background: #fff8f0;
            color: #b36b00;
            border: 1px solid #e0d8c8;
            border-radius: 16px 16px 16px 0;
            font-size: 1rem;
            padding: 8px 18px;
            box-shadow: 0 2px 8px #0001;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s;
            z-index: 10;
            cursor: pointer;
            font-family: 'serif';
          }
          .bookflip-page.bookflip-right:hover .bookflip-corner-btn {
            opacity: 1;
            pointer-events: auto;
          }
        `}</style>
      </Head>
      <div className="bookflip-root">
        <div className="bookflip-book">
          {/* 왼쪽 페이지 */}
          <div 
            className="bookflip-page bookflip-left" 
            style={{
              zIndex: 1,
              background: spread === 1 ? '#e6e3dc' : '#fff',
              opacity: spread === 1 ? 0 : 1
            }}
          >
            {PAGES[spread]}
          </div>
          {/* 오른쪽 페이지(애니메이션) */}
          <div
            className={
              "bookflip-page bookflip-right" +
              (flipping ? " flipping" : "") +
              (initialAnimation ? " initial-animation" : "")
            }
            style={{
              zIndex: flipping ? 3 : 2, 
              position: 'absolute',
              left: spread === 1 ? '25%' : '50%',
              width: '50%',
              background: flipping && spread === 1 ? '#fff' : '#fff',
            }}
            title="오른쪽 아래 모서리에서 넘기기"
          >
            {/* flipping 중이면 앞면은 spread+1, 뒷면은 spread+2 */}
            {(!flipping || spread !== 1) ? PAGES[spread + 1] : (
              <div style={{position:'relative', width:'100%', height:'100%'}}>
                <div style={{position:'absolute', width:'100%', height:'100%', backfaceVisibility:'hidden'}}>{PAGES[spread + 1]}</div>
                <div style={{position:'absolute', width:'100%', height:'100%', transform:'rotateY(180deg)', backfaceVisibility:'hidden'}}>{PAGES[spread + 2]}</div>
              </div>
            )}
            {!flipping && spread < PAGES.length - 2 && (
              <div
                className="bookflip-corner-btn"
                onClick={e => { e.stopPropagation(); flip(); }}
              >
                페이지를 넘기시오
              </div>
            )}
          </div>
          {/* flipping 중일 때, 다음 오른쪽 페이지를 미리 렌더 */}
          {(flipping && spread !== 1) && (
            <div
              className="bookflip-page bookflip-right"
              style={{
                zIndex: 1,
                left: '50%',
                top: 0,
                width: '50%',
                height: '100%',
                position: 'absolute',
                pointerEvents: 'none',
                opacity: 1,
                background: '#fff'
              }}
            >
              {PAGES[spread + 3]}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
