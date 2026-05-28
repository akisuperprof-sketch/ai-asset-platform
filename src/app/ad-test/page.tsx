import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ad Verification | AssetNinja',
  robots: {
    index: false,
    follow: true,
  },
};

export default function AdTestPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-12">
        
        <div>
          <h1 className="text-2xl font-black mb-2">AssetNinja Ad Verification Page</h1>
          <p className="text-zinc-400">This page is used for advertising tag verification.</p>
        </div>

        <div className="space-y-8">
          {/* PC Ad */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">PC (300×250)</h2>
            <div className="border border-white/10 bg-white/5 p-4 rounded-xl flex items-center justify-center min-w-[300px] min-h-[250px]">
               <div dangerouslySetInnerHTML={{ __html: `
<div class="admax-ads" data-admax-id="40d12e183086a55c7451794352a281c2" style="display:inline-block;width:300px;height:250px;"></div>
<script type="text/javascript">(admaxads = window.admaxads || []).push({admax_id: "40d12e183086a55c7451794352a281c2",type: "banner"});</script>
<script type="text/javascript" charset="utf-8" src="https://adm.shinobi.jp/st/t.js" async></script>
               ` }} />
            </div>
          </div>

          {/* SP Ad */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">SP (Overlay)</h2>
            <div className="border border-white/10 bg-white/5 p-4 rounded-xl flex items-center justify-center w-full min-h-[50px]">
               <div dangerouslySetInnerHTML={{ __html: `
<script type="text/javascript">(admaxads = window.admaxads || []).push({admax_id: "35317cead3271f0eeda52a630e9f6aa6",type: "overlay"});</script>
<script type="text/javascript" charset="utf-8" src="https://adm.shinobi.jp/st/t.js" async></script>
               ` }} />
               <span className="text-zinc-500 text-sm">SP Overlay (Checks Network loading, visual element overlays the screen)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
