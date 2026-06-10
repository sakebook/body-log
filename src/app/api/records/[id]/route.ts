import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStorage } from "@/lib/storage";

// DELETE /api/records/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const storage = getStorage();
    await storage.deleteRecord(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/records/[id]]", err);
    return NextResponse.json({ error: "レコードの削除に失敗しました" }, { status: 500 });
  }
}

// GET /api/records/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const storage = getStorage();
    const record = await storage.getRecord(id);

    if (!record) {
      return NextResponse.json({ error: "レコードが見つかりません" }, { status: 404 });
    }

    return NextResponse.json({ record });
  } catch (err) {
    console.error("[GET /api/records/[id]]", err);
    return NextResponse.json({ error: "レコードの取得に失敗しました" }, { status: 500 });
  }
}
