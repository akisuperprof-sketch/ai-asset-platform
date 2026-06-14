import { Metadata } from 'next';
import { LegalNav } from '@/components/legal/LegalNav';

export const metadata: Metadata = {
  title: 'AssetNinja Privacy Policy',
  description: 'Privacy policy for AssetNinja free PNG assets.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-ninja-black pt-32 pb-24 px-6 relative z-10">
      <div className="max-w-[900px] mx-auto bg-zinc-900/40 border border-white/10 rounded-3xl p-8 md:p-12 lg:p-16 backdrop-blur-xl">
        
        <LegalNav />
        
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">
          Privacy Policy
        </h1>
        <p className="text-zinc-400 mb-12">Last Updated: June 2026</p>

        <div className="space-y-6 text-zinc-300 leading-relaxed">
          
          <h2 className="text-2xl font-bold text-white mt-12 mb-4">1. Information We Collect</h2>
          <p>We do not collect personally identifiable information unless you explicitly provide it to us via contact forms. We collect anonymous analytics data regarding website usage and download events to improve our platform.</p>

          <hr className="border-white/10 my-12" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">2. Analytics Data</h2>
          <p>We use analytics services to track page views, clicks, and download counts. This data is aggregated and does not identify individual users.</p>

          <hr className="border-white/10 my-12" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">3. Cookies</h2>
          <p>Our website uses cookies and similar local storage technologies (like `localStorage`) to remember your preferences, track download counts for rate-limiting, and serve personalized advertising.</p>

          <hr className="border-white/10 my-12" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">4. Advertising Partners</h2>
          <p>We rely on advertising revenue to keep our PNG assets free. We use third-party advertising networks that may use cookies or tracking pixels to serve relevant ads based on your browsing history.</p>

          <hr className="border-white/10 my-12" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">5. AdMax</h2>
          <p>We use Ninja AdMax to display banner advertisements. AdMax may collect anonymized traffic data to provide these advertisements.</p>

          <hr className="border-white/10 my-12" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">6. PopAds</h2>
          <p>We use PopAds to display pop-under advertisements. PopAds employs cookie-based frequency capping to limit how often you see their ads.</p>

          <hr className="border-white/10 my-12" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">7. Third Party Services</h2>
          <p>Our website may contain links to external sites or integrate third-party services. We are not responsible for the privacy practices of these external platforms.</p>

          <hr className="border-white/10 my-12" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">8. Security</h2>
          <p>We take reasonable measures to protect our website and data. However, no internet transmission is entirely secure, and we cannot guarantee the absolute security of your information.</p>

          <hr className="border-white/10 my-12" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">9. User Rights</h2>
          <p>If you wish to clear your local ad preferences or download counters, you can clear your browser&apos;s cookies and local storage data at any time.</p>

          <hr className="border-white/10 my-12" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">10. Changes to Policy</h2>
          <p>We reserve the right to modify this Privacy Policy at any time. Any changes will be posted on this page.</p>

          <hr className="border-white/10 my-12" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">11. Contact</h2>
          <p>If you have any questions regarding this Privacy Policy, please reach out to us via our Contact page.</p>

        </div>
      </div>
    </div>
  );
}
