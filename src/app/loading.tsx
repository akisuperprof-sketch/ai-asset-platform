import { NinjaMiniLoader } from "@/components/brand/NinjaMiniLoader";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#020407] overflow-hidden select-none">
      <NinjaMiniLoader size="md" />
      <div className="text-[8px] font-black text-white/35 tracking-[0.25em] uppercase mt-4 animate-pulse">
        CONNECTING NEURAL DATASPACES...
      </div>
    </div>
  );
}

