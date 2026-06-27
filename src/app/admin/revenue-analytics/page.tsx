import { Metadata } from "next";
import { RevenueDashboardClient } from "./RevenueDashboardClient";
import { MonetizationLinks } from "@/components/admin/MonetizationLinks";

export const metadata: Metadata = {
  title: "Revenue Dashboard | AssetNinja Admin",
};

export default function RevenueDashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <MonetizationLinks />
      <RevenueDashboardClient />
    </div>
  );
}
