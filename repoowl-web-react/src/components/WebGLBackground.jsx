import { useEffect, useRef } from 'react';

// ── Shaders (copied verbatim from assets/webgl_bg/script.js) ──────
const VERT_SRC = `
attribute vec2 aPos; varying vec2 vUV;
void main(){ vUV=0.5*(aPos+1.0); gl_Position=vec4(aPos,0.0,1.0); }
`;

const FRAG_SRC = `
#ifdef GL_ES
precision mediump float;
#endif
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
uniform vec2  iResolution;
uniform float iTime;
uniform vec2  iMouse;
uniform sampler2D iChannel0;

uniform float uCell, uAmp, uChrom, uSpeed, uAnimate;
uniform int   uShape;
uniform vec2  uUVOffset;
uniform float uUVScale, uWireframe, uEnableRipple, uEnableParallax, uUseMouseLight;
uniform vec2  uRippleC;
uniform float uRippleT;

varying vec2 vUV;

vec2 hex_pixel_to_axial(vec2 p, float s){
  float q = (1.7320508/3.0*p.x - 0.3333333*p.y)/s;
  float r = (0.6666667*p.y)/s;
  return vec2(q,r);
}
vec3 cube_round(vec3 c){
  float rx=floor(c.x+0.5), ry=floor(c.y+0.5), rz=floor(c.z+0.5);
  float dx=abs(rx-c.x), dy=abs(ry-c.y), dz=abs(rz-c.z);
  if(dx>dy && dx>dz) rx=-ry-rz; else if(dy>dz) ry=-rx-rz; else rz=-rx-ry;
  return vec3(rx,ry,rz);
}
vec2 hex_axial_round(vec2 qr){
  vec3 cube=vec3(qr.x, -qr.x-qr.y, qr.y);
  vec3 rc=cube_round(cube);
  return vec2(rc.x, rc.z);
}
vec2 hex_axial_to_pixel(vec2 qr, float s){
  float x=s*(1.7320508*qr.x + 0.8660254*qr.y);
  float y=s*(1.5*qr.y);
  return vec2(x,y);
}

float sdHex(vec2 p, float r){
  p=abs(p);
  return max(dot(p, normalize(vec2(1.0,1.7320508))) - r, p.x - r);
}
float sdBox(vec2 p, vec2 b){ vec2 d = abs(p)-b; return max(d.x,d.y); }
float sdCircle(vec2 p, float r){ return length(p)-r; }
float sdTriIso(vec2 p, float r){
  const float k = 1.7320508;
  p.x = abs(p.x) - r;
  p.y = p.y + r/k;
  if(p.x + k*p.y > 0.0){
    p = vec2(p.x - k*p.y, -k*p.x - p.y)/2.0;
  }
  p.x -= clamp(p.x, -2.0*r, 0.0);
  return -length(p)*sign(p.y);
}

void nearestCenter(int shape, vec2 p, float cell, out vec2 c, out vec2 lp){
  if(shape==0){
    vec2 qr  = hex_pixel_to_axial(p, cell);
    vec2 qrr = hex_axial_round(qr);
    c = hex_axial_to_pixel(qrr, cell);
    lp = p - c;
  } else if(shape==3){
    vec2 e1 = vec2(cell, 0.0);
    vec2 e2 = vec2(cell*0.5, cell*0.8660254);
    float det = e1.x*e2.y - e1.y*e2.x;
    vec2 k;
    k.x = ( p.x*e2.y - p.y*e2.x) / det;
    k.y = (-p.x*e1.y + p.y*e1.x) / det;
    vec2 kR = floor(k + 0.5);
    c = e1*kR.x + e2*kR.y;
    lp = p - c;
  } else {
    vec2 g = floor(p/cell + 0.5);
    c = g * cell;
    lp = p - c;
  }
}

float shapeSDF(int shape, vec2 lp, float cell){
  if(shape==0){ return sdHex(lp, cell*0.95); }
  if(shape==1){ return sdBox(lp, vec2(cell*0.5)); }
  if(shape==2){
    float a = 0.78539816339;
    mat2 R = mat2(cos(a), -sin(a), sin(a), cos(a));
    return sdBox(R*lp, vec2(cell*0.5));
  }
  if(shape==3){ return sdTriIso(lp, cell*0.6); }
  return sdCircle(lp, cell*0.55);
}

vec3 sampleImage(vec2 uv) {
  // Mathematically mirror UVs to fix edge tiling artifacts on NPOT textures
  vec2 mirroredUV = abs(mod(uv, 2.0) - 1.0);
  return texture2D(iChannel0, mirroredUV).rgb;
}

void main(){
  vec2 res=iResolution, frag=gl_FragCoord.xy, p=frag-0.5*res, uv=vUV;
  vec2 mouse=iMouse; bool hasMouse=(mouse.x>=0.0 && mouse.y>=0.0); vec2 mp=mouse-0.5*res;

  vec2 par=vec2(0.0);
  if(uEnableParallax>0.01 && hasMouse){ par=(mp/max(res.x,res.y))*0.05*uEnableParallax; }
  vec2 uvw=(uv-0.5)/max(1.0e-3,uUVScale) + uUVOffset + 0.5 + par;

  float cell=max(6.0,uCell);
  float t=iTime*uSpeed;
  float wave=(uAnimate>0.5)?(sin(p.x*0.01 + p.y*0.015 + t)*0.25):0.0;
  float localCell=cell*(1.0+wave*0.2);

  vec2 c, lp; nearestCenter(uShape, p, localCell, c, lp);
  float d = shapeSDF(uShape, lp, localCell);
  float inside = smoothstep(0.0, 1.5, -d);

  float rad = clamp(length(lp) / (localCell*0.95), 0.0, 1.0);
  vec2 n = normalize(lp + 1e-6);

  float ripple=0.0; vec2 rippleDir=vec2(0.0);
  if(uEnableRipple>0.5 && uRippleC.x>=0.0){
    vec2 cp=uRippleC-0.5*res; float R=length(p-cp); float dt=max(0.0,iTime-uRippleT);
    float env=exp(-R*0.006)*exp(-dt*1.0); ripple=sin(R*0.06 - dt*6.0)*env;
    rippleDir=normalize(p-cp+1e-6);
  }

  vec3 base=sampleImage(uvw);
  float strength=uAmp*(1.0-pow(rad,1.4))*0.07;
  vec2 refr=n*strength + rippleDir*(0.02*ripple);

  vec2 ca=refr*(0.25*uChrom); float ca2=0.6*uChrom;
  vec3 glass;
  glass.r=sampleImage(uvw+refr+ca).r;
  glass.g=sampleImage(uvw+refr).g;
  glass.b=sampleImage(uvw+refr-ca*ca2).b;

  vec2 L=(uUseMouseLight>0.01 && hasMouse)?normalize(mp):normalize(vec2(0.7,1.0));
  float spec=pow(max(0.0,dot(normalize(L),n)),14.0)*(1.0-rad);
  glass+=vec3(1.0,0.96,0.9)*spec*0.45;

  vec3 col=mix(base,glass,inside);

  float vign=smoothstep(1.2,0.2,length((frag-0.5*res)/res.y));
  col*=mix(0.9,1.0,vign);
  gl_FragColor=vec4(col,1.0);
}
`;

// ── Fixed render settings (no UI controls needed) ─────────────────
const CONFIG = {
  cell: 52,
  amp: 0.6,
  chrom: 0.7,
  speed: 0.8,
  shape: 0, // hexagon
  videoSrc: 'https://img.blacklead.work/blacklead-fish.mp4',
};

function compileShader(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error('Shader error:', gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

export default function WebGLBackground({ style = {} }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) { console.warn('WebGL not supported'); return; }

    // ── Resize (HiDPI aware) ──────────────────────────────────────
    const resize = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const rect = canvas.getBoundingClientRect();
      const w = Math.floor(rect.width * dpr);
      const h = Math.floor(rect.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // ── Compile & link shaders ────────────────────────────────────
    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    // ── Fullscreen quad ───────────────────────────────────────────
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]),
      gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // ── Uniforms ──────────────────────────────────────────────────
    const uRes   = gl.getUniformLocation(prog, 'iResolution');
    const uTime  = gl.getUniformLocation(prog, 'iTime');
    const uMouse = gl.getUniformLocation(prog, 'iMouse');
    const uCell  = gl.getUniformLocation(prog, 'uCell');
    const uAmp   = gl.getUniformLocation(prog, 'uAmp');
    const uChrom = gl.getUniformLocation(prog, 'uChrom');
    const uSpeed = gl.getUniformLocation(prog, 'uSpeed');
    const uAnim  = gl.getUniformLocation(prog, 'uAnimate');
    const uUVOff = gl.getUniformLocation(prog, 'uUVOffset');
    const uUVSc  = gl.getUniformLocation(prog, 'uUVScale');
    const uWf    = gl.getUniformLocation(prog, 'uWireframe');
    const uRipEn = gl.getUniformLocation(prog, 'uEnableRipple');
    const uPar   = gl.getUniformLocation(prog, 'uEnableParallax');
    const uML    = gl.getUniformLocation(prog, 'uUseMouseLight');
    const uRipC  = gl.getUniformLocation(prog, 'uRippleC');
    const uRipT  = gl.getUniformLocation(prog, 'uRippleT');
    const uShape = gl.getUniformLocation(prog, 'uShape');
    const uTex0  = gl.getUniformLocation(prog, 'iChannel0');
    gl.uniform1i(uTex0, 0);

    // ── Texture (1×1 placeholder) — MIRRORED_REPEAT kills left-edge seam ──
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([30, 30, 30, 255]));

    // ── Video texture — ping-pong (forward then reverse) ─────────────
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = CONFIG.videoSrc;
    video.muted = true;
    video.loop = false;       // we control playback manually
    video.playsInline = true;
    video.preload = 'auto';
    let videoReady = false;
    video.addEventListener('canplay', () => {
      videoReady = true;
      video.currentTime = 0.1; // Seek slightly to ensure a good static frame is decoded
    });

    // ── Ripple state (click to create ripple) ─────────────────────
    let rippleC = [-1, -1];
    let rippleT = 0;
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const x = (e.clientX - rect.left) * dpr;
      const y = canvas.height - (e.clientY - rect.top) * dpr;
      rippleC = [x, y];
      rippleT = performance.now() * 0.001;
    };
    canvas.addEventListener('click', handleClick);

    // ── Intersection Observer (Performance) ───────────────────────
    let isVisible = false;
    let rafId = null;

    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
      if (isVisible && !rafId) {
        rafId = requestAnimationFrame(draw);
      }
    }, { threshold: 0 });
    observer.observe(canvas);

    // ── Render loop ───────────────────────────────────────────────
    const draw = (tms) => {
      if (!isVisible) {
        rafId = null;
        return; // Break loop when not visible
      }
      rafId = requestAnimationFrame(draw);
      
      resize();
      const t = tms * 0.001;

      // Upload frame to WebGL texture as long as we have data
      if (videoReady && video.readyState >= 2) {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      }

      gl.useProgram(prog);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, -1, -1);   // no mouse tracking for bg
      gl.uniform1f(uCell, CONFIG.cell);
      gl.uniform1f(uAmp, CONFIG.amp);
      gl.uniform1f(uChrom, CONFIG.chrom);
      gl.uniform1f(uSpeed, CONFIG.speed);
      gl.uniform1f(uAnim, 1.0);
      gl.uniform2f(uUVOff, 0, 0);
      gl.uniform1f(uUVSc, 1.0);
      gl.uniform1f(uWf, 0.0);
      gl.uniform1f(uRipEn, 1.0);
      gl.uniform1f(uPar, 0.0);
      gl.uniform1f(uML, 0.0);
      gl.uniform2f(uRipC, rippleC[0], rippleC[1]);
      gl.uniform1f(uRipT, rippleT);
      gl.uniform1i(uShape, CONFIG.shape);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      canvas.removeEventListener('click', handleClick);
      try { video.pause(); } catch (_) {}
      gl.deleteProgram(prog);
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        ...style,
      }}
    />
  );
}
