import { PI } from "./globals.js";
import {
  NODE_LAYOUT,
  NodeHandleData,
  NodeType,
  ThemeName,
  ThemeStyle,
  isContainerNodeType,
} from "./types.js";

export interface CompositionReferencePreviewChild {
  text: string;
  width: number;
  height: number;
}

export function drawHandle(
  ctx: CanvasRenderingContext2D,
  handle: NodeHandleData,
  x: number,
  y: number
): void {
  const { style, isConnected } = handle;
  const radius = style.size / 2;
  const borderColor = isConnected
    ? style.connectedBorderColor
    : style.disconnectedBorderColor;

  ctx.save();
  ctx.fillStyle = style.backgroundColor;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = style.borderWidth;

  if (style.shape === "circle") {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * PI);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.rect(x - radius, y - radius, style.size, style.size);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

export const NODE_THEMES: Record<ThemeName, ThemeStyle> = {
  dark: {
    bgFill: "rgba(30, 41, 59, 0.8)",
    borderStroke: "rgba(255, 255, 255, 0.1)",
    headerFill: "rgba(14, 13, 13, 0.9)",
    titleFill: "#f8fafc",
    bodyFill: "rgba(19, 18, 18, 0.8)",
    borderWidth: 1,
  },
  light: {
    bgFill: "rgba(248, 250, 252, 0.9)",
    borderStroke: "rgba(0, 0, 0, 0.1)",
    headerFill: "rgba(226, 232, 240, 1)",
    titleFill: "#0f172a",
    bodyFill: "rgba(205, 205, 205, 0.9)",
    borderWidth: 1,
  },
  neon: {
    bgFill: "rgba(10, 10, 20, 0.9)",
    borderStroke: "rgb(10, 35, 39)",
    headerFill: "rgba(10, 35, 39, 0.76)",
    titleFill: "#cffafe",
    bodyFill: "rgb(16, 96, 128)",
    borderWidth: 2,
  },
};

export const G_NODE_THEMES: Record<ThemeName, ThemeStyle> = {
  dark: {
    bgFill: "rgb(9, 9, 10)",
    borderStroke: "rgba(255, 255, 255, 0.14)",
    headerFill: "rgba(22, 20, 20, 0.79)",
    titleFill: "#f8fafc",
    bodyFill: "rgb(27, 27, 27)",
    borderWidth: 1,
  },
  light: {
    bgFill: "rgba(248, 250, 252, 0.9)",
    borderStroke: "rgba(0, 0, 0, 0.4)",
    headerFill: "rgba(226, 232, 240, 1)",
    titleFill: "#0f172a",
    bodyFill: "#475569",
    borderWidth: 1,
  },
  neon: {
    bgFill: "rgba(10, 10, 20, 0.9)",
    borderStroke: "#06b6d4",
    headerFill: "rgba(6, 182, 212, 0.2)",
    titleFill: "#cffafe",
    bodyFill: "rgb(16, 96, 128)",
    borderWidth: 2,
  },
};

export const C_NODE_THEMES: Record<ThemeName, ThemeStyle> = {
  dark: {
    bgFill: "rgb(9, 9, 10)",
    borderStroke: "rgba(44, 159, 146, 0.9)",
    headerFill: "none",
    titleFill: "#f8fafc",
    bodyFill: "rgba(3, 3, 3)",
    borderWidth: 1,
  },
  light: {
    bgFill: "rgba(248, 250, 252, 0.9)",
    borderStroke: "rgba(0, 0, 0, 0.4)",
    headerFill: "rgba(226, 232, 240, 1)",
    titleFill: "#0f172a",
    bodyFill: "rgba(44, 159, 146, 0.3)",
    borderWidth: 1,
  },
  neon: {
    bgFill: "rgba(10, 10, 20, 0.9)",
    borderStroke: "#06b6d4",
    headerFill: "rgba(6, 182, 212, 0.2)",
    titleFill: "#cffafe",
    bodyFill: "rgba(44, 159, 146, 0.3)",
    borderWidth: 2,
  },
};

export const CR_NODE_THEMES: Record<ThemeName, ThemeStyle> = {
  dark: {
    bgFill: "rgb(9, 9, 10)",
    borderStroke: "rgba(255, 255, 255, 0.95)",
    headerFill: "rgba(22, 20, 20, 0.79)",
    titleFill: "#f8fafc",
    bodyFill: "rgba(44, 159, 146, 0.3)",
    borderWidth: 1,
  },
  light: {
    bgFill: "rgba(248, 250, 252, 0.9)",
    borderStroke: "rgba(0, 0, 0, 0.4)",
    headerFill: "rgba(226, 232, 240, 1)",
    titleFill: "#0f172a",
    bodyFill: "rgba(44, 159, 146, 0.3)",
    borderWidth: 1,
  },
  neon: {
    bgFill: "rgba(10, 10, 20, 0.9)",
    borderStroke: "#06b6d4",
    headerFill: "rgba(6, 182, 212, 0.2)",
    titleFill: "#cffafe",
    bodyFill: "rgba(44, 159, 146, 0.3)",
    borderWidth: 2,
  },
};

/**
 * Renders node UI into an off-screen 2D canvas, then uploads it as a WebGL texture.
 * The caller is responsible for deleting the returned texture when the node is destroyed.
 */
export function createOverlayTexture(
  gl: WebGL2RenderingContext,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  text: string,
  width: number,
  height: number,
  theme: ThemeName = "dark",
  nodeType: NodeType = "node",
  isCollapsed: boolean = false,
  compositionReferenceChildren: CompositionReferencePreviewChild[] | null = null
): WebGLTexture {
  canvas.width = width;
  canvas.height = height;

  const s = isContainerNodeType(nodeType)
    ? G_NODE_THEMES[theme]
    : NODE_THEMES[theme];
  const isCompositionReference =
    nodeType === "node" && compositionReferenceChildren !== null;
  const headOnly = nodeType === "composition-child" || isCollapsed;

  // Clear canvas completely to make it transparent
  ctx.clearRect(0, 0, width, height);

  // Title (only for leaf nodes, group/composition labels are handled elsewhere)
  const titleY = isContainerNodeType(nodeType)
    ? 20
    : headOnly
    ? height / 2
    : NODE_LAYOUT.headerHeight / 2;
  if (nodeType === "node" || nodeType === "composition-child" || isCollapsed) {
    ctx.fillStyle = s.titleFill;
    ctx.font = "600 14px Geist, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 15, titleY);
  }

  if (nodeType === "group") {
    // Draw "+" plus button at the bottom center
    const btnX = width / 2;
    const btnY = height - NODE_LAYOUT.plusBtnPaddingBottom;
    const btnRadius = NODE_LAYOUT.plusBtnClickRadius;

    // Background circle
    ctx.fillStyle =
      theme === "light" ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.15)";
    ctx.beginPath();
    ctx.arc(btnX, btnY, btnRadius, 0, 2 * PI);
    ctx.fill();

    // Border
    ctx.strokeStyle = s.borderStroke;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(btnX, btnY, btnRadius, 0, 2 * PI);
    ctx.stroke();

    // Plus text
    ctx.fillStyle = s.titleFill;
    ctx.font = "bold 16px Geist, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("+", btnX, btnY);
    ctx.textAlign = "left"; // restore
  }

  // Body hint
  if (isCompositionReference) {
    drawCompositionReferenceChildren(
      ctx,
      compositionReferenceChildren ?? [],
      theme,
      width
    );
  } else {
    ctx.fillStyle = s.bodyFill;
    ctx.font = "12px Geist, sans-serif";
    if (nodeType === "node" && !isCollapsed)
      ctx.fillText("Drag to move", 10, 50);
  }

  // Upload to WebGL
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE); // disable sRGB conversion to preserve original colors
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  return tex;
}

function drawCompositionReferenceChildren(
  ctx: CanvasRenderingContext2D,
  children: CompositionReferencePreviewChild[],
  theme: ThemeName,
  width: number
): void {
  const childHeaderFill =
    theme === "light" ? "rgba(20, 184, 166, 0.28)" : "rgba(20, 184, 166, 0.5)";
  const childFill =
    theme === "light"
      ? "rgba(240, 253, 250, 0.78)"
      : "rgba(15, 118, 110, 0.34)";
  const childStroke =
    theme === "light" ? "rgba(13, 148, 136, 0.8)" : "rgba(94, 234, 212, 0.72)";
  const titleFill = theme === "light" ? "#0f172a" : "#ecfeff";

  let y = 50;
  for (const child of children) {
    const childWidth = Math.min(child.width, width - 40);
    const childHeight = Math.max(NODE_LAYOUT.headerHeight, child.height);
    const x = (width - childWidth) / 2;

    ctx.fillStyle = childFill;
    ctx.beginPath();
    ctx.roundRect(x, y, childWidth, childHeight, 8);
    ctx.fill();

    ctx.strokeStyle = childStroke;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = childHeaderFill;
    ctx.beginPath();
    ctx.roundRect(x, y, childWidth, NODE_LAYOUT.headerHeight, 8);
    ctx.fill();

    ctx.fillStyle = titleFill;
    ctx.font = "600 13px Geist, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText(child.text, x + 12, y + NODE_LAYOUT.headerHeight / 2);

    y += childHeight + 10;
  }
}
