import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getStorage } from "@/lib/storage";
import { HistoryClient } from "./HistoryClient";

export const metadata: Metadata = {
  title: "履歴",
};

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const storage = getStorage();
  const records = await storage.getRecords({ limit: 365 });

  return (
    <div className="container" style={{ paddingBlock: "2rem" }}>
      <header className="page-header">
        <h1 className="page-title">記録履歴</h1>
      </header>
      <HistoryClient records={records} />
    </div>
  );
}
