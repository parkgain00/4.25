import { useEffect, useRef } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import Script from 'next/script';

const VisualisationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  min-height: 100vh;
`;

const CanvasWrapper = styled.div`
  margin: 20px;
  position: relative;
  border: 1px solid #333;
  min-height: 600px;
  min-width: 600px;
`;

const Title = styled.h1`
  color: #333;
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  color: #666;
  max-width: 600px;
  text-align: center;
  margin-bottom: 2rem;
`;

const Footer = styled.footer`
  font-size: 0.8rem;
  margin-top: 2rem;
  text-align: center;
  color: #666;
`;

export default function Visualisation() {
  const canvasRef = useRef(null);
  const p5Ref = useRef(null);

  useEffect(() => {
    // Remove any existing p5 instances
    if (window.emotionalLinesInstance) {
      window.emotionalLinesInstance.remove();
    }

    // Check if p5 is loaded
    if (typeof window !== 'undefined' && window.p5) {
      initSketch();
    }

    return () => {
      if (window.emotionalLinesInstance) {
        window.emotionalLinesInstance.remove();
      }
    };
  }, []);

  const initSketch = () => {
    window.emotionalLinesInstance = new window.p5((p) => {
      let seed = Math.random() * 1583;
      let t;
      let num, vNum;
      let radius, mySize, margin;
      let sizes = [];

      let colors = [];
      let colors0 = "281914-1a1a1a-202020-242e30".split("-").map((a) => "#" + a);
      let colors22 = "070A0D-171F26-4A5259-7B848C-AEB7BF".split("-").map((a) => "#" + a);
      let colors23 = "D94389-4D578C-3791A6-3DF2D1-F28080".split("-").map((a) => "#" + a);
      let colors24 = "F28D35-D96A29-A66641-D9B0A7-F2DAD8".split("-").map((a) => "#" + a);
      let colors25 = "F2A7D8-473959-655A8C-9F8FD9-5979D9".split("-").map((a) => "#" + a);
      let colors26 = "025951-012623-21BF92-73D9BC-0D0D0D".split("-").map((a) => "#" + a);
      let colors7 = "fefefe-fffffb-fafdff-fef9fb-f7fcfe".split("-").map((a) => "#" + a);
      let colors8 = "8c75ff-c553d2-2dfd60-2788f5-23054f-f21252-8834f1-c4dd92-184fd3-f9fee2-2E294E-541388-F1E9DA-FFD400-D90368-e9baaa-ffa07a-164555-ffe1d0-acd9e7-4596c7-6d8370-e45240-21d3a4-3303f9-cd2220-173df6-244ca8-a00360-b31016".split("-").map((a) => "#" + a);
      let colors11 = "025159-3E848C-7AB8BF-C4EEF2-A67458".split("-").map((a) => "#" + a);
      let colors12 = "10454F-506266-818274-A3AB78-BDE038".split("-").map((a) => "#" + a);
      let colors13 = "D96690-F28DB2-F2C9E0-89C2D9-88E8F2".split("-").map((a) => "#" + a);
      let color_setup1, color_setup2;
      let color_bg;
      let v_planet = [];

      p.setup = function() {
        p.randomSeed(seed);
        p.pixelDensity(2); // Reduced from 5 to 2 for better performance in browser
        mySize = p.min(p.windowWidth, p.windowHeight) * 0.8;
        margin = mySize / 100;
        let canvas = p.createCanvas(mySize, mySize, p.WEBGL);
        canvas.parent(canvasRef.current);
        
        color_setup1 = colors7;
        color_setup2 = p.random([colors22, colors23, colors24, colors25, colors26, colors11, colors12, colors13]);
        color_bg = "#202020";
        p.background(color_bg);
        
        num = 1 * p.int(p.random(30, 10));
        radius = mySize * 1.0;
        for (let a = 0; a < p.TAU; a += p.TAU / num) {
          sizes.push(10 * p.random(0.1, 0.5));
        }
        t = 0;
      };

      p.draw = function() {
        p.randomSeed(seed);

        for (let i = 0; i < num; i++) {
          let a = (p.TAU / num) * i;
          let x = radius * p.sin(a + t) / p.random(5, 3) / 1.0;
          let y = radius * p.cos(a + t) / p.random(3, 5) / 1.0;
          v_planet[i] = p.createVector(x, y);
        }

        p.push();
        for (let q = 0; q < 1 / 5; q += 2 * p.random(0.01, 0.02)) {
          for (let j = 0; j < 2; j++) {
            p.rotateX(p.random(p.TAU)*j + t / 10 + q / p.random(75, 100) / 10);
            p.rotateY(p.random(p.PI)*j - t / 10 - q / p.random(75, 100) / 10);
            p.rotateZ(p.random(p.PI / 2)*j - t / 10 + q / p.random(75, 100) / 10);
            p.noFill();

            for (let i = 0; i < num; i += 1) {
              let d = p.random(radius / 32, radius / 16);
              let x_plus = 1.001 * p.random(-d, d);
              let y_plus = 0.001 * p.random(-d, d);
              let z_plus = 0.001 * p.random(-d, d);
              p.stroke(p.random(color_setup2));
              p.strokeWeight(sizes[i] * p.random(0.2, 0.6));
              p.point(v_planet[i].x + x_plus, v_planet[i].y + y_plus, z_plus);
            }
          }
        }
        p.pop();

        t += p.random(2, 1) * p.random(0.001, 0.0025);
      };

      p.keyTyped = function() {
        if (p.key === "s" || p.key === "S") {
          p.saveCanvas("Emotional_lines", "png");
        }
      };
      
      p.windowResized = function() {
        mySize = p.min(p.windowWidth, p.windowHeight) * 0.8;
        p.resizeCanvas(mySize, mySize);
        radius = mySize * 1.0;
      };
    }, canvasRef.current);
  };

  return (
    <VisualisationContainer>
      <Head>
        <title>Emotional Lines Visualisation</title>
        <meta name="description" content="Emotional Lines pattern visualization using p5.js" />
      </Head>

      <Title>Emotional Lines</Title>
      <Description>
        An interactive visualization created by SamuelYAN. The pattern creates abstract 3D point
        formations that slowly evolve over time, creating an emotional experience through lines and movement.
      </Description>

      <CanvasWrapper ref={canvasRef}></CanvasWrapper>

      <Footer>
        © 2023 Based on work by SamuelYAN. 
        <a href="https://twitter.com/SamuelAnn0924" target="_blank" rel="noopener noreferrer"> Twitter</a> | 
        <a href="https://www.instagram.com/samuel_yan_1990/" target="_blank" rel="noopener noreferrer"> Instagram</a>
      </Footer>

      <Script
        src="https://cdn.jsdelivr.net/npm/p5@1.4.0/lib/p5.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("p5.js loaded");
          if (canvasRef.current) {
            initSketch();
          }
        }}
      />
    </VisualisationContainer>
  );
} 