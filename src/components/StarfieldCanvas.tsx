import React, { useEffect, useRef } from 'react';

export const StarfieldCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Generate stars
    const STAR_COUNT = 150;
    const stars: {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      alpha: number;
      alphaSpeed: number;
    }[] = [];

    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() < 0.2 ? 1.5 : Math.random() * 0.9 + 0.3,
        speedY: (Math.random() * 0.15 + 0.05) * (Math.random() < 0.5 ? 1 : -1),
        speedX: (Math.random() * 0.1 + 0.02) * (Math.random() < 0.5 ? 1 : -1),
        alpha: Math.random() * 0.7 + 0.2,
        alphaSpeed: (Math.random() * 0.008 + 0.002) * (Math.random() < 0.5 ? 1 : -1),
      });
    }

    const render = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Move stars slowly
        star.y += star.speedY;
        star.x += star.speedX;

        // Twinkle
        star.alpha += star.alphaSpeed;
        if (star.alpha > 0.9) {
          star.alpha = 0.9;
          star.alphaSpeed = -Math.abs(star.alphaSpeed);
        } else if (star.alpha < 0.2) {
          star.alpha = 0.2;
          star.alphaSpeed = Math.abs(star.alphaSpeed);
        }

        // Wrap around boundaries
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;

        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      style={{ background: '#000000' }}
    />
  );
};
