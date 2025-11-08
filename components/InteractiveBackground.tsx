'use client';

import { useEffect, useRef } from 'react';

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetX = mouseX;
    let targetY = mouseY;

    // Particles for extra interactivity
    const particles: Array<{x: number, y: number, vx: number, vy: number, size: number}> = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2
      });
    }

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let time = 0;
    const draw = () => {
      time += 0.01;
      
      // Smooth mouse follow
      mouseX += (targetX - mouseX) * 0.1;
      mouseY += (targetY - mouseY) * 0.1;

      // Helt sort baggrund
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animated ambient glow
      const ambientGlow = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      );
      ambientGlow.addColorStop(0, `rgba(249, 115, 22, ${0.03 + Math.sin(time) * 0.02})`);
      ambientGlow.addColorStop(0.5, `rgba(251, 191, 36, ${0.02 + Math.cos(time) * 0.01})`);
      ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Multiple gradient glows following mouse with offset
      for (let i = 0; i < 3; i++) {
        const offsetX = Math.cos(time + i) * 50;
        const offsetY = Math.sin(time + i) * 50;
        
        const gradient = ctx.createRadialGradient(
          mouseX + offsetX, mouseY + offsetY, 0,
          mouseX + offsetX, mouseY + offsetY, 250 - i * 50
        );
        
        if (i === 0) {
          gradient.addColorStop(0, 'rgba(249, 115, 22, 0.15)');
          gradient.addColorStop(0.5, 'rgba(249, 115, 22, 0.05)');
        } else if (i === 1) {
          gradient.addColorStop(0, 'rgba(251, 191, 36, 0.12)');
          gradient.addColorStop(0.5, 'rgba(251, 191, 36, 0.04)');
        } else {
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.1)');
          gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.03)');
        }
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Subtle particles
      particles.forEach(p => {
        // Move particles
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around screen
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw particle
        const distToMouse = Math.sqrt((p.x - mouseX) ** 2 + (p.y - mouseY) ** 2);
        const opacity = Math.max(0, 1 - distToMouse / 300);
        
        ctx.fillStyle = `rgba(249, 115, 22, ${opacity * 0.3})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
