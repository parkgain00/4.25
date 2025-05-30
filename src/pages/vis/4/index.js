import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function Vis4() {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState('cover'); // 'cover' → 'straight' → 'tangle'
  const fadeAlphaRef = useRef(255);
  const lastModeRef = useRef('cover');
  let bgImg;

  useEffect(() => {
    let p5Instance;
    let coverProgress = 0; // 0~1
    let coverDoneFrame = 0;
    let handImg, maskedHand, maskedHandImg, ellipseGradient, ellipseGradientImg;
    let fadeSpeed = 6; // alpha 감소 속도

    function sketch(p) {
      let path = [];
      let totalPoints = 1400;
      let tangledStart = 200; // 시작점을 더 앞으로
      let tangledEnd = 1200; // 끝점을 더 뒤로
      let baseStep = 6;
      let drawnPoints = 0;
      let w = window.innerWidth;
      let h = window.innerHeight;
      let centerX = w / 2;
      let centerY = h / 2;
      let angle = p.random(p.TWO_PI);
      let r = Math.min(w, h) / 4 + p.random(-30, 30);
      let x = centerX + Math.cos(angle) * r;
      let y = centerY + Math.sin(angle) * r;
      let prevAngle = angle;
      let straightPath = [];
      let tanglePath = [];
      let straightDrawn = 0;
      let tangleDrawn = 0;
      let currentMode = mode;
      let coverFrame = 0;
      let coverDuration = 60; // 1초(60프레임) 동안 타원 이동
      let revealNumber = false; // 숫자 20 표시 여부
      let numberAlpha = 0; // 숫자 20의 투명도
      const cm3 = 113; // 3cm in px
      const ellipseW = 220;
      const ellipseH = h * 0.6;
      const margin = 60; // 화면 경계에서 떨어진 여백

      p.preload = function() {
        handImg = p.loadImage('/hand.png');
        // 배경 이미지 로드 제거
      };

      p.setup = function () {
        p.createCanvas(w, h);
        centerX = w / 2;
        centerY = h / 2;
        // 1. 손 이미지를 타원형으로 마스킹
        maskedHand = p.createGraphics(ellipseW, ellipseH);
        maskedHand.ellipse(ellipseW/2, ellipseH/2, ellipseW, ellipseH);
        maskedHand.drawingContext.globalCompositeOperation = 'source-in';
        const scale = 1.2;
        const offsetX = -(ellipseW * scale - ellipseW) / 2;
        const offsetY = -(ellipseH * scale - ellipseH) / 2;
        maskedHand.image(handImg, offsetX, offsetY, ellipseW * scale, ellipseH * scale);
        maskedHand.drawingContext.globalCompositeOperation = 'source-over';
        maskedHandImg = maskedHand.get(); // p5.Image로 변환

        // 2. 타원형 그라데이션 마스크 생성
        ellipseGradient = p.createGraphics(ellipseW, ellipseH);
        let grad = ellipseGradient.drawingContext.createLinearGradient(0, 0, 0, ellipseH);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(0.2, 'rgba(255,255,255,1)');
        grad.addColorStop(0.8, 'rgba(255,255,255,1)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ellipseGradient.drawingContext.fillStyle = grad;
        ellipseGradient.drawingContext.beginPath();
        ellipseGradient.drawingContext.ellipse(
          ellipseW / 2, ellipseH / 2, ellipseW / 2, ellipseH / 2, 0, 0, Math.PI * 2
        );
        ellipseGradient.drawingContext.fill();
        ellipseGradientImg = ellipseGradient.get(); // p5.Image로 변환

        // 3. 마스킹 적용
        maskedHandImg.mask(ellipseGradientImg);
        
        // 직선 경로 생성
        straightPath = [];
        let yLine = centerY;
        for (let i = 0; i < totalPoints; i++) {
          let t = i / (totalPoints - 1);
          let xLine = margin + t * (w - margin * 2);
          straightPath.push({ x: xLine, y: yLine });
        }
        straightDrawn = 0;
        tangleDrawn = 0;
        tanglePath = [];
        coverFrame = 0;
        coverProgress = 0;
        coverDoneFrame = 0;
        revealNumber = false;
        numberAlpha = 0;
        if (currentMode === 'tangle') {
          generateTanglePath();
        }
      };

      function generateTanglePath() {
        tanglePath = [];
        // 시작점을 화면 중앙으로 설정
        let angle = 0;
        let r = Math.min(w, h) / 3;
        let x = centerX; // 중앙에서 시작
        let y = centerY;
        let prevAngle = angle;
        tanglePath.push({ x, y });
        
        // 중앙 부분의 밀도를 높이기 위한 추가 점들
        let extraPoints = [];
        
        for (let i = 1; i < totalPoints; i++) {
          let step, da, dr;
          if (i < tangledStart) {
            // 시작 부분: 중앙에서 왼쪽으로 이동
            let progress = i / tangledStart;
            step = baseStep * (1 + progress);
            da = Math.sin(i * 0.1) * 0.2;
            dr = Math.cos(i * 0.1) * 2;
            x -= step; // 왼쪽으로 이동
          } else if (i < tangledEnd) {
            // 중간 부분: 격렬한 엉킴
            let midPoint = (tangledStart + tangledEnd) / 2;
            let distFromMid = Math.abs(i - midPoint);
            let intensity = 1 - (distFromMid / (tangledEnd - tangledStart) * 2);
            intensity = Math.pow(intensity, 0.5);
            
            // 중앙에서 더 격렬한 엉킴 (고정된 패턴)
            step = baseStep * 0.1;
            da = (Math.sin(i * 0.2) * 40 + Math.cos(i * 0.15) * 20) * intensity; // 각도 변화 증가
            dr = (Math.sin(i * 0.3) * 800 + Math.cos(i * 0.25) * 400) * intensity; // 거리 변화 증가
            
            // 중앙 부분에서 추가 점 생성 (고정된 패턴)
            if (distFromMid < (tangledEnd - tangledStart) * 0.8) {
              for (let j = 0; j < 30; j++) { // 더 많은 추가 점
                let extraAngle = prevAngle + Math.sin(i * 0.1 + j) * Math.PI;
                let extraR = r + Math.cos(i * 0.1 + j) * 800; // 범위 확장
                let extraX = x + Math.cos(extraAngle) * step * 0.1;
                let extraY = y + Math.sin(extraAngle) * step * 0.1;
                // margin 적용
                if (extraX > margin && extraX < w - margin && extraY > margin && extraY < h - margin) {
                  extraPoints.push({ x: extraX, y: extraY });
                }
              }
            }
          } else {
            // 끝 부분: 중앙에서 오른쪽으로 이동
            let progress = (i - tangledEnd) / (totalPoints - tangledEnd);
            step = baseStep * (1 + progress);
            da = Math.sin(i * 0.1 + 100) * 0.2;
            dr = Math.cos(i * 0.1 + 100) * 2;
            x += step; // 오른쪽으로 이동
          }

          // 경계 근처에서 각도를 화면 중심 쪽으로 부드럽게 틀어줌
          let towardCenter = Math.atan2(centerY - y, centerX - x);
          let distLeft = x - margin;
          let distRight = w - margin - x;
          let distTop = y - margin;
          let distBottom = h - margin - y;
          let edgeFactor = 0;
          if (distLeft < 0 || distRight < 0 || distTop < 0 || distBottom < 0) {
            edgeFactor = 0.5;
          } else {
            edgeFactor = Math.max(
              0,
              1 - Math.min(distLeft, distRight, distTop, distBottom) / margin
            ) * 0.25;
          }
          if (edgeFactor > 0) {
            let angleDiff = p5AngleDiff(prevAngle, towardCenter);
            prevAngle += angleDiff * edgeFactor;
          }

          prevAngle += da;
          r += dr * 0.05;
          r = p.constrain(r, Math.min(w, h) / 8, Math.min(w, h) / 1.2); // 반지름 범위 확장
          x += Math.cos(prevAngle) * step;
          y += Math.sin(prevAngle) * step;
          // margin 적용
          x = p.constrain(x, margin, w - margin);
          y = p.constrain(y, margin, h - margin);
          tanglePath.push({ x, y });
        }
        
        // 추가 점들을 메인 경로에 삽입
        let midIdx = Math.floor(tanglePath.length / 2);
        tanglePath.splice(midIdx, 0, ...extraPoints);
      }

      function p5AngleDiff(a, b) {
        let diff = b - a;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        return diff;
      }

      p.draw = function () {
        p.background(255);
        p.stroke(200, 0, 0);
        p.strokeWeight(1.5);
        p.noFill();

        // 타원 위치 계산 (항상 필요)
        const leftTargetX = 113 + ellipseW / 2;
        const rightTargetX = w - 113 - ellipseW / 2;
        const yMid = h / 2;
        let leftX = leftTargetX;
        let rightX = rightTargetX;
        let coverProgressNow = coverProgress;
        if (currentMode === 'cover') {
          coverFrame++;
          coverProgress = Math.min(1, coverFrame / coverDuration);
          coverProgressNow = coverProgress;
          leftX = p.lerp(0 - ellipseW / 2, leftTargetX, coverProgress);
          rightX = p.lerp(w + ellipseW / 2, rightTargetX, coverProgress);
          // 타원형이 멈춘 후 0.3초(18프레임) 대기, 그 뒤에 실 애니메이션 시작
          if (coverProgress === 1) {
            coverDoneFrame++;
            if (coverDoneFrame > 18) {
              setMode('straight');
            }
          }
        }
        // 타원 alpha 관리
        if (lastModeRef.current !== mode && mode === 'tangle') {
          fadeAlphaRef.current = 255;
        }
        lastModeRef.current = mode;
        if (mode === 'tangle' && fadeAlphaRef.current > 0) {
          fadeAlphaRef.current = Math.max(0, fadeAlphaRef.current - fadeSpeed);
        }
        // 타원 그리기 (항상)
        p.push();
        if (maskedHandImg) {
          p.tint(255, fadeAlphaRef.current);
          p.image(maskedHandImg, leftX - ellipseW/2, yMid - ellipseH/2);
          p.push();
          p.translate(rightX, yMid);
          p.scale(-1, 1);
          p.image(maskedHandImg, -ellipseW/2, -ellipseH/2);
          p.pop();
          p.noTint();
        }
        p.pop();

        // 빨간 실: cover 모드에서는 타원 아래쪽 곡선을 따라 중앙까지, 그 외에는 전체
        if (currentMode === 'cover') {
          let yLine = yMid;
          // 타원 아래쪽 곡선(π~2π) 따라가기
          let leftCurvePoints = [];
          let rightCurvePoints = [];
          let curveSteps = Math.floor(totalPoints / 2 * 0.6); // 곡선 구간 비율
          let straightSteps = Math.floor(totalPoints / 2 * 0.4); // 직선 구간 비율
          // 왼쪽 타원 아래쪽 곡선 (π~2π)
          for (let i = 0; i < curveSteps; i++) {
            let t = i / (curveSteps - 1); // 0~1
            let theta = Math.PI + t * Math.PI; // π~2π
            let x = leftX + (ellipseW / 2) * Math.cos(theta);
            let y = yMid + (ellipseH / 2) * Math.sin(theta);
            leftCurvePoints.push({ x, y });
          }
          // 왼쪽 타원에서 중앙까지 직선
          let leftEndX = w / 2;
          let leftEndY = yMid + (ellipseH / 2);
          for (let i = 1; i <= straightSteps; i++) {
            let t = i / straightSteps;
            let x = p.lerp(leftCurvePoints[leftCurvePoints.length - 1].x, leftEndX, t);
            let y = p.lerp(leftCurvePoints[leftCurvePoints.length - 1].y, leftEndY, t);
            leftCurvePoints.push({ x, y });
          }
          // 오른쪽 타원 아래쪽 곡선 (0~π)지금
          for (let i = 0; i < curveSteps; i++) {
            let t = i / (curveSteps - 1); // 0~1
            let theta = t * Math.PI; // 0~π
            let x = rightX + (ellipseW / 2) * Math.cos(theta);
            let y = yMid + (ellipseH / 2) * Math.sin(theta);
            rightCurvePoints.push({ x, y });
          }
          // 오른쪽 타원에서 중앙까지 직선
          let rightEndX = w / 2;
          let rightEndY = yMid + (ellipseH / 2);
          for (let i = 1; i <= straightSteps; i++) {
            let t = i / straightSteps;
            let x = p.lerp(rightCurvePoints[rightCurvePoints.length - 1].x, rightEndX, t);
            let y = p.lerp(rightCurvePoints[rightCurvePoints.length - 1].y, rightEndY, t);
            rightCurvePoints.push({ x, y });
          }
          // 진행률에 따라 그리기
          let progress = coverProgressNow;
          let leftDrawCount = Math.floor(leftCurvePoints.length * progress);
          let rightDrawCount = Math.floor(rightCurvePoints.length * progress);
          // 왼쪽 실
          p.beginShape();
          for (let i = 0; i < leftDrawCount; i++) {
            p.vertex(leftCurvePoints[i].x, leftCurvePoints[i].y);
          }
          p.endShape();
          // 오른쪽 실
          p.beginShape();
          for (let i = 0; i < rightDrawCount; i++) {
            p.vertex(rightCurvePoints[i].x, rightCurvePoints[i].y);
          }
          p.endShape();
        } else if (currentMode === 'straight') {
          // 빨간 실(직선 + 마우스 반구 변형)
          let yLine = yMid;
          // 실 경로 생성
          let linePoints = [];
          for (let i = 0; i < totalPoints; i++) {
            let t = i / (totalPoints - 1);
            let xLine = 113 + ellipseW / 2 + t * (w - 2 * (113 + ellipseW / 2));
            linePoints.push({ x: xLine, y: yLine });
          }
          // 마우스와 가장 가까운 실 점 찾기
          let hoverIdx = -1;
          let minDist = 99999;
          for (let i = 0; i < linePoints.length; i++) {
            let d = p.dist(p.mouseX, p.mouseY, linePoints[i].x, linePoints[i].y);
            if (d < minDist && d < 30) {
              minDist = d;
              hoverIdx = i;
            }
          }
          // 반구 곡선 파라미터
          const N = 45;
          const A = 40;
          const P = 2.2;
          p.beginShape();
          for (let i = 0; i < linePoints.length; i++) {
            let pt = { ...linePoints[i] };
            if (hoverIdx !== -1 && Math.abs(i - hoverIdx) <= N) {
              let t = (i - hoverIdx) / N;
              if (Math.abs(t) < 1) {
                let smooth = Math.pow(1 - Math.abs(t), P);
                pt.y = pt.y - A * smooth * Math.sqrt(1 - t * t);
              }
            }
            p.curveVertex(pt.x, pt.y);
          }
          p.endShape();

          // 안내 문구: 실의 중앙 위에 그라데이션과 함께 서서히 나타나고 명조체로 표시
          if (typeof p.fadeFrame === 'undefined') p.fadeFrame = 0;
          p.fadeFrame++;
          let alpha;
          if (p.fadeFrame < 40) {
            alpha = Math.min(255, Math.floor((p.fadeFrame / 40) * 255));
          } else {
            alpha = 180 + 75 * Math.sin((p.frameCount - 40) / 30 * Math.PI);
          }
          alpha = Math.max(0, Math.min(255, alpha));

          p.push();
          let ctx = p.drawingContext;
          let grad = ctx.createLinearGradient(
            p.width / 2 - 100, yLine - 60,
            p.width / 2 + 100, yLine - 20
          );
          grad.addColorStop(0, `rgba(200,0,0,${alpha / 255})`);
          grad.addColorStop(1, `rgba(255,120,120,${alpha / 255})`);
          ctx.save();
          ctx.font = '700 28px Nanum Myeongjo, serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillStyle = grad;
          ctx.fillText('선을 클릭하세요', p.width / 2, yLine - 40);
          ctx.restore();
          p.pop();
        } else if (currentMode === 'tangle') {
          // 엉킴 애니메이션
          tangleDrawn = Math.min(tangleDrawn + 7, tanglePath.length);
          
          // 실 그리기
          p.beginShape();
          for (let i = 0; i < tangleDrawn; i++) {
            p.curveVertex(tanglePath[i].x, tanglePath[i].y);
          }
          p.endShape();

          // 실이 모두 그려진 후 숫자 20 표시
          if (tangleDrawn >= tanglePath.length) {
            revealNumber = true;
          }

          // 숫자 20 표시
          if (revealNumber) {
            numberAlpha = Math.min(255, numberAlpha + 5);
            p.push();
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(120);
            p.fill(200, 0, 0, numberAlpha);
            p.noStroke();
            p.text('20', centerX, centerY);
            p.pop();
          }
        }
      };

      p.mousePressed = function () {
        if (currentMode === 'straight' && straightDrawn >= straightPath.length) {
          currentMode = 'tangle';
          generateTanglePath();
          revealNumber = false;
          numberAlpha = 0;
        }
      };

      p.windowResized = function () {
        w = window.innerWidth;
        h = window.innerHeight;
        p.resizeCanvas(w, h);
        p.setup();
      };
    }

    if (window.p5) {
      p5Instance = new window.p5(sketch, canvasRef.current);
    }

    return () => {
      if (p5Instance) {
        p5Instance.remove();
      }
    };
  }, [mode]);

  return (
    <>
      <Head>
        <title>Red Thread Tangle</title>
        <link href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap" rel="stylesheet" />
      </Head>
      <div ref={canvasRef} onClick={() => setMode('tangle')}></div>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.min.js" strategy="beforeInteractive" />
      <style jsx global>{`
        body {
          font-family: 'Gowun Batang', serif;
        }
      `}</style>
    </>
  );
}
