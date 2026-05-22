"use client";

import React, { useEffect, useRef } from "react";

export function LivingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Throttle for mobile and performance
    const isMobile = width < 768;
    const particleCount = isMobile ? 30 : 70;
    const connectionDistance = isMobile ? 100 : 150;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    canvas.width = width;
    canvas.height = height;

    const mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * (reducedMotion ? 0.1 : 0.4);
        this.vy = (Math.random() - 0.5) * (reducedMotion ? 0.1 : 0.4);
        this.radius = Math.random() * 1.5 + 0.5;
        this.color = Math.random() > 0.5 ? "rgba(0, 200, 255, 0.6)" : "rgba(168, 85, 247, 0.6)";
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const particles: Particle[] = Array.from({ length: particleCount }, () => new Particle());

    // Fog elements
    const fogs = [
      { x: width * 0.2, y: height * 0.3, r: 400, color: "rgba(53, 92, 255, 0.03)", vx: 0.1, vy: 0.05 },
      { x: width * 0.8, y: height * 0.7, r: 500, color: "rgba(168, 85, 247, 0.02)", vx: -0.05, vy: -0.1 },
    ];

    let lastTime = 0;
    const targetFPS = 60;
    const interval = 1000 / targetFPS;

    const render = (timestamp: number) => {
      const deltaTime = timestamp - lastTime;
      
      if (deltaTime > interval) {
        lastTime = timestamp - (deltaTime % interval);

        // L0: Clear Black Background
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);

        // L1: Diamond Grid (drawn as subtle dots to be lightweight)
        ctx.fillStyle = "rgba(255, 255, 255, 0.015)";
        const gridSize = 40;
        for (let x = 0; x < width; x += gridSize) {
          for (let y = 0; y < height; y += gridSize) {
            ctx.fillRect(x, y, 1, 1);
          }
        }

        // L3: Fog
        fogs.forEach((fog) => {
          if (!reducedMotion) {
            fog.x += fog.vx;
            fog.y += fog.vy;
            if (fog.x < -fog.r || fog.x > width + fog.r) fog.vx *= -1;
            if (fog.y < -fog.r || fog.y > height + fog.r) fog.vy *= -1;
          }
          const gradient = ctx.createRadialGradient(fog.x, fog.y, 0, fog.x, fog.y, fog.r);
          gradient.addColorStop(0, fog.color);
          gradient.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);
        });

        // L2 & L4: Particles & Connections
        for (let i = 0; i < particles.length; i++) {
          particles[i].update();
          particles[i].draw(ctx);

          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectionDistance) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(0, 200, 255, ${0.1 * (1 - dist / connectionDistance)})`;
              ctx.lineWidth = 0.5;
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }

          // Mouse connection
          const dxMouse = particles[i].x - mouse.x;
          const dyMouse = particles[i].y - mouse.y;
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
          
          if (distMouse < 200) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(168, 85, 247, ${0.15 * (1 - distMouse / 200)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }

        // L5: Mouse Aura
        if (mouse.x > 0 && mouse.y > 0) {
          const mouseGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 150);
          mouseGlow.addColorStop(0, "rgba(0, 255, 170, 0.04)");
          mouseGlow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = mouseGlow;
          ctx.fillRect(0, 0, width, height);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ filter: "blur(0.5px)" }}
    />
  );
}
