import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { extractBodyData } from "@/lib/ocr";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "画像ファイルが必要です" }, { status: 400 });
    }

    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "対応していないファイル形式です（JPEG・PNG・WebP・HEICのみ）" }, { status: 400 });
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "アップロードできる画像サイズは圧縮後10MBまでです" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type || "image/jpeg";

    const result = await extractBodyData(base64, mimeType);

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "OCR処理中にエラーが発生しました";
    console.error("[OCR Error]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
