// p5 스케치가 이미 실행 중인 경우에 대한 체크
if (window.myP5Instance) {
  window.myP5Instance.remove();
}

// p5 인스턴스 생성
window.myP5Instance = new p5(function(p) {
  let canvas;
  let points = []; // 실의 이전 위치를 저장할 배열
  const numPoints = 80; // 추적할 점의 수 대폭 증가
  let autoMove = true; // 자동 움직임 여부
  let autoX, autoY; // 자동 움직임 위치
  let noiseOffsetX = 0;
  let noiseOffsetY = 1000;
  // 움직임 부드러움을 위한 추가 변수
  let lastMouseX, lastMouseY;
  let easing = 0.3; // easing 값 증가 (더 빠른 반응)
  const lineThickness = 2.5; // 고정된 선 두께
  let mouseOutOfCanvas = false;
  let framesSinceMouseMoved = 0;
  let mouseInCanvas = false; // mouseInCanvas 변수를 전역 스코프로 이동
  
  p.setup = function() {
    // p5Canvas 요소가 있는지 확인
    const container = document.getElementById('p5Canvas');
    if (container) {
      canvas = p.createCanvas(container.offsetWidth, 400);
      canvas.parent('p5Canvas');
    } else {
      // 컨테이너가 없으면 body에 추가
      canvas = p.createCanvas(p.windowWidth, 400);
    }
    
    p.frameRate(60); // 프레임 레이트 고정
    
    // 배열 초기화 - 모든 점을 화면 중앙에 배치
    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: p.width / 2,
        y: p.height / 2
      });
    }
    
    // 초기 자동 움직임 위치
    autoX = p.width / 2;
    autoY = p.height / 2;
    lastMouseX = autoX;
    lastMouseY = autoY;
  };

  p.draw = function() {
    p.background(255, 253, 250);
    
    let targetX, targetY;
    
    // 마우스가 화면 안에 있는지 확인
    mouseInCanvas = p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height;
    
    // 마우스가 움직였는지 체크
    const mouseMoved = p.mouseX !== p.pmouseX || p.mouseY !== p.pmouseY;
    
    if (mouseMoved) {
      framesSinceMouseMoved = 0;
    } else {
      framesSinceMouseMoved++;
    }
    
    if (mouseInCanvas) {
      mouseOutOfCanvas = false;
      
      if (mouseMoved) {
        autoMove = false;
      }
      
      // 목표 위치를 마우스 위치로 설정
      targetX = p.mouseX;
      targetY = p.mouseY;
    } else {
      // 마우스가 캔버스를 벗어난 직후에는 마지막 위치를 기억
      if (!mouseOutOfCanvas) {
        mouseOutOfCanvas = true;
        // 마지막 마우스 위치 유지
      }
      
      // 마우스가 일정 시간 동안 움직이지 않으면 자동 움직임으로 전환
      if (framesSinceMouseMoved > 60) {
        autoMove = true;
      }
      
      if (autoMove) {
        // 자동 움직임일 때의 목표 위치 계산
        noiseOffsetX += 0.003;
        noiseOffsetY += 0.003;
        
        // 다음 위치 계산 (부드러운 노이즈 움직임)
        targetX = p.map(p.noise(noiseOffsetX), 0, 1, 100, p.width - 100);
        targetY = p.map(p.noise(noiseOffsetY), 0, 1, 100, p.height - 100);
      } else {
        // 캔버스 밖으로 나갔지만 자동 움직임이 아닌 경우 마지막 마우스 위치 사용
        targetX = lastMouseX;
        targetY = lastMouseY;
      }
    }
    
    // 현재 위치에서 목표 위치로 부드럽게 이동 (easing 적용)
    // 마우스가 움직였을 때는 더 빠르게 따라가기
    const currentEasing = mouseMoved ? easing * 1.5 : easing;
    lastMouseX += (targetX - lastMouseX) * currentEasing;
    lastMouseY += (targetY - lastMouseY) * currentEasing;
    
    // 새로운 점 추가
    points.push({
      x: lastMouseX,
      y: lastMouseY
    });
    
    // 배열의 크기 유지
    if (points.length > numPoints) {
      points.shift();
    }
    
    // 점들이 충분히 있는지 확인
    if (points.length < 2) return;
    
    // 곡선 그리기
    p.noFill();
    p.strokeWeight(lineThickness);
    p.stroke(195, 20, 45, 180); // 일정한 색상과 투명도
    
    p.beginShape();
    
    // 첫 점을 두 번 추가
    p.curveVertex(points[0].x, points[0].y);
    
    // 모든 점을 추가
    for (let i = 0; i < points.length; i++) {
      p.curveVertex(points[i].x, points[i].y);
    }
    
    // 마지막 점을 두 번 추가
    p.curveVertex(points[points.length - 1].x, points[points.length - 1].y);
    
    p.endShape();
    
    // 그라데이션 효과를 위한 반투명 선들 추가 (더 부드러운 외곽선)
    for (let j = 0; j < 3; j++) { // 레이어 3개로 증가
      let gradientAlpha, gradientThickness;
      
      if (j === 0) {
        gradientAlpha = 80;
        gradientThickness = lineThickness * 1.5;
      } else if (j === 1) {
        gradientAlpha = 40;
        gradientThickness = lineThickness * 2.2;
      } else {
        gradientAlpha = 15;
        gradientThickness = lineThickness * 3.5;
      }
      
      p.strokeWeight(gradientThickness);
      p.stroke(195, 20, 45, gradientAlpha);
      
      p.beginShape();
      p.curveVertex(points[0].x, points[0].y);
      
      for (let i = 0; i < points.length; i++) {
        p.curveVertex(points[i].x, points[i].y);
      }
      
      p.curveVertex(points[points.length - 1].x, points[points.length - 1].y);
      p.endShape();
    }
  };

  p.windowResized = function() {
    const container = document.getElementById('p5Canvas');
    if (container) {
      p.resizeCanvas(container.offsetWidth, 400);
    } else {
      p.resizeCanvas(p.windowWidth, 400);
    }
  };
  
  // 마우스 이벤트 핸들러 개선
  p.mouseOver = function() {
    if (p.mouseIsPressed) {
      autoMove = false;
    }
  };
  
  p.mouseOut = function() {
    // 바로 자동 전환하지 않고 일정 시간 대기 후 전환
    // 자동 전환은 draw() 함수에서 framesSinceMouseMoved로 처리
  };
  
  // 마우스 버튼을 누를 때 자동 움직임 중지
  p.mousePressed = function() {
    // mouseInCanvas는 이제 전역 변수로서 접근 가능
    if (mouseInCanvas) {
      autoMove = false;
    }
  };
}); 