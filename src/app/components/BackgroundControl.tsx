import React, { useEffect, useRef } from "react";

interface BackgroundControlProps {
  children: React.ReactNode;
}

export default function BackgroundControl({ children }: BackgroundControlProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle class for Layer 6: Slow moving dust particles
    class Particle {
      x: number = 0;
      y: number = 0;
      vx: number = 0;
      vy: number = 0;
      size: number = 0;
      alpha: number = 0;
      speedAlpha: number = 0;
      glowColor: string = "";

      constructor() {
        this.reset();
        this.y = Math.random() * height; // initial distribution across screen
      }

      reset() {
        this.x = Math.random() * width;
        this.y = height + 10;
        this.vx = (Math.random() - 0.5) * 0.18;
        this.vy = -Math.random() * 0.25 - 0.08;
        this.size = Math.random() * 1.8 + 0.6;
        this.alpha = Math.random() * 0.38 + 0.12;
        this.speedAlpha = 0.0015 + Math.random() * 0.0025;
        this.glowColor = Math.random() > 0.4 ? "0, 229, 255" : "123, 97, 255"; // cyan or violet
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // slow ambient pulse
        this.alpha += this.speedAlpha;
        if (this.alpha > 0.55 || this.alpha < 0.1) {
          this.speedAlpha = -this.speedAlpha;
        }

        if (this.y < -10 || this.x < -10 || this.x > width + 10) {
          this.reset();
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.fillStyle = `rgba(${this.glowColor}, ${this.alpha})`;
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fill();
      }
    }

    const particles: Particle[] = Array.from({ length: 40 }, () => new Particle());

    function handleResize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener("resize", handleResize);

    function loop() {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.update();
        p.draw(ctx);
      }
      animationId = requestAnimationFrame(loop);
    }

    loop();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div style={{ position: "relative", minHeight: "100vh", width: "100%", overflow: "hidden" }}>
      {/* Layer 1: Deep Space Gradient */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "linear-gradient(180deg, #02040a 0%, #030612 50%, #000104 100%)",
          zIndex: -10,
          pointerEvents: "none",
        }}
      />

      {/* Layer 2: Moving Large Soft Radial Gradients (Auroras) */}
      <div
        className="aurora-layers"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: -9,
        }}
      >
        <div
          className="aurora-element-1"
          style={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: "70%",
            height: "70%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0, 229, 255, 0.08) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="aurora-element-2"
          style={{
            position: "absolute",
            bottom: "-20%",
            right: "-10%",
            width: "80%",
            height: "80%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(123, 97, 255, 0.06) 0%, transparent 75%)",
            filter: "blur(50px)",
          }}
        />
      </div>

      {/* Layer 3: Noise Texture Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: -8,
          opacity: 0.015,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Layer 5: Very Subtle Nebula Clouds */}
      <div
        className="nebula-bg"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: -7,
          background: "radial-gradient(ellipse at 50% 30%, rgba(0, 100, 255, 0.03), transparent 60%)",
        }}
      />

      {/* Layer 6: Canvas Particles */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: -6,
        }}
      />

      {/* Layer 7: Cyber Grid Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: -5,
          backgroundImage: `
            linear-gradient(rgba(0, 229, 255, 0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 229, 255, 0.015) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          backgroundPosition: "center center",
        }}
      />

      {/* scanline overlay for mission control vibes */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: -4,
          background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.12) 50%)",
          backgroundSize: "100% 4px",
        }}
      />

      {/* Main app content wrapper */}
      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", width: "100%" }}>
        {children}
      </div>
    </div>
  );
}
