import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function P5BookFlip() {
  const canvasRef = useRef(null);
  const [p5Ready, setP5Ready] = useState(false);

  useEffect(() => {
    if (!p5Ready) return;
    let p5Instance;
    let sketch = (p) => {
      let pageWidth = 400;
      let pageHeight = 600;
      let flipSpeed = 0.03;

      p.setup = function () {
        p.createCanvas(pageWidth * 2, pageHeight, p.WEBGL);
        p.noStroke();
        p.rectMode(p.CENTER);
        p.pageFlip = false;
        p.flipProgress = 0;
      };

      p.draw = function () {
        p.background(245, 240, 230);
        // 카메라 위치 조정
        p.rotateY(p.PI); // 거울 뒤집기 효과 (기본 뷰 수정)
        // 왼쪽 페이지
        p.push();
        p.translate(-pageWidth / 2, 0, 0);
        p.fill(250, 245, 233);
        p.rect(-pageWidth / 2, -pageHeight / 2, pageWidth, pageHeight);
        p.pop();
        // 오른쪽 페이지 (넘기기 전)
        p.push();
        p.translate(pageWidth / 2, 0, 0);
        p.fill(255, 250, 240);
        p.rect(-pageWidth / 2, -pageHeight / 2, pageWidth, pageHeight);
        p.pop();
        // 넘기는 페이지
        if (p.pageFlip) {
          p.flipProgress += flipSpeed;
          p.flipProgress = p.constrain(p.flipProgress, 0, 1);
          p.push();
          p.translate(pageWidth / 2, 0, 1);
          p.rotateY(-p.PI * p.flipProgress);
          p.fill(255, 250, 240);
          p.rect(-pageWidth / 2, -pageHeight / 2, pageWidth, pageHeight);
          p.pop();
          if (p.flipProgress >= 1) {
            p.pageFlip = false;
            p.flipProgress = 0;
          }
        }
      };

      p.mousePressed = function () {
        if (!p.pageFlip) {
          p.pageFlip = true;
        }
      };
    };
    p5Instance = new window.p5(sketch);
    // 캔버스를 원하는 div로 이동
    let canvas = document.querySelector('canvas');
    if (canvas && canvasRef.current) {
      canvasRef.current.appendChild(canvas);
    }
    return () => {
      if (p5Instance) {
        p5Instance.remove();
      }
    };
  }, [p5Ready]);

  return (
    <>
      <Head>
        <title>p5.js Book Flip</title>
      </Head>
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgb(245,240,230)' }}>
        <div ref={canvasRef}></div>
      </div>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.min.js"
        strategy="beforeInteractive"
        onLoad={() => setP5Ready(true)}
      />
    </>
  );
}