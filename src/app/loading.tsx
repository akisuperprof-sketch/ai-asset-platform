import { NinjaLoading } from "@/components/brand/NinjaLoading";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden">
      <NinjaLoading />
    </div>
  );
}
