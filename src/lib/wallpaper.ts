// Caps stored wallpaper size — localStorage has a hard quota (~5-10MB per
// origin) shared with the rest of the persisted store, so an uncompressed
// photo upload could blow the budget and break persistence for everything
// else in the same store. Downscaling + re-encoding as JPEG keeps a typical
// phone photo well under 1MB.
const MAX_WALLPAPER_DIM = 1920;
const WALLPAPER_JPEG_QUALITY = 0.82;

export function computeScaledDimensions(
  width: number,
  height: number,
  maxDim: number
): { width: number; height: number } {
  const scale = Math.min(1, maxDim / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export async function fileToWallpaperDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = computeScaledDimensions(bitmap.width, bitmap.height, MAX_WALLPAPER_DIM);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(bitmap, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", WALLPAPER_JPEG_QUALITY);
}
