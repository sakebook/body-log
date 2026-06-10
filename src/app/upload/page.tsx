import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { UploadClient } from "./UploadClient";

export const metadata: Metadata = {
  title: "記録する",
};

export default async function UploadPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="container" style={{ paddingBlock: "2rem" }}>
      <header className="page-header">
        <h1 className="page-title">体組成を記録する</h1>
      </header>
      <UploadClient />
    </div>
  );
}
