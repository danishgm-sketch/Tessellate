import React, { useEffect, useRef, useState } from 'react';

export type ParticleConstellationVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ParticleConstellationProps {
  variant?: ParticleConstellationVariant;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export function ParticleConstellation({ variant = 'quiet' }: ParticleConstellationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-900 text-white border-neutral-800'
      : 'bg-white text-neutral-900 border-neutral-200';

  const dotFill =
    variant === 'nocturne' ? '#06B6D4' : variant === 'expressive' ? '#3B82F6' : '#171717';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const width = (canvas.width = canvas.offsetWidth || 600);
    const height = (canvas.height = canvas.offsetHeight || 260);

    const particles: Particle[] = Array.from({ length: 28 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 1.5 + 1.5,
    }));

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Connect to mouse if within radius (only if not reduced motion)
      if (mousePos && !prefersReducedMotion) {
        for (const p of particles) {
          const dx = p.x - mousePos.x;
          const dy = p.y - mousePos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.strokeStyle = dotFill;
            ctx.globalAlpha = (1 - dist / 120) * 0.5;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mousePos.x, mousePos.y);
            ctx.stroke();
          }
        }
      }

      // Draw proximity connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i]!.x - particles[j]!.x;
          const dy = particles[i]!.y - particles[j]!.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 90) {
            const alpha = (1 - dist / 90) * 0.35;
            ctx.strokeStyle = dotFill;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i]!.x, particles[i]!.y);
            ctx.lineTo(particles[j]!.x, particles[j]!.y);
            ctx.stroke();
          }
        }
      }

      // Draw and update particle nodes
      ctx.globalAlpha = 1.0;
      for (const p of particles) {
        ctx.fillStyle = dotFill;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
        }
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [dotFill]);

  return (
    <div
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseLeave={() => setMousePos(null)}
      className={`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors ${cardBg}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Kinetic Topology</span>
        <h4 className="text-base font-bold tracking-tight">Particle Constellation Field</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Dynamic interconnected vector star nodes forming reactive celestial geometry.
        </p>
      </div>
    </div>
  );
}

