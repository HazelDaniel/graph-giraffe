/**
 * Embedded GLSL shader sources for @graph-giraffe/core.
 * Extracted from the inline <script type="x-shader/..."> tags
 * so the library can be used without DOM-embedded shaders.
 */

// ─── Node Shaders ─────────────────────────────────────────

export const vertexShader = `#version 300 es

in vec4 a_Position;
in vec2 a_TexCoord;
in float a_Z;
uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjMatrix;
out vec2 v_TexCoord;
void main() {
  vec4 pos = u_ModelMatrix * a_Position;
  pos.z = a_Z;
  gl_Position = u_ProjMatrix * u_ViewMatrix * pos;
  v_TexCoord = a_TexCoord;
}`;

export const fragmentShader = `#version 300 es

precision mediump float;
in vec2 v_TexCoord;
uniform sampler2D u_Sampler;
uniform bool u_UseTexture;
uniform vec4 u_Color;
uniform int u_RenderMode;
uniform vec4 u_BorderColor;
uniform float u_BorderWidth;
uniform float u_Radius;
out vec4 fragColor;

// 9-slice scaling uniforms
uniform bool u_Use9Slice;
uniform vec2 u_Dimensions;
uniform vec2 u_TextureSize;
uniform vec4 u_SliceMargins; // x=left, y=top, z=right, w=bottom

vec2 map9SliceCoord(vec2 uv, vec2 size, vec2 texSize, vec4 margins) {
  vec2 pixelPos = uv * size;
  float x = 0.0;

  if (pixelPos.x < margins.x) {
    x = pixelPos.x;
  } else if (pixelPos.x > size.x - margins.z) {
    x = texSize.x - (size.x - pixelPos.x);
  } else {
    float innerQuadWidth = size.x - margins.x - margins.z;
    float innerTexWidth = texSize.x - margins.x - margins.z;
    float ratio = (pixelPos.x - margins.x) / innerQuadWidth;
    x = margins.x + ratio * innerTexWidth;
  }

  float y = 0.0;
  if (pixelPos.y < margins.y) {
    y = pixelPos.y;
  } else if (pixelPos.y > size.y - margins.w) {
    y = texSize.y - (size.y - pixelPos.y);
  } else {
    float innerQuadHeight = size.y - margins.y - margins.w;
    float innerTexHeight = texSize.y - margins.y - margins.w;
    float ratio = (pixelPos.y - margins.y) / innerQuadHeight;
    y = margins.y + ratio * innerTexHeight;
  }

  return vec2(x / texSize.x, y / texSize.y);
}

float roundedBoxDistance(vec2 p, vec2 halfSize, float radius) {
  vec2 q = abs(p) - halfSize + vec2(radius);
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

// SDF for an equilateral triangle pointing UPWARD, centered at origin.
// Uses padX and padY accounting for corner rounding expansion (r / sin(theta/2))
// so the outer border and rounded corners never get clipped/cropped by the quad bounding box.
float roundedTriangleDistance(vec2 p, vec2 halfSize, float radius, float borderWidth) {
  float padY = radius * 2.2 + borderWidth + 4.0;
  float padX = radius * 1.5 + borderWidth + 4.0;
  vec2 innerHalf = max(halfSize - vec2(padX, padY), vec2(1.0));
  float w = innerHalf.x;
  float h = innerHalf.y;

  vec2 q = vec2(abs(p.x), p.y);
  // Sloped edge from (0, -h) to (w, h)
  // Normal pointing outward (towards positive x, positive y): (2h, -w) / sqrt(4h^2 + w^2)
  float len = length(vec2(2.0 * h, w));
  float edgeDist = (q.x * 2.0 * h - (q.y + h) * w) / len;
  float bottomDist = q.y - h;
  float triDist = max(edgeDist, bottomDist);

  return triDist - radius;
}

void main() {
  if (u_RenderMode == 1) {
    vec2 size = max(u_Dimensions, vec2(1.0));
    vec2 pos = v_TexCoord * size;
    vec2 centered = pos - size * 0.5;
    float radius = min(u_Radius, min(size.x, size.y) * 0.5);
    float dist = roundedBoxDistance(centered, size * 0.5, radius);
    float aa = max(fwidth(dist), 1.0);
    float outerAlpha = 1.0 - smoothstep(0.0, aa, dist);
    if (outerAlpha <= 0.0) discard;

    float borderMix = 1.0 - smoothstep(u_BorderWidth - aa, u_BorderWidth + aa, -dist);
    vec4 color = mix(u_Color, u_BorderColor, borderMix);
    fragColor = vec4(color.rgb, color.a * outerAlpha);
    return;
  }

  if (u_RenderMode == 2) {
    // Rounded triangle (pointing UP)
    vec2 size = max(u_Dimensions, vec2(1.0));
    vec2 pos = v_TexCoord * size;
    vec2 centered = pos - size * 0.5;
    float radius = min(u_Radius, min(size.x, size.y) * 0.25);
    float dist = roundedTriangleDistance(centered, size * 0.5, radius, u_BorderWidth);
    float aa = max(fwidth(dist), 1.0);
    float outerAlpha = 1.0 - smoothstep(0.0, aa, dist);
    if (outerAlpha <= 0.0) discard;

    float borderMix = 1.0 - smoothstep(u_BorderWidth - aa, u_BorderWidth + aa, -dist);
    vec4 color = mix(u_Color, u_BorderColor, borderMix);
    fragColor = vec4(color.rgb, color.a * outerAlpha);
    return;
  }

  if (u_UseTexture) {
    vec2 sampledUV = v_TexCoord;
    if (u_Use9Slice && u_Dimensions.x > 0.0 && u_TextureSize.x > 0.0) {
      sampledUV = map9SliceCoord(v_TexCoord, u_Dimensions, u_TextureSize, u_SliceMargins);
    }
    vec4 texColor = texture(u_Sampler, sampledUV);
    fragColor = texColor * u_Color;
  } else {
    fragColor = u_Color;
  }
}`;

// ─── MSDF Text Shaders ───────────────────────────────────

export const msdfVertexShader = `#version 300 es

in vec4 a_Position;
in vec2 a_TexCoord;
in vec4 a_Color;
in float a_Z;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjMatrix;
out vec2 v_TexCoord;
out vec4 v_Color;

void main() {
  vec4 pos = a_Position;
  pos.z = a_Z;
  gl_Position = u_ProjMatrix * u_ViewMatrix * pos;
  v_TexCoord = a_TexCoord;
  v_Color = a_Color;
}`;

export const msdfFragmentShader = `#version 300 es

precision mediump float;
in vec2 v_TexCoord;
in vec4 v_Color;
uniform sampler2D u_Atlas;
uniform float u_pxRange;
out vec4 fragColor;

float median(float r, float g, float b) {
  return max(min(r, g), min(max(r, g), b));
}

float screenPxRange() {
  vec2 unitRange = vec2(u_pxRange) / vec2(textureSize(u_Atlas, 0));
  vec2 screenTexSize = vec2(1.0) / fwidth(v_TexCoord);
  return max(0.5 * dot(unitRange, screenTexSize), 1.0);
}

void main() {
  vec4 sampleData = texture(u_Atlas, v_TexCoord);
  float sigDist = median(sampleData.r, sampleData.g, sampleData.b) - 0.5;
  float pxDistance = sigDist * screenPxRange();
  float opacity = clamp(pxDistance + 0.5, 0.0, 1.0);
  fragColor = vec4(v_Color.rgb, v_Color.a * opacity);
}`;

// ─── Icon Background Shaders ─────────────────────────────

export const iconBGVertexShader = `#version 300 es

in vec2 a_Position;
in vec4 a_Color;
in float a_Shape;
in vec2 a_BBoxMin;
in vec2 a_BBoxMax;
in float a_Z;

uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjMatrix;

out vec4 v_Color;
out float v_Shape;
out vec2 v_BBoxMin;
out vec2 v_BBoxMax;
out vec2 v_Pos;

void main() {
  v_Color = a_Color;
  v_Shape = a_Shape;
  v_BBoxMin = a_BBoxMin;
  v_BBoxMax = a_BBoxMax;
  v_Pos = a_Position;
  gl_Position = u_ProjMatrix * u_ViewMatrix * vec4(a_Position, a_Z, 1.0);
}`;

export const iconBGFragmentShader = `#version 300 es

precision mediump float;
in vec4 v_Color;
in float v_Shape;
in vec2 v_BBoxMin;
in vec2 v_BBoxMax;
in vec2 v_Pos;
out vec4 fragColor;

void main() {
  vec4 resColor = v_Color;
  if (v_Shape > 0.5) {
    vec2 bboxSize = v_BBoxMax - v_BBoxMin;
    vec2 normalized = (v_Pos - v_BBoxMin) / (bboxSize + 0.001);

    if (v_Shape < 1.5) {
      // Circle: discard if distance from center > 0.5
      float dist = distance(normalized, vec2(0.5));
      if (dist > 0.5) discard;
    } else {
      // Rounded-square: discard corners outside rounded rect
      float r = 0.25;
      vec2 p = abs(normalized - 0.5) * 2.0;
      vec2 d = p - (1.0 - r);
      if (length(max(d, 0.0)) > r) discard;
    }
  }

  fragColor = resColor;
}`;

// ─── Background Grid Shaders ─────────────────────────────

export const bgVertexShader = `#version 300 es

in vec4 a_Position;
void main() {
  gl_Position = a_Position;
  gl_PointSize = 4.0;
}`;

export const bgFragmentShader = `#version 300 es

precision mediump float;
uniform vec4 u_Color;
uniform bool u_UsePointMask;
out vec4 fragColor;

void main() {
  if (u_UsePointMask) {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) {
      discard;
    } else {
      fragColor = u_Color;
    }
  } else {
    fragColor = u_Color;
  }
}`;
