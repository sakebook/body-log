export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "image/jpeg" | "image/webp";
}

/**
 * クライアント側（ブラウザ）で画像を Canvas API を使用してリサイズ＆圧縮する
 */
export function compressImage(file: File, options: CompressOptions = {}): Promise<File> {
  const { maxWidth, maxHeight, quality = 0.8, format = "image/jpeg" } = options;

  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    // メモリ節約: FileReader (Base64) を使わず Object URL を使用
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    // 防御的コーディング: ハンドラを先に設定
    img.onload = () => {
      // 読み込み完了後、速やかに元画像の Object URL を解放してメモリを節約
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (maxWidth || maxHeight) {
        const maxW = maxWidth ?? width;
        const maxH = maxHeight ?? height;

        const scale = Math.min(maxW / width, maxH / height, 1);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context could not be created"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // 指定のフォーマットと画質で出力
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Image compression failed"));
            return;
          }

          const actualFormat = blob.type;

          // WebP非対応ブラウザで PNG(可逆) にフォールバックされサイズ肥大化の可能性がある場合、JPEG(非可逆)で再エンコード
          if (format === "image/webp" && actualFormat === "image/png") {
            canvas.toBlob(
              (jpegBlob) => {
                if (!jpegBlob) {
                  reject(new Error("JPEG fallback compression failed"));
                  return;
                }
                const dotIdx = file.name.lastIndexOf(".");
                const baseName = dotIdx === -1 ? file.name : file.name.substring(0, dotIdx);
                const newName = `${baseName}.jpg`;

                const compressedFile = new File([jpegBlob], newName, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              },
              "image/jpeg",
              quality
            );
            return;
          }

          const ext = actualFormat === "image/webp" ? "webp" : actualFormat === "image/png" ? "png" : "jpg";
          const dotIdx = file.name.lastIndexOf(".");
          const baseName = dotIdx === -1 ? file.name : file.name.substring(0, dotIdx);
          const newName = `${baseName}.${ext}`;

          const compressedFile = new File([blob], newName, {
            type: actualFormat,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        format,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image element"));
    };

    img.src = objectUrl;
  });
}
