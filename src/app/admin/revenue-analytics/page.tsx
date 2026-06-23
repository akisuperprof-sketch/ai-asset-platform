import { Metadata } from "next";
import { RevenueDashboardClient } from "./RevenueDashboardClient";

export const metadata: Metadata = {
  title: "Revenue Dashboard | AssetNinja Admin",
};

export default function RevenueDashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <RevenueDashboardClient />
    </div>
  );
}
