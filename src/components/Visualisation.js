import React, { useEffect, useRef } from 'react';

export default function Visualisation() {
  const ref = useRef(null);

  useEffect(() => {
    // 추후 p5.js 초기화 코드가 들어갈 수 있습니다.
  }, []);

  return <div ref={ref} style={{ width: '100vw', height: '100vh', background: '#000' }} />;
} 