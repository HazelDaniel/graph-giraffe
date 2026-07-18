import { useEffect, useRef, useCallback, useState } from "react";
import gsap from "gsap";

const PARTICLE_COLS = 4;
const PARTICLE_ROWS = 12;

const VERTEX_SRC = /* glsl */ `#version 300 es
  layout(location = 0) in vec2 aPosition;   // unit quad, -0.5..0.5
  layout(location = 1) in vec2 aQuadUv;     // 0..1 across the quad
  layout(location = 2) in vec2 aCellOffset; // this particle's pixel-space center
  layout(location = 3) in vec2 aUvOffset;   // this particle's UV patch origin
  layout(location = 4) in vec3 aRandom;     // angle, delay, speed variance

  uniform vec2 uResolution;
  uniform vec2 uCellSize;
  uniform vec2 uBlockUvSize;
  uniform float uProgress;
  uniform float uMode;         // 0 = outgoing, 1 = incoming
  uniform float uScatterDist;

  out vec2 vUv;
  out float vAlpha;

  float easeInCubic(float t) { return t * t * t; }
  float easeOutCubic(float t) { float f = t - 1.0; return f * f * f + 1.0; }

  void main() {
    vUv = aUvOffset + aQuadUv * uBlockUvSize;

    float delay = aRandom.y * 0.5;
    float localT = clamp((uProgress - delay) / (1.0 - delay), 0.0, 1.0);
    vec2 dir = vec2(cos(aRandom.x * 6.28318), sin(aRandom.x * 6.28318));

    vec2 pos = aCellOffset + aPosition * uCellSize;

    if (uMode < 0.5) {
      float eased = easeInCubic(localT);
      pos += dir * eased * uScatterDist * (0.4 + aRandom.z);
      vAlpha = 1.0 - eased;
    } else {
      float eased = easeOutCubic(localT);
      pos += mix(dir * uScatterDist * (0.4 + aRandom.z), vec2(0.0), eased);
      vAlpha = eased;
    }

    // pixel space -> clip space, no matrix library needed for a static ortho view
    vec2 clip = (pos / uResolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, clip.y, 0.0, 1.0);
  }
`;

const FRAGMENT_SRC = /* glsl */ `#version 300 es
  precision highp float;
  in vec2 vUv;
  in float vAlpha;
  uniform sampler2D uTexture;
  out vec4 fragColor;

  void main() {
    if (vAlpha < 0.01) discard;
    vec4 texColor = texture(uTexture, vUv);
    fragColor = vec4(texColor.rgb, texColor.a * vAlpha);
  }
`;

function compileShader(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${info}`);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Program link error: ${gl.getProgramInfoLog(program)}`);
  }
  return program;
}

// One VAO per image: static per-particle instance data (cell offset,
// uv offset, random) + a shared unit-quad geometry.
function buildParticleVAO(
  gl: WebGL2RenderingContext,
  width: number,
  height: number
) {
  const cellW = width / PARTICLE_COLS;
  const cellH = height / PARTICLE_ROWS;
  const count = PARTICLE_COLS * PARTICLE_ROWS;

  const quadPos = new Float32Array([
    -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5,
  ]);
  const quadUv = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);

  const cellOffsets = new Float32Array(count * 2);
  const uvOffsets = new Float32Array(count * 2);
  const randoms = new Float32Array(count * 3);

  let i = 0;
  for (let row = 0; row < PARTICLE_ROWS; row++) {
    for (let col = 0; col < PARTICLE_COLS; col++) {
      cellOffsets[i * 2] = (col + 0.5) * cellW;
      cellOffsets[i * 2 + 1] = (row + 0.5) * cellH;
      uvOffsets[i * 2] = col / PARTICLE_COLS;
      uvOffsets[i * 2 + 1] = row / PARTICLE_ROWS;
      randoms[i * 3] = Math.random();
      randoms[i * 3 + 1] = Math.random();
      randoms[i * 3 + 2] = Math.random();
      i++;
    }
  }

  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);

  const bindAttrib = (
    data: Float32Array,
    loc: number,
    size: number,
    divisor: number
  ) => {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    if (divisor) gl.vertexAttribDivisor(loc, divisor);
  };

  bindAttrib(quadPos, 0, 2, 0);
  bindAttrib(quadUv, 1, 2, 0);
  bindAttrib(cellOffsets, 2, 2, 1); // per-instance
  bindAttrib(uvOffsets, 3, 2, 1); // per-instance
  bindAttrib(randoms, 4, 3, 1); // per-instance

  gl.bindVertexArray(null);
  return { vao, count };
}

function loadTexture(
  gl: WebGL2RenderingContext,
  src: string,
  canvas: HTMLCanvasElement
): Promise<WebGLTexture> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.style.objectFit = "cover";
    const tmpCanvas: HTMLCanvasElement = document.createElement("canvas");

    img.crossOrigin = "anonymous";
    img.onload = () => {
      (tmpCanvas.width = canvas.width), (tmpCanvas.height = canvas.height);
      const tmpCtx = tmpCanvas.getContext("2d")!;
      tmpCtx.drawImage(img, 0, 0, tmpCanvas.width, tmpCanvas.height);

      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        tmpCanvas
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      resolve(tex);
    };
    img.onerror = reject;
    img.src = src;
  });
}

interface Props {
  images: {mobile: string; desktop: string}[];
  activeIndex: number;
  parentRef: React.RefObject<HTMLElement | null>;
  width?: number;
  height?: number;
  renderCount: number;
  setRenderCount: React.Dispatch<React.SetStateAction<number>>;
}

export default function GLAnimatedFrame({
  images,
  activeIndex,
  parentRef,
  setRenderCount,
  renderCount,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const vaoRef = useRef<{ vao: WebGLVertexArrayObject; count: number } | null>(
    null
  );
  const texturesRef = useRef<WebGLTexture[]>([]);
  const uniformLocsRef = useRef<Record<string, WebGLUniformLocation | null>>(
    {}
  );
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const activeIndexRef = useRef(activeIndex);
  const [refUpdateCountState, setRefUpdateCountState] = useState<{
    canvasRefUpdateCount: number;
    glRefUpdateCount: number;
    parentRefUpdatecount: number;
  }>({ canvasRefUpdateCount: 0, glRefUpdateCount: 0, parentRefUpdatecount: 0 });

  useEffect(() => {
    setRenderCount((prev) => prev + 1);
  }, [parentRef]);

  useEffect(() => {
    // console.log(!canvasRef?.current, !parentRef?.current, !glRef?.current);
    if (!canvasRef?.current || !parentRef?.current || !glRef?.current) return;
    const gl = glRef.current;

    if (
      refUpdateCountState.canvasRefUpdateCount +
        refUpdateCountState.glRefUpdateCount +
        refUpdateCountState.parentRefUpdatecount >
      1
    )
      return;

    window.addEventListener("resize", () => {
      if (!canvasRef?.current) return;
      canvasRef.current.width = canvasRef.current.clientWidth;
      canvasRef.current.height = canvasRef.current.clientHeight;

      // let { width: width_, height: height_ } = getComputedStyle(
      //   parentRef.current
      // );
      // let width = parseInt(width_),
      //   height = parseInt(height_);

      // console.log(
      //   width,
      //   height,
      //   canvasRef.current.width,
      //   canvasRef.current.height
      // );

      // gl.viewport(0, 0, width, height);
      gl.viewport(0, 0, canvasRef.current.width, canvasRef.current.height);
      setRenderCount((prev) => prev + 1);
    });
  }, [refUpdateCountState]);

  const render = useCallback(
    (fromIdx: number | null, toIdx: number, progress: number) => {
      if (!parentRef?.current || !canvasRef?.current) return;

      const gl = glRef.current!;
      const program = programRef.current!;
      const { vao, count } = vaoRef.current!;
      const u = uniformLocsRef.current;

      let { width: width_, height: height_ } = getComputedStyle(
        parentRef.current
      );
      let width = parseInt(width_),
        height = parseInt(height_);

      if (
        canvasRef.current.width !== canvasRef.current.clientWidth ||
        canvasRef.current.height !== canvasRef.current.clientHeight
      ) {
        canvasRef.current.width = canvasRef.current.clientWidth;
        canvasRef.current.height = canvasRef.current.clientHeight;
      }

      gl.viewport(0, 0, width, height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.uniform2f(u.uResolution, width, height);
      gl.uniform2f(u.uCellSize, width / PARTICLE_COLS, height / PARTICLE_ROWS);
      gl.uniform2f(u.uBlockUvSize, 1 / PARTICLE_COLS, 1 / PARTICLE_ROWS);
      gl.uniform1f(u.uScatterDist, Math.max(width, height) * 0.25);

      if (fromIdx !== null) {
        gl.uniform1f(u.uProgress, progress);
        gl.uniform1f(u.uMode, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texturesRef.current[fromIdx]);
        gl.uniform1i(u.uTexture, 0);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);
      }

      gl.uniform1f(u.uProgress, progress);
      gl.uniform1f(u.uMode, 1);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texturesRef.current[toIdx]);
      gl.uniform1i(u.uTexture, 0);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);
    },
    [parentRef, renderCount]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { alpha: true, antialias: true });
    if (!gl) {
      console.error("WebGL2 not supported");
      return;
    }
    if (!parentRef.current) return;

    let { width: width_, height: height_ } = getComputedStyle(
      parentRef.current
    );
    let width = parseInt(width_),
      height = parseInt(height_);
    canvas.width = width * Math.min(window.devicePixelRatio, 2);
    canvas.height = height * Math.min(window.devicePixelRatio, 2);

    const program = createProgram(gl);
    glRef.current = gl;
    setRefUpdateCountState((prev) => ({
      ...prev,
      glRefUpdateCount: prev.glRefUpdateCount + 1,
    }));
    programRef.current = program;

    // canvas-viewport sync
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    vaoRef.current = buildParticleVAO(gl, width, height);

    [
      "uResolution",
      "uCellSize",
      "uBlockUvSize",
      "uProgress",
      "uMode",
      "uScatterDist",
      "uTexture",
    ].forEach(
      (name) =>
        (uniformLocsRef.current[name] = gl.getUniformLocation(program, name))
    );

    if (canvas.width > 800)
    Promise.all(images.map(({desktop: src}) => loadTexture(gl, src, canvas))).then(
      (textures) => {
        texturesRef.current = textures;
        render(null, activeIndexRef.current, 1);
      }
    );
    else
    Promise.all(images.map(({mobile: src}) => loadTexture(gl, src, canvas))).then(
      (textures) => {
        texturesRef.current = textures;
        render(null, activeIndexRef.current, 1);
      }
    );

    return () => {
      tweenRef.current?.kill();
      texturesRef.current.forEach((t) => gl.deleteTexture(t));
      gl.deleteProgram(program);
      if (vaoRef.current) gl.deleteVertexArray(vaoRef.current.vao);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentRef, renderCount]);

  useEffect(() => {
    if (!glRef.current || texturesRef.current.length === 0) return;
    if (activeIndex === activeIndexRef.current) return;

    const fromIdx = activeIndexRef.current;
    const toIdx = activeIndex;
    activeIndexRef.current = activeIndex;

    tweenRef.current?.kill();
    const state = { progress: 0 };
    tweenRef.current = gsap.to(state, {
      progress: 1,
      duration: 1.1,
      ease: "none",
      onUpdate: () => render(fromIdx, toIdx, state.progress),
    });
  }, [activeIndex, render, parentRef]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-[inherit] size-full max-h-[inherit]"
    />
  );
}
