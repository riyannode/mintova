"use client";

import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uMouse;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = (gl_FragCoord.xy - uResolution * 0.5) / min(uResolution.x, uResolution.y);

  // Breathing pulse
  float pulse = sin(uTime * 0.3) * 0.5 + 0.5;

  // Lattice grid
  float grid = 0.0;
  float scale = 20.0;
  vec2 gp = p * scale;
  vec2 id = floor(gp);
  vec2 f = fract(gp);

  // Sparse anchors
  float anchor = step(0.92, hash(id));
  float d = length(f - 0.5);
  grid += anchor * smoothstep(0.3, 0.0, d) * 0.6;

  // Line trails (horizontal + vertical)
  float lineH = smoothstep(0.02, 0.0, abs(f.y - 0.5));
  float lineV = smoothstep(0.02, 0.0, abs(f.x - 0.5));
  float lineMask = step(0.7, hash(id));
  grid += (lineH + lineV) * lineMask * 0.15;

  // Pointer drift
  vec2 mouse = uMouse * 0.5;
  float drift = length(p - mouse) * 0.3;
  grid *= 1.0 - drift * 0.5;

  // Fade edges
  float vignette = 1.0 - length(p) * 0.6;
  grid *= vignette * pulse;

  // Color: subtle coral/violet tint
  vec3 color = mix(
    vec3(0.035, 0.039, 0.055),  // dark base
    vec3(0.06, 0.05, 0.08),     // subtle violet
    grid * 0.8
  );
  color += vec3(1.0, 0.42, 0.33) * grid * 0.08; // coral tint on lattice

  gl_FragColor = vec4(color, 1.0);
}`;

export function WebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: false });
    if (!gl) return;

    function compile(type: number, source: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, source);
      gl!.compileShader(s);
      return s;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uResolution");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");

    let mouse = [0.5, 0.5];
    const onMove = (e: MouseEvent) => {
      mouse = [e.clientX / window.innerWidth, 1.0 - e.clientY / window.innerHeight];
    };
    window.addEventListener("mousemove", onMove);

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }
    resize();
    window.addEventListener("resize", resize);

    let raf: number;
    const start = performance.now();
    function frame() {
      const t = (performance.now() - start) / 1000;
      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
      gl!.uniform1f(uTime, t);
      gl!.uniform2f(uMouse, mouse[0], mouse[1]);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(frame);
    }
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  );
}
