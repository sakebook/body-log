import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getStorage } from "@/lib/storage";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = {
  title: "ダッシュボード",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const storage = getStorage();
  const records = await storage.getRecords({ limit: 90 });

  return <DashboardClient records={records} />;
}
