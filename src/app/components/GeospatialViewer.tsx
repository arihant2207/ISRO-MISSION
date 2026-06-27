import React, { useEffect, useRef, useState } from "react";
import { 
  Lock, AlertTriangle, Play, Pause, ZoomIn, ZoomOut, Compass, Shield
} from "lucide-react";

interface GeospatialViewerProps {
  mode: string;
  isPlaying: boolean;
}

// Detailed coastlines for geographic accuracy
const INDIA_COAST: [number, number][] = [
  [8.0, 77.5], [8.8, 76.5], [10.0, 76.2], [11.5, 75.7], [13.0, 74.8], 
  [15.0, 74.0], [16.0, 73.5], [19.0, 72.8], [20.0, 72.8], [21.0, 72.1],
  [22.2, 72.4], [21.0, 70.0], [22.0, 69.0], [22.5, 69.8], [23.0, 70.0],
  [23.5, 68.5], [24.5, 68.2], [24.8, 69.8], [23.8, 71.2], [24.5, 72.5],
  // Pakistan border
  [26.0, 71.0], [28.0, 70.0], [31.0, 74.0], [34.0, 73.5], [36.0, 74.5],
  // Himalayas & northern border
  [35.0, 77.0], [33.0, 79.0], [30.5, 80.2], [29.0, 80.2], [28.0, 84.0], // Nepal border
  [27.5, 88.2], [27.2, 89.0], [27.8, 90.5], [26.8, 91.5], [27.5, 92.0], // Bhutan/Arunachal
  [28.2, 96.0], [27.0, 97.0], [24.0, 94.5], [22.0, 93.5], [21.0, 92.2], // Myanmar border
  // Sundarbans / East coast
  [21.8, 91.8], [22.8, 91.4], [22.5, 90.0], [21.8, 89.5], [22.2, 88.0], // Bangladesh
  [21.5, 87.0], [20.2, 86.5], [19.3, 85.0], [17.7, 83.3], [16.2, 82.2],
  [15.8, 80.8], [13.5, 80.2], [10.3, 79.9], [9.3, 79.0], [8.8, 78.2],
  [8.0, 77.5]
];

const SRI_LANKA: [number, number][] = [
  [9.5, 80.0], [9.0, 80.3], [8.0, 81.3], [6.8, 81.6], [6.0, 80.6],
  [6.2, 79.9], [7.2, 79.8], [8.5, 79.7], [9.5, 80.0]
];

const BANGLADESH: [number, number][] = [
  [21.8, 89.5], [22.5, 90.0], [22.8, 91.4], [21.8, 91.8], [21.0, 92.2],
  [22.5, 92.3], [24.0, 92.0], [25.0, 92.5], [25.2, 91.0], [26.0, 89.8],
  [25.8, 88.5], [24.0, 88.2], [22.8, 89.0], [22.2, 88.0], [21.8, 89.5]
];

const MYANMAR: [number, number][] = [
  [21.0, 92.2], [22.0, 93.5], [24.0, 94.5], [27.0, 97.0], [28.2, 96.0],
  [25.0, 98.0], [22.0, 98.2], [20.0, 97.5], [16.0, 97.6], [16.0, 96.2],
  [16.8, 94.2], [20.2, 93.5], [21.0, 92.2]
];

const PAKISTAN: [number, number][] = [
  [23.5, 68.5], [24.5, 68.2], [25.0, 67.0], [25.2, 64.0], [25.0, 61.5],
  [29.0, 61.5], [30.0, 66.0], [32.0, 69.0], [33.5, 71.0], [35.0, 71.5],
  [37.0, 74.0], [36.0, 74.5], [31.0, 74.0], [28.0, 70.0], [26.0, 71.0],
  [23.5, 68.5]
];

// Helper to project geographic coordinates into 2D texture map coords (1024x512)
function drawGeographicPath(ctx: CanvasRenderingContext2D, coords: [number, number][]) {
  ctx.beginPath();
  coords.forEach(([lat, lon], idx) => {
    const x = ((lon + 180) / 360) * 1024;
    const y = ((90 - lat) / 180) * 512;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
}

function buildPhotorealisticEarthTextures(onLoadCallback: () => void) {
  const width = 1024;
  const height = 512;

  // Day Map Canvas
  const dayCanvas = document.createElement("canvas");
  dayCanvas.width = width;
  dayCanvas.height = height;
  const dayCtx = dayCanvas.getContext("2d")!;

  // Fill oceans with deep gradient
  const oceanGrad = dayCtx.createRadialGradient(width/2, height/2, 50, width/2, height/2, 600);
  oceanGrad.addColorStop(0, "#01122a");
  oceanGrad.addColorStop(0.7, "#010915");
  oceanGrad.addColorStop(1, "#000307");
  dayCtx.fillStyle = oceanGrad;
  dayCtx.fillRect(0, 0, width, height);

  // Fallback drawing in case images load slowly
  function drawProceduralBase() {
    // Fill background land mass (Eurasia base)
    dayCtx.fillStyle = "#0d1a10";
    dayCtx.fillRect(width * 0.5, 0, width * 0.5, height * 0.6);

    // Draw detailed countries
    dayCtx.fillStyle = "#0c2817"; // forest green India
    drawGeographicPath(dayCtx, INDIA_COAST);
    dayCtx.fill();

    // Pakistan
    dayCtx.fillStyle = "#262118"; // arid Pakistan
    drawGeographicPath(dayCtx, PAKISTAN);
    dayCtx.fill();

    // Bangladesh
    dayCtx.fillStyle = "#082f18"; // lush Bangladesh
    drawGeographicPath(dayCtx, BANGLADESH);
    dayCtx.fill();

    // Myanmar
    dayCtx.fillStyle = "#0b2616";
    drawGeographicPath(dayCtx, MYANMAR);
    dayCtx.fill();

    // Sri Lanka
    dayCtx.fillStyle = "#0e2d1a";
    drawGeographicPath(dayCtx, SRI_LANKA);
    dayCtx.fill();

    // Draw Andaman & Lakshadweep
    dayCtx.fillStyle = "#00FF88";
    const andaman = ((93 + 180) / 360) * width, andamanY = ((90 - 12) / 180) * height;
    dayCtx.fillRect(andaman, andamanY, 2, 6);
    const lakshadweep = ((72.5 + 180) / 360) * width, lakshadweepY = ((90 - 10) / 180) * height;
    dayCtx.fillRect(lakshadweep, lakshadweepY, 2, 3);

    // Coastline shallow water shelf outline
    dayCtx.strokeStyle = "rgba(0, 229, 255, 0.16)";
    dayCtx.lineWidth = 1.2;
    drawGeographicPath(dayCtx, INDIA_COAST);
    dayCtx.stroke();
    drawGeographicPath(dayCtx, SRI_LANKA);
    dayCtx.stroke();

    // Himalayas Snow
    const snowGrad = dayCtx.createLinearGradient(0, height * 0.32, 0, height * 0.38);
    snowGrad.addColorStop(0, "#e2efff");
    snowGrad.addColorStop(0.7, "#a0b5cd");
    snowGrad.addColorStop(1, "#0d1a10");
    dayCtx.fillStyle = snowGrad;
    dayCtx.beginPath();
    // Himalayan arc
    const pts = [[35, 74], [32, 78], [30, 84], [28.5, 90], [29, 96], [27.8, 96], [27, 90], [29, 84], [31, 78], [34, 74]];
    pts.forEach(([lat, lon], idx) => {
      const x = ((lon + 180) / 360) * width;
      const y = ((90 - lat) / 180) * height;
      if (idx === 0) dayCtx.moveTo(x, y);
      else dayCtx.lineTo(x, y);
    });
    dayCtx.closePath();
    dayCtx.fill();

    // Thar Desert
    dayCtx.fillStyle = "#3e321e";
    dayCtx.beginPath();
    const thar1 = toXY(28, 70), thar2 = toXY(24, 75), thar3 = toXY(27, 74);
    dayCtx.moveTo(thar1.x, thar1.y); dayCtx.lineTo(thar2.x, thar2.y); dayCtx.lineTo(thar3.x, thar3.y);
    dayCtx.fill();

    // Draw main rivers
    dayCtx.strokeStyle = "rgba(0, 229, 255, 0.28)";
    dayCtx.lineWidth = 0.5;
    // Ganges
    dayCtx.beginPath();
    const g1 = toXY(30, 78), g2 = toXY(25, 82), g3 = toXY(24, 88);
    dayCtx.moveTo(g1.x, g1.y); dayCtx.bezierCurveTo(g2.x, g2.y, g2.x + 10, g2.y + 10, g3.x, g3.y);
    dayCtx.stroke();
  }

  function toXY(lat: number, lon: number) {
    return { x: ((lon + 180)/360)*width, y: ((90-lat)/180)*height };
  }

  drawProceduralBase();

  // Night Map Canvas
  const nightCanvas = document.createElement("canvas");
  nightCanvas.width = width;
  nightCanvas.height = height;
  const nightCtx = nightCanvas.getContext("2d")!;
  nightCtx.fillStyle = "#020308";
  nightCtx.fillRect(0, 0, width, height);

  function drawCityLight(lat: number, lon: number, r: number, alpha: number) {
    const { x, y } = toXY(lat, lon);
    const grad = nightCtx.createRadialGradient(x, y, 0.5, x, y, r);
    grad.addColorStop(0, `rgba(255, 205, 55, ${alpha})`);
    grad.addColorStop(0.4, `rgba(255, 120, 0, ${alpha * 0.45})`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    nightCtx.fillStyle = grad;
    nightCtx.beginPath();
    nightCtx.arc(x, y, r, 0, Math.PI * 2);
    nightCtx.fill();
  }

  // Draw cities
  drawCityLight(19.0, 72.8, 9, 0.9);  // Mumbai
  drawCityLight(28.6, 77.2, 8.5, 0.9); // Delhi
  drawCityLight(12.9, 77.6, 8, 0.85); // Bangalore
  drawCityLight(13.0, 80.2, 6.5, 0.8); // Chennai
  drawCityLight(22.5, 88.3, 7, 0.8);  // Kolkata
  drawCityLight(35.6, 139.6, 12, 0.95); // Tokyo
  drawCityLight(31.2, 121.4, 10, 0.9);  // Shanghai
  drawCityLight(51.5, -0.12, 11, 0.9);  // London

  // Clouds Map Canvas
  const cloudsCanvas = document.createElement("canvas");
  cloudsCanvas.width = width;
  cloudsCanvas.height = height;
  const cloudsCtx = cloudsCanvas.getContext("2d")!;
  cloudsCtx.clearRect(0, 0, width, height);

  // Soft clouds
  for (let i = 0; i < 20; i++) {
    const cy = Math.random() * height;
    const r = 25 + Math.random() * 35;
    const grad = cloudsCtx.createRadialGradient(0, cy, 10, width, cy, r * 4);
    grad.addColorStop(0, "rgba(235, 245, 255, 0.22)");
    grad.addColorStop(0.6, "rgba(200, 225, 255, 0.08)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    cloudsCtx.fillStyle = grad;
    cloudsCtx.fillRect(0, cy - r, width, r * 2);
  }

  // Attempt to load NASA photorealistic textures dynamically
  const dayImg = new Image();
  dayImg.crossOrigin = "anonymous";
  dayImg.onload = () => {
    dayCtx.drawImage(dayImg, 0, 0, width, height);
    // Re-overlay detailed boundaries on top of the satellite image for a hybrid high-fidelity look
    dayCtx.strokeStyle = "rgba(0, 229, 255, 0.08)";
    dayCtx.lineWidth = 1.0;
    drawGeographicPath(dayCtx, INDIA_COAST);
    dayCtx.stroke();
    onLoadCallback();
  };
  // Fallback triggers if unpkg block
  dayImg.src = "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";

  const nightImg = new Image();
  nightImg.crossOrigin = "anonymous";
  nightImg.onload = () => {
    nightCtx.drawImage(nightImg, 0, 0, width, height);
    onLoadCallback();
  };
  nightImg.src = "https://unpkg.com/three-globe/example/img/earth-night-lights.jpg";

  const cloudsImg = new Image();
  cloudsImg.crossOrigin = "anonymous";
  cloudsImg.onload = () => {
    cloudsCtx.drawImage(cloudsImg, 0, 0, width, height);
    onLoadCallback();
  };
  cloudsImg.src = "https://unpkg.com/three-globe/example/img/earth-clouds.png";

  return { dayCanvas, nightCanvas, cloudsCanvas };
}

// ─── WebGL Fragment Shader with Volumetric Cyclone & Flash ────────────────────
const VS_SOURCE = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FS_SOURCE = `
  precision highp float;
  varying vec2 v_uv;
  
  uniform vec2 u_resolution;
  uniform float u_rotation;
  uniform float u_tilt;
  uniform vec3 u_light_dir;
  uniform float u_cloud_offset;
  uniform float u_time;
  uniform float u_scan;
  uniform float u_scale; // dynamic zoom scale
  
  uniform sampler2D u_day_texture;
  uniform sampler2D u_night_texture;
  uniform sampler2D u_clouds_texture;

  // Pseudo-random noise
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
               mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
  }

  void main() {
    vec2 uv = v_uv * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;
    
    // u_scale modifies the Earth visible diameter
    float R = u_scale;
    float dist = length(uv);
    
    if (dist <= R) {
      float z = sqrt(R * R - dist * dist);
      vec3 normal = normalize(vec3(uv.x, uv.y, z));
      
      float cosRot = cos(u_rotation);
      float sinRot = sin(u_rotation);
      float cosTilt = cos(u_tilt);
      float sinTilt = sin(u_tilt);
      
      // Rotate Y (longitudinal drift)
      vec3 nRot;
      nRot.x = normal.x * cosRot - normal.z * sinRot;
      nRot.y = normal.y;
      nRot.z = normal.x * sinRot + normal.z * cosRot;
      
      // Rotate X (axial tilt)
      vec3 nFinal;
      nFinal.x = nRot.x;
      nFinal.y = nRot.y * cosTilt - nRot.z * sinTilt;
      nFinal.z = nRot.y * sinTilt + nRot.z * cosTilt;
      
      float lon = atan(nFinal.x, nFinal.z);
      float lat = asin(nFinal.y);
      vec2 texUv = vec2((lon + 3.1415926) / 6.283185, (lat + 1.5707963) / 3.1415926);
      
      float intensity = dot(normal, normalize(u_light_dir));
      
      // Sample photorealistic textures
      vec4 dayCol = texture2D(u_day_texture, texUv);
      vec4 nightCol = texture2D(u_night_texture, texUv);
      
      // Nightlights blending with atmospheric scattering
      vec4 earthCol = mix(nightCol, dayCol, smoothstep(-0.15, 0.15, intensity));
      
      // Clouds mapping
      vec2 cloudUv = texUv + vec2(u_cloud_offset, 0.0);
      vec4 cloudCol = texture2D(u_clouds_texture, cloudUv);
      float cloudLit = mix(0.15, 1.0, smoothstep(-0.2, 0.2, intensity));
      earthCol.rgb = mix(earthCol.rgb, cloudCol.rgb * cloudLit, cloudCol.r * 0.65);
      
      // ─── Cyclone Michaung (Bay of Bengal) ───
      vec2 cycloneUv = vec2(0.7289, 0.4266);
      float cycDist = distance(texUv, cycloneUv);
      
      if (cycDist < 0.045) {
        vec2 diff = texUv - cycloneUv;
        float r = length(diff);
        float angle = atan(diff.y, diff.x);
        
        // High frequency fractal fluffiness
        float fbmNoise = noise(texUv * 350.0 + vec2(0.0, u_time * 3.5)) * 0.45 
                       + noise(texUv * 150.0 - vec2(u_time * 1.5, 0.0)) * 0.25;
        
        // Spiral equations
        float spiral = sin(angle * 3.0 - r * 130.0 + u_time * 4.0 + fbmNoise * 1.6);
        float boundary = smoothstep(0.045, 0.0, r);
        float vortex = smoothstep(0.05, 0.85, spiral) * boundary;
        
        // Hurricane eye
        float eye = smoothstep(0.004, 0.006, r);
        
        // precipitation radar bands (green/orange)
        float precip = smoothstep(0.55, 0.95, sin(angle * 3.0 - r * 100.0 + u_time * 4.0));
        vec3 radarCol = vec3(0.0, 0.96, 0.62); // neon green
        if (precip > 0.85 && r < 0.026) {
          radarCol = vec3(1.0, 0.66, 0.0); // orange peak cell
        }
        
        // Lightning triggers inside clouds
        float lightningFlash = step(0.985, fract(sin(u_time * 12.5 + r * 100.0) * 43758.5453));
        vec3 lightningCol = vec3(0.65, 0.9, 1.0) * lightningFlash * 1.6;
        
        // Blend storm cloud
        vec3 cloudColor = vec3(0.92, 0.96, 1.0) + lightningCol;
        // Apply radar rain color overlay
        vec3 stormFinalCol = mix(cloudColor * cloudLit, radarCol * 0.8, precip * 0.35);
        
        earthCol.rgb = mix(earthCol.rgb, stormFinalCol, vortex * eye * 0.95);
      }
      
      // Thin cyan GIS Grid overlay
      float latGrid = sin(lat * 12.0);
      float lonGrid = sin(lon * 12.0);
      float gridIntensity = smoothstep(0.975, 0.99, max(latGrid, lonGrid));
      earthCol.rgb = mix(earthCol.rgb, vec3(0.0, 0.9, 1.0), gridIntensity * 0.15);
      
      // HUD scan beam sweep
      float scanDist = abs(uv.y - u_scan);
      if (scanDist < 0.015) {
        earthCol.rgb += vec3(0.0, 0.52, 0.6) * (1.0 - scanDist / 0.015) * 0.65;
      }
      
      gl_FragColor = vec4(earthCol.rgb, 1.0);
      
    } else {
      // Atmospheric scattering rim glow
      float glow = smoothstep(R * 1.25, R, dist);
      if (glow > 0.0) {
        vec3 atmosCol = vec3(0.0, 0.82, 1.0);
        gl_FragColor = vec4(atmosCol * pow(glow, 4.0) * 0.65, 1.0);
      } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
      }
    }
  }
`;

export default function GeospatialViewer({ mode, isPlaying }: GeospatialViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // States and refs
  const [zoomScale, setZoomScale] = useState(0.65); // default zoom
  const timeRef = useRef(0);
  const rotationRef = useRef(-0.48); // centers Indian Ocean
  const scanPosition = useRef(-1.0);
  
  // HUD tracking
  const [hudCoords, setHudCoords] = useState({ sx: 0, sy: 0, visible: false });
  const [hudMetrics, setHudMetrics] = useState({
    pressure: 968,
    wind: 165,
    temp: 28.4
  });

  // Wind vectors orbiting the cyclone
  const [windParticles, setWindParticles] = useState<{ angle: number; r: number; speed: number }[]>([]);

  useEffect(() => {
    // Generate orbiting wind particles around the cyclone
    const particles = Array.from({ length: 18 }, () => ({
      angle: Math.random() * Math.PI * 2,
      r: 25 + Math.random() * 40, // distance in pixels
      speed: 0.05 + Math.random() * 0.06
    }));
    setWindParticles(particles);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl");
    if (!gl) return;

    // WebGL Init
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, VS_SOURCE);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, FS_SOURCE);
    gl.compileShader(fs);

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Quad geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Textures init
    const { dayCanvas, nightCanvas, cloudsCanvas } = buildProceduralEarthTextures(() => {
      // Re-upload when image load triggers
      uploadTextures();
    });

    let dayTex: WebGLTexture, nightTex: WebGLTexture, cloudsTex: WebGLTexture;

    function uploadTextures() {
      if (!gl) return;
      dayTex = createGLTexture(dayCanvas, 0, "u_day_texture");
      nightTex = createGLTexture(nightCanvas, 1, "u_night_texture");
      cloudsTex = createGLTexture(cloudsCanvas, 2, "u_clouds_texture");
    }

    function createGLTexture(source: HTMLCanvasElement, index: number, name: string) {
      const texture = gl.createTexture()!;
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      
      const loc = gl.getUniformLocation(program, name);
      gl.uniform1i(loc, index);
      return texture;
    }

    uploadTextures();

    // Uniform locations
    const resLoc = gl.getUniformLocation(program, "u_resolution");
    const rotLoc = gl.getUniformLocation(program, "u_rotation");
    const tiltLoc = gl.getUniformLocation(program, "u_tilt");
    const lightLoc = gl.getUniformLocation(program, "u_light_dir");
    const cloudOffsetLoc = gl.getUniformLocation(program, "u_cloud_offset");
    const timeLoc = gl.getUniformLocation(program, "u_time");
    const scanLoc = gl.getUniformLocation(program, "u_scan");
    const scaleLoc = gl.getUniformLocation(program, "u_scale");

    let animationId: number;
    let prev = performance.now();

    function render(now: number) {
      const dt = (now - prev) / 1000;
      prev = now;

      if (isPlaying) {
        timeRef.current += dt;
        rotationRef.current += dt * 0.003; // slow cinematic rotation drift
        scanPosition.current += dt * 0.32;  // scan line loops
        if (scanPosition.current > 1.25) {
          scanPosition.current = -1.25;
        }

        // Animate wind particles
        setWindParticles(parts => 
          parts.map(p => ({
            ...p,
            angle: p.angle - p.speed * 0.25 // clockwise spin
          }))
        );
      }

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Bind uniforms
      gl.uniform2f(resLoc, gl.canvas.width, gl.canvas.height);
      gl.uniform1f(rotLoc, rotationRef.current);
      gl.uniform1f(tiltLoc, 0.4); // constant geostationary perspective tilt
      gl.uniform3f(lightLoc, -0.7, 0.3, 0.8); // daylight direction vector
      gl.uniform1f(cloudOffsetLoc, timeRef.current * 0.005);
      gl.uniform1f(timeLoc, timeRef.current);
      gl.uniform1f(scanLoc, scanPosition.current);
      gl.uniform1f(scaleLoc, zoomScale);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Compute Cyclone coordinates in WebGL projection space
      const cx = gl.canvas.width / 2;
      const cy = gl.canvas.height / 2;
      const scale = gl.canvas.height * zoomScale; // locks to sphere zoom
      
      const latRad = (13.2 * Math.PI) / 180;
      const lonRad = (82.4 * Math.PI) / 180;

      const cosRot = Math.cos(rotationRef.current);
      const sinRot = Math.sin(rotationRef.current);
      const cosTilt = Math.cos(0.4);
      const sinTilt = Math.sin(0.4);

      // Point coordinates on sphere
      const vx = Math.cos(latRad) * Math.sin(lonRad);
      const vy = Math.sin(latRad);
      const vz = Math.cos(latRad) * Math.cos(lonRad);

      // Sphere Y rotation
      const x1 = vx * cosRot + vz * sinRot;
      const z1 = -vx * sinRot + vz * cosRot;

      // Sphere X tilt rotation
      const y2 = vy * cosTilt + z1 * sinTilt;
      const z2 = -vy * sinTilt + z1 * cosTilt;

      if (z2 > 0) {
        setHudCoords({
          sx: cx + x1 * scale,
          sy: cy - y2 * scale,
          visible: true
        });
      } else {
        setHudCoords(h => ({ ...h, visible: false }));
      }

      // Live metrics drift
      if (Math.random() < 0.035) {
        setHudMetrics({
          pressure: 968 + Math.floor((Math.random() - 0.5) * 4),
          wind: 165 + Math.floor((Math.random() - 0.5) * 6),
          temp: 28.4 + (Math.random() - 0.5) * 0.6
        });
      }

      animationId = requestAnimationFrame(render);
    }

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteTexture(dayTex);
      gl.deleteTexture(nightTex);
      gl.deleteTexture(cloudsTex);
    };
  }, [isPlaying, zoomScale]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      
      {/* 3D WebGL Sphere Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={480}
        style={{ width: "100%", height: "100%", display: "block" }}
      />

      {/* ─── Holographic Overlay ─── */}
      {hudCoords.visible && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }}>
          
          {/* Target lock box on Cyclone Eye */}
          <div 
            style={{ 
              position: "absolute", 
              left: hudCoords.sx - 38, 
              top: hudCoords.sy - 38, 
              width: 76, 
              height: 76, 
              border: "1px dashed #FF4B6E", 
              boxShadow: "0 0 12px rgba(255, 75, 110, 0.25)"
            }}
          >
            <div style={{ position: "absolute", top: -2, left: -2, width: 8, height: 8, borderTop: "2px solid #FF4B6E", borderLeft: "2px solid #FF4B6E" }} />
            <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderTop: "2px solid #FF4B6E", borderRight: "2px solid #FF4B6E" }} />
            <div style={{ position: "absolute", bottom: -2, left: -2, width: 8, height: 8, borderBottom: "2px solid #FF4B6E", borderLeft: "2px solid #FF4B6E" }} />
            <div style={{ position: "absolute", bottom: -2, right: -2, width: 8, height: 8, borderBottom: "2px solid #FF4B6E", borderRight: "2px solid #FF4B6E" }} />

            {/* Target core crosshair */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 4, height: 4, borderRadius: "50%", background: "#FF4B6E", animation: "pulse-dot 1.5s infinite" }} />
          </div>

          {/* Orbiting Wind Vector Particles */}
          {windParticles.map((wp, i) => {
            const wx = hudCoords.sx + Math.cos(wp.angle) * wp.r;
            const wy = hudCoords.sy + Math.sin(wp.angle) * wp.r;
            return (
              <div 
                key={i} 
                style={{
                  position: "absolute",
                  left: wx,
                  top: wy,
                  width: 3,
                  height: 3,
                  background: "#00E5FF",
                  borderRadius: "50%",
                  boxShadow: "0 0 4px #00E5FF",
                  opacity: 0.8
                }}
              />
            );
          })}

          {/* Dotted target trajectory forecast path */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            {/* Cone pathway */}
            <path 
              d={`M ${hudCoords.sx} ${hudCoords.sy} Q ${hudCoords.sx - 80} ${hudCoords.sy - 80} ${hudCoords.sx - 150} ${hudCoords.sy - 120}`} 
              fill="none" 
              stroke="#FFAA00" 
              strokeWidth="12" 
              strokeLinecap="round"
              opacity="0.1" 
            />
            {/* Core dotted line */}
            <path 
              d={`M ${hudCoords.sx} ${hudCoords.sy} Q ${hudCoords.sx - 80} ${hudCoords.sy - 80} ${hudCoords.sx - 150} ${hudCoords.sy - 120}`} 
              fill="none" 
              stroke="#FFAA00" 
              strokeWidth="1.5" 
              strokeDasharray="4, 4" 
            />
            {/* Historical trajectory */}
            <path 
              d={`M ${hudCoords.sx} ${hudCoords.sy} Q ${hudCoords.sx + 60} ${hudCoords.sy + 60} ${hudCoords.sx + 100} ${hudCoords.sy + 120}`} 
              fill="none" 
              stroke="rgba(255,255,255,0.4)" 
              strokeWidth="1.5" 
              strokeDasharray="2, 3" 
            />
          </svg>

          {/* Telemetry data side panel */}
          <div 
            style={{ 
              position: "absolute", 
              left: hudCoords.sx + 50, 
              top: hudCoords.sy - 60,
              padding: "12px 14px",
              width: 195,
              background: "rgba(8,18,32,0.72)",
              border: "1px solid rgba(0, 229, 255, 0.25)",
              backdropFilter: "blur(8px)",
              borderRadius: 6,
              boxShadow: "0 4px 20px rgba(0, 229, 255, 0.12)"
            }}
          >
            <div style={{ fontSize: 10, color: "#FF4B6E", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
              <AlertTriangle size={11} /> TARGET: CYCLONE_MICHAUNG
            </div>
            {[
              ["Geo-Coordinates", "13.20°N, 82.40°E"],
              ["Cyclone Category", "CAT-3 SUSTAINED"],
              ["Max Wind Velocity", `${hudMetrics.wind} KM/H`],
              ["Minimum Pressure", `${hudMetrics.pressure} hPa`],
              ["Sea Temp anomaly", `+${hudMetrics.temp}°C`],
              ["AI Confidence", "94.20%"],
              ["Fidelity Gate", mode.toUpperCase()]
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4.5 }}>
                <span style={{ fontSize: 9.5, color: "#64748B" }}>{l}</span>
                <span style={{ fontSize: 9.5, color: "#E2E8F0", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* SVG Connector link */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            <line x1={hudCoords.sx} y1={hudCoords.sy} x2={hudCoords.sx + 50} y2={hudCoords.sy - 25} stroke="rgba(0, 229, 255, 0.45)" strokeWidth="1" strokeDasharray="3, 3" />
          </svg>
        </div>
      )}

      {/* ─── Zoom and controls panel ─── */}
      <div 
        style={{ 
          position: "absolute", 
          top: 12, 
          right: 12, 
          display: "flex", 
          flexDirection: "column", 
          gap: 6,
          pointerEvents: "auto",
          zIndex: 15
        }}
      >
        <button 
          onClick={() => setZoomScale(z => Math.min(1.0, z + 0.05))} 
          style={{ width: 28, height: 28, background: "rgba(5, 10, 24, 0.72)", border: "1px solid rgba(0,229,255,0.25)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#00E5FF" }}
          className="hover:bg-cyan-950/40 active:scale-95"
        >
          <ZoomIn size={14} />
        </button>
        <button 
          onClick={() => setZoomScale(z => Math.max(0.45, z - 0.05))} 
          style={{ width: 28, height: 28, background: "rgba(5, 10, 24, 0.72)", border: "1px solid rgba(0,229,255,0.25)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#00E5FF" }}
          className="hover:bg-cyan-950/40 active:scale-95"
        >
          <ZoomOut size={14} />
        </button>
      </div>

      {/* ─── HUD Metadata overlay ─── */}
      <div 
        style={{ 
          position: "absolute", 
          bottom: 12, 
          left: 12, 
          right: 12, 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          pointerEvents: "none"
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ background: "rgba(5, 10, 24, 0.72)", border: "1px solid rgba(0, 229, 255, 0.18)", backdropFilter: "blur(6px)", padding: "5px 12px", borderRadius: 4 }}>
            <span style={{ fontSize: 9, color: "#64748B", fontFamily: "'JetBrains Mono', monospace" }}>TELEMETRY_SOURCE: </span>
            <span style={{ fontSize: 9.5, color: "#00E5FF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>INSAT-3DS [GEOPHOTO]</span>
          </div>
          <div style={{ background: "rgba(5, 10, 24, 0.72)", border: "1px solid rgba(0, 229, 255, 0.18)", backdropFilter: "blur(6px)", padding: "5px 12px", borderRadius: 4 }}>
            <span style={{ fontSize: 9, color: "#64748B", fontFamily: "'JetBrains Mono', monospace" }}>ORBIT_LINK: </span>
            <span style={{ fontSize: 9.5, color: "#00E5FF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>GEO_82.0°E_ALTITUDE_35K</span>
          </div>
        </div>

        <div style={{ background: "rgba(5, 10, 24, 0.72)", border: "1px solid rgba(0, 229, 255, 0.18)", backdropFilter: "blur(6px)", padding: "5px 12px", borderRadius: 4 }}>
          <span style={{ fontSize: 9, color: "#64748B", fontFamily: "'JetBrains Mono', monospace" }}>GRID: </span>
          <span style={{ fontSize: 9.5, color: "#00F5A0", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>GIS_WGS84_RADIAL</span>
        </div>
      </div>

    </div>
  );
}
