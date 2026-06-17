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
    // 防御的コーディング: ハンドラを先に設定
    reader.onload = (event) => {
      const img = new Image();
      // 防御的コーディング: ハンドラを先に設定
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // リサイズ指示がある場合のみアスペクト比を維持してリサイズ
        if (maxWidth || maxHeight) {
          const maxW = maxWidth ?? width;
          const maxH = maxHeight ?? height;

          // 縦横両方の縮小率のうち、より厳しい（小さい）方を採用
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
            // 実際の blob.type を基に拡張子と MIME タイプを確定（WebP 非対応ブラウザでの不整合回避）
            const actualFormat = blob.type;
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

      img.onerror = () => reject(new Error("Failed to load image element"));
      img.src = event.target?.result as string; // 読み込み開始
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file); // 読み込み開始
  });
}
