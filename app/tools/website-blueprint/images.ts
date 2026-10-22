// Image checks and in-browser compression. Photos never leave the visitor's device.
export const MAX_FILE_MB = 10;
export const MAX_IMAGES = 30;
export const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export function checkFile(f: File): string | null {
  if (!ACCEPTED.includes(f.type)) return `${f.name} isn't a JPG, PNG or WebP image.`;
  if (f.size > MAX_FILE_MB * 1024 * 1024) return `${f.name} is larger than ${MAX_FILE_MB} MB. Please choose a smaller file.`;
  return null;
}

export type PdfImage = { data: string; w: number; h: number };

// Shrinks a photo for the PDF (keeps it sharp but stops the PDF getting huge).
export async function toPdfImage(file: File, maxSide = 1400): Promise<PdfImage> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error(`Couldn't read ${file.name}`));
      i.src = url;
    });
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Image processing isn't available in this browser.");
    ctx.fillStyle = "#FFFFFF"; // transparent logos sit on white in the PDF
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return { data: canvas.toDataURL("image/jpeg", 0.82), w, h };
  } finally {
    URL.revokeObjectURL(url);
  }
}
