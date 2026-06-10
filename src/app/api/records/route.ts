import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStorage } from "@/lib/storage";
import type { NewBodyRecord } from "@/lib/storage";

// GET /api/records - レコード一覧取得
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "365", 10), 365);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const storage = getStorage();
    const records = await storage.getRecords({ limit, offset });

    return NextResponse.json({ records });
  } catch (err) {
    console.error("[GET /api/records]", err);
    return NextResponse.json({ error: "データの取得に失敗しました" }, { status: 500 });
  }
}

// POST /api/records - レコード作成（画像アップロード含む）
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    const dataStr = formData.get("data") as string | null;

    if (!dataStr) {
      return NextResponse.json({ error: "レコードデータが必要です" }, { status: 400 });
    }

    const data = JSON.parse(dataStr) as Partial<NewBodyRecord>;

    const storage = getStorage();
    let imageUrl: string | null = null;

    // 画像がある場合はアップロード
    if (imageFile && imageFile.size > 0) {
      imageUrl = await storage.saveImage(imageFile, imageFile.name || "image.jpg");
    }

    const newRecord: NewBodyRecord = {
      measured_at: data.measured_at ?? new Date().toISOString(),
      brand: data.brand ?? "unknown",
      model: data.model ?? null,
      weight_kg: data.weight_kg ?? null,
      body_fat_pct: data.body_fat_pct ?? null,
      muscle_mass_kg: data.muscle_mass_kg ?? null,
      bmi: data.bmi ?? null,
      basal_metabolic_rate_kcal: data.basal_metabolic_rate_kcal ?? null,
      body_water_pct: data.body_water_pct ?? null,
      brand_data: data.brand_data ?? {},
      image_url: imageUrl,
      raw_ocr_text: data.raw_ocr_text ?? null,
    };

    const saved = await storage.saveRecord(newRecord);

    return NextResponse.json({ record: saved }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/records]", err);
    return NextResponse.json({ error: "レコードの保存に失敗しました" }, { status: 500 });
  }
}
