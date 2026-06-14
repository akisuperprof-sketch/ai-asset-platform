import { Metadata } from "next";
import AdHealthClient from "./AdHealthClient";

export const metadata: Metadata = {
  title: "広告ヘルスチェック | AssetNinja Admin",
};

export default function AdHealthPage() {
  return (
    <div className="min-h-screen p-8 text-white">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-black tracking-wider uppercase flex items-center gap-3">
            広告ヘルスチェック
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30">
              SYSTEM MONITOR
            </span>
          </h1>
          <p className="text-sm text-secondary mt-2">
            AdMaxおよびPopAdsの生存監視と稼働テストを行います。
          </p>
        </header>

        <AdHealthClient />
      </div>
    </div>
  );
}
