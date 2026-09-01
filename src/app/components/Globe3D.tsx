import React, { useEffect, useRef, useState } from "react";

interface Globe3DProps {
  width?: number;
  height?: number;
  scale?: number;
  interactive?: boolean;
  themeColor?: string; // e.g. "0, 229, 255"
}

// Procedural approximation of Earth's landmasses (lat/lon in degrees)
function isLand(lat: number, lon: number): boolean {
  // Americas
  if (lon > -165 && lon < -30) {
    if (lat > 12 && lat < 78 && lon < -50) {
      // Exclude some ocean areas in northern Canada / Greenland
      if (lat > 60 && lon > -100 && lon < -75 && lat < 70) return false;
      return true; 
    }
    if (lat > -55 && lat <= 12 && lon > -82 && lon < -34) {
      // South America (tapered shape)
      const w = (lat - (-55)) / (12 - (-55)); // 0 to 1
      const minL = -82 + (1 - w) * 22;
      const maxL = -34 - (1 - w) * 15;
      return lon > minL && lon < maxL;
    }
  }
  // Africa
  if (lon > -18 && lon < 51 && lat > -34 && lat < 37) {
    if (lat > 8) return lon > -18 && lon < 50; // North Africa bulb
    const w = (lat - (-34)) / (8 - (-34)); // 0 to 1
    return lon > -10 - w * 8 && lon < 15 + w * 35;
  }
  // Eurasia & Australia
  if (lon > 18 && lon < 180) {
    if (lat < -65) return true; // Antarctica
    if (lat > -40 && lat < -10 && lon > 112 && lon < 154) return true; // Australia
    
    // India (triangle shape)
    if (lat > 8 && lat < 26 && lon > 68 && lon < 89) {
      const w = (lat - 8) / (26 - 8); // 0 to 1
      return lon > 78 - w * 10 && lon < 78 + w * 11;
    }
    
    // Southeast Asia archipelagos
    if (lat > -10 && lat <= 8 && lon > 95 && lon < 142) {
      return (Math.sin(lat * 0.8) * Math.cos(lon * 0.8) > 0.05);
    }
    
    // Europe & Asia main landmass
    if (lat > 20 && lat < 78 && lon < 170) {
      if (lat < 30 && lon < 62) {
        return lon > 35 && lon < 60; // Arabian peninsula
      }
      return true;
    }
  }
  // Antarctica
  if (lat < -65) return true;
  return false;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
  isLand: boolean;
  isCityLight: boolean;
}

export default function Globe3D({
  width = 400,
  height = 400,
  scale = 130,
  interactive = true,
  themeColor = "0, 229, 255"
}: Globe3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef({ theta: 0, phi: 0.35 }); // horizontal rotation and axial tilt (phi)
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Generate sphere points on mount
  const pointsRef = useRef<Point3D[]>([]);

  useEffect(() => {
    const points: Point3D[] = [];
    const latStep = 4.5;
    const lonStep = 4.5;

    for (let lat = -90; lat <= 90; lat += latStep) {
      const theta = (lat * Math.PI) / 180;
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);
      const r = 1.0;

      for (let lon = -180; lon < 180; lon += lonStep) {
        const phi = (lon * Math.PI) / 180;
        const x = r * cosTheta * Math.sin(phi);
        const y = r * sinTheta;
        const z = r * cosTheta * Math.cos(phi);
        const land = isLand(lat, lon);
        
        // City lights on land, between lat -40 and 60, randomly scattered
        const city = land && lat > -45 && lat < 60 && (Math.sin(lat * 12.3) * Math.cos(lon * 17.8) > 0.58);

        points.push({
          x,
          y,
          z,
          isLand: land,
          isCityLight: city
        });
      }
    }
    pointsRef.current = points;
  }, []);

  // Animation and interaction loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let autoRotationSpeed = 0.0028;

    // Satellites setup
    const satellites = [
      { radius: 1.45, speed: 0.015, angle: 0, color: "0, 229, 255", size: 4, name: "INSAT-3DS", tiltX: 0.22, tiltZ: 0.4 },
      { radius: 1.6, speed: -0.012, angle: 1.5, color: "123, 97, 255", size: 3.5, name: "GOES-19", tiltX: -0.15, tiltZ: -0.3 },
      { radius: 1.35, speed: 0.018, angle: 3.0, color: "255, 106, 0", size: 3, name: "Himawari-8", tiltX: 0.35, tiltZ: -0.2 }
    ];

    // Pulsing radar arrays on Earth (ground stations)
    // India SAC coordinates (approx lat: 23, lon: 72)
    const groundStations = [
      { lat: 23, lon: 72, pulseRadius: 0, maxPulse: 35 }, // Ahmedabad / SAC
      { lat: 13, lon: 80, pulseRadius: 10, maxPulse: 40 } // Chennai / Sriharikota
    ];

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Update rotation
      if (!isDragging.current && interactive) {
        rotationRef.current.theta += autoRotationSpeed;
      }

      const cosT = Math.cos(rotationRef.current.theta);
      const sinT = Math.sin(rotationRef.current.theta);
      const cosP = Math.cos(rotationRef.current.phi);
      const sinP = Math.sin(rotationRef.current.phi);

      // Project function
      function project(x: number, y: number, z: number) {
        // Rotate around Y-axis (theta)
        const x1 = x * cosT - z * sinT;
        const z1 = x * sinT + z * cosT;
        
        // Rotate around X-axis (phi)
        const y2 = y * cosP - z1 * sinP;
        const z2 = y * sinP + z1 * cosP;

        return {
          sx: cx + x1 * scale,
          sy: cy - y2 * scale,
          sz: z2 // depth variable
        };
      }

      // Draw Atmospheric Outer Space Glow Halo (Behind Globe)
      const haloGlow = ctx.createRadialGradient(cx, cy, scale * 0.9, cx, cy, scale * 1.3);
      haloGlow.addColorStop(0, `rgba(${themeColor}, 0.25)`);
      haloGlow.addColorStop(0.3, `rgba(${themeColor}, 0.12)`);
      haloGlow.addColorStop(0.6, `rgba(123, 97, 255, 0.04)`);
      haloGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = haloGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, scale * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Render orbits (back part: depth < 0)
      satellites.forEach((sat) => {
        ctx.strokeStyle = `rgba(${sat.color}, 0.07)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        const segments = 90;
        let first = true;
        for (let i = 0; i <= segments; i++) {
          const a = (i / segments) * Math.PI * 2;
          // compute coordinates in orbital plane
          const ox = Math.cos(a) * sat.radius;
          const oy = 0;
          const oz = Math.sin(a) * sat.radius;
          
          // apply orbital plane tilt (rotate around X, then Z)
          const cX = Math.cos(sat.tiltX), sX = Math.sin(sat.tiltX);
          const cZ = Math.cos(sat.tiltZ), sZ = Math.sin(sat.tiltZ);
          
          const rx = ox * cZ - oz * sZ;
          const ry = ox * sZ + oz * cZ;
          const rz = oy * cX - oz * sX; // simple 3D rotation
          
          const pt = project(rx, ry, rz);
          if (pt.sz <= 0) { // BACK
            if (first) { ctx.moveTo(pt.sx, pt.sy); first = false; }
            else { ctx.lineTo(pt.sx, pt.sy); }
          }
        }
        ctx.stroke();
      });

      // Draw Earth dark base circle to hide background orbits
      ctx.fillStyle = "#02050f";
      ctx.beginPath();
      ctx.arc(cx, cy, scale * 0.99, 0, Math.PI * 2);
      ctx.fill();

      // Earth body grid (shading glow inside)
      const bodyGlow = ctx.createRadialGradient(cx - scale * 0.3, cy - scale * 0.3, scale * 0.1, cx, cy, scale);
      bodyGlow.addColorStop(0, "rgba(10, 25, 55, 0.9)");
      bodyGlow.addColorStop(0.7, "rgba(4, 9, 24, 0.98)");
      bodyGlow.addColorStop(1, "#010309");
      ctx.fillStyle = bodyGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, scale, 0, Math.PI * 2);
      ctx.fill();

      // Draw lat/lon grid lines (front side only)
      ctx.strokeStyle = `rgba(${themeColor}, 0.05)`;
      ctx.lineWidth = 0.5;
      
      // Draw latitude lines
      for (let lat = -75; lat <= 75; lat += 15) {
        const rad = (lat * Math.PI) / 180;
        const y = Math.sin(rad);
        const r = Math.cos(rad);
        ctx.beginPath();
        let first = true;
        for (let lon = -180; lon <= 180; lon += 5) {
          const phi = (lon * Math.PI) / 180;
          const x = r * Math.sin(phi);
          const z = r * Math.cos(phi);
          const pt = project(x, y, z);
          if (pt.sz > 0) {
            if (first) { ctx.moveTo(pt.sx, pt.sy); first = false; }
            else { ctx.lineTo(pt.sx, pt.sy); }
          }
        }
        ctx.stroke();
      }

      // Draw longitude lines
      for (let lon = 0; lon < 360; lon += 30) {
        const phi = (lon * Math.PI) / 180;
        ctx.beginPath();
        let first = true;
        for (let lat = -90; lat <= 90; lat += 5) {
          const theta = (lat * Math.PI) / 180;
          const x = Math.cos(theta) * Math.sin(phi);
          const y = Math.sin(theta);
          const z = Math.cos(theta) * Math.cos(phi);
          const pt = project(x, y, z);
          if (pt.sz > 0) {
            if (first) { ctx.moveTo(pt.sx, pt.sy); first = false; }
            else { ctx.lineTo(pt.sx, pt.sy); }
          }
        }
        ctx.stroke();
      }

      // Draw Land Points
      pointsRef.current.forEach((pt) => {
        const proj = project(pt.x, pt.y, pt.z);
        if (proj.sz > 0) { // FRONT SIDE ONLY
          // Lighting model: Sun shining from front-left-top
          // Direction of light: vector [-0.6, 0.4, 0.7] normalized
          // Dot product of surface normal (pt.x, pt.y, pt.z) and light direction
          const normalDotLight = pt.x * (-0.5) + pt.y * 0.3 + pt.z * 0.82;
          
          if (pt.isLand) {
            if (normalDotLight > 0.05) {
              // Day side landmass
              const factor = Math.min(1.0, normalDotLight + 0.15);
              ctx.fillStyle = `rgba(${themeColor}, ${factor * 0.85})`;
              ctx.fillRect(proj.sx - 0.7, proj.sy - 0.7, 1.4, 1.4);
            } else {
              // Night side landmass
              ctx.fillStyle = `rgba(${themeColor}, 0.08)`;
              ctx.fillRect(proj.sx - 0.5, proj.sy - 0.5, 1.0, 1.0);

              // City night lights (amber glow dots)
              if (pt.isCityLight) {
                // Dimmer near terminator, bright in deep night
                const nightStrength = Math.min(1.0, -normalDotLight * 2);
                ctx.fillStyle = `rgba(255, 200, 40, ${nightStrength * 0.95})`;
                ctx.beginPath();
                ctx.arc(proj.sx, proj.sy, 0.8, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        }
      });

      // Update and Draw Ground Station Radar Rings (Ahmedabad / Sriharikota)
      groundStations.forEach((gs) => {
        // Convert lat/lon to 3D point
        const latRad = (gs.lat * Math.PI) / 180;
        const lonRad = (gs.lon * Math.PI) / 180;
        const x = Math.cos(latRad) * Math.sin(lonRad);
        const y = Math.sin(latRad);
        const z = Math.cos(latRad) * Math.cos(lonRad);

        const pt = project(x, y, z);
        if (pt.sz > 0) { // ground station on front side
          // Draw base station dot
          ctx.fillStyle = "#FF3B5C";
          ctx.beginPath();
          ctx.arc(pt.sx, pt.sy, 2.5, 0, Math.PI * 2);
          ctx.fill();
          
          // Radar pulse ring
          gs.pulseRadius += 0.45;
          if (gs.pulseRadius > gs.maxPulse) gs.pulseRadius = 0;
          
          const alpha = 1.0 - (gs.pulseRadius / gs.maxPulse);
          ctx.strokeStyle = `rgba(255, 59, 92, ${alpha * 0.75})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(pt.sx, pt.sy, gs.pulseRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Connect signal beam to nearest active satellite if on screen
          satellites.forEach((sat) => {
            sat.angle += sat.speed * 0.2; // increment sat angle slowly
            const satX = Math.cos(sat.angle) * sat.radius;
            const satY = 0;
            const satZ = Math.sin(sat.angle) * sat.radius;

            const cX = Math.cos(sat.tiltX), sX = Math.sin(sat.tiltX);
            const cZ = Math.cos(sat.tiltZ), sZ = Math.sin(sat.tiltZ);
            
            const rsx = satX * cZ - satZ * sZ;
            const rsy = satX * sZ + satZ * cZ;
            const rsz = satY * cX - satZ * sX;

            const satPt = project(rsx, rsy, rsz);
            
            if (satPt.sz > 0 && sat.name === "INSAT-3DS") { // INSAT connects to India
              ctx.strokeStyle = `rgba(${sat.color}, 0.25)`;
              ctx.lineWidth = 0.8;
              ctx.setLineDash([2, 4]);
              ctx.beginPath();
              ctx.moveTo(pt.sx, pt.sy);
              
              // draw curved signal line
              const midX = (pt.sx + satPt.sx) / 2;
              const midY = (pt.sy + satPt.sy) / 2 - 25; // arch height
              ctx.quadraticCurveTo(midX, midY, satPt.sx, satPt.sy);
              ctx.stroke();
              ctx.setLineDash([]); // clear
            }
          });
        }
      });

      // Draw Earth atmospheric rim lighting (glow contour)
      const rimGrad = ctx.createRadialGradient(cx, cy, scale * 0.98, cx, cy, scale * 1.02);
      rimGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
      rimGrad.addColorStop(0.5, `rgba(${themeColor}, 0.65)`);
      rimGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.strokeStyle = rimGrad;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, scale, 0, Math.PI * 2);
      ctx.stroke();

      // Render orbits (front part: depth > 0)
      satellites.forEach((sat) => {
        ctx.strokeStyle = `rgba(${sat.color}, 0.22)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        const segments = 90;
        let first = true;
        for (let i = 0; i <= segments; i++) {
          const a = (i / segments) * Math.PI * 2;
          const ox = Math.cos(a) * sat.radius;
          const oy = 0;
          const oz = Math.sin(a) * sat.radius;
          
          const cX = Math.cos(sat.tiltX), sX = Math.sin(sat.tiltX);
          const cZ = Math.cos(sat.tiltZ), sZ = Math.sin(sat.tiltZ);
          
          const rx = ox * cZ - oz * sZ;
          const ry = ox * sZ + oz * cZ;
          const rz = oy * cX - oz * sX;
          
          const pt = project(rx, ry, rz);
          if (pt.sz > 0) { // FRONT
            if (first) { ctx.moveTo(pt.sx, pt.sy); first = false; }
            else { ctx.lineTo(pt.sx, pt.sy); }
          }
        }
        ctx.stroke();

        // Render Satellite Position on Orbit
        const satX = Math.cos(sat.angle) * sat.radius;
        const satY = 0;
        const satZ = Math.sin(sat.angle) * sat.radius;

        const cX = Math.cos(sat.tiltX), sX = Math.sin(sat.tiltX);
        const cZ = Math.cos(sat.tiltZ), sZ = Math.sin(sat.tiltZ);
        
        const rsx = satX * cZ - satZ * sZ;
        const rsy = satX * sZ + satZ * cZ;
        const rsz = satY * cX - satZ * sX;

        const satPt = project(rsx, rsy, rsz);
        if (satPt.sz > 0) { // FRONT
          // Outer blinking glow
          const glowSize = 7 + Math.sin(Date.now() * 0.008) * 3;
          const radial = ctx.createRadialGradient(satPt.sx, satPt.sy, 1, satPt.sx, satPt.sy, glowSize);
          radial.addColorStop(0, `rgba(${sat.color}, 0.85)`);
          radial.addColorStop(0.5, `rgba(${sat.color}, 0.28)`);
          radial.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = radial;
          ctx.beginPath();
          ctx.arc(satPt.sx, satPt.sy, glowSize, 0, Math.PI * 2);
          ctx.fill();

          // Core dot
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(satPt.sx, satPt.sy, 2, 0, Math.PI * 2);
          ctx.fill();

          // Satellite Label
          ctx.fillStyle = `rgba(${sat.color}, 0.85)`;
          ctx.font = "9px 'JetBrains Mono', monospace";
          ctx.fillText(sat.name, satPt.sx + 8, satPt.sy - 4);
          
          // Draw tiny antenna grid lines
          ctx.strokeStyle = `rgba(${sat.color}, 0.3)`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(satPt.sx - 6, satPt.sy);
          ctx.lineTo(satPt.sx + 6, satPt.sy);
          ctx.moveTo(satPt.sx, satPt.sy - 6);
          ctx.lineTo(satPt.sx, satPt.sy + 6);
          ctx.stroke();
        }
      });

      // Draw decorative orbit HUD overlay ring
      ctx.strokeStyle = "rgba(0, 229, 255, 0.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, scale * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      
      animFrame = requestAnimationFrame(draw);
    }

    draw();

    return () => cancelAnimationFrame(animFrame);
  }, [width, height, scale, interactive, themeColor]);

  // Mouse drag handlers to rotate globe
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    
    rotationRef.current.theta += dx * 0.006;
    rotationRef.current.phi = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotationRef.current.phi - dy * 0.006));
    
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div style={{ width, height, position: "relative", cursor: "grab" }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ display: "block" }}
      />
      {/* HUD corner overlay */}
      <div style={{ position: "absolute", inset: 0, border: "1px solid rgba(0, 229, 255, 0.04)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 4, left: 4, width: 8, height: 8, borderTop: "2px solid rgba(0, 229, 255, 0.35)", borderLeft: "2px solid rgba(0, 229, 255, 0.35)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 4, right: 4, width: 8, height: 8, borderBottom: "2px solid rgba(0, 229, 255, 0.35)", borderRight: "2px solid rgba(0, 229, 255, 0.35)", pointerEvents: "none" }} />
    </div>
  );
}
