import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import styled from 'styled-components';

const VisualisationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

const CanvasWrapper = styled.div`
  margin: 0;
  width: 100%;
  height: 100%;
  border: none;
`;

export default function Visualisation() {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('Loading p5.js...');

  // 시각화 스케치 초기화 함수
  const initSketch = () => {
    console.log('p5.js script loaded, initializing sketch');
    setStatus('Initializing sketch...');
    
    // p5가 로드되었는지 확인
    if (typeof window === 'undefined' || !window.p5) {
      console.error('p5 is not defined!');
      setStatus('Error: p5.js not loaded');
      return;
    }
    
    // 이미 실행 중인 인스턴스 제거
    if (window.sketchInstance) {
      console.log('Removing existing p5 instance');
      window.sketchInstance.remove();
    }

    try {
      // p5 스케치 생성
      window.sketchInstance = new window.p5((p) => {
        // 원본 코드의 변수들
        let thold = 5;
        let spifac = 1.05;
        let outnum = 0;
        let drag = 0.01;
        let big = 500;
        let bodies = [];
        let mX = 0;
        let mY = 0;

        // ball 클래스 정의
        class Ball {
          constructor() {
            this.X = p.random(p.width);
            this.Y = p.random(p.height);
            this.Xv = 0;
            this.Yv = 0;
            this.pX = this.X;
            this.pY = this.Y;
            this.w = p.random(1 / thold, thold);
          }
          
          render() {
            if (!p.mouseIsPressed) {
              this.Xv /= spifac;
              this.Yv /= spifac;
            }
            this.Xv += drag * (mX - this.X) * this.w;
            this.Yv += drag * (mY - this.Y) * this.w;
            this.X += this.Xv;
            this.Y += this.Yv;
            p.line(this.X, this.Y, this.pX, this.pY);
            this.pX = this.X;
            this.pY = this.Y;
          }
        }
        
        // setup 함수: 초기 설정
        p.setup = function() {
          console.log('Setup started');
          setStatus('Setup complete');
          
          const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
          if (canvasRef.current) {
            canvas.parent(canvasRef.current);
          } else {
            console.error('canvasRef.current is null!');
            return;
          }
          
          p.strokeWeight(1);
          p.fill(255, 255, 255);
          p.stroke(255, 0, 0, 5);
          p.background(255, 255, 255);
          p.smooth();
          
          // ball 객체 생성
          for (let i = 0; i < big; i++) {
            bodies[i] = new Ball();
          }
        };
        
        // draw 함수: 매 프레임마다 실행
        p.draw = function() {
          // 키 입력 처리
          if (p.keyIsPressed) {
            p.saveCanvas("Focus " + outnum, "png");
            outnum++;
          }
          
          // 마우스 클릭 처리
          if (p.mouseIsPressed) {
            p.background(255, 255, 255);
            
            mX += 0.30 * (p.mouseX - mX);
            mY += 0.3 * (p.mouseY - mY);
          }
          
          // 마우스 위치 업데이트
          mX += 0.3 * (p.mouseX - mX);
          mY += 0.3 * (p.mouseY - mY);
          
          // 모든 ball 객체 렌더링
          for (let i = 0; i < big; i++) {
            bodies[i].render();
          }
        };
        
        // 창 크기 변경 대응
        p.windowResized = function() {
          p.resizeCanvas(p.windowWidth, p.windowHeight);
          p.background(255, 255, 255);
          
          // ball 객체 재생성
          bodies = [];
          for (let i = 0; i < big; i++) {
            bodies[i] = new Ball();
          }
        };
        
      }, canvasRef.current);
      
      console.log('Sketch instance created successfully');
      
    } catch (error) {
      console.error('Error creating sketch instance:', error);
      setStatus('Error: ' + error.message);
    }
  };

  // p5.js 스크립트 로드 후 초기화
  useEffect(() => {
    if (typeof window !== 'undefined' && window.p5) {
      initSketch();
    }
    
    return () => {
      if (window.sketchInstance) {
        window.sketchInstance.remove();
      }
    };
  }, []);

  return (
    <VisualisationContainer>
      <Head>
        <title>Focus Lines</title>
        <meta name="description" content="Interactive line drawing visualization with p5.js" />
      </Head>

      <CanvasWrapper ref={canvasRef}>
        {status && <div style={{ position: 'absolute', top: '10px', left: '10px', padding: '5px', backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'white' }}>{status}</div>}
      </CanvasWrapper>

      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.min.js"
        strategy="beforeInteractive"
        onLoad={() => {
          console.log("p5.js loaded");
          if (canvasRef.current) {
            try {
              initSketch();
              console.log("Sketch initialized successfully");
            } catch (error) {
              console.error("Error initializing sketch:", error);
              setStatus('Error initializing: ' + error.message);
            }
          }
        }}
        onError={(e) => {
          console.error("Error loading p5.js", e);
          setStatus('Failed to load p5.js');
        }}
      />
    </VisualisationContainer>
  );
}
