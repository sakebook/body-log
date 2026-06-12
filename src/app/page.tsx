import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getStorage } from "@/lib/storage";
import { DashboardClient } from "./DashboardClient";
import { SetupGuide } from "@/components/SetupGuide";

export const metadata: Metadata = {
  title: "ダッシュボード",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Supabase 未設定チェック
  const supabaseUrl = process.env.SUPABASE_URL ?? "";
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? "";

  const isSupabaseConfigured =
    supabaseUrl.startsWith("https://") &&
    !supabaseUrl.includes("your-project") &&
    supabaseKey.length > 20;

  if (!isSupabaseConfigured) {
    return (
      <div className="container" style={{ paddingBlock: "2rem" }}>
        <SetupGuide />
      </div>
    );
  }

  let records;
  try {
    const storage = getStorage();
    records = await storage.getRecords({ limit: 90 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return (
      <div className="container" style={{ paddingBlock: "2rem" }}>
        <SetupGuide errorDetail={message} />
      </div>
    );
  }

  return <DashboardClient records={records} />;
}
