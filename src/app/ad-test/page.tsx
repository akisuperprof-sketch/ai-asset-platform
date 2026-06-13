import { Metadata } from 'next';
import { AdTestClient } from './AdTestClient';

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
      <div className="max-w-2xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-2xl font-black mb-2">AssetNinja Ad Verification</h1>
          <p className="text-zinc-400">This page is used for testing AdMax and PopAds integration.</p>
        </div>

        <AdTestClient />

      </div>
    </div>
  );
}
