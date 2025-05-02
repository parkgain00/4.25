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

// 코드 주석을 유지합니다
const codeComment = `
// P_2_3_3_01
//
// Generative Gestaltung, ISBN: 978-3-87439-759-9
// First Edition, Hermann Schmidt, Mainz, 2009
// Hartmut Bohnacker, Benedikt Gross, Julia Laub, Claudius Lazzeroni
// Copyright 2009 Hartmut Bohnacker, Benedikt Gross, Julia Laub, Claudius Lazzeroni
//
// http://www.generative-gestaltung.de
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * draw tool. shows how to draw with dynamic elements. 
 * 
 * MOUSE
 * drag                : draw with text
 * 
 * KEYS
 * del, backspace      : clear screen
 * arrow up            : angle distortion +
 * arrow down          : angle distortion -
 * s                   : save png
 */
`;

export default function Visualisation() {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('Loading p5.js...');

  // 시각화 스케치 초기화 함수
  const initSketch = () => {
    console.log('p5.js script loaded, initializing text drawing tool');
    setStatus('Initializing sketch...');
    
    // p5가 로드되었는지 확인
    if (typeof window === 'undefined' || !window.p5) {
      console.error('p5 is not defined!');
      setStatus('Error: p5.js not loaded');
      return;
    }
    
    // 이미 실행 중인 인스턴스 제거
    if (window.textDrawInstance) {
      console.log('Removing existing p5 instance');
      window.textDrawInstance.remove();
    }

    try {
      // p5 스케치 생성
      window.textDrawInstance = new window.p5((p) => {
        // 원본 코드의 전역 변수들
        let x = 0, y = 0;
        let stepSize = 5.0;
        let letters = "緣 연 合 합 命 명 運 운 道 도 吉 길 和 화";
        let fontSizeMin = 3;
        let angleDistortion = 0.0;
        let counter = 0;
        
        // setup 함수: 초기 설정
        p.setup = function() {
          console.log('Text drawing tool setup');
          setStatus('Setup complete - start drawing!');
          
          // 화면 크기에 맞춰 캔버스 생성
          const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
          if (canvasRef.current) {
            canvas.parent(canvasRef.current);
          } else {
            console.error('canvasRef.current is null!');
            return;
          }
          
          p.background(255);
          p.smooth();
          p.cursor(p.CROSS);
          
          x = p.mouseX;
          y = p.mouseY;
          
          p.textAlign(p.LEFT);
          p.fill(255, 0, 0);
        };
        
        // draw 함수: 매 프레임마다 실행
        p.draw = function() {
          // mouseIsPressed는 p5.js에서 자동으로 제공하는 변수
          if (p.mouseIsPressed && p.mouseIsOver()) {
            let d = p.dist(x, y, p.mouseX, p.mouseY);
            p.textFont('Georgia');
            p.textSize(fontSizeMin + d/2);
            let newLetter = letters.charAt(counter);
            stepSize = p.textWidth(newLetter);
            
            if (d > stepSize) {
              let angle = p.atan2(p.mouseY - y, p.mouseX - x);
              
              p.push();
              p.translate(x, y);
              p.rotate(angle + p.random(angleDistortion));
              p.text(newLetter, 0, 0);
              p.pop();
              
              counter++;
              if (counter > letters.length-1) counter = 0;
              
              x = x + p.cos(angle) * stepSize;
              y = y + p.sin(angle) * stepSize;
            }
          }
        };
        
        // mouseOver 함수를 mouseIsOver로 변경하여 p5.js에 맞게 재정의
        p.mouseIsOver = function() {
          return true; // 항상 true 반환 - 캔버스가 전체 화면이므로
        };
        
        // mouseMoved 함수: 마우스 위치 업데이트
        p.mouseMoved = function() {
          x = p.mouseX;
          y = p.mouseY;
        };
        
        // keyTyped 함수: 키 입력 처리
        p.keyTyped = function() {
          if (p.key == 's' || p.key == 'S') p.save("P_2_3_3_01.png");
        };
        
        // keyPressed 함수: 특수 키 입력 처리
        p.keyPressed = function() {
          // angleDistortion 조절: 위/아래 화살표 키
          if (p.keyCode == p.DELETE || p.keyCode == p.BACKSPACE) p.background(255);
          if (p.keyCode == p.UP_ARROW) angleDistortion += 0.1;
          if (p.keyCode == p.DOWN_ARROW) angleDistortion -= 0.1;
        };
        
        // 창 크기 변경 대응
        p.windowResized = function() {
          p.resizeCanvas(p.windowWidth, p.windowHeight);
        };
        
      }, canvasRef.current);
      
      console.log('Text drawing tool instance created successfully');
      
    } catch (error) {
      console.error('Error creating text drawing tool instance:', error);
      setStatus('Error: ' + error.message);
    }
  };

  // p5.js 스크립트 로드 후 초기화
  useEffect(() => {
    if (typeof window !== 'undefined' && window.p5) {
      initSketch();
    }
    
    return () => {
      if (window.textDrawInstance) {
        window.textDrawInstance.remove();
      }
    };
  }, []);

  return (
    <VisualisationContainer>
      <Head>
        <title>Text Drawing Tool</title>
        <meta name="description" content="Interactive text drawing tool based on Generative Gestaltung" />
      </Head>

      <CanvasWrapper ref={canvasRef}>
        {status && <div style={{ position: 'absolute', top: '10px', left: '10px', padding: '5px', backgroundColor: 'rgba(255,255,255,0.7)' }}>{status}</div>}
      </CanvasWrapper>

      <Script
        src="https://cdn.jsdelivr.net/npm/p5@1.4.0/lib/p5.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("p5.js loaded");
          if (canvasRef.current) {
            initSketch();
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