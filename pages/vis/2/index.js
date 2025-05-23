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
  height: 100vh;네
  overflow: hidden;
  background-color: #fafafa; /* 배경색 약간 변경 */
`;

const CanvasWrapper = styled.div`
  margin: 0;
  width: 100%;
  height: 100%;
  border: none;
  position: relative; /* 상태 메시지의 absolute 포지셔닝을 위해 */
`;

const StatusMessage = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 8px 12px;
  background-color: rgba(255, 255, 255, 0.7);
  color: #333;
  border-radius: 4px;
  font-family: sans-serif;
  font-size: 14px;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Number23 = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 150pt;
  font-weight: bold;
  color: #d91c1c;
  font-family: 'Italiana', serif;
  z-index: 20;
  pointer-events: none;
  user-select: none;
`;

export default function Visualisation() {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('Loading p5.js...');
  const [showNumber, setShowNumber] = useState(false);

  // p5.js 스크립트에서 신호를 받으면 숫자 23 표시
  useEffect(() => {
    const handler = () => setShowNumber(true);
    window.addEventListener('showNumber23', handler);
    return () => window.removeEventListener('showNumber23', handler);
  }, []);

  // 시각화 스케치 초기화 함수
  const initSketch = () => {
    console.log('p5.js script loaded, initializing thread animation');
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
        let thread;
        let isBreaking = false;
        let breakProgress = 0;
        let zoomActive = false;
        let zoomPoint = null;
        let zoomLevel = 1;
        let targetZoomLevel = 1;
        let zoomCenterX = 0;
        let zoomCenterY = 0;
        
        // 여러 가닥의 실을 표현하기 위한 Thread 클래스
        class Thread {
          constructor(start, end, segments) {
            this.start = start;
            this.end = end;
            this.segments = segments;
            this.mainPoints = [];
            
            // 진폭 감소로 더 얇은 실 표현
            this.amplitude = 5; // 고정 진폭
            
            // 크기 비율 저장용 변수 추가
            this.scale = 0;
            
            // 메인 실 경로 생성
            for (let i = 0; i <= segments; i++) {
              let t = i / segments;
              let x = p.lerp(start.x, end.x, t);
              let y = start.y + p.sin(t * p.PI * 3) * this.amplitude;
              this.mainPoints.push(p.createVector(x, y));
            }
            
            // 여러 가닥의 실 데이터 초기화
            this.strands = [];
            const strandCount = 7; // 실 가닥 수 증가 (5에서 7로)
            
            // 각 가닥의 속성 초기화
            for (let s = 0; s < strandCount; s++) {
              const offset = p.map(s, 0, strandCount - 1, -2.5, 2.5); // 가닥 간격 약간 증가
              const points = [];
              
              // 각 가닥의 점 생성
              for (let i = 0; i <= segments; i++) {
                let t = i / segments;
                let basePoint = this.mainPoints[i].copy();
                
                // 약간씩 다른 위치 설정 - 더 자연스러운 분포
                let jitterX = p.random(-0.5, 0.5) * (s % 2 === 0 ? 1 : 0.7);
                let jitterY = p.random(-0.7, 0.7) + offset * (1 + p.random(-0.1, 0.1));
                
                points.push(p.createVector(
                  basePoint.x + jitterX,
                  basePoint.y + jitterY
                ));
              }
              
              // 가닥 데이터 저장 - 가닥마다 다른 색상과 속성 부여
              const hueOffset = p.map(s, 0, strandCount - 1, -5, 5);
              
              // 각 가닥의 끊어짐 지점을 랜덤하게 약간 다르게 설정하여 더 자연스럽게
              const breakOffset = p.random(-3, 3);
              
              this.strands.push({
                points: points,
                // 항상 정확히 중앙 부분에서 끊어지도록 설정하되, 약간의 변동 추가
                breakPoint: Math.floor(segments / 2 + breakOffset), // 약간의 변동성 추가
                broken: false,
                breakTime: p.map(s, 0, strandCount - 1, 0.48, 0.52), // 더 좁은 시간 간격으로 조정
                leftEndPos: null,
                rightStartPos: null,
                snapEffect: 0,
                color: p.color(
                  200 - s * 8 + p.random(-3, 3), 
                  30 - s * 2 + hueOffset, 
                  30 - s * 2 - hueOffset, 
                  p.map(s, 0, strandCount - 1, 255, 180)
                ),
                fallingSpeed: 0,
                rotationAngle: 0,
                brokenAt: 0,
                brokenSegmentStart: 0,
                brokenSegmentEnd: 0,
                originalPositions: [],
                thickness: p.map(s, 0, strandCount - 1, 1.5, 0.7) * p.random(0.9, 1.1), // 가닥마다 다른 두께
                // 실의 끊어짐 패턴을 위한 추가 속성
                fibersLength: p.random(1, 4), // 풀린 섬유의 길이 다양성
                fibersCount: Math.floor(p.random(3, 8)), // 풀린 섬유 개수
                fibers: [], // 풀린 섬유 저장 배열
                curveAmount: p.random(0.5, 1.5), // 곡선 강도의 다양성
                curveStrength: 0,
                curveDirection: 0
              });
            }
            
            // 실이 끊어질 때 사용할 속성 추가
            this.breakPoint = Math.floor(segments / 2); // 중앙에서 끊어지도록 고정
            this.snapEffect = 0;
          }

          update(progress) {
            // 각 가닥 업데이트
            for (let s = 0; s < this.strands.length; s++) {
              const strand = this.strands[s];
              
              // 해당 가닥이 끊어질 시간이 됐는지 확인 - 더 좁은 시간 간격으로 조정
              if (progress >= strand.breakTime && !strand.broken) {
                strand.broken = true;
                strand.snapEffect = this.amplitude * (0.7 + p.random(0, 0.3));
                
                // 끊어질 때 각 가닥이 다른 곡선을 그리며 자연스럽게 끊어지도록 설정
                strand.curveStrength = p.random(0.5, 1.5);
                strand.curveDirection = p.random(-1, 1) > 0 ? 1 : -1;
                
                // 끊어진 시점의 진행도 저장
                strand.brokenAt = progress;
                
                // 끊어진 부분만 처리하도록 끊어진 영역 정의 (끊어진 지점 바로 주변만)
                // "23" 형태를 위해 약간 더 넓은 범위 설정
                const breakRange = Math.floor(7 + p.random(0, 2)); // 더 넓은 범위로 설정
                strand.brokenSegmentStart = Math.max(0, strand.breakPoint - breakRange);
                strand.brokenSegmentEnd = Math.min(strand.points.length - 1, strand.breakPoint + breakRange);
                
                // 원래 위치 저장 (나중에 위치 복원용)
                strand.originalPositions = [];
                for (let i = 0; i < strand.points.length; i++) {
                  strand.originalPositions[i] = strand.points[i].copy();
                }
                
                // 풀린 섬유 생성 (끊어진 실 끝에서 나오는 작은 섬유들)
                strand.fibers = [];
                
                // 왼쪽 끝(숫자 2)에서 나오는 섬유들
                for (let i = 0; i < strand.fibersCount; i++) {
                  const base = strand.points[strand.breakPoint].copy();
                  const length = strand.fibersLength * (1 + p.random(-0.3, 0.3));
                  const angle = p.random(-0.8, 0.8); // 위아래로 퍼지는 각도
                  
                  strand.fibers.push({
                    base: base,
                    side: 'left',
                    length: length,
                    angle: angle,
                    curve: p.random(-0.8, 0.8) * strand.curveAmount, // 곡률
                    thickness: p.random(0.3, 0.7) * strand.thickness,
                    controlPoints: [
                      p.createVector(p.random(-3, 0), p.random(-3, 3)),
                      p.createVector(p.random(-3, -1), p.random(-3, 3))
                    ],
                    // 섬유가 점점 사라지게 함
                    fadeOutTime: p.random(2.0, 4.0) // 더 오래 유지
                  });
                }
                
                // 오른쪽 끝(숫자 3)에서 나오는 섬유들
                for (let i = 0; i < strand.fibersCount; i++) {
                  const base = strand.points[strand.breakPoint + 1].copy();
                  const length = strand.fibersLength * (1 + p.random(-0.3, 0.3));
                  const angle = p.random(-0.8, 0.8); // 위아래로 퍼지는 각도
                  
                  strand.fibers.push({
                    base: base,
                    side: 'right',
                    length: length,
                    angle: angle,
                    curve: p.random(-0.8, 0.8) * strand.curveAmount, // 곡률
                    thickness: p.random(0.3, 0.7) * strand.thickness,
                    controlPoints: [
                      p.createVector(p.random(0, 3), p.random(-3, 3)),
                      p.createVector(p.random(1, 3), p.random(-3, 3))
                    ],
                    // 섬유가 점점 사라지게 함
                    fadeOutTime: p.random(2.0, 4.0) // 더 오래 유지
                  });
                }
              }
              
              for (let i = 0; i < strand.points.length; i++) {
                let t = i / this.segments;
                
                // 기본 물결 모양 (아직 끊어지지 않은 가닥)
                if (!strand.broken) {
                  // 기본 물결 효과에 약간의 랜덤성 추가
                  let waveAmount = p.map(progress, 0, strand.breakTime, 1, 1.5);
                  // 가닥마다 약간 다른 주파수로 흔들림
                  let waveFreq = 10 + (s % 3 - 1) * 0.5;
                  let offset = p.sin(t * p.PI * waveFreq + p.frameCount * 0.1 + s) * this.amplitude * 0.3 * waveAmount;
                  
                  // 각 가닥의 기본 위치는 메인 포인트에서 조금씩 어긋남
                  let baseY = this.mainPoints[i].y + p.map(s, 0, this.strands.length - 1, -1, 1);
                  strand.points[i].y = baseY + offset;
                } 
                // 끊어진 가닥 처리
                else {
                  let timeSinceBroken = progress - strand.brokenAt;
                  
                  // 저장된 위치가 없으면 위치 저장 (끊어지는 순간의 위치)
                  if (strand.leftEndPos === null) {
                    strand.leftEndPos = strand.points[strand.breakPoint - 1].copy();
                    strand.rightStartPos = strand.points[strand.breakPoint + 1].copy();
                  }
                  
                  // 부드러운 전환을 위한 이징 함수
                  const easeOutElastic = (t) => {
                    const c4 = (2 * Math.PI) / 3;
                    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
                  };
                  
                  // 끊어진 부분은 실의 중앙에만 국한하고 나머지는 원래 위치 복원
                  if (i >= strand.brokenSegmentStart && i <= strand.brokenSegmentEnd) {
                    // 끊어진 지점과의 거리 계산
                    const distFromBreak = Math.abs(i - strand.breakPoint);
                    const normalizedDist = distFromBreak / (strand.brokenSegmentEnd - strand.brokenSegmentStart);
                    
                    // 끊어진 직후 약간의 반동 효과 - 부드러운 이징 함수 적용
                    if (timeSinceBroken < 0.15) {
                      // 더 부드러운 곡선 느낌의 반동
                      const recoilEase = easeOutElastic(1 - timeSinceBroken * 6.67);
                      const recoil = p.map(distFromBreak, 0, 2, strand.snapEffect, 0) * recoilEase;
                      
                      if (i <= strand.breakPoint) {
                        // 왼쪽은 위로 살짝 휘어짐
                        strand.points[i].y -= recoil * (1 + normalizedDist * 0.5);
                        // 자연스러운 곡선 형태로 휘어짐
                        strand.points[i].x -= recoil * 0.3 * (1 - normalizedDist);
                      } else {
                        // 오른쪽은 아래로 살짝 휘어짐
                        strand.points[i].y += recoil * (1 + normalizedDist * 0.5);
                        // 자연스러운 곡선 형태로 휘어짐
                        strand.points[i].x += recoil * 0.3 * (1 - normalizedDist);
                      }
                    } else {
                      // 끊어진 후 0.15초 이후에는 숫자 23 형태로 빠르게 변형
                      const formationProgress = p.constrain((timeSinceBroken - 0.15) / 0.25, 0, 1);
                      const formationEase = easeOutElastic(formationProgress);
                      
                      // 숫자 2와 3의 형태로 변환
                      if (i <= strand.breakPoint) {
                        // 숫자 2 형태의 포인트가 미리 계산되어 있으면 사용
                        if (strand.originalPositions[i]) {
                          // 원래 위치에서 숫자 2 형태 위치로 부드럽게 전환
                          const curvedOffset = (t) => {
                            return Math.sin(t * Math.PI) * 10;
                          };
                          const curvedX = curvedOffset(normalizedDist, 10);
                          const curvedY = curvedOffset(normalizedDist, 6);
                          strand.points[i].x = p.lerp(
                            strand.originalPositions[i].x,
                            strand.points[strand.breakPoint].x - curvedX,
                            formationEase
                          );
                          strand.points[i].y = p.lerp(
                            strand.originalPositions[i].y,
                            strand.points[strand.breakPoint].y - curvedY,
                            formationEase
                          );
                          
                          // 형태 변환이 완료되면 최종 위치 고정
                          if (formationProgress >= 1) {
                            strand.points[i].x = strand.points[strand.breakPoint].x;
                            strand.points[i].y = strand.points[strand.breakPoint].y;
                          }
                        }
                      } else {
                        // 숫자 3 형태의 포인트가 미리 계산되어 있으면 사용
                        if (strand.originalPositions[i]) {
                          // 원래 위치에서 숫자 3 형태 위치로 부드럽게 전환
                          const curvedX = curvedOffset(normalizedDist, 10);
                          const curvedY = curvedOffset(normalizedDist, 6);
                          strand.points[i].x = p.lerp(
                            strand.originalPositions[i].x,
                            strand.points[strand.breakPoint + 1].x + curvedX,
                            formationEase
                          );
                          strand.points[i].y = p.lerp(
                            strand.originalPositions[i].y,
                            strand.points[strand.breakPoint + 1].y + curvedY,
                            formationEase
                          );
                          
                          // 형태 변환이 완료되면 최종 위치 고정
                          if (formationProgress >= 1) {
                            strand.points[i].x = strand.points[strand.breakPoint + 1].x;
                            strand.points[i].y = strand.points[strand.breakPoint + 1].y;
                          }
                        }
                      }
                    }
                  } else {
                    // 끊어진 부분이 아닌 경우 물결 효과 유지 - 연속성 유지
                    let waveAmount = 0.7;
                    let waveFreq = 8 + (s % 3 - 1) * 0.5;
                    let offset = p.sin(t * p.PI * waveFreq + p.frameCount * 0.05 + s) * this.amplitude * 0.2 * waveAmount;
                    let baseY = this.mainPoints[i].y + p.map(s, 0, this.strands.length - 1, -1, 1);
                    strand.points[i].y = baseY + offset;
                    
                    // 부드러운 연결을 위한 추가 처리
                    if (i === strand.brokenSegmentStart - 1 || i === strand.brokenSegmentEnd + 1) {
                      // 끊어진 부분 경계에 있는 점은 약간만 움직여 부드럽게 연결
                      let blendFactor = 0.2;
                      if (i === strand.brokenSegmentStart - 1) {
                        let nextPoint = strand.points[i + 1];
                        strand.points[i].y = p.lerp(strand.points[i].y, nextPoint.y, blendFactor);
                        strand.points[i].x = p.lerp(strand.points[i].x, nextPoint.x, blendFactor * 0.5);
                      } else if (i === strand.brokenSegmentEnd + 1) {
                        let prevPoint = strand.points[i - 1];
                        strand.points[i].y = p.lerp(strand.points[i].y, prevPoint.y, blendFactor);
                        strand.points[i].x = p.lerp(strand.points[i].x, prevPoint.x, blendFactor * 0.5);
                      }
                    }
                  }
                }
              }
              
              // 풀린 섬유 업데이트
              if (strand.broken && strand.fibers.length > 0) {
                const timeSinceBroken = progress - strand.brokenAt;
                
                // 섬유가 일정 시간 후 사라지도록 처리 (더 오래 유지)
                for (let f = strand.fibers.length - 1; f >= 0; f--) {
                  const fiber = strand.fibers[f];
                  
                  // 섬유의 기준점 업데이트 (최종 형태에 맞추어 위치 조정)
                  if (fiber.side === 'left') {
                    // 숫자 2의 끝 부분에 맞춤
                    if (strand.originalPositions[strand.breakPoint]) {
                      fiber.base.copy(strand.originalPositions[strand.breakPoint]);
                    } else {
                      fiber.base.copy(strand.points[strand.breakPoint]);
                    }
                  } else {
                    // 숫자 3의 시작 부분에 맞춤
                    if (strand.originalPositions[strand.breakPoint + 1]) {
                      fiber.base.copy(strand.originalPositions[strand.breakPoint + 1]);
                    } else {
                      fiber.base.copy(strand.points[strand.breakPoint + 1]);
                    }
                  }
                  
                  // 시간이 지남에 따라 섬유가 약간 더 길어지고 휘어짐
                  const growthTime = 0.3; // 0.3초 동안 성장
                  const growthFactor = p.constrain(timeSinceBroken / growthTime, 0, 1);
                  fiber.currentLength = fiber.length * growthFactor;
                  fiber.currentCurve = fiber.curve * (1 + growthFactor * 0.5);
                  
                  // 일정 시간 후 섬유 페이드 아웃 (더 오래 유지)
                  fiber.opacity = 1;
                  if (timeSinceBroken > fiber.fadeOutTime) {
                    fiber.opacity = p.constrain(1 - (timeSinceBroken - fiber.fadeOutTime) / 1.0, 0, 1); // 더 천천히 페이드 아웃
                    
                    // 섬유가 완전히 투명해지면 제거
                    if (fiber.opacity <= 0) {
                      strand.fibers.splice(f, 1);
                    }
                  }
                }
              }
            }
          }

          display() {
            // 각 가닥 그리기 - 뒤에서부터 그려서 겹침 효과
            for (let s = this.strands.length - 1; s >= 0; s--) {
              const strand = this.strands[s];
              
              // 실이 끊어지지 않았거나, 끊어진 후 처리
              if (!strand.broken) {
                p.stroke(strand.color);
                // 선 두께 설정
                p.strokeWeight(strand.thickness);
                
                // 끊어지지 않은 실은 그대로 그리기
                p.beginShape();
                for (let pt of strand.points) {
                  p.vertex(pt.x, pt.y);
                }
                p.endShape();
              } else {
                // 끊어진 실이 자연스럽게 숫자 형태로 변형
                // 첫 번째 가닥(s==0)은 숫자를 그리고, 나머지 가닥은 숫자 주변 부분만 그리기
                
                // 모든 가닥에 대해 왼쪽 부분(시작부터 숫자 2 시작 전까지) 그리기
                p.stroke(strand.color);
                p.strokeWeight(strand.thickness);
                
                // 왼쪽 부분 (숫자 2 형태로 연결되기 전까지)
                p.beginShape();
                p.noFill();
                
                // 모든 가닥은 시작점부터 끊어진 지점 바로 전까지만 그리기
                // 숫자 가독성을 위해 숫자 부근에서 점점 가닥이 사라지게 함
                const fadeStart = strand.brokenSegmentStart - 10; // 끊어진 지점 10개 포인트 전부터 페이드 시작
                
                for (let i = 0; i <= strand.brokenSegmentStart; i++) {
                  // 페이드 시작점 이후에는 s가 0이 아니면 점점 투명해지게 함
                  if (i >= fadeStart && s > 0) {
                    const fadeRatio = (i - fadeStart) / (strand.brokenSegmentStart - fadeStart);
                    const alpha = 255 * (1 - fadeRatio * 0.9); // 완전히 투명해지지는 않게 10%는 유지
                    p.stroke(strand.color.levels[0], strand.color.levels[1], strand.color.levels[2], alpha);
                  }
                  
                  if (i === 0) {
                    p.vertex(strand.points[i].x, strand.points[i].y);
          } else {
                    const prev = strand.points[i-1];
                    const curr = strand.points[i];
                    const midX = (prev.x + curr.x) * 0.5;
                    const midY = (prev.y + curr.y) * 0.5;
                    
                    p.quadraticVertex(prev.x, prev.y, midX, midY);
                  }
                }
                p.endShape();
                
                // 숫자 2와 3은 첫 번째 가닥(s==0)일 때만 그림 (가독성 향상)
                if (s === 0) {
                  const scale = this.scale;
                  
                  // 숫자 2 부분 - 굵고 선명하게
                  p.stroke(220, 20, 20);
                  p.strokeWeight(4.0); // 더 굵게 설정하여 가독성 향상
                  
                  // 숫자 2 시작점 (실의 끊어진 지점에서 부드럽게 연결)
                  const startPoint2X = strand.points[strand.brokenSegmentStart].x;
                  const startPoint2Y = strand.points[strand.brokenSegmentStart].y;
                  
                  p.beginShape();
                  
                  // 숫자 2와 원래 실의 연결부분
                  p.vertex(startPoint2X, startPoint2Y);
                  
                  // 2의 상단 곡선 (실에서 자연스럽게 이어지도록)
                  p.bezierVertex(
                    startPoint2X - scale * 0.1, startPoint2Y - scale * 0.2,
                    startPoint2X - scale * 0.3, startPoint2Y - scale * 0.4,
                    strand.points[strand.breakPoint].x - scale * 0.7, strand.points[strand.breakPoint].y - scale * 0.7
                  );
                  
                  p.bezierVertex(
                    strand.points[strand.breakPoint].x - scale * 0.5, strand.points[strand.breakPoint].y - scale * 0.9,
                    strand.points[strand.breakPoint].x - scale * 0.1, strand.points[strand.breakPoint].y - scale * 0.8,
                    strand.points[strand.breakPoint].x, strand.points[strand.breakPoint].y - scale * 0.5
                  );
                  
                  // 2의 중간 대각선
                  p.bezierVertex(
                    strand.points[strand.breakPoint].x, strand.points[strand.breakPoint].y - scale * 0.2,
                    strand.points[strand.breakPoint].x - scale * 0.3, strand.points[strand.breakPoint].y + scale * 0.2,
                    strand.points[strand.breakPoint].x - scale * 0.5, strand.points[strand.breakPoint].y + scale * 0.5
                  );
                  
                  // 2의 하단 가로선
                  p.vertex(strand.points[strand.breakPoint].x - scale * 0.9, strand.points[strand.breakPoint].y + scale * 0.5);
                  
                  p.endShape();
                  
                  // 오른쪽 부분 (숫자 3 형태로)
                  // 숫자 3 부분 (끊어진 실의 다른 부분에서 이어지도록)
                  const startPoint3X = strand.points[strand.brokenSegmentEnd].x;
                  const startPoint3Y = strand.points[strand.brokenSegmentEnd].y;
                  
                  p.stroke(220, 20, 20);
                  p.strokeWeight(4.0); // 더 굵게 설정하여 가독성 향상
                  
                  // 3의 상단 곡선
                  p.beginShape();
                  p.vertex(strand.points[strand.breakPoint].x + scale * 0.2, strand.points[strand.breakPoint].y - scale * 0.9);
                  p.bezierVertex(
                    strand.points[strand.breakPoint].x + scale * 0.6, strand.points[strand.breakPoint].y - scale * 0.9,
                    strand.points[strand.breakPoint].x + scale * 0.9, strand.points[strand.breakPoint].y - scale * 0.7,
                    strand.points[strand.breakPoint].x + scale * 0.9, strand.points[strand.breakPoint].y - scale * 0.4
                  );
                  p.bezierVertex(
                    strand.points[strand.breakPoint].x + scale * 0.9, strand.points[strand.breakPoint].y - scale * 0.1,
                    strand.points[strand.breakPoint].x + scale * 0.6, strand.points[strand.breakPoint].y - scale * 0.0,
                    strand.points[strand.breakPoint].x + scale * 0.3, strand.points[strand.breakPoint].y - scale * 0.0
                  );
                  p.endShape();
                  
                  // 3의 하단 곡선
                  p.beginShape();
                  p.vertex(strand.points[strand.breakPoint].x + scale * 0.3, strand.points[strand.breakPoint].y - scale * 0.0);
                  p.bezierVertex(
                    strand.points[strand.breakPoint].x + scale * 0.6, strand.points[strand.breakPoint].y - scale * 0.0,
                    strand.points[strand.breakPoint].x + scale * 0.9, strand.points[strand.breakPoint].y + scale * 0.1,
                    strand.points[strand.breakPoint].x + scale * 0.9, strand.points[strand.breakPoint].y + scale * 0.4
                  );
                  p.bezierVertex(
                    strand.points[strand.breakPoint].x + scale * 0.9, strand.points[strand.breakPoint].y + scale * 0.7,
                    strand.points[strand.breakPoint].x + scale * 0.6, strand.points[strand.breakPoint].y + scale * 0.9,
                    // 3의 끝점을 오른쪽 실의 시작점과 연결
                    startPoint3X, startPoint3Y
                  );
                  p.endShape();
                  
                  // 풀린 섬유 효과 - 첫 번째 가닥에만 표시
                  for (let f = 0; f < strand.fibers.length; f++) {
                    const fiber = strand.fibers[f];
                    if (fiber.opacity > 0) {
                      p.push();
                      // 투명도를 조절하여 점점 사라지는 효과
                      p.stroke(220, 20, 20, 255 * fiber.opacity);
                      p.strokeWeight(fiber.thickness * fiber.opacity * 0.7); // 두께도 점점 가늘어짐
                      
                      // 베지어 곡선으로 섬유 그리기
                      p.beginShape();
                      p.vertex(fiber.base.x, fiber.base.y);
                      
                      const direction = fiber.side === 'left' ? -1 : 1;
                      const endX = fiber.base.x + direction * fiber.currentLength * p.cos(fiber.angle);
                      const endY = fiber.base.y + fiber.currentLength * p.sin(fiber.angle);
                      
                      const cp1x = fiber.base.x + direction * fiber.currentLength * 0.5 + fiber.controlPoints[0].x;
                      const cp1y = fiber.base.y + fiber.currentCurve * 2 + fiber.controlPoints[0].y;
                      
                      // 부드러운 곡선 형태로 그리기
                      p.bezierVertex(
                        cp1x, cp1y,
                        endX + fiber.controlPoints[1].x, endY + fiber.controlPoints[1].y,
                        endX, endY
                      );
                      p.endShape();
                      p.pop();
                    }
                  }
                }
                
                // 모든 가닥에 대해 오른쪽 부분(숫자 3 이후부터 끝까지) 그리기
                p.stroke(strand.color);
                p.strokeWeight(strand.thickness);
                p.beginShape();
              p.noFill();
                
                // 모든 가닥은 숫자 3 이후부터 끝까지 그리기
                // 숫자 가독성을 위해 숫자 부근에서 점점 가닥이 나타나게 함
                const fadeEnd = strand.brokenSegmentEnd + 10; // 끊어진 지점 10개 포인트 후까지 페이드 
                
                for (let i = strand.brokenSegmentEnd; i < strand.points.length; i++) {
                  // 페이드 종료점 이전에는 s가 0이 아니면 점점 불투명해지게 함
                  if (i <= fadeEnd && s > 0) {
                    const fadeRatio = (fadeEnd - i) / (fadeEnd - strand.brokenSegmentEnd);
                    const alpha = 255 * (1 - fadeRatio * 0.9); // 완전히 투명해지지는 않게 10%는 유지
                    p.stroke(strand.color.levels[0], strand.color.levels[1], strand.color.levels[2], alpha);
                  }
                  
                  if (i === strand.brokenSegmentEnd) {
                    p.vertex(strand.points[i].x, strand.points[i].y);
                  } else {
                    const prev = strand.points[i-1];
                    const curr = strand.points[i];
                    const midX = (prev.x + curr.x) * 0.5;
                    const midY = (prev.y + curr.y) * 0.5;
                    
                    p.quadraticVertex(prev.x, prev.y, midX, midY);
                  }
                }
                p.endShape();
              }
            }
          }
          
          // 특정 지점 클릭 확인
          checkClick(mouseX, mouseY) {
            // 클릭 지점과 가장 가까운 점 찾기
            let closestPoint = null;
            let closestDist = Infinity;
            
            // 모든 가닥의 모든 점을 확인
            for (let s = 0; s < this.strands.length; s++) {
              for (let i = 0; i < this.strands[s].points.length; i++) {
                const pt = this.strands[s].points[i];
                const d = p.dist(mouseX, mouseY, pt.x, pt.y);
                
                if (d < closestDist) {
                  closestDist = d;
                  closestPoint = pt;
                }
              }
            }
            
            // 근접 허용 거리
            const threshold = 30;
            
            if (closestDist < threshold) {
              return closestPoint;
            }
            
            return null;
          }
        }
        
        // setup 함수: 초기 설정
        p.setup = function() {
          console.log('Setup started');
          setStatus('Click on the thread to zoom in and break it');
          
          // 화면 크기에 맞춰 캔버스 생성
          const canvas = p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
          if (canvasRef.current) {
            canvas.parent(canvasRef.current);
          } else {
            console.error('canvasRef.current is null!');
            return;
          }
          
          p.noFill();
          
          // 선 두께 조정
          p.strokeWeight(1.5);
          
          // 실 생성 - 화면보다 길게 생성하여 화면 밖으로 나가게 함
          const threadLength = Math.max(p.windowWidth, p.windowHeight) * 1.5; // 화면 크기보다 1.5배 크게
          const segments = Math.floor(Math.max(150, Math.min(threadLength / 3, 300))); // 세그먼트 수 증가
          thread = new Thread(p.createVector(-threadLength/2, 0), p.createVector(threadLength/2, 0), segments);
        };
        
        // draw 함수: 매 프레임마다 실행
        p.draw = function() {
          p.background(255);
          
          // 줌 효과 적용
          handleZoom();
          
          if (isBreaking && breakProgress < 1) {
            // 빠른 끊어짐 효과를 위해 증가량 조정 - 더 빠르게 진행
            if (breakProgress < 0.5) {
              breakProgress += 0.01; // 0.005에서 0.01로 증가하여 끊어지기 전에도 빠르게
            } else {
              breakProgress += 0.02; // 0.01에서 0.02로 증가하여 더 빠르게
            }
            
            // 1을 넘지 않도록
            breakProgress = Math.min(breakProgress, 1);
          }

          thread.update(breakProgress);
          thread.display();
          // 실이 완전히 끊어진 후 숫자 23을 HTML로 띄우기 위한 신호
          if (breakProgress >= 1 && !window.__number23shown) {
            window.__number23shown = true;
            window.dispatchEvent(new Event('showNumber23'));
          }
        };
        
        // 줌 효과 처리 함수
        function handleZoom() {
          // 현재 줌 레벨을 목표 줌 레벨로 부드럽게 이동 - 더 빠른 속도로 줌인
          if (zoomActive) {
            zoomLevel = p.lerp(zoomLevel, targetZoomLevel, 0.15); // 0.05에서 0.15로 증가하여 더 빠르게 줌인
            
            // 줌인이 시작되면 바로 끊어짐 효과 시작 (목표에 거의 도달하기 전에)
            if (zoomLevel > 2 && !isBreaking) {
              isBreaking = true;
              // 끊어짐 진행도 약간 진행시켜 시작
              breakProgress = 0.1;
            }
          } else {
            // 줌 해제 시 원래 크기로 빠르게 돌아감
            zoomLevel = p.lerp(zoomLevel, 1, 0.1); // 0.05에서 0.1로 증가
          }
          
          // 줌 적용
          p.scale(zoomLevel);
          
          // 항상 실의 중앙이 화면 중앙에 오도록 설정
          if (zoomActive) {
            p.translate(0, 0); // 화면 중앙으로 이동 (WEBGL 모드에서 원점이 중앙)
          }
        }
        
        // 마우스 클릭 이벤트
        p.mousePressed = function() {
          if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
            // 화면 좌표계를 WEBGL 좌표계로 변환 (원점이 중앙)
            const mouseXCentered = p.mouseX - p.width/2;
            const mouseYCentered = p.mouseY - p.height/2;
            
            // 줌 상태가 아닐 때만 줌 활성화
            if (!zoomActive) {
              // 클릭한 지점이 실과 충분히 가까운지 확인
              const clickedPoint = thread.checkClick(mouseXCentered, mouseYCentered);
              
              if (clickedPoint) {
                zoomActive = true;
                zoomPoint = null; // 특정 지점이 아닌 실의 중앙을 사용
                targetZoomLevel = 5; // 목표 줌 레벨
                
                // 줌 중심점을 항상 (0, 0)으로 설정 (화면 중앙)
                zoomCenterX = 0;
                zoomCenterY = 0;
                
                setStatus('Breaking the thread...');
              }
            } else {
              // 이미 줌 상태면 줌 해제
              zoomActive = false;
              setStatus('Click on the thread to zoom in and break it');
            }
            
            return false; // 이벤트 전파 방지
          }
        };
        
        // 창 크기 변경 대응
        p.windowResized = function() {
          p.resizeCanvas(p.windowWidth, p.windowHeight);
          
          // 실 재생성 (줌 상태와 끊어짐 상태 유지)
          const oldBreakProgress = breakProgress;
          const wasBreaking = isBreaking;
          const wasZooming = zoomActive;
          
          // 실 길이를 화면보다 길게 설정
          const threadLength = Math.max(p.windowWidth, p.windowHeight) * 1.5;
          const segments = Math.floor(Math.max(150, Math.min(threadLength / 3, 300)));
          
          thread = new Thread(p.createVector(-threadLength/2, 0), p.createVector(threadLength/2, 0), segments);
          
          // 상태 복원
          if (wasBreaking) {
            isBreaking = true;
            breakProgress = oldBreakProgress;
          }
          
          if (wasZooming) {
            zoomActive = true;
          }
        };
        
      }, canvasRef.current);
      
      console.log('Thread animation created successfully');
      
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
      window.__number23shown = false;
    };
  }, []);

  return (
    <VisualisationContainer>
      <Head>
        <title>Thread Animation</title>
        <meta name="description" content="Interactive thread breaking animation with p5.js" />
      </Head>

      <CanvasWrapper ref={canvasRef}>
        {status && <StatusMessage>{status}</StatusMessage>}
        {showNumber && <Number23>23</Number23>}
      </CanvasWrapper>

      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.min.js"
        strategy="beforeInteractive"
        onLoad={() => {
          console.log("p5.js loaded");
          if (canvasRef.current) {
            try {
              initSketch();
              console.log("Thread animation initialized successfully");
            } catch (error) {
              console.error("Error initializing thread animation:", error);
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
