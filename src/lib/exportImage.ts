import { toBlob, toPng } from "html-to-image";

const EXPORT_OPTIONS = { pixelRatio: 2, cacheBust: true, quality: 0.98 };

async function waitForAssets(node: HTMLElement): Promise<void> {
  const imgs = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          })
    )
  );
  if (document.fonts?.ready) await document.fonts.ready;
}

export async function copyElementToClipboard(node: HTMLElement): Promise<void> {
  await waitForAssets(node);
  const blob = await toBlob(node, EXPORT_OPTIONS);
  if (!blob) throw new Error("Could not render image");
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}

export async function downloadElementAsPng(node: HTMLElement, filename: string): Promise<void> {
  await waitForAssets(node);
  const dataUrl = await toPng(node, EXPORT_OPTIONS);
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename.endsWith(".png") ? filename : `${filename}.png`;
  link.click();
}
