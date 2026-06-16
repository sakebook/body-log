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
    // 画像ファイル以外は処理せずそのまま返す
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // リサイズ指示がある場合のみアスペクト比を維持してリサイズ
        if (maxWidth || maxHeight) {
          const maxW = maxWidth ?? width;
          const maxH = maxHeight ?? height;

          if (width > height) {
            if (width > maxW) {
              height = Math.round((height * maxW) / width);
              width = maxW;
            }
          } else {
            if (height > maxH) {
              width = Math.round((width * maxH) / height);
              height = maxH;
            }
          }
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
            const ext = format === "image/webp" ? "webp" : "jpg";
            const newName = file.name.substring(0, file.name.lastIndexOf(".")) + "." + ext;

            const compressedFile = new File([blob], newName, {
              type: format,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          format,
          quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image element"));
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
  });
}
