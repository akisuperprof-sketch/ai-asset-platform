import { NextResponse } from "next/server";
import { getAssets, searchAssets } from "@/lib/assets";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "24", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const query = searchParams.get("query") || "";
    const category = searchParams.get("category") || "すべて";

    let assets = [];
    if (query || category !== "すべて") {
      assets = await searchAssets(query, category, limit, offset);
    } else {
      assets = await getAssets(limit, offset);
    }

    return NextResponse.json({ success: true, assets });
  } catch (error: any) {
    console.error("❌ Assets API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
