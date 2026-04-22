/**
 * Client-side redaction helpers.
 *
 * The original (raw) contract image is held in the browser only.
 * We draw blurred rectangles over sensitive regions on a <canvas>
 * and upload the canvas-rendered (redacted) blob to storage.
 *
 * The original image bytes never touch the server.
 */

export type RedactionField =
  | "name"
  | "national_id"
  | "phone"
  | "address"
  | "contract_value"
  | "signature"
  | "account_number"
  | "email";

export interface NormalizedBox {
  /** 0..1 relative to image width */
  x: number;
  /** 0..1 relative to image height */
  y: number;
  /** 0..1 relative to image width */
  w: number;
  /** 0..1 relative to image height */
  h: number;
  field: RedactionField;
}

/** Load an image from a File or Blob and return an HTMLImageElement. */
export function loadImageFromFile(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

/** Convert a File/Blob to a base64 data URL (no prefix stripping). */
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Render the original image to a canvas with blurred rectangles drawn over
 * each provided bounding box. Returns the redacted result as a JPEG Blob.
 *
 * Boxes are normalized (0..1) coordinates relative to the image dimensions.
 */
export async function renderRedactedBlob(
  img: HTMLImageElement,
  boxes: NormalizedBox[],
  options?: { maxWidth?: number; quality?: number },
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  const maxWidth = options?.maxWidth ?? 1600;
  const quality = options?.quality ?? 0.85;

  const scale = img.naturalWidth > maxWidth ? maxWidth / img.naturalWidth : 1;
  const width = Math.round(img.naturalWidth * scale);
  const height = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  // Draw original
  ctx.drawImage(img, 0, 0, width, height);

  // Draw redaction overlays.
  // Two-pass: 1) heavy-blur copy clipped to box; 2) frosted overlay + label.
  for (const b of boxes) {
    const bx = Math.max(0, Math.round(b.x * width));
    const by = Math.max(0, Math.round(b.y * height));
    const bw = Math.max(8, Math.round(b.w * width));
    const bh = Math.max(8, Math.round(b.h * height));

    // Heavy blur fill — using filter on a temp canvas to keep the original sharp elsewhere.
    const off = document.createElement("canvas");
    off.width = bw;
    off.height = bh;
    const offCtx = off.getContext("2d");
    if (offCtx) {
      offCtx.filter = "blur(14px)";
      offCtx.drawImage(canvas, bx, by, bw, bh, 0, 0, bw, bh);
      ctx.drawImage(off, bx, by);
    }

    // Frosted overlay
    ctx.fillStyle = "rgba(10, 61, 98, 0.55)"; // navy with translucency
    ctx.fillRect(bx, by, bw, bh);

    // Gold border
    ctx.strokeStyle = "rgba(250, 204, 21, 0.95)";
    ctx.lineWidth = Math.max(1, Math.round(Math.min(width, height) / 600));
    ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);

    // Label
    const label = "PROTECTED";
    const fontSize = Math.max(10, Math.round(bh * 0.35));
    ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, bx + bw / 2, by + bh / 2);
  }

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas toBlob returned null"))),
      "image/jpeg",
      quality,
    );
  });

  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  return { blob, dataUrl, width, height };
}
