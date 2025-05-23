import { useEffect, useRef } from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function P5BookFlip() {
  const canvasRef = useRef(null);

  useEffect(() => {
    let p5Instance;
    let sketch = (p) => {
      let pageWidth = 400;
      let pageHeight = 600;
      let isFlipping = false;
      let flipProgress = 0;
      let flipSpeed = 0.02;

      p.setup = function () {
        p.createCanvas(pageWidth * 2, pageHeight, p.WEBGL);
        p.noStroke();
      };

      p.draw = function () {
        p.background(200, 180, 150);
        // 왼쪽 페이지
        p.push();
        p.fill(245, 222, 179);
        p.rect(-pageWidth, -pageHeight / 2, pageWidth, pageHeight);
        p.pop();
        // 오른쪽 페이지
        p.push();
        p.fill(245, 222, 179);
        p.rect(0, -pageHeight / 2, pageWidth, pageHeight);
        p.pop();
        // 페이지 넘김 애니메이션
        if (isFlipping) {
          flipProgress += flipSpeed;
          if (flipProgress >= 1) {
            flipProgress = 0;
            isFlipping = false;
          }
        }
        // 페이지 넘김 효과
        if (flipProgress > 0) {
          p.push();
          // 넘기는 페이지는 오른쪽 페이지 위에 겹쳐서 그리기
          p.translate(0, 0, 1); // z=1로 살짝 위에
          let angle = p.PI * flipProgress;
          p.rotateY(angle);
          p.fill(245, 222, 179);
          p.rect(0, -pageHeight / 2, pageWidth, pageHeight);
          p.pop();
        }
      };

      p.mousePressed = function () {
        if (!isFlipping) {
          isFlipping = true;
          flipProgress = 0;
        }
      };
    };

    if (window.p5) {
      p5Instance = new window.p5(sketch, canvasRef.current);
    }
    return () => {
      if (p5Instance) {
        p5Instance.remove();
      }
    };
  }, []);

  return (
    <>
      <Head>
        <title>p5.js Book Flip</title>
      </Head>
      <div ref={canvasRef}></div>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.min.js" strategy="beforeInteractive" />
    </>
  );
}